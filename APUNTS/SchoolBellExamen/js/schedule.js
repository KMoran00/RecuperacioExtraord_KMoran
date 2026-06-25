// Espera a que el DOM esté cargado antes de ejecutar main
document.addEventListener('DOMContentLoaded', main);

// Array global que almacena todos los datos (horarios, playlists, canciones)
let datos = [];
// Indica si estamos en modo edición de una hora existente
let editando = false;
// Fecha de hoy en formato ISO (YYYY-MM-DD), usada como id al crear nuevas horas
let ara = new Date(Date.now()).toISOString().split('T')[0];

// Función principal: carga datos, rellena el select de canciones, pinta la tabla
// y registra los listeners de los botones del formulario
async function main() {
	await cargarDatos();
	cargarCanciones();
	pintarHoras();

	// Listener del botón guardar: lanza la validación antes de enviar el formulario
	document.getElementById('btnGuardarTime').addEventListener('click', validar, false);

	// Listener del botón añadir horario
	document.getElementById('btnAddSchedule').addEventListener('click', añadirShedule, false);

	// Listener del submit del formulario: decide si actualizar o agregar según el modo
	document.getElementById('timeForm').addEventListener('submit', function (e) {
		e.preventDefault();
		if (editando) {
			actualizarHora();
		} else {
			agregarHora();
		}
		this.reset();
		editando = false;
		esborrarError();
		pintarHoras();
	});
	console.log(datos);
}

// Carga los datos desde localStorage si existen; si no, los obtiene del JSON del servidor
async function cargarDatos() {
	let datosGuardados = JSON.parse(localStorage.getItem('horarios'));
	if (datosGuardados && datosGuardados.schedules) {
		datos = datosGuardados;
	} else {
		let respuesta = await fetch('./data/data.json');
		let json = await respuesta.json();
		datos = json;
		guardarStorage();
	}
}

// Guarda el estado actual de datos en localStorage
function guardarStorage() {
	localStorage.setItem('horarios', JSON.stringify(datos));
}

// Rellena el <select> de canciones con las canciones de la playlist "Favoritos"
// Si no existe esa playlist, muestra todas las canciones de todas las playlists
function cargarCanciones() {
	let select = document.getElementById('timeSongSelect');
	// Vacía el select antes de rellenarlo
	while (select.firstChild) select.removeChild(select.firstChild);

	// Opción por defecto vacía
	let opt = document.createElement('option');
	opt.value = '';
	opt.textContent = 'Seleccionar';
	select.appendChild(opt);

	let favPlaylist = datos.playlists.find(p => p.name === 'Favoritos');
	if (favPlaylist) {
		// Solo muestra las canciones de Favoritos
		for (let s of favPlaylist.songs) {
			let o = document.createElement('option');
			o.value = s.id;
			o.textContent = favPlaylist.name + ' - ' + s.name;
			select.appendChild(o);
		}
	} else {
		// Muestra todas las canciones de todas las playlists
		for (let p of datos.playlists) {
			for (let s of p.songs) {
				let o = document.createElement('option');
				o.value = s.id;
				o.textContent = p.name + ' - ' + s.name;
				select.appendChild(o);
			}
		}
	}
}

// Renderiza la tabla con las horas del primer horario
// Si no hay horas, muestra un mensaje de aviso
function pintarHoras() {
	let tbody = document.getElementById('hourTable');
	// Limpia la tabla antes de repintarla
	while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

	let horario = datos.schedules[0];
	if (!horario.times || horario.times.length === 0) {
		let tr = document.createElement('tr');
		let td = document.createElement('td');
		td.setAttribute('colspan', '6');
		td.textContent = 'No hay momentos';
		tr.appendChild(td);
		tbody.appendChild(tr);
		return;
	}

	// Crea una fila por cada hora con sus botones de editar y borrar
	horario.times.forEach(function (t) {
		let tr = document.createElement('tr');

		let tdId = document.createElement('td');
		tdId.textContent = t.id;
		tr.appendChild(tdId);

		let tdNombre = document.createElement('td');
		tdNombre.textContent = t.name;
		tr.appendChild(tdNombre);

		let tdHora = document.createElement('td');
		tdHora.textContent = t.hour;
		tr.appendChild(tdHora);

		let tdSegs = document.createElement('td');
		tdSegs.textContent = t.duration;
		tr.appendChild(tdSegs);

		let tdCancion = document.createElement('td');
		tdCancion.textContent = obtenerNombreCancion(t.songId);
		tr.appendChild(tdCancion);

		let tdAcciones = document.createElement('td');

		// Botón editar: carga los datos de la hora en el formulario
		let btnEditar = document.createElement('button');
		btnEditar.type = 'button';
		btnEditar.textContent = 'Editar';
		btnEditar.classList.add("btn", "btn-primary");
		btnEditar.addEventListener('click', function () {
			cargarFormulario(t.id);
		});
		tdAcciones.appendChild(btnEditar);

		// Botón borrar: elimina la hora tras confirmación
		let btnBorrar = document.createElement('button');
		btnBorrar.type = 'button';
		btnBorrar.textContent = 'Borrar';
		btnBorrar.classList.add("btn", "btn-danger");
		btnBorrar.addEventListener('click', function () {
			borrarHora(t.id);
		});
		tdAcciones.appendChild(btnBorrar);

		tr.appendChild(tdAcciones);
		tbody.appendChild(tr);
	});
}

