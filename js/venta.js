//array de todos los productos
let arrayProd;
//array de todas las ventas registradas
let arrayVentas = [];
//array de lista de productos que se venderan(lista de compras)
const carritoDeCompra = [];

////secciones/elementos de la pagina donde se crearan/borraran/modificaran elementos
let seccionMuestrarioProd = document.getElementById("listaProductos");
let seccionCarritoCompra = document.getElementById("carritoCompra");
let seccionFormPago = document.getElementById("AreaformPago");
let botonCompra = document.getElementById("botonCompra");
//let botonBuscar = document.getElementById("botonBuscar");
let formularioPago = document.getElementById("formPago");

///Obtiene el array de productos guardados en local y lo asigna a la variable de productos del script
obtenerProductosJson();
///Obtiene las ventas hechas,
obtenerVentasLocal();
/////Declaro listeners///
crearListeners();

function crearListeners() {
  seccionMuestrarioProd.addEventListener("click", mostrarCajaIngresoCantidad);
  botonCompra.addEventListener("click", mostrarFormPago);
  // botonBuscar.addEventListener("click", buscarProductoNombre);
  formularioPago.addEventListener("submit", confirmarCompra);
  formularioPago.addEventListener("reset", () => {
    ocultarElemento(formularioPago);
    mostrarElemento(botonCompra);
  });
  let botonesAgregar = document.getElementsByClassName("botonAGregarProducto");
  for (const boton of botonesAgregar) {
    boton.addEventListener("click", confirmarProducto);
  }
  seccionCarritoCompra.addEventListener("click", cancelarCompraProducto);
}

//////Declaracion de funciones//////
//////////funciones de uso de storage,local
async function obtenerProductosJson() {
  const resp = await fetch("js/productos.json");
  const data = await resp.json();
  arrayProd = data;
}
function obtenerVentasLocal() {
  //uso el operador logico or para simplificar la asignacion del array de ventas o la inicializacion del mismo
  arrayVentas = JSON.parse(localStorage.getItem("ventas")) || [];
}
function guardarLocal(clave, valor) {
  localStorage.setItem(clave, valor);
}
function agregarVenta(venta) {
  arrayVentas.push(venta);
  guardarLocal("ventas", JSON.stringify(arrayVentas));
}

///funciones////////
function obtenerFechaActual() {
  return new Date().toLocaleString("en-GB", { hour12: false });
}

function realizarPagoTarjeta(tarjeta) {
  ////aqui se realizara el pago por tarjeta, una comunicacion con el sistema del banco
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

function descontarStock() {
  for (const producto of carritoDeCompra) {
    arrayProd[producto.id].stock -= producto.cantidad;
  }
}

function verificarStock({ stock: productoStock }, cantidad) {
  return productoStock >= cantidad ? true : false;
}

function validarDatos(cantidad) {
  return cantidad > 0 ? true : false;
}

function msgAviso(tipo, msg) {
  let fondo = tipo == "success" ? "linear-gradient(to right, #00b09b, #96c93d)" : "linear-gradient(to right, #db0b0b,#990f0f)";
  Toastify({
    text: msg,
    duration: 3500,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
      background: fondo,
      width: "300px",
    },
  }).showToast();
}

function msgCompraExitosa() {
  Swal.fire({
    title: "Se registro su compra",
    text: "Puede pasar a retirar su compra por cualquiera de nuestras sucursales ",
    icon: "success",
    confirmButtonText: "OK",
  });
}

function quitarElementoApagina(elemento) {
  elemento.remove();
}
function mostrarElemento(elemento) {
  elemento.classList.remove("oculto");
  elemento.classList.add("visible");
}
function ocultarElemento(elemento) {
  elemento.classList.remove("visible");
  elemento.classList.add("oculto");
}

function mostrarCajaIngresoCantidad(e) {
  e.preventDefault();
  ///Compruebo que el boton de compra fue quien llamo al evento
  if (e.target.classList.contains("articulo__boton-compra")) {
    //Selecciono el producto mostrado en la pagina
    const productoSelecionado = e.target.parentElement;
    ///busco la caja que contiene al inputbox y al boton para ingresar cantidad
    let elemIngresarCant = productoSelecionado.querySelector(".cantidadCompra");
    mostrarElemento(elemIngresarCant);
  }
}

function confirmarProducto(e) {
  e.preventDefault();
  ///obtengo el producto que se muestra en la pagina
  const productoSelecionado = e.target.parentElement.parentElement;
  //obtengo el id del producto, es el numero del id
  let codProducto = productoSelecionado.getAttribute("id").slice(4);
  //obtengo el input text de ingreso de cantidad
  let inputCantidad = productoSelecionado.querySelector('input[type="text"]');
  let cantidad = inputCantidad.value;

  ///selecciona el producto por el codigo
  let productoVta = arrayProd[codProducto];
  //verifico que lo ingresado sea un numero valido
  if (!validarDatos(cantidad)) {
    msgAviso("fail", "Ingreso erroneo");
  } else {
    ///obtengo la caja de ingreso de cantidad, para ocultarla luego
    let elemIngreso = productoSelecionado.querySelector(".cantidadCompra");

    ///verifico si el producto ya se encuentra en el carrito
    let indiceProdCarrito = carritoDeCompra.indexOf(carritoDeCompra.find((producto) => producto.id == codProducto));
    if (indiceProdCarrito != -1) {
      ///verifico si el stock cubre la cantidad pedida mas la cantidad ya pedida en el carrito
      if (!verificarStock(productoVta, parseInt(cantidad) + parseInt(carritoDeCompra[indiceProdCarrito].cantidad))) {
        msgAviso("fail", "El Stock no alcanza a cubrir lo pedido");
      } else {
        ////Añado la cantidad a la lista de productos a comprar
        carritoDeCompra[indiceProdCarrito].cantidad = parseInt(carritoDeCompra[indiceProdCarrito].cantidad) + parseInt(cantidad);
        //Modifico la cantidad del item del carrito mostrado en pantalla
        actualizarCarrito(indiceProdCarrito, carritoDeCompra[indiceProdCarrito].id);
        //aviso que se agrego al carrito de compras
        msgAviso("success", "Cantidad del producto añadido al carrito");
      }
    } else {
      ///verifico que el stock actual del producto alcance a cubrir la cantidad pedida
      if (!verificarStock(productoVta, cantidad)) {
        msgAviso("fail", "Stock insuficiente");
      } else {
        ////Añado el producto a la lista de productos a comprar
        agregarAlCarrito(productoVta, cantidad);
        //aviso que se agrego al carrito de compras
        msgAviso("success", "Producto añadido al carrito");
      }
    }
    //reseteo el input y oculto la caja de ingreso de cantidad
    inputCantidad.value = "";
    ocultarElemento(elemIngreso);
  }
}

