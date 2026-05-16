import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/carrrito/cart';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-sidebar.html',
  styleUrls: ['./cart-sidebar.css']
})
export class CartSidebarComponent implements OnInit {
  isOpen = false;
  items: CartItem[] = [];
  total = 0;
  totalItems = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.isOpen$.subscribe(estado => {
      this.isOpen = estado;
    });

    this.cartService.cart$.subscribe(productos => {
      this.items = productos;
    });

    this.cartService.totalItems$.subscribe(total => {
      this.totalItems = total;
    });

    this.cartService.totalPrice$.subscribe(total => {
      this.total = total;
    });
  }

  cerrar() {
    this.cartService.closeCart();
  }

  quitar(id: number) {
    this.cartService.removeFromCart(id);
  }

  procesarPedido() {
    this.cartService.closeCart();
    this.router.navigate(['/pedidos']);
  }
}
