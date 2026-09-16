let clienteActual = {};
let fotosCapturadas = [];

function iniciarRelevamiento() {
    const nombre = document.getElementById('cliNombre').value.trim();
    const direccion = document.getElementById('cliDireccion').value.trim();
    
    if (!nombre) {
        alert("Por favor, ingresá al menos el nombre del cliente.");
        document.getElementById('cliNombre').focus();
        return;
    }
    
    clienteActual = {
        nombre: nombre,
        direccion: direccion || 'Sin especificar',
        fecha: new Date().toLocaleDateString('es-AR')
    };

    document.getElementById('step-cliente').style.display = 'none';
    document.getElementById('step-fotos').style.display = 'flex';
}

function abrirCamara() {
    const hab = document.getElementById('selHabitacion').value;
    const boca = document.getElementById('selBoca').value;
    
    if (!hab || !boca) {
        alert("Por favor, seleccioná la ubicación y el tipo de elemento antes de tomar la foto.");
        return;
    }
    
    document.getElementById('cameraInput').click();
}

function procesarFotografia(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Mostrar estado de carga
    document.getElementById('loading').style.display = 'block';
    
    const hab = document.getElementById('selHabitacion').value;
    const boca = document.getElementById('selBoca').value;
    const obs = document.getElementById('obsFoto').value.trim();
    
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Redimensionar la imagen para que el PDF no sea excesivamente pesado
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar la imagen original
        ctx.drawImage(img, 0, 0, width, height);
        
        // --- CREAR MARCA DE AGUA INFERIOR IZQUIERDA ---
        const padding = 20;
        const fontSize = Math.max(18, Math.floor(width * 0.025)); // Tamaño dinámico
        ctx.font = `${fontSize}px Arial`;
        
        // Preparar textos
        const textos = [
            `Ubicación: ${hab}`,
            `Elemento: ${boca}`
        ];
        if (obs) textos.push(`Obs: ${obs}`);
        textos.push(`Fecha: ${clienteActual.fecha}`);
        
        // Calcular tamaño de la caja oscura
        const lineHeight = fontSize * 1.4;
        let maxWidth = 0;
        textos.forEach(t => {
            const m = ctx.measureText(t).width;
            if (m > maxWidth) maxWidth = m;
        });
        
        const boxWidth = maxWidth + (padding * 2);
        const boxHeight = (textos.length * lineHeight) + padding;
        const boxX = padding;
        const boxY = height - boxHeight - padding;
        
        // Fondo semi-transparente oscuro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Dibujar los textos
        ctx.fillStyle = '#ffffff';
        textos.forEach((texto, index) => {
            ctx.fillText(texto, boxX + padding, boxY + padding + (index * lineHeight) + (fontSize * 0.8));
        });
        
        // Guardar resultado
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // Compresión 85% para balance calidad/peso
        fotosCapturadas.push(dataUrl);
        
        actualizarGaleria();
        resetearFiltros();
        
        URL.revokeObjectURL(objectUrl);
        document.getElementById('loading').style.display = 'none';
    };
    
    img.src = objectUrl;
}

function resetearFiltros() {
    document.getElementById('selHabitacion').value = '';
    document.getElementById('selBoca').value = '';
    document.getElementById('obsFoto').value = '';
    document.getElementById('cameraInput').value = '';
}

function actualizarGaleria() {
    const contenedor = document.getElementById('galeria-card');
    const preview = document.getElementById('galeria-preview');
    const contador = document.getElementById('contador-fotos');
    
    if (fotosCapturadas.length === 0) {
        contenedor.style.display = 'none';
        return;
    }
    
    contenedor.style.display = 'block';
    contador.innerText = fotosCapturadas.length;
    preview.innerHTML = '';
    
    fotosCapturadas.forEach((fotoBase64, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `
            <img src="${fotoBase64}" alt="Foto ${index + 1}">
            <button class="btn-del-foto" onclick="borrarFoto(${index})" aria-label="Eliminar foto">✕</button>
        `;
        preview.appendChild(div);
    });
}

function borrarFoto(index) {
    fotosCapturadas.splice(index, 1);
    actualizarGaleria();
}

async function generarPDF() {
    if (fotosCapturadas.length === 0) {
        alert("No hay fotografías para generar el informe.");
        return;
    }

    animarBoton('btnGenerarPDF');
    
    // Inyectar datos en la plantilla del PDF
    document.getElementById('pdf-cliente').innerText = clienteActual.nombre;
    document.getElementById('pdf-direccion').innerText = clienteActual.direccion;
    document.getElementById('pdf-fecha').innerText = clienteActual.fecha;
    
    const pdfGrid = document.getElementById('pdf-photo-container');
    pdfGrid.innerHTML = ''; // Limpiar grilla anterior
    
    // Insertar las imágenes en el contenedor del PDF
    fotosCapturadas.forEach(fotoUrl => {
        const div = document.createElement('div');
        div.className = 'pdf-photo-wrapper';
        div.innerHTML = `<img src="${fotoUrl}">`;
        pdfGrid.appendChild(div);
    });

    const element = document.getElementById('plantilla-pdf');
    element.style.display = 'block'; // Mostrar temporalmente para capturar

    window.scrollTo(0, 0);

    const opt = {
        margin:       0,
        filename:     `${clienteActual.nombre.replace(/ /g, '_')}_Villaser_Informe.pdf`,
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("Error al generar PDF: ", error);
        alert("Hubo un error al generar el PDF.");
    } finally {
        element.style.display = 'none'; // Ocultar plantilla nuevamente
    }
}

function animarBoton(id) {
    const b = document.getElementById(id);
    const textOri = b.innerText;
    b.innerText = "PROCESANDO...";
    setTimeout(() => { b.innerText = textOri; }, 2500);
}