function agregarAlCarrito({ id: prodId, nombre: prodNombre, precio: prodPrecio }, cantidad) {
  const itemCompra = {
    id: prodId,
    nombre: prodNombre,
    precio: prodPrecio,
    cantidad: cantidad,
  };
  carritoDeCompra.push(itemCompra);
  agregarItemAlCarrito(itemCompra);
}

function actualizarCarrito(indCarrito, idProd) {
  //obtengo el item del carrito mostrado en pantalla
  let itemCarrito = document.getElementById(idProd);
  //actualizo la nueva cantidad
  itemCarrito.textContent =
    carritoDeCompra[indCarrito].nombre +
    ", $" +
    carritoDeCompra[indCarrito].precio +
    " cantidad:" +
    carritoDeCompra[indCarrito].cantidad +
    "(X)";
}

function agregarItemAlCarrito({ id, nombre, precio, cantidad }) {
  let itemCarrito = document.createElement("a");
  itemCarrito.textContent = nombre + ", $" + precio + " cantidad:" + cantidad + "(X)";
  itemCarrito.setAttribute("href", "javascript:void(0);");
  itemCarrito.setAttribute("id", id);
  itemCarrito.className = "borrarProducto";
  seccionCarritoCompra.appendChild(itemCarrito);
}

function mostrarFormPago() {
  //verifico que la lista de compras no este vacia
  if (carritoDeCompra.length != 0) {
    mostrarElemento(formularioPago);
    ///oculto por el momento el boton de comprar, que muestra el formulario de pago
    ocultarElemento(botonCompra);
  } else {
    msgAviso("fail", "carrito vacio");
  }
}
function verificarDatosForm(formulario) {
  return formulario.children[1].value == "" || formulario.children[3].value == "" || formulario.children[5].value == ""
    ? false
    : true;
}
function confirmarCompra(e) {
  e.preventDefault();
  //Obtenemos el elemento desde el cual se disparó el evento
  let formulario = e.target;
  if (!verificarDatosForm(formulario)) {
    ///aviso que los valores ingresados son erroneos
    msgAviso("fail", "Datos Ingresados no validos");
  } else {
    ///crea el objeto tarjeta
    const tarjeta = crearObjetoTarjeta(formulario);
    ////realiza el pago por tarjeta, devuelve true si pudo, sino false
    if (!realizarPagoTarjeta(tarjeta)) {
      msgAviso("fail", "No se pudo realizar el pago");
    } else {
      const venta = crearObjetoVenta(tarjeta.nroTarjeta);
      ///una vez registrada la compra hago el descuento de stock al/los producto/s correspondiente/
      descontarStock();
      /////informo que la venta se realizo exitosamente
      msgCompraExitosa();
      ///reseteo el estado visual de la pagina y vacio la lista de compras pendientes
      resetearEstadoCompra();
      ///registro la venta en el array de ventas y en local
      agregarVenta(venta);
    }
  }
}
function resetearEstadoCompra() {
  ///oculto el form de pago
  formularioPago.reset();
  ocultarElemento(formularioPago);
  ////vacio el carrito
  vaciarCarritoCompra();
  ///muestro de nuevo el boton de comprar
  mostrarElemento(botonCompra);
}
function vaciarCarritoCompra() {
  while (carritoDeCompra.length > 0) carritoDeCompra.pop();
  while (seccionCarritoCompra.firstChild) {
    seccionCarritoCompra.removeChild(seccionCarritoCompra.firstChild);
  }
}
function cancelarCompraProducto(e) {
  e.preventDefault;
  let itemCarrito = e.target;
  //verifico que un item del carrito llamo al evento
  if (itemCarrito.classList.contains("borrarProducto")) {
    let codProducto = itemCarrito.getAttribute("id");
    quitarDeCarritoCompra(codProducto);
    quitarElementoApagina(itemCarrito);
    ///aviso que se quito del carrito
    msgAviso("success", "Se retiro de carrito");
  }
}
function quitarDeCarritoCompra(codProducto) {
  //obtengo el indice del producto en el array de carrito de compra, buscando el id
  let indiceElemento = carritoDeCompra.indexOf(carritoDeCompra.find((producto) => producto.id === codProducto));
  //quito el elemento
  carritoDeCompra.splice(indiceElemento, 1);
}

/*
 function buscarProductoNombre() {
    //vacio el muestrario para luego llenarlo del resultado de busqueda
    seccionMuestrarioProd.innerHTML = "";
    let str = this.obtenerValorInputText("buscadorInput");
    const resultado = arrayProd.filter((el) => el.nombre.toLowerCase().includes(str.toLowerCase()));
    //visualizo el array de productos luego del filtro
    this.visualizarProd(resultado);
  }
*/
