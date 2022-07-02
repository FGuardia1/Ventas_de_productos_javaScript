//array de todos los productos
let arrayProd;
//array de todas las ventas registradas
let arrayVentas = [];
//array de lista de productos que se venderan(lista de compras)
let carritoDeCompra = [];
////secciones/elementos de la pagina
let tablaCarrito = document.querySelector("#lista-carrito tbody");
let botonVaciarCarrito = document.getElementById("btnVaciarCarrito");
let totalCarrito = document.getElementById("totalCarrito");
let carritoCant = document.getElementById("carritoCantidad");
let inputTextBuscador = document.getElementById("buscadorInput");
let botonBuscar = document.getElementById("botonBuscar");
let seccionMuestrarioProd = document.getElementById("listaProductos");
let botonCompra = document.getElementById("botonCompra");
let formularioPago = document.getElementById("formPago");
let contenedorFormulario = formularioPago.parentElement;

///Obtiene el array de productos guardados en un archivo json y lo asigna al array de productos del script
obtenerProductosJson();
///Obtiene las ventas anteriores hechas,
obtenerVentasLocal();
/////Declaro listeners///
crearListeners();

//////Declaracion de funciones//////
function crearListeners() {
  botonVaciarCarrito.addEventListener("click", vaciarCarritoCompra);
  tablaCarrito.addEventListener("click", opcionesItemCarrito);
  seccionMuestrarioProd.addEventListener("click", agregarProducto);
  botonCompra.addEventListener("click", mostrarFormPago);
  botonBuscar.addEventListener("click", buscarProductoNombre);
  formularioPago.addEventListener("submit", confirmarCompra);
  formularioPago.addEventListener("reset", () => {
    ocultarElemento(contenedorFormulario);
    mostrarElemento(botonCompra);
  });
}

//////////funciones de uso de fetch y storage
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
/////funciones////////
function obtenerFechaActual() {
  return new Date().toLocaleString("en-GB", { hour12: false });
}

function realizarPagoTarjeta(tarjeta) {
  ////aqui se realizaria el pago por tarjeta, una comunicacion con el sistema del banco
  return true;
}

function obtenerTotalCarrito() {
  return carritoDeCompra.reduce((acumulador, producto) => acumulador + producto.precio * producto.cantidad, 0);
}

function mostrarTotalCarrito() {
  totalCarrito.innerText = "Total: $" + obtenerTotalCarrito();
}
function visualizarCarrito() {
  for (const item of carritoDeCompra) {
    agregarItemAlCarrito(item);
  }
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
    total: obtenerTotalCarrito(),
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
}
function ocultarElemento(elemento) {
  elemento.classList.add("oculto");
}

function agregarProducto(e) {
  e.preventDefault();
  if (e.target.classList.contains("articulo__boton-compra")) {
    ///obtengo el producto que se muestra en la pagina
    const productoSeleccionado = e.target.parentElement;
    //obtengo el id del producto, es el numero del id
    let codProducto = productoSeleccionado.getAttribute("id").slice(4);
    ///selecciona el producto por el codigo
    let productoVta = arrayProd[codProducto];
    ///verifico si el producto ya se encuentra en el carrito
    if (carritoDeCompra.find((producto) => producto.id == codProducto) != undefined) {
      msgAviso("fail", "El producto ya esta en el carrito");
    } else {
      ///verifico que el stock actual del producto alcance a cubrir la cantidad pedida
      if (!verificarStock(productoVta, 1)) {
        msgAviso("fail", "Stock insuficiente");
      } else {
        ////Añado el producto a la lista de productos a comprar
        agregarAlCarrito(productoVta);
        //aviso que se agrego al carrito de compras
        msgAviso("success", "Producto añadido al carrito");
      }
    }
  }
}
function agregarAlCarrito({ id: prodId, nombre: prodNombre, precio: prodPrecio }) {
  const itemCompra = {
    id: prodId,
    nombre: prodNombre,
    precio: prodPrecio,
    cantidad: 1,
  };
  carritoDeCompra.push(itemCompra);
  ///muestro visualmente el prod en el carrito
  agregarItemAlCarrito(itemCompra);
}

function obtenerHtmlfilaTabla({ nombre, precio, cantidad }) {
  return `      
  <td>${nombre}</td>
  <td>$${precio}</td>
  <td >
  <div class="fila fila--notwrap">
   <a href="javascript:void(0)" class="opcionesItem restar-producto" > - </a>
  ${cantidad}
  <a href="javascript:void(0)" class="opcionesItem sumar-producto" > + </a>
  </div>
  </td>
  <td>$${precio * cantidad}</td>
  <td><a href="javascript:void(0)" class="opcionesItem quitar-producto"> X </a></td>
`;
}

function agregarItemAlCarrito(itemCompra) {
  const row = document.createElement("tr");
  row.innerHTML = obtenerHtmlfilaTabla(itemCompra);
  row.setAttribute("id", itemCompra.id);
  tablaCarrito.appendChild(row);
  carritoCant.textContent = carritoDeCompra.length;
  mostrarTotalCarrito();
}

