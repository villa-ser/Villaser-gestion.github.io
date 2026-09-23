// =======================================================
// 1. INICIALIZACIÓN Y TEMA
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
});

// =======================================================
// 2. LÓGICA DE BASE DE DATOS Y CLIENTES
// =======================================================
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
        
        selCliente.innerHTML = '<option value="">-- SELECCIONE CLIENTE --</option>';
        dataCli.forEach((c, idx) => { 
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = c.c0;
            selCliente.appendChild(opt);
        });

        selCliente.addEventListener('change', fillClientData);
    } catch (e) { 
        document.getElementById('status').innerText = "⚠️ Error de conexión a la base de datos."; 
        console.error(e);
    }
}

// Parseo seguro de CSV
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
    const c = dataCli[idx];
    document.getElementById('cliTel').value = c.c1;
    document.getElementById('cliDir').value = c.c2;
}

function cargarCliente() {
    const idx = selCliente.value;
    if (idx === "") {
        alert("Por favor, seleccione un cliente.");
        selCliente.focus();
        return;
    }
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

// =======================================================
// 3. LÓGICA DE AMBIENTES Y SUPERFICIES
// =======================================================
function agregarAmbiente() {
    const ambienteSel = document.getElementById('selAmbiente').value;
    const anchoStr = document.getElementById('inputAncho').value;
    const largoStr = document.getElementById('inputLargo').value;
    const obs = document.getElementById('obsAmbiente').value.trim();

    if (!ambienteSel) return alert("Seleccione un tipo de ambiente.");
    
    const ancho = parseFloat(anchoStr.replace(',', '.'));
    const largo = parseFloat(largoStr.replace(',', '.'));

    if (isNaN(ancho) || isNaN(largo) || ancho <= 0 || largo <= 0) {
        return alert("Ingrese valores válidos mayores a 0 para el Ancho y Largo.");
    }

    const area = ancho * largo;

    listaAmbientes.push({
        id: Date.now(),
        tipo: ambienteSel,
        ancho: ancho,
        largo: largo,
        area: area,
        obs: obs
    });

    // Resetear formulario
    document.getElementById('selAmbiente').value = "";
    document.getElementById('inputAncho').value = "";
    document.getElementById('inputLargo').value = "";
    document.getElementById('obsAmbiente').value = "";

    animarBoton('btnAddAmbiente', '➕ Agregar Ambiente');
    renderTabla();
}

function borrarItem(id) {
    listaAmbientes = listaAmbientes.filter(i => i.id !== id);
    renderTabla();
}

function renderTabla() {
    const tbody = document.getElementById('cuerpoTabla');
    tbody.innerHTML = '';
    let areaTotal = 0;

    if (clienteActual) {
        const r = tbody.insertRow();
        r.innerHTML = `<td colspan="3" style="color:var(--ngc-primary); font-size:0.85rem; padding-bottom:15px; border-bottom: none;"><b>PROYECTO:</b> ${clienteActual.nombreCompleto}<br><b>FECHA:</b> ${clienteActual.fecha}</td>`;
    }

    listaAmbientes.forEach(i => {
        areaTotal += i.area;
        const r = tbody.insertRow();
        r.innerHTML = `
            <td style="padding: 10px 5px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <b>${i.tipo}</b>
                <span style="display:block; font-size:0.8rem; color:var(--text-dim);">Dim: ${i.ancho.toFixed(2)} x ${i.largo.toFixed(2)} m</span>
                ${i.obs ? `<small style="display:block; color:var(--ngc-warning); font-size: 0.75rem; margin-top:2px;">${i.obs}</small>` : ''}
            </td>
            <td align="right" style="padding: 10px 5px; color:var(--ngc-primary); font-weight:bold; font-size:1.1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                ${i.area.toFixed(2)} m²
            </td>
            <td align="right" style="width: 40px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-obs btn-danger" onclick="borrarItem(${i.id})" style="padding: 6px 10px;">✕</button>
            </td>
        `;
    });

    document.getElementById('totalDisplay').innerHTML = `
        <span style="font-size: 0.8rem; display: block; color: var(--text-dim); text-transform: uppercase;">Límite de Aplicación</span>
        TOTAL: ${areaTotal.toFixed(2)} m²
    `;

    sincronizarVistaPreviaPDF(areaTotal);
}

// =======================================================
// 4. GENERACIÓN DE PDF Y VISTA PREVIA
// =======================================================
function sincronizarVistaPreviaPDF(areaTotal) {
    if (!clienteActual) return;

    document.getElementById('pdf-cliente').innerText = clienteActual.nombreCompleto;
    document.getElementById('pdf-dir').innerText = clienteActual.dir || "S/D";
    document.getElementById('pdf-fecha').innerText = clienteActual.fecha;

    const tbody = document.getElementById('pdf-tbody');
    tbody.innerHTML = '';

    listaAmbientes.forEach(i => {
        const tr = document.createElement('tr');
        let nombreAmbiente = `<b>${i.tipo}</b>`;
        if (i.obs) nombreAmbiente += `<br><i style="font-size: 10px; color: #666;">${i.obs}</i>`;

        tr.innerHTML = `
            <td>${nombreAmbiente}</td>
            <td style="text-align: center;">${i.ancho.toFixed(2)}</td>
            <td style="text-align: center;">${i.largo.toFixed(2)}</td>
            <td style="text-align: center; font-weight: bold;">${i.area.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('pdf-total').innerText = `${areaTotal.toFixed(2)} m²`;
}

async function generarPDF() {
    if (!clienteActual || listaAmbientes.length === 0) {
        return alert("Debe cargar un cliente y al menos un ambiente.");
    }

    const element = document.getElementById('plantilla-pdf');
    const originalDisplay = getComputedStyle(element).display;
    if (originalDisplay === 'none') element.style.display = 'block';

    window.scrollTo(0, 0);

    const opt = {
        margin:       0,
        filename:     `${clienteActual.nombre}_Potencia_${clienteActual.fecha.replace(/\//g, '-')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    animarBoton('btnGenerarPDF', '📄 Descargar PDF');

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("Error al generar PDF: ", error);
        alert("Hubo un error al generar el PDF.");
    } finally {
        if (window.innerWidth < 992) {
             element.style.display = 'none';
        }
    }
}

// =======================================================
// 5. EXPORTAR / IMPORTAR / WHATSAPP
// =======================================================
function exportarDatos() {
    if (!clienteActual || listaAmbientes.length === 0) return alert("No hay datos para exportar.");
    const data = { cliente: clienteActual, ambientes: listaAmbientes };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clienteActual.nombre}_Potencia.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importarDatos(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            clienteActual = data.cliente;
            listaAmbientes = data.ambientes || [];
            
            document.getElementById('step-cliente').style.display = 'none';
            document.getElementById('step-trabajo').style.display = 'flex';
            renderTabla();
        } catch(err) { alert("Archivo no válido."); }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function enviarWhatsApp() {
    if (!clienteActual) return alert("Cargue un cliente.");
    if (listaAmbientes.length === 0) return alert("Cargue ambientes.");

    let text = `*PLANILLA DE POTENCIA - SUPERFICIES*\nCliente: ${clienteActual.nombreCompleto}\n\n`;
    let total = 0;
    
    listaAmbientes.forEach(i => {
        total += i.area;
        text += `• ${i.tipo} (${i.ancho.toFixed(2)}x${i.largo.toFixed(2)}m) = *${i.area.toFixed(2)} m²*\n`;
    });
    
    text += `\n*LÍMITE DE APLICACIÓN TOTAL: ${total.toFixed(2)} m²*`;

    let cleanNumber = clienteActual.tel.replace(/\D/g, '');
    if (cleanNumber.length === 10) cleanNumber = "549" + cleanNumber;
    else if (!cleanNumber.startsWith("54")) cleanNumber = "549" + cleanNumber;

    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
}

function animarBoton(id, textoOriginal) {
    const b = document.getElementById(id);
    b.innerText = "¡LISTO!";
    b.style.background = "var(--ngc-success)";
    b.style.borderColor = "var(--ngc-success)";
    b.style.color = "white";
    setTimeout(() => {
        b.innerText = textoOriginal;
        b.style.background = "";
        b.style.borderColor = "";
        b.style.color = "";
    }, 1000);
}

