import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { MenuComponent } from './pages/menu/menu';
import { ContactoComponent } from './pages/contacto/contacto';

export const routes: Routes = [
  // AHORA: La ruta vacía carga el Home directamente
  { path: '', component: HomeComponent }, 
  
  { path: 'home', component: HomeComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'contacto', component: ContactoComponent },
  
  // Opcional: Si alguien escribe una ruta que no existe, al Home
  { path: '**', redirectTo: '' }
];