// Ruta al fichero JSON
const URL_JSON = './data/salas.json';

// Clave de localStorage  
const CLAVE_STORAGE = 'profesores';

// array principal
const PROP_PRINCIPAL = 'profesores';


let datos = [];     // JSON en memoria
let editando = false;

document.addEventListener('DOMContentLoaded', main);

async function main() {
    await cargarDatos();
    //cargarSelect();
    pintarTabla();

    // ── Listeners ──────────────────────────────────────────────
    document.getElementById('btn-form-profesor').addEventListener('click', validar, false);
    document.getElementById('btn-cancelar-edicion').addEventListener('click', cancelarEdicion, false);

    document.getElementById('form-profesor').addEventListener('submit', function (e) {
        e.preventDefault();
        if (editando) {
            actualizar();
        } else {
            agregar();
        }
        this.reset();
        editando = false;
        limpiarErrores();
        pintarTabla();
    });
}

/*
* LOCAL STOARAGE
*/

async function cargarDatos() {
    let guardado = JSON.parse(localStorage.getItem(CLAVE_STORAGE));

    if (guardado && guardado[PROP_PRINCIPAL]) {
        datos = guardado;
    } else if (guardado && guardado.length > 0) {
        datos = guardado;

    } else {
        let respuesta = await fetch(URL_JSON);
        let json = await respuesta.json();

        datos = json[PROP_PRINCIPAL];

        guardarStorage();
    }
}

function guardarStorage() {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(datos));
}


/*
* PINTAR
*/

function pintarTabla() {
    let tbody = document.getElementById('tabla-profesores');

    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

    let array = datos;

    if (!array || array.length === 0) {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.setAttribute('colspan', '5');
        td.textContent = 'No hi ha professors';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    array.forEach(function (item) {
        let tr = document.createElement('tr');


        //muestre el HTML
        let tdNombre = document.createElement('td');
        tdNombre.textContent = item.nombre;
        tr.appendChild(tdNombre);

        let tdDNI = document.createElement('td');
        tdDNI.textContent = item.dni;
        tr.appendChild(tdDNI);


        let tdTelefono = document.createElement('td');
        tdTelefono.textContent = item.telefono;
        tr.appendChild(tdTelefono);

        let tdCurso = document.createElement('td');
        tdCurso.textContent = item.curso;
        tr.appendChild(tdCurso);



        // Celda de acciones
        let tdAccions = document.createElement('td');

        let btnEditar = document.createElement('button');
        btnEditar.type = 'button';
        btnEditar.textContent = 'Editar';
        btnEditar.classList.add('btn', 'btn-warning', 'btn-sm', 'me-2');
        btnEditar.addEventListener('click', function () { cargarFormulario(item.id); });
        tdAccions.appendChild(btnEditar);

        let btnBorrar = document.createElement('button');
        btnBorrar.type = 'button';
        btnBorrar.textContent = 'Borrar';
        btnBorrar.classList.add('btn', 'btn-danger', 'btn-sm');
        btnBorrar.addEventListener('click', function () { borrar(item.id); });
        tdAccions.appendChild(btnBorrar);

        tr.appendChild(tdAccions);
        tbody.appendChild(tr);
    });
}



/*
* CRUD
*/
// ── AFEGIR ───────────────────────────────────────────────────────────
function agregar() {
    let nouId = datos.length > 0;

    let nou = {
        id: nouId,
        nombre: document.getElementById('p-nombre').value.trim(),
        dni: document.getElementById('p-dni').value,
        telefono: document.getElementById('p-telefono').value,
        curso: document.getElementById('p-curso').value,

    };

    datos.push(nou);
    guardarStorage();
}

function cargarFormulario(id) {
    let item = datos.find(x => x.id == id);
    if (!item) return;

    document.getElementById('p-nombre').value = item.nombre;
    document.getElementById('p-dni').value = item.dni;
    document.getElementById('p-telefono').value = item.telefono;
    document.getElementById('p-curso').value = item.curso;


    document.getElementById('form-profesor').dataset.editando = id;
    editando = true;
}

// ── ACTUALITZAR ───────────────────────────────────────────────────────────
function actualizar() {
    let id = document.getElementById('form-profesor').dataset.editando;
    let item = datos.find(x => x.id == id);
    if (!item) return;

    item.nombre = document.getElementById('p-nombre');
    item.dni = document.getElementById('p-dni').value;
    item.telefono = document.getElementById('p-telefono').value;
    item.curso = document.getElementById('p-curso').value;


    guardarStorage();
}

// ── ELIMIANR ───────────────────────────────────────────────────────────
function borrar(id) {
    if (!confirm('Confirma si vols eliminar')) return;

    let idx = datos.findIndex(x => x.id == id);
    if (idx === -1) return;

    datos.splice(idx, 1);
    guardarStorage();
    pintarTabla();
}

function cancelarEdicion() {
    editando = false;
    document.getElementById('form-profesor').reset(); 
    limpiarErrores();
}


/*
* VALIDACIONS
*/

function validar(e) {
    limpiarErrores();
    e.preventDefault(); 

    let ok = validarNombre() && validarDni() && validarTelefono() && validarSelectCurs();

    if (ok && confirm('Confirma si vols guardar')) {
        document.getElementById('form-profesor').requestSubmit();
    }
}

function validarNombre() {
    let el = document.getElementById('p-nombre');
    if (!el.checkValidity()) {
        if (el.validity.valueMissing) mostrarError(el, 'El nom és obligatori');
        if (el.validity.tooShort) mostrarError(el, 'Mínim 2 caràcters');
        if (el.validity.patternMismatch) mostrarError(el, 'Format incorrecte');
        return false;
    }
    return true;
}

function validarDni() {
    let el = document.getElementById('p-dni');
    if (!el.checkValidity()) {
        if (el.validity.valueMissing) mostrarError(el, 'El dni és obligatori');
        if (el.validity.patternMismatch) mostrarError(el, 'Format incorrecte');
        return false;
    }
    return true;
}

function validarTelefono() {
    let el = document.getElementById('p-telefono');
    if (!el.checkValidity()) {
        if (el.validity.valueMissing) mostrarError(el, 'El teléfono és obligatori');
        if (el.validity.patternMismatch) mostrarError(el, 'Format incorrecte');
        return false;
    }
    return true;
}

function validarSelectCurs() {
    let el = document.getElementById('p-curso');
    if (!el.checkValidity()) {
        if (el.validity.valueMissing) mostrarError(el, 'Selecciona un curs');
        return false;
    }
    return true;
}

function mostrarError(element, missatge) {
    document.getElementById('miissatgeError') 
        .appendChild(document.createTextNode(missatge));
    element.classList.add('text-danger');
    element.focus();
}

function limpiarErrores() {
    document.getElementById('miissatgeError').textContent = '';
    let form = document.getElementById('form-profesor')
    for (let i = 0; i < form.elements.length; i++) {
        form.elements[i].classList.remove('text-danger');
    }
}