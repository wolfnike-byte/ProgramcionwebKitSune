import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-drawer.html',
  styleUrls: ['./cart-drawer.css']
})
export class CartDrawerComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  // Lista de productos (puedes iniciarla vacía o con estos de prueba)
  items: any[] = [
    { name: 'Kitsune Deluxe Box', price: 65, quantity: 1, image: 'assets/kitsune-box.jpg' },
    { name: 'Sushi & Fries Platter', price: 72, quantity: 1, image: 'assets/fries.jpg' }
  ];

  calculateTotal() {
    return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  removeItem(item: any) {
    this.items = this.items.filter(i => i !== item);
  }

  enviarWhatsApp() {
    const telefono = "521234567890"; // Reemplaza con tu número real
    let mensaje = "¡Hola Kitsune! 🦊 Me gustaría hacer el siguiente pedido:%0A%0A";
    
    this.items.forEach(item => {
      mensaje += `- ${item.name} (x${item.quantity}): $${item.price * item.quantity}%0A`;
    });

    mensaje += `%0A*Total a pagar: $${this.calculateTotal()}*`;
    
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
  }
}