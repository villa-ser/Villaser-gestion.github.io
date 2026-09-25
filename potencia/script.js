document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
});

const SHEET_ID = '1XfQoCkNMXy5WLhQciVrRoc1Pz6yeKKiAZljR_KYpohM'; 
const URL_CLI = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=NombresClientes`;

// MAPEADO DIRECTO AEA 90364-7-770 (Tabla 770.12.I - Embutido B1, 2x cargados + PE a 40°C)
const MAPA_IZ = { 
    "1.5": 15, 
    "2.5": 21, 
    "4": 28, 
    "6": 36, 
    "10": 50, 
    "16": 66 
};

let dataCli = [];
let clienteActual = null;
let listaAmbientes = [];
let editandoId = null;

// Circuitos inician vacíos en selecciones, esperando ingreso del usuario
let circuitos = [
    { id: 'C1', tipo: 'IUG', dpms: 0, userEditedDpms: false, tension: '', seccionLN: '', seccionPE: '', iz: '', in: '' },
    { id: 'C2', tipo: 'TUG', dpms: 2200, userEditedDpms: false, tension: '', seccionLN: '', seccionPE: '', iz: '', in: '' }
];
// Objeto especial para el Tablero/Circuito Seccional (CS)
let circuitoCS = { id: 'CS', tipo: 'T.P.', dpms: 0, tension: '', seccionLN: '', seccionPE: '', iz: '', in: '' };

window.onload = init;

async function init() {
    try {
        const resCli = await fetch(URL_CLI);
        dataCli = parseCSV(await resCli.text());
        document.getElementById('status').style.display = "none";
        document.getElementById('step-cliente').style.display = "block";
        poblarSelectorClientes(dataCli);
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

function poblarSelectorClientes(lista) {
    const selCliente = document.getElementById('selCliente');
    selCliente.innerHTML = '<option value="">-- SELECCIONE CLIENTE --</option>';
    lista.forEach((c, idx) => { 
        const opt = document.createElement('option');
        opt.value = dataCli.indexOf(c); 
        opt.textContent = c.c0;
        selCliente.appendChild(opt);
    });
}

function filtrarClientes() {
    const textoBuscado = document.getElementById('buscarCliente').value.toLowerCase();
    const listaFiltrada = dataCli.filter(c => c.c0.toLowerCase().includes(textoBuscado));
    poblarSelectorClientes(listaFiltrada);
}

function fillClientData() {
    const idx = document.getElementById('selCliente').value;
    if (idx === "") { document.getElementById('cliTel').value = ""; document.getElementById('cliDir').value = ""; return; }
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

function obtenerGradoElectrificacion(areaTotal) {
    if (areaTotal <= 60) return "MÍNIMO";
    if (areaTotal <= 130) return "MEDIO";
    if (areaTotal <= 200) return "ELEVADO";
    return "SUPERIOR";
}

function autoAjustarCircuitos(grado) {
    let requeridos = 2;
    if (grado === "MEDIO") requeridos = 3;
    if (grado === "ELEVADO") requeridos = 5;
    if (grado === "SUPERIOR") requeridos = 6;
    while(circuitos.length < requeridos) {
        let num = circuitos.length + 1;
        let tipo = (num % 2 === 0) ? 'TUG' : 'IUG'; 
        circuitos.push({ 
            id: `C${num}`, tipo: tipo, dpms: tipo==='TUG'?2200:0, userEditedDpms: false, 
            tension: '', seccionLN: '', seccionPE: '', iz: '', in: '' 
        });
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
            </div>`;
    });
    actualizarSelectoresEnFormulario();
}

function cambiarTipoCircuito(index, nuevoTipo) {
    circuitos[index].tipo = nuevoTipo;
    if(!circuitos[index].userEditedDpms) {
        if(nuevoTipo === 'TUG') circuitos[index].dpms = 2200;
        else if(nuevoTipo === 'TUE') circuitos[index].dpms = 3300;
        else circuitos[index].dpms = 0;
    }
    actualizarGestorCircuitos();
    renderTabla();
}

