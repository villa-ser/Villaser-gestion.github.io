const SHEET_ID = '1tZbCYSBxx3suGLKmE_bXi_hEm0iH0yqQedqR7kdShEU';
const URL_PRECIOS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Hoja1`; 
const URL_CLIENTES = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Clientes`;

let dbPrecios=[], dbClientes=[], clienteActual=null, listaItems=[], notasOriginales="";

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
    } catch (e) { 
        document.getElementById('loading').innerText = "⚠️ Error de conexión"; 
    }
}

function step(id, val) { 
    const el = document.getElementById(id); 
    el.value = Math.max(0, parseInt(el.value || 0) + val); 
}

function poblarClientes() { 
    const list = document.getElementById('list-cliente'); 
    list.innerHTML = ''; 
    dbClientes.forEach(c => { 
        let div = document.createElement('div'); 
        div.innerText = c.nombre; 
        div.onclick = function() {
            selectOption('display-cliente', 'selCliente', c.nombre);
            actualizarCamposCliente();
        };
        list.appendChild(div); 
    }); 
}

function poblarTemas() { 
    const list = document.getElementById('list-tema'); 
    list.innerHTML = ''; 
    [...new Set(dbPrecios.map(i => i.tema))].sort().forEach(t => { 
        let div = document.createElement('div'); 
        div.innerText = t; 
        div.onclick = function() {
            selectOption('display-tema', 'selTema', t);
            cambioTema();
        };
        list.appendChild(div); 
    }); 
}

function cambioTema() { 
    const t = document.getElementById('selTema').value; 
    const listC = document.getElementById('list-concepto'); 
    const displayC = document.getElementById('display-concepto');

    listC.innerHTML = ''; 
    document.getElementById('selConcepto').value = '';
    displayC.innerText = '-- TRABAJO --';

    if(t) {
        displayC.classList.remove('disabled-select');
        dbPrecios.filter(i => i.tema === t).forEach(i => { 
            let div = document.createElement('div'); 
            div.innerText = i.concepto; 
            div.onclick = function() {
                selectOption('display-concepto', 'selConcepto', i.concepto);
                cargarDetallePrecios();
            };
            listC.appendChild(div); 
        }); 
    } else {
        displayC.classList.add('disabled-select');
    }
}

function toggleDropdown(listId, displayId) {
    const list = document.getElementById(listId);
    const display = document.getElementById(displayId);
    if (display.classList.contains('disabled-select')) return;
    
    const isShowing = list.classList.contains('show');
    closeAllDropdowns();

    if (!isShowing) {
        list.classList.add('show');
        display.classList.add('select-arrow-active');
    }
}

function selectOption(displayId, inputId, value) {
    document.getElementById(displayId).innerText = value;
    document.getElementById(inputId).value = value;
    closeAllDropdowns();
}

function closeAllDropdowns() {
    const lists = document.getElementsByClassName('select-items');
    const displays = document.getElementsByClassName('select-selected');
    for (let i = 0; i < lists.length; i++) lists[i].classList.remove('show');
    for (let i = 0; i < displays.length; i++) displays[i].classList.remove('select-arrow-active');
}

document.addEventListener("click", function(event) {
    if (!event.target.matches('.select-selected')) { closeAllDropdowns(); }
});

function actualizarCamposCliente() { 
    const c = dbClientes.find(i => i.nombre === document.getElementById('selCliente').value); 
    document.getElementById('cliInfo').value = c ? `Tel: ${c.tel}\nDir: ${c.dir}` : ''; 
}

function cargarClienteALista() { 
    const c = dbClientes.find(i => i.nombre === document.getElementById('selCliente').value); 
    if(!c) return alert("Seleccione un cliente"); 
    clienteActual = {...c, fecha: new Date().toLocaleDateString('es-AR')}; 
    document.getElementById('step-cliente').style.display = 'none';
    document.getElementById('step-trabajo').style.display = 'flex';
    renderTabla(); 
}

function copiarTitulo() {
    if(!clienteActual) return;
    const primerNombre = clienteActual.nombre.split(' ')[0];
    const hoy = new Date();
    const f = hoy.getDate().toString().padStart(2,'0')+'-'+(hoy.getMonth()+1).toString().padStart(2,'0')+'-'+hoy.getFullYear();
    const texto = `${primerNombre}_Villaser_Presupuesto_${f}`;
    
    const textArea = document.createElement("textarea");
    textArea.value = texto;
    textArea.style.position = "fixed"; textArea.style.left = "-99999px"; textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try { document.execCommand('copy'); animarBoton('btnCopyTitle'); } catch (err) {}
    document.body.removeChild(textArea);
}

