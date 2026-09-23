// =======================================================
// 1. DETECCIÓN DE TEMA (MODO DÍA / NOCHE) AL INICIAR
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
    
    // Configurar observador para actualizar la vista previa PDF en vivo
    const container = document.getElementById('itemsContainer');
    if (container) {
        const observer = new MutationObserver(() => {
            if (document.getElementById('section-client').classList.contains('hidden')) {
                sincronizarVistaPreviaPDF();
            }
        });
        observer.observe(container, { childList: true, subtree: true });
    }
});

// =======================================================
// 2. LÓGICA PRINCIPAL DE MATERIALES
// =======================================================
const SHEET_ID = '1XfQoCkNMXy5WLhQciVrRoc1Pz6yeKKiAZljR_KYpohM';
const URL_MAT = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Materiales`;
const URL_CLI = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=NombresClientes`;

let dataMat = [], dataCli = [], selectedPhone = "", currentClientName = "";

const selCliente = document.getElementById('selCliente');
const selects = [
    document.getElementById('sel0'), document.getElementById('sel1'), 
    document.getElementById('sel2'), document.getElementById('sel3'), 
    document.getElementById('sel4'), document.getElementById('sel5')
];

async function init() {
    try {
        const [resMat, resCli] = await Promise.all([fetch(URL_MAT), fetch(URL_CLI)]);
        dataMat = parseCSV(await resMat.text());
        dataCli = parseCSV(await resCli.text());
        
        document.getElementById('status').style.display = "none";
        
        // Cargar Clientes
        selCliente.innerHTML = '<option value="">-- SELECCIONE CLIENTE --</option>';
        dataCli.forEach((c, idx) => { 
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = c.c0;
            selCliente.appendChild(opt);
        });

        // Cargar primera categoría de materiales
        fillSelect(0, [...new Set(dataMat.map(item => item.c0))].filter(v => v));
        selects[0].disabled = false;

        setupEventListeners();

    } catch (e) { 
        document.getElementById('status').innerText = "⚠️ Error de conexión."; 
        console.error(e);
    }
}

// CORRECCIÓN: Limpieza profunda de espacios y comillas
function parseCSV(text) {
    return text.split('\n').slice(1).map(line => {
        const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => {
            let val = c.trim(); // 1. Quita espacios primero
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1); // 2. Quita las comillas de los extremos
            }
            return val.replace(/""/g, '"').trim(); // 3. Arregla dobles comillas internas y limpia
        });
        return { c0: cells[0]||"", c1: cells[1]||"", c2: cells[2]||"", c3: cells[3]||"", c4: cells[4]||"", c5: cells[5]||"" };
    }).filter(item => item.c0);
}

function setupEventListeners() {
    selCliente.addEventListener('change', fillClientData);
    
    selects.forEach((sel, index) => {
        sel.addEventListener('change', () => {
            updateDropdown(index + 1);
        });
    });
}