// Busca el nombre de una canción por su id recorriendo todas las playlists
function obtenerNombreCancion(songId) {
	for (let p of datos.playlists) {
		for (let s of p.songs) {
			if (s.id == songId) return p.name + ' - ' + s.name;
		}
	}
	return '';
}

// Carga los datos de una hora en el formulario para editarla
function cargarFormulario(id) {
	let horario = datos.schedules[0];
	let t = horario.times.find(x => x.id == id);
	if (!t) return;

	document.getElementById('timeName').value = t.name;
	document.getElementById('timeHour').value = t.hour;
	document.getElementById('timeDuration').value = t.duration;
	document.getElementById('timeSongSelect').value = t.songId;
	// Guarda el id de la hora que se está editando en el dataset del formulario
	document.getElementById('timeForm').dataset.editando = id;
	editando = true;
}

// Elimina una hora del horario por su id tras pedir confirmación al usuario
function borrarHora(id) {
	if (!confirm('Confirma si vols eliminar la hora')) return;
	let horario = datos.schedules[0];
	let idx = horario.times.findIndex(t => t.id == id);
	if (idx === -1) return;
	horario.times.splice(idx, 1);
	guardarStorage();
	pintarHoras();
}

// Ejecuta todas las validaciones antes de permitir el envío del formulario
function validar(e) {
	esborrarError();
	e.preventDefault();
	if (validarNombre() && validarHora() && validarSegs() && validarCancion() && confirm('Confirma si vols guardar')) {
		document.getElementById('timeForm').requestSubmit();
		return true;
	}
	return false;
}

// Valida que el campo nombre no esté vacío y tenga al menos 2 caracteres
function validarNombre() {
	let element = document.getElementById('timeName');
	if (!element.checkValidity()) {
		if (element.validity.valueMissing) {
			error(element, 'El nombre es obligatorio');
		}
		if (element.validity.tooShort) {
			error(element, 'Minimo 2 caracteres');
		}
		return false;
	}
	return true;
}

// Valida que el campo hora no esté vacío
function validarHora() {
	let element = document.getElementById('timeHour');
	if (!element.checkValidity()) {
		if (element.validity.valueMissing) {
			error(element, 'La hora es obligatoria');
		}
		return false;
	}
	return true;
}

// Valida que la duración en segundos no esté vacía y sea mayor que 0
function validarSegs() {
	let element = document.getElementById('timeDuration');
	if (!element.checkValidity()) {
		if (element.validity.valueMissing) {
			error(element, 'Los segundos son obligatorios');
		}
		if (element.validity.rangeUnderflow) {
			error(element, 'Debe ser mayor que 0');
		}
		return false;
	}
	return true;
}

// Valida que se haya seleccionado una canción en el select
function validarCancion() {
	let element = document.getElementById('timeSongSelect');
	if (!element.checkValidity()) {
		if (element.validity.valueMissing) {
			error(element, 'Selecciona una canción');
		}
		return false;
	}
	return true;
}

// Muestra un mensaje de error junto al campo con problema y lo marca en rojo
function error(element, mensaje) {
	let miss = document.createTextNode(mensaje);
	document.getElementById('errorMensaje').appendChild(miss);
	element.classList.add('text-danger');
	element.focus();
}

// Limpia todos los mensajes de error y quita el estilo de error de los campos
function esborrarError() {
	document.getElementById('errorMensaje').textContent = '';
	let formulario = document.forms[0];
	for (let i = 0; i < formulario.elements.length; i++) {
		formulario.elements[i].classList.remove('text-danger');
	}
}

// Crea una nueva hora con los valores del formulario y la añade al horario
function agregarHora() {
	let horario = datos.schedules[0];
	let nuevo = {
		// El id es la fecha de hoy para que sea único por día
		id: ara,
		name: document.getElementById('timeName').value.trim(),
		hour: document.getElementById('timeHour').value,
		duration: Number(document.getElementById('timeDuration').value),
		songId: Number(document.getElementById('timeSongSelect').value)
	};
	horario.times.push(nuevo);
	guardarStorage();
}

// Actualiza los campos de una hora existente con los valores del formulario
function actualizarHora() {
	let id = document.getElementById('timeForm').dataset.editando;
	let horario = datos.schedules[0];
	let t = horario.times.find(x => x.id == id);
	if (!t) return;

	t.name = document.getElementById('timeName').value.trim();
	t.hour = document.getElementById('timeHour').value;
	t.duration = Number(document.getElementById('timeDuration').value);
	t.songId = Number(document.getElementById('timeSongSelect').value);
	guardarStorage();
}

// Crea un nuevo horario vacío con el nombre introducido y lo guarda en localStorage
function añadirShedule() {
	let nuevo = {
		id: Date.now(),
		name: document.getElementById('nameSchedule').value.trim(),
		times: []
	};
	datos.schedules.push(nuevo);
	guardarStorage();
	pintarHoras();
}