function agregarCircuitoManual() {
    let num = circuitos.length + 1;
    circuitos.push({ id: `C${num}`, tipo: 'ACU', dpms: 0, userEditedDpms: false, tension: '', seccionLN: '', seccionPE: '', iz: '', in: '' });
    actualizarGestorCircuitos();
    renderTabla();
}

function eliminarCircuito(index) {
    if(index < 2) return;
    const circAEliminar = circuitos[index].id;
    listaAmbientes.forEach(amb => {
        if(amb.circIUG === circAEliminar) amb.circIUG = "";
        if(amb.circTUG === circAEliminar) amb.circTUG = "";
        if(amb.circESP === circAEliminar) amb.circESP = "";
    });
    circuitos.splice(index, 1);
    circuitos.forEach((c, i) => {
        let viejoId = c.id; let nuevoId = `C${i+1}`;
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
        circuitos.forEach(c => { sel.innerHTML += `<option value="${c.id}">${c.id}${c.tipo}</option>`; });
        sel.value = valActual; 
    });
}

function guardarAmbiente() {
    const tipo = document.getElementById('selAmbiente').value;
    const ancho = parseFloat(document.getElementById('inputAncho').value.replace(',', '.')) || 0;
    const largo = parseFloat(document.getElementById('inputLargo').value.replace(',', '.')) || 0;
    const bIUG = parseInt(document.getElementById('bocasIUG').value) || 0; const circIUG = document.getElementById('circuitoIUG').value;
    const bTUG = parseInt(document.getElementById('bocasTUG').value) || 0; const circTUG = document.getElementById('circuitoTUG').value;
    const bESP = parseInt(document.getElementById('bocasESP').value) || 0; const circESP = document.getElementById('circuitoESP').value;
    const descESP = document.getElementById('descESP').value.trim();

    if (!tipo) return alert("Seleccione el tipo de ambiente o carga.");
    if (!tipo.includes("Acondicionado") && !tipo.includes("Motor") && (ancho <= 0 || largo <= 0)) return alert("Ingrese medidas válidas.");
    
    let areaCalculada = ancho * largo;
    if (tipo.includes("Semi") || tipo.includes("Balcón") || tipo.includes("Exterior")) {
        areaCalculada = areaCalculada / 2;
    }

    const obj = {
        id: editandoId ? parseInt(editandoId) : Date.now(),
        tipo, ancho, largo, area: areaCalculada, bIUG, circIUG, bTUG, circTUG, bESP, circESP, descESP
    };

    if (editandoId) {
        const idx = listaAmbientes.findIndex(a => a.id === obj.id);
        if (idx !== -1) listaAmbientes[idx] = obj;
        cancelarEdicion();
    } else { listaAmbientes.push(obj); }

    document.getElementById('selAmbiente').value = "";
    document.getElementById('inputAncho').value = ""; document.getElementById('inputLargo').value = "";
    document.getElementById('bocasIUG').value = "0"; document.getElementById('circuitoIUG').value = "";
    document.getElementById('bocasTUG').value = "0"; document.getElementById('circuitoTUG').value = "";
    document.getElementById('bocasESP').value = "0"; document.getElementById('circuitoESP').value = ""; document.getElementById('descESP').value = "";
    
    calcularGradoYRenderizar();
}

function editarAmbiente(id) {
    const amb = listaAmbientes.find(a => a.id === id);
    if(!amb) return;
    editandoId = id;
    document.getElementById('titulo-form-ambiente').innerText = "✏️ Editando Ambiente";
    document.getElementById('btnGuardarAmbiente').innerText = "✓ Actualizar Ambiente";
    document.getElementById('btnCancelarEdicion').style.display = "block";
    document.getElementById('selAmbiente').value = amb.tipo;
    document.getElementById('inputAncho').value = amb.ancho || ""; document.getElementById('inputLargo').value = amb.largo || "";
    document.getElementById('bocasIUG').value = amb.bIUG; document.getElementById('circuitoIUG').value = amb.circIUG;
    document.getElementById('bocasTUG').value = amb.bTUG; document.getElementById('circuitoTUG').value = amb.circTUG;
    document.getElementById('bocasESP').value = amb.bESP; document.getElementById('circuitoESP').value = amb.circESP;
    document.getElementById('descESP').value = amb.descESP;
    window.scrollTo(0, document.getElementById('step-trabajo').offsetTop);
}

