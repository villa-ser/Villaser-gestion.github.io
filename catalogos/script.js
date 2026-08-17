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
// 2. LÓGICA DE ACORDEONES Y CARGA DE PDF
// =======================================================

function setupAccordion(className) {
    const groups = document.querySelectorAll(className);
    groups.forEach((acc) => {
        acc.addEventListener('toggle', () => {
            if (acc.open) {
                // Cerrar todos los demás acordeones del mismo nivel
                groups.forEach((other) => {
                    if (other !== acc) other.removeAttribute('open');
                });
            }
        });
    });
}

function hideLoader(iframe) {
    const loader = iframe.previousElementSibling;
    if (loader && loader.classList.contains('gnc-loader')) {
        loader.style.display = 'none';
    }
}

// Inicializar la funcionalidad de que solo un acordeón pueda estar abierto a la vez
setupAccordion('.gnc-main-acc');
setupAccordion('.gnc-sub-acc');

