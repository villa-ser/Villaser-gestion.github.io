// =======================================================
// 1. DETECCIÓN DE TEMA (MODO DÍA / NOCHE) AL INICIAR
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
});

// =======================================================
// 2. LÓGICA PRINCIPAL DE INFORME TÉCNICO
// =======================================================
const SHEET_ID = '1XfQoCkNMXy5WLhQciVrRoc1Pz6yeKKiAZljR_KYpohM';
const URL_CLI = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=NombresClientes`;

let dataCli = [], selectedPhone = "", currentClientName = "", clientDetails = {};

const selCliente = document.getElementById('selCliente');

async function init() {
    try {
        const resCli = await fetch(URL_CLI);
        dataCli = parseCSV(await resCli.text());
        
        document.getElementById('status').style.display = "none";
        
        selCliente.innerHTML = '<option value="">-- SELECCIONE CLIENTE --</option>';
        dataCli.forEach((c, idx) => { 
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = c.c0;
            selCliente.appendChild(opt);
        });

        selCliente.addEventListener('change', fillClientData);

    } catch (e) { 
        document.getElementById('status').innerText = "⚠️ Error de conexión."; 
        console.error(e);
    }
}

function parseCSV(text) {
    return text.split('\n').slice(1).map(line => {
        const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
        return { c0: cells[0]||"", c1: cells[1]||"", c2: cells[2]||"", c3: cells[3]||"" };
    }).filter(item => item.c0);
}

function fillClientData() {
    const idx = selCliente.value;
    if (idx === "") { 
        selectedPhone = ""; 
        currentClientName = ""; 
        clientDetails = {};
        document.getElementById('cliTel').value = "";
        document.getElementById('cliDir').value = "";
        document.getElementById('cliObs').value = "";
        return; 
    }
    
    const c = dataCli[idx];
    document.getElementById('cliTel').value = c.c1;
    document.getElementById('cliDir').value = c.c2;
    document.getElementById('cliObs').value = c.c3;
    selectedPhone = c.c1.replace(/\D/g, '');
    currentClientName = c.c0;
    clientDetails = { nombre: c.c0, tel: c.c1, dir: c.c2, obs: c.c3 };
}

function addClientToList() {
    const idx = selCliente.value;
    if (idx === "") {
        alert("Por favor, seleccione un cliente.");
        selCliente.focus();
        return;
    }
    
    const b = document.getElementById('btnCli'); 
    b.innerText = "✓"; 
    b.classList.add('btn-success-active');
    
    setTimeout(() => { 
        document.getElementById('section-client').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
    }, 500);
}

function btnAlert(id, text) {
    const b = document.getElementById(id); 
    const originalText = b.innerText;
    b.innerText = "¡LISTO!"; 
    b.classList.add('btn-success-active');
    setTimeout(() => { 
        b.innerText = text; 
        b.classList.remove('btn-success-active'); 
    }, 800);
}

async function copyTitle() {
    const shortName = currentClientName ? currentClientName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '') : "Cliente";
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const title = `${shortName}_Villaser_Informe_${dd}-${mm}-${yyyy}`;
    
    try {
        await navigator.clipboard.writeText(title);
        btnAlert('btnCopyTitle', '📋 TÍTULO');
    } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = title;
        textArea.style.position = "fixed"; textArea.style.left = "-9999px";
        document.body.appendChild(textArea); 
        textArea.focus(); textArea.select();
        document.execCommand('copy'); 
        btnAlert('btnCopyTitle', '📋 TÍTULO');
        document.body.removeChild(textArea);
    }
}

// =======================================================
// GENERADOR DE PDF A4 (295mm)
// =======================================================
async function generarPDF() {
    const texto = document.getElementById('textoInforme').value.trim();
    if (!texto) { 
        alert("Escriba el texto del informe técnico antes de generar el PDF."); 
        document.getElementById('textoInforme').focus();
        return; 
    }

    let fecha = new Date().toLocaleDateString('es-AR');
    
    document.getElementById('pdf-cliente').innerText = clientDetails.nombre || "Cliente";
    document.getElementById('pdf-dir').innerText = clientDetails.dir || "A coordinar";
    document.getElementById('pdf-fecha').innerText = fecha;
    document.getElementById('pdf-texto-contenido').innerText = texto;

    const element = document.getElementById('plantilla-pdf');
    element.style.display = 'block';
    
    window.scrollTo(0, 0);

    const shortName = currentClientName ? currentClientName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '') : "Cliente";
    const opt = {
        margin:       0,
        filename:     `${shortName}_Informe_Tecnico.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    btnAlert('btnGenerarPDF', '📄 DESCARGAR PDF');
    
    try {
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("Error al generar PDF: ", error);
        alert("Hubo un error al generar el PDF.");
    } finally {
        element.style.display = 'none';
    }
}

