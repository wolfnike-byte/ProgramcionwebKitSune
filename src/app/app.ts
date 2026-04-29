import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, CartDrawerComponent],
  template: `
    <app-navbar (toggleCart)="toggleCart()"></app-navbar>

    <router-outlet></router-outlet>

    <app-cart-drawer 
      [isOpen]="isCartOpen" 
      (close)="isCartOpen = false">
    </app-cart-drawer>
  `
})
export class AppComponent {
  isCartOpen = false;

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }
}