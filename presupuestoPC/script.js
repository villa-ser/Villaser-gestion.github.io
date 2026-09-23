document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
    
    // Para actualizar la vista previa en vivo cuando se escriben notas globales
    document.getElementById('obsGenerales').addEventListener('input', renderTabla);
});

const SHEET_ID = '1tZbCYSBxx3suGLKmE_bXi_hEm0iH0yqQedqR7kdShEU';
const URL_PRECIOS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Hoja1`; 
const URL_CLIENTES = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Clientes`;

let dbPrecios = [], dbClientes = [], clienteActual = null, listaItems = [], notasOriginales = "";
let nroPresupuestoGlobal = "";

// Variables para ediciones temporales
let conceptoEditado = null;
let precioEditado = null;

const selCliente = document.getElementById('selCliente');
const selTema = document.getElementById('selTema');
const selConcepto = document.getElementById('selConcepto');

window.onload = fetchData;

async function fetchData() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const [resCli, resPre] = await Promise.all([
            fetch(URL_CLIENTES, { signal: controller.signal }),
            fetch(URL_PRECIOS, { signal: controller.signal })
        ]);
        
        clearTimeout(timeoutId); 
        
        const txtCli = await resCli.text(), txtPre = await resPre.text();
        const jCli = JSON.parse(txtCli.substring(txtCli.indexOf("{"), txtCli.lastIndexOf("}") + 1));
        const jPre = JSON.parse(txtPre.substring(txtPre.indexOf("{"), txtPre.lastIndexOf("}") + 1));
        
        dbClientes = jCli.table.rows.map(r => ({ nombre: r.c[0]?.v || '', tel: String(r.c[1]?.v || ''), dir: r.c[2]?.v || '' })).filter(c => c.nombre && c.nombre !== "Nombre");
        dbPrecios = jPre.table.rows.filter(r => r.c[1] && r.c[1].v !== "Concepto").map(r => ({ tema: r.c[0]?.v || 'Gral', concepto: r.c[1]?.v || '', precio: typeof r.c[2]?.v === 'number' ? r.c[2].v : 0, notas: r.c[3]?.v || '' }));
        
        document.getElementById('loading').style.display = 'none'; 
        document.getElementById('app').style.display = 'block';
        
        poblarClientes(); 
        poblarTemas();
        setupEventListeners();
    } catch (e) { 
        clearTimeout(timeoutId);
        const loadingDiv = document.getElementById('loading');
        
        if (e.name === 'AbortError') {
            loadingDiv.innerHTML = `⚠️ Tiempo de conexión agotado.<br><br><button class="btn-ngc" onclick="location.reload()">Reintentar</button>`;
        } else {
            loadingDiv.innerHTML = `⚠️ Error de conexión a la base de datos.<br><br><button class="btn-ngc" onclick="location.reload()">Reintentar</button>`;
        }
        console.error(e);
    }
}

function setupEventListeners() {
    selCliente.addEventListener('change', actualizarCamposCliente);
    selTema.addEventListener('change', cambioTema);
    selConcepto.addEventListener('change', cargarDetallePrecios);
}

function step(id, val) { 
    const el = document.getElementById(id); 
    let newValue = parseInt(el.value || 0) + val;
    el.value = Math.max(el.min ? parseInt(el.min) : 0, newValue); 
}

function poblarClientes() { 
    selCliente.innerHTML = '<option value="">-- SELECCIONE CLIENTE --</option>';
    dbClientes.forEach(c => { 
        const opt = document.createElement('option');
        opt.value = c.nombre;
        opt.textContent = c.nombre;
        selCliente.appendChild(opt);
    }); 
}

function poblarTemas() { 
    selTema.innerHTML = '<option value="">-- SELECCIONE RUBRO --</option>';
    [...new Set(dbPrecios.map(i => i.tema))].sort().forEach(t => { 
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        selTema.appendChild(opt);
    }); 
}

function actualizarCamposCliente() { 
    const c = dbClientes.find(i => i.nombre === selCliente.value); 
    document.getElementById('cliInfo').value = c ? `Tel: ${c.tel}\nDir: ${c.dir}` : ''; 
}

