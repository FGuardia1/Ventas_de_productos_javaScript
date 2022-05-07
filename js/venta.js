const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

navToggle.addEventListener("click", () => {
  nav.classList.toggle("nav--visible");
});

//Aqui empieza la logica para la venta de productos
function Tarjeta(nro, titular) {
  this.nro = nro;
  this.titular = titular;
}

function Venta(fecha, producto, cantidad, tarjeta) {
  this.fecha = fecha;
  this.producto = producto;
  this.cantidad = cantidad;
  this.tarjeta = tarjeta;
  this.total = producto.precio * cantidad;
}

function Producto(id, nombre, precio, stock) {
  this.id = id;
  this.nombre = nombre;
  this.precio = precio;
  this.stock = stock;
  this.descontarStock = function (cantidad) {
    this.stock = this.stock - cantidad;
  };
}

const producto1 = new Producto(
  1,
  "Mouse Redragon Griffin M607 RGB USB 7200DPI",
  1730,
  20
);
const producto2 = new Producto(
  2,
  "Memoria Patriot Viper Steel 8gb Ddr4 3200mhz",
  4720,
  10
);
const producto3 = new Producto(
  3,
  "Placa de Video Powercolor Radeon RX 550 Red Dragon 4GB GDDR5",
  35500,
  5
);

let codProducto = parseInt(
  prompt("Ingrese codigo de producto(1-Mouse, 2-Memoria 8Gb, 3-Placa de video)")
);
let cantidad = parseInt(prompt("Ingrese cantidad que quiere comprar"));
let nrotarjeta = prompt("Ingrese nro de tarjeta");
let titular = prompt("Ingrese titular de la tarjeta");
let tarjetaCVV = prompt("Ingrese CVV de la tarjeta");
const tarjeta1 = new Tarjeta(nrotarjeta, titular);

let fecha = new Date();
const venta1 = new Venta(fecha, codProducto, cantidad, tarjeta1.nro);