function opcionesItemCarrito(e) {
  e.preventDefault();
  ///Compruebo que boton del item del carrito fue quien llamo al evento
  //en cada opcion envio como parametro al item del carrito
  if (e.target.classList.contains("restar-producto")) {
    sumarRestarProducto(e.target.parentElement.parentElement.parentElement, "restar");
  }

  if (e.target.classList.contains("sumar-producto")) {
    sumarRestarProducto(e.target.parentElement.parentElement.parentElement, "sumar");
  }

  if (e.target.classList.contains("quitar-producto")) {
    quitarDeCarrito(e.target.parentElement.parentElement);
  }
}

function sumarRestarProducto(itemCarrito, operacion) {
  let codProducto = itemCarrito.getAttribute("id");
  ///selecciona el producto por el codigo
  let productoVta = arrayProd[codProducto];
  //obtengo la posicion del producto en el carrito
  let indiceProdCarrito = carritoDeCompra.indexOf(carritoDeCompra.find((producto) => producto.id == codProducto));
  switch (operacion) {
    case "sumar":
      if (!verificarStock(productoVta, parseInt(carritoDeCompra[indiceProdCarrito].cantidad) + 1)) {
        msgAviso("fail", "El Stock no alcanza a cubrir lo pedido");
      } else {
        ////Actualizo la cantidad del producto en el carrito
        carritoDeCompra[indiceProdCarrito].cantidad = parseInt(carritoDeCompra[indiceProdCarrito].cantidad) + 1;
        //aviso que se agrego al carrito de compras
        msgAviso("success", "Cantidad del producto añadido al carrito");
      }
      break;

    case "restar":
      ///verifica que al restar producto la cantidad no sea 0
      if (parseInt(carritoDeCompra[indiceProdCarrito].cantidad) - 1 == 0) {
        msgAviso("fail", "Deberia eliminar el producto del carrito");
      } else {
        carritoDeCompra[indiceProdCarrito].cantidad = parseInt(carritoDeCompra[indiceProdCarrito].cantidad) - 1;
        msgAviso("success", "Cantidad del producto quitado del carrito");
      }
      break;
  }
  //Modifico la cantidad del item del carrito mostrado en pantalla
  actualizarItemCarrito(indiceProdCarrito);
}

function actualizarItemCarrito(indCarrito) {
  let prodCarrito = carritoDeCompra[indCarrito];
  //obtengo el item del carrito mostrado en pantalla
  let itemCarrito = document.getElementById(prodCarrito.id);
  //actualizo la nueva cantidad
  itemCarrito.innerHTML = obtenerHtmlfilaTabla(prodCarrito);
  mostrarTotalCarrito();
}

function quitarDeCarrito(itemCarrito) {
  let codProducto = itemCarrito.getAttribute("id");
  quitarDeCarritoCompra(codProducto);
  quitarElementoApagina(itemCarrito);
  carritoCant.textContent = carritoDeCompra.length;
  mostrarTotalCarrito();
  ///aviso que se quito del carrito
  msgAviso("success", "Se retiro de carrito");
}

function quitarDeCarritoCompra(codProducto) {
  carritoDeCompra = carritoDeCompra.filter((producto) => producto.id != codProducto);
}

function mostrarFormPago() {
  //verifico que la lista de compras no este vacia
  if (carritoDeCompra.length != 0) {
    mostrarElemento(contenedorFormulario);
    ///oculto por el momento el boton de comprar, que muestra el formulario de pago
    ocultarElemento(botonCompra);
  } else {
    msgAviso("fail", "Carrito vacio");
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
      ///reseteo el estado visual de la pagina y vacio el carrito
      resetearEstadoCompra();
      ///registro la venta en el array de ventas y en local
      agregarVenta(venta);
    }
  }
}

function resetearEstadoCompra() {
  ///oculto el form de pago
  formularioPago.reset();
  ocultarElemento(contenedorFormulario);
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
  //se muestra la cantidad de productos en el carrito
  carritoCant.textContent = carritoDeCompra.length;
  mostrarTotalCarrito();
}

function buscarProductoNombre() {
  let nombreAbuscar = inputTextBuscador.value;
  ///hago un filtro de los productos que tienen de nombre el nombre buscado
  const resultado = arrayProd.filter((el) => el.nombre.toLowerCase().includes(nombreAbuscar.toLowerCase()));
  let productosMuestrario = seccionMuestrarioProd.children;
  ///se visibilizan todos los productos del muestrario
  for (const prod of productosMuestrario) {
    if (prod.classList.contains("oculto")) mostrarElemento(prod);
  }
  for (const prod of productosMuestrario) {
    let codProdMuestrario = prod.getAttribute("id").slice(4);
    if (resultado.find((producto) => producto.id == codProdMuestrario) == undefined) {
      ocultarElemento(prod);
    }
  }
}