// CAPTURA DE IMAGEN (PARA DISPOSITIVOS / WSP)
function takeScreenshot() {
    const texto = document.getElementById('textoInforme').value.trim();
    if (!texto) { 
        alert("Escriba el texto del informe técnico."); 
        return; 
    }

    const area = document.getElementById('captureSection');
    const infoDiv = document.getElementById('previewClientInfo');
    const textDiv = document.getElementById('previewInforme');
    
    const fecha = new Date().toLocaleDateString('es-AR');
    infoDiv.innerHTML = `<b>CLIENTE:</b> ${clientDetails.nombre || 'Cliente'}<br><b>FECHA:</b> ${fecha} | <b>DIR:</b> ${clientDetails.dir || '-'}`;
    textDiv.innerText = texto;
    
    const shortName = currentClientName ? currentClientName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '') : "Lista";
    const fileName = `${shortName}_informe_tecnico.png`;
    
    const isLightMode = document.body.classList.contains('light-mode');
    const bgColor = isLightMode ? "#ffffff" : "#1e1e1e";
    area.style.color = isLightMode ? "#1a1a1a" : "#ffffff";

    window.scrollTo(0, 0);

    html2canvas(area, { backgroundColor: bgColor, scale: 2, useCORS: true, scrollY: 0 }).then(canvas => {
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.setAttribute('href', dataURL); 
        link.setAttribute('download', fileName);
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link);
        
        area.style.color = ""; 
    });
}

function exportToTxt() {
    const texto = document.getElementById('textoInforme').value;
    if (!texto.trim()) { alert("El informe está vacío."); return; }
    
    const headerData = `CLI\t${clientDetails.nombre || 'Cliente'}\t${clientDetails.tel || ''}\t${clientDetails.dir || ''}\n`;
    const fullContent = headerData + `INF\t` + texto.replace(/\n/g, '\\n');
    
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const shortName = currentClientName ? currentClientName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '') : "Informe";
    link.download = `${shortName}_Villaser_Informe.txt`;
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
    
    btnAlert('btnExport', '💾 EXPORTAR');
}

function importFromTxt(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split('\n');
        
        lines.forEach(line => {
            if (line.startsWith('CLI\t')) {
                const parts = line.split('\t');
                clientDetails = { nombre: parts[1], tel: parts[2], dir: parts[3] };
                currentClientName = parts[1];
                selectedPhone = parts[2] ? parts[2].replace(/\D/g, '') : '';
                document.getElementById('cliTel').value = parts[2] || '';
                document.getElementById('cliDir').value = parts[3] || '';
                document.getElementById('section-client').classList.add('hidden');
                document.getElementById('main-content').classList.remove('hidden');
            } else if (line.startsWith('INF\t')) {
                const infText = line.substring(4).replace(/\\n/g, '\n');
                document.getElementById('textoInforme').value = infText;
            }
        });
        
        event.target.value = ""; 
        btnAlert('btnImport', '📂 IMPORTAR');
    };
    reader.readAsText(file);
}

function sendWSP() {
    const texto = document.getElementById('textoInforme').value.trim();
    if (!selectedPhone) { 
        alert("Por favor, cargue un cliente primero."); 
        return; 
    }
    if (!texto) { 
        alert("El informe está vacío."); 
        return; 
    }
    
    let wspText = `*VILLASER - INFORME TÉCNICO*\n*Cliente:* ${clientDetails.nombre}\n\n${texto}`;
    
    let cleanNumber = selectedPhone;
    if (cleanNumber.length === 10) cleanNumber = "549" + cleanNumber;
    else if (!cleanNumber.startsWith("54")) cleanNumber = "549" + cleanNumber;
    
    const url = `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(wspText)}`;
    window.location.href = url;
    
    setTimeout(() => { 
        if (document.hasFocus()) {
            window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(wspText)}`, '_blank'); 
        }
    }, 500);
}

init();
