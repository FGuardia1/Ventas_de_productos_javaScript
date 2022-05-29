//////Declaracion de variables globales///////

//////////////Creo el array de productos
const productos = [
  {
    id: 0,
    nombre: "Mouse Redragon Griffin M607 RGB USB 7200DPI",
    precio: 1730,
    stock: 20,
    imagenPath: "./images/Mouse.png",
  },
  {
    id: 1,
    nombre: "Memoria Patriot Viper Steel 8gb Ddr4 3200mhz",
    precio: 4720,
    stock: 10,
    imagenPath: "./images/memoriaRam.png",
  },
  {
    id: 2,
    nombre: "Placa de Video Powercolor Radeon RX 550 Red Dragon 4GB GDDR5",
    precio: 35500,
    stock: 5,
    imagenPath: "./images/placaVideo.png",
  },
];

//array de todos los productos
let arrayProd;
//array de todas las ventas registradas
const arrayVentas = [];
//array de lista de productos que se venderan(lista de compras)
const carritoDeCompra = [];

////secciones de la pagina donde se crearan/borraran elementos
let seccionComprasRealizadas = document.getElementById("listaCompra");
let seccionMuestrarioProd = document.getElementById("listaProductos");
let seccionCarritoCompra = document.getElementById("carritoCompra");
let seccionFormPago = document.getElementById("AreaformPago");
///elementos de la pagina

let listaCompraPendiente = document.getElementById("listaCompraPendiente");
//////Declaracion de funciones//////