function cargarClienteALista() { 
    const c = dbClientes.find(i => i.nombre === selCliente.value); 
    if(!c) {
        alert("Por favor, seleccione un cliente.");
        selCliente.focus();
        return; 
    }
    clienteActual = {...c, fecha: new Date().toLocaleDateString('es-AR')}; 
    nroPresupuestoGlobal = `PEM-${Math.floor(Math.random() * 9000) + 1000}`; // Genera número único
    document.getElementById('step-cliente').style.display = 'none';
    document.getElementById('step-trabajo').style.display = 'flex';
    renderTabla(); 
}

function cambioTema() { 
    const t = selTema.value; 
    selConcepto.innerHTML = '<option value="">-- SELECCIONE TRABAJO --</option>';
    limpiarEdicionesTemporales();
    document.getElementById('unitarioLabel').innerText = "Unitario: $ 0,00";
    document.getElementById('obsManual').value = "";

    if(t) {
        selConcepto.disabled = false;
        dbPrecios.filter(i => i.tema === t).forEach(i => { 
            const opt = document.createElement('option');
            opt.value = i.concepto;
            opt.textContent = i.concepto;
            selConcepto.appendChild(opt);
        }); 
    } else {
        selConcepto.disabled = true;
    }
}

function limpiarEdicionesTemporales() {
    conceptoEditado = null;
    precioEditado = null;
    document.getElementById('badgeConcepto').style.display = 'none';
    document.getElementById('badgePrecio').style.display = 'none';
    document.getElementById('btnEditConcepto').style.display = 'none';
    document.getElementById('btnEditPrecio').style.display = 'none';
}

function cargarDetallePrecios() { 
    const item = dbPrecios.find(i => i.tema === selTema.value && i.concepto === selConcepto.value); 
    const inputObs = document.getElementById('obsManual');
    
    limpiarEdicionesTemporales();
    
    if(item) { 
        document.getElementById('unitarioLabel').innerText = `Unitario: $ ${item.precio.toLocaleString('es-AR')}`; 
        inputObs.value = item.notas; 
        notasOriginales = item.notas; 
        inputObs.readOnly = true; 
        
        // Habilitar botones de edición
        document.getElementById('btnEditConcepto').style.display = 'inline-block';
        document.getElementById('btnEditPrecio').style.display = 'inline-block';
    } else {
        document.getElementById('unitarioLabel').innerText = "Unitario: $ 0,00";
        inputObs.value = "";
    }
}

function editarConceptoTemporal() {
    const itemActual = dbPrecios.find(i => i.tema === selTema.value && i.concepto === selConcepto.value);
    if (!itemActual) return;
    
    const valorBase = conceptoEditado !== null ? conceptoEditado : itemActual.concepto;
    const nuevoTexto = prompt("Editar nombre del trabajo (solo aplica a este presupuesto):", valorBase);
    
    if (nuevoTexto !== null && nuevoTexto.trim() !== "") {
        conceptoEditado = nuevoTexto.trim();
        document.getElementById('badgeConcepto').style.display = 'block';
    }
}

function editarPrecioTemporal() {
    const itemActual = dbPrecios.find(i => i.tema === selTema.value && i.concepto === selConcepto.value);
    if (!itemActual) return;
    
    const valorBase = precioEditado !== null ? precioEditado : itemActual.precio;
    const nuevoPrecioStr = prompt("Editar precio unitario (solo aplica a este presupuesto):", valorBase);
    
    if (nuevoPrecioStr !== null) {
        // Limpiamos formatos raros y aseguramos número
        const nuevoPrecio = parseFloat(nuevoPrecioStr.replace(/[^0-9.,]/g, '').replace(',', '.'));
        if (!isNaN(nuevoPrecio)) {
            precioEditado = nuevoPrecio;
            document.getElementById('unitarioLabel').innerText = `Unitario: $ ${nuevoPrecio.toLocaleString('es-AR')}`;
            document.getElementById('badgePrecio').style.display = 'block';
        }
    }
}

