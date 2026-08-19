// =======================================================
// 1. DETECCIÓN DE TEMA (MODO DÍA / NOCHE)
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
});

// =======================================================
// 2. LÓGICA DE FORMULARIO Y REGISTRO
// =======================================================
let submitted = false;

const form = document.getElementById('myForm');
const btnSubmit = document.getElementById('btnSubmit');
const iframe = document.getElementById('hidden_confirm');

// Interceptar el envío del formulario
form.addEventListener('submit', (e) => {
    const telInput = document.getElementById("tel_field");
    const telValue = telInput.value.trim();
    const regexTel = /^\d{10}$/;

    if (!regexTel.test(telValue)) {
        e.preventDefault(); // Detiene el envío
        alert("⚠️ El teléfono debe tener exactamente 10 números.");
        telInput.focus();
        return false;
    }

    // UX: Evitar doble clic mientras carga
    submitted = true;
    btnSubmit.innerText = "GUARDANDO...";
    btnSubmit.disabled = true;
});

// Detectar cuando el iframe oculto termina de cargar (sincro exitosa)
iframe.addEventListener('load', () => {
    if (submitted) {
        showSuccess();
    }
});

// =======================================================
// 3. PROCESAMIENTO DE GOOGLE MAPS
// =======================================================
function procesarDireccion() {
    const campo = document.getElementById("direccion_field");
    let rawText = campo.value.trim();

    if (rawText === "") {
        alert("Por favor, pegue una URL o dirección primero.");
        campo.focus();
        return;
    }

    if (rawText.includes('/place/')) {
        try {
            // Extraer entre /place/ y el siguiente / o @
            let parte1 = rawText.split('/place/')[1];
            let direccionSucia = parte1.split('/')[0].split('@')[0];
            
            // Decodificar y limpiar los "+" por espacios
            let direccionLimpia = decodeURIComponent(direccionSucia.replace(/\+/g, ' '));
            
            campo.value = direccionLimpia;
        } catch (e) {
            console.error("Error procesando URL:", e);
            alert("No se pudo procesar esta URL de Maps automáticamente. Por favor, edítela a mano.");
        }
    } else {
        // Limpiamos espacios innecesarios si es texto normal
        campo.value = rawText.replace(/\s+/g, ' ').trim();
    }
}

function borrarDireccion() {
    const campo = document.getElementById("direccion_field");
    campo.value = "";
    campo.focus();
}

function buscarEnMaps() {
    const direccion = document.getElementById("direccion_field").value;
    if (direccion.trim() === "") {
        alert("Debe escribir una dirección para buscar en Maps.");
        return;
    }
    
    const dirCodificada = encodeURIComponent(direccion);
    const isAndroid = /android/i.test(navigator.userAgent);
    
    if (isAndroid) {
        // Intent para forzar Chrome en Android. Permite copiar la URL fácilmente.
        const fallbackUrl = encodeURIComponent("https://www.google.com/maps/search/" + dirCodificada);
        const urlMapsChrome = "intent://www.google.com/maps/search/" + dirCodificada + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + fallbackUrl + ";end";
        window.location.href = urlMapsChrome;
    } else {
        // En iOS o PC, forzar vista web
        const urlMaps = "https://www.google.com/maps/search/" + dirCodificada + "?force=web";
        window.open(urlMaps, '_blank');
    }
}

// =======================================================
// 4. CONTROL DE PANTALLAS
// =======================================================
function showSuccess() {
    form.style.display = "none";
    document.getElementById("success-message").style.display = "block";
    
    // Restaurar el botón para la próxima carga
    btnSubmit.innerText = "GUARDAR EN SISTEMA";
    btnSubmit.disabled = false;
}

function resetForm() {
    submitted = false;
    form.reset();
    document.getElementById("success-message").style.display = "none";
    form.style.display = "block";
    document.getElementById("nombre_field").focus();
}
