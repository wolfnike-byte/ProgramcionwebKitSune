import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartItem, CartService } from '../../services/carrrito/cart';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pedidos.html',
  styleUrls: ['./pedidos.css']
})
export class PedidosComponent implements OnInit {
  tipoEntrega: 'domicilio' | 'pickup' = 'domicilio';

  items: CartItem[] = [];
  total = 0;

  nombre = '';
  telefono = '';
  domicilio = '';
  diaPickup = '';

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(productos => {
      this.items = productos;
      this.total = this.cartService.getTotalPrice();
    });
  }

  normalizarTelefono() {
    this.telefono = this.telefono.replace(/\D/g, '').slice(0, 10);
  }

  formularioValido(): boolean {
    const nombreValido = this.nombre.trim().length > 2;
    const telefonoValido = /^\d{10}$/.test(this.telefono);

    if (this.tipoEntrega === 'domicilio') {
      return nombreValido && telefonoValido && this.domicilio.trim().length > 8;
    }

    return nombreValido && telefonoValido && this.diaPickup.trim().length > 0;
  }

  enviarPedidoWhatsApp() {
    if (this.items.length === 0) {
      alert('Tu carrito esta vacio. Agrega productos antes de procesar el pedido.');
      return;
    }

    this.normalizarTelefono();

    if (!this.formularioValido()) {
      alert('Completa todos los campos. El telefono debe tener exactamente 10 digitos.');
      return;
    }

    const detallePedido = this.items
      .map(item => `${item.quantity} x ${item.name} - $${item.price * item.quantity}`)
      .join('\n');

    let datosCliente = '';
    let envio = '';

    if (this.tipoEntrega === 'domicilio') {
      envio = 'Envio: por definir\n';
      datosCliente =
        `Tipo de entrega: Envio a domicilio\n` +
        `Nombre: ${this.nombre.trim()}\n` +
        `Telefono: ${this.telefono}\n` +
        `Domicilio: ${this.domicilio.trim()}`;
    } else {
      datosCliente =
        `Tipo de entrega: Pick Up\n` +
        `Nombre: ${this.nombre.trim()}\n` +
        `Telefono: ${this.telefono}\n` +
        `Dia de recoleccion: ${this.diaPickup}`;
    }

    const mensaje =
      `Hola, quiero realizar un pedido en Kitsune Sushi.\n\n` +
      `Pedido:\n${detallePedido}\n\n` +
      envio +
      `Total: $${this.total}\n\n` +
      `${datosCliente}`;

    const numeroWhatsApp = '5216182753560';
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
  }
}
