//array de todos los productos
let arrayProd;
//array de todas las ventas registradas
let arrayVentas = [];
//array de lista de productos que se venderan(lista de compras)
let carritoDeCompra = [];
////secciones/elementos de la pagina
let botonVaciarCarrito = document.getElementById("btnVaciarCarrito");
let totalCarrito = document.getElementById("totalCarrito");
let inputTextBuscador = document.getElementById("buscadorInput");
let seccionMuestrarioProd = document.getElementById("listaProductos");
let seccionCarritoCompra = document.getElementById("carritoCompra");
let seccionFormPago = document.getElementById("AreaformPago");
let botonCompra = document.getElementById("botonCompra");
const tablaCarrito = document.querySelector("#lista-carrito tbody");
//let botonBuscar = document.getElementById("botonBuscar");
let formularioPago = document.getElementById("formPago");

///Obtiene el array de productos guardados en local y lo asigna a la variable de productos del script
obtenerProductosJson();
///Obtiene las ventas hechas,
obtenerVentasLocal();
/////Declaro listeners///
crearListeners();

function crearListeners() {
  botonVaciarCarrito.addEventListener("click", vaciarCarritoCompra);
  tablaCarrito.addEventListener("click", opcionesItemCarrito);

  seccionMuestrarioProd.addEventListener("click", agregarProducto);
  botonCompra.addEventListener("click", mostrarFormPago);
  botonBuscar.addEventListener("click", buscarProductoNombre);
  formularioPago.addEventListener("submit", confirmarCompra);
  formularioPago.addEventListener("reset", () => {
    ocultarElemento(formularioPago);
    mostrarElemento(botonCompra);
  });
}

//////Declaracion de funciones//////
//////////funciones de uso de storage,local
async function obtenerProductosJson() {
  const resp = await fetch("js/productos.json");
  const data = await resp.json();
  arrayProd = data;
}