function fillClientData() {
    const idx = selCliente.value;
    if (idx === "") { 
        selectedPhone = ""; 
        currentClientName = ""; 
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
    
    currentClientName = selCliente.options[selCliente.selectedIndex].text.split(' ')[0].trim().replace(/[^a-zA-Z0-9]/g, '');
}

function updateDropdown(index) {
    for (let i = index; i < selects.length; i++) { 
        selects[i].innerHTML = '<option value="">-- Selección --</option>';
        selects[i].value = ""; 
        selects[i].disabled = true;
    }
    
    if (index >= selects.length) return; 

    const filtered = dataMat.filter(item => {
        for (let i = 0; i < index; i++) {
            if (item[`c${i}`] !== selects[i].value) return false;
        }
        return true;
    });
    
    const uniqueVals = [...new Set(filtered.map(item => item[`c${index}`]))].filter(v => v);
    
    if (uniqueVals.length > 0) {
        selects[index].disabled = false;
        fillSelect(index, uniqueVals);
    }
}

function fillSelect(index, vals) {
    const sel = selects[index];
    sel.innerHTML = '<option value="">-- Selección --</option>';
    vals.forEach(v => { 
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        sel.appendChild(opt);
    });
}

function changeQty(v) {
    const input = document.getElementById('cantidad');
    input.value = Math.max(1, parseInt(input.value || 0) + v);
}

function createRowItem(className, raw, html, prepend = false) {
    const div = document.createElement('div');
    div.className = "row-item " + className;
    div.setAttribute('data-raw', raw);
    div.innerHTML = `<div style="flex:1; overflow:hidden; text-overflow:ellipsis;">${html}</div><button class="btn-delete" aria-label="Eliminar ítem" onclick="this.parentElement.remove()">✕</button>`;
    
    const container = document.getElementById('itemsContainer');
    if(prepend) container.prepend(div); 
    else container.appendChild(div);
}

function addClientToList() {
    const idx = selCliente.value;
    if (idx === "") {
        alert("Por favor, seleccione un cliente.");
        selCliente.focus();
        return;
    }
    
    const c = dataCli[idx];
    const fecha = new Date().toLocaleDateString('es-AR');
    
    createRowItem("client-header", `CLI\t${c.c0}\t${c.c1}\t${c.c2}`, `<strong style="color:var(--accent); font-size:0.95rem;">${fecha} - ${c.c0}</strong>`, true);
    
    const b = document.getElementById('btnCli'); 
    b.innerText = "✓"; 
    b.classList.add('btn-success-active');
    
    setTimeout(() => { 
        document.getElementById('section-client').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        sincronizarVistaPreviaPDF(); // Llama a la vista previa
    }, 500);
}

function addGeneralObs() {
    const obs = document.getElementById('obsGenerales').value;
    if (!obs.trim()) return;
    
    createRowItem("general-header", `OBS\t${obs}`, `<i style="color:var(--text); opacity:0.8;">Nota: ${obs}</i>`);
    document.getElementById('obsGenerales').value = "";
    btnAlert('btnGen', 'OK');
}

function addItem() {
    let textParts = [];
    selects.forEach(s => { 
        if (s.value) textParts.push(s.value); 
    });
    
    if (textParts.length === 0) return;
    
    const cant = document.getElementById('cantidad').value;
    const unit = document.querySelector('input[name="um"]:checked').value;
    const obs = document.getElementById('observaciones').value;
    
    createRowItem(
        "", 
        `ITM\t${cant}\t${unit}\t${textParts.join(' ')}\t${obs}`, 
        `<b>${cant} ${unit.substring(0,3)}</b> | ${textParts.join('/')} ${obs ? `<span style="color:var(--accent);">[${obs}]</span>` : ''}`
    );
    
    selects[0].value = ""; 
    updateDropdown(1); 
    document.getElementById('observaciones').value = ""; 
    document.getElementById('cantidad').value = "1";
    btnAlert('btnMat', 'Agregar Ítem');
}

// =======================================================
// NUEVA FUNCIÓN: AGREGAR ÍTEM MANUAL (LIBRE)
// =======================================================
function agregarItemManual() {
    const descripcion = prompt("Ingrese el nombre/descripción del material libre:");
    if (!descripcion || descripcion.trim() === "") return;

    const cantidadStr = prompt("Ingrese la cantidad:", document.getElementById('cantidad').value || "1");
    const cant = parseInt(cantidadStr) || 1;

    // Detectar unidad seleccionada en pantalla para sugerirla
    const unRadio = document.querySelector('input[name="um"]:checked');
    const unidadDefault = unRadio ? unRadio.value : "Unidades";
    
    const unidadBruta = prompt("Ingrese la unidad (Ej: Unidades, Metros, Rollo):", unidadDefault) || unidadDefault;
    
    // Capitalizar la primera letra para que sea consistente
    const unit = unidadBruta.charAt(0).toUpperCase() + unidadBruta.slice(1).toLowerCase();
    
    const obs = prompt("Notas del ítem (Opcional):", document.getElementById('observaciones').value || "") || "";

    createRowItem(
        "", 
        `ITM\t${cant}\t${unit}\t${descripcion.trim()}\t${obs.trim()}`, 
        `<b>${cant} ${unit.substring(0,3).toUpperCase()}</b> | ${descripcion.trim()} ${obs.trim() ? `<span style="color:var(--accent);">[${obs.trim()}]</span>` : ''}`
    );

    // Limpiar inputs
    document.getElementById('observaciones').value = "";
    document.getElementById('cantidad').value = "1";
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
    const nameToUse = currentClientName || "Cliente";
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const title = `${nameToUse}_Villaser_Materiales_${dd}-${mm}-${yyyy}`;
    
    try {
        await navigator.clipboard.writeText(title);
        btnAlert('btnCopyTitle', '📋 TITULO');
    } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = title;
        textArea.style.position = "fixed"; textArea.style.left = "-9999px";
        document.body.appendChild(textArea); 
        textArea.focus(); textArea.select();
        document.execCommand('copy'); 
        btnAlert('btnCopyTitle', '📋 TITULO');
        document.body.removeChild(textArea);
    }
}

