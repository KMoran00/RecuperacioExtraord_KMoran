document.addEventListener("DOMContentLoaded", main);

let productos = [];
let productosFiltrados = [];
let modoEdicion = false;

// ─────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────
async function main() {
    await cargarDatos();
    cargarCategorias();
    productosFiltrados = [...productos];
    pintarProductos(productosFiltrados);

    document.getElementById("btnEnviar").addEventListener("click", validar, false); //!IMPORTANTE
    document.getElementById("btnCancelar").addEventListener("click", cancelarEdicion, false);
    document.getElementById("btnRelevancia").addEventListener("click", ordenarRelevancia);
    document.getElementById("btnPrecioAlto").addEventListener("click", ordenarPrecioAlto);
    document.getElementById("btnPrecioBajo").addEventListener("click", ordenarPrecioBajo);
    document.getElementById("btnBuscar").addEventListener("click", buscar);
    document.getElementById("filtroCat").addEventListener("change", filtrarCategoria);

    // Autocomplete jQuery UI
    let sugerencias = [];
    productos.forEach(function (p) {
        if (!sugerencias.includes(p.nombre))    sugerencias.push(p.nombre);
        if (!sugerencias.includes(p.categoria)) sugerencias.push(p.categoria);
    });
    $("#buscador").autocomplete({
        source: sugerencias
    });

    document.getElementById("formulario-producto").addEventListener("submit", function (e) {
        e.preventDefault();
        if (modoEdicion) {
            actualizarProducto();
        } else {
            agregarProducto();
        }
        this.reset();
        cancelarEdicion();
    });
}

// ─────────────────────────────────────────────
//  LOCALSTORAGE
// ─────────────────────────────────────────────
async function cargarDatos() {
    let datosGuardados = JSON.parse(localStorage.getItem("catalogo"));
    if (datosGuardados && datosGuardados.length > 0) {
        productos = datosGuardados;
    } else {
        let respuesta = await fetch("js/bbdd.json");
        let json      = await respuesta.json();
        productos     = json.productos;
        guardarStorage();
    }
}

function guardarStorage() {
    localStorage.setItem("catalogo", JSON.stringify(productos));
}

// ─────────────────────────────────────────────
//  RENDER
// ─────────────────────────────────────────────
function pintarProductos(array) {
    let listado = document.getElementById("listado");

    while (listado.firstChild) {
        listado.removeChild(listado.firstChild);
    }

    if (array.length === 0) {
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        td.setAttribute("colspan", "8");
        td.classList.add("text-center", "text-muted");
        td.textContent = "No s'han trobat productes.";
        tr.appendChild(td);
        listado.appendChild(tr);
        return;
    }

    array.forEach(function (producto) {

        let tr = document.createElement("tr");

        // Checkbox
        let tdCheck = document.createElement("td");
        let check = document.createElement("input");
        check.type = "checkbox";
        tdCheck.appendChild(check);
        tr.appendChild(tdCheck);

        // ID
        let tdId = document.createElement("td");
        let strong = document.createElement("strong");
        strong.textContent = producto.id;
        tdId.appendChild(strong);
        tr.appendChild(tdId);

        // Nom
        let tdNom = document.createElement("td");
        tdNom.textContent = producto.nombre;
        tr.appendChild(tdNom);

        // Categoria (badge cian)
        let tdCat = document.createElement("td");
        let badgeCat = document.createElement("span");
        badgeCat.classList.add("badge");
        badgeCat.style.background = "#17c1e8";
        badgeCat.textContent = producto.categoria;
        tdCat.appendChild(badgeCat);
        tr.appendChild(tdCat);

        // Preu (badge groc)
        let tdPreu = document.createElement("td");
        let badgePreu = document.createElement("span");
        badgePreu.classList.add("badge");
        badgePreu.style.background = "#f0ad00";
        badgePreu.textContent = producto.precio + " €";
        tdPreu.appendChild(badgePreu);
        tr.appendChild(tdPreu);

        // Stock
        let tdStock = document.createElement("td");
        tdStock.textContent = producto.stock;
        tr.appendChild(tdStock);

        // Estat (badge verd)
        let tdEstat = document.createElement("td");
        let badgeEstat = document.createElement("span");
        badgeEstat.classList.add("badge", "bg-success");
        badgeEstat.textContent = producto.stock > 0 ? "Actiu" : "Sense stock";
        tdEstat.appendChild(badgeEstat);
        tr.appendChild(tdEstat);

        // Accions
        let tdAccions = document.createElement("td");

        let btnDetalle = document.createElement("a");
        btnDetalle.classList.add("btn", "btn-sm", "btn-outline-info", "me-1");
        btnDetalle.href = "detalle.html?id=" + producto.id;
        let iconDetalle = document.createElement("i");
        iconDetalle.classList.add("bi", "bi-eye");
        btnDetalle.appendChild(iconDetalle);
        tdAccions.appendChild(btnDetalle);

        let btnEditar = document.createElement("button");
        btnEditar.classList.add("btn", "btn-sm", "btn-outline-warning", "me-1");
        let iconEditar = document.createElement("i");
        iconEditar.classList.add("bi", "bi-pencil");
        btnEditar.appendChild(iconEditar);
        btnEditar.addEventListener("click", function () {
            cargarFormularioEdicion(producto.id);
        });
        tdAccions.appendChild(btnEditar);

        let btnEliminar = document.createElement("button");
        btnEliminar.classList.add("btn", "btn-sm", "btn-outline-danger");
        let iconEliminar = document.createElement("i");
        iconEliminar.classList.add("bi", "bi-trash");
        btnEliminar.appendChild(iconEliminar);
        btnEliminar.addEventListener("click", function () {
            eliminarProducto(producto.id);
        });
        tdAccions.appendChild(btnEliminar);

        tr.appendChild(tdAccions);
        listado.appendChild(tr);
    });
}

