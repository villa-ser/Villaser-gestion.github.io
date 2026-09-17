const SHEET_ID = '1tZbCYSBxx3suGLKmE_bXi_hEm0iH0yqQedqR7kdShEU';
const URL_CLIENTES = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Clientes`;

let dbClientes = [];
let clienteActual = null;
let fotosArray = []; 
let fotosLoteActual = 0; 
let streamCamara = null; 

const selCliente = document.getElementById('selCliente');

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
    fetchData();
});

// --- CARGA DE BD ---
async function fetchData() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const resCli = await fetch(URL_CLIENTES, { signal: controller.signal });
        clearTimeout(timeoutId); 
        
        const txtCli = await resCli.text();
        const jCli = JSON.parse(txtCli.substring(txtCli.indexOf("{"), txtCli.lastIndexOf("}") + 1));
        
        dbClientes = jCli.table.rows.map(r => ({ 
            nombre: r.c[0]?.v || '', 
            tel: String(r.c[1]?.v || ''), 
            dir: r.c[2]?.v || '' 
        })).filter(c => c.nombre && c.nombre !== "Nombre");
        
        document.getElementById('loading').style.display = 'none'; 
        document.getElementById('app').style.display = 'block';
        
        poblarClientes(); 
        selCliente.addEventListener('change', actualizarCamposCliente);
        
    } catch (e) { 
        clearTimeout(timeoutId);
        document.getElementById('loading').innerHTML = `⚠️ Error de conexión a la BD.<br><button class="btn-ngc" onclick="location.reload()">Reintentar</button>`;
    }
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

function actualizarCamposCliente() { 
    const c = dbClientes.find(i => i.nombre === selCliente.value); 
    document.getElementById('cliInfo').value = c ? `Tel: ${c.tel}\nDir: ${c.dir}` : ''; 
}

function iniciarReporte() {
    const c = dbClientes.find(i => i.nombre === selCliente.value); 
    if(!c) return alert("Por favor, seleccione un cliente.");
    
    clienteActual = { ...c, fecha: new Date().toLocaleDateString('es-AR') }; 
    document.getElementById('clienteLabel').innerText = clienteActual.nombre;
    document.getElementById('step-cliente').style.display = 'none';
    document.getElementById('step-fotos').style.display = 'flex';
}

// --- LOGICA DEL VISOR DE CAMARA Y RECORTE CUADRADO ---

async function iniciarCamaraVisor() {
    if (fotosLoteActual >= 3) {
        alert("Ya tomaste 3 fotos con estos datos. Presioná 'NUEVA CARGA'.");
        return;
    }
    
    const videoObj = document.getElementById('videoElement');
    const modal = document.getElementById('cameraModal');
    
    try {
        streamCamara = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1080 } }
        });
        videoObj.srcObject = streamCamara;
        document.getElementById('camaraContador').innerText = `Foto ${fotosLoteActual + 1} de 3 (de este lote)`;
        modal.style.display = 'flex';
    } catch (err) {
        console.error(err);
        alert("Error al abrir cámara. Verifique los permisos del navegador o use la opción Galería.");
    }
}

function cerrarVisor() {
    if (streamCamara) streamCamara.getTracks().forEach(track => track.stop());
    document.getElementById('cameraModal').style.display = 'none';
}

function tomarCapturaVisor() {
    const video = document.getElementById('videoElement');
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    
    let size = Math.min(video.videoWidth, video.videoHeight);
    let sx = (video.videoWidth - size) / 2;
    let sy = (video.videoHeight - size) / 2;

    let finalSize = Math.min(size, 800); 
    canvas.width = finalSize;
    canvas.height = finalSize;
    
    ctx.drawImage(video, sx, sy, size, size, 0, 0, finalSize, finalSize);
    
    const hab = document.getElementById('selHabitacion').value || 'S/E';
    const boca = document.getElementById('selBoca').value || 'General';
    const pared = document.getElementById('selPared').value || '';
    const altura = document.getElementById('inpAltura').value || '';
    const distancia = document.getElementById('inpDistancia').value || '';
    const obs = document.getElementById('obsFoto').value.trim();

    aplicarEstampaAlCanvas(canvas, ctx, finalSize, finalSize, hab, boca, pared, altura, distancia, obs);
    
    const finalBase64 = canvas.toDataURL('image/jpeg', 0.65);
    
    fotosArray.push({
        id: Date.now() + Math.random(),
        src: finalBase64,
        hab, boca, pared, altura, distancia, obs
    });
    
    fotosLoteActual++;
    
    ctx.clearRect(0, 0, finalSize, finalSize);
    canvas.width = 0; canvas.height = 0; canvas = null; ctx = null;

    actualizarContadorLote();
    actualizarGaleria();

    if (fotosLoteActual >= 3) {
        cerrarVisor();
        alert("Lote completado (3/3). Si desea cargar más fotos de otros lugares, presione 'NUEVA CARGA'.");
    } else {
        document.getElementById('camaraContador').innerText = `Foto ${fotosLoteActual + 1} de 3 (de este lote)`;
    }
}


// --- GALERÍA (También recorta a cuadrado automáticamente) ---
function abrirGaleria() {
    if (fotosLoteActual >= 3) {
        alert("Ya subiste 3 fotos para esta configuración. Presioná 'NUEVA CARGA'.");
        return;
    }
    document.getElementById('galleryInput').click();
}

async function procesarGaleria(event) {
    const files = Array.from(event.target.files);
    if(files.length === 0) return;
    
    const espacioDisponible = 3 - fotosLoteActual;
    let fotosAProcesar = files.slice(0, espacioDisponible);

    if(files.length > espacioDisponible) {
        alert(`Para estos datos solo quedan ${espacioDisponible} espacios. Se procesarán solo esas.`);
    }

    const hab = document.getElementById('selHabitacion').value || 'S/E';
    const boca = document.getElementById('selBoca').value || 'General';
    const pared = document.getElementById('selPared').value || '';
    const altura = document.getElementById('inpAltura').value || '';
    const distancia = document.getElementById('inpDistancia').value || '';
    const obs = document.getElementById('obsFoto').value.trim();

    document.getElementById('loadingOverlay').style.display = 'flex';

    for(let file of fotosAProcesar) {
        try {
            const stampedBase64 = await procesarArchivoGaleria(file, hab, boca, pared, altura, distancia, obs);
            fotosArray.push({
                id: Date.now() + Math.random(),
                src: stampedBase64,
                hab, boca, pared, altura, distancia, obs
            });
            fotosLoteActual++;
        } catch(err) {
            console.error(err);
        }
    }

    document.getElementById('galleryInput').value = ''; 
    actualizarContadorLote();
    actualizarGaleria();
    document.getElementById('loadingOverlay').style.display = 'none';
}

function procesarArchivoGaleria(file, hab, boca, pared, altura, distancia, obs) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        const objectUrl = URL.createObjectURL(file); 
        
        img.onload = () => {
            URL.revokeObjectURL(objectUrl); 
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            
            let size = Math.min(img.width, img.height);
            let sx = (img.width - size) / 2;
            let sy = (img.height - size) / 2;
            let finalSize = Math.min(size, 800); 
            
            canvas.width = finalSize; canvas.height = finalSize;
            ctx.drawImage(img, sx, sy, size, size, 0, 0, finalSize, finalSize);

            aplicarEstampaAlCanvas(canvas, ctx, finalSize, finalSize, hab, boca, pared, altura, distancia, obs);
            const finalBase64 = canvas.toDataURL('image/jpeg', 0.65);
            
            ctx.clearRect(0, 0, finalSize, finalSize);
            canvas.width = 0; canvas.height = 0;
            canvas = null; ctx = null; img.onload = null; img.src = ''; img = null;
            
            resolve(finalBase64);
        };
        img.onerror = reject;
        img.src = objectUrl;
    });
}

// --- FUNCIÓN CENTRAL DE ESTAMPADO ---
function aplicarEstampaAlCanvas(canvas, ctx, width, height, hab, boca, pared, altura, distancia, obs) {
    const fontSize = Math.max(14, Math.floor(width * 0.035));
    ctx.font = `${fontSize}px sans-serif`;
    const padding = fontSize;
    
    let txtHabitacion = hab;
    if (pared !== "") txtHabitacion += ` (${pared})`;

    const lineas = [
        `Ubic.: ${txtHabitacion}`,
        `Boca: ${boca}`
    ];
    
    let medidas = [];
    if(altura) medidas.push(`Alt: ${altura}m`);
    if(distancia) medidas.push(`Dist: ${distancia}m`);
    if(medidas.length > 0) lineas.push(medidas.join(' | '));

    if(obs) lineas.push(`Notas: ${obs}`);
    lineas.push(`Fecha: ${clienteActual.fecha} - Villaser`);

    const lineHeight = fontSize * 1.4;
    const boxHeight = (lineas.length * lineHeight) + padding;
    
    let maxLineWidth = 0;
    lineas.forEach(l => {
        const metrics = ctx.measureText(l);
        if(metrics.width > maxLineWidth) maxLineWidth = metrics.width;
    });
    const boxWidth = maxLineWidth + (padding * 2);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    const startY = height - boxHeight;
    ctx.fillRect(0, startY, boxWidth, boxHeight);

    ctx.fillStyle = '#00d4ff'; 
    ctx.fillText(lineas[0], padding, startY + padding + (fontSize * 0.8)); 
    ctx.fillStyle = '#ffffff'; 
    for(let i=1; i<lineas.length; i++) {
         ctx.fillText(lineas[i], padding, startY + padding + (fontSize * 0.8) + (i * lineHeight));
    }
}

// --- MANEJO DE INTERFAZ Y LOTES ---

function prepararNuevaCarga() {
    document.getElementById('selHabitacion').value = '';
    document.getElementById('selBoca').value = '';
    document.getElementById('selPared').value = '';
    document.getElementById('inpAltura').value = '';
    document.getElementById('inpDistancia').value = '';
    document.getElementById('obsFoto').value = '';
    fotosLoteActual = 0;
    actualizarContadorLote();
    alert("Selectores limpiados. Listo para cargar otra habitación/boca para este mismo cliente.");
}

function actualizarContadorLote() {
    document.getElementById('contadorLote').innerText = `${fotosLoteActual}/3 de este lote`;
}

function actualizarGaleria() {
    const gal = document.getElementById('galeriaFotos');
    gal.innerHTML = '';
    
    fotosArray.forEach(foto => {
        const txtPared = foto.pared ? ` (${foto.pared})` : '';
        const div = document.createElement('div');
        div.className = 'foto-item-list';
        div.innerHTML = `
            <img src="${foto.src}" class="foto-thumb" alt="Miniatura">
            <div class="foto-info">
                <strong style="color: white;">${foto.hab}${txtPared}</strong><br>
                <span style="color: var(--ngc-primary);">${foto.boca}</span>
            </div>
            <div class="foto-actions">
                <button class="btn-action-icon btn-edit" onclick="editarFoto(${foto.id})" title="Editar Datos">✏️</button>
                <button class="btn-action-icon btn-delete" onclick="borrarFoto(${foto.id})" title="Eliminar Foto">🗑️</button>
            </div>
        `;
        gal.appendChild(div);
    });
    
    document.getElementById('contadorFotosTotal').innerText = `${fotosArray.length} fotos`;
}

function editarFoto(id) {
    const foto = fotosArray.find(f => f.id === id);
    if(!foto) return;

    document.getElementById('selHabitacion').value = foto.hab || '';
    document.getElementById('selBoca').value = foto.boca || '';
    document.getElementById('selPared').value = foto.pared || ''; 
    document.getElementById('inpAltura').value = foto.altura || '';
    document.getElementById('inpDistancia').value = foto.distancia || '';
    document.getElementById('obsFoto').value = foto.obs || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    alert("📝 DATOS CARGADOS.\n\nPara editar la foto, tómala nuevamente con la cámara y luego elimina la vieja de la lista.");
}

function borrarFoto(id) {
    if(confirm("¿Seguro que deseas eliminar esta entrada?")) {
        fotosArray = fotosArray.filter(f => f.id !== id);
        actualizarGaleria();
    }
}

// --- EXPORTAR E IMPORTAR AVANCE ---
function exportarAvance() {
    if (!clienteActual && fotosArray.length === 0) return alert("No hay datos para guardar.");

    const jsonString = JSON.stringify({ cliente: clienteActual, fotos: fotosArray, loteActual: fotosLoteActual });
    const blob = new Blob([jsonString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    const nombre = clienteActual ? clienteActual.nombre.split(' ')[0] : 'Borrador';
    
    a.href = url; a.download = `Avance_Reporte_${nombre}_${fecha}.txt`;
    
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function importarAvance(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.cliente) {
                clienteActual = data.cliente; fotosArray = data.fotos || []; fotosLoteActual = data.loteActual || 0;
                
                document.getElementById('clienteLabel').innerText = clienteActual.nombre;
                document.getElementById('step-cliente').style.display = 'none';
                document.getElementById('step-fotos').style.display = 'flex';
                
                actualizarContadorLote(); actualizarGaleria();
                alert("✅ Avance cargado exitosamente.");
            } else { alert("El archivo no es válido."); }
        } catch (err) { alert("Error al leer el archivo."); }
    };
    reader.readAsText(file); event.target.value = ''; 
}

// --- OBTENER LOGO (MEMBRETE) ---
function getMembreteData() {
    const img = document.getElementById('imgMembrete');
    if (!img || !img.complete || img.naturalWidth === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png'); // Lo convertimos a formato seguro
}

// --- GENERACIÓN DE PDF MEJORADO ---
function generarPDFReporte() {
    if(fotosArray.length === 0) return alert("Agregue al menos 1 fotografía.");

    const btnPdf = document.getElementById('btnGenerarPDF');
    const originalText = btnPdf.innerText;
    btnPdf.innerText = "⏳ Generando documento...";
    btnPdf.style.pointerEvents = "none";

    setTimeout(() => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth(); const pageHeight = doc.internal.pageSize.getHeight(); 
            const margin = 15; let currentY = margin;

            function addHeader() {
                // Título sobrio e informe (Sin franja azul)
                doc.setTextColor(0, 136, 170); // Azul técnico
                doc.setFontSize(14); // Más chico
                doc.setFont("helvetica", "bold");
                doc.text("INFORME FOTOGRÁFICO DE INSTALACIÓN", margin, 20);
                
                // Agregar el membrete a la derecha
                const logoB64 = getMembreteData();
                if (logoB64) {
                    // Posición X: Margen derecho, Posición Y: 10, Ancho: 45, Alto: 15
                    doc.addImage(logoB64, 'PNG', pageWidth - margin - 45, 10, 45, 15);
                }
                
                // Textos del cliente
                doc.setTextColor(50, 50, 50); doc.setFontSize(10); doc.setFont("helvetica", "normal");
                currentY = 32;
                doc.text(`Cliente / Obra: ${clienteActual.nombre}`, margin, currentY);
                doc.text(`Dirección: ${clienteActual.dir}`, margin, currentY + 5);
                doc.text(`Teléfono: ${clienteActual.tel}  |  Fecha: ${clienteActual.fecha}`, margin, currentY + 10);
                
                doc.setDrawColor(200, 200, 200); doc.line(margin, currentY + 14, pageWidth - margin, currentY + 14);
                currentY += 20; // 52 mm es donde arrancan las fotos
            }

            function addFooter() {
                const footY = pageHeight - 20;
                doc.setDrawColor(0, 136, 170); doc.line(margin, footY - 4, pageWidth - margin, footY - 4);
                
                doc.setFontSize(7); doc.setTextColor(150, 150, 150);
                doc.text("* Alturas corresponden a la arista inferior del elemento. Distancias tomadas a la pared perpendicular más cercana.", margin, footY);
                
                doc.setFontSize(8); doc.setTextColor(100, 100, 100);
                doc.text("Sergio Adrian Villagra - Electricista Habilitado Cat III (ERSeP 29029389 - 14027)", margin, footY + 5);
                doc.text("villaser.com.ar", pageWidth - margin, footY + 5, { align: "right" });
            }

            addHeader(); addFooter();
            
            // Grilla perfectamente cuadrada y MÁS CHICA (65mm) para no pisar el Footer
            const squareSize = 65; 
            const gap = 10;
            const xOffset = (pageWidth - (squareSize * 2 + gap)) / 2; // Centra las dos columnas
            
            fotosArray.forEach((foto, i) => {
                const indexOnPage = i % 6; 
                if (i > 0 && indexOnPage === 0) { doc.addPage(); currentY = 32; addHeader(); addFooter(); }
                const col = indexOnPage % 2; const row = Math.floor(indexOnPage / 2); 
                
                const xPos = xOffset + (col * (squareSize + gap)); 
                const yPos = currentY + (row * (squareSize + gap));

                doc.addImage(foto.src, 'JPEG', xPos, yPos, squareSize, squareSize);
                doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.3); doc.rect(xPos, yPos, squareSize, squareSize);
            });

            const fileName = `Informe_${clienteActual.nombre.split(' ')[0]}_${clienteActual.fecha.replace(/\//g, '-')}.pdf`;
            doc.save(fileName);
        } catch (error) { alert("Error generando el PDF."); console.error(error); } 
        finally { btnPdf.innerText = originalText; btnPdf.style.pointerEvents = "auto"; }
    }, 100);
    }
            
