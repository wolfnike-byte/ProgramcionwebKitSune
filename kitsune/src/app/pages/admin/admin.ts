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

  addCarouselImage() {
    const image = this.newCarouselImage.trim();

    if (!image) {
      this.showNotice('Agrega una URL o ruta de imagen.');
      return;
    }

    this.carouselImages = [...this.carouselImages, image];
    this.newCarouselImage = '';
    this.saveCarousel();
  }

  async uploadCarouselImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.uploadingCarousel = true;
    const { publicUrl, error } = await this.tryUploadImage(file, 'carousel');
    this.uploadingCarousel = false;
    input.value = '';

    if (error) {
      this.showNotice(error);
      return;
    }

    this.carouselImages = [...this.carouselImages, publicUrl];
    this.saveCarousel();
    this.showNotice('Imagen subida y agregada al carrusel.');
  }

  removeCarouselImage(index: number) {
    if (this.carouselImages.length <= this.minCarouselImages) {
      this.showNotice('El carrusel debe conservar al menos 5 imagenes.');
      return;
    }

    this.carouselImages = this.carouselImages.filter((_, imageIndex) => imageIndex !== index);
    this.saveCarousel();
  }

  addProduct(section: MenuSection) {
    section.platillos = [...section.platillos, this.adminContent.createEmptyProduct()];
    this.saveMenu('Producto agregado al menu.');
  }

  removeProduct(section: MenuSection, product: MenuItem) {
    section.platillos = section.platillos.filter(item => item.id !== product.id);
    this.saveMenu('Producto eliminado del menu.');
  }

  async uploadProductImage(event: Event, product: MenuItem) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.uploadingProductId = product.id;
    const { publicUrl, error } = await this.tryUploadImage(file, 'menu');
    this.uploadingProductId = null;
    input.value = '';

    if (error) {
      this.showNotice(error);
      return;
    }

    product.imagenUrl = publicUrl;
    this.saveMenu('Imagen del producto actualizada.');
  }

  saveMenu(message = 'Menu actualizado.') {
    this.adminContent.updateMenu(this.menu);
    this.showNotice(message);
  }

  saveContact() {
    this.adminContent.updateContact(this.contact);
    this.showNotice('Datos de contacto actualizados.');
  }

  saveOrderPhone() {
    this.adminContent.updateOrderPhone(this.orderPhone);
    this.orderPhone = this.adminContent.snapshot.orderPhone;
    this.showNotice('Numero de pedidos actualizado.');
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

  private saveCarousel() {
    const saved = this.adminContent.updateCarouselImages(this.carouselImages);
    this.carouselImages = this.adminContent.snapshot.carouselImages;
    this.showNotice(saved ? 'Carrusel actualizado.' : 'El carrusel debe tener al menos 5 imagenes.');
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

  private showNotice(message: string) {
    this.notice = message;
    window.setTimeout(() => {
      if (this.notice === message) {
        this.notice = '';
      }
    }, 3000);
  }
}