function habilitarEdicionObs() { 
    const f = document.getElementById('obsManual'); 
    f.readOnly = false; 
    f.focus(); 
}
function volverNotasOriginales() { 
    const f = document.getElementById('obsManual'); 
    f.value = notasOriginales; 
    f.readOnly = true; 
}
function borrarTodasNotas() { document.getElementById('obsManual').value = ""; }

function agregarTrabajo() {
    const itemOriginal = dbPrecios.find(i => i.tema === selTema.value && i.concepto === selConcepto.value);
    if(!itemOriginal) {
        alert("Seleccione un trabajo para agregar.");
        return;
    }
    
    // Rescatar los valores editados si existen, sino usar original
    const finalConcepto = conceptoEditado !== null ? conceptoEditado : itemOriginal.concepto;
    const finalPrecio = precioEditado !== null ? precioEditado : itemOriginal.precio;
    
    const qty = parseInt(document.getElementById('cantidad').value) || 1;
    const desc = parseInt(document.getElementById('porcentajeDesc').value) || 0;
    const finalTotal = (finalPrecio * qty) * (1 - desc / 100);
          
    listaItems.push({ 
        id: Date.now(), 
        concepto: finalConcepto, 
        obs: document.getElementById('obsManual').value, 
        qty, 
        total: finalTotal, 
        unitario: finalPrecio, 
        desc 
    });
    
    renderTabla(); 
    
    // Reset inputs
    document.getElementById('obsManual').value = ""; 
    document.getElementById('cantidad').value = 1; 
    selConcepto.value = ""; 
    limpiarEdicionesTemporales();
    document.getElementById('unitarioLabel').innerText = "Unitario: $ 0,00";
    animarBoton('btnAddItem');
}

function renderTabla() {
    const tbody = document.getElementById('cuerpoTabla'); 
    tbody.innerHTML = ''; 
    let total = 0;
    
    if(clienteActual) { 
        const r = tbody.insertRow(); 
        r.innerHTML = `<td colspan="4" style="color:var(--ngc-primary); font-size:0.85rem; padding-bottom:15px; line-height: 1.4;"><b>CLIENTE:</b> ${clienteActual.nombre}<br><b>FECHA:</b> ${clienteActual.fecha} <br><b>TEL:</b> ${clienteActual.tel}</td>`; 
    }
    
    listaItems.forEach(i => { 
        total += i.total; 
        const r = tbody.insertRow(); 
        r.innerHTML = `
            <td>
                <b>${i.concepto}</b>
                <span style="display:block; font-size:0.8rem; color:var(--text-dim);">Unit: $${i.unitario.toLocaleString('es-AR')}${i.desc > 0 ? ` <strong style="color:var(--ngc-warning)">(-${i.desc}%)</strong>` : ''}</span>
                ${i.obs ? `<small style="display:block; opacity:0.8; white-space: pre-wrap; margin-top:4px;">${i.obs}</small>` : ''}
            </td>
            <td align="center" style="font-weight:bold;">x${i.qty}</td>
            <td align="right" style="color:var(--ngc-primary); font-weight:bold; font-size:1.05rem;">$${i.total.toLocaleString('es-AR')}</td>
            <td align="right" style="width: 40px;"><button class="trash-icon" onclick="borrarItem(${i.id})" aria-label="Eliminar item">✕</button></td>
        `; 
    });
    
    const og = document.getElementById('obsGenerales').value; 
    if(og) { 
        const r = tbody.insertRow(); 
        r.innerHTML = `<td colspan="4" style="font-size:0.9rem; color:var(--text-dim); padding-top:15px; font-style:italic;">Nota: ${og}</td>`; 
    }
    
    document.getElementById('totalDisplay').innerText = `TOTAL: $ ${total.toLocaleString('es-AR')}`;
    
    // Actualizar vista previa del PDF en tiempo real
    sincronizarVistaPreviaPDF();
}

