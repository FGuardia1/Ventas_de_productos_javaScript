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
function validarDatos(cantidad) {
  if (cantidad > 0) {
    return true;
  }
  return false;
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
  constructor(id, nombre, precio, stock, imagenPath) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
    this.imagenPath = imagenPath;
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

function visualizarProd(arrayProd) {
  let muestrarioProd = document.getElementById("listaProductos");
  for (const producto of arrayProd) {
    let contenedor = document.createElement("div");

    contenedor.innerHTML = `<div class="articulo__nombre">
    ${producto.nombre}
  </div>
  <div class="articulo__precio">$${producto.precio}</div>
  <img class="articulo__imagen" src="${producto.imagenPath}" alt="" />
  <button class="articulo__boton-compra" id=boton${producto.id}>COMPRAR</button>`;
    contenedor.className = "articulo";
    ////añado el producto que se va a ver en la pagina
    muestrarioProd.appendChild(contenedor);
    ///creo el evento de click para el boton de cada producto que se visualizara, le envio el id del producto a la funcion
    let boton = document.getElementById("boton" + producto.id);
    boton.onclick = () => {
      enlistarProducto(producto.id);
    };
  }
}

function enlistarProducto(codProducto) {
  let productoVta = arrayProd[codProducto];

  let listado = document.getElementById("listaCompraPendiente");

  let contenedor = document.createElement("div");
  contenedor.className = "compraPendiente__item";
  contenedor.innerHTML = ` <label>${productoVta.nombre}:</label>
  <input type="text" id="textCant${productoVta.id}" placeholder="Ingrese cantidad" />
  <input type="button" id="buttonCant${productoVta.id}" value="Añadir" />`;

  ////añado el item del producto a comprar en la pagina para poder ingresar cantidad
  listado.appendChild(contenedor);
  let boton = document.getElementById("buttonCant" + productoVta.id);
  boton.onclick = () => {
    confirmarProducto(productoVta.id);
  };
}

function confirmarProducto(codProducto) {
  let cantidad = document.getElementById("textCant" + codProducto).value;
  ///selecciona el producto por el codigo ingresado
  let productoVta = arrayProd[codProducto];

  if (!validarDatos(cantidad)) {
    alert("Datos ingresados no validos");
  } else {
    ///verifico que el stock actual del producto alcance a cubrir la cantidad pedida
    if (!productoVta.verificarStock(cantidad)) {
      alert("No hay suficiente stock");
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
      alert("Producto añadido a la lista");
      ////desactivo el boton que acciono el evento
      document.getElementById("buttonCant" + codProducto).disabled = true;
    }
  }
}

function comprar() {
  if (arrayProdVta.length != 0) {
    let areaForm = document.getElementById("AreaformPago");

    let formulario = document.createElement("form");
    formulario.setAttribute("id", "formPago");
    formulario.innerHTML = `  <label for="tarjeta">Ingrese nro de tarjeta:</label>
    <input type="text" name="tarjeta"  />
    <label for="titular">Ingrese titular de la tarjeta:</label>
    <input type="text" name="titular"  />
    <label for="cvv">Ingrese CVV de la tarjeta:</label>
    <input type="text" name="cvv"  />

    <input type="submit" id="botonConfirmar" value="Comfirmar Compra" />
    <input type="reset" value="Borrar Datos" />`;

    ////añado el formulario
    areaForm.appendChild(formulario);
    ///creo el evento submit
    let miFormulario = document.getElementById("formPago");
    miFormulario.addEventListener("submit", confirmarCompra);
    ///desactivo por el momento el boton de comprar
    document.getElementById("botonCompra").disabled = true;
  }
}

function confirmarCompra(e) {
  e.preventDefault();
  //Obtenemos el elemento desde el cual se disparó el evento
  let formulario = e.target;

  console.log(formulario.children[0].value);
  let nrotarjeta = formulario.children[1].value;
  let titular = formulario.children[3].value;
  let tarjetaCVV = formulario.children[5].value;
  const tarjeta1 = new Tarjeta(nrotarjeta, titular);

  ////realiza el pago por tarjeta, duvuelve true si pudo, sino false
  if (!tarjeta1.realizarPago(tarjetaCVV)) {
    alert("No se pudo realizar el pago");
  } else {
    let fecha = new Date();
    const venta1 = new Venta(fecha, arrayProdVta, tarjeta1.nro);
    ///una vez registrada la compra hago el descuento de stock al/los producto/s correspondiente/s
    //  y hago la lista de los productos para luego mostrarlo por pantalla
    let listaCompra = "";

    for (const producto of arrayProdVta) {
      arrayProd[producto.id].descontarStock(producto.cantidad);
      listaCompra =
        listaCompra +
        "\n" +
        producto.id +
        "-" +
        producto.nombre +
        " cantidad:" +
        producto.cantidad;
    }

    /////informo que la venta se realizo exitosamente, reemplazando el texto/html que hay en el
    /// elemento con ID=listaCompra, que tiene Aviso que no se compro nada aun por defecto
    let anuncioCompra = document.getElementById("listaCompra");
    let parrafo = document.createElement("p");
    parrafo.innerText =
      "Se compro con exito:" +
      listaCompra +
      "\n  por un precio total de $" +
      venta1.total +
      "\n Puede pasar a retirar su compra por cualquiera de nuestras sucursales ";
    anuncioCompra.innerHTML = parrafo.innerHTML;

    ////vacio el array de compra
    while (arrayProdVta.length > 0) arrayProdVta.pop();
    ///quito el form de pago
    document.getElementById("formPago").remove();
    ///quito la lista de productos
    document.getElementById("listaCompraPendiente").innerHTML = "";
    ///reactivo por el momento el boton de comprar
    document.getElementById("botonCompra").disabled = false;
  }
}

//////////////Creo los productos
const producto1 = new Producto(
  0,
  "Mouse Redragon Griffin M607 RGB USB 7200DPI",
  1730,
  20,
  "./images/Mouse.png"
);
const producto2 = new Producto(
  1,
  "Memoria Patriot Viper Steel 8gb Ddr4 3200mhz",
  4720,
  10,
  "./images/memoriaRam.png"
);
const producto3 = new Producto(
  2,
  "Placa de Video Powercolor Radeon RX 550 Red Dragon 4GB GDDR5",
  35500,
  5,
  "./images/placaVideo.png"
);

////Agrego los productos al array de productos
arrayProd.push(producto1, producto2, producto3);
////visualizo todos los productos que estan en el array en la pagina web
visualizarProd(arrayProd);

///creo el evento de click para el boton de compra
let botonCompra = document.getElementById("botonCompra");
botonCompra.onclick = () => {
  comprar();
};
