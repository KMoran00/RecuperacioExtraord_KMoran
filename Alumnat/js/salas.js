// Ruta al fichero JSON
const URL_JSON = './data/salas.json';

// Clave de localStorage  
const CLAVE_STORAGE = 'salas';

// array principal
const PROP_PRINCIPAL = 'salas';


let datos = [];     // JSON en memoria
let editando = false;

document.addEventListener('DOMContentLoaded', main);

async function main() {
    await cargarDatos();
    //cargarSelect();
    pintarTabla();

    // ── Listeners ──────────────────────────────────────────────
    document.getElementById('btn-form-sala').addEventListener('click', validar, false);
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
    let tbody = document.getElementById('tabla-salas');

    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

    let array = datos;

    if (!array || array.length === 0) {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.setAttribute('colspan', '4');
        td.textContent = 'No hi ha salas';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    array.forEach(function (item) {
        let tr = document.createElement('tr');


        //muestre el HTML     
        let tdId = document.createElement('td');
        tdId.textContent = item.id;
        tdId.classList.add('bagde', 'bg-primary');
        tr.appendChild(tdId);

        let tdNombre = document.createElement('td');
        tdNombre.textContent = item.nombre;
        tr.appendChild(tdNombre);


        let tdTipo = document.createElement('td');
        tdTipo.textContent = item.tipo;
        tr.appendChild(tdTipo);

        let tdPlazas = document.createElement('td');
        tdPlazas.textContent = item.capacidad;
        tr.appendChild(tdPlazas);



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
