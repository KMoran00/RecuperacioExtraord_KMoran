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

    let array = datos[PROP_PRINCIPAL];

    if (!array || array.length === 0) {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.setAttribute('colspan', '5');
        td.textContent = 'No hi ha dades';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    array.forEach(function (item) {
        let tr = document.createElement('tr');

        // Celda id
        let tdId = document.createElement('td');
        tdId.textContent = profesores.id;
        tr.appendChild(tdId);

        //muestre el HTML
        let tdNombre = document.createElement('td');
        tdNombre.textContent = profesores.nombre;
        tr.appendChild(tdNombre);

        let tdDNI = document.createElement('td');
        tdDNI.textContent = profesores.dni;
        tr.appendChild(tdDNI);


        let tdTelefono = document.createElement('td');
        tdTelefono.textContent = profesores.telefono;
        tr.appendChild(tdTelefono);

        let tdCurso = document.createElement('td');
        tdCurso.textContent = profesores.curso;
        tr.appendChild(tdCurso);



        // Celda de acciones
        let tdAccions = document.createElement('td');

        let btnEditar = document.createElement('button');
        btnEditar.type = 'button';
        btnEditar.textContent = 'Editar';
        btnEditar.classList.add('btn', 'btn-primary', 'me-1');
        btnEditar.addEventListener('click', function () { cargarFormulario(item.id); });
        tdAccions.appendChild(btnEditar);

        let btnBorrar = document.createElement('button');
        btnBorrar.type = 'button';
        btnBorrar.textContent = 'Borrar';
        btnBorrar.classList.add('btn', 'btn-danger');
        btnBorrar.addEventListener('click', function () { borrar(item.id); });
        tdAccions.appendChild(btnBorrar);

        tr.appendChild(tdAccions);
        tbody.appendChild(tr);
    });
}

/*
* VALIDACIONS
*/

function validar(e) {
    limpiarErrores();
    e.preventDefault(); // SIEMPRE al inicio

    // ← CANVIA: llama a las funciones de validación que necesites
    let ok = validarName() && validarHour() && validarDuration() && validarSelect2();

    if (ok && confirm('Confirma si vols guardar')) {
        document.getElementById('miFormulario').requestSubmit(); // SIEMPRE así
    }
}

// Valida un <input type="text" required minlength="2">
function validarName() {
    let el = document.getElementById('inputName'); // ← CANVIA el id
    if (!el.checkValidity()) {
        if (el.validity.valueMissing)    mostrarError(el, 'El nom és obligatori');
        if (el.validity.tooShort)        mostrarError(el, 'Mínim 2 caràcters');
        if (el.validity.patternMismatch) mostrarError(el, 'Format incorrecte');
        return false;
    }
    return true;
}