function borrarItem(id) { 
    listaItems = listaItems.filter(i => i.id !== id); 
    renderTabla(); 
}

// --- ACTUALIZADOR DE LA VISTA PREVIA PDF ---
function sincronizarVistaPreviaPDF() {
    if (!clienteActual) return;

    document.getElementById('pdf-nro').innerText = nroPresupuestoGlobal;
    document.getElementById('pdf-fecha').innerText = clienteActual.fecha;
    document.getElementById('pdf-cliente').innerText = clienteActual.nombre;
    document.getElementById('pdf-direccion').innerText = clienteActual.dir || 'A coordinar';

    const tbody = document.getElementById('pdf-tbody');
    tbody.innerHTML = '';
    
    let subtotalPuro = 0;
    let totalDescuentos = 0;
    let notasAcumuladas = '';

    listaItems.forEach((i, index) => {
        const codigoItem = `0${index + 1}-0${Math.floor(Math.random() * 5) + 1}`; 
        const valorUnitarioOriginal = i.unitario;
        const subtotalFilaPuro = valorUnitarioOriginal * i.qty;
        const subtotalFilaConDesc = i.total;
        const descuentoFila = subtotalFilaPuro - subtotalFilaConDesc;

        subtotalPuro += subtotalFilaPuro;
        totalDescuentos += descuentoFila;

        let textoConcepto = i.concepto;
        if (i.desc > 0) {
            textoConcepto += ` <strong style="color: #ffc107;">(-${i.desc}% -$ ${descuentoFila.toLocaleString('es-AR')})</strong>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${codigoItem}</td>
            <td>${textoConcepto}</td>
            <td>${i.qty}</td>
            <td>$&nbsp;${valorUnitarioOriginal.toLocaleString('es-AR')}</td>
            <td>$&nbsp;${subtotalFilaPuro.toLocaleString('es-AR')}</td>
        `;
        tbody.appendChild(tr);

        if(i.obs) {
            notasAcumuladas += `<b>${codigoItem}</b> ${i.obs.replace(/\n/g, ' ')}\n`;
        }
    });

    const og = document.getElementById('obsGenerales').value;
    if(og) notasAcumuladas += `\n<b>Gral:</b> ${og}`;

    const totalFinal = subtotalPuro - totalDescuentos;
    document.getElementById('pdf-subtotal').innerText = `$ ${subtotalPuro.toLocaleString('es-AR')}`;
    document.getElementById('pdf-descuentos').innerText = `-$ ${totalDescuentos.toLocaleString('es-AR')}`;
    document.getElementById('pdf-total').innerText = `$ ${totalFinal.toLocaleString('es-AR')}`;
    document.getElementById('pdf-notas').innerHTML = notasAcumuladas ? notasAcumuladas.replace(/\n/g, '<br>') : 'Sin notas aclaratorias.';
}


async function copiarTitulo() {
    if(!clienteActual) return;
    const primerNombre = clienteActual.nombre.split(' ')[0];
    const hoy = new Date();
    const f = hoy.getDate().toString().padStart(2,'0')+'-'+(hoy.getMonth()+1).toString().padStart(2,'0')+'-'+hoy.getFullYear();
    const texto = `${primerNombre}_Villaser_Presupuesto_${f}`;
    
    try {
        await navigator.clipboard.writeText(texto);
        animarBoton('btnCopyTitle');
    } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = texto;
        textArea.style.position = "fixed"; textArea.style.left = "-99999px"; 
        document.body.appendChild(textArea);
        textArea.focus(); textArea.select();
        document.execCommand('copy'); 
        document.body.removeChild(textArea);
        animarBoton('btnCopyTitle');
    }
}

function exportarPresupuesto() {
    if (!clienteActual || listaItems.length === 0) return alert("No hay datos para exportar.");
    const data = { cliente: clienteActual, items: listaItems, obsG: document.getElementById('obsGenerales').value, nroGlobal: nroPresupuestoGlobal };
    
    const jsonString = JSON.stringify(data, null, 2);
    const utf8Bytes = new TextEncoder().encode(jsonString);
    const base64Data = btoa(Array.from(new Uint8Array(utf8Bytes), b => String.fromCharCode(b)).join(''));
    
    const a = document.createElement('a');
    const f = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    a.href = 'data:text/plain;base64,' + base64Data;
    a.download = `${clienteActual.nombre.split(' ')[0]}_Villaser_${f}.txt`;
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a);
}

