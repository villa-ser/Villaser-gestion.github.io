// =======================================================
// 1. DETECCIÓN DE TEMA (MODO DÍA / NOCHE) AL INICIAR
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
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

        // Configurar Event Listeners
        setupEventListeners();

    } catch (e) { 
        document.getElementById('status').innerText = "⚠️ Error de conexión."; 
        console.error(e);
    }
}

function parseCSV(text) {
    return text.split('\n').slice(1).map(line => {
        const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
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
    
    // Obtener nombre sin caracteres especiales
    currentClientName = selCliente.options[selCliente.selectedIndex].text.split(' ')[0].trim().replace(/[^a-zA-Z0-9]/g, '');
}

function updateDropdown(index) {
    // Resetear selects siguientes
    for (let i = index; i < selects.length; i++) { 
        selects[i].innerHTML = '<option value="">-- Selección --</option>';
        selects[i].value = ""; 
        selects[i].disabled = true;
    }
    
    if (index >= selects.length) return; // Fin de la cadena

    // Filtrar datos según las selecciones anteriores
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
    const fecha = new Date().toLocaleDateString('es-ES');
    
    createRowItem("client-header", `CLI\t${c.c0}\t${c.c1}\t${c.c2}`, `<strong style="color:var(--accent); font-size:0.95rem;">${fecha} - ${c.c0}</strong>`, true);
    
    const b = document.getElementById('btnCli'); 
    b.innerText = "✓"; 
    b.classList.add('btn-success-active');
    
    setTimeout(() => { 
        document.getElementById('section-client').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
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
    
    // Reiniciar selectores
    selects[0].value = ""; 
    updateDropdown(1); 
    document.getElementById('observaciones').value = ""; 
    document.getElementById('cantidad').value = "1";
    btnAlert('btnMat', 'Agregar Ítem');
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

// Portapapeles moderno
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
        // Fallback
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

function takeScreenshot() {
    const area = document.getElementById('captureSection');
    const deletes = area.querySelectorAll('.btn-delete');
    
    // Ocultar botones de borrar
    deletes.forEach(b => b.style.visibility = 'hidden');
    
    const nameToUse = currentClientName || "Lista";
    const fileName = `${nameToUse}_materiales_villaser.png`;
    
    // Ajustar color para la captura
    const isLightMode = document.body.classList.contains('light-mode');
    const bgColor = isLightMode ? "#ffffff" : "#1e1e1e";
    area.style.color = isLightMode ? "#1a1a1a" : "#ffffff";

    html2canvas(area, { backgroundColor: bgColor, scale: 2, useCORS: true }).then(canvas => {
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.setAttribute('href', dataURL); 
        link.setAttribute('download', fileName);
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link);
        
        // Restaurar botones de borrar
        deletes.forEach(b => b.style.visibility = 'visible');
        area.style.color = ""; // Restaurar color CSS
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
                createRowItem("client-header", line, `<strong style="color:var(--accent); font-size:0.95rem;">${new Date().toLocaleDateString('es-ES')} - ${raw[1]}</strong>`);
                document.getElementById('section-client').classList.add('hidden');
                document.getElementById('main-content').classList.remove('hidden');
            } else if (raw[0] === 'OBS') {
                createRowItem("general-header", line, `<i style="color:var(--text); opacity:0.8;">Nota: ${raw[1]}</i>`);
            } else if (raw[0] === 'ITM') {
                createRowItem("", line, `<b>${raw[1]} ${raw[2].substring(0,3)}</b> | ${raw[3]} ${raw[4] ? `<span style="color:var(--accent);">[${raw[4]}]</span>` : ''}`);
            }
        });
        
        event.target.value = ""; 
        btnAlert('btnImport', '📂 IMPORTAR');
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
    
    // Fallback a web si no tiene la app instalada
    setTimeout(() => { 
        if (document.hasFocus()) {
            window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text)}`, '_blank'); 
        }
    }, 500);
}

// Inicializar la aplicación
init();
            