//////funciones auxiliares
function obtenerFechaActual() {
  return new Date().toLocaleString("en-GB", { hour12: false });
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

function crearObjetoVenta(nrotarjeta) {
  const venta = {
    fecha: obtenerFechaActual(),
    listaDeCompra: JSON.stringify(carritoDeCompra),
    nroDetarjeta: nrotarjeta,
    total: carritoDeCompra.reduce((acumulador, producto) => acumulador + producto.precio * producto.cantidad, 0),
  };
  return venta;
}

function vaciarArrayCompra() {
  while (carritoDeCompra.length > 0) carritoDeCompra.pop();
}

//////////funciones de uso de storage,local

function obtenerProductosLocal() {
  arrayProd = JSON.parse(localStorage.getItem("productos"));
}

function obtenerVentasLocal() {
  if (JSON.parse(localStorage.getItem("ventas")) != null) {
    for (const item of JSON.parse(localStorage.getItem("ventas"))) {
      arrayVentas.push(item);
    }
  }
}

function guardarLocal(clave, valor) {
  localStorage.setItem(clave, valor);
}

function agregarVenta(venta) {
  arrayVentas.push(venta);
  guardarLocal("ventas", JSON.stringify(arrayVentas));
}

///////////////defino la clase que va a manejar casi todas las funcionalidades de la pagina
class PageHandler {
  descontarStock() {
    for (const producto of carritoDeCompra) {
      arrayProd[producto.id].stock = arrayProd[producto.id].stock - producto.cantidad;
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
  obtenerListaCarrito() {
    let listaCompra = "";
    for (const producto of carritoDeCompra) {
      listaCompra = listaCompra + "\n" + producto.nombre + ", $" + producto.precio + " cantidad:" + producto.cantidad;
    }
    return listaCompra;
  }
  visualizarListaDecompra(venta) {
    let parrafo = document.createElement("p");
    parrafo.innerText =
      "Se compro con exito:" +
      this.obtenerListaCarrito() +
      "\n  por un precio total de $" +
      venta.total +
      "\n Puede pasar a retirar su compra por cualquiera de nuestras sucursales ";
    seccionComprasRealizadas.innerHTML = parrafo.innerHTML;
  }

  visualizarCarrito() {
    let parrafo = document.createElement("p");
    parrafo.innerText = "Carrito actual:" + this.obtenerListaCarrito();
    seccionCarritoCompra.innerHTML = parrafo.innerHTML;
  }

  obtenerHtmlproducto(producto) {
    return `<div class="articulo__nombre">
        ${producto.nombre}
        </div>
        <div class="articulo__precio">$${producto.precio}</div>
        <img class="articulo__imagen" src="${producto.imagenPath}" alt="" />
        <button class="articulo__boton-compra" id=boton${producto.id}>COMPRAR</button>`;
  }

  obtenerHtmlIngresoCantidadCompra(productoVta) {
    return `<input type="text" id="textCant${productoVta.id}" placeholder="Ingrese cantidad" />
  <input type="button" id="buttonCant${productoVta.id}" value="Añadir" /><label id="labelEstadoItem${productoVta.id}"></label>`;
  }
  obtenerHtmlBotonCancelarCompra(codProducto) {
    return `<input type="button" id="buttonCancelarCompra${codProducto}" value="Cancelar compra" />`;
  }

  obtenerHtmlFormPago() {
    return `  <label for="tarjeta">Ingrese nro de tarjeta:</label>
    <input type="text" name="tarjeta"  />
    <label for="titular">Ingrese titular de la tarjeta:</label>
    <input type="text" name="titular"  />
    <label for="cvv">Ingrese CVV de la tarjeta:</label>
    <input type="text" name="cvv"  />
    <br>
    <input type="submit" id="botonConfirmar" value="Confirmar Compra" />
    <input type="reset" value="Borrar Datos" /><br>
    <label id="avisoForm"></label>`;
  }

  obtenerValorInputText(id) {
    return document.getElementById(id).value;
  }

  obtenerElementoHtmlId(id) {
    return document.getElementById(id);
  }

  setValorLabel(id, mensaje) {
    document.getElementById(id).innerHTML = mensaje;
  }

  inhabilitarBotonCompra(modo) {
    document.getElementById("botonCompra").disabled = modo;
  }

  inhabilitarButtonEinputText(codProducto) {
    //oculto el boton de confirmacion de item de compra pendiente
    document.getElementById("buttonCant" + codProducto).style.visibility = "hidden";
    ///inhabilito la caja de texto donde se ingreso la cantidad de la compra pendiente
    document.getElementById("textCant" + codProducto).disabled = true;
  }

  quitarElementoApagina(id) {
    let elemento = document.getElementById(id);
    if (elemento != null) {
      elemento.remove();
    }
  }

  agregarElementoApagina(tipoElemento, elementoPadre, htmlHijo, claseHijo, idHijo) {
    let hijo = document.createElement(tipoElemento);
    hijo.innerHTML = htmlHijo;
    hijo.className = claseHijo;
    if (idHijo) {
      hijo.setAttribute("id", idHijo);
    }

    elementoPadre.appendChild(hijo);
  }
  crearEventoBoton(idElemento) {
    let elemento = document.getElementById(idElemento);

    if (idElemento == "botonCompra") {
      elemento.onclick = () => {
        this.ingresarDatosPago();
      };
    } else {
      elemento.onclick = () => {
        this.buscarProductoNombre();
      };
    }
  }

  buscarProductoNombre() {
    //vacio el muestrario para luego llenarlo del resultado de busqueda
    seccionMuestrarioProd.innerHTML = "";

    let str = this.obtenerValorInputText("buscadorInput");
    const resultado = arrayProd.filter((el) => el.nombre.toLowerCase().includes(str.toLowerCase()));
    //visualizo el array de productos luego del filtro
    this.visualizarProd(resultado);
  }

  crearEvento(idElemento, accion, parametroAccion) {
    let elemento = document.getElementById(idElemento);

    elemento.onclick = () => {
      accion(parametroAccion);
    };
  }

  visualizarProd(arrayProdMostrar) {
    for (const producto of arrayProdMostrar) {
      let HTMLhijo = this.obtenerHtmlproducto(producto);
      ////agrego cada producto a la pagina, con articulo como la clase de cada nuevo elemento(producto)
      this.agregarElementoApagina("div", seccionMuestrarioProd, HTMLhijo, "articulo", "producto" + producto.id);
      ///creo el evento de click para el boton de cada producto que se visualizara, le envio el id del producto a la funcion
      this.crearEvento("boton" + producto.id, this.ingresoCantidadCompra.bind(this), producto.id);
    }
  }

  ingresoCantidadCompra(codProducto) {
    //Verifico que los elementos de ingreso de cantidad no existan actualmente
    if (this.obtenerElementoHtmlId("ingresoCantProd" + codProducto) == null) {
      let productoVta = arrayProd[codProducto];
      let HTMLitemCompraPendiente = this.obtenerHtmlIngresoCantidadCompra(productoVta);

      ////creo los elementos html(input text, boton) para poder ingresar la cantidad a comprar
      this.agregarElementoApagina(
        "div",
        this.obtenerElementoHtmlId("producto" + codProducto),
        HTMLitemCompraPendiente,
        "compraPendiente__item",
        "ingresoCantProd" + productoVta.id
      );

      ////Creo el evento del boton para confirmar la cantidad a comprar
      this.crearEvento("buttonCant" + productoVta.id, this.confirmarProducto.bind(this), productoVta.id);
    }
  }

  confirmarProducto(codProducto) {
    //obtengo el valor ingresado en el input text de ingreso de cantidad
    let cantidad = this.obtenerValorInputText("textCant" + codProducto);
    ///selecciona el producto por el codigo
    let productoVta = arrayProd[codProducto];
    //verifico que lo ingresado sea un numero valido
    if (!this.validarDatos(cantidad)) {
      this.setValorLabel("labelEstadoItem" + productoVta.id, "Ingreso erroneo");
    } else {
      ///verifico que el stock actual del producto alcance a cubrir la cantidad pedida
      if (!this.verificarStock(productoVta, cantidad)) {
        this.setValorLabel("labelEstadoItem" + productoVta.id, "No hay suficiente stock");
      } else {
        ////Añado el producto a la lista de productos a comprar
        this.agregarItemDeCompraAlCarrito(productoVta, cantidad);
        //aviso que se agrego al carrito de compras
        this.setValorLabel("labelEstadoItem" + productoVta.id, "Producto añadido a la lista");

        ////desactivo la visibilidad del boton que acciono el evento, para no volver a usarlo e
        ///inhabilito la caja de texto donde se ingreso la cantidad
        this.inhabilitarButtonEinputText(codProducto);
        //creo un boton para poder quitar el item del carrito
        this.crearBotonCancelarCompra(codProducto);
      }
    }
  }

  agregarItemDeCompraAlCarrito(productoVta, cantidad) {
    const itemCompra = {
      id: productoVta.id,
      nombre: productoVta.nombre,
      precio: productoVta.precio,
      cantidad: cantidad,
    };
    carritoDeCompra.push(itemCompra);
    this.visualizarCarrito();
  }

  crearBotonCancelarCompra(codProducto) {
    //obtengo el elemento html que contiene los elementos de ingreso de cantidad de producto
    let contenedorIngresoCantidad = this.obtenerElementoHtmlId("ingresoCantProd" + codProducto);
    let HTMLBotonCancelarCompra = this.obtenerHtmlBotonCancelarCompra(codProducto);
    this.agregarElementoApagina("div", contenedorIngresoCantidad, HTMLBotonCancelarCompra, "");
    ///Creo el evento del boton para cancelar la compra
    this.crearEvento("buttonCancelarCompra" + codProducto, this.cancelarCompraProducto.bind(this), codProducto);
  }

  cancelarCompraProducto(codProducto) {
    ///quita los elementos de ingreso de cantidad
    this.quitarElementoApagina("ingresoCantProd" + codProducto);
    ///quitar producto de carrito de compra
    this.quitarDeCarritoCompra(codProducto);
    this.visualizarCarrito();
  }

  quitarDeCarritoCompra(codProducto) {
    //obtengo el indice del producto en el array de carrito de compra, buscando el id
    let indiceElemento = carritoDeCompra.indexOf(carritoDeCompra.find((producto) => producto.id === codProducto));
    //quito el elemento
    carritoDeCompra.splice(indiceElemento, 1);
  }

  ingresarDatosPago() {
    //verifico que la lista de compras no este vacia
    if (carritoDeCompra.length != 0) {
      let htmlFormPago = this.obtenerHtmlFormPago();
      ///
      let formularioPago;
      ////añado el formulario
      this.agregarElementoApagina("form", seccionFormPago, htmlFormPago, "", "formPago");
      formularioPago = document.getElementById("formPago");
      ///creo el evento submit
      this.crearEventoSubmitFormPago(formularioPago, this.confirmarCompra.bind(this));
      ///desactivo por el momento el boton de comprar
      this.inhabilitarBotonCompra(true);
    }
  }

  crearEventoSubmitFormPago(elemento, accion) {
    elemento.addEventListener("submit", accion);
  }

  verificarDatosForm(formulario) {
    if (formulario.children[1].value == "" || formulario.children[3].value == "" || formulario.children[5].value == "") {
      return false;
    } else {
      return true;
    }
  }

  mostrarMensajeForm() {}

  confirmarCompra(e) {
    e.preventDefault();
    //Obtenemos el elemento desde el cual se disparó el evento
    let formulario = e.target;
    if (!this.verificarDatosForm(formulario)) {
      ///aviso que los valores ingresados son erroneos por el label de aviso del formulario
      this.setValorLabel("avisoForm", "Datos Ingresados no validos");
    } else {
      ///crea el objeto tarjeta
      const tarjeta = crearObjetoTarjeta(formulario);
      ////realiza el pago por tarjeta, devuelve true si pudo, sino false
      if (!realizarPagoTarjeta(tarjeta)) {
        this.setValorLabel("avisoForm", "No se pudo realizar el pago");
      } else {
        const venta = crearObjetoVenta(tarjeta.nroTarjeta);
        ///una vez registrada la compra hago el descuento de stock al/los producto/s correspondiente/
        this.descontarStock();
        /////informo que la venta se realizo exitosamente
        this.visualizarListaDecompra(venta);
        ///reseteo el estado visual de la pagina y vacio la lista de compras pendientes
        this.resetearEstadoCompra();
        ///guardo los cambios de stock a la copia en local
        guardarLocal("productos", JSON.stringify(arrayProd));
        ///registro la venta en el array de ventas y en local
        agregarVenta(venta);
      }
    }
  }

  resetearEstadoCompra() {
    ///quito los ingresos de cantidades de todos los productos del carrito de compras
    this.quitarIngresoCantTodos();
    ///quito el form de pago
    this.quitarFormPago();
    ////vacio el array de compra
    vaciarArrayCompra();
    this.visualizarCarrito();
    ///reactivo el boton de comprar
    this.inhabilitarBotonCompra(false);
  }

  quitarIngresoCantTodos() {
    for (const prod of carritoDeCompra) {
      this.quitarElementoApagina("ingresoCantProd" + prod.id);
    }
  }

  quitarFormPago() {
    this.quitarElementoApagina("formPago");
  }
}

/////////////////////A partir de aqui se ejecuta el codigo al cargarse la pagina

////////////Creo mi objeto que va a gestionar la pagina
let MiPageHandler = new PageHandler();

///Guardo el array de productos en local, luego de ejecutarse una vez, se puede dejar comentada la linea
guardarLocal("productos", JSON.stringify(productos));

///Obtiene el array de productos guardados en local y lo asigna a la variable de productos del script
obtenerProductosLocal();
///Obtiene las ventas hechas,
obtenerVentasLocal();
////visualizo todos los productos que estan en el array en la pagina web
MiPageHandler.visualizarProd(arrayProd);
///creo el evento de click para el boton de compra
MiPageHandler.crearEventoBoton("botonCompra");
///creo el evento de click para el boton de busqueda
MiPageHandler.crearEventoBoton("botonBuscar");