// ─────────────────────────────────────────────
//  CREATE
// ─────────────────────────────────────────────
function agregarProducto() {
    let nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;

    let nuevo = {
        id:          nuevoId,
        nombre:      document.getElementById("nombre").value,
        categoria:   document.getElementById("categoria").value,
        precio:      parseFloat(document.getElementById("precio").value),
        stock:       parseInt(document.getElementById("stock").value),
        descripcion: document.getElementById("descripcion").value,
        img:         document.getElementById("img").value
    };

    productos.push(nuevo);
    guardarStorage();
    productosFiltrados = [...productos];
    cargarCategorias();
    pintarProductos(productosFiltrados);
}

// ─────────────────────────────────────────────
//  UPDATE
// ─────────────────────────────────────────────
function cargarFormularioEdicion(id) {
    let producto = productos.find(p => p.id === id);
    if (!producto) return;

    modoEdicion = true;
    document.getElementById("productoId").value    = producto.id;
    document.getElementById("nombre").value        = producto.nombre;
    document.getElementById("categoria").value     = producto.categoria;
    document.getElementById("precio").value        = producto.precio;
    document.getElementById("stock").value         = producto.stock;
    document.getElementById("descripcion").value   = producto.descripcion;
    document.getElementById("img").value           = producto.img;

    document.getElementById("tituloFormulario").textContent = "Editar producto";
    document.getElementById("btnEnviar").textContent        = "Actualizar";

    document.getElementById("formulario-producto").scrollIntoView({ behavior: "smooth" });
}

function actualizarProducto() {
    let id = parseInt(document.getElementById("productoId").value);
    let index = productos.findIndex(p => p.id === id);
    if (index === -1) return;

    productos[index].nombre      = document.getElementById("nombre").value;
    productos[index].categoria   = document.getElementById("categoria").value;
    productos[index].precio      = parseFloat(document.getElementById("precio").value);
    productos[index].stock       = parseInt(document.getElementById("stock").value);
    productos[index].descripcion = document.getElementById("descripcion").value;
    productos[index].img         = document.getElementById("img").value;

    guardarStorage();
    productosFiltrados = [...productos];
    cargarCategorias();
    pintarProductos(productosFiltrados);
}

function cancelarEdicion() {
    modoEdicion = false;
    document.getElementById("productoId").value             = "";
    document.getElementById("tituloFormulario").textContent = "Añadir producto";
    document.getElementById("btnEnviar").textContent        = "Añadir";
    document.getElementById("formulario-producto").reset();
    esborrarError();
}

// ─────────────────────────────────────────────
//  DELETE
// ─────────────────────────────────────────────
function eliminarProducto(id) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

    let index = productos.findIndex(p => p.id === id);
    if (index === -1) return;

    productos.splice(index, 1);
    guardarStorage();
    productosFiltrados = [...productos];
    cargarCategorias();
    pintarProductos(productosFiltrados);
}

