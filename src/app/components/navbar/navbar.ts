import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html', // Esto asegura que use tu diseño con logo
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  @Input() cartCount: number = 0; // Para mostrar cuántos productos hay
  @Output() toggleCart = new EventEmitter<void>();

  toggleCarrito() {
    this.toggleCart.emit();
  }
}