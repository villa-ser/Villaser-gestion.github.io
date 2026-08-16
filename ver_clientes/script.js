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
// 2. LÓGICA DEL DIRECTORIO DE CLIENTES
// =======================================================
const sheetId = '1aPynYCYBaEafPC4rqTulMOzPg_guy_NLzZHOzvFJwyw';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=ClientesVer`;

let datosGlobales = [];

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
    mostrarDatos(); // Llama a mostrarDatos después de seleccionar
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

async function cargarDatos() {
    try {
        const res = await fetch(base);
        const text = await res.text();
        const jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const json = JSON.parse(jsonText);
        const filas = json.table.rows;
        
        const listDiv = document.getElementById("list-selCliente");
        const displayDiv = document.getElementById("display-selCliente");
        listDiv.innerHTML = '';
        
        // Opción por defecto
        let optDefault = document.createElement("div");
        optDefault.textContent = "-- SELECCIONAR --";
        optDefault.onclick = () => selectOption('display-selCliente', 'listaNombres', "", "-- SELECCIONAR --");
        listDiv.appendChild(optDefault);

        displayDiv.innerText = "-- SELECCIONAR --";

        filas.forEach((fila, index) => {
            const c = fila.c; 
            if (c && c[0] && c[0].v !== null) {
                const info = {
                    nombre: String(c[0].v).trim(), 
                    tel: (c[1] && c[1].v) ? String(c[1].v).trim() : "", 
                    dir: (c[2] && c[2].v) ? String(c[2].v).trim() : "", 
                    obs: (c[5] && c[5].v) ? String(c[5].v).trim() : ""  
                };
                if (index > 0 || !["nombre", "cliente"].includes(info.nombre.toLowerCase())) {
                    datosGlobales.push(info);
                    
                    let optDiv = document.createElement("div");
                    const valorIndice = datosGlobales.length - 1;
                    optDiv.textContent = info.nombre;
                    optDiv.onclick = () => selectOption('display-selCliente', 'listaNombres', valorIndice, info.nombre);
                    listDiv.appendChild(optDiv);
                }
            }
        });
        document.getElementById("status-load").style.display = "none";
    } catch (e) {
        document.getElementById("display-selCliente").innerText = 'ERROR DE CARGA';
    }
}

function mostrarDatos() {
    const idx = document.getElementById("listaNombres").value;
    if (idx === "") { resetUI(); return; }

    const d = datosGlobales[idx];
    const telLimpio = d.tel.replace(/\D/g, ''); 
    
    document.getElementById("campoTel").value = d.tel;
    document.getElementById("campoDir").value = d.dir;
    document.getElementById("campoObs").value = d.obs;

    // Mostrar botones de acción
    document.getElementById("btnCall").style.display = telLimpio ? "flex" : "none";
    document.getElementById("btnCall").href = `tel:${telLimpio}`;
    document.getElementById("btnWts").style.display = telLimpio ? "flex" : "none";
    document.getElementById("btnWts").href = `https://wa.me/${telLimpio}`;
    
    const bMap = document.getElementById("btnMap");
    if (d.dir) {
        bMap.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.dir)}`;
        bMap.style.display = "flex";
    } else { bMap.style.display = "none"; }
}

function prepararFicha() {
    const idx = document.getElementById("listaNombres").value;
    if (idx === "") return;

    const nombre = document.getElementById("display-selCliente").innerText; // Tomamos el nombre del div display
    const tel = document.getElementById("campoTel").value;
    const dir = document.getElementById("campoDir").value;
    const obs = document.getElementById("campoObs").value;

    const texto = `CLIENTE: ${nombre}\nTELÉFONO: ${tel}\nDIRECCIÓN: ${dir}\nNOTAS: ${obs}`;
    
    document.getElementById("editorTexto").value = texto;
    document.getElementById("editor-section").style.display = "block";
}

function copiarAlPortapapeles() {
    const editor = document.getElementById("editorTexto");
    editor.select();
    try {
        document.execCommand('copy');
        const btn = document.querySelector(".btn-copy-final");
        btn.innerText = "✅ COPIADO";
        setTimeout(() => btn.innerText = "📋 COPIAR TEXTO", 2000);
    } catch (err) {
        alert("Pulsa prolongado para copiar manualmente");
    }
}

function resetUI() {
    document.getElementById("campoTel").value = "";
    document.getElementById("campoDir").value = "";
    document.getElementById("campoObs").value = "";
    document.querySelectorAll(".btn-ngc-side").forEach(b => b.style.display = "none");
    document.getElementById("editor-section").style.display = "none";
}

// Inicializar la carga de datos
cargarDatos();
                      
