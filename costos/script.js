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
// 2. LÓGICA DE CÁLCULO Y GOOGLE CHARTS
// =======================================================
const sheetId = '1prJUdOspEx0AHh7PEAx_i5mQ7in8wGtshL6AO293fgk';
let allData = [];
let selectedFuentes = [];

// Inicializar Google Charts
google.charts.load('current', {packages:['corechart']});
google.charts.setOnLoadCallback(init);

function init() {
    const query = new google.visualization.Query(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&headers=1`);
    query.send(handleResponse);
}

function handleResponse(response) {
    if (response.isError()) return;
    const data = response.getDataTable();
    const rows = data.getNumberOfRows();
    
    allData = [];
    for (let i = 0; i < rows; i++) {
        allData.push({
            codigo: data.getValue(i, 0),    
            fuente: data.getValue(i, 1),    // Columna B
            tema: data.getValue(i, 2),      
            concepto: data.getValue(i, 3),  
            precio: data.getValue(i, 4),    
            notas: data.getValue(i, 5),     
            org: data.getValue(i, 11)       
        });
    }

    // 1. Crear Selector de Fuentes
    const fuentesUnicas = [...new Set(allData.map(d => d.fuente))].filter(f => f).sort();
    const container = document.getElementById('fuente-container');
    container.innerHTML = '';

    // Botón "TODOS"
    const btnAll = document.createElement('button');
    btnAll.className = 'fuente-btn active';
    btnAll.innerText = 'TODOS';
    btnAll.id = 'btn-fuente-all';
    btnAll.onclick = () => selectFuente('ALL', btnAll);
    container.appendChild(btnAll);
    
    selectedFuentes = [...fuentesUnicas]; // Inicialmente todos seleccionados

    fuentesUnicas.forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'fuente-btn active';
        btn.innerText = f;
        btn.onclick = () => selectFuente(f, btn);
        container.appendChild(btn);
    });

    updateTemas();
}

function selectFuente(fuente, btn) {
    const btnAll = document.getElementById('btn-fuente-all');
    const allButtons = document.querySelectorAll('.fuente-btn');

    if (fuente === 'ALL') {
        const becomingActive = !btn.classList.contains('active');
        allButtons.forEach(b => {
            becomingActive ? b.classList.add('active') : b.classList.remove('active');
        });
        selectedFuentes = becomingActive ? [...new Set(allData.map(d => d.fuente))].filter(f => f) : [];
    } else {
        btn.classList.toggle('active');
        btnAll.classList.remove('active'); // Si toca uno individual, "TODOS" se desmarca

        if (btn.classList.contains('active')) {
            selectedFuentes.push(fuente);
        } else {
            selectedFuentes = selectedFuentes.filter(f => f !== fuente);
        }
    }
    
    // Resetear cascada
    resetDropdownsCascade();
    updateTemas();
}

function updateTemas() {
    // Filtrar data por fuentes seleccionadas
    const filteredByFuente = allData.filter(d => selectedFuentes.includes(d.fuente));
    const temas = [...new Set(filteredByFuente.map(d => d.tema))].filter(t => t).sort();
    
    const listTema = document.getElementById('list-tema');
    const displayTema = document.getElementById('display-tema');
    
    displayTema.innerText = '-- Seleccionar Categoría --';
    listTema.innerHTML = '';
    
    temas.forEach(t => {
        let item = document.createElement('div');
        item.innerText = t;
        item.onclick = function() {
            selectOption('display-tema', 'val-tema', t);
            closeAllDropdowns();
            updateSubtema();
        };
        listTema.appendChild(item);
    });
}

function updateSubtema() {
    const temaSelected = document.getElementById('val-tema').value;
    const listSub = document.getElementById('list-subtema');
    const displaySub = document.getElementById('display-subtema');
    
    displaySub.innerText = '-- Seleccionar Concepto --';
    document.getElementById('val-subtema').value = '';
    listSub.innerHTML = '';
    
    // Filtrar por fuentes activas Y por tema seleccionado
    allData.filter(d => selectedFuentes.includes(d.fuente) && d.tema === temaSelected).forEach(d => {
        if(d.concepto) {
            let item = document.createElement('div');
            item.innerText = d.concepto;
            item.onclick = function() {
                selectOption('display-subtema', 'val-subtema', d.concepto);
                closeAllDropdowns();
                showDetails();
            };
            listSub.appendChild(item);
        }
    });
    document.getElementById('result-card').style.display = 'none';
}

function showDetails() {
    const temaSelected = document.getElementById('val-tema').value;
    const subSelected = document.getElementById('val-subtema').value;
    
    // Buscamos el item que coincida (considerando las fuentes seleccionadas)
    const item = allData.find(d => selectedFuentes.includes(d.fuente) && d.tema === temaSelected && d.concepto === subSelected);

    if (item) {
        document.getElementById('res-codigo').innerText = item.codigo || 'S/C';
        document.getElementById('res-concepto-full').innerText = item.concepto;
        document.getElementById('res-tema').innerText = item.tema;
        document.getElementById('res-precio').innerText = `$ ${Number(item.precio || 0).toLocaleString('es-AR')}`;
        document.getElementById('res-org').innerText = item.fuente || item.org || 'General';
        document.getElementById('res-notes-content').innerText = item.notas || 'Sin notas aclaratorias.';
        document.getElementById('result-card').style.display = 'block';
    }
}

function resetDropdownsCascade() {
    document.getElementById('val-tema').value = '';
    document.getElementById('display-tema').innerText = '-- Seleccionar Categoría --';
    document.getElementById('val-subtema').value = '';
    document.getElementById('display-subtema').innerText = 'Seleccione tema primero';
    document.getElementById('list-subtema').innerHTML = '';
    document.getElementById('result-card').style.display = 'none';
}

function resetForm() {
    // Reset fuentes a todos activos
    const allButtons = document.querySelectorAll('.fuente-btn');
    allButtons.forEach(b => b.classList.add('active'));
    selectedFuentes = [...new Set(allData.map(d => d.fuente))].filter(f => f);
    
    resetDropdownsCascade();
    updateTemas();
    closeAllDropdowns();
}

/* --- LÓGICA DEL MENÚ DESPLEGABLE PERSONALIZADO --- */
function toggleDropdown(listId, displayId, groupId) {
    const list = document.getElementById(listId);
    const display = document.getElementById(displayId);
    const group = document.getElementById(groupId);
    const isShowing = list.classList.contains('show');

    closeAllDropdowns();

    if (!isShowing) {
        list.classList.add('show');
        display.classList.add('select-arrow-active');
        group.classList.add('active');
    }
}

function selectOption(displayId, inputId, value) {
    document.getElementById(displayId).innerText = value;
    document.getElementById(inputId).value = value;
}

function closeAllDropdowns() {
    const lists = document.getElementsByClassName('select-items');
    const displays = document.getElementsByClassName('select-selected');
    const groups = document.getElementsByClassName('input-group');
    
    for (let i = 0; i < lists.length; i++) lists[i].classList.remove('show');
    for (let i = 0; i < displays.length; i++) displays[i].classList.remove('select-arrow-active');
    for (let i = 0; i < groups.length; i++) groups[i].classList.remove('active');
}

document.addEventListener("click", function(event) {
    if (!event.target.matches('.select-selected')) {
        closeAllDropdowns();
    }
});
  
