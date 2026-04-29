import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// 1. Definimos qué es un producto (La Interfaz)
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // 2. La lista interna de productos
  private cartItems: CartItem[] = [];
  private _toggleCart = new BehaviorSubject<boolean>(false);
  toggleCart$ = this._toggleCart.asObservable();

  // 3. La "emisora de radio" que avisa cambios
  private _cart = new BehaviorSubject<CartItem[]>([]);
  cart$ = this._cart.asObservable();

  constructor() {}

  // 4. Función para añadir
  addToCart(product: CartItem) {
    const index = this.cartItems.findIndex(item => item.id === product.id);

    if (index !== -1) {
      this.cartItems[index].quantity += 1;
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
    }
    this._cart.next([...this.cartItems]);
  }

  // 5. Función para calcular el dinero total
  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // 6. Función para contar cuántos productos hay en total
  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  // 7. Función para restar o quitar productos
  removeFromCart(productId: number) {
    const index = this.cartItems.findIndex(item => item.id === productId);

    if (index !== -1) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity -= 1;
      } else {
        this.cartItems.splice(index, 1);
      }
    }
    this._cart.next([...this.cartItems]);
  }

  // En tu cart.service.ts

// Cambiamos la función para que actúe como un interruptor
toggleCart() {
  // Obtenemos el valor actual y enviamos el opuesto
  const currentState = this._toggleCart.value;
  this._toggleCart.next(!currentState);
}

// Mantenemos estas por si acaso necesitas forzar una acción
openCart() { this._toggleCart.next(true); }
closeCart() { this._toggleCart.next(false); }
}