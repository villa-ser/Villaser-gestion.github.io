document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
});

const SHEET_ID = '1tZbCYSBxx3suGLKmE_bXi_hEm0iH0yqQedqR7kdShEU';
const URL_PRECIOS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Hoja1`; 
const URL_CLIENTES = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Clientes`;

let dbPrecios = [], dbClientes = [], clienteActual = null, listaItems = [], notasOriginales = "";

// Referencias a los Selects
const selCliente = document.getElementById('selCliente');
const selTema = document.getElementById('selTema');
const selConcepto = document.getElementById('selConcepto');

window.onload = fetchData;

async function fetchData() {
    try {
        const [resCli, resPre] = await Promise.all([fetch(URL_CLIENTES), fetch(URL_PRECIOS)]);
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
        document.getElementById('loading').innerText = "⚠️ Error de conexión"; 
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
    document.getElementById('step-cliente').style.display = 'none';
    document.getElementById('step-trabajo').style.display = 'flex';
    renderTabla(); 
}

function cambioTema() { 
    const t = selTema.value; 
    selConcepto.innerHTML = '<option value="">-- SELECCIONE TRABAJO --</option>';
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

function cargarDetallePrecios() { 
    const item = dbPrecios.find(i => i.tema === selTema.value && i.concepto === selConcepto.value); 
    const inputObs = document.getElementById('obsManual');
    
    if(item) { 
        document.getElementById('unitarioLabel').innerText = `Unitario: $ ${item.precio.toLocaleString('es-AR')}`; 
        inputObs.value = item.notas; 
        notasOriginales = item.notas; 
        inputObs.readOnly = true; 
    } else {
        document.getElementById('unitarioLabel').innerText = "Unitario: $ 0,00";
        inputObs.value = "";
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
    const item = dbPrecios.find(i => i.tema === selTema.value && i.concepto === selConcepto.value);
    if(!item) {
        alert("Seleccione un trabajo para agregar.");
        return;
    }
    
    const qty = parseInt(document.getElementById('cantidad').value) || 1;
    const desc = parseInt(document.getElementById('porcentajeDesc').value) || 0;
    const final = (item.precio * qty) * (1 - desc / 100);
          
    listaItems.push({ 
        id: Date.now(), 
        concepto: item.concepto, 
        obs: document.getElementById('obsManual').value, 
        qty, 
        total: final, 
        unitario: item.precio, 
        desc 
    });
    
    renderTabla(); 
    document.getElementById('obsManual').value = ""; 
    document.getElementById('cantidad').value = 1; 
    selConcepto.value = ""; // Reiniciar select
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
}

function borrarItem(id) { 
    listaItems = listaItems.filter(i => i.id !== id); 
    renderTabla(); 
}

// Portapapeles Moderno
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
        // Fallback para navegadores antiguos
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

// Lógica de exportación / importación / captura / whatsapp intacta
function exportarPresupuesto() {
    if (!clienteActual || listaItems.length === 0) return alert("No hay datos para exportar.");
    const data = { cliente: clienteActual, items: listaItems, obsG: document.getElementById('obsGenerales').value };
    const base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
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
            
            // Refrescar Select
            selCliente.value = clienteActual.nombre;
            
            document.getElementById('step-cliente').style.display = 'none';
            document.getElementById('step-trabajo').style.display = 'flex';
            renderTabla();
        } catch(err) { alert("Archivo no válido"); }
    };
    reader.readAsText(file); 
    e.target.value = '';
}

async function tomarCaptura() { 
    const zona = document.getElementById('zonaCaptura'); 
    const trash = document.querySelectorAll('.trash-icon'); 
    trash.forEach(b => b.style.display = 'none'); 
    
    // Forzamos temporalmente a que el texto sea blanco para la captura (por si estaba en modo claro)
    zona.style.color = "#ffffff";
    
    const canvas = await html2canvas(zona, { backgroundColor: "#1e1e1e", scale: 2 }); 
    const link = document.createElement('a'); 
    link.download = `Presupuesto_NGC_${clienteActual?.nombre || 'Generico'}.png`; 
    link.href = canvas.toDataURL(); 
    link.click(); 
    
    trash.forEach(b => b.style.display = 'inline-block'); 
    zona.style.color = ""; // Restaurar color
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

// --- GENERADOR DE PDF A4 ---
async function generarPDF() {
    if (!clienteActual || listaItems.length === 0) {
        alert("Agregá un cliente y trabajos para generar el PDF.");
        return;
    }

    // 1. Rellenar datos del cliente
    const nroPresupuesto = `PEM-${Math.floor(Math.random() * 9000) + 1000}`; // Simula un NRO
    document.getElementById('pdf-nro').innerText = nroPresupuesto;
    document.getElementById('pdf-fecha').innerText = clienteActual.fecha;
    document.getElementById('pdf-cliente').innerText = clienteActual.nombre;
    document.getElementById('pdf-direccion').innerText = clienteActual.dir || 'A coordinar';

    // 2. Rellenar la tabla de ítems y calcular totales
    const tbody = document.getElementById('pdf-tbody');
    tbody.innerHTML = '';
    
    let subtotalPuro = 0;
    let totalDescuentos = 0;
    let notasAcumuladas = '';

    listaItems.forEach((i, index) => {
        // Creamos un pseudo-código usando las iniciales del concepto (Ej: 01-02)
        const codigoItem = `0${index + 1}-0${Math.floor(Math.random() * 5) + 1}`; 
        
        const valorUnitarioOriginal = i.unitario;
        const subtotalFilaPuro = valorUnitarioOriginal * i.qty;
        const subtotalFilaConDesc = i.total;
        const descuentoFila = subtotalFilaPuro - subtotalFilaConDesc;

        subtotalPuro += subtotalFilaPuro;
        totalDescuentos += descuentoFila;

        // Fila
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${codigoItem}</td>
            <td>${i.concepto}</td>
            <td>${i.qty}</td>
            <td>$ ${valorUnitarioOriginal.toLocaleString('es-AR')}</td>
            <td>$ ${subtotalFilaPuro.toLocaleString('es-AR')}</td>
        `;
        tbody.appendChild(tr);

        // Notas (si tiene)
        if(i.obs) {
            notasAcumuladas += `<b>${codigoItem}</b> ${i.obs.replace(/\n/g, ' ')}\n`;
        }
    });

    const og = document.getElementById('obsGenerales').value;
    if(og) notasAcumuladas += `\n<b>Gral:</b> ${og}`;

    // 3. Rellenar totales
    const totalFinal = subtotalPuro - totalDescuentos;
    document.getElementById('pdf-subtotal').innerText = `$ ${subtotalPuro.toLocaleString('es-AR')}`;
    document.getElementById('pdf-descuentos').innerText = `-$ ${totalDescuentos.toLocaleString('es-AR')}`;
    document.getElementById('pdf-total').innerText = `$ ${totalFinal.toLocaleString('es-AR')}`;
    document.getElementById('pdf-notas').innerHTML = notasAcumuladas ? notasAcumuladas.replace(/\n/g, '<br>') : 'Sin notas aclaratorias.';

    // 4. Configurar y disparar html2pdf
    const element = document.getElementById('plantilla-pdf');
    element.style.display = 'block'; // Mostramos temporalmente el div

    const opt = {
        margin:       0, // El padding ya está manejado en el CSS (.pdf-container)
        filename:     `${clienteActual.nombre.replace(/ /g, '_')}_Villaser_${nroPresupuesto}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    animarBoton('btnGenerarPDF'); // Da feedback visual de "LISTO"
    
    // Generamos y volvemos a ocultar el div
    try {
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("Error al generar PDF: ", error);
        alert("Hubo un error al generar el PDF.");
    } finally {
        element.style.display = 'none';
    }
}

