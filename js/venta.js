const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

navToggle.addEventListener("click", () => {
  nav.classList.toggle("nav--visible");
});

//Aqui empieza la logica para la venta de productos

function validarDatos(codProducto, cantidad) {
  if (codProducto < 0 || codProducto > 3) {
    return false;
  }

  if (cantidad < 0) {
    return false;
  }
  return true;
}

function verificarStock(producto, cantidad) {
  if (producto.stock >= cantidad) {
    return true;
  } else {
    return false;
  }
}

function Tarjeta(nro, titular) {
  this.nro = nro;
  this.titular = titular;
}
function Venta(fecha, producto, cantidad, tarjeta) {
  this.fecha = fecha;
  this.producto = producto.id;
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
//////////////Creo los productos
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

/////////Aqui empieza el ingreso de datos
let productoVta;
let codProducto = parseInt(
  prompt("Ingrese codigo de producto(1-Mouse, 2-Memoria 8Gb, 3-Placa de video)")
);
let cantidad = parseInt(prompt("Ingrese cantidad que quiere comprar"));

if (!validarDatos(codProducto, cantidad)) {
  ////compruebo que los datos ingresados esten en el rango de datos permitidos
  console.log("Datos ingresados no validos");
} else {
  switch (codProducto) {
    case 1:
      productoVta = producto1;
      break;
    case 2:
      productoVta = producto2;
      break;
    case 3:
      productoVta = producto3;
      break;
  }
  if (!verificarStock(productoVta, cantidad)) {
    ///verifico que el stock actual del producto alcance a cubrir la cantidad pedida
    console.log("No hay suficiente stock");
  } else {
    let nrotarjeta = prompt("Ingrese nro de tarjeta");
    let titular = prompt("Ingrese titular de la tarjeta");
    let tarjetaCVV = prompt("Ingrese CVV de la tarjeta");
    const tarjeta1 = new Tarjeta(nrotarjeta, titular);
    let fecha = new Date();
    const venta1 = new Venta(fecha, productoVta, cantidad, tarjeta1.nro);
    ///una vez registrada la compra hago el descuento al producto correspondiente
    switch (codProducto) {
      case 1:
        producto1.descontarStock(cantidad);
        break;
      case 2:
        producto2.descontarStock(cantidad);
        break;
      case 3:
        producto3.descontarStock(cantidad);
    }
    /////informo por consola que la venta se realizo exitosamente
    console.log(
      "Se compro con exito " +
        productoVta.nombre +
        " en cantidad de " +
        cantidad +
        " por un precio de $" +
        venta1.total +
        " Puede pasar a retirar su compra por cualquiera de nuestras sucursales "
    );
  }
}
