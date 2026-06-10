import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactInfo, MenuItem, MenuSection } from '../../data/kitsune-data';
import { AdminAuthService } from '../../services/admin-auth/admin-auth';
import { AdminContentService } from '../../services/admin-content/admin-content';
import { SupabaseService } from '../../services/supabase/supabaseService';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  readonly minCarouselImages = 5;

  carouselImages: string[] = [];
  newCarouselImage = '';
  menu: MenuSection[] = [];
  contact!: ContactInfo;
  orderPhone = '';
  activeCategory = '';
  notice = '';
  uploadingCarousel = false;
  uploadingProductId: number | null = null;

  constructor(
    private adminAuth: AdminAuthService,
    private adminContent: AdminContentService,
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.loadEditableData();
  }

  async addCarouselImage() {
    const image = this.newCarouselImage.trim();

    if (!image) {
      this.showNotice('Agrega una URL o ruta de imagen.');
      return;
    }

    this.carouselImages = [...this.carouselImages, image];
    this.newCarouselImage = '';
    await this.saveCarousel();
  }

  async uploadCarouselImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.uploadingCarousel = true;

    try {
      const { publicUrl, error } = await this.withUploadTimeout(
        this.tryUploadImage(file, 'carousel')
      );

      if (error) {
        this.showNotice(error, 7000);
        return;
      }

      this.carouselImages = [...this.carouselImages, publicUrl];
      await this.saveCarousel();
      this.showNotice('Imagen subida y agregada al carrusel.');
    } finally {
      this.uploadingCarousel = false;
      input.value = '';
    }
  }

  async removeCarouselImage(index: number) {
    if (this.carouselImages.length <= this.minCarouselImages) {
      this.showNotice('El carrusel debe conservar al menos 5 imagenes.');
      return;
    }

    this.carouselImages = this.carouselImages.filter((_, imageIndex) => imageIndex !== index);
    await this.saveCarousel();
  }

  // EL REEMPLAZO QUE DEBES PONER:
async addProduct(section: MenuSection) {
  try {
    // 1. Creamos el cascarón del producto en memoria
    const nuevoItem = this.adminContent.createEmptyProduct(); 
    this.showNotice('Creando nuevo producto en la base de datos...');

    // 2. Insertamos en Supabase (la BD creará un ID único sin duplicados)
    const resultado = await this.supabaseService.crearProducto(nuevoItem, section.categoria);

    if (resultado.success && resultado.data) {
      this.showNotice(`¡"${nuevoItem.nombre}" creado con éxito en Supabase!`, 3500);
      
      // 3. 🔥 ¡PUNTO CRÍTICO! Asignamos al platillo el ID REAL que generó Supabase
      nuevoItem.id = resultado.data.id;

      // 4. Lo metemos visualmente a la sección correspondiente de tu pantalla
      section.platillos = [...section.platillos, nuevoItem];
      
      // 5. Sincronizamos la memoria de Angular de forma limpia
      await this.adminContent.updateMenu(this.menu); 
    } else {
      alert('Supabase rechazó la creación: ' + resultado.error?.message);
    }
  } catch (error: any) {
    alert('Error crítico al añadir producto: ' + error.message);
  }
}

 // EL REEMPLAZO QUE DEBES PONER:
async removeProduct(section: MenuSection, product: MenuItem) {
  // Pedimos confirmación al usuario
  const confirmar = confirm(`¿Estás seguro de eliminar permanentemente "${product.nombre}" de la base de datos?`);
  if (!confirmar) return;

  try {
    this.showNotice(`Eliminando "${product.nombre}" de la base de datos...`);

    // 1. Mandamos la orden de eliminación DELETE a Supabase usando el ID
    const resultado = await this.supabaseService.eliminarProducto(product.id);

    if (resultado.success) {
      this.showNotice('Producto eliminado correctamente de Supabase.', 3500);

      // 2. Lo removemos visualmente de la sección en la pantalla
      section.platillos = section.platillos.filter(item => item.id !== product.id);

      // 3. Sincronizamos la memoria de Angular
      await this.adminContent.updateMenu(this.menu);
    } else {
      alert('Supabase no pudo eliminar el registro: ' + resultado.error?.message);
    }
  } catch (error: any) {
    alert('Error crítico al eliminar: ' + error.message);
  }
}

  async uploadProductImage(event: Event, product: MenuItem) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.uploadingProductId = product.id;

    try {
      const { publicUrl, error } = await this.withUploadTimeout(
        this.tryUploadImage(file, 'menu')
      );

      if (error) {
        this.showNotice(error, 7000);
        return;
      }

      product.imagenUrl = publicUrl;
      await this.saveMenu('Imagen del producto actualizada.');
    } finally {
      this.uploadingProductId = null;
      input.value = '';
    }
  }

  async saveMenu(message = 'Menu local actualizado.') {
    // Ahora updateMenu solo guarda en la memoria de la aplicación, sin mandar un mega-JSON a la BD
    const resultado = await this.adminContent.updateMenu(this.menu);
    if (resultado.success) {
      this.showNotice(message, 3500);
    }
  }

  async saveContact() {
    this.showNotice('Guardando datos de contacto...');
    const resultado = await this.adminContent.updateContact(this.contact);
    
    if (resultado.success) {
      this.showNotice('Datos de contacto actualizados.', 3500);
    } else {
      this.showNotice(`Error al guardar contacto: ${resultado.error?.message || 'Error desconocido'}`, 5000);
      console.error('Error de Supabase al guardar contacto:', resultado.error);
    }
  }

  async saveOrderPhone() {
    this.showNotice('Guardando número de pedidos...');
    const resultado = await this.adminContent.updateOrderPhone(this.orderPhone);
    this.orderPhone = this.adminContent.snapshot.orderPhone;
    
    if (resultado.success) {
      this.showNotice('Numero de pedidos actualizado.', 3500);
    } else {
      this.showNotice(`Error al guardar teléfono: ${resultado.error?.message || 'Error desconocido'}`, 5000);
      console.error('Error de Supabase al guardar teléfono:', resultado.error);
    }
  }

  resetContent() {
    const confirmed = window.confirm('Esto restaurara el contenido original de Kitsune. Deseas continuar?');

    if (!confirmed) {
      return;
    }

    this.adminContent.reset();
    this.loadEditableData();
    this.showNotice('Contenido restaurado.');
  }

  async logout() {
    await this.adminAuth.logout();
    await this.router.navigateByUrl('/login-admin');
  }

  private loadEditableData() {
    const data = this.adminContent.snapshot;

    this.carouselImages = data.carouselImages;
    this.menu = data.menu;
    this.contact = data.contact;
    this.orderPhone = data.orderPhone;
    this.activeCategory = this.menu[0]?.categoria ?? '';
  }

  private async saveCarousel() {
    this.showNotice('Sincronizando carrusel con la base de datos...');
    const resultado = await this.adminContent.updateCarouselImages(this.carouselImages);
    this.carouselImages = this.adminContent.snapshot.carouselImages;
    
    if (resultado && typeof resultado === 'object' && !resultado.success) {
      if (resultado.code === 'MIN_IMAGES') {
        this.showNotice('El carrusel debe tener al menos 5 imagenes.', 4000);
      } else {
        this.showNotice(`Error al guardar carrusel: ${resultado.error?.message || 'Error desconocido'}`, 5000);
      }
    } else {
      this.showNotice('Carrusel actualizado con éxito.', 3500);
    }
  }

  private async tryUploadImage(file: File, folder: 'carousel' | 'menu') {
    try {
      const { publicUrl, error } = await this.supabaseService.uploadAdminImage(file, folder);

      return {
        publicUrl,
        error: error
          ? `No se pudo subir la imagen: ${error.message}`
          : ''
      };
    } catch (error) {
      return {
        publicUrl: '',
        error: error instanceof Error
          ? error.message
          : 'No se pudo subir la imagen. Revisa permisos de Supabase Storage.'
      };
    }
  }

  private withUploadTimeout(
    upload: Promise<{ publicUrl: string; error: string }>
  ): Promise<{ publicUrl: string; error: string }> {
    return new Promise(resolve => {
      const timeoutId = window.setTimeout(() => {
        resolve({
          publicUrl: '',
          error: 'La subida no respondio. Recarga la pagina, inicia sesion otra vez y revisa permisos de Supabase Storage.'
        });
      }, 20000);

      upload
        .then(result => resolve(result))
        .catch(error => {
          resolve({
            publicUrl: '',
            error: error instanceof Error
              ? error.message
              : 'No se pudo subir la imagen. Revisa permisos de Supabase Storage.'
          });
        })
        .finally(() => window.clearTimeout(timeoutId));
    });
  }

  private showNotice(message: string, durationMs = 3000) {
    this.notice = message;
    window.setTimeout(() => {
      if (this.notice === message) {
        this.notice = '';
      }
    }, durationMs);
  }

  // --- EL MÉTODO DEFINITIVO PARA EL BOTÓN GUARDAR ---
  async guardarCambiosPlatillo(product: MenuItem) {
  try {
    console.log('ENVIANDO A SUPABASE EL PLATILLO:', product.id, product.nombre);
    this.showNotice(`Guardando cambios para "${product.nombre}"...`);

    // 1. Llamamos a la función correcta 'updateProducto' pasándole el objeto 'product' directo
    // Ya que dentro de 'supabaseService.ts' nos encargamos de mapearlo a las columnas de la BD.
    const resultado = await this.supabaseService.updateProducto(product);

    if (resultado.success) {
      this.showNotice(`¡"${product.nombre}" guardado con éxito en la BD!`, 3500);
      
      // 2. Actualizamos la pantalla local en Angular
      await this.adminContent.updateMenu(this.menu); 
    } else {
      alert('Error devuelto por Supabase: ' + resultado.error?.message);
    }

  } catch (error: any) {
    alert('Error crítico al guardar: ' + error.message);
  }
}
}