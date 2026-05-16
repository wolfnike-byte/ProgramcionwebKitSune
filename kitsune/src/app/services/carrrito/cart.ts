import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  private cartItems: CartItem[] = [];

  private _isOpen = new BehaviorSubject<boolean>(false);
  isOpen$ = this._isOpen.asObservable();

  private _cart = new BehaviorSubject<CartItem[]>([]);
  cart$ = this._cart.asObservable();

  private _totalItems = new BehaviorSubject<number>(0);
  totalItems$ = this._totalItems.asObservable();

  private _totalPrice = new BehaviorSubject<number>(0);
  totalPrice$ = this._totalPrice.asObservable();

  toggleCart() {
    this._isOpen.next(!this._isOpen.value);
  }

  closeCart() {
    this._isOpen.next(false);
  }

  addToCart(product: CartItem) {
    const index = this.cartItems.findIndex(item => item.id === product.id);

    if (index !== -1) {
      this.cartItems[index].quantity += 1;
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
    }

    this.emitCartChanges();
  }

  removeFromCart(productId: number) {
    const index = this.cartItems.findIndex(item => item.id === productId);

    if (index !== -1) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity -= 1;
      } else {
        this.cartItems.splice(index, 1);
      }
    }

    this.emitCartChanges();
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  private emitCartChanges() {
    this._cart.next([...this.cartItems]);
    this._totalItems.next(this.getTotalItems());
    this._totalPrice.next(this.getTotalPrice());
  }
}
