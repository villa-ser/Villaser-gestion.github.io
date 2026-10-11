// Detectar tema claro/oscuro de tu sistema base
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
});

// ID del Sheet que me compartiste
const SHEET_ID_CASAS = '1jFvMWkTBPlqpIWJ_kjVy1vSw3gA_q9Jxvar0LajaDnM';
// Asumo que la pestaña se llama 'Hoja1'.
const URL_CASAS = `https://docs.google.com/spreadsheets/d/${SHEET_ID_CASAS}/gviz/tq?tqx=out:json&sheet=Hoja1`;

let dbCasas = [];

window.onload = fetchCasas;

async function fetchCasas() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const res = await fetch(URL_CASAS, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const txt = await res.text();
        const jsonStr = txt.substring(txt.indexOf("{"), txt.lastIndexOf("}") + 1);
        const data = JSON.parse(jsonStr);

        // MODIFICACIÓN 1: Mapear las nuevas columnas F(5)=Latitud y G(6)=Longitud
        dbCasas = data.table.rows.map(r => ({
            nombre: r.c[0]?.v || '',
            direccion: r.c[1]?.v || '',
            telefono: r.c[2]?.v || '',
            horario: r.c[3]?.v || '',
            comentarios: r.c[4]?.v || '',
            latitud: r.c[5]?.v || '',
            longitud: r.c[6]?.v || ''
        })).filter(c => c.nombre && c.nombre.toLowerCase() !== "nombre");

        document.getElementById('loading').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        renderCasas(dbCasas);
    } catch (e) {
        clearTimeout(timeoutId);
        const loadingDiv = document.getElementById('loading');
        loadingDiv.innerHTML = `⚠️ Error al conectar con la base de datos de proveedores.<br><br><button class="btn-ngc" onclick="location.reload()">Reintentar</button>`;
        console.error("Error fetching casas:", e);
    }
}

function renderCasas(lista) {
    const contenedor = document.getElementById('resultadosContainer');
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="ngc-card" style="text-align: center; color: var(--text-dim);">
                No se encontraron proveedores con esa búsqueda.
            </div>`;
        return;
    }

    lista.forEach(casa => {
        const card = document.createElement('div');
        card.className = 'ngc-card';
        
        const telLimpio = String(casa.telefono).replace(/\D/g, '');
        const btnAccionSecundaria = telLimpio.length >= 7 
            ? `<button class="btn-obs" style="border-color: var(--ngc-success); color: var(--ngc-success); flex: 1; justify-content: center; display: flex; align-items: center; min-height: 40px; font-size:0.85rem;" onclick="window.open('https://wa.me/549${telLimpio}', '_blank')">🟢 WhatsApp</button>` 
            : ``;

        // MODIFICACIÓN 2: Enviar latitud y longitud a la función abrirMaps
        card.innerHTML = `
            <h4 style="margin-bottom: 8px; color: var(--text-main); font-size: 1.1rem; text-transform: none;">${casa.nombre}</h4>
            <p style="margin: 0 0 10px 0; font-size: 0.9rem; color: var(--ngc-primary);">📍 ${casa.direccion}</p>
            
            <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 12px; line-height: 1.5;">
                ${casa.horario ? `<div style="margin-bottom:4px;"><b>🕒 Horario:</b> ${casa.horario}</div>` : ''}
                ${casa.telefono ? `<div style="margin-bottom:4px;"><b>📞 Tel:</b> ${casa.telefono}</div>` : ''}
                ${casa.comentarios ? `<div style="margin-bottom:4px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px; margin-top: 4px;"><b>💬 Info:</b> <span style="color: var(--ngc-warning);">${casa.comentarios}</span></div>` : ''}
            </div>

            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="btn-ngc btn-adapt" style="flex: 2; min-height: 40px;" onclick="abrirMaps('${escapeHtml(casa.nombre)}', '${escapeHtml(casa.direccion)}', '${casa.latitud}', '${casa.longitud}')">🗺️ IR EN MAPS</button>
                ${btnAccionSecundaria}
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function filtrarCasas() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    const filtradas = dbCasas.filter(c => 
        c.nombre.toLowerCase().includes(query) || 
        c.direccion.toLowerCase().includes(query) ||
        c.comentarios.toLowerCase().includes(query)
    );
    
    renderCasas(filtradas);
}

// MODIFICACIÓN 3: Lógica inteligente para usar coordenadas si existen
function abrirMaps(nombre, direccion, lat, lng) {
    let query = '';
    
    // Si la planilla tiene datos en latitud y longitud, usamos coordenadas puras
    if (lat && lng && lat.toString().trim() !== '' && lng.toString().trim() !== '') {
        // Aseguramos que se use punto para decimales (por si en Excel pusiste coma: -31,41)
        const cleanLat = String(lat).replace(',', '.').trim();
        const cleanLng = String(lng).replace(',', '.').trim();
        query = `${cleanLat},${cleanLng}`;
    } else {
        // MODO RESPALDO: Si un local todavía no tiene coordenadas cargadas en el Excel, busca por texto
        query = encodeURIComponent(`${nombre}, ${direccion}, Córdoba, Argentina`);
    }
    
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
}

function escapeHtml(unsafe) {
    return unsafe.replace(/'/g, "\\'").replace(/"/g, "&quot;");
              }