// ─────────────────────────────────────────────
//  BÚSQUEDA Y FILTRO
// ─────────────────────────────────────────────
function buscar() {
    let texto = document.getElementById("buscador").value.toLowerCase();
    productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.categoria.toLowerCase().includes(texto)
    );
    pintarProductos(productosFiltrados);
}

function filtrarCategoria() {
    let cat = document.getElementById("filtroCat").value.toLowerCase();
    if (cat === "") {
        productosFiltrados = [...productos];
    } else {
        productosFiltrados = productos.filter(p =>
            p.categoria.toLowerCase() === cat
        );
    }
    pintarProductos(productosFiltrados);
}

function cargarCategorias() {
    let select = document.getElementById("filtroCat");

    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }

    let optTodas = document.createElement("option");
    optTodas.value = "";
    optTodas.textContent = "Todas";
    select.appendChild(optTodas);

    let categorias = [];
    productos.forEach(function (p) {
        if (!categorias.includes(p.categoria)) {
            categorias.push(p.categoria);
        }
    });

    categorias.sort();
    categorias.forEach(function (cat) {
        let opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

// ─────────────────────────────────────────────
//  ORDENACIÓN
// ─────────────────────────────────────────────
function ordenarRelevancia() {
    productosFiltrados = [...productos];
    pintarProductos(productosFiltrados);
}

function ordenarPrecioAlto() {
    productosFiltrados = [...productosFiltrados].sort((a, b) => b.precio - a.precio);
    pintarProductos(productosFiltrados);
}

function ordenarPrecioBajo() {
    productosFiltrados = [...productosFiltrados].sort((a, b) => a.precio - b.precio);
    pintarProductos(productosFiltrados);
}

// ─────────────────────────────────────────────
//  VALIDACIÓN (checkValidity)
// ─────────────────────────────────────────────
function validarNombre() {
    let element = document.getElementById("nombre");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "El nom és obligatori. ");
        }
        if (element.validity.patternMismatch) {
            error(element, "El nom ha de tindre entre 3 i 60 caràcters. ");
        }
        return false;
    }
    return true;
}

function validarCategoria() {
    let element = document.getElementById("categoria");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "La categoria és obligatoria. ");
        }
        if (element.validity.patternMismatch) {
            error(element, "La categoria ha de tindre entre 2 i 40 caràcters. ");
        }
        return false;
    }
    return true;
}

function validarPrecio() {
    let element = document.getElementById("precio");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "El preu és obligatori. ");
        }
        if (element.validity.patternMismatch) {
            error(element, "El preu ha de ser un número positiu (ex: 199.99). ");
        }
        return false;
    }
    return true;
}

function validarStock() {
    let element = document.getElementById("stock");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "L'stock és obligatori. ");
        }
        if (element.validity.patternMismatch) {
            error(element, "L'stock ha de ser un número enter positiu. ");
        }
        return false;
    }
    return true;
}

function validarDescripcion() {
    let element = document.getElementById("descripcion");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "La descripció és obligatoria. ");
        }
        return false;
    }
    return true;
}

function validarImg() {
    let element = document.getElementById("img");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "La imatge és obligatoria. ");
        }
        if (element.validity.patternMismatch) {
            error(element, "La imatge ha d'acabar en .jpg, .png o .webp. ");
        }
        return false;
    }
    return true;
}

function validar(e) {
    esborrarError();
    e.preventDefault();//!IMPORTANTE
    if (validarNombre() && validarCategoria() && validarPrecio() && validarStock() && validarDescripcion() && validarImg() && confirm("Confirma si vols guardar el producte")) {
        document.getElementById("formulario-producto").requestSubmit(); //!IMPORTANTE
        return true;
    } else {
        return false;
    }
}

function error(element, missatge) {
    let miss = document.createTextNode(missatge);
    document.getElementById("errorMensaje").appendChild(miss);
    element.classList.add("text-danger");
    element.focus();
}

function esborrarError() {
    document.getElementById("errorMensaje").textContent = "";
    let formulari = document.forms[0];
    for (let i = 0; i < formulari.elements.length; i++) {
        formulari.elements[i].classList.remove("text-danger");
    }
}