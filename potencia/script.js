document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
});

const SHEET_ID = '1XfQoCkNMXy5WLhQciVrRoc1Pz6yeKKiAZljR_KYpohM'; 
const URL_CLI = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=NombresClientes`;

let dataCli = [];
let clienteActual = null;
let listaAmbientes = [];

const selCliente = document.getElementById('selCliente');

window.onload = init;

async function init() {
    try {
        const resCli = await fetch(URL_CLI);
        dataCli = parseCSV(await resCli.text());
        
        document.getElementById('status').style.display = "none";
        document.getElementById('step-cliente').style.display = "block";
        
        dataCli.forEach((c, idx) => { 
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = c.c0;
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
    const idx = selCliente.value;
    if (idx === "") { 
        document.getElementById('cliTel').value = "";
        document.getElementById('cliDir').value = "";
        return; 
    }
    document.getElementById('cliTel').value = dataCli[idx].c1;
    document.getElementById('cliDir').value = dataCli[idx].c2;
}

function cargarCliente() {
    const idx = selCliente.value;
    if (idx === "") return alert("Seleccione un cliente.");
    const c = dataCli[idx];
    clienteActual = {
        nombre: c.c0.split(' ')[0].trim().replace(/[^a-zA-Z0-9]/g, ''),
        nombreCompleto: c.c0,
        tel: c.c1,
        dir: c.c2,
        fecha: new Date().toLocaleDateString('es-AR')
    };
    
    document.getElementById('step-cliente').style.display = 'none';
    document.getElementById('step-trabajo').style.display = 'flex';
    renderTabla();
}

function obtenerGradoElectrificacion(areaTotal) {
    if (areaTotal <= 60) return "MÍNIMO";
    if (areaTotal <= 130) return "MEDIO";
    if (areaTotal <= 200) return "ELEVADO";
    return "SUPERIOR";
}

// Validación de bocas mínimas según AEA 90364-7-770 (Tabla 770.7.III)
function validarBocasAEA(tipo, area, largo, grado, bocasIUG, bocasTUG) {
    let minIUG = 0, minTUG = 0;
    
    if (tipo.includes("Estar") || tipo.includes("Comedor")) {
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
    } else if (tipo === "Pasillo") {
        let l = largo > 0 ? largo : Math.sqrt(area);
        minIUG = Math.max(1, Math.ceil(l / 5));
        minTUG = Math.max(1, Math.ceil(l / 5));
    } else if (tipo === "Lavadero") {
        minIUG = 1;
        minTUG = (grado === 'ELEVADO' || grado === 'SUPERIOR') ? 2 : 1;
    } else if (tipo.includes("Exterior")) {
        minIUG = (grado === 'ELEVADO' || grado === 'SUPERIOR') ? Math.max(1, Math.ceil((largo>0?largo:Math.sqrt(area)) / 5)) : 1;
        minTUG = 0; // Depende del proyectista
    }

    return {
        iugValido: bocasIUG >= minIUG,
        tugValido: bocasTUG >= minTUG,
        minIUG: minIUG,
        minTUG: minTUG
    };
}

function agregarAmbiente() {
    const tipo = document.getElementById('selAmbiente').value;
    const ancho = parseFloat(document.getElementById('inputAncho').value.replace(',', '.')) || 0;
    const largo = parseFloat(document.getElementById('inputLargo').value.replace(',', '.')) || 0;
    const bIUG = parseInt(document.getElementById('bocasIUG').value) || 0;
    const circIUG = document.getElementById('circuitoIUG').value;
    const bTUG = parseInt(document.getElementById('bocasTUG').value) || 0;
    const circTUG = document.getElementById('circuitoTUG').value;

    if (!tipo || ancho <= 0 || largo <= 0) return alert("Complete tipo de ambiente y medidas válidas.");
    if (bIUG > 0 && !circIUG) return alert("Seleccione el circuito para las bocas IUG.");
    if (bTUG > 0 && !circTUG) return alert("Seleccione el circuito para las bocas TUG.");

    const area = (tipo.includes("Exterior") || tipo.includes("Balcón")) ? (ancho * largo) / 2 : (ancho * largo);

    listaAmbientes.push({
        id: Date.now(), tipo, ancho, largo, area, bIUG, circIUG, bTUG, circTUG
    });

    document.getElementById('inputAncho').value = ""; document.getElementById('inputLargo').value = "";
    document.getElementById('bocasIUG').value = "0"; document.getElementById('bocasTUG').value = "0";
    
    renderTabla();
}

function borrarItem(id) {
    listaAmbientes = listaAmbientes.filter(i => i.id !== id);
    renderTabla();
}

function renderTabla() {
    const tbody = document.getElementById('cuerpoTabla');
    const tfoot = document.getElementById('pieTabla');
    tbody.innerHTML = ''; tfoot.innerHTML = '';
    
    let areaTotal = 0;
    let totC1 = 0, totC2 = 0, totC3 = 0;

    listaAmbientes.forEach(i => areaTotal += i.area);
    const gradoActual = obtenerGradoElectrificacion(areaTotal);

    document.getElementById('ui-sla').innerText = `${areaTotal.toFixed(2)} m²`;
    document.getElementById('ui-grado').innerText = gradoActual;

    listaAmbientes.forEach(i => {
        const val = validarBocasAEA(i.tipo, i.area, i.largo, gradoActual, i.bIUG, i.bTUG);
        
        let c1 = "-", c2 = "-", c3 = "-";
        if(i.circIUG === "C1 IUG") { c1 = i.bIUG; totC1 += i.bIUG; }
        if(i.circTUG === "C2 TUG1") { c2 = i.bTUG; totC2 += i.bTUG; }
        if(i.circTUG === "C3 TUG2") { c3 = i.bTUG; totC3 += i.bTUG; }

        const colorIUG = val.iugValido ? "var(--ngc-success)" : "var(--ngc-danger)";
        const colorTUG = val.tugValido ? "var(--ngc-success)" : "var(--ngc-danger)";

        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="text-align:left; padding:8px 5px;">${i.tipo}</td>
                <td>${i.area.toFixed(2)}</td>
                <td style="color:${colorIUG}; font-weight:bold;" title="Mínimo requerido: ${val.minIUG}">${c1}</td>
                <td style="color:${colorTUG}; font-weight:bold;" title="Mínimo requerido: ${val.minTUG}">${c2}</td>
                <td style="color:${colorTUG}; font-weight:bold;" title="Mínimo requerido: ${val.minTUG}">${c3}</td>
                <td><button onclick="borrarItem(${i.id})" style="background:transparent; border:none; color:red; cursor:pointer;">✕</button></td>
            </tr>
        `;
    });

    if(listaAmbientes.length > 0) {
        tfoot.innerHTML = `
            <tr>
                <td style="text-align:left; padding:8px 5px;">Cantidad de Bocas</td>
                <td>-</td>
                <td>${totC1}</td>
                <td>${totC2}</td>
                <td>${totC3}</td>
                <td>-</td>
            </tr>
        `;
    }
    sincronizarVistaPreviaPDF(areaTotal, gradoActual, totC1, totC2, totC3);
}

