const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

navToggle.addEventListener("click", () => {
  nav.classList.toggle("nav--visible");
});

//Aqui empieza la logica para la venta de productos

//////Declaracion de variables globales
//array de todos los productos
const arrayProd = [];
//array de lista de productos que se venderan
const arrayProdVta = [];

//////Declaracion de funciones
function validarDatos(codProducto, cantidad) {
  if (codProducto < 0 || codProducto > arrayProd.length - 1) {
    return false;
  }

  if (cantidad < 0) {
    return false;
  }
  return true;
}

function Tarjeta(nro, titular) {
  this.nro = nro;
  this.titular = titular;
  this.realizarPago = function (cvv) {
    ////aqui se realizara el pago por tarjeta
    return true;
  };
}
function Venta(fecha, listaCompra, tarjeta) {
  this.fecha = fecha;
  this.listaCompra = listaCompra;

  this.tarjeta = tarjeta;
  this.total = listaCompra.reduce(
    (acumulador, producto) => acumulador + producto.precio * producto.cantidad,
    0
  );
}

class Producto {
  constructor(id, nombre, precio, stock) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
  }
  descontarStock(cantidad) {
    this.stock = this.stock - cantidad;
  }

  verificarStock(cantidad) {
    if (this.stock >= cantidad) {
      return true;
    } else {
      return false;
    }
  }
}

class ProductoVta {
  constructor(id, nombre, precio, cantidad) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.cantidad = cantidad;
  }
}

//////////////Creo los productos
const producto1 = new Producto(
  0,
  "Mouse Redragon Griffin M607 RGB USB 7200DPI",
  1730,
  20
);
const producto2 = new Producto(
  1,
  "Memoria Patriot Viper Steel 8gb Ddr4 3200mhz",
  4720,
  10
);
const producto3 = new Producto(
  2,
  "Placa de Video Powercolor Radeon RX 550 Red Dragon 4GB GDDR5",
  35500,
  5
);

////Agrego los productos al array de productos
arrayProd.push(producto1, producto2, producto3);

////Hago un string del listado de codigo y nombre de los productos para luego mostrarlo por pantalla con prompt
let listaProductos = "";
for (const producto of arrayProd) {
  listaProductos = listaProductos + "\n" + producto.id + "-" + producto.nombre;
}

/////////Aqui empieza el ingreso de datos de los productos a comprar
let productoVta;
let codProducto = parseInt(
  prompt("Ingrese codigo de producto: " + listaProductos)
);
if (codProducto != -1) {
  let cantidad = parseInt(prompt("Ingrese cantidad que quiere comprar"));
}

while (codProducto != -1) {
  ////compruebo que los datos ingresados esten en el rango de datos permitidos
  if (!validarDatos(codProducto, cantidad)) {
    console.log("Datos ingresados no validos");
  } else {
    ///selecciona el producto por el codigo ingresado
    productoVta = arrayProd[codProducto];

    ///verifico que el stock actual del producto alcance a cubrir la cantidad pedida
    if (!productoVta.verificarStock(cantidad)) {
      console.log("No hay suficiente stock");
    } else {
      ////Añado el producto a la lista de productos a comprar
      arrayProdVta.push(
        new ProductoVta(
          productoVta.id,
          productoVta.nombre,
          productoVta.precio,
          cantidad
        )
      );
      console.log("Producto añadido a la lista");
    }
  }

  codProducto = parseInt(
    prompt("Ingrese codigo de producto: " + listaProductos)
  );
  if (codProducto != -1) {
    cantidad = parseInt(prompt("Ingrese cantidad que quiere comprar"));
  }
}

if (arrayProdVta.length != 0) {
  let nrotarjeta = prompt("Ingrese nro de tarjeta");
  let titular = prompt("Ingrese titular de la tarjeta");
  let tarjetaCVV = prompt("Ingrese CVV de la tarjeta");
  const tarjeta1 = new Tarjeta(nrotarjeta, titular);

  ////realiza el pago por tarjeta, duvuelve true si pudo, sino false
  if (!tarjeta1.realizarPago(tarjetaCVV)) {
    console.log("No se pudo realizar el pago");
  } else {
    let fecha = new Date();
    const venta1 = new Venta(fecha, arrayProdVta, tarjeta1.nro);
    ///una vez registrada la compra hago el descuento de stock al/los producto/s correspondiente/s

    for (const producto of arrayProdVta) {
      arrayProd[producto.id].descontarStock(cantidad);
    }

    /////informo por consola que la venta se realizo exitosamente
    console.log(
      "Se compro con exito  por un precio de $" +
        venta1.total +
        " Puede pasar a retirar su compra por cualquiera de nuestras sucursales "
    );
  }
}
