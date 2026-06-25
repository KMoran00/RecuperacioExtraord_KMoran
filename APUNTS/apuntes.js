// ════════════════════════════════════════════════════════════════════
//  APUNTES JS – PLANTILLA EXAMEN
//
//  CÓMO USAR ESTOS APUNTES:
//  1. Lee la sección "CONFIGURACIÓN" de abajo.
//  2. Cambia los valores de las constantes/variables marcadas con  ← CANVIA
//  3. El resto del código usa esas variables: si cambias la clave
//     de localStorage arriba, funciona en todas partes automáticamente.
// ════════════════════════════════════════════════════════════════════


// ────────────────────────────────────────────────────────────────────
//  SECCIÓN 0 – JSON TÍPICO DEL EXAMEN (guía de estructura)
// ────────────────────────────────────────────────────────────────────
//
//  Caso A – UN solo array (tipo "Repaso"):
//  {
//    "productos": [ { id:1, nombre:"...", categoria:"...", precio:0 } ]
//  }
//
//  Caso B – DOS arrays relacionados (tipo "SchoolBell"):
//  {
//    "schedules": [                       ← ARRAY PRINCIPAL
//      { id:1, name:"...", times:[        ← sub-array dentro del objeto
//          { id:101, name:"...", songId:1 }
//        ]
//      }
//    ],
//    "playlists": [                       ← ARRAY SECUNDARIO (se usa para el <select>)
//      { id:1, name:"...", songs:[
//          { id:1, name:"...", urlSong:"..." }
//        ]
//      }
//    ]
//  }


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 1 – CONFIGURACIÓN  (CAMBIA ESTOS VALORES SEGÚN EL EXAMEN)
// ════════════════════════════════════════════════════════════════════

// Ruta al fichero JSON
const URL_JSON        = './data/data.json';      // ← CANVIA (ej: './js/bbdd.json')

// Clave de localStorage  (igual en cargar y guardar)
const CLAVE_STORAGE   = 'horarios';              // ← CANVIA (ej: 'catalogo', 'biblioteca')

// Nombre de la propiedad del JSON que contiene el array principal
const PROP_PRINCIPAL  = 'schedules';             // ← CANVIA (ej: 'productos', 'libros')

// Nombre de la propiedad del JSON que contiene el array secundario (para el <select>)
// Si no hay array secundario, ignora esta constante
const PROP_SECUNDARIA = 'playlists';             // ← CANVIA (ej: 'categorias', 'autores')

// Nombre de la sub-propiedad con items dentro del array secundario
// Si el array secundario es plano (sin sub-items), ignora esta constante
const PROP_SUBITEMS   = 'songs';                 // ← CANVIA (ej: 'libros', 'tracks')


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 2 – VARIABLES GLOBALES
// ════════════════════════════════════════════════════════════════════

let datos    = [];     // aquí vive todo el JSON en memoria
let editando = false;  // true = formulario en modo edición


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 3 – PUNTO DE ENTRADA
// ════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', main);