function importarPresupuesto(e) {
    const file = e.target.files[0]; 
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            clienteActual = data.cliente; 
            listaItems = data.items;
            document.getElementById('obsGenerales').value = data.obsG || "";
            if (data.nroGlobal) nroPresupuestoGlobal = data.nroGlobal;
            
            selCliente.value = clienteActual.nombre;
            
            document.getElementById('step-cliente').style.display = 'none';
            document.getElementById('step-trabajo').style.display = 'flex';
            renderTabla();
        } catch(err) { alert("Archivo no válido"); }
    };
    reader.readAsText(file); 
    e.target.value = '';
}

// --- GENERADOR DE IMAGEN (PNG) PARA WHATSAPP ---
async function tomarCaptura() { 
    if (!clienteActual) return alert("Cargue un cliente primero");
    const zona = document.getElementById('zonaCaptura'); 
    const trash = document.querySelectorAll('.trash-icon'); 
    trash.forEach(b => b.style.display = 'none'); 
    
    zona.style.color = "#ffffff";
    
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    window.scrollTo(0, 0);

    const canvas = await html2canvas(zona, { 
        backgroundColor: "#1e1e1e", 
        scale: 2,
        useCORS: true,
        scrollY: 0
    }); 
    
    window.scrollTo(scrollX, scrollY);

    const link = document.createElement('a'); 
    link.download = `Presupuesto_NGC_${clienteActual.nombre.split(' ')[0]}.png`; 
    link.href = canvas.toDataURL(); 
    link.click(); 
    
    trash.forEach(b => b.style.display = 'inline-block'); 
    zona.style.color = ""; 
}

// --- GENERADOR DE PDF A4 ---
async function generarPDF() {
    if (!clienteActual || listaItems.length === 0) {
        alert("Agregá un cliente y trabajos para generar el PDF.");
        return;
    }

    // Actualiza por seguridad antes de crear
    sincronizarVistaPreviaPDF();

    const element = document.getElementById('plantilla-pdf');
    
    // Forzamos visibilidad para asegurar que html2pdf lo capture bien en celulares
    const originalDisplay = getComputedStyle(element).display;
    if (originalDisplay === 'none') element.style.display = 'block';

    window.scrollTo(0, 0);

    const opt = {
        margin:       0, 
        filename:     `${clienteActual.nombre.replace(/ /g, '_')}_Villaser_${nroPresupuestoGlobal}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    animarBoton('btnGenerarPDF'); 
    
    try {
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("Error al generar PDF: ", error);
        alert("Hubo un error al generar el PDF.");
    } finally {
        // Restaurar a su estado original si estabamos en móvil
        if (window.innerWidth < 992) {
             element.style.display = 'none';
        }
    }
}

function enviarWhatsApp() { 
    if(!clienteActual) return; 
    let m = `*VILLASER - PRESUPUESTO*\nCliente: ${clienteActual.nombre}\n\n`; 
    listaItems.forEach(i => { m += `• ${i.concepto} (x${i.qty}) -> *$${i.total.toLocaleString('es-AR')}*\n`; }); 
    m += `\n*TOTAL: ${document.getElementById('totalDisplay').innerText.split(': ')[1]}*`; 
    window.open(`https://wa.me/549${clienteActual.tel.replace(/\D/g, '')}?text=${encodeURIComponent(m)}`, '_blank'); 
}

function animarBoton(id) { 
    const b = document.getElementById(id); 
    const originalText = b.innerText;
    b.classList.add('active-success'); 
    b.innerText = "¡LISTO!";
    setTimeout(() => {
        b.classList.remove('active-success'); 
        b.innerText = originalText;
    }, 1000); 
}
