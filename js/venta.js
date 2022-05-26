const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

navToggle.addEventListener("click", () => {
  nav.classList.toggle("nav--visible");
});

/////////Aqui empieza la logica para la venta de productos/////////

//////Declaracion de variables globales///////
//array de todos los productos
const arrayProd = [];
//array de lista de productos que se venderan(lista de compras)
const arrayProdVta = [];

////secciones de la pagina donde se crearan/borraran elementos
let seccionComprasRealizadas = document.getElementById("listaCompra");
let seccionMuestrarioProd = document.getElementById("listaProductos");
let seccionListadoProductoPendienteCompra = document.getElementById(
  "listaCompraPendiente"
);
let seccionFormPago = document.getElementById("AreaformPago");
///elementos de la pagina
let formularioPago;
let listaCompraPendiente = document.getElementById("listaCompraPendiente");
//////Declaracion de funciones//////

function obtenerFechaActual() {
  return new Date();
}

function realizarPagoTarjeta(tarjeta) {
  ////aqui se realizara el pago por tarjeta
  return true;
}

function crearObjetoTarjeta(formulario) {
  let tarjeta = {
    nroTarjeta: formulario.children[1].value,
    titular: formulario.children[3].value,
    CVV: formulario.children[5].value,
  };
  return tarjeta;
}

function crearObjetoVenta(listaCompra, nrotarjeta) {
  const venta = {
    fecha: obtenerFechaActual(),
    listaDeCompra: listaCompra,
    nroDetarjeta: nrotarjeta,
    total: listaCompra.reduce(
      (acumulador, producto) =>
        acumulador + producto.precio * producto.cantidad,
      0
    ),
  };
  return venta;
}

function vaciarArrayCompra() {
  while (arrayProdVta.length > 0) arrayProdVta.pop();
}

class PageHandler {
  descontarStock() {
    for (const producto of arrayProdVta) {
      arrayProd[producto.id].stock =
        arrayProd[producto.id].stock - producto.cantidad;
    }
  }

  verificarStock(producto, cantidad) {
    if (producto.stock >= cantidad) {
      return true;
    } else {
      return false;
    }
  }

  validarDatos(cantidad) {
    if (cantidad > 0) {
      return true;
    }
    return false;
  }
  obtenerListaCompra() {
    let listaCompra = "";
    for (const producto of arrayProdVta) {
      listaCompra =
        listaCompra +
        "\n" +
        producto.id +
        "-" +
        producto.nombre +
        " cantidad:" +
        producto.cantidad;
    }
    return listaCompra;
  }
  visualizarListaDecompra(venta) {
    let parrafo = document.createElement("p");
    parrafo.innerText =
      "Se compro con exito:" +
      this.obtenerListaCompra() +
      "\n  por un precio total de $" +
      venta.total +
      "\n Puede pasar a retirar su compra por cualquiera de nuestras sucursales ";
    seccionComprasRealizadas.innerHTML = parrafo.innerHTML;
  }

  obtenerHtmlproducto(producto) {
    return `<div class="articulo__nombre">
        ${producto.nombre}
        </div>
        <div class="articulo__precio">$${producto.precio}</div>
        <img class="articulo__imagen" src="${producto.imagenPath}" alt="" />
        <button class="articulo__boton-compra" id=boton${producto.id}>COMPRAR</button>`;
  }

  obtenerHtmlCompraPendiente(productoVta) {
    return ` <label>${productoVta.nombre}:</label>
  <input type="text" id="textCant${productoVta.id}" placeholder="Ingrese cantidad" />
  <input type="button" id="buttonCant${productoVta.id}" value="Añadir" />`;
  }

  obtnerHtmlFormPago() {
    return `  <label for="tarjeta">Ingrese nro de tarjeta:</label>
    <input type="text" name="tarjeta"  />
    <label for="titular">Ingrese titular de la tarjeta:</label>
    <input type="text" name="titular"  />
    <label for="cvv">Ingrese CVV de la tarjeta:</label>
    <input type="text" name="cvv"  />

    <input type="submit" id="botonConfirmar" value="Confirmar Compra" />
    <input type="reset" value="Borrar Datos" />`;
  }

  obtenerValorInputText(id) {
    return document.getElementById(id).value;
  }

  inhabilitarBotonCompra(modo) {
    document.getElementById("botonCompra").disabled = modo;
  }

  agregarElementoApagina(
    tipoElemento,
    elementoPadre,
    htmlHijo,
    claseHijo,
    idHijo
  ) {
    let hijo = document.createElement(tipoElemento);
    hijo.innerHTML = htmlHijo;
    hijo.className = claseHijo;
    if (idHijo) {
      hijo.setAttribute("id", idHijo);
    }

    elementoPadre.appendChild(hijo);
  }
  crearEventoBotonCompra() {
    let elemento = document.getElementById("botonCompra");
    elemento.onclick = () => {
      this.ingresarDatosPago();
    };
  }

  crearEvento(idElemento, accion, parametroAccion) {
    let elemento = document.getElementById(idElemento);

    elemento.onclick = () => {
      accion(parametroAccion);
    };
  }

  visualizarProd() {
    for (const producto of arrayProd) {
      let HTMLhijo = this.obtenerHtmlproducto(producto);
      ////agrego cada producto a la pagina, con articulo como la clase de cada nuevo elemento(producto)
      this.agregarElementoApagina(
        "div",
        seccionMuestrarioProd,
        HTMLhijo,
        "articulo"
      );
      ///creo el evento de click para el boton de cada producto que se visualizara, le envio el id del producto a la funcion
      this.crearEvento(
        "boton" + producto.id,
        this.enlistarProductoPendienteCompra.bind(this),
        producto.id
      );
    }
  }

