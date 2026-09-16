const SHEET_ID = '1tZbCYSBxx3suGLKmE_bXi_hEm0iH0yqQedqR7kdShEU';
const URL_CLIENTES = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Clientes`;

let dbClientes = [];
let clienteActual = null;
let fotosArray = []; 

const selCliente = document.getElementById('selCliente');

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
    
    // Iniciar carga de clientes
    fetchData();
});

// --- CARGA DE BASE DE DATOS (CLIENTES) ---
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
        document.getElementById('loading').innerHTML = `⚠️ Error de conexión a la base de datos.<br><br><button class="btn-ngc" onclick="location.reload()">Reintentar</button>`;
        console.error(e);
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
    if(!c) {
        alert("Por favor, seleccione un cliente de la lista.");
        selCliente.focus();
        return; 
    }
    
    clienteActual = {
        ...c,
        fecha: new Date().toLocaleDateString('es-AR')
    }; 

    document.getElementById('clienteLabel').innerText = clienteActual.nombre;
    document.getElementById('step-cliente').style.display = 'none';
    document.getElementById('step-fotos').style.display = 'flex';
}


// --- PROCESAMIENTO DE FOTOS Y CANVAS (OPTIMIZADO PARA MEMORIA) ---
async function procesarNuevasFotos(event) {
    const files = event.target.files;
    if(!files || files.length === 0) return;
    
    if(files.length > 3) {
        alert("Para evitar sobrecarga de memoria, se procesarán solo las primeras 3 fotos.");
    }

    const maxFiles = Math.min(files.length, 3);
    const hab = document.getElementById('selHabitacion').value || 'Sin especificar';
    const boca = document.getElementById('selBoca').value || 'General';
    const obs = document.getElementById('obsFoto').value.trim();

    document.getElementById('loadingOverlay').style.display = 'flex';

    // Procesamos de a una para no estallar la RAM del celular
    for(let i=0; i<maxFiles; i++) {
        const file = files[i];
        try {
            const stampedBase64 = await estamparDatosEnImagen(file, hab, boca, obs);
            fotosArray.push({
                id: Date.now() + i,
                src: stampedBase64,
                hab, boca, obs
            });
        } catch(err) {
            console.error("Error al procesar foto:", err);
            alert("Error al procesar una imagen. Puede ser demasiado pesada.");
        }
    }

    // Resetear campos para la siguiente toma
    document.getElementById('selHabitacion').value = '';
    document.getElementById('selBoca').value = '';
    document.getElementById('obsFoto').value = '';
    document.getElementById('cameraInput').value = ''; 

    actualizarGaleria();
    document.getElementById('loadingOverlay').style.display = 'none';
}

function estamparDatosEnImagen(file, habitacion, boca, observaciones) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // createObjectURL es vital: carga la imagen directo al buffer del navegador sin base64 pesado
        const objectUrl = URL.createObjectURL(file); 
        
        img.onload = () => {
            // Liberar memoria RAM instantáneamente
            URL.revokeObjectURL(objectUrl); 
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // REDUCCIÓN AGRESIVA PERO NÍTIDA (Max 800px previene el Error de Memoria)
            let width = img.width;
            let height = img.height;
            const MAX_SIZE = 800; 
            
            if (width > height && width > MAX_SIZE) {
                height *= MAX_SIZE / width; width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
                width *= MAX_SIZE / height; height = MAX_SIZE;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);

            // Textos
            const fontSize = Math.max(14, Math.floor(width * 0.035));
            ctx.font = `${fontSize}px sans-serif`;
            const padding = fontSize;
            
            const lineas = [
                `Ubicación: ${habitacion}`,
                `Elemento: ${boca}`
            ];
            if(observaciones) lineas.push(`Notas: ${observaciones}`);
            lineas.push(`Fecha: ${clienteActual.fecha} - Villaser`);

            const lineHeight = fontSize * 1.4;
            const boxHeight = (lineas.length * lineHeight) + padding;
            
            let maxLineWidth = 0;
            lineas.forEach(l => {
                const metrics = ctx.measureText(l);
                if(metrics.width > maxLineWidth) maxLineWidth = metrics.width;
            });
            const boxWidth = maxLineWidth + (padding * 2);

            // Caja oscura abajo a la izquierda
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            const startY = height - boxHeight;
            ctx.fillRect(0, startY, boxWidth, boxHeight);

            // Escribir Textos
            ctx.fillStyle = '#00d4ff'; // Cyan NGC
            ctx.fillText(lineas[0], padding, startY + padding + (fontSize * 0.8)); 
            ctx.fillStyle = '#ffffff'; 
            for(let i=1; i<lineas.length; i++) {
                 ctx.fillText(lineas[i], padding, startY + padding + (fontSize * 0.8) + (i * lineHeight));
            }

            // Exportamos comprimido en calidad 0.65 para alivianar el jsPDF
            const finalBase64 = canvas.toDataURL('image/jpeg', 0.65);
            
            // Destruir Canvas para limpiar RAM
            canvas.width = 0;
            canvas.height = 0;
            
            resolve(finalBase64);
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject("Error cargando la imagen");
        };
        
        img.src = objectUrl;
    });
}

function actualizarGaleria() {
    const gal = document.getElementById('galeriaFotos');
    gal.innerHTML = '';
    
    fotosArray.forEach(foto => {
        const div = document.createElement('div');
        div.className = 'foto-item';
        div.innerHTML = `
            <img src="${foto.src}" alt="Foto ${foto.hab}">
            <button class="btn-delete-foto" onclick="borrarFoto(${foto.id})">✕</button>
        `;
        gal.appendChild(div);
    });
    
    document.getElementById('contadorFotos').innerText = `${fotosArray.length} foto${fotosArray.length !== 1 ? 's' : ''}`;
}

function borrarFoto(id) {
    fotosArray = fotosArray.filter(f => f.id !== id);
    actualizarGaleria();
}

// --- GENERACIÓN DE PDF ---
function generarPDFReporte() {
    if(fotosArray.length === 0) {
        alert("Agregue al menos 1 fotografía para generar el reporte.");
        return;
    }

    // Poner el botón en estado de carga (el PDF con varias fotos demora un par de segundos)
    const btnPdf = document.getElementById('btnGenerarPDF');
    const originalText = btnPdf.innerText;
    btnPdf.innerText = "⏳ Generando documento...";
    btnPdf.style.pointerEvents = "none";

    // Un pequeño timeout permite que la UI cambie el texto del botón antes de congelarse procesando el PDF
    setTimeout(() => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth(); 
            const pageHeight = doc.internal.pageSize.getHeight(); 
            
            const margin = 15;
            let currentY = margin;

            function addHeader() {
                doc.setFillColor(0, 136, 170);
                doc.rect(0, 0, pageWidth, 25, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("REPORTE FOTOGRÁFICO DE INSTALACIÓN", margin, 16);
                
                doc.setTextColor(50, 50, 50);
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                currentY = 32;
                doc.text(`Cliente / Obra: ${clienteActual.nombre}`, margin, currentY);
                doc.text(`Dirección: ${clienteActual.dir}`, margin, currentY + 5);
                doc.text(`Teléfono: ${clienteActual.tel}  |  Fecha: ${clienteActual.fecha}`, margin, currentY + 10);
                
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, currentY + 14, pageWidth - margin, currentY + 14);
                currentY += 20;
            }

            function addFooter() {
                const footY = pageHeight - 15;
                doc.setDrawColor(0, 136, 170);
                doc.line(margin, footY - 5, pageWidth - margin, footY - 5);
                
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text("Sergio Adrian Villagra - Electricista Habilitado Cat III", margin, footY);
                doc.text("ERSeP Registro Nro 29029389 - 14027", margin, footY + 4);
                
                doc.text("villaser.com.ar", pageWidth - margin, footY, { align: "right" });
            }

            addHeader();
            addFooter();

            const colWidth = (pageWidth - (margin * 2) - 10) / 2; 
            const rowHeight = 75; 
            
            fotosArray.forEach((foto, i) => {
                const indexOnPage = i % 6; 
                
                if (i > 0 && indexOnPage === 0) {
                    doc.addPage();
                    addHeader();
                    addFooter();
                }

                const col = indexOnPage % 2; 
                const row = Math.floor(indexOnPage / 2); 

                const xPos = margin + (col * (colWidth + 10));
                const yPos = currentY + (row * (rowHeight + 5));

                doc.addImage(foto.src, 'JPEG', xPos, yPos, colWidth, rowHeight);
                
                doc.setDrawColor(150, 150, 150);
                doc.setLineWidth(0.3);
                doc.rect(xPos, yPos, colWidth, rowHeight);
            });

            const fileName = `Reporte_${clienteActual.nombre.split(' ')[0]}_${clienteActual.fecha.replace(/\//g, '-')}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error(error);
            alert("Ocurrió un error generando el PDF.");
        } finally {
            // Restaurar botón
            btnPdf.innerText = originalText;
            btnPdf.style.pointerEvents = "auto";
        }
    }, 100);
                }
                    
