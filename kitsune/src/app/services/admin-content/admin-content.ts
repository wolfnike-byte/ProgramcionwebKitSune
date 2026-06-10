import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ContactInfo,
  DEFAULT_ADMIN_DATA,
  KitsuneAdminData,
  MenuItem,
  MenuSection
} from '../../data/kitsune-data';
import { SupabaseService } from '../supabase/supabaseService';

const STORAGE_KEY = 'kitsune-admin-content';
const MIN_CAROUSEL_IMAGES = 5;

@Injectable({
  providedIn: 'root'
})
export class AdminContentService {
  private readonly dataSubject = new BehaviorSubject<KitsuneAdminData>(this.loadData());

  readonly data$ = this.dataSubject.asObservable();
  readonly carouselImages$ = new BehaviorSubject<string[]>(this.dataSubject.value.carouselImages);
  readonly menu$ = new BehaviorSubject<MenuSection[]>(this.dataSubject.value.menu);
  readonly contact$ = new BehaviorSubject<ContactInfo>(this.dataSubject.value.contact);
  readonly orderPhone$ = new BehaviorSubject<string>(this.dataSubject.value.orderPhone);

  constructor(private supabaseService: SupabaseService) {
    this.loadRemoteData();
  }

  get snapshot(): KitsuneAdminData {
    return this.clone(this.dataSubject.value);
  }

  async updateCarouselImages(images: string[]): Promise<{ success: boolean; error?: any; code?: string }> {
    const cleanImages = images.map(image => image.trim()).filter(Boolean);

    if (cleanImages.length < MIN_CAROUSEL_IMAGES) {
      return { success: false, code: 'MIN_IMAGES' };
    }

    return await this.commit({ ...this.snapshot, carouselImages: cleanImages });
  }

  async updateMenu(menu: MenuSection[]): Promise<{ success: boolean; error?: any }> {
    // IMPORTANTE: Pasamos false para que NO suba el menú entero a site_content
    return await this.commit({ ...this.snapshot, menu: this.clone(menu) }, false);
  }

  async updateContact(contact: ContactInfo): Promise<{ success: boolean; error?: any }> {
    return await this.commit({ ...this.snapshot, contact: this.clone(contact) });
  }

  async updateOrderPhone(orderPhone: string): Promise<{ success: boolean; error?: any }> {
    return await this.commit({ ...this.snapshot, orderPhone: orderPhone.replace(/\D/g, '') });
  }

  reset() {
    this.commit(this.clone(DEFAULT_ADMIN_DATA));
  }

  createEmptyProduct(): MenuItem {
    const ids = this.snapshot.menu.flatMap(section => section.platillos.map(item => item.id));
    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

    return {
      id: nextId,
      nombre: 'Nuevo producto',
      descripcion: 'Descripcion del producto',
      precio: 0,
      imagenUrl: ''
    };
  }

