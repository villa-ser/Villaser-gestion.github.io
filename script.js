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
    // .trim() elimina espacios en blanco accidentales al principio o al final
    const userIn = document.getElementById('username').value.trim();
    const passIn = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMessage');
    
    let accesoConcedido = false;

    // Empezamos el bucle en i = 1 para saltar la fila 0 (que tiene los títulos del Excel)
    for (let i = 1; i < credenciales.length; i++) {
        const fila = credenciales[i];
        
        // Nos aseguramos de que la fila exista y tenga al menos las dos columnas
        if (fila && fila.length >= 2) {
            // Forzamos la conversión a Texto (String) de los datos del Excel
            const excelUser = String(fila[0]).trim();
            const excelPass = String(fila[1]).trim();

            // Ahora sí, comparamos texto con texto
            if (excelUser === userIn && excelPass === passIn) {
                accesoConcedido = true;
                break;
            }
        }
    }

    if (accesoConcedido) {
        errorMsg.style.display = 'none';
        
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        
        const welcomeScreen = document.getElementById('welcomeScreen');
        const welcomeText = welcomeScreen.querySelector('.welcome-text');
        welcomeScreen.classList.remove('hidden');
        welcomeText.classList.add('animate-welcome');
        
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            document.getElementById('appScreen').classList.remove('hidden');
        }, 3000);
        
    } else {
        errorMsg.style.display = 'block';
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

