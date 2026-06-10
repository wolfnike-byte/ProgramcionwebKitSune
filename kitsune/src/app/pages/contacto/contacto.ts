import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContactInfo, DEFAULT_CONTACT_INFO } from '../../data/kitsune-data';
import { AdminContentService } from '../../services/admin-content/admin-content';

@Component({
  selector: 'app-contacto',
  imports: [CommonModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class ContactoComponent implements OnInit, OnDestroy {
  contact: ContactInfo = DEFAULT_CONTACT_INFO;
  private contactSubscription?: Subscription;

  constructor(private adminContent: AdminContentService) {}

  ngOnInit() {
    this.contactSubscription = this.adminContent.contact$.subscribe(contact => {
      this.contact = contact;
    });
  }

  get whatsappUrl(): string {
    const digits = this.contact.telefonoAtencion.replace(/\D/g, '');
    const whatsappNumber = digits.startsWith('52') ? digits : `521${digits}`;

    return `https://wa.me/${whatsappNumber}`;
  }

  ngOnDestroy() {
    this.contactSubscription?.unsubscribe();
  }
}
