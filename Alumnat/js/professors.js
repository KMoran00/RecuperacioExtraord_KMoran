// Ruta al fichero JSON
const URL_JSON        = './data/salas.json';

// Clave de localStorage  
const CLAVE_STORAGE   = 'profesores';          

// Nombre de la propiedad del JSON que contiene el array principal
const PROP_PRINCIPAL  = 'profesores';        


let datos    = [];     // aquí vive todo el JSON en memoria
let editando = false;  // true = formulario en modo edición


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
