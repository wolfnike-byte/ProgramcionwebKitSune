import { Injectable } from '@angular/core';
import { AuthChangeEvent, createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environments'; 
import { KitsuneAdminData, MenuItem } from '../../data/kitsune-data';

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
    const { data, error } = await this.supabase
      .from('site_content')
      .select('content')
      .eq('id', 1)
      .maybeSingle();

    return { data, error };
  }

  async saveSiteContent(content: any) {
    const { data, error } = await this.supabase
      .from('site_content')
      .upsert({ id: 1, content: content }, { onConflict: 'id' });

    return { data, error };
  }

  async uploadAdminImage(file: File, folder: 'carousel' | 'menu'): Promise<UploadImageResult> {
    const { data: sessionData, error: sessionError } = await this.withTimeout(
      this.supabase.auth.getSession(),
      8000,
      'Supabase no respondio al validar la sesion. Recarga la pagina e inicia sesion otra vez.'
    );

    if (sessionError) {
      return { publicUrl: '', error: { message: sessionError.message } };
    }

    if (!sessionData.session) {
      return { publicUrl: '', error: { message: 'Inicia sesion como administrador antes de subir imagenes.' } };
    }

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

    const { data, error } = await this.withTimeout(
      uploadPromise,
      15000,
      'La subida tardo demasiado. Revisa conexion y politicas de Storage.'
    );

    if (error) {
      return { publicUrl: '', error: { message: error.message } };
    }

    if (!data?.path) {
      return { publicUrl: '', error: { message: 'Supabase no devolvio la ruta de la imagen.' } };
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('menu-images')
      .getPublicUrl(data.path);

    return { publicUrl: publicUrlData.publicUrl, error: null };
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timeoutId = window.setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        reject(new Error(message));
      }, timeoutMs);

      promise
        .then(result => {
          if (!settled) {
            settled = true;
            resolve(result);
          }
        })
        .catch(error => {
          if (!settled) {
            settled = true;
            reject(error);
          }
        })
        .finally(() => window.clearTimeout(timeoutId));
    });
  }

  async getData(tableName: string) {
    return await this.supabase
      .from(tableName)
      .select('*');
  }

  getPublicImageUrl(fileName: string, bucket: string) {
    if (!fileName) return 'assets/placeholder.jpg';
    
    const { data } = this.supabase
      .storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // MÉTODO PARA ACTUALIZAR DIRECTO EN LA TABLA PRODUCTOS
  async updateProducto(product: MenuItem): Promise<{ success: boolean; error?: any }> {
    try {
      const { data, error } = await this.supabase
        .from('productos') // Apuntamos a la tabla 'productos'
        .update({
          nombre: product.nombre,
          precio: Number(product.precio),
          descripcion: product.descripcion,
          imagen_url: product.imagenUrl
        })
        .eq('id', product.id);

      if (error) {
        console.error('❌ Error de Supabase al actualizar producto:', error.message);
        return { success: false, error };
      }
      return { success: true };
    } catch (err) {
      console.error('❌ Error de red:', err);
      return { success: false, error: err };
    }
  }
  // 1. Método para INSERTAR un nuevo platillo en Supabase
async crearProducto(product: any, categoria: string) {
  try {
    const { data, error } = await this.supabase
      .from('productos')
      .insert([
        {
          // 🚫 ELIMINAMOS LA LÍNEA 'id: product.id'
          nombre: product.nombre || 'Nuevo Producto',
          precio: Number(product.precio) || 0,
          descripcion: product.descripcion || '',
          imagen_url: product.imagenUrl || '',
          categoria: categoria
        }
      ])
      .select(); // 👈 El .select() es clave para obtener el ID generado

    if (error) return { success: false, error };
    return { success: true, data: data[0] }; // Retornamos el objeto creado por la BD
  } catch (error: any) {
    return { success: false, error };
  }
}

// 2. Método para ELIMINAR una fila por su ID en Supabase
async eliminarProducto(id: number) {
  try {
    const { data, error } = await this.supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error };
  }
}
}