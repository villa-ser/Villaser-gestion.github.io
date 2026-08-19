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
const selCliente = document.getElementById("selCliente");

// Event Listener Nativo
selCliente.addEventListener('change', mostrarDatos);

async function cargarDatos() {
    try {
        const res = await fetch(base);
        const text = await res.text();
        const jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const json = JSON.parse(jsonText);
        const filas = json.table.rows;
        
        selCliente.innerHTML = '<option value="">-- SELECCIONAR CLIENTE --</option>';

        filas.forEach((fila, index) => {
            const c = fila.c; 
            if (c && c[0] && c[0].v !== null) {
                const info = {
                    nombre: String(c[0].v).trim(), 
                    tel: (c[1] && c[1].v) ? String(c[1].v).trim() : "", 
                    dir: (c[2] && c[2].v) ? String(c[2].v).trim() : "", 
                    obs: (c[5] && c[5].v) ? String(c[5].v).trim() : ""  
                };
                
                // Excluimos cabeceras o filas vacías
                if (index > 0 || !["nombre", "cliente"].includes(info.nombre.toLowerCase())) {
                    datosGlobales.push(info);
                    
                    const opt = document.createElement("option");
                    opt.value = datosGlobales.length - 1; // Guardamos el índice
                    opt.textContent = info.nombre;
                    selCliente.appendChild(opt);
                }
            }
        });
        document.getElementById("status-load").style.display = "none";
    } catch (e) {
        console.error(e);
        selCliente.innerHTML = '<option value="">⚠️ ERROR DE CARGA</option>';
        document.getElementById("status-load").innerText = "Fallo de conexión";
    }
}

function mostrarDatos() {
    const idx = selCliente.value;
    
    // Si vuelve a la opción por defecto
    if (idx === "") { 
        resetUI(); 
        return; 
    }

    const d = datosGlobales[idx];
    const telLimpio = d.tel.replace(/\D/g, ''); 
    
    document.getElementById("campoTel").value = d.tel;
    document.getElementById("campoDir").value = d.dir;
    document.getElementById("campoObs").value = d.obs;

    // Mostrar u ocultar botones de acción
    const btnCall = document.getElementById("btnCall");
    const btnWts = document.getElementById("btnWts");
    const btnMap = document.getElementById("btnMap");

    if (telLimpio) {
        btnCall.style.display = "flex";
        btnCall.href = `tel:${telLimpio}`;
        btnWts.style.display = "flex";
        btnWts.href = `https://wa.me/${telLimpio}`;
    } else {
        btnCall.style.display = "none";
        btnWts.style.display = "none";
    }
    
    if (d.dir) {
        btnMap.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.dir)}`;
        btnMap.style.display = "flex";
    } else { 
        btnMap.style.display = "none"; 
    }
    
    // Si cambia de cliente, ocultar el editor si estaba abierto
    document.getElementById("editor-section").style.display = "none";
}

function prepararFicha() {
    const idx = selCliente.value;
    if (idx === "") {
        alert("Por favor, seleccione un cliente primero.");
        selCliente.focus();
        return;
    }

    const nombre = selCliente.options[selCliente.selectedIndex].text;
    const tel = document.getElementById("campoTel").value || "No registrado";
    const dir = document.getElementById("campoDir").value || "No registrada";
    const obs = document.getElementById("campoObs").value || "Sin observaciones";

    const texto = `CLIENTE: ${nombre}\nTELÉFONO: ${tel}\nDIRECCIÓN: ${dir}\nNOTAS: ${obs}`;
    
    document.getElementById("editorTexto").value = texto;
    document.getElementById("editor-section").style.display = "block";
    
    // Scroll hacia el editor para mejor UX móvil
    document.getElementById("editor-section").scrollIntoView({ behavior: "smooth" });
}

// API de Portapapeles Moderna con Fallback
async function copiarAlPortapapeles() {
    const editor = document.getElementById("editorTexto");
    const btn = document.getElementById("btnCopy");
    
    try {
        await navigator.clipboard.writeText(editor.value);
        animarBotonCopia(btn);
    } catch (err) {
        // Fallback para navegadores antiguos
        editor.select();
        try {
            document.execCommand('copy');
            animarBotonCopia(btn);
        } catch (errFallback) {
            alert("Error al copiar. Mantenga pulsado el texto para copiar manualmente.");
        }
    }
}

function animarBotonCopia(btn) {
    const textoOriginal = btn.innerText;
    btn.innerText = "✅ COPIADO";
    setTimeout(() => {
        btn.innerText = textoOriginal;
    }, 2000);
}

function resetUI() {
    document.getElementById("campoTel").value = "";
    document.getElementById("campoDir").value = "";
    document.getElementById("campoObs").value = "";
    document.querySelectorAll(".btn-ngc-side").forEach(b => b.style.display = "none");
    document.getElementById("editor-section").style.display = "none";
}

// Inicializar
cargarDatos();
    