  enlistarProductoPendienteCompra(codProducto) {
    let productoVta = arrayProd[codProducto];
    let HTMLitemCompraPendiente = this.obtenerHtmlCompraPendiente(productoVta);
    this.agregarElementoApagina(
      "div",
      seccionListadoProductoPendienteCompra,
      HTMLitemCompraPendiente,
      "compraPendiente__item"
    );
    this.crearEvento(
      "buttonCant" + productoVta.id,
      this.confirmarProducto.bind(this),
      productoVta.id
    );
  }

  confirmarProducto(codProducto) {
    let cantidad = this.obtenerValorInputText("textCant" + codProducto);
    ///selecciona el producto por el codigo
    let productoVta = arrayProd[codProducto];

    if (!this.validarDatos(cantidad)) {
      alert("Datos ingresados no validos");
    } else {
      ///verifico que el stock actual del producto alcance a cubrir la cantidad pedida
      if (!this.verificarStock(productoVta, cantidad)) {
        alert("No hay suficiente stock");
      } else {
        ////Añado el producto a la lista de productos a comprar
        this.agregarItemDeCompra(productoVta, cantidad);
        alert("Producto añadido a la lista");
        ////desactivo la visibilidad del boton que acciono el evento, para no volver a usarlo e
        ///inhabilito la caja de texto donde se ingreso la cantidad
        this.inhabilitarButtonEinputText(codProducto);
      }
    }
  }

  inhabilitarButtonEinputText(codProducto) {
    //oculto el boton de confirmacion de item de compra pendiente
    document.getElementById("buttonCant" + codProducto).style.visibility =
      "hidden";
    ///inhabilito la caja de texto donde se ingreso la cantidad de la compra pendiente
    document.getElementById("textCant" + codProducto).disabled = true;
  }

  agregarItemDeCompra(productoVta, cantidad) {
    const itemCompra = {
      id: productoVta.id,
      nombre: productoVta.nombre,
      precio: productoVta.precio,
      cantidad: cantidad,
    };
    arrayProdVta.push(itemCompra);
  }

  ingresarDatosPago() {
    //verifico que la lista de compras no este vacia
    if (arrayProdVta.length != 0) {
      let htmlFormPago = this.obtnerHtmlFormPago();

      ////añado el formulario
      this.agregarElementoApagina(
        "form",
        seccionFormPago,
        htmlFormPago,
        "",
        "formPago"
      );
      formularioPago = document.getElementById("formPago");
      ///creo el evento submit
      this.crearEventoSubmitFormPago(
        formularioPago,
        this.confirmarCompra.bind(this)
      );
      ///desactivo por el momento el boton de comprar
      this.inhabilitarBotonCompra(true);
    }
  }

  crearEventoSubmitFormPago(elemento, accion) {
    elemento.addEventListener("submit", accion);
  }

  confirmarCompra(e) {
    e.preventDefault();
    //Obtenemos el elemento desde el cual se disparó el evento
    let formulario = e.target;
    ///crea el objeto tarjeta
    const tarjeta = crearObjetoTarjeta(formulario);
    ////realiza el pago por tarjeta, devuelve true si pudo, sino false
    if (!realizarPagoTarjeta(tarjeta)) {
      alert("No se pudo realizar el pago");
    } else {
      const venta = crearObjetoVenta(arrayProdVta, tarjeta.nroTarjeta);
      ///una vez registrada la compra hago el descuento de stock al/los producto/s correspondiente/
      this.descontarStock();
      /////informo que la venta se realizo exitosamente
      this.visualizarListaDecompra(venta);
      ///reseteo el estado visual de la pagina y vacio la lista de compras pendientes
      this.resetearEstadoCompra();
    }
  }

  resetearEstadoCompra() {
    ////vacio el array de compra
    vaciarArrayCompra();
    ///quito el form de pago
    this.quitarFormPago();
    ///quito la lista de productos
    this.vaciarListaCompra();
    ///reactivo el boton de comprar
    this.inhabilitarBotonCompra(false);
  }

  quitarFormPago() {
    formularioPago.remove();
  }
  vaciarListaCompra() {
    listaCompraPendiente.innerHTML = "";
  }
}

//////////////Creo los productos

const producto1 = {
  id: 0,
  nombre: "Mouse Redragon Griffin M607 RGB USB 7200DPI",
  precio: 1730,
  stock: 20,
  imagenPath: "./images/Mouse.png",
};

const producto2 = {
  id: 1,
  nombre: "Memoria Patriot Viper Steel 8gb Ddr4 3200mhz",
  precio: 4720,
  stock: 10,
  imagenPath: "./images/memoriaRam.png",
};

const producto3 = {
  id: 2,
  nombre: "Placa de Video Powercolor Radeon RX 550 Red Dragon 4GB GDDR5",
  precio: 35500,
  stock: 5,
  imagenPath: "./images/placaVideo.png",
};

////Agrego los productos al array de productos
arrayProd.push(producto1, producto2, producto3);

///Creo mi objeto que va a gestionar la pagina
let MiPageHandler = new PageHandler();

////visualizo todos los productos que estan en el array en la pagina web
MiPageHandler.visualizarProd();
MiPageHandler.crearEventoBotonCompra();
///creo el evento de click para el boton de compra
