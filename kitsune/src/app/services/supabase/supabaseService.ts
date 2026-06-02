import { Injectable } from '@angular/core';
import { AuthChangeEvent, createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environments'; 
import { KitsuneAdminData } from '../../data/kitsune-data';

interface UploadImageResult {
  publicUrl: string;
  error: { message: string } | null;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async signInAdmin(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOutAdmin() {
    return await this.supabase.auth.signOut();
  }

  async getSession() {
    return await this.supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async getSiteContent() {
    return await this.supabase
      .from('site_content')
      .select('content')
      .eq('id', 'kitsune-admin-content')
      .maybeSingle();
  }

  async saveSiteContent(content: KitsuneAdminData) {
    return await this.supabase
      .from('site_content')
      .upsert({
        id: 'kitsune-admin-content',
        content,
        updated_at: new Date().toISOString()
      });
  }

  async uploadAdminImage(file: File, folder: 'carousel' | 'menu'): Promise<UploadImageResult> {
    if (!file.type.startsWith('image/')) {
      return { publicUrl: '', error: { message: 'El archivo debe ser una imagen.' } };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { publicUrl: '', error: { message: 'La imagen no debe pesar mas de 5 MB.' } };
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    const filePath = `admin/${folder}/${Date.now()}-${safeName || 'imagen'}.${extension}`;

    const uploadPromise = this.supabase.storage
      .from('menu-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    const { data, error } = await this.withTimeout(uploadPromise, 25000);

    if (error) {
      return { publicUrl: '', error: { message: error.message } };
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('menu-images')
      .getPublicUrl(data.path);

    return { publicUrl: publicUrlData.publicUrl, error: null };
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        reject(new Error('La subida tardo demasiado. Revisa conexion y politicas de Storage.'));
      }, timeoutMs);

      promise
        .then(result => resolve(result))
        .catch(error => reject(error))
        .finally(() => window.clearTimeout(timeoutId));
    });
  }

  // MÉTODO BASADO EN TU EJEMPLO: Retorna { data, error }
  async getData(tableName: string) {
    return await this.supabase
      .from(tableName)
      .select('*');
  }

  // Generador de URLs para las imágenes de tu Storage
  getPublicImageUrl(fileName: string, bucket: string) {
    if (!fileName) return 'assets/placeholder.jpg';
    
    const { data } = this.supabase
      .storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
}
