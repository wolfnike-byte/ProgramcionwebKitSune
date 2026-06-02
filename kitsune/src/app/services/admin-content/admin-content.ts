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

  updateCarouselImages(images: string[]): boolean {
    const cleanImages = images.map(image => image.trim()).filter(Boolean);

    if (cleanImages.length < MIN_CAROUSEL_IMAGES) {
      return false;
    }

    this.commit({ ...this.snapshot, carouselImages: cleanImages });
    return true;
  }

  updateMenu(menu: MenuSection[]) {
    this.commit({ ...this.snapshot, menu: this.clone(menu) });
  }

  updateContact(contact: ContactInfo) {
    this.commit({ ...this.snapshot, contact: this.clone(contact) });
  }

  updateOrderPhone(orderPhone: string) {
    this.commit({ ...this.snapshot, orderPhone: orderPhone.replace(/\D/g, '') });
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

  private commit(data: KitsuneAdminData, syncRemote = true) {
    const cleanData = this.normalizeData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));

    this.dataSubject.next(cleanData);
    this.carouselImages$.next(cleanData.carouselImages);
    this.menu$.next(cleanData.menu);
    this.contact$.next(cleanData.contact);
    this.orderPhone$.next(cleanData.orderPhone);

    if (syncRemote) {
      this.saveRemoteData(cleanData);
    }
  }

  private async loadRemoteData() {
    const { data, error } = await this.supabaseService.getSiteContent();

    if (error || !data?.content) {
      return;
    }

    this.commit(data.content as KitsuneAdminData, false);
  }

  private async saveRemoteData(data: KitsuneAdminData) {
    await this.supabaseService.saveSiteContent(data);
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