// =======================================================
// SINCRONIZADOR VISTA PREVIA PDF (EN VIVO)
// =======================================================
function sincronizarVistaPreviaPDF() {
    const items = document.querySelectorAll('.row-item');
    if (items.length === 0) return;

    let clienteNombre = currentClientName || "Cliente";
    let clienteTel = selectedPhone || "";
    let fecha = new Date().toLocaleDateString('es-AR');
    let notasAcumuladas = "";
    
    const tbody = document.getElementById('pdf-tbody');
    tbody.innerHTML = ''; 

    items.forEach((i) => {
        const raw = i.getAttribute('data-raw').split('\t');
        
        if (raw[0] === 'CLI') {
            clienteNombre = raw[1];
            clienteTel = raw[2];
        } else if (raw[0] === 'OBS') {
            notasAcumuladas += `• ${raw[1]}<br>`;
        } else if (raw[0] === 'ITM') {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center; font-weight: bold;">${raw[1]}</td>
                <td style="text-align: center;">${raw[2].substring(0,4).toUpperCase()}</td>
                <td>${raw[3]}</td>
                <td style="font-size: 10.5px; color: #555;">${raw[4] || '-'}</td>
            `;
            tbody.appendChild(tr);
        }
    });

    document.getElementById('pdf-cliente').innerText = clienteNombre;
    document.getElementById('pdf-tel').innerText = clienteTel;
    document.getElementById('pdf-fecha').innerText = fecha;
    
    const boxNotas = document.getElementById('pdf-notas-box');
    if(notasAcumuladas) {
        document.getElementById('pdf-notas').innerHTML = notasAcumuladas;
        boxNotas.style.display = 'block';
    } else {
        boxNotas.style.display = 'none';
    }
}

// =======================================================
// GENERADOR DE PDF A4
// =======================================================
async function generarPDF() {
    const items = document.querySelectorAll('.row-item');
    if (items.length === 0) { 
        alert("Agrega un cliente y materiales para generar el PDF."); 
        return; 
    }

    // Por seguridad, forzamos una última sincronización
    sincronizarVistaPreviaPDF();

    const element = document.getElementById('plantilla-pdf');
    const originalDisplay = getComputedStyle(element).display;
    if (originalDisplay === 'none') element.style.display = 'block';
    
    window.scrollTo(0, 0); 

    let clienteNombre = currentClientName || "Cliente";
    
    const opt = {
        margin:       0, 
        filename:     `${clienteNombre.replace(/ /g, '_')}_Materiales.pdf`,
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
        if (window.innerWidth < 992) {
             element.style.display = 'none';
        }
    }
}

// CAPTURA DE IMAGEN ORIGINAL (INTACTA PARA WSP)
function takeScreenshot() {
    const area = document.getElementById('captureSection');
    const deletes = area.querySelectorAll('.btn-delete');
    
    deletes.forEach(b => b.style.visibility = 'hidden');
    
    const nameToUse = currentClientName || "Lista";
    const fileName = `${nameToUse}_materiales.png`;
    
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
        
        deletes.forEach(b => b.style.visibility = 'visible');
        area.style.color = ""; 
    });
}

function exportToTxt() {
    const items = document.querySelectorAll('.row-item');
    if (items.length === 0) { alert("La lista está vacía."); return; }
    
    let content = [];
    items.forEach(i => content.push(i.getAttribute('data-raw')));
    
    const blob = new Blob([content.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (currentClientName || "Lista") + "_Villaser.txt";
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
        const lines = e.target.result.split('\n');
        const container = document.getElementById('itemsContainer'); 
        container.innerHTML = "";
        
        lines.forEach(line => {
            const raw = line.split('\t');
            if (raw[0] === 'CLI') {
                currentClientName = raw[1].split(' ')[0].trim().replace(/[^a-zA-Z0-9]/g, '');
                selectedPhone = raw[2].replace(/\D/g, '');
                createRowItem("client-header", line, `<strong style="color:var(--accent); font-size:0.95rem;">${new Date().toLocaleDateString('es-AR')} - ${raw[1]}</strong>`);
                document.getElementById('section-client').classList.add('hidden');
                document.getElementById('main-content').classList.remove('hidden');
            } else if (raw[0] === 'OBS') {
                createRowItem("general-header", line, `<i style="color:var(--text); opacity:0.8;">Nota: ${raw[1]}</i>`);
            } else if (raw[0] === 'ITM') {
                createRowItem("", line, `<b>${raw[1]} ${raw[2].substring(0,3).toUpperCase()}</b> | ${raw[3]} ${raw[4] ? `<span style="color:var(--accent);">[${raw[4]}]</span>` : ''}`);
            }
        });
        
        event.target.value = ""; 
        btnAlert('btnImport', '📂 IMPORTAR');
        
        // Forzar actualización del PDF al terminar de importar
        sincronizarVistaPreviaPDF();
    };
    reader.readAsText(file);
}

function sendWSP() {
    if (!selectedPhone) { 
        alert("Por favor, cargue un cliente primero."); 
        return; 
    }
    const items = document.querySelectorAll('.row-item');
    if (items.length === 0) { 
        alert("La lista de materiales está vacía."); 
        return; 
    }
    
    let text = "*VILLASER - MATERIALES SOLICITADOS*\n";
    items.forEach(i => {
        const raw = i.getAttribute('data-raw').split('\t');
        if (raw[0] === 'CLI') text += `\n*CLIENTE:* ${raw[1]}\n`;
        else if (raw[0] === 'OBS') text += `*NOTA:* ${raw[1]}\n`;
        else text += `• ${raw[1]} ${raw[2]} - ${raw[3]} ${raw[4] ? '('+raw[4]+')' : ''}\n`;
    });
    
    let cleanNumber = selectedPhone;
    if (cleanNumber.length === 10) cleanNumber = "549" + cleanNumber;
    else if (!cleanNumber.startsWith("54")) cleanNumber = "549" + cleanNumber;
    
    const url = `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(text)}`;
    window.location.href = url;
    
    setTimeout(() => { 
        if (document.hasFocus()) {
            window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text)}`, '_blank'); 
        }
    }, 500);
}

init();
