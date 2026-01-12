// Variables globales
const form = document.getElementById("formInforme");
const listaInformes = document.getElementById("listaInformes");
let informes = JSON.parse(localStorage.getItem("informes")) || [];
let editIndex = -1;  // Índice del informe en edición (-1 si ninguno)

// Guardar informe (nuevo o editar)
form.addEventListener("submit", function(e) {
    e.preventDefault();

    const fecha = document.getElementById("domingo").value;
    const asistencia = parseInt(document.getElementById("asistencia").value);

    if (asistencia < 0) {
        alert("La asistencia no puede ser negativa");
        return;
    }

    const indexExistente = existeRegistroPorFecha(fecha);

    if (editIndex === -1 && indexExistente !== -1) {
        alert("⚠️ Ya existe un registro para esta fecha.\nPuedes editar el registro existente.");
        editarInforme(indexExistente);
        return;
    }

    const informe = {
        domingo: fecha,
        clase: document.getElementById("clase").value,
        asistencia: asistencia,
        biblias: parseInt(document.getElementById("biblias").value) || 0,
        ofrendas: parseInt(document.getElementById("ofrendas").value) || 0,
        visitas: parseInt(document.getElementById("visitas").value) || 0,
        cumpleanos: parseInt(document.getElementById("cumpleanos").value) || 0,
        maestro: document.getElementById("maestro").value
    };

    if (editIndex === -1) {
        informes.push(informe);
        alert("Informe guardado correctamente");
    } else {
        informes[editIndex] = informe;
        alert("Informe editado correctamente");
        editIndex = -1;
        form.querySelector('button[type="submit"]').textContent = "Registrar";
    }

    localStorage.setItem("informes", JSON.stringify(informes));
    form.reset();
    mostrarInformes();
});


// Mostrar informes con botones editar/eliminar
function mostrarInformes() {
    listaInformes.innerHTML = "";

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    const delMes = informes.filter(i => {
        const fecha = new Date(i.domingo);
        return (
            fecha.getMonth() === mesActual &&
            fecha.getFullYear() === anioActual
        );
    });

    if (delMes.length === 0) {
        listaInformes.innerHTML = "<li>No hay informes este mes</li>";
        return;
    }

    delMes.forEach(inf => {
        const indexReal = informes.indexOf(inf);

        const li = document.createElement("li");
        li.style.marginBottom = "10px";

        li.innerHTML = `
            <strong>${inf.domingo} - ${inf.clase}</strong> (Maestr@: ${inf.maestro})<br>
            Asistencia: ${inf.asistencia}, Ofrendas: ${inf.ofrendas}, Visitas: ${inf.visitas}
            <br>
            <button onclick="editarInforme(${indexReal})">Editar</button>
            <button onclick="eliminarInforme(${indexReal})">Eliminar</button>
        `;

        listaInformes.appendChild(li);
    });
}



// Cargar informe para editar
function editarInforme(index) {
    const inf = informes[index];
    document.getElementById("domingo").value = inf.domingo;
    document.getElementById("clase").value = inf.clase;
    document.getElementById("asistencia").value = inf.asistencia;
    document.getElementById("biblias").value = inf.biblias;
    document.getElementById("ofrendas").value = inf.ofrendas;
    document.getElementById("visitas").value = inf.visitas;
    document.getElementById("cumpleanos").value = inf.cumpleanos;
    document.getElementById("maestro").value = inf.maestro;

    editIndex = index;
    form.querySelector('button[type="submit"]').textContent = "Guardar Cambios";
}

// Eliminar informe
function eliminarInforme(index) {
    if (confirm("¿Seguro que deseas eliminar este informe?")) {
        informes.splice(index, 1);
        localStorage.setItem("informes", JSON.stringify(informes));
        mostrarInformes();

        if (editIndex === index) {
            form.reset();
            editIndex = -1;
            form.querySelector('button[type="submit"]').textContent = "Registrar";
        }
    }
}

// Reportes (diario, mensual, anual)
function reporteDiario() {
    const informes = JSON.parse(localStorage.getItem("informes")) || [];
    const fechaSeleccionada = document.getElementById("fechaReporte").value;

    if (!fechaSeleccionada) {
        alert("Seleccione una fecha");
        return;
    }

    let totalAsistencia = 0, totalOfrenda = 0, totalVisitas = 0;
    let detalle = "";

    informes.forEach(i => {
        if (i.domingo === fechaSeleccionada) {
            totalAsistencia += i.asistencia;
            totalOfrenda += i.ofrendas;
            totalVisitas += i.visitas;

            detalle += `
📘 Clase: ${i.clase}
👩‍🏫 Maestro: ${i.maestro}
👥 Asistencia: ${i.asistencia}
💰 Ofrenda: ${i.ofrendas}
👤 Visitas: ${i.visitas}
-------------------------
`;
        }
    });

    document.getElementById("reporteSalida").textContent = `
📊 REPORTE DIARIO
📅 Fecha: ${fechaSeleccionada}

👥 Asistencia total: ${totalAsistencia}
💰 Ofrenda total: ${totalOfrenda}
👤 Visitas (nuevos): ${totalVisitas}

DETALLE:
${detalle || "No hay registros para esta fecha"}
`;
}

