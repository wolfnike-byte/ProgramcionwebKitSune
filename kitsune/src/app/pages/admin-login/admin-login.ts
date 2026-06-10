import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth/admin-auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private adminAuth: AdminAuthService,
    private router: Router
  ) {}

  async login() {
    this.errorMessage = '';
    this.loading = true;

    // Recibimos el mensaje de error del servicio (o null si todo fue bien)
    const error = await this.adminAuth.login(this.email, this.password);
    this.loading = false;

    if (error !== undefined && error !== null) {
      this.errorMessage = error; 
      return;
    }

    await this.router.navigateByUrl('/admin');
  }
}
