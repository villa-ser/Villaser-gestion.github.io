document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
});

const SHEET_ID = '1XfQoCkNMXy5WLhQciVrRoc1Pz6yeKKiAZljR_KYpohM'; 
const URL_CLI = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=NombresClientes`;

let dataCli = [];
let clienteActual = null;
let listaAmbientes = [];
let editandoId = null;

// Configuración dinámica de circuitos
let circuitos = [
    { id: 'C1', tipo: 'IUG' },
    { id: 'C2', tipo: 'TUG' }
];

window.onload = init;

async function init() {
    try {
        const resCli = await fetch(URL_CLI);
        dataCli = parseCSV(await resCli.text());
        
        document.getElementById('status').style.display = "none";
        document.getElementById('step-cliente').style.display = "block";
        
        const selCliente = document.getElementById('selCliente');
        dataCli.forEach((c, idx) => { 
            const opt = document.createElement('option');
            opt.value = idx; opt.textContent = c.c0;
            selCliente.appendChild(opt);
        });
        selCliente.addEventListener('change', fillClientData);
    } catch (e) { 
        document.getElementById('status').innerText = "⚠️ Error de conexión."; 
    }
}

function parseCSV(text) {
    return text.split('\n').slice(1).map(line => {
        const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => {
            let val = c.trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            return val.replace(/""/g, '"').trim();
        });
        return { c0: cells[0]||"", c1: cells[1]||"", c2: cells[2]||"", c3: cells[3]||"" };
    }).filter(item => item.c0);
}

function fillClientData() {
    const idx = document.getElementById('selCliente').value;
    if (idx === "") { 
        document.getElementById('cliTel').value = ""; document.getElementById('cliDir').value = ""; return; 
    }
    document.getElementById('cliTel').value = dataCli[idx].c1;
    document.getElementById('cliDir').value = dataCli[idx].c2;
}

function cargarCliente() {
    const idx = document.getElementById('selCliente').value;
    if (idx === "") return alert("Seleccione un cliente.");
    const c = dataCli[idx];
    clienteActual = {
        nombre: c.c0.split(' ')[0].trim().replace(/[^a-zA-Z0-9]/g, ''),
        nombreCompleto: c.c0, tel: c.c1, dir: c.c2,
        fecha: new Date().toLocaleDateString('es-AR')
    };
    
    document.getElementById('step-cliente').style.display = 'none';
    document.getElementById('step-trabajo').style.display = 'flex';
    actualizarGestorCircuitos();
    renderTabla();
}

// ==========================================
// LÓGICA DE CIRCUITOS Y GRADO AEA
// ==========================================
function obtenerGradoElectrificacion(areaTotal) {
    if (areaTotal <= 60) return "MÍNIMO";
    if (areaTotal <= 130) return "MEDIO";
    if (areaTotal <= 200) return "ELEVADO";
    return "SUPERIOR";
}

function autoAjustarCircuitos(grado) {
    // Ajusta la cantidad mínima de circuitos según AEA
    let requeridos = 2;
    if (grado === "MEDIO") requeridos = 3;
    if (grado === "ELEVADO") requeridos = 5;
    if (grado === "SUPERIOR") requeridos = 6;

    while(circuitos.length < requeridos) {
        let num = circuitos.length + 1;
        // Alternamos entre TUG e IUG por defecto al crear
        let tipo = (num % 2 === 0) ? 'TUG' : 'IUG'; 
        circuitos.push({ id: `C${num}`, tipo: tipo });
    }
    actualizarGestorCircuitos();
}

function actualizarGestorCircuitos() {
    const container = document.getElementById('listaConfigCircuitos');
    container.innerHTML = '';
    
    circuitos.forEach((c, index) => {
        container.innerHTML += `
            <div style="display: flex; gap: 10px; align-items: center;">
                <b style="color:var(--text-main); width: 30px;">${c.id}</b>
                <select class="native-select" style="padding: 5px; font-size: 0.8rem;" onchange="cambiarTipoCircuito(${index}, this.value)">
                    <option value="IUG" ${c.tipo==='IUG'?'selected':''}>IUG</option>
                    <option value="TUG" ${c.tipo==='TUG'?'selected':''}>TUG</option>
                    <option value="TUE" ${c.tipo==='TUE'?'selected':''}>TUE</option>
                    <option value="ACU" ${c.tipo==='ACU'?'selected':''}>ACU</option>
                    <option value="MBTF" ${c.tipo==='MBTF'?'selected':''}>MBTF</option>
                </select>
                ${index >= 2 ? `<button onclick="eliminarCircuito(${index})" style="background:transparent; border:none; color:red; cursor:pointer;">✕</button>` : ''}
            </div>
        `;
    });

    actualizarSelectoresEnFormulario();
}

function cambiarTipoCircuito(index, nuevoTipo) {
    circuitos[index].tipo = nuevoTipo;
    actualizarGestorCircuitos();
    renderTabla();
}

function agregarCircuitoManual() {
    let num = circuitos.length + 1;
    circuitos.push({ id: `C${num}`, tipo: 'ACU' });
    actualizarGestorCircuitos();
    renderTabla();
}

function eliminarCircuito(index) {
    if(index < 2) return; // C1 y C2 son intocables mínimos
    const circAEliminar = circuitos[index].id;
    
    // Limpiar usos de este circuito en ambientes
    listaAmbientes.forEach(amb => {
        if(amb.circIUG === circAEliminar) amb.circIUG = "";
        if(amb.circTUG === circAEliminar) amb.circTUG = "";
        if(amb.circESP === circAEliminar) amb.circESP = "";
    });

    circuitos.splice(index, 1);
    
    // Renombrar IDs para mantener correlatividad (C1, C2, C3...)
    circuitos.forEach((c, i) => {
        let viejoId = c.id;
        let nuevoId = `C${i+1}`;
        if(viejoId !== nuevoId) {
            c.id = nuevoId;
            listaAmbientes.forEach(amb => {
                if(amb.circIUG === viejoId) amb.circIUG = nuevoId;
                if(amb.circTUG === viejoId) amb.circTUG = nuevoId;
                if(amb.circESP === viejoId) amb.circESP = nuevoId;
            });
        }
    });

    actualizarGestorCircuitos();
    renderTabla();
}

function actualizarSelectoresEnFormulario() {
    const selects = document.querySelectorAll('.dynamic-circ-select');
    selects.forEach(sel => {
        let valActual = sel.value;
        sel.innerHTML = '<option value="">-- Circuito --</option>';
        circuitos.forEach(c => {
            sel.innerHTML += `<option value="${c.id}">${c.id} ${c.tipo}</option>`;
        });
        sel.value = valActual; 
    });
}

// ==========================================
// LÓGICA DE AMBIENTES
// ==========================================
function validarBocasAEA(tipo, area, largo, grado, totalIUG, totalTUG) {
    let minIUG = 0, minTUG = 0;
    
    if (tipo.includes("Estar") || tipo.includes("Comedor") || tipo.includes("Living")) {
        minIUG = Math.max((grado === 'ELEVADO' || grado === 'SUPERIOR') ? 2 : 1, Math.ceil(area / 18));
        minTUG = Math.max((grado === 'ELEVADO' || grado === 'SUPERIOR') ? 3 : 2, Math.ceil(area / 6));
    } else if (tipo === "Dormitorio") {
        if (area < 10) { minIUG = 1; minTUG = 2; }
        else {
            minIUG = (grado === 'ELEVADO' || grado === 'SUPERIOR') ? 2 : 1;
            minTUG = (grado === 'ELEVADO' || grado === 'SUPERIOR') ? 3 : 2;
        }
    } else if (tipo === "Cocina") {
        minIUG = 2;
        minTUG = (grado === 'ELEVADO' || grado === 'SUPERIOR') ? 7 : (grado === 'MEDIO' ? 6 : 5);
    } else if (tipo === "Baño") {
        minIUG = 1; minTUG = 1;
    } else if (tipo === "Toilette") {
        minIUG = 1; minTUG = 1; 
    } else if (tipo === "Pasillo") {
        let l = largo > 0 ? largo : Math.sqrt(area);
        minIUG = Math.max(1, Math.ceil(l / 5));
        minTUG = Math.max(1, Math.ceil(l / 5));
    } else if (tipo === "Lavadero") {
        minIUG = 1;
        minTUG = (grado === 'ELEVADO' || grado === 'SUPERIOR') ? 2 : 1;
    } else if (tipo.includes("Exterior") || tipo.includes("Balcón") || tipo.includes("Galería")) {
        let l = largo > 0 ? largo : Math.sqrt(area*2);
        minIUG = (grado === 'ELEVADO' || grado === 'SUPERIOR') ? Math.max(1, Math.ceil(l / 5)) : 1;
        minTUG = 0;
    }

    return {
        iugValido: totalIUG >= minIUG,
        tugValido: totalTUG >= minTUG,
        minIUG: minIUG,
        minTUG: minTUG
    };
}

function guardarAmbiente() {
    const tipo = document.getElementById('selAmbiente').value;
    const ancho = parseFloat(document.getElementById('inputAncho').value.replace(',', '.')) || 0;
    const largo = parseFloat(document.getElementById('inputLargo').value.replace(',', '.')) || 0;
    
    const bIUG = parseInt(document.getElementById('bocasIUG').value) || 0;
    const circIUG = document.getElementById('circuitoIUG').value;
    
    const bTUG = parseInt(document.getElementById('bocasTUG').value) || 0;
    const circTUG = document.getElementById('circuitoTUG').value;

    const bESP = parseInt(document.getElementById('bocasESP').value) || 0;
    const circESP = document.getElementById('circuitoESP').value;
    const descESP = document.getElementById('descESP').value.trim();

    if (!tipo) return alert("Seleccione el tipo de ambiente o carga.");
    
    // Si no es un artefacto puntual (Aire/Motor), exijo medidas
    if (!tipo.includes("Acondicionado") && !tipo.includes("Motor") && (ancho <= 0 || largo <= 0)) {
        return alert("Ingrese medidas válidas para el ambiente.");
    }

    if (bIUG > 0 && !circIUG) return alert("Seleccione circuito para bocas de Iluminación.");
    if (bTUG > 0 && !circTUG) return alert("Seleccione circuito para bocas de Toma.");
    if (bESP > 0 && !circESP) return alert("Seleccione circuito para bocas Específicas.");

    const area = (tipo.includes("Exterior") || tipo.includes("Balcón") || tipo.includes("Galería")) ? (ancho * largo) / 2 : (ancho * largo);

    const obj = {
        id: editandoId ? parseInt(editandoId) : Date.now(),
        tipo, ancho, largo, area, 
        bIUG, circIUG, bTUG, circTUG, bESP, circESP, descESP
    };

    if (editandoId) {
        const idx = listaAmbientes.findIndex(a => a.id === obj.id);
        if (idx !== -1) listaAmbientes[idx] = obj;
        cancelarEdicion();
    } else {
        listaAmbientes.push(obj);
    }

    limpiarForm();
    calcularGradoYRenderizar();
}

function limpiarForm() {
    document.getElementById('selAmbiente').value = "";
    document.getElementById('inputAncho').value = ""; document.getElementById('inputLargo').value = "";
    document.getElementById('bocasIUG').value = "0"; document.getElementById('circuitoIUG').value = "";
    document.getElementById('bocasTUG').value = "0"; document.getElementById('circuitoTUG').value = "";
    document.getElementById('bocasESP').value = "0"; document.getElementById('circuitoESP').value = "";
    document.getElementById('descESP').value = "";
}

function editarAmbiente(id) {
    const amb = listaAmbientes.find(a => a.id === id);
    if(!amb) return;

    editandoId = id;
    document.getElementById('titulo-form-ambiente').innerText = "✏️ Editando Ambiente";
    document.getElementById('btnGuardarAmbiente').innerText = "✓ Actualizar Ambiente";
    document.getElementById('btnGuardarAmbiente').classList.add('btn-warning');
    document.getElementById('btnCancelarEdicion').style.display = "block";

    document.getElementById('selAmbiente').value = amb.tipo;
    document.getElementById('inputAncho').value = amb.ancho || "";
    document.getElementById('inputLargo').value = amb.largo || "";
    
    document.getElementById('bocasIUG').value = amb.bIUG;
    document.getElementById('circuitoIUG').value = amb.circIUG;
    
    document.getElementById('bocasTUG').value = amb.bTUG;
    document.getElementById('circuitoTUG').value = amb.circTUG;

    document.getElementById('bocasESP').value = amb.bESP;
    document.getElementById('circuitoESP').value = amb.circESP;
    document.getElementById('descESP').value = amb.descESP;
    
    window.scrollTo(0, document.getElementById('step-trabajo').offsetTop);
}

function cancelarEdicion() {
    editandoId = null;
    document.getElementById('titulo-form-ambiente').innerText = "Carga de Ambientes y Bocas";
    document.getElementById('btnGuardarAmbiente').innerText = "➕ Agregar Ambiente";
    document.getElementById('btnGuardarAmbiente').classList.remove('btn-warning');
    document.getElementById('btnCancelarEdicion').style.display = "none";
    limpiarForm();
}

function borrarItem(id) {
    listaAmbientes = listaAmbientes.filter(i => i.id !== id);
    calcularGradoYRenderizar();
}

// ==========================================
// RENDERIZADO DE TABLA Y PDF
// ==========================================
function calcularGradoYRenderizar() {
    let areaTotal = 0;
    listaAmbientes.forEach(i => {
        if(!i.tipo.includes("Acondicionado") && !i.tipo.includes("Motor")) areaTotal += i.area;
    });
    
    const gradoActual = obtenerGradoElectrificacion(areaTotal);
    autoAjustarCircuitos(gradoActual);
    
    document.getElementById('ui-sla').innerText = `${areaTotal.toFixed(2)} m²`;
    document.getElementById('ui-grado').innerText = gradoActual;

    renderTabla(areaTotal, gradoActual);
}

function renderTabla(areaTotal, gradoActual) {
    const thead = document.getElementById('cabeceraTabla');
    const tbody = document.getElementById('cuerpoTabla');
    const tfoot = document.getElementById('pieTabla');
    
    // Generar Cabeceras Dinámicas
    let ths = `<tr style="border-bottom: 1px solid var(--ngc-primary); color: var(--ngc-primary);">
                <th style="text-align:left; padding:5px;">Ambiente</th>
                <th>m²</th>`;
    circuitos.forEach(c => ths += `<th>${c.id}<br><small>${c.tipo}</small></th>`);
    ths += `<th>Editar</th><th>Borrar</th></tr>`;
    thead.innerHTML = ths;

    tbody.innerHTML = '';
    
    // Totales por circuito
    let totalesCircuitos = {};
    circuitos.forEach(c => totalesCircuitos[c.id] = 0);

    listaAmbientes.forEach(i => {
        // Validación AEA
        const val = validarBocasAEA(i.tipo, i.area, i.largo, gradoActual, i.bIUG, i.bTUG);
        
        let colorIUG = val.iugValido ? "var(--ngc-success)" : "var(--ngc-danger)";
        let colorTUG = val.tugValido ? "var(--ngc-success)" : "var(--ngc-danger)";

        let celdasCircuitos = "";
        
        circuitos.forEach(c => {
            let cant = 0;
            let colorStr = "color: #ccc;"; // Default
            let desc = "";

            if (i.circIUG === c.id) { cant += i.bIUG; colorStr = `color: ${colorIUG}; font-weight:bold;`; }
            if (i.circTUG === c.id) { cant += i.bTUG; colorStr = `color: ${colorTUG}; font-weight:bold;`; }
            if (i.circESP === c.id) { cant += i.bESP; colorStr = `color: var(--ngc-warning); font-weight:bold;`; desc = i.descESP; }
            
            totalesCircuitos[c.id] += cant;

            let texto = cant > 0 ? cant : "-";
            if (desc && cant > 0) texto += `<br><small style="color:#888;">${desc}</small>`;

            celdasCircuitos += `<td style="${colorStr}">${texto}</td>`;
        });

        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="text-align:left; padding:8px 5px;">${i.tipo}</td>
                <td>${(i.area > 0 && !i.tipo.includes("Carga")) ? i.area.toFixed(2) : '-'}</td>
                ${celdasCircuitos}
                <td><button onclick="editarAmbiente(${i.id})" style="background:transparent; border:none; color:var(--ngc-primary); cursor:pointer;">✏️</button></td>
                <td><button onclick="borrarItem(${i.id})" style="background:transparent; border:none; color:red; cursor:pointer;">✕</button></td>
            </tr>
        `;
    });

    // Construir Pie
    let tfootStr = `<tr><td style="text-align:left; padding:8px 5px;">TOTAL BOCAS</td><td>-</td>`;
    circuitos.forEach(c => tfootStr += `<td>${totalesCircuitos[c.id]}</td>`);
    tfootStr += `<td>-</td><td>-</td></tr>`;
    tfoot.innerHTML = tfootStr;

    sincronizarVistaPreviaPDF(areaTotal, gradoActual, totalesCircuitos);
}

