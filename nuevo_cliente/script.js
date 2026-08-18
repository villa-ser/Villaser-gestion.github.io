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
// 2. LÓGICA DE REGISTRO DE CLIENTE
// =======================================================
let submitted = false;

function validarFormulario() {
    const telInput = document.getElementById("tel_field");
    const telValue = telInput.value.trim();
    const regexTel = /^\d{10}$/;

    if (!regexTel.test(telValue)) {
        alert("⚠️ El teléfono debe tener exactamente 10 números.");
        telInput.focus();
        return false;
    }
    submitted = true;
    return true;
}

// Lógica para extraer dirección de URL de Google Maps
function procesarDireccion() {
    const campo = document.getElementById("direccion_field");
    let rawText = campo.value.trim();

    if (rawText === "") {
        alert("Por favor, pegue una URL o dirección primero.");
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
            alert("No se pudo procesar esta URL específica.");
        }
    } else {
        // Si no es URL, solo limpiamos espacios innecesarios
        campo.value = rawText;
    }
}

function borrarDireccion() {
    const campo = document.getElementById("direccion_field");
    campo.value = "";
    campo.focus();
}

function buscarEnMaps() {
    const direccion = document.getElementById("direccion_field").value;
    if (direccion.trim() === "") return;
    
    const dirCodificada = encodeURIComponent(direccion);
    
    // Detectamos si el usuario está desde un dispositivo Android
    const isAndroid = /android/i.test(navigator.userAgent);
    
    if (isAndroid) {
        // Enlace de respaldo por si el teléfono no tiene Google Chrome instalado
        const fallbackUrl = encodeURIComponent("https://www.google.com/maps/search/" + dirCodificada);
        
        // Intent que fuerza la apertura en el navegador Chrome para evitar la App de Maps.
        // Desde Chrome podrás copiar la URL larga que contiene "/place/"
        const urlMapsChrome = "intent://www.google.com/maps/search/" + dirCodificada + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + fallbackUrl + ";end";
        
        window.location.href = urlMapsChrome;
    } else {
        // Para usuarios en iOS (iPhone) o PC, abrimos en pestaña nueva.
        // El parámetro ?force=web ayuda en algunos entornos a preferir la vista de navegador.
        const urlMaps = "https://www.google.com/maps/search/" + dirCodificada + "?force=web";
        window.open(urlMaps, '_blank');
    }
}


function showSuccess() {
    document.getElementById("myForm").style.display = "none";
    document.getElementById("success-message").style.display = "block";
}

function resetForm() {
    submitted = false;
    document.getElementById("myForm").reset();
    document.getElementById("success-message").style.display = "none";
    document.getElementById("myForm").style.display = "block";
}
  