function reporteMensual() {
    const informes = JSON.parse(localStorage.getItem("informes")) || [];
    const hoy = new Date();
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();

    let totalAsistencia = 0, totalOfrenda = 0, totalVisitas = 0;
    let detalle = "";

    informes.forEach(i => {
        const fecha = new Date(i.domingo);
        if (fecha.getMonth() === mes && fecha.getFullYear() === anio) {
            totalAsistencia += i.asistencia;
            totalOfrenda += i.ofrendas;
            totalVisitas += i.visitas;

            detalle += `
📅 ${i.domingo}
📘 Clase: ${i.clase}
👩‍🏫 Maestro: ${i.maestro}
👥 Asistencia: ${i.asistencia}
💰 Ofrenda: ${i.ofrendas}
👤 Visitas: ${i.visitas}
-------------------------
`;
        }
    });

    document.getElementById("reporteSalida").textContent = `
📊 REPORTE MENSUAL
🗓 Año: ${anio}
🗓 Mes: ${mes + 1}

👥 Asistencia total: ${totalAsistencia}
💰 Ofrenda total: ${totalOfrenda}
👤 Visitas (nuevos): ${totalVisitas}

DETALLE:
${detalle || "No hay registros este mes"}
`;
}

function reporteAnual() {
    const informes = JSON.parse(localStorage.getItem("informes")) || [];
    const anio = new Date().getFullYear();

    const meses = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    let resumenMensual = Array(12).fill(null).map(() => ({
        asistencia: 0,
        ofrenda: 0,
        visitas: 0
    }));

    let totalAnual = { asistencia: 0, ofrenda: 0, visitas: 0 };

    informes.forEach(i => {
        const fecha = new Date(i.domingo);
        if (fecha.getFullYear() === anio) {
            const mes = fecha.getMonth();
            resumenMensual[mes].asistencia += i.asistencia;
            resumenMensual[mes].ofrenda += i.ofrendas;
            resumenMensual[mes].visitas += i.visitas;

            totalAnual.asistencia += i.asistencia;
            totalAnual.ofrenda += i.ofrendas;
            totalAnual.visitas += i.visitas;
        }
    });

    let salida = `📊 REPORTE ANUAL\n🗓 Año: ${anio}\n\nRESUMEN MENSUAL\n`;
    salida += "Mes | Asistencia | Ofrenda | Visitas\n";
    salida += "-----------------------------------\n";

    resumenMensual.forEach((m, i) => {
        salida += `${meses[i]} | ${m.asistencia} | ${m.ofrenda} | ${m.visitas}\n`;
    });

    salida += "\nTOTAL ANUAL\n";
    salida += `Asistencia: ${totalAnual.asistencia}\n`;
    salida += `Ofrenda: ${totalAnual.ofrenda}\n`;
    salida += `Visitas: ${totalAnual.visitas}\n`;

    document.getElementById("reporteSalida").textContent = salida;
}

// Funciones PDF

