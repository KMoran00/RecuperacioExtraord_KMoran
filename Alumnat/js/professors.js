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

        // Celda id
        let tdId = document.createElement('td');
        tdId.textContent = item.id;
        tr.appendChild(tdId);

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
    let nouId = Date.now();
    let nou = {
        id: nouId,
        nombre: document.getElementById('p-nombre').value.trim(),
        dni: document.getElementById('p-dni').value,
        telefono: document.getElementById('p-telefono').value,
        curso: document.getElementById('p-curso').value,

    };

    datos[PROP_PRINCIPAL].push(nou);
    guardarStorage();
}

// ── ACTUALITZAR ───────────────────────────────────────────────────────────
function actualizar() {
    let id = document.getElementById('form-profesor').dataset.editando;
    let item = datos[PROP_PRINCIPAL].find(x => x.id == id);
    if (!item) return;

    item.nombre = document.getElementById('p-nombre').value.trim();
    item.dni = document.getElementById('p-dni').value;
    item.telefono = document.getElementById('p-telefono').value;
    item.curso = document.getElementById('p-curso').value;


    guardarStorage();
}

// ── ELIMIANR ───────────────────────────────────────────────────────────
function borrar(id) {
    if (!confirm('Confirma si vols eliminar')) return;

    let idx = datos[PROP_PRINCIPAL].findIndex(x => x.id == id); // Caso B
    // let idx = datos.findIndex(x => x.id == id);              // Caso A
    if (idx === -1) return;

    datos[PROP_PRINCIPAL].splice(idx, 1);
    guardarStorage();
    pintarTabla();
}

function cancelarEdicion() {
    editando = false;
    document.getElementById('form-profesor').reset(); // ← CANVIA el id del formulario
    limpiarErrores();
}


/*
* VALIDACIONS
*/

function validar(e) {
    limpiarErrores();
    e.preventDefault(); // SIEMPRE al inicio

    // ← CANVIA: llama a las funciones de validación que necesites
    let ok = validarName();

    if (ok && confirm('Confirma si vols guardar')) {
        document.getElementById('form-profesor').requestSubmit();
    }
}

// Valida un <input type="text" required minlength="2">
function validarName() {
    let el = document.getElementById('inputName'); // ← CANVIA el id
    if (!el.checkValidity()) {
        if (el.validity.valueMissing) mostrarError(el, 'El nom és obligatori');
        if (el.validity.tooShort) mostrarError(el, 'Mínim 2 caràcters');
        if (el.validity.patternMismatch) mostrarError(el, 'Format incorrecte');
        return false;
    }
    return true;
}
