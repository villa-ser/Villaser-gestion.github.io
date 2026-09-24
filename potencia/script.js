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

let circuitos = [
    { id: 'C1', tipo: 'IUG', dpms: 0, userEditedDpms: false, tension: 220, seccionLN: 1.5, seccionPE: 2.5, iz: 15, in: 10 },
    { id: 'C2', tipo: 'TUG', dpms: 2200, userEditedDpms: false, tension: 220, seccionLN: 2.5, seccionPE: 2.5, iz: 21, in: 16 }
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
            tension: 220, seccionLN: tipo==='IUG'?1.5:2.5, seccionPE: 2.5, iz: 15, in: 10 
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
    circuitos.push({ id: `C${num}`, tipo: 'ACU', dpms: 0, userEditedDpms: false, tension: 220, seccionLN: 2.5, seccionPE: 2.5, iz: 21, in: 16 });
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
    
    const area = (tipo.includes("Exterior") || tipo.includes("Balcón") || tipo.includes("Galería")) ? (ancho * largo) / 2 : (ancho * largo);
    const obj = {
        id: editandoId ? parseInt(editandoId) : Date.now(),
        tipo, ancho, largo, area, bIUG, circIUG, bTUG, circTUG, bESP, circESP, descESP
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

// Actualizador global de datos del circuito desde inputs
window.updC = function(id, field, value) {
    const c = circuitos.find(x => x.id === id);
    if(c) {
        c[field] = parseFloat(value) || value;
        if(field === 'dpms') c.userEditedDpms = true;
        renderTabla();
    }
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
    
    let ths = `<tr style="border-bottom: 1px solid var(--ngc-primary); color: var(--ngc-primary);">
                <th style="text-align:left; padding:5px;">Ambiente</th><th>m²</th>`;
    circuitos.forEach(c => ths += `<th>${c.id}<br><small>${c.tipo}</small></th>`);
    ths += `<th></th><th></th></tr>`;
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
        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="text-align:left; padding:8px 5px;">${i.tipo}</td>
                <td>${(i.area > 0 && !i.tipo.includes("Carga")) ? i.area.toFixed(2) : '-'}</td>
                ${celdasCircuitos}
                <td><button onclick="editarAmbiente(${i.id})" style="background:transparent; border:none; color:var(--ngc-primary); cursor:pointer;">✏️</button></td>
                <td><button onclick="borrarItem(${i.id})" style="background:transparent; border:none; color:red; cursor:pointer;">✕</button></td>
            </tr>`;
    });

    // Calcular DPMS Auto si no fue editado manualmente
    let dpmsTotal = 0;
    circuitos.forEach(c => {
        if(!c.userEditedDpms && c.tipo === 'IUG') c.dpms = Math.ceil(totalesBocas[c.id] * 150 * 0.66);
        dpmsTotal += c.dpms;
    });

    // Validar Potencia y Fases AEA
    let coef = (gradoActual==='SUPERIOR')?0.7:(gradoActual==='ELEVADO'?0.8:(gradoActual==='MEDIO'?0.9:1));
    let dpmsPonderado = dpmsTotal * coef;
    document.getElementById('ui-dpms').innerText = dpmsPonderado.toFixed(2) + ' VA';
    const sumElegido = document.getElementById('selSuministro').value;
    const faseAlerta = document.getElementById('ui-fase-alerta');
    
    if(dpmsPonderado > 7000 && sumElegido === 'MONOFÁSICO') {
        faseAlerta.innerText = "⚠️ RECOMENDADO TRIFÁSICO"; faseAlerta.style.color = "red";
    } else if (dpmsPonderado <= 7000 && sumElegido === 'TRIFÁSICO') {
        faseAlerta.innerText = "✓ EXCEDE REQ. (VÁLIDO)"; faseAlerta.style.color = "var(--ngc-success)";
    } else {
        faseAlerta.innerText = "✓ CUMPLE AEA"; faseAlerta.style.color = "var(--ngc-warning)";
    }

    // CONSTRUIR TFOOT COMPLEJO (Basado en la imagen)
    let tfootStr = ``;

    // 1. BOCAS TOTALES
    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px;"><b>TOTAL BOCAS</b></td>`;
    circuitos.forEach(c => {
        let b = totalesBocas[c.id];
        let color = b > 15 ? 'red' : 'var(--ngc-warning)';
        tfootStr += `<td style="color:${color}; font-weight:bold;">${b}</td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    // 2. DPMS (VA)
    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px;"><b>DPMS (VA)</b></td>`;
    circuitos.forEach(c => {
        let color = c.dpms > 0 ? 'var(--ngc-success)' : 'white';
        tfootStr += `<td><input type="number" class="circ-input" style="color:${color}" value="${c.dpms}" onchange="updC('${c.id}','dpms',this.value)"></td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    // 3. Tensión (V)
    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px;">Tensión (V)</td>`;
    circuitos.forEach(c => {
        tfootStr += `<td><select class="circ-input" onchange="updC('${c.id}','tension',this.value)">
            <option value="220" ${c.tension==220?'selected':''}>220</option>
            <option value="380" ${c.tension==380?'selected':''}>380</option>
        </select></td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    // 4. Ib (A)
    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px;">Ib (A)</td>`;
    circuitos.forEach(c => {
        let ib = (c.tension == 380) ? (c.dpms / (1.732 * 380)) : (c.dpms / c.tension);
        tfootStr += `<td style="color:var(--text-dim); font-size:0.7rem;">${ib.toFixed(2)}</td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    // 5. Sección Cable L;N
    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px;">Sección (L;N) mm²</td>`;
    circuitos.forEach(c => {
        let minL = (c.tipo === 'IUG' || c.tipo === 'MBTF') ? 1.5 : 2.5;
        let color = c.seccionLN >= minL ? 'var(--ngc-success)' : 'red';
        tfootStr += `<td><select class="circ-input" style="color:${color}" onchange="updC('${c.id}','seccionLN',this.value)">
            ${[1.5, 2.5, 4, 6, 10, 16].map(v => `<option value="${v}" ${c.seccionLN==v?'selected':''}>${v}</option>`).join('')}
        </select></td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    // 6. Sección Cable PE
    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px;">Sección PE mm²</td>`;
    circuitos.forEach(c => {
        let color = c.seccionPE >= c.seccionLN ? 'var(--ngc-success)' : 'red';
        tfootStr += `<td><select class="circ-input" style="color:${color}" onchange="updC('${c.id}','seccionPE',this.value)">
            ${[1.5, 2.5, 4, 6, 10, 16].map(v => `<option value="${v}" ${c.seccionPE==v?'selected':''}>${v}</option>`).join('')}
        </select></td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    // 7. Iz (A)
    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px;">Iz (A)</td>`;
    circuitos.forEach(c => {
        tfootStr += `<td><input type="number" class="circ-input" value="${c.iz}" onchange="updC('${c.id}','iz',this.value)"></td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    // 8. In (A)
    tfootStr += `<tr><td colspan="2" style="text-align:right; padding:5px;">In (A)</td>`;
    circuitos.forEach(c => {
        let ib = (c.tension == 380) ? (c.dpms / (1.732 * 380)) : (c.dpms / c.tension);
        let color = (c.in >= ib && c.in <= c.iz) ? 'var(--ngc-success)' : 'red';
        tfootStr += `<td><select class="circ-input" style="color:${color}; font-weight:bold;" onchange="updC('${c.id}','in',this.value)">
            ${[10, 15, 16, 20, 25, 32, 40, 50, 63].map(v => `<option value="${v}" ${c.in==v?'selected':''}>${v}</option>`).join('')}
        </select></td>`;
    });
    tfootStr += `<td colspan="2"></td></tr>`;

    tfoot.innerHTML = tfootStr;
    sincronizarVistaPreviaPDF(areaTotal, gradoActual, dpmsPonderado, sumElegido, totalesBocas);
}

function sincronizarVistaPreviaPDF(areaTotal, grado, dpmsPonderado, suministro, totalesBocas) {
    if (!clienteActual) return;
    document.getElementById('pdf-cliente').innerText = clienteActual.nombreCompleto;
    document.getElementById('pdf-fecha').innerText = clienteActual.fecha;

    const thead = document.getElementById('pdf-thead');
    const tbody = document.getElementById('pdf-tbody');
    const tfoot = document.getElementById('pdf-tfoot');
    
    let ths = `<tr><th style="text-align: left;">Ambiente</th><th>m²</th>`;
    circuitos.forEach(c => ths += `<th>${c.id}${c.tipo}</th>`);
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
            if (desc && cant > 0) txt += `<br><span style="font-size:8px;">${desc}</span>`;
            celdas += `<td>${txt}</td>`;
        });
        tbody.innerHTML += `<tr><td style="text-align: left;">${i.tipo}</td><td>${(i.area > 0 && !i.tipo.includes("Carga")) ? i.area.toFixed(2) : '-'}</td>${celdas}</tr>`;
    });

    let tfootStr = ``;
    
     // Bocas
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">TOTAL BOCAS</td>`;
    circuitos.forEach(c => tfootStr += `<td>${totalesBocas[c.id]}</td>`); tfootStr += `</tr>`;
    // DPMS
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">DPMS (VA)</td>`;
    circuitos.forEach(c => tfootStr += `<td>${c.dpms}</td>`); tfootStr += `</tr>`;
    // Tensión
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">Tensión (V)</td>`;
    circuitos.forEach(c => tfootStr += `<td>${c.tension}</td>`); tfootStr += `</tr>`;
    // Ib
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">Ib (A)</td>`;
    circuitos.forEach(c => { let ib = (c.tension == 380) ? (c.dpms / (1.732 * 380)) : (c.dpms / c.tension); tfootStr += `<td>${ib.toFixed(2)}</td>`; }); tfootStr += `</tr>`;
    // Secciones L;N y PE
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">Secc L;N / PE (mm²)</td>`;
    circuitos.forEach(c => tfootStr += `<td>${c.seccionLN} / ${c.seccionPE}</td>`); tfootStr += `</tr>`;
    // Iz / In
    tfootStr += `<tr><td colspan="2" style="text-align: right; padding: 5px;">Iz / In (A)</td>`;
    circuitos.forEach(c => tfootStr += `<td>${c.iz} / ${c.in}</td>`); tfootStr += `</tr>`;

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
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    await html2pdf().set(opt).from(element).save();
    if (window.innerWidth < 992) element.style.display = 'none';
}