function pdfDiario() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const informes = JSON.parse(localStorage.getItem("informes")) || [];
    const fechaSeleccionada = document.getElementById("fechaReporte").value;

    if (!fechaSeleccionada) {
        alert("Seleccione una fecha");
        return;
    }

    let y = 20;
    let totalAsistencia = 0, totalOfrenda = 0, totalVisitas = 0;

    doc.setFontSize(14);
    doc.text("REPORTE DIARIO", 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaSeleccionada}`, 20, y);
    y += 10;

    informes.forEach(i => {
        if (i.domingo === fechaSeleccionada) {
            totalAsistencia += i.asistencia;
            totalOfrenda += i.ofrendas;
            totalVisitas += i.visitas;

            doc.text(`Clase: ${i.clase}`, 20, y); y += 6;
            doc.text(`Maestro: ${i.maestro}`, 20, y); y += 6;
            doc.text(`Asistencia: ${i.asistencia}`, 20, y); y += 6;
            doc.text(`Ofrenda: ${i.ofrendas}`, 20, y); y += 6;
            doc.text(`Visitas: ${i.visitas}`, 20, y); y += 8;

            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        }
    });

    y += 5;
    doc.setFontSize(11);
    doc.text("TOTALES DEL DÍA", 20, y); y += 8;
    doc.text(`Asistencia total: ${totalAsistencia}`, 20, y); y += 6;
    doc.text(`Ofrenda total: ${totalOfrenda}`, 20, y); y += 6;
    doc.text(`Visitas totales: ${totalVisitas}`, 20, y);

    doc.save(`reporte_diario_${fechaSeleccionada}.pdf`);
}

function pdfMensual() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const informes = JSON.parse(localStorage.getItem("informes")) || [];
    const hoy = new Date();
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();

    let y = 20;
    let totalAsistencia = 0, totalOfrenda = 0, totalVisitas = 0;

    doc.setFontSize(14);
    doc.text("REPORTE MENSUAL", 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Mes: ${mes + 1}  Año: ${anio}`, 20, y);
    y += 10;

    informes.forEach(i => {
        const fecha = new Date(i.domingo);

        if (fecha.getMonth() === mes && fecha.getFullYear() === anio) {
            totalAsistencia += i.asistencia;
            totalOfrenda += i.ofrendas;
            totalVisitas += i.visitas;

            doc.text(`Fecha: ${i.domingo}`, 20, y); y += 6;
            doc.text(`Clase: ${i.clase}`, 20, y); y += 6;
            doc.text(`Maestro: ${i.maestro}`, 20, y); y += 6;
            doc.text(`Asistencia: ${i.asistencia}`, 20, y); y += 6;
            doc.text(`Ofrenda: ${i.ofrendas}`, 20, y); y += 6;
            doc.text(`Visitas: ${i.visitas}`, 20, y); y += 8;

            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        }
    });

    y += 5;
    doc.setFontSize(11);
    doc.text("TOTALES DEL MES", 20, y); y += 8;
    doc.text(`Asistencia total: ${totalAsistencia}`, 20, y); y += 6;
    doc.text(`Ofrenda total: ${totalOfrenda}`, 20, y); y += 6;
    doc.text(`Visitas totales: ${totalVisitas}`, 20, y);

    doc.save(`reporte_mensual_${mes + 1}_${anio}.pdf`);
}

function pdfAnual() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const informes = JSON.parse(localStorage.getItem("informes")) || [];
    const anio = new Date().getFullYear();

    let y = 20;
    let totalAsistencia = 0, totalOfrenda = 0, totalVisitas = 0;

    doc.setFontSize(14);
    doc.text("REPORTE ANUAL", 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Año: ${anio}`, 20, y);
    y += 10;

    informes.forEach(i => {
        const fecha = new Date(i.domingo);

        if (fecha.getFullYear() === anio) {
            totalAsistencia += i.asistencia;
            totalOfrenda += i.ofrendas;
            totalVisitas += i.visitas;

            doc.text(`Fecha: ${i.domingo}`, 20, y); y += 6;
            doc.text(`Clase: ${i.clase}`, 20, y); y += 6;
            doc.text(`Maestro: ${i.maestro}`, 20, y); y += 6;
            doc.text(`Asistencia: ${i.asistencia}`, 20, y); y += 6;
            doc.text(`Ofrenda: ${i.ofrendas}`, 20, y); y += 6;
            doc.text(`Visitas: ${i.visitas}`, 20, y); y += 8;

            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        }
    });

    y += 5;
    doc.setFontSize(11);
    doc.text("TOTALES DEL AÑO", 20, y); y += 8;
    doc.text(`Asistencia total: ${totalAsistencia}`, 20, y); y += 6;
    doc.text(`Ofrenda total: ${totalOfrenda}`, 20, y); y += 6;
    doc.text(`Visitas totales: ${totalVisitas}`, 20, y);

    doc.save(`reporte_anual_${anio}.pdf`);
}

function filtrarPorMes() {
    const mes = document.getElementById("mesFiltro").value;
    const anio = document.getElementById("anioFiltro").value;

    listaInformes.innerHTML = "";

    if (mes === "" || anio === "") {
        alert("Seleccione mes y año");
        return;
    }

    const filtrados = informes.filter(i => {
        const fecha = new Date(i.domingo);
        return (
            fecha.getMonth() === parseInt(mes) &&
            fecha.getFullYear() === parseInt(anio)
        );
    });

    if (filtrados.length === 0) {
        listaInformes.innerHTML = "<li>No hay informes para ese mes</li>";
        return;
    }

    filtrados.forEach(inf => {
        const indexReal = informes.indexOf(inf);

        const li = document.createElement("li");
        li.style.marginBottom = "10px";

        li.innerHTML = `
            <strong>${inf.domingo} - ${inf.clase}</strong> (Maestr@: ${inf.maestro})<br>
            Asistencia: ${inf.asistencia}, Ofrendas: ${inf.ofrendas}, Visitas: ${inf.visitas}
            <br>
            <button onclick="editarInforme(${indexReal})">Editar</button>
            <button onclick="eliminarInforme(${indexReal})">Eliminar</button>
        `;

        listaInformes.appendChild(li);
    });
}

function existeRegistroPorFecha(fecha) {
    return informes.findIndex(i => i.domingo === fecha);
}


// Mostrar informes al cargar
mostrarInformes();
