import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// ðŸ‘‡ AsegÃºrate de que la ruta apunte al archivo .ts del carrusel
import { CarouselComponent } from '../../components/carousel/carousel'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    CarouselComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  // Se mantiene vacÃ­o porque el carrusel es independiente
}