function cargarDetallePrecios() { 
    const item = dbPrecios.find(i => i.tema === document.getElementById('selTema').value && i.concepto === document.getElementById('selConcepto').value); 
    if(item) { 
        document.getElementById('unitarioLabel').innerText = `Unitario: $ ${item.precio.toLocaleString('es-AR')}`; 
        const f = document.getElementById('obsManual'); 
        f.value = item.notas; 
        notasOriginales = item.notas; 
        f.readOnly = true; 
    } 
}

function habilitarEdicionObs() { const f = document.getElementById('obsManual'); f.readOnly = false; f.focus(); }
function volverNotasOriginales() { const f = document.getElementById('obsManual'); f.value = notasOriginales; f.readOnly = true; }
function borrarTodasNotas() { document.getElementById('obsManual').value = ""; }

function agregarTrabajo() {
    const item = dbPrecios.find(i => i.tema === document.getElementById('selTema').value && i.concepto === document.getElementById('selConcepto').value);
    if(!item) return;
    const qty = parseInt(document.getElementById('cantidad').value) || 1, 
          desc = parseInt(document.getElementById('porcentajeDesc').value) || 0, 
          final = (item.precio * qty) * (1 - desc / 100);
          
    listaItems.push({ id: Date.now(), concepto: item.concepto, obs: document.getElementById('obsManual').value, qty, total: final, unitario: item.precio, desc });
    
    renderTabla(); 
    document.getElementById('obsManual').value = ""; 
    document.getElementById('cantidad').value = 1; 
    animarBoton('btnAddItem');
}

function renderTabla() {
    const tbody = document.getElementById('cuerpoTabla'); 
    tbody.innerHTML = ''; 
    let total = 0;
    
    if(clienteActual) { 
        const r = tbody.insertRow(); 
        r.innerHTML = `<td colspan="4" style="color:var(--ngc-primary); font-size:0.8rem; padding-bottom:15px;"><b>CLIENTE:</b> ${clienteActual.nombre}<br><b>FECHA:</b> ${clienteActual.fecha} | <b>TEL:</b> ${clienteActual.tel}</td>`; 
    }
    
    listaItems.forEach(i => { 
        total += i.total; 
        const r = tbody.insertRow(); 
        r.innerHTML = `<td><b>${i.concepto}</b><span class="item-info-line" style="display:block; font-size:0.75rem; color:rgba(255,255,255,0.6);">Unit: $${i.unitario.toLocaleString('es-AR')}${i.desc > 0 ? ' <span class="discount-badge">Desc. ' + i.desc + '%</span>' : ''}</span>${i.obs ? '<small style="display:block; opacity:0.7; white-space: pre-wrap;">'+i.obs+'</small>' : ''}</td><td align="center">x${i.qty}</td><td align="right" style="color:var(--ngc-primary); font-weight:bold;">${i.total.toLocaleString('es-AR')}</td><td align="right"><button class="trash-icon" onclick="borrarItem(${i.id})">✕</button></td>`; 
    });
    
    const og = document.getElementById('obsGenerales').value; 
    if(og) { 
        const r = tbody.insertRow(); 
        r.innerHTML = `<td colspan="4" style="font-size:0.85rem; color:rgba(255,255,255,0.5); padding-top:15px; font-style:italic;">Nota: ${og}</td>`; 
    }
    
    document.getElementById('totalDisplay').innerText = `TOTAL: $ ${total.toLocaleString('es-AR')}`;
}

function borrarItem(id) { 
    listaItems = listaItems.filter(i => i.id !== id); 
    renderTabla(); 
}

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
            
            document.getElementById('selCliente').value = clienteActual.nombre;
            document.getElementById('display-cliente').innerText = clienteActual.nombre;
            
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
    
    const canvas = await html2canvas(zona, { backgroundColor: "#333333", scale: 2 }); 
    const link = document.createElement('a'); 
    link.download = `Presupuesto_NGC_${clienteActual?.nombre}.png`; 
    link.href = canvas.toDataURL(); 
    link.click(); 
    
    trash.forEach(b => b.style.display = 'inline-block'); 
}

function enviarWhatsApp() { 
    if(!clienteActual) return; 
    let m = `*VILLASER - PRESUPUESTO*\nCliente: ${clienteActual.nombre}\n`; 
    listaItems.forEach(i => { m += `• ${i.concepto} (x${i.qty}) -> *$${i.total.toLocaleString('es-AR')}*\n`; }); 
    m += `\n*TOTAL: ${document.getElementById('totalDisplay').innerText.split(': ')[1]}*`; 
    window.open(`https://wa.me/549${clienteActual.tel.replace(/\D/g, '')}?text=${encodeURIComponent(m)}`, '_blank'); 
}

function animarBoton(id) { 
    const b = document.getElementById(id); 
    b.classList.add('active-success'); 
    setTimeout(() => b.classList.remove('active-success'), 800); 
                       }
          
