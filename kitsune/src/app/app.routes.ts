import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { MenuComponent } from './pages/menu/menu';
import { ContactoComponent } from './pages/contacto/contacto';
import { PedidosComponent } from './pages/pedidos/pedidos';
import { AvisoPrivacidadComponent } from './pages/aviso-privacidad/aviso-privacidad';
import { AdminComponent } from './pages/admin/admin';
import { AdminLoginComponent } from './pages/admin-login/admin-login';
import { adminAuthGuard } from './guards/admin-auth.guard';




export const routes: Routes = [
  // AHORA: La ruta vacÃ­a carga el Home directamente
  { path: '', component: HomeComponent }, 
  { path: 'pedidos', component: PedidosComponent },
  { path: 'aviso-privacidad', component: AvisoPrivacidadComponent },
  { path: 'home', component: HomeComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'login-admin', component: AdminLoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminAuthGuard] },
  

  // Opcional: Si alguien escribe una ruta que no existe, al Home
  { path: '**', redirectTo: '' }
];