function sincronizarVistaPreviaPDF(areaTotal, grado, tC1, tC2, tC3) {
    if (!clienteActual) return;
    document.getElementById('pdf-cliente').innerText = clienteActual.nombreCompleto;
    document.getElementById('pdf-fecha').innerText = clienteActual.fecha;

    const tbody = document.getElementById('pdf-tbody');
    const tfoot = document.getElementById('pdf-tfoot');
    tbody.innerHTML = ''; tfoot.innerHTML = '';

    listaAmbientes.forEach(i => {
        let c1 = i.circIUG === "C1 IUG" ? i.bIUG : "";
        let c2 = i.circTUG === "C2 TUG1" ? i.bTUG : "";
        let c3 = i.circTUG === "C3 TUG2" ? i.bTUG : "";

        tbody.innerHTML += `
            <tr>
                <td style="text-align: left;">${i.tipo}</td>
                <td>${i.area.toFixed(2)}</td>
                <td>${c1}</td>
                <td>${c2}</td>
                <td>${c3}</td>
            </tr>
        `;
    });

    if (listaAmbientes.length > 0) {
        tfoot.innerHTML = `
            <tr>
                <td style="text-align: left; padding: 5px;">Cantidad de Bocas</td>
                <td>-</td>
                <td>${tC1}</td>
                <td>${tC2}</td>
                <td>${tC3}</td>
            </tr>
        `;
    }

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
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    await html2pdf().set(opt).from(element).save();
    if (window.innerWidth < 992) element.style.display = 'none';
}