function cancelarEdicion() {
    editandoId = null;
    document.getElementById('titulo-form-ambiente').innerText = "Carga de Ambientes y Bocas";
    document.getElementById('btnGuardarAmbiente').innerText = "➕ Agregar Ambiente";
    document.getElementById('btnCancelarEdicion').style.display = "none";
}

function borrarItem(id) { listaAmbientes = listaAmbientes.filter(i => i.id !== id); calcularGradoYRenderizar(); }

// Actualizador global dinámico
window.updC = function(id, field, value) {
    let c = (id === 'CS') ? circuitoCS : circuitos.find(x => x.id === id);
    if(c) {
        c[field] = value === "" ? "" : (parseFloat(value) || value);
        if(id !== 'CS' && field === 'dpms') c.userEditedDpms = true;
        
        // AUTO-CALCULO DE IZ SEGÚN AEA 90364-7-770 (Tabla 770.12.I)
        if (field === 'seccionLN') {
            if (MAPA_IZ[value]) {
                c['iz'] = MAPA_IZ[value];
            }
        }
        
        renderTabla();
    }
}

// Helper para crear desplegables con validación de color
function buildSelectHtml(id, field, currentVal, optionsList, validationColor) {
    let colorStyle = (currentVal !== "") ? `color: ${validationColor}; font-weight:bold;` : `color: white;`;
    let html = `<select class="circ-input" style="${colorStyle}" onchange="updC('${id}','${field}',this.value)">`;
    html += `<option value="">-</option>`;
    optionsList.forEach(opt => {
        let sel = (currentVal !== "" && currentVal == opt) ? "selected" : "";
        html += `<option value="${opt}" ${sel}>${opt}</option>`;
    });
    html += `</select>`;
    return html;
}

function calcularGradoYRenderizar() {
    let areaTotal = 0;
    listaAmbientes.forEach(i => { if(!i.tipo.includes("Acondicionado") && !i.tipo.includes("Motor")) areaTotal += i.area; });
    const gradoActual = obtenerGradoElectrificacion(areaTotal);
    autoAjustarCircuitos(gradoActual);
    document.getElementById('ui-sla').innerText = `${areaTotal.toFixed(2)} m²`;
    document.getElementById('ui-grado').innerText = gradoActual;
    renderTabla(areaTotal, gradoActual);
}

