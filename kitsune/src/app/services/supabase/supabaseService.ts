import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environments'; 

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