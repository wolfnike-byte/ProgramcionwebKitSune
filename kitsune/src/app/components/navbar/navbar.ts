import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/carrrito/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  cartCount = 0;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.totalItems$.subscribe(total => {
      this.cartCount = total;
    });
  }

  toggleCarrito() {
    this.cartService.toggleCart();
  }
}
