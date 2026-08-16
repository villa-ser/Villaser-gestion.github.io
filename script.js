// Variable global para almacenar las credenciales válidas
let credenciales = [];

// Al cargar la página, intentar descargar y parsear el archivo clave.xlsx
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // La ruta asume que clave.xlsx está en la misma carpeta del repositorio
        const response = await fetch('clave.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        
        // Leer el archivo con SheetJS
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Tomar la primera hoja
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir a un arreglo bidimensional (Matriz)
        // Cada fila será un arreglo: [usuario, clave]
        credenciales = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log("Credenciales cargadas correctamente.");
    } catch (error) {
        console.error("Error al cargar clave.xlsx. Verifica que el archivo exista en GitHub.", error);
    }
});

function verificarCredenciales() {
    const userIn = document.getElementById('username').value;
    const passIn = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMessage');
    
    let accesoConcedido = false;

    // Recorrer las filas del Excel para validar
    for (let i = 0; i < credenciales.length; i++) {
        const fila = credenciales[i];
        // Fila[0] es Usuario, Fila[1] es Clave
        if (fila[0] === userIn && fila[1] === passIn) {
            accesoConcedido = true;
            break;
        }
    }

    if (accesoConcedido) {
        // Ocultar error si estaba visible
        errorMsg.style.display = 'none';
        
        // Ocultar Login y Cabecera Principal
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        
        // Mostrar animación de Bienvenida
        const welcomeScreen = document.getElementById('welcomeScreen');
        const welcomeText = welcomeScreen.querySelector('.welcome-text');
        welcomeScreen.classList.remove('hidden');
        welcomeText.classList.add('animate-welcome');
        
        // Después de 3 segundos (lo que dura la animación), mostrar la App
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            document.getElementById('appScreen').classList.remove('hidden');
        }, 3000);
        
    } else {
        // Mostrar cartel de datos erróneos
        errorMsg.style.display = 'block';
        
        // Limpiar el campo de contraseña
        document.getElementById('password').value = '';
    }
}

// Funciones para la UI de la App
function toggleMenu() {
    const grid = document.getElementById('menuGrid');
    grid.classList.toggle('hidden');
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
}

function cerrarSesion() {
    // Recargar la página limpia todo el estado y devuelve al login
    window.location.reload();
}