function opcionesItemCarrito(e) {
  e.preventDefault();
  ///Compruebo que el boton de compra fue quien llamo al evento
  if (e.target.classList.contains("restar-producto")) {
    restarProducto(e.target.parentElement.parentElement);
  }

  if (e.target.classList.contains("sumar-producto")) {
    sumarProducto(e.target.parentElement.parentElement);
  }

  if (e.target.classList.contains("quitar-producto")) {
    cancelarCompraProducto(e.target.parentElement.parentElement);
  }
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

function setTotalCarrito() {
  totalCarrito.innerText =
    "Total: $" + carritoDeCompra.reduce((acumulador, producto) => acumulador + producto.precio * producto.cantidad, 0);
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

function sumarProducto(itemCarrito) {
  let codProducto = itemCarrito.getAttribute("id");
  ///selecciona el producto por el codigo
  let productoVta = arrayProd[codProducto];
  let indiceProdCarrito = carritoDeCompra.indexOf(carritoDeCompra.find((producto) => producto.id == codProducto));
  ///verifico si el stock cubre la cantidad pedida mas la cantidad ya pedida en el carrito
  if (!verificarStock(productoVta, parseInt(carritoDeCompra[indiceProdCarrito].cantidad) + 1)) {
    msgAviso("fail", "El Stock no alcanza a cubrir lo pedido");
  } else {
    ////Añado la cantidad a la lista de productos a comprar
    carritoDeCompra[indiceProdCarrito].cantidad = parseInt(carritoDeCompra[indiceProdCarrito].cantidad) + 1;
    //Modifico la cantidad del item del carrito mostrado en pantalla
    actualizarCarrito(indiceProdCarrito, carritoDeCompra[indiceProdCarrito].id);
    setTotalCarrito();

    //aviso que se agrego al carrito de compras
    msgAviso("success", "Cantidad del producto añadido al carrito");
  }
}

function restarProducto(itemCarrito) {
  let codProducto = itemCarrito.getAttribute("id");
  ///selecciona el producto por el codigo
  let productoVta = arrayProd[codProducto];
  let indiceProdCarrito = carritoDeCompra.indexOf(carritoDeCompra.find((producto) => producto.id == codProducto));
  ///verifico si el stock cubre la cantidad pedida mas la cantidad ya pedida en el carrito
  if (parseInt(carritoDeCompra[indiceProdCarrito].cantidad) - 1 == 0) {
    msgAviso("fail", "Deberia eliminar el producto del carrito");
  } else {
    ////Añado la cantidad a la lista de productos a comprar
    carritoDeCompra[indiceProdCarrito].cantidad = parseInt(carritoDeCompra[indiceProdCarrito].cantidad) - 1;
    //Modifico la cantidad del item del carrito mostrado en pantalla
    actualizarCarrito(indiceProdCarrito, carritoDeCompra[indiceProdCarrito].id);
    setTotalCarrito();

    //aviso que se agrego al carrito de compras
    msgAviso("success", "Cantidad del producto quitado del carrito");
  }
}

function agregarProducto(e) {
  e.preventDefault();
  if (e.target.classList.contains("articulo__boton-compra")) {
    ///obtengo el producto que se muestra en la pagina
    const productoSelecionado = e.target.parentElement;
    //obtengo el id del producto, es el numero del id
    let codProducto = productoSelecionado.getAttribute("id").slice(4);
    ///selecciona el producto por el codigo
    let productoVta = arrayProd[codProducto];
    ///verifico si el producto ya se encuentra en el carrito
    let indiceProdCarrito = carritoDeCompra.indexOf(carritoDeCompra.find((producto) => producto.id == codProducto));
    if (indiceProdCarrito != -1) {
      msgAviso("fail", "El producto ya esta en el carrito");
    } else {
      ///verifico que el stock actual del producto alcance a cubrir la cantidad pedida
      if (!verificarStock(productoVta, 1)) {
        msgAviso("fail", "Stock insuficiente");
      } else {
        ////Añado el producto a la lista de productos a comprar
        agregarAlCarrito(productoVta, 1);
        setTotalCarrito();
        //aviso que se agrego al carrito de compras
        msgAviso("success", "Producto añadido al carrito");
      }
    }
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

function obtenerHtmlfilaTabla({ nombre, precio, cantidad }) {
  return `      
  <td>${nombre}</td>
  <td>$${precio}</td>
  <td>
  <a href="javascript:void(0)" class="restar-producto" > - </a>
  ${cantidad}
  <a href="javascript:void(0)" class="sumar-producto" > + </a>
  </td>
  <td>$${precio * cantidad}</td>
  <td><a href="javascript:void(0)" class="quitar-producto"> X </a></td>
`;
}

function actualizarCarrito(indCarrito, idProd) {
  //obtengo el item del carrito mostrado en pantalla
  let itemCarrito = document.getElementById(idProd);
  //actualizo la nueva cantidad

  itemCarrito.innerHTML = obtenerHtmlfilaTabla(carritoDeCompra[indCarrito]);
}

function agregarItemAlCarrito(itemCompra) {
  const row = document.createElement("tr");
  row.innerHTML = obtenerHtmlfilaTabla(itemCompra);
  row.setAttribute("id", itemCompra.id);
  tablaCarrito.appendChild(row);
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
  while (tablaCarrito.firstChild) {
    tablaCarrito.removeChild(tablaCarrito.firstChild);
  }
  setTotalCarrito();
}
function cancelarCompraProducto(itemCarrito) {
  //verifico que un item del carrito llamo al evento
  let codProducto = itemCarrito.getAttribute("id");
  quitarDeCarritoCompra(codProducto);
  quitarElementoApagina(itemCarrito);
  setTotalCarrito();
  ///aviso que se quito del carrito
  msgAviso("success", "Se retiro de carrito");
}
function quitarDeCarritoCompra(codProducto) {
  //let indiceElemento = carritoDeCompra.indexOf(carritoDeCompra.find((producto) => producto.id === codProducto));

  carritoDeCompra = carritoDeCompra.filter((producto) => producto.id != codProducto);
}

function buscarProductoNombre() {
  let codProdMuestrario;
  let str = inputTextBuscador.value;
  const resultado = arrayProd.filter((el) => el.nombre.toLowerCase().includes(str.toLowerCase()));

  for (const hijo of seccionMuestrarioProd.children) {
    let codProdMuestrario = hijo.getAttribute("id").slice(4);
    if (resultado.find((producto) => producto.id == codProdMuestrario) == undefined) {
      ocultarElemento(hijo);
    }
  }
}