async function main() {
    await cargarDatos();
    cargarSelect();
    pintarTabla();

    // ── Listeners ──────────────────────────────────────────────
    // ← CANVIA los ids por los del HTML del examen
    document.getElementById('btnGuardar').addEventListener('click', validar, false);
    document.getElementById('btnCancelar').addEventListener('click', cancelarEdicion, false);

    // El submit lo activa requestSubmit() desde validar(), nunca directamente
    document.getElementById('miFormulario').addEventListener('submit', function (e) {
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


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 4 – LOCALSTORAGE
// ════════════════════════════════════════════════════════════════════

async function cargarDatos() {
    let guardado = JSON.parse(localStorage.getItem(CLAVE_STORAGE));

    // ─ Caso B (JSON con varias colecciones, tipo SchoolBell) ─
    if (guardado && guardado[PROP_PRINCIPAL]) {
        datos = guardado;

    // ─ Caso A (JSON con un solo array) ─
    } else if (guardado && guardado.length > 0) {
        datos = guardado;

    // ─ No hay nada en localStorage: descarga el JSON ─
    } else {
        let respuesta = await fetch(URL_JSON);
        let json      = await respuesta.json();

        // ← CANVIA: elige UNA de estas dos líneas según el JSON:
        datos = json;             // si el JSON es el objeto completo (Caso B)
        // datos = json[PROP_PRINCIPAL];  // si solo necesitas el array (Caso A)

        guardarStorage();
    }
}

function guardarStorage() {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(datos));
}


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 5 – PINTAR TABLA
// ════════════════════════════════════════════════════════════════════

function pintarTabla() {
    let tbody = document.getElementById('miTbody'); // ← CANVIA el id del <tbody>

    // Limpia: SIEMPRE con while, no con innerHTML
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

    // ← CANVIA: coge el array que necesitas pintar
    // Caso B – sub-array del primer objeto: datos[PROP_PRINCIPAL][0].times
    // Caso A – array plano:                datos
    let array = datos[PROP_PRINCIPAL];

    if (!array || array.length === 0) {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.setAttribute('colspan', '5'); // ← CANVIA: número de columnas
        td.textContent = 'No hi ha dades';
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

        // ← CANVIA: una celda por campo que muestre el HTML
        let tdNom = document.createElement('td');
        tdNom.textContent = item.name;   // ← CANVIA 'name' por el campo real
        tr.appendChild(tdNom);

        // Celda que resuelve la FK mirando en el array secundario
        let tdRelacion = document.createElement('td');
        tdRelacion.textContent = getNomRelacionat(item.songId); // ← CANVIA 'songId'
        tr.appendChild(tdRelacion);

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

// Busca el nombre del elemento relacionado en el array secundario
// ← CANVIA los nombres de propiedades según el JSON del examen
function getNomRelacionat(idBuscat) {
    // Caso B con sub-items (playlists > songs):
    for (let grup of datos[PROP_SECUNDARIA]) {
        for (let item of grup[PROP_SUBITEMS]) {
            if (item.id == idBuscat) return grup.name + ' - ' + item.name;
        }
    }
    // Caso B sin sub-items (array plano):
    // let trobat = datos[PROP_SECUNDARIA].find(x => x.id == idBuscat);
    // if (trobat) return trobat.name;
    return '';
}


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 6 – RELLENAR <select> DESDE EL JSON
// ════════════════════════════════════════════════════════════════════

function cargarSelect() {
    let select = document.getElementById('miSelect'); // ← CANVIA el id del <select>

    while (select.firstChild) select.removeChild(select.firstChild);

    // Opción vacía obligatoria (para que el required del select funcione)
    let optDef = document.createElement('option');
    optDef.value = '';
    optDef.textContent = 'Seleccionar';
    select.appendChild(optDef);

    // ─ Caso con sub-items (como playlists > songs) ─
    for (let grup of datos[PROP_SECUNDARIA]) {
        for (let item of grup[PROP_SUBITEMS]) {
            let opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = grup.name + ' - ' + item.name; // ← CANVIA los campos
            select.appendChild(opt);
        }
    }

    // ─ Caso array plano (sin sub-items) ─
    // for (let item of datos[PROP_SECUNDARIA]) {
    //     let opt = document.createElement('option');
    //     opt.value = item.id;
    //     opt.textContent = item.name; // ← CANVIA el campo
    //     select.appendChild(opt);
    // }
}


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 7 – CRUD
//
//  CÓMO SABER QUÉ ESCRIBIR EN agregar / cargarFormulario / actualizar
//  ─────────────────────────────────────────────────────────────────
//  Tienes tres fuentes que debes conectar:
//
//  [A] El JSON  → te dice qué PROPIEDADES tiene cada objeto
//  [B] El HTML  → te dice qué ID tienen los <input> y <select>
//  [C] El tipo  → texto = .value.trim()  |  número/FK = Number(.value)
//
//  Ejemplo con SchoolBell:
//
//  [A] JSON (un time):         [B] HTML (inputs del form):       [C] tipo
//  ┌─────────────────┐         ┌──────────────────────────┐
//  │ "name": "Patio" │ ──────► │ <input id="timeName">    │  → .value.trim()
//  │ "hour": "11:00" │ ──────► │ <input id="timeHour">    │  → .value
//  │ "duration": 30  │ ──────► │ <input id="timeDuration">│  → Number(.value)
//  │ "songId": 2     │ ──────► │ <select id="timeSong.."> │  → Number(.value)  (FK)
//  └─────────────────┘         └──────────────────────────┘
//
//  PASOS PARA ADAPTAR AL EXAMEN:
//  1. Abre el JSON → anota las propiedades de un objeto (excepto "id")
//  2. Abre el HTML → anota el id de cada <input>/<select> del formulario
//  3. En agregar():         propiedad: document.getElementById('id').value
//  4. En cargarFormulario(): document.getElementById('id').value = item.propiedad
//  5. En actualizar():      item.propiedad = document.getElementById('id').value
//  Las tres funciones usan las mismas propiedades e ids → cópialos igual en las tres.
// ════════════════════════════════════════════════════════════════════

// ── CREATE ───────────────────────────────────────────────────────────
function agregar() {
    // Tres formas de generar un id único – elige una:
    // let nouId = datos[PROP_PRINCIPAL].length > 0
    //     ? Math.max(...datos[PROP_PRINCIPAL].map(x => x.id)) + 1 : 1; // número correlativo
    let nouId = new Date(Date.now()).toISOString().split('T')[0]; // fecha de hoy (SchoolBell)
    // let nouId = Date.now();                                        // timestamp

    // Izquierda del ':' = propiedad del JSON  [A]
    // Dentro del getElementById = id del input en el HTML  [B]
    // .trim() para texto, Number() para números y FKs  [C]
    let nou = {
        id:       nouId,
        name:     document.getElementById('inputName').value.trim(),      // ← CANVIA [A] i [B]
        hour:     document.getElementById('inputHour').value,             // ← CANVIA [A] i [B]
        duration: Number(document.getElementById('inputDuration').value), // ← CANVIA [A] i [B]
        songId:   Number(document.getElementById('miSelect').value)       // ← CANVIA [A] i [B] (FK)
    };

    datos[PROP_PRINCIPAL].push(nou); // Caso B  |  datos.push(nou) si Caso A
    guardarStorage();
}

// ── CARGAR EN EL FORMULARIO (modo edición) ───────────────────────────
// Mismas propiedades e ids que en agregar(), pero al revés:
// item.propiedad [A]  →  input del HTML [B]
function cargarFormulario(id) {
    let item = datos[PROP_PRINCIPAL].find(x => x.id == id); // Caso B
    // let item = datos.find(x => x.id == id);              // Caso A
    if (!item) return;

    document.getElementById('inputName').value     = item.name;     // ← CANVIA [B] i [A]
    document.getElementById('inputHour').value     = item.hour;     // ← CANVIA [B] i [A]
    document.getElementById('inputDuration').value = item.duration; // ← CANVIA [B] i [A]
    document.getElementById('miSelect').value      = item.songId;   // ← CANVIA [B] i [A] (FK)

    document.getElementById('miFormulario').dataset.editando = id;  // ← CANVIA id formulario
    editando = true;
}

// ── UPDATE ───────────────────────────────────────────────────────────
// Mismas propiedades e ids que en agregar(), sobreescribiendo el objeto existente
function actualizar() {
    let id   = document.getElementById('miFormulario').dataset.editando; // ← CANVIA id formulario
    let item = datos[PROP_PRINCIPAL].find(x => x.id == id); // Caso B
    // let item = datos.find(x => x.id == id);              // Caso A
    if (!item) return;

    item.name     = document.getElementById('inputName').value.trim();      // ← CANVIA [A] i [B]
    item.hour     = document.getElementById('inputHour').value;             // ← CANVIA [A] i [B]
    item.duration = Number(document.getElementById('inputDuration').value); // ← CANVIA [A] i [B]
    item.songId   = Number(document.getElementById('miSelect').value);      // ← CANVIA [A] i [B]

    guardarStorage();
}

// ── DELETE ───────────────────────────────────────────────────────────
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
    document.getElementById('miFormulario').reset(); // ← CANVIA el id del formulario
    limpiarErrores();
}


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 8 – VALIDACIÓN
// ════════════════════════════════════════════════════════════════════

// El botón Guardar tiene type="button" → llama a validar()
// Si todo es correcto, validar() llama a requestSubmit() → dispara el 'submit'
// El listener 'submit' llama a agregar() o actualizar()

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

// Valida un <input type="time" required>
function validarHour() {
    let el = document.getElementById('inputHour'); // ← CANVIA el id
    if (!el.checkValidity()) {
        if (el.validity.valueMissing) mostrarError(el, "L'hora és obligatòria");
        return false;
    }
    return true;
}

// Valida un <input type="number" required min="1">
function validarDuration() {
    let el = document.getElementById('inputDuration'); // ← CANVIA el id
    if (!el.checkValidity()) {
        if (el.validity.valueMissing)   mostrarError(el, 'La duració és obligatòria');
        if (el.validity.rangeUnderflow) mostrarError(el, 'Ha de ser major que 0');
        return false;
    }
    return true;
}

// Valida un <select required> (la opción por defecto debe tener value="")
function validarSelect2() {
    let el = document.getElementById('miSelect'); // ← CANVIA el id
    if (!el.checkValidity()) {
        if (el.validity.valueMissing) mostrarError(el, 'Selecciona una opció');
        return false;
    }
    return true;
}

function mostrarError(element, missatge) {
    document.getElementById('errorMensaje') // ← CANVIA el id del div de errores
        .appendChild(document.createTextNode(missatge));
    element.classList.add('text-danger');
    element.focus();
}

function limpiarErrores() {
    document.getElementById('errorMensaje').textContent = ''; // ← CANVIA el id
    let form = document.forms[0]; // o getElementById('miFormulario')
    for (let i = 0; i < form.elements.length; i++) {
        form.elements[i].classList.remove('text-danger');
    }
}


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 9 – PÁGINA DE DETALLE  (detalle.js)
// ════════════════════════════════════════════════════════════════════

// En index.js, el enlace al detalle se construye así:
//   btnDetalle.href = 'detalle.html?id=' + item.id;
//
// detalle.js completo:

document.addEventListener('DOMContentLoaded', function () {
    let guardado = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
    if (!guardado) { window.location.href = 'index.html'; return; } // ← CANVIA

    let params = new URLSearchParams(window.location.search);
    let id     = parseInt(params.get('id')); // 'id' coincide con el nombre del param de la URL

    // ← CANVIA: busca en el array correcto
    let item = guardado[PROP_PRINCIPAL].find(x => x.id === id);   // Caso B
    // let item = guardado.find(x => x.id === id);                // Caso A

    if (!item) {
        document.getElementById('cardDetalle').classList.add('d-none');    // ← CANVIA
        document.getElementById('mensajeError').classList.remove('d-none');// ← CANVIA
        return;
    }

    // ← CANVIA: vuelca los campos en los elementos del HTML de detalle
    document.getElementById('elTitulo').textContent  = item.name;    // ← CANVIA ids y props
    document.getElementById('elHora').textContent    = item.hour;
    // Para imágenes: document.getElementById('laImagen').src = 'img/' + item.img;
});


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 10 – BUSCAR, FILTRAR Y ORDENAR
// ════════════════════════════════════════════════════════════════════

// Necesitarás una variable global para el array filtrado si usas filtros:
let datosFiltrats = [];
// Al final de cargarDatos(): datosFiltrats = [...datos[PROP_PRINCIPAL]];

function buscar() {
    let text = document.getElementById('buscador').value.toLowerCase(); // ← CANVIA id
    datosFiltrats = datos[PROP_PRINCIPAL].filter(x =>
        x.name.toLowerCase().includes(text)   // ← CANVIA los campos de búsqueda
    );
    pintarTabla(); // ajusta pintarTabla para que use datosFiltrats en vez de datos
}

function filtrarPer() {
    let valor = document.getElementById('filtreSelect').value; // ← CANVIA id
    datosFiltrats = valor === ''
        ? [...datos[PROP_PRINCIPAL]]
        : datos[PROP_PRINCIPAL].filter(x => x.name === valor); // ← CANVIA el campo
    pintarTabla();
}

function ordenarDescendent() {
    datosFiltrats = [...datosFiltrats].sort((a, b) => b.duration - a.duration); // ← CANVIA campo
    pintarTabla();
}

function ordenarAscendent() {
    datosFiltrats = [...datosFiltrats].sort((a, b) => a.duration - b.duration); // ← CANVIA camp
    pintarTabla();
}


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 11 – REFERENCIA DE MÉTODOS
// ════════════════════════════════════════════════════════════════════

/*
  ARRAYS:
  .find(x => x.id == id)          → primer elemento que cumple (o undefined)
  .findIndex(x => x.id == id)     → índice del primero (o -1)
  .filter(x => condición)         → nuevo array con los que cumplen
  .map(x => x.campo)              → nuevo array transformado
  .forEach(x => { ... })          → recorre sin retorno
  .includes(valor)                → true/false
  .push(obj)                      → añade al final  (muta el original)
  .splice(idx, 1)                 → elimina 1 en idx  (muta el original)
  [...arr].sort((a,b) => a-b)     → ordena SIN mutar (copia primero con spread)
  Math.max(...arr.map(x => x.id)) → id máximo del array

  VALIDITY (input.checkValidity() + input.validity.XXX):
  valueMissing    → campo vacío y tiene required
  tooShort        → menos caracteres que minlength
  tooLong         → más caracteres que maxlength
  patternMismatch → no encaja con pattern="..."
  rangeUnderflow  → número < min
  rangeOverflow   → número > max
  typeMismatch    → valor no es del tipo correcto (email, url…)

  DOM:
  document.createElement('td')
  el.setAttribute('colspan', '5')
  el.classList.add('btn', 'btn-primary')
  el.classList.remove('text-danger')
  el.textContent = '...'
  el.appendChild(hijo)
  while (padre.firstChild) padre.removeChild(padre.firstChild)  ← limpiar

  URL params (detalle):
  new URLSearchParams(window.location.search).get('id')
*/


// ════════════════════════════════════════════════════════════════════
//  SECCIÓN 12 – CHECKLIST ANTES DE ENTREGAR
// ════════════════════════════════════════════════════════════════════

/*
  [ ] El <script> carga después del HTML o el JS espera DOMContentLoaded
  [ ] fetch() apunta a la ruta correcta del JSON
  [ ] CLAVE_STORAGE es igual en cargar y guardar
  [ ] Todos los getElementById() coinciden con los id del HTML
  [ ] El botón Guardar es type="button", NO type="submit"
  [ ] e.preventDefault() está al inicio de validar()
  [ ] requestSubmit() solo se llama si las validaciones pasan
  [ ] El <select> con required tiene la opción vacía con value=""
  [ ] borrar() usa findIndex + splice (no find)
  [ ] confirm() antes de borrar y antes de guardar
  [ ] Al actualizar, busco el item con find() y modifico sus propiedades directamente
*/