function renderTabla(areaTotal, gradoActual) {
    areaTotal = areaTotal || parseFloat(document.getElementById('ui-sla').innerText) || 0;
    gradoActual = gradoActual || document.getElementById('ui-grado').innerText;

    const thead = document.getElementById('cabeceraTabla');
    const tbody = document.getElementById('cuerpoTabla');
    const tfoot = document.getElementById('pieTabla');
    
    let todosLosCircuitos = [...circuitos, circuitoCS];

    // Se establece un min-width estructurado para garantizar que los circuitos no se estiren demasiado ni se achiquen
    let ths = `<tr style="border-bottom: 1px solid var(--ngc-primary); color: var(--ngc-primary);">
                <th style="text-align:left; padding:5px; position: sticky; left:0; background:#1e1e1e; z-index:2; min-width: 80px;">Ambiente</th>
                <th style="min-width: 35px;">m²</th>`;
    todosLosCircuitos.forEach(c => {
        let name = c.id === 'CS' ? "C.S.<br><small>Tablero</small>" : `${c.id}<br><small>${c.tipo}</small>`;
        ths += `<th style="min-width: 52px;">${name}</th>`;
    });
    ths += `<th style="min-width: 25px;"></th><th style="min-width: 25px;"></th></tr>`;
    thead.innerHTML = ths;
    tbody.innerHTML = '';
    
    let totalesBocas = {};
    circuitos.forEach(c => totalesBocas[c.id] = 0);

    listaAmbientes.forEach(i => {
        let celdasCircuitos = "";
        circuitos.forEach(c => {
            let cant = 0; let desc = "";
            if (i.circIUG === c.id) cant += i.bIUG;
            if (i.circTUG === c.id) cant += i.bTUG;
            if (i.circESP === c.id) { cant += i.bESP; desc = i.descESP; }
            totalesBocas[c.id] += cant;
            let texto = cant > 0 ? cant : "-";
            if (desc && cant > 0) texto += `<br><small style="color:#888;">${desc}</small>`;
            celdasCircuitos += `<td>${texto}</td>`;
        });
        
        celdasCircuitos += `<td>-</td>`;

        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="text-align:left; padding:8px 5px; position: sticky; left:0; background:#1e1e1e; z-index:1;">${i.tipo}</td>
                <td>${(i.area > 0 && !i.tipo.includes("Carga")) ? i.area.toFixed(2) : '-'}</td>
                ${celdasCircuitos}
                <td><button onclick="editarAmbiente(${i.id})" style="background:transparent; border:none; color:var(--ngc-primary); cursor:pointer;">✏️</button></td>
                <td><button onclick="borrarItem(${i.id})" style="background:transparent; border:none; color:red; cursor:pointer;">✕</button></td>
            </tr>`;
    });

    let dpmsTotal = 0;
    circuitos.forEach(c => {
        if(!c.userEditedDpms && c.tipo === 'IUG') c.dpms = Math.ceil(totalesBocas[c.id] * 150 * 0.66);
        dpmsTotal += c.dpms;
    });
    let coef = (gradoActual==='SUPERIOR')?0.7:(gradoActual==='ELEVADO'?0.8:(gradoActual==='MEDIO'?0.9:1));
    circuitoCS.dpms = dpmsTotal * coef;
    document.getElementById('ui-dpms').innerText = circuitoCS.dpms.toFixed(2) + ' VA';
    
    const sumElegido = document.getElementById('selSuministro').value;
    const faseAlerta = document.getElementById('ui-fase-alerta');
    if(circuitoCS.dpms > 7000 && sumElegido === 'MONOFÁSICO') {
        faseAlerta.innerText = "⚠️ RECOMENDADO TRIFÁSICO"; faseAlerta.style.color = "red";
    } else if (circuitoCS.dpms <= 7000 && sumElegido === 'TRIFÁSICO') {
        faseAlerta.innerText = "✓ EXCEDE REQ. (VÁLIDO)"; faseAlerta.style.color = "var(--ngc-success)";
    } else {
        faseAlerta.innerText = "✓ CUMPLE AEA"; faseAlerta.style.color = "var(--ngc-warning)";
    }

    let tfootStr = ``;

    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px; position: sticky; left:0; background:#1e1e1e; z-index:1;"><b>BOCAS T.</b></td>`;
    circuitos.forEach(c => {
        let b = totalesBocas[c.id];
        let color = b > 15 ? 'red' : 'var(--ngc-warning)';
        tfootStr += `<td style="color:${color}; font-weight:bold;">${b}</td>`;
    });
    tfootStr += `<td>-</td><td colspan="2"></td></tr>`;

    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px; position: sticky; left:0; background:#1e1e1e; z-index:1;"><b>DPMS (VA)</b></td>`;
    circuitos.forEach(c => {
        tfootStr += `<td><input type="number" class="circ-input" style="color:var(--ngc-success)" value="${c.dpms}" onchange="updC('${c.id}','dpms',this.value)"></td>`;
    });
    tfootStr += `<td style="color:var(--ngc-warning); font-weight:bold; font-size:0.75rem;">${circuitoCS.dpms.toFixed(0)}</td><td colspan="2"></td></tr>`;

    const evalVerdeRojo = (condicion) => condicion ? 'var(--ngc-success)' : 'red';

    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px; position: sticky; left:0; background:#1e1e1e; z-index:1;">Tensión (V)</td>`;
    todosLosCircuitos.forEach(c => {
        let col = c.tension !== "" ? 'var(--ngc-success)' : 'white';
        tfootStr += `<td>${buildSelectHtml(c.id, 'tension', c.tension, [220, 380], col)}</td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px; position: sticky; left:0; background:#1e1e1e; z-index:1;">Ib (A)</td>`;
    todosLosCircuitos.forEach(c => {
        let ib = "-";
        if(c.tension !== "") {
            let p = parseFloat(c.dpms);
            ib = (c.tension == 380) ? (p / (1.732 * 380)) : (p / c.tension);
            c._ibCalc = ib; 
            ib = ib.toFixed(2);
        }
        tfootStr += `<td style="color:var(--text-dim); font-size:0.7rem;">${ib}</td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px; position: sticky; left:0; background:#1e1e1e; z-index:1;">Sección (L;N) mm²</td>`;
    todosLosCircuitos.forEach(c => {
        let minL = (c.tipo === 'IUG' || c.tipo === 'MBTF') ? 1.5 : (c.id === 'CS' ? 4.0 : 2.5);
        let col = evalVerdeRojo(parseFloat(c.seccionLN) >= minL);
        tfootStr += `<td>${buildSelectHtml(c.id, 'seccionLN', c.seccionLN, [1.5, 2.5, 4, 6, 10, 16], col)}</td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px; position: sticky; left:0; background:#1e1e1e; z-index:1;">Sección PE mm²</td>`;
    todosLosCircuitos.forEach(c => {
        let col = evalVerdeRojo(c.seccionLN !== "" && parseFloat(c.seccionPE) >= parseFloat(c.seccionLN));
        tfootStr += `<td>${buildSelectHtml(c.id, 'seccionPE', c.seccionPE, [1.5, 2.5, 4, 6, 10, 16], col)}</td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px; position: sticky; left:0; background:#1e1e1e; z-index:1;">Iz (A)</td>`;
    todosLosCircuitos.forEach(c => {
        let col = evalVerdeRojo(c._ibCalc && parseFloat(c.iz) >= c._ibCalc);
        let valStr = c.iz === "" ? "" : c.iz;
        let style = c.iz !== "" ? `color: ${col}; font-weight:bold;` : 'color: white;';
        tfootStr += `<td><input type="number" class="circ-input" style="${style}" placeholder="-" value="${valStr}" onchange="updC('${c.id}','iz',this.value)"></td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px; position: sticky; left:0; background:#1e1e1e; z-index:1;">In (A)</td>`;
    todosLosCircuitos.forEach(c => {
        let ib = c._ibCalc || 0;
        let iz = parseFloat(c.iz) || 0;
        let pIn = parseFloat(c.in);
        let cumpleIn = (pIn >= ib && pIn <= iz);
        let col = evalVerdeRojo(cumpleIn);
        tfootStr += `<td>${buildSelectHtml(c.id, 'in', c.in, [2, 4, 6, 10, 15, 16, 20, 25, 32, 40, 50, 63], col)}</td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    tfoot.innerHTML = tfootStr;
    
    sincronizarVistaPreviaPDF(areaTotal, gradoActual, circuitoCS.dpms, sumElegido, totalesBocas, todosLosCircuitos);
}

function sincronizarVistaPreviaPDF(areaTotal, grado, dpmsPonderado, suministro, totalesBocas, todosArr) {
    if (!clienteActual) return;
    document.getElementById('pdf-cliente').innerText = clienteActual.nombreCompleto;
    document.getElementById('pdf-fecha').innerText = clienteActual.fecha;

    const thead = document.getElementById('pdf-thead');
    const tbody = document.getElementById('pdf-tbody');
    const tfoot = document.getElementById('pdf-tfoot');
    
    let ths = `<tr><th style="text-align: left;">Ambiente</th><th>m²</th>`;
    todosArr.forEach(c => ths += `<th>${c.id}${c.tipo.substring(0,4)}</th>`);
    ths += `</tr>`;
    thead.innerHTML = ths;
    tbody.innerHTML = '';
    
    listaAmbientes.forEach(i => {
        let celdas = "";
        circuitos.forEach(c => {
            let cant = 0; let desc = "";
            if (i.circIUG === c.id) cant += i.bIUG;
            if (i.circTUG === c.id) cant += i.bTUG;
            if (i.circESP === c.id) { cant += i.bESP; desc = i.descESP; }
            let txt = cant > 0 ? cant : "-";
            if (desc && cant > 0) txt += `<br><span style="font-size:7px;">${desc}</span>`;
            celdas += `<td>${txt}</td>`;
        });
        celdas += `<td>-</td>`; 
        tbody.innerHTML += `<tr><td style="text-align: left;">${i.tipo}</td><td>${(i.area > 0 && !i.tipo.includes("Carga")) ? i.area.toFixed(2) : '-'}</td>${celdas}</tr>`;
    });

    let tfootStr = ``;
    
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">BOCAS</td>`;
    circuitos.forEach(c => tfootStr += `<td>${totalesBocas[c.id]}</td>`); tfootStr += `<td>-</td></tr>`;
    
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">DPMS (VA)</td>`;
    todosArr.forEach(c => tfootStr += `<td>${c.id==='CS' ? c.dpms.toFixed(0) : c.dpms}</td>`); tfootStr += `</tr>`;
    
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">Tensión (V)</td>`;
    todosArr.forEach(c => tfootStr += `<td>${c.tension || '-'}</td>`); tfootStr += `</tr>`;
    
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">Ib (A)</td>`;
    todosArr.forEach(c => { 
        let ib = "-";
        if(c.tension) {
            ib = (c.tension == 380) ? (c.dpms / (1.732 * 380)) : (c.dpms / c.tension); 
            ib = ib.toFixed(1);
        }
        tfootStr += `<td>${ib}</td>`; 
    }); tfootStr += `</tr>`;
    
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">Secc L;N / PE</td>`;
    todosArr.forEach(c => tfootStr += `<td>${c.seccionLN || '-'}/${c.seccionPE || '-'}</td>`); tfootStr += `</tr>`;
    
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">Iz / In (A)</td>`;
    todosArr.forEach(c => tfootStr += `<td>${c.iz || '-'}/${c.in || '-'}</td>`); tfootStr += `</tr>`;

    tfoot.innerHTML = tfootStr;
    document.getElementById('pdf-sla-val').innerText = `${areaTotal.toFixed(2)} m²`;
    document.getElementById('pdf-grado-val').innerText = grado;
    document.getElementById('pdf-dpms-val').innerText = `${dpmsPonderado.toFixed(2)} VA`;
    document.getElementById('pdf-sum-val').innerText = suministro;
}

async function generarPDF() {
    if (listaAmbientes.length === 0) return alert("Debe cargar ambientes.");
    const element = document.getElementById('plantilla-pdf');
    element.style.display = 'block';
    
    const opt = {
        margin: [5, 5],
        filename: `${clienteActual.nombre}_Planilla_Circuitos.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    };
    
    await html2pdf().set(opt).from(element).save();
    if (window.innerWidth < 992) element.style.display = 'none';
}

// --- SISTEMA DE GUARDADO / APERTURA EN JSON ---
function guardarComoJSON() {
    if (!clienteActual) return alert("Debe cargar un proyecto o cliente primero.");
    const payload = {
        clienteActual,
        listaAmbientes,
        circuitos,
        circuitoCS
    };
    
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `VillaSer_${clienteActual.nombre}_Planilla.json`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function cargarDesdeJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if(!data.clienteActual) throw new Error("Formato inválido");
            
            clienteActual = data.clienteActual;
            listaAmbientes = data.listaAmbientes || [];
            circuitos = data.circuitos || [];
            circuitoCS = data.circuitoCS || { id: 'CS', tipo: 'T.P.', dpms: 0, tension: '', seccionLN: '', seccionPE: '', iz: '', in: '' };
            
            document.getElementById('step-cliente').style.display = 'none';
            document.getElementById('step-trabajo').style.display = 'flex';
            
            actualizarGestorCircuitos();
            calcularGradoYRenderizar();
            
            alert("✅ Proyecto cargado exitosamente.");
        } catch (err) {
            alert("⚠️ Error al leer el archivo. Asegúrese de que sea un archivo JSON válido exportado desde VillaSer.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; 
}