function sincronizarVistaPreviaPDF(areaTotal, grado, totalesCircuitos) {
    if (!clienteActual) return;
    document.getElementById('pdf-cliente').innerText = clienteActual.nombreCompleto;
    document.getElementById('pdf-fecha').innerText = clienteActual.fecha;

    const thead = document.getElementById('pdf-thead');
    const tbody = document.getElementById('pdf-tbody');
    const tfoot = document.getElementById('pdf-tfoot');
    
    let ths = `<tr><th style="text-align: left;">Ambiente</th><th>m²</th>`;
    circuitos.forEach(c => ths += `<th>${c.id} ${c.tipo}</th>`);
    ths += `</tr>`;
    thead.innerHTML = ths;

    tbody.innerHTML = '';
    
    listaAmbientes.forEach(i => {
        let celdas = "";
        circuitos.forEach(c => {
            let cant = 0;
            let desc = "";
            if (i.circIUG === c.id) cant += i.bIUG;
            if (i.circTUG === c.id) cant += i.bTUG;
            if (i.circESP === c.id) { cant += i.bESP; desc = i.descESP; }
            
            let txt = cant > 0 ? cant : "-";
            if (desc && cant > 0) txt += `<br><span style="font-size:8px;">${desc}</span>`;
            celdas += `<td>${txt}</td>`;
        });

        tbody.innerHTML += `
            <tr>
                <td style="text-align: left;">${i.tipo}</td>
                <td>${(i.area > 0 && !i.tipo.includes("Carga")) ? i.area.toFixed(2) : '-'}</td>
                ${celdas}
            </tr>
        `;
    });

    let tfootStr = `<tr><td style="text-align: left; padding: 5px;">TOTAL BOCAS</td><td>-</td>`;
    circuitos.forEach(c => tfootStr += `<td>${totalesCircuitos[c.id]}</td>`);
    tfootStr += `</tr>`;
    tfoot.innerHTML = tfootStr;

    document.getElementById('pdf-sla-val').innerText = areaTotal.toFixed(2);
    document.getElementById('pdf-grado-val').innerText = grado;
}

async function generarPDF() {
    if (listaAmbientes.length === 0) return alert("Debe cargar ambientes.");
    const element = document.getElementById('plantilla-pdf');
    element.style.display = 'block';
    
    const opt = {
        margin: 0,
        filename: `${clienteActual.nombre}_Planilla_Circuitos.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } // Pasado a Landscape (horizontal) para que entren más circuitos
    };
    
    await html2pdf().set(opt).from(element).save();
    if (window.innerWidth < 992) element.style.display = 'none';
}
