import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/carrrito/cart';
import { AdminContentService } from '../../services/admin-content/admin-content';
import { MenuSection } from '../../data/kitsune-data';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.html',
  styleUrls: ['./menu.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  
  categoriaActiva: string = '';
  private menuSubscription?: Subscription;

  menuPorSecciones: MenuSection[] = [
    {
      categoria: 'Rollos Empanizados',
      platillos: [
        { id: 1, nombre: 'Okiniri Especial', descripcion: 'Dentro: Camaron, Queso Crema, Pepino, Aguacate. Fuera: Tampico', precio: 135.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Okiniri%20Especial.jpeg' },
        { id: 2, nombre: 'Nami Roll', descripcion: 'Dentro: Camaron, Queso Crema, Pepino, Aguacate. Fuera: Camaron, Queso Crema', precio: 135.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Nami%20Roll.jpeg' },
        { id: 3, nombre: 'Osaka Roll', descripcion: 'Dentro: Camarón, Pulpo, Queso Crema, Pepino, Aguacate. Fuera: Tampico', precio: 135.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Osaka%20Roll.jpeg'},
        { id: 4, nombre: 'Mar y Tierra', descripcion: 'Dentro: Camarón, Arrachera, Queso Crema, Pepino, Aguacate. Fuera: Tampico', precio: 135.00, imagenUrl:'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Mar%20y%20tierra.jpeg'},
        { id: 5, nombre: 'Niku Roll', descripcion: 'Dentro: Arrachera, Queso Crema, Pepino, Aguacate. Fuera: Tocino, Queso Crema', precio:135.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Niku%20Roll.jpeg'},
        { id: 6, nombre: 'Fuji Roll', descripcion: 'Dentro: Camarón, Queso Crema, Pepino, Aguacate, Tocino, Queso', precio: 135.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Fuji.jpeg'},
        { id: 7, nombre: 'Mita Mita', descripcion: 'Dentro: Camarón, Queso Crema, Pepino, Aguacate. Fuera: Tampico', precio: 135.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Mita%20y%20Mita.jpeg'},
        { id: 8, nombre: 'Spicy Roll', descripcion: 'Dentro: Camarón, Queso Crema, Pepino, Aguacate. Fuera: Spicy de Camarón, Tampico, Ajonjolí', precio: 145.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Spicy%20Roll.jpeg'},
        { id: 9, nombre: 'Buruchizu', descripcion: 'Dentro: Pollo, Queso Crema, Pepino, Aguacate, Queso, Tocino', precio: 135.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Buruchizu.jpeg'},
        { id: 10, nombre: 'Delisius', descripcion: 'Dentro: Camarón, Arrachera, Queso Crema, Pepino, Aguacate. Fuera: Tocino, Queso, Queso Crema. Encima: Tampico', precio: 145.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Delisius.jpeg'},
        { id: 11, nombre: 'She ★ Sho Roll', descripcion: 'Dentro: Arrachera con Gratinado de Queso. Fuera: Queso Crema, Aguacate, Siracha', precio: 145.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Seh%20Sho%20Roll.jpeg'}
      ]
    },
    {
      categoria: 'Rollos Naturales',
      platillos: [
        { id: 12, nombre: 'Tokio Roll', descripcion: 'Dentro: Camarón, Queso Crema, Pepino, Aguacate', precio: 130.00, imagenUrl: '' },
        { id: 13, nombre: 'Philadelphia', descripcion: 'Dentro: Camarón, Pulpo, Queso Crema, Pepino, Aguacate. Fuera: Queso Crema, Ajonjolí', precio: 130.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Philadelphia.jpeg' },
        { id: 14, nombre: 'Vegetariano', descripcion: 'Dentro: Zanahoria, Queso Crema, Pepino, Aguacate. Fuera: Queso Crema, Ajonjolí', precio: 130.00, imagenUrl: ''},
        { id: 15, nombre: 'Midori', descripcion: 'Dentro: Camarón Empanizado. Fuera: Queso Crema, Camarón y Aguacate. Encima: Tampico, Salsa de Anguila', precio: 135.00, imagenUrl:'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Midori.jpeg'},
        { id: 16, nombre: 'Ohara (Alga Por Fuera)', descripcion: 'Dentro: Camarón Empanizado, Queso Crema, Pepino, Aguacate. Fuera: Tampico', precio:130.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Ohara.jpeg'},
        { id: 17, nombre: 'Pikin 🌶️', descripcion: 'Dentro: Surimi Empanizado. Fuera: Queso Crema, Aguacate, Shimi, Mayonesa Spicy', precio: 140.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Pikin.jpeg'},
        { id: 18, nombre: 'Colors', descripcion: 'Dentro: Queso Crema, Pepino. Fuera: Salmón, Atún, Aguacate', precio: 169.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Colors.jpeg'},
        { id: 19, nombre: 'Aguachilito 🌶️', descripcion: 'Dentro: Queso Crema, Pepino, Aguacate. Fuera: Camarón, Pulpo, Cebolla Morada, Pepino, Aguacate, Salsa de Aguachil', precio: 169.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Aguachilito.jpeg'},
        { id: 20, nombre: 'Masaki', descripcion: 'Dentro: Camarón, Queso Crema, Pepino, Aguacate. Fuera: Spicy de Camarón Capeado con Surimi, Salsa de Anguila, Ajonjolí', precio: 135.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Masaki.jpeg'},
        { id: 21, nombre: 'Abokado', descripcion: 'Dentro: Camarón Empanizado, Pepino, Queso Crema. Fuera: Queso Crema, Aguacate, Ajonjolí, Salsa de Anguila', precio: 135.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Abokado.jpeg'},
      ]
    },
    {
      categoria: 'Rollos Gratinados',
      platillos: [
        { id: 22, nombre: 'Culichi', descripcion: 'Dentro: Pollo, Arrachera, Pepino, Aguacate, Queso Crema. Fuera: Queso Crema, Aguacate. Encima: Camarón Spicy, Queso Gratinado, Salsa de Anguila', precio: 169.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Culichi.jpeg' },
        { id: 23, nombre: 'U-Erito', descripcion: 'Dentro: Arrachera, Aguacate, Queso Crema, Chile Caribe. Encima: Queso Gratinado, Chile Caribe y Tocino', precio: 180.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/U-Erito.jpeg' },
        { id: 24, nombre: 'Norteño 🌶️', descripcion: 'Dentro: Arrachera, Tocino, Queso Crema. Fuera: Queso, Arrachera, Chile Serrano. Encima: Salsa de Anguila', precio: 169.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Norteno.jpeg'},
        { id: 25, nombre: 'Fuego 🌶️', descripcion: 'Dentro: Surimi, Aguacate, Queso Crema, Pepino. Fuera: Queso Amarillo. Encima: Chetos Flamin Hot', precio: 169.00, imagenUrl:'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Fuego.jpeg'},
        { id: 26, nombre: 'Ōkī', descripcion: 'Dentro: Pollo, Arrachera, Tocino, Aguacate, Queso Crema. Fuera: Queso, Tampico, Cebollín. Encima: Salsa de Anguila', precio:169.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Oki%20Roll.jpeg'},
        { id: 27, nombre: 'Keitaro', descripcion: 'Dentro: Camarón, Surimi, Aguacate, Queso Crema, Cebollín. Fuera: Queso, Tocino con un Toque de Siracha', precio: 169.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Keitaro.jpeg'},
        { id: 28, nombre: 'Niwatori', descripcion: 'Dentro: Pollo, Queso Crema, Aguacate. Fuera: Queso Gratinado, Chile Serrano, Tocino. Encima: Salsa de Anguila', precio: 169.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Niwatori.jpeg'},
      ]
    },
    {
      categoria: 'Rollos Horneados',
      platillos: [
        { id: 29, nombre: 'Encantador (Rollo Empanizado)', descripcion: 'Dentro: Arrachera, Pepino, Queso Crema. Fuera: Queso Crema, Camarón. Encima: Trozos de Camarón con Aderezo de la Casa, Ajonjolí, Salsa de Anguila', precio: 160.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Encantador.jpeg' },
        { id: 30, nombre: 'Kitsune Roll (Rollo Natural)', descripcion: 'Dentro: Camarón, Pepino, Queso Crema, Aguacate. Fuera: Trozos de Cangrejo, Pulpo, Camarón con Salsa de la Casa. Encima: Salsa de Anguila', precio: 180.00, imagenUrl:'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Kitsune.jpeg'},
        { id: 31, nombre: 'Yoko', descripcion: 'Dentro: Arrachera, Aguacate', precio: 169.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Keitaro.jpeg'},
        { id: 32, nombre: 'Niwatori', descripcion: 'Dentro: Pollo, Queso Crema, Aguacate. Fuera: Queso Gratinado, Chile Serrano, Tocino. Encima: Salsa de Anguila', precio: 169.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Niwatori.jpeg'},
      ]
    },
    {
      categoria: 'Yakimeshi',
      platillos: [
        {id: 33, nombre: 'Especial', descripcion: 'Arroz Frito, Calabaza, Zanahoria, Aguacate, Ajonjolí, Queso Crema y Tampico, Proteína a elegir: Pollo, Arrachera, Camarón (1 Proteina)', precio: 135.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Yakimeshi.jpeg'},
        {id: 34, nombre: 'Especial', descripcion: 'Arroz Frito, Calabaza, Zanahoria, Aguacate, Ajonjolí, Queso Crema y Tampico, Proteína a elegir: Pollo, Arrachera, Camarón (2 Proteinas)', precio: 140.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Yakimeshi.jpeg'},
        {id: 35, nombre: 'Especial', descripcion: 'Arroz Frito, Calabaza, Zanahoria, Aguacate, Ajonjolí, Queso Crema y Tampico, Proteína a elegir: Pollo, Arrachera, Camarón (Mixto)', precio: 145.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Yakimeshi.jpeg'},
        {id: 36, nombre: 'Bacon', descripcion: 'Arroz Frito, Calabaza, Zanahoria, Pollo, Tocino, Queso, Aguacate, Cebollín y Ajonjolí', precio: 140.00 , imagenUrl: ''}
      ]
    },
    {
      categoria: 'Infantil',
      platillos: [
        {id: 37, nombre: 'Esferas del Dragón', descripcion: 'Bolas de Arroz Rellenas de Queso Crema', precio: 119.00, imagenUrl: ''},
        {id: 38, nombre: 'Palomitas de Camarón', descripcion: 'Queso Crema, Camarón y Queso', precio: 119.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Palomitas%20de%20Camaron.jpeg'},
        {id: 39, nombre: 'Dedos de Queso', descripcion: 'Queso gratinado en tiras', precio: 119.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Dedos%20de%20Queso.jpeg'},
        {id: 40, nombre: 'Nuggets', descripcion: 'Pollo en trozos empanizado, Con Papas a la Francesa', precio: 119.00 , imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Nuggets.jpeg'},
        {id: 41, nombre: 'Orden de Papas a la francesa', descripcion: 'Tiras de papa freidas', precio: 45.00 , imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Orden%20de%20Papas%20a%20la%20francesa.jpeg'}
      ]
    },
    {
      categoria: 'Platillos',
      platillos: [
        {id: 42, nombre: 'Kushiagues', descripcion: 'Brochetas Empanizadas de Camarón con Queso Crema sobre una Cama de Arroz, Bañadas en Salsa de Anguila y Ajonjolí', precio: 120.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Kushiagues.jpeg'},
        {id: 43, nombre: 'Palomitas Chiri', descripcion: 'Empanizadas, Queso, Camarón y Serrano', precio: 130.00, imagenUrl: ''},
        {id: 44, nombre: 'Bomba', descripcion: 'Bola de Arroz Empanizada Rellena de Arrachera, Pepino, Aguacate, Queso Crema, Bañada en Toping de Queso y Salsa Secreta de la Casa sobre Zanahoria', precio: 145.00, imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Bomba.jpeg'},
        {id: 45, nombre: 'Pasta Kitsune', descripcion: 'Pasta a la Plancha Salteada con Arrachera, Camarón, Calabaza, Zanahoria, Guarnición de Arroz y Cebollín', precio: 155.00 , imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Pasta%20Kitsune.jpeg'},
        {id: 46, nombre: 'Sopa De Mariscos', descripcion: 'Camarón, Pulpo, Pasta Udon, Calabaza, Zanahoria, Cebollín, Caldo con una Mezcla de Chiles', precio: 175.00 , imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Sopa%20de%20Mariscos.jpeg'},
        {id: 47, nombre: 'Onigiri', descripcion: '2 Pzas Empanizadas Rellenas de Camarón, 1 Pza Natural Rellena de Arrachera sobre una Cama de Zanahoria', precio: 120.00 , imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Onigiri.jpeg'},
        {id: 48, nombre: 'Camarones Roka', descripcion: 'Camarones Capeados en Tempura Bañados en Salsa de la Casa, Cebollín sobre una Cama de Arroz', precio: 175.00 , imagenUrl: 'https://vqveltibucqpnnshvgnf.supabase.co/storage/v1/object/public/menu-images/Camarones%20Roka.jpeg'},
        {id: 49, nombre: 'Papas Chizu', descripcion: 'Papas a la Francesa Bañadas en Queso Amarillo con Topin de Tocino Crujiente y Chile Serrano Frito', precio: 65.00 , imagenUrl: ''}
      ]
    }
  ];

  constructor(
    private cartService: CartService,
    private adminContent: AdminContentService
  ) { }

  ngOnInit() {
    this.menuSubscription = this.adminContent.menu$.subscribe(menu => {
      this.menuPorSecciones = menu;
      const categoriaExiste = menu.some(seccion => seccion.categoria === this.categoriaActiva);

      if (!categoriaExiste && menu.length > 0) {
        this.categoriaActiva = menu[0].categoria;
      }
    });
  }

  cambiarCategoria(nombreCategoria: string) {
    this.categoriaActiva = nombreCategoria;
  }

  // Mapeamos los datos del menú a la interfaz del carrito
  agregarAlCarrito(platillo: any) {
  this.cartService.addToCart({
    id: platillo.id,
    name: platillo.nombre,
    price: platillo.precio,
    quantity: 1,
    image: platillo.imagenUrl
  });
  }

  ngOnDestroy() {
    this.menuSubscription?.unsubscribe();
  }
}
