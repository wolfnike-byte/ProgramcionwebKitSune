import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  
  // Pegamos los links PÚBLICOS directos aquí
  slides: any[] = [
    { fileName: 'Ofertas.jpeg',title: 'Ofertas', url: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/carrusel-images/Ofertas.jpeg' },
    {fileName: 'Culichi.jpeg', title: 'Culichi', url: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/carrusel-images/Culichi.jpeg' },
    { fileName: 'Encantador.jpeg', title: 'Encantador', url: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/carrusel-images/Encantador.jpeg'}
  ];

  activeSlideIndex: number = 0;

  seleccionarImagen(index: number) {
    this.activeSlideIndex = index;
  }
}