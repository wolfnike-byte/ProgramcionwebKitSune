import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartItem, CartService } from '../../services/carrrito/cart';
import { AdminContentService } from '../../services/admin-content/admin-content';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pedidos.html',
  styleUrls: ['./pedidos.css']
})
export class PedidosComponent implements OnInit, OnDestroy {
  tipoEntrega: 'domicilio' | 'pickup' = 'domicilio';

  items: CartItem[] = [];
  total = 0;

  nombre = '';
  telefono = '';
  domicilio = '';
  diaPickup = '';
  numeroWhatsApp = '5216182753560';
  private orderPhoneSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private adminContent: AdminContentService
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(productos => {
      this.items = productos;
      this.total = this.cartService.getTotalPrice();
    });

    this.orderPhoneSubscription = this.adminContent.orderPhone$.subscribe(numero => {
      this.numeroWhatsApp = numero;
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

    const url = `https://wa.me/${this.numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
  }

  ngOnDestroy() {
    this.orderPhoneSubscription?.unsubscribe();
  }
}
