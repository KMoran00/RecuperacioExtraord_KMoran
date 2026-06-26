// ============================================================
// PASO 2 — CALENDARIO (comandos DOM)
// ============================================================

function renderizarCalendario() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const maxFecha = new Date(hoy);
    maxFecha.setMonth(maxFecha.getMonth() + 3);

    const base = new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset, 1);
    const mes  = base.getMonth();
    const anio = base.getFullYear();

    const calTitulo = document.getElementById('cal-titulo');
    while (calTitulo.firstChild) calTitulo.removeChild(calTitulo.firstChild);
    calTitulo.appendChild(document.createTextNode(
        base.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    ));

    document.getElementById('btn-mes-anterior').disabled = mesOffset === 0;
    document.getElementById('btn-mes-siguiente').disabled = mesOffset === 3;

    const grid = document.getElementById('calendario-grid');
    while (grid.firstChild) grid.removeChild(grid.firstChild);

    ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].forEach(d => {
        const cab = document.createElement('div');
        cab.className = 'cal-header-dia';
        cab.appendChild(document.createTextNode(d));
        grid.appendChild(cab);
    });

    let primerDia = base.getDay();
    primerDia = primerDia === 0 ? 6 : primerDia - 1;
    for (let i = 0; i < primerDia; i++) {
        const vacio = document.createElement('div');
        vacio.className = 'cal-dia vacio';
        grid.appendChild(vacio);
    }

    const totalDias = new Date(anio, mes + 1, 0).getDate();

    for (let d = 1; d <= totalDias; d++) {
        const fechaDia = new Date(anio, mes, d);
        const fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        const pasado     = fechaDia < hoy;
        const esHoy      = fechaDia.getTime() === hoy.getTime();
        const fueraRango = fechaDia > maxFecha;

        const tieneReservas = reservas.some(r =>
            r.sala === salaSeleccionada.id && r.fecha === fechaStr
        );

        const btn = document.createElement('button');
        btn.className = 'cal-dia';

        const spanNum = document.createElement('span');
        spanNum.className = 'cal-num';
        spanNum.appendChild(document.createTextNode(d));
        btn.appendChild(spanNum);

        if (tieneReservas) {
            const punto = document.createElement('span');
            punto.className = 'cal-punto';
            btn.appendChild(punto);
        }

        if (pasado || fueraRango) {
            btn.classList.add('deshabilitado');
            btn.disabled = true;
        } else {
            if (esHoy) btn.classList.add('hoy');
            btn.addEventListener('click', () => abrirModalDia(fechaStr));
        }

        grid.appendChild(btn);
    }
}

function navegarMes(direccion) {
    mesOffset = Math.max(0, Math.min(3, mesOffset + direccion));
    renderizarCalendario();
}

