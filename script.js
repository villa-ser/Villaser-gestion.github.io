// Variable global para almacenar las credenciales válidas
let credenciales = [];

// Al cargar la página, verificamos si ya inició sesión y cargamos el Excel
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Verificar si hay una sesión activa en la memoria del navegador
    if (localStorage.getItem('villaser_sesion_activa') === 'true') {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
    }

    // 2. Cargar las credenciales para futuros inicios de sesión
    try {
        const response = await fetch('clave.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        credenciales = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log("Credenciales cargadas correctamente.");
    } catch (error) {
        console.error("Error al cargar clave.xlsx. Verifica que el archivo exista en GitHub.", error);
    }
});

function verificarCredenciales() {
    const userIn = document.getElementById('username').value.trim();
    const passIn = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMessage');
    
    let accesoConcedido = false;

    // Empezamos en i = 1 para saltar los títulos del Excel
    for (let i = 1; i < credenciales.length; i++) {
        const fila = credenciales[i];
        
        if (fila && fila.length >= 2) {
            const excelUser = String(fila[0]).trim();
            const excelPass = String(fila[1]).trim();

            if (excelUser === userIn && excelPass === passIn) {
                accesoConcedido = true;
                break;
            }
        }
    }

    if (accesoConcedido) {
        // Guardar la sesión en la memoria del navegador
        localStorage.setItem('villaser_sesion_activa', 'true');

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

function toggleMenu() {
    const grid = document.getElementById('menuGrid');
    grid.classList.toggle('hidden');
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
}

function cerrarSesion() {
    // Borrar la etiqueta de la memoria para obligar a pedir clave de nuevo
    localStorage.removeItem('villaser_sesion_activa');
    
    // Recargar la página
    window.location.reload();
}

// Navegación al módulo de Presupuestos
document.getElementById('btnPresupuesto').addEventListener('click', function() {
    window.location.href = './presupuesto/index.html';
});

// Navegación al módulo de Materiales
document.getElementById('btnMateriales').addEventListener('click', function() {
    // Esto redirige a la página index.html dentro de la carpeta presupuesto
    window.location.href = './materiales/index.html';
});

// Navegación al módulo de Nuevo Cliente
document.getElementById('btnNuevoCliente').addEventListener('click', function() {
    window.location.href = './nuevo_cliente/index.html';
});



// Al cargar la página principal, verificar qué tema estaba activo
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('villaser_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('themeToggleBtn').innerText = '🌙';
    } else {
        document.getElementById('themeToggleBtn').innerText = '☀️';
    }
    // ... resto de tu código de carga de Excel y sesión ...
});

// Función para cambiar de tema y guardarlo
function toggleTheme() {
    const btn = document.getElementById('themeToggleBtn');
    document.body.classList.toggle('light-mode');
    
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('villaser_theme', 'light');
        btn.innerText = '🌙'; // Icono de luna para volver a oscuro
    } else {
        localStorage.setItem('villaser_theme', 'dark');
        btn.innerText = '☀️'; // Icono de sol para ir a claro
    }
}

// Dentro de tu código cuando el acceso es correcto:
document.getElementById('userMenuWrapper').style.display = 'block';
