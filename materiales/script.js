// =======================================================
// 1. DETECCIÓN DE TEMA (MODO DÍA / NOCHE) AL INICIAR
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
});

// =======================================================
// 2. LÓGICA PRINCIPAL DE MATERIALES
// =======================================================
const SHEET_ID = '1XfQoCkNMXy5WLhQciVrRoc1Pz6yeKKiAZljR_KYpohM';
const URL_MAT = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Materiales`;
const URL_CLI = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=NombresClientes`;

let dataMat = [], dataCli = [], selectedPhone = "", currentClientName = "";

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
        
        const listCli = document.getElementById('list-selCliente');
        listCli.innerHTML = '';
        document.getElementById('display-selCliente').innerText = '-- Cliente --';
        
        dataCli.forEach((c, idx) => { 
            let div = document.createElement('div');
            div.textContent = c.c0;
            div.onclick = () => {
                selectOption('display-selCliente', 'selCliente', idx, c.c0);
                fillClientData();
            };
            listCli.appendChild(div);
        });

        fillSelect(0, [...new Set(dataMat.map(item => item.c0))].filter(v => v));
        document.getElementById('display-sel0').classList.remove('disabled-select');
    } catch (e) { document.getElementById('status').innerText = "Error de conexión."; }
}

function parseCSV(text) {
    return text.split('\n').slice(1).map(line => {
        const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
        return { c0: cells[0]||"", c1: cells[1]||"", c2: cells[2]||"", c3: cells[3]||"", c4: cells[4]||"", c5: cells[5]||"" };
    }).filter(item => item.c0);
}

function toggleDropdown(listId, displayId) {
    const list = document.getElementById(listId);
    const display = document.getElementById(displayId);
    if (display.classList.contains('disabled-select')) return;
    
    const isShowing = list.classList.contains('show');
    closeAllDropdowns();
    if (!isShowing) { list.classList.add('show'); display.classList.add('select-arrow-active'); }
}

function selectOption(displayId, inputId, val, text) {
    document.getElementById(displayId).innerText = text || val;
    document.getElementById(inputId).value = val;
    closeAllDropdowns();
}

function closeAllDropdowns() {
    const lists = document.getElementsByClassName('select-items');
    const displays = document.getElementsByClassName('select-selected');
    for (let i = 0; i < lists.length; i++) lists[i].classList.remove('show');
    for (let i = 0; i < displays.length; i++) displays[i].classList.remove('select-arrow-active');
}

document.addEventListener("click", function(event) {
    if (!event.target.matches('.select-selected')) closeAllDropdowns();
});

function fillClientData() {
    const idx = document.getElementById('selCliente').value;
    if (idx === "") { selectedPhone = ""; currentClientName = ""; return; }
    const c = dataCli[idx];
    document.getElementById('cliTel').value = c.c1;
    document.getElementById('cliDir').value = c.c2;
    document.getElementById('cliObs').value = c.c3;
    selectedPhone = c.c1.replace(/\D/g, '');
    currentClientName = document.getElementById('display-selCliente').innerText.split(' ')[0].trim().replace(/[^a-zA-Z0-9]/g, '');
}

function updateDropdown(index) {
    for (let i = index; i < selects.length; i++) { 
        selects[i].value = ""; 
        document.getElementById('display-sel' + i).innerText = '-- Selección --';
        document.getElementById('display-sel' + i).classList.add('disabled-select');
        document.getElementById('list-sel' + i).innerHTML = "";
    }
    
    const filtered = dataMat.filter(item => {
        for (let i = 0; i < index; i++) if (item[`c${i}`] !== selects[i].value) return false;
        return true;
    });
    
    const uniqueVals = [...new Set(filtered.map(item => item[`c${index}`]))].filter(v => v);
    if (uniqueVals.length > 0) {
        document.getElementById('display-sel' + index).classList.remove('disabled-select');
        fillSelect(index, uniqueVals);
    }
}

function fillSelect(index, vals) {
    const list = document.getElementById('list-sel' + index);
    list.innerHTML = '';
    vals.forEach(v => { 
        const div = document.createElement('div');
        div.textContent = v;
        div.onclick = () => {
            selectOption('display-sel' + index, 'sel' + index, v, v);
            updateDropdown(index + 1);
        };
        list.appendChild(div);
    });
}

function changeQty(v) {
    const input = document.getElementById('cantidad');
    input.value = Math.max(1, parseInt(input.value) + v);
}

function createRowItem(className, raw, html, prepend = false) {
    const div = document.createElement('div');
    div.className = "row-item " + className;
    div.setAttribute('data-raw', raw);
    div.innerHTML = `<div class="item-content" style="flex:1; overflow:hidden; text-overflow:ellipsis;">${html}</div><button class="btn-delete" onclick="this.parentElement.remove()">×</button>`;
    const container = document.getElementById('itemsContainer');
    if(prepend) container.prepend(div); else container.appendChild(div);
}