  private async commit(data: KitsuneAdminData, syncRemote = true): Promise<{ success: boolean; error?: any }> {
    const cleanData = this.normalizeData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));

    this.dataSubject.next(cleanData);
    this.carouselImages$.next(cleanData.carouselImages);
    this.menu$.next(cleanData.menu);
    this.contact$.next(cleanData.contact);
    this.orderPhone$.next(cleanData.orderPhone);

    if (syncRemote) {
      return await this.saveRemoteData(cleanData);
    }
    return { success: true };
  }

  private async loadRemoteData() {
    try {
      // 1. Intentamos cargar el contenido base del sitio (Carrusel, Teléfono, Redes) de site_content
      const { data: siteData, error: siteError } = await this.supabaseService.getSiteContent();
      let baseContent: KitsuneAdminData = this.loadData(); // Carga el fallback local inicial

      if (!siteError && siteData?.content) {
        baseContent = siteData.content as KitsuneAdminData;
      }

      // 2. Traemos los platillos vivos y reales de la tabla 'productos'
      const { data: dbProductos, error: prodError } = await this.supabaseService.getData('productos');

      if (prodError) {
        console.error('❌ Error al traer los productos de Supabase:', prodError.message);
      } else if (dbProductos && dbProductos.length > 0) {
        console.log('📦 Productos vivos recuperados de Supabase:', dbProductos.length);

        // Mapeamos los datos de la BD (snake_case) al formato de tu interfaz TypeScript (camelCase)
        const platillosMapeados = dbProductos.map((p: any) => {
          
          // 🔄 CAPA DE COMPATIBILIDAD INTERNA: Traducimos categorías viejas de la BD a las nuevas pestañas
          let categoriaDestino = p.categoria?.trim() || '';

          if (categoriaDestino === 'Rollos Especiales') {
            // Si el nombre contiene 'yoko', lo mandamos a Horneados; los demás van a Gratinados
            categoriaDestino = p.nombre?.toLowerCase().includes('yoko') ? 'Rollos Horneados' : 'Rollos Gratinados';
          } else if (categoriaDestino === 'Entradas') {
            categoriaDestino = 'Infantil';
          } else if (categoriaDestino === 'Especialidades') {
            categoriaDestino = 'Platillos';
          }

          return {
            id: p.id,
            nombre: p.nombre,
            precio: Number(p.precio), // Nos aseguramos de que sea un número real
            descripcion: p.descripcion,
            imagenUrl: p.imagen_url, // Traducimos 'imagen_url' de la BD a 'imagenUrl'
            categoria: categoriaDestino // 👈 Usamos la categoría homologada para el Front-End
          };
        });

        // 3. Inyectamos los platillos reales dentro de sus categorías correspondientes del menú
        baseContent.menu = baseContent.menu.map(section => {
          // Filtramos y asignamos solo los platillos que pertenecen a esta categoría en la base de datos
          const platillosDeEstaCategoria = platillosMapeados.filter(
            p => p.categoria?.trim().toLowerCase() === section.categoria?.trim().toLowerCase()
          );

          return {
            ...section,
            platillos: platillosDeEstaCategoria
          };
        });
      }

      // 4. Actualizamos el estado global de Angular en memoria (pasamos false para NO re-escribir en la BD)
      this.commit(baseContent, false);

    } catch (err) {
      console.error('❌ Fallo crítico en el ciclo de carga inicial:', err);
    }
  }

  private async saveRemoteData(data: KitsuneAdminData): Promise<{ success: boolean; error?: any }> {
    try {
      const response = await this.supabaseService.saveSiteContent(data);
      if (response && response.error) {
        console.error('❌ Error devuelto por Supabase:', response.error);
        return { success: false, error: response.error };
      }
      return { success: true };
    } catch (err) {
      console.error('❌ Error de red con Supabase:', err);
      return { success: false, error: { message: 'Fallo de conexión de red con Supabase.' } };
    }
  }

  private loadData(): KitsuneAdminData {
    const fallback = this.clone(DEFAULT_ADMIN_DATA);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return fallback;
      }

      return this.normalizeData({
        ...fallback,
        ...JSON.parse(stored)
      });
    } catch {
      return fallback;
    }
  }

  private normalizeData(data: KitsuneAdminData): KitsuneAdminData {
    const fallback = this.clone(DEFAULT_ADMIN_DATA);
    const carouselImages = Array.isArray(data.carouselImages)
      ? data.carouselImages.map(image => String(image).trim()).filter(Boolean)
      : fallback.carouselImages;

    return {
      carouselImages: carouselImages.length >= MIN_CAROUSEL_IMAGES ? carouselImages : fallback.carouselImages,
      menu: Array.isArray(data.menu) && data.menu.length > 0 ? this.clone(data.menu) : fallback.menu,
      contact: {
        ...fallback.contact,
        ...data.contact,
        redesSociales: Array.isArray(data.contact?.redesSociales)
          ? data.contact.redesSociales
          : fallback.contact.redesSociales
      },
      orderPhone: String(data.orderPhone || fallback.orderPhone).replace(/\D/g, '')
    };
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}