function addClientToList() {
    const idx = document.getElementById('selCliente').value;
    if (idx === "") return;
    const c = dataCli[idx], fecha = new Date().toLocaleDateString('es-ES');
    createRowItem("client-header", `CLI\t${c.c0}\t${c.c1}\t${c.c2}`, `<strong>${fecha} - ${c.c0}</strong>`, true);
    const b = document.getElementById('btnCli'); 
    b.innerText = "✓"; b.classList.add('btn-success-active');
    setTimeout(() => { 
        document.getElementById('section-client').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
    }, 600);
}

function addGeneralObs() {
    const obs = document.getElementById('obsGenerales').value;
    if (!obs.trim()) return;
    createRowItem("general-header", `OBS\t${obs}`, `<i>Nota: ${obs}</i>`);
    document.getElementById('obsGenerales').value = "";
    btnAlert('btnGen', 'OK');
}

function addItem() {
    let textParts = [];
    selects.forEach(s => { if (s.value) textParts.push(s.value); });
    if (textParts.length === 0) return;
    const cant = document.getElementById('cantidad').value, unit = document.querySelector('input[name="um"]:checked').value, obs = document.getElementById('observaciones').value;
    createRowItem("", `ITM\t${cant}\t${unit}\t${textParts.join(' ')}\t${obs}`, `<b>${cant} ${unit.substring(0,3)}</b> | ${textParts.join('/')} ${obs ? '['+obs+']' : ''}`);
    
    selects[0].value = ""; document.getElementById('display-sel0').innerText = '-- Selección --';
    updateDropdown(1); 
    document.getElementById('observaciones').value = ""; document.getElementById('cantidad').value = "1";
    btnAlert('btnMat', 'Agregar Item');
}

function btnAlert(id, text) {
    const b = document.getElementById(id); b.innerText = "✓"; b.classList.add('btn-success-active');
    setTimeout(() => { b.innerText = text; b.classList.remove('btn-success-active'); }, 800);
}

function copyTitle() {
    const nameToUse = currentClientName || "Cliente";
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const title = `${nameToUse}_Villaser_Materiales_${dd}-${mm}-${yyyy}`;
    const textArea = document.createElement("textarea");
    textArea.value = title;
    textArea.style.position = "fixed"; textArea.style.left = "-9999px";
    document.body.appendChild(textArea); textArea.select();
    try { document.execCommand('copy'); btnAlert('btnCopyTitle', '📋 TITULO'); } catch (err) {}
    document.body.removeChild(textArea);
}

function takeScreenshot() {
    const area = document.getElementById('captureSection');
    const deletes = area.querySelectorAll('.btn-delete');
    deletes.forEach(b => b.style.visibility = 'hidden');
    const nameToUse = currentClientName || "Lista";
    const fileName = nameToUse + "_materiales_villaser.png";
    
    // Determinar el color de fondo para la imagen dependiendo del tema activo
    const isLightMode = document.body.classList.contains('light-mode');
    const bgColor = isLightMode ? "#ffffff" : "#333333";

    html2canvas(area, { backgroundColor: bgColor, scale: 2, useCORS: true, allowTaint: true }).then(canvas => {
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.setAttribute('href', dataURL); link.setAttribute('download', fileName);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        deletes.forEach(b => b.style.visibility = 'visible');
    });
}

function exportToTxt() {
    const items = document.querySelectorAll('.row-item');
    if (items.length === 0) { alert("Lista vacía"); return; }
    let content = [];
    items.forEach(i => content.push(i.getAttribute('data-raw')));
    const blob = new Blob([content.join('\n')], { type: 'text/plain' });
    const reader = new FileReader();
    reader.onload = function(e) {
        const link = document.createElement('a'); link.href = e.target.result;
        link.download = (currentClientName || "Lista") + "_Villaser.txt";
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
    reader.readAsDataURL(blob); btnAlert('btnExport', '💾 EXPORTAR');
}

function importFromTxt(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split('\n');
        const container = document.getElementById('itemsContainer'); container.innerHTML = "";
        lines.forEach(line => {
            const raw = line.split('\t');
            if (raw[0] === 'CLI') {
                currentClientName = raw[1].split(' ')[0].trim().replace(/[^a-zA-Z0-9]/g, '');
                selectedPhone = raw[2].replace(/\D/g, '');
                createRowItem("client-header", line, `<strong>${new Date().toLocaleDateString('es-ES')} - ${raw[1]}</strong>`);
                document.getElementById('section-client').classList.add('hidden');
                document.getElementById('main-content').classList.remove('hidden');
            } else if (raw[0] === 'OBS') {
                createRowItem("general-header", line, `<i>Nota: ${raw[1]}</i>`);
            } else if (raw[0] === 'ITM') {
                createRowItem("", line, `<b>${raw[1]} ${raw[2].substring(0,3)}</b> | ${raw[3]} ${raw[4] ? '['+raw[4]+']' : ''}`);
            }
        });
        event.target.value = ""; btnAlert('btnImport', '📂 IMPORTAR');
    };
    reader.readAsText(file);
}

function sendWSP() {
    if (!selectedPhone) { alert("Seleccione cliente primero"); return; }
    const items = document.querySelectorAll('.row-item');
    if (items.length === 0) { alert("La lista está vacía"); return; }
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
    setTimeout(() => { if (document.hasFocus()) window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text)}`, '_blank'); }, 500);
}

// Inicializar la aplicación
init();

