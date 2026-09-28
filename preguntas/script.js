// ============================================================================
// BANCO DE PREGUNTAS (ESTRUCTURA ESCALABLE HASTA 1000+ PREGUNTAS)
// ============================================================================
const masterQuestionBank = [
    // LEY 10281 & ERSEP
    { id: 1, category: "Ley 10281", question: "¿Cuál es el objetivo principal de la Ley Provincial N° 10.281 de Seguridad Eléctrica de Córdoba?", options: ["Establecer las tarifas de suministro eléctrico para usuarios residenciales.", "Garantizar la seguridad eléctrica en instalaciones públicas y privadas en todo el territorio provincial.", "Regular la importación de materiales eléctricos y electrodomésticos.", "Crear el sindicato de trabajadores de la energía eléctrica de Córdoba."], correct: 1, explanation: "La Ley 10281 tiene por objeto garantizar la seguridad de las personas, bienes y medio ambiente en las instalaciones eléctricas en todo el territorio de la Provincia de Córdoba." },
    { id: 2, category: "ERSeP - CIEA", question: "Según la normativa del ERSeP en Córdoba, ¿qué documento es obligatorio presentar para solicitar una nueva conexión de suministro eléctrico?", options: ["Un plano arquitectónico firmado por un maestro mayor de obras.", "El Certificado de Instalación Eléctrica Apta (CIEA) emitido por un Instalador Habilitado.", "Una factura previa de servicio público de gas o agua.", "Una declaración jurada simple firmada únicamente por el usuario solicitante."], correct: 1, explanation: "El Certificado de Instalación Eléctrica Apta (CIEA) firmado por un Electricista Habilitado registrado en ERSeP es el requisito indispensable para dar el alta del servicio." },
    { id: 3, category: "Categorías", question: "¿Qué instalaciones está facultado a certificar un Electricista Habilitado Categoría III según el ERSeP?", options: ["Instalaciones industriales complejas de media y alta tensión sin límite de potencia.", "Instalaciones domiciliarias, comerciales o de servicios en baja tensión de hasta 10 kW de demanda máxima.", "Únicamente redes aéreas de distribución pública de la distribuidora EPEC.", "Solamente tableros de transferencia automática para grupos electrógenos."], correct: 1, explanation: "La Categoría III (Idóneos Habilitados) abarca instalaciones de Baja Tensión en inmuebles residenciales o comerciales de baja complejidad hasta 10 kW." },
    { id: 4, category: "Responsabilidad", question: "Según la Ley 10281, ¿quién es el responsable legal directo del mantenimiento y estado de seguridad de las instalaciones eléctricas internas de un inmueble una vez habilitado?", options: ["El ERSeP exclusivamente.", "La empresa distribuidora de energía.", "El propietario, tenedor u ocupante del inmueble.", "El municipio de la localidad."], correct: 2, explanation: "La Ley establece que el propietario o poseedor del inmueble guarda la obligación de mantener la instalación en condiciones de seguridad." },
    { id: 5, category: "ERSeP - CIEA", question: "¿Qué vigencia tiene un Certificado de Instalación Eléctrica Apta (CIEA) para un suministro transitorio (ej. obra)?", options: ["6 meses, renovable.", "1 año.", "2 años.", "Es definitivo y no tiene vencimiento."], correct: 1, explanation: "Para suministros transitorios, el CIEA suele tener una vigencia de 1 año, pudiendo requerirse renovación si la obra continúa." },
    { id: 6, category: "Ley 10281", question: "¿A qué tipo de instalaciones aplica la Ley 10281?", options: ["Solo a instalaciones nuevas.", "Solo a instalaciones industriales.", "A instalaciones nuevas y existentes públicas o privadas.", "Solo a instalaciones de alumbrado público."], correct: 2, explanation: "La ley exige adecuación y seguridad tanto para instalaciones nuevas como para las ya existentes que requieran trámites o modificaciones." },
    { id: 7, category: "Categorías", question: "¿Un Instalador Categoría III puede certificar una instalación trifásica?", options: ["No, solo puede certificar instalaciones monofásicas.", "Sí, siempre que la potencia total no supere los 10 kW en baja tensión.", "Sí, pero solo si es para uso exclusivamente industrial.", "No, las instalaciones trifásicas son exclusivas de la Categoría I."], correct: 1, explanation: "La restricción de la Categoría III es la potencia (hasta 10 kW) y la tensión (Baja Tensión), no la cantidad de fases." },
    { id: 8, category: "Registro", question: "¿Qué organismo lleva el Registro de Instaladores Electricistas Habilitados en la Provincia de Córdoba?", options: ["EPEC", "ERSeP", "El Ministerio de Trabajo", "El Colegio de Ingenieros Civiles"], correct: 1, explanation: "El ERSeP es la autoridad de aplicación de la Ley 10281 y quien administra el registro oficial de instaladores." },
    { id: 9, category: "Infracciones", question: "¿Qué sucede si se detecta que un Instalador Habilitado emite un CIEA con datos falsos?", options: ["Solo se le cobra una multa económica a la distribuidora.", "El ERSeP puede aplicar sanciones, incluyendo la suspensión o exclusión del registro.", "No sucede nada.", "Se le obliga a rehacer el plano en 24 horas."], correct: 1, explanation: "La falsedad en el CIEA es una falta grave que conlleva sanciones administrativas por parte del ERSeP, incluyendo la inhabilitación." },
    { id: 10, category: "Categorías", question: "¿A qué profesionales abarca la Categoría I del registro del ERSeP?", options: ["Profesionales con título de grado (Ingenieros) con incumbencias en materia eléctrica.", "Técnicos electromecánicos con título secundario.", "Idóneos capacitados por cursos oficiales.", "Arquitectos sin especialización eléctrica."], correct: 0, explanation: "La Categoría I está reservada para profesionales con título de grado universitario (ej. Ingenieros Electricistas/Electromecánicos) y matriculados en sus respectivos colegios." },

    // AEA 90364 - PROTECCIONES & ESQUEMAS
    { id: 11, category: "Protecciones", question: "Según la reglamentación AEA 90364, ¿cuál es la sensibilidad máxima autorizada para el Interruptor Diferencial (ID) en circuitos de tomacorrientes residenciales?", options: ["300 mA", "100 mA", "30 mA", "10 mA"], correct: 2, explanation: "La norma AEA 90364 exige alta sensibilidad (IΔn ≤ 30 mA) para la protección de personas contra contactos directos e indirectos en viviendas y oficinas." },
    { id: 12, category: "Puesta a Tierra", question: "En el esquema de conexión a tierra TT, ¿cómo se vinculan las masas de la instalación?", options: ["Se conectan directamente al neutro de la red de la distribuidora.", "Se conectan a un electrodo de puesta a tierra (jabalina) propio e independiente.", "Quedan completamente aisladas.", "Se conectan a la cañería metálica de agua."], correct: 1, explanation: "El esquema TT requiere una puesta a tierra propia local en la instalación, independiente del punto neutro del transformador de la distribuidora." },
    { id: 13, category: "Protecciones", question: "¿Cuál es la función principal de una Llave Termomagnética (PIA)?", options: ["Proteger a las personas contra choques eléctricos.", "Proteger las líneas contra sobrecargas y cortocircuitos.", "Medir el consumo de energía.", "Mejorar el factor de potencia cos φ."], correct: 1, explanation: "Las termomagnéticas actúan por efecto térmico y magnético para preservar la integridad de los conductores." },
    { id: 14, category: "Protecciones", question: "¿Qué parámetro de un interruptor termomagnético indica la corriente máxima de cortocircuito que puede interrumpir sin destruirse?", options: ["Corriente nominal (In)", "Tensión nominal (Vn)", "Capacidad de ruptura (Icn)", "Corriente diferencial (IΔn)"], correct: 2, explanation: "La capacidad de ruptura (ej. 3000A, 4500A) es el máximo valor de cortocircuito que el dispositivo puede despejar de forma segura." },
    { id: 15, category: "Puesta a Tierra", question: "¿Cuál es el valor máximo de resistencia de puesta a tierra recomendado por AEA para un esquema TT con diferencial de 30 mA (límite 24V)?", options: ["5 Ohms", "10 Ohms", "40 Ohms", "800 Ohms"], correct: 2, explanation: "Ra = 24V / 0.03A = 800 Ohms por cálculo, pero AEA suele recomendar valores prácticos menores (ej. 40 Ohms) para garantizar operación." },
    { id: 16, category: "Tableros", question: "¿Qué elemento es obligatorio como corte general en el Tablero Principal (TP) de una vivienda según AEA 771?", options: ["Un seccionador fusible.", "Un interruptor que corte todos los conductores activos, incluido el neutro.", "Un contactor operado a distancia.", "Un interruptor unipolar en la fase."], correct: 1, explanation: "El corte general debe ser bipolar (en monofásica) o tetrapolar (en trifásica), interrumpiendo simultáneamente fases y neutro." },
    { id: 17, category: "Protecciones", question: "En una curva de disparo tipo 'C', ¿en qué rango de veces la corriente nominal (In) actúa el disparo magnético?", options: ["Entre 3 y 5 veces In.", "Entre 5 y 10 veces In.", "Entre 10 y 20 veces In.", "A más de 50 veces In."], correct: 1, explanation: "La curva C es estándar para usos generales y actúa magnéticamente entre 5 y 10 veces la In." },
    { id: 18, category: "Protecciones", question: "¿Se permite colocar en paralelo dos termomagnéticas unipolares para sumar sus corrientes nominales?", options: ["Sí, siempre que sean de la misma marca.", "Sí, pero solo en iluminación.", "No, está expresamente prohibido por la reglamentación.", "Solo si el ERSeP lo autoriza."], correct: 2, explanation: "No se pueden poner en paralelo dispositivos de protección para aumentar la capacidad, ya que no se garantiza el reparto equitativo." },
    { id: 19, category: "Tableros", question: "En un tablero eléctrico con frente muerto interior, ¿qué grado de protección mínimo IP se exige para la envolvente (tapa cerrada)?", options: ["IP20", "IP40", "IP54", "IP65"], correct: 1, explanation: "Para interiores, se exige generalmente un IP mínimo de 40 para tableros con la puerta cerrada." },
    { id: 20, category: "Protecciones", question: "¿Qué prueba recomienda AEA para verificar el mecanismo del Interruptor Diferencial?", options: ["Someterlo a un cortocircuito provocado.", "Presionar el botón de test (T) periódicamente (ej. mensualmente).", "Medir su temperatura.", "Limpiarlo internamente."], correct: 1, explanation: "El botón de test simula una fuga para verificar que el mecanismo de disparo funciona correctamente." },

    // AEA 90364 - CONDUCTORES & CANALIZACIONES
    { id: 21, category: "Conductores", question: "¿Cuál es la sección mínima normada por AEA 771 para el conductor de protección (PE) en un circuito seccional?", options: ["1,0 mm²", "1,5 mm²", "2,5 mm²", "4,0 mm²"], correct: 2, explanation: "La sección mínima permitida por AEA para conductores de línea en tomacorrientes y conductor PE es de 2,5 mm²." },
    { id: 22, category: "Colores", question: "Según la norma IRAM / AEA, ¿cuál es el código de colores estandarizado en monofásica?", options: ["Fase: Marrón/Negro/Rojo | Neutro: Celeste | PE: Verde-Amarillo", "Fase: Verde | Neutro: Blanco | PE: Rojo", "Fase: Celeste | Neutro: Marrón | PE: Negro", "Fase: Azul | Neutro: Amarillo | PE: Gris"], correct: 0, explanation: "El reglamento exige Neutro Celeste, PE Verde/Amarillo, y Fase en Marrón, Negro o Rojo." },
    { id: 23, category: "Conductores", question: "¿Qué sección mínima exige la AEA para los conductores de línea en un circuito de Iluminación de Uso General (IUG)?", options: ["1,0 mm²", "1,5 mm²", "2,5 mm²", "4,0 mm²"], correct: 1, explanation: "Para circuitos de iluminación general (IUG), la sección mínima permitida es de 1,5 mm²." },
    { id: 24, category: "Canalizaciones", question: "En una cañería embutida, ¿cuál es el porcentaje máximo de ocupación permitido por la sección total de los conductores?", options: ["25%", "35%", "50%", "75%"], correct: 1, explanation: "La suma de las secciones totales no debe superar el 35% de la sección interna de la cañería." },
    { id: 25, category: "Conductores", question: "¿Está permitido utilizar conductores tipo 'Taller' (TPR) embutidos dentro de cañerías fijas?", options: ["Sí, porque tienen doble aislación.", "Sí, solo en iluminación.", "No, están diseñados para conexiones móviles.", "Solo si la cañería es de metal."], correct: 2, explanation: "Los cables tipo taller no cumplen con los ensayos de no propagación de incendio requeridos para instalaciones fijas embutidas." },
    { id: 26, category: "Empalmes", question: "¿Dónde está permitido realizar empalmes de conductores en una instalación domiciliaria?", options: ["Dentro de los tramos de cañería.", "Exclusivamente dentro de las cajas de paso o derivación.", "En cualquier lugar con cinta homologada.", "No se permiten empalmes."], correct: 1, explanation: "Todos los empalmes deben realizarse dentro de cajas (de paso, de llaves o tomacorrientes), quedando accesibles." },
    { id: 27, category: "Conductores", question: "Si la fase es de 4 mm², ¿qué sección mínima debe tener el conductor de Protección (PE)?", options: ["1,5 mm²", "2,5 mm²", "4,0 mm²", "6,0 mm²"], correct: 2, explanation: "Hasta 16 mm², la sección del conductor PE debe ser igual a la sección de los conductores de fase del circuito." },
    { id: 28, category: "Canalizaciones", question: "¿Se permite instalar conductores de corrientes débiles en la misma cañería que los de baja tensión (220V)?", options: ["Sí, con buena aislación.", "Sí, si el recorrido es corto.", "No, deben ir por canalizaciones separadas.", "Solo si se envuelven con cinta."], correct: 2, explanation: "Para evitar interferencias y riesgos, las canalizaciones de baja tensión y señales deben estar separadas." },
    { id: 29, category: "Conductores", question: "El conductor Neutro en instalación trifásica con cargas desequilibradas, ¿puede tener menor sección que las fases?", options: ["Sí, la mitad de la fase.", "No, generalmente debe tener la misma sección.", "No es necesario el neutro.", "Cualquier sección es válida."], correct: 1, explanation: "En presencia de cargas desequilibradas y armónicos, el neutro no debe reducir su sección sin estudio previo." },
    { id: 30, category: "Canalizaciones", question: "Al utilizar bandejas portacables, ¿qué tipo de conductor es obligatorio utilizar?", options: ["Conductores unipolares tipo IRAM 247-3.", "Conductores con envoltura de protección tipo IRAM 2178 (Sintenax).", "Cables coaxiles.", "Cables desnudos."], correct: 1, explanation: "Sobre bandejas portacables se exige usar cables con aislación y envoltura de protección (doble aislación)." },

    // AEA 90364 - CIRCUITOS, BOCAS Y CAÍDA
    { id: 31, category: "Bocas", question: "¿Cuál es la cantidad máxima de bocas de salida permitida para un Circuito de Usos Generales (IUG o TUG)?", options: ["10 bocas", "15 bocas", "20 bocas", "Sin límite"], correct: 1, explanation: "Los circuitos de uso general pueden alimentar un máximo de 15 bocas de salida por circuito." },
    { id: 32, category: "Tensión", question: "¿Cuál es el límite admisible de caída de tensión desde el medidor para circuitos de alumbrado?", options: ["1 %", "3 %", "5 %", "10 %"], correct: 1, explanation: "AEA establece un límite máximo del 3% para alumbrado y 5% para motores." },
    { id: 33, category: "Baños", question: "En el baño, ¿qué aplica respecto a la instalación de llaves o tomacorrientes en Zona 1?", options: ["Se permiten si tienen tapa estanca IP54.", "Está totalmente prohibida su instalación.", "Se permiten con protección diferencial.", "Se permiten a más de 30 cm."], correct: 1, explanation: "La Zona 0 y Zona 1 son volúmenes de muy alto riesgo donde no se permiten mecanismos de maniobra ni tomacorrientes." },
    { id: 34, category: "Circuitos", question: "¿Cuál es la demanda de potencia máxima que se asigna a un circuito de Tomacorrientes de Uso General (TUG)?", options: ["1100 VA", "1500 VA", "2200 VA", "3300 VA"], correct: 2, explanation: "Para el cálculo de demanda a un circuito TUG se le asigna convencionalmente 2200 VA." },
    { id: 35, category: "Circuitos", question: "Un aire acondicionado fijo de 18 Amperes, ¿a qué tipo de circuito debe conectarse?", options: ["TUG.", "IUE.", "Circuito de Tomacorrientes de Uso Especial (TUE) o Específico.", "Acometida."], correct: 2, explanation: "Cargas mayores a 10A requieren circuitos especiales (TUE) con tomacorrientes de 20A o conexión directa." },
    { id: 36, category: "Bocas", question: "En caja rectangular 5x10 cm, ¿cuántos módulos de tomacorrientes 10A se permiten máximo?", options: ["Un módulo.", "Dos módulos (o módulo doble).", "Tres módulos.", "Cuatro módulos."], correct: 1, explanation: "Por disipación térmica y espacio físico de los cables, se permite un máximo de 2 tomacorrientes por caja rectangular." },
    { id: 37, category: "Electrificación", question: "El 'Grado de Electrificación' se determina principalmente en base a:", options: ["Cantidad de personas.", "La superficie 'Límite de Aplicación' (cubierta + 50% semicubierta).", "El presupuesto.", "La tensión."], correct: 1, explanation: "El Grado de Electrificación se define inicialmente por la superficie calculada del inmueble." },
    { id: 38, category: "Circuitos", question: "Para un Grado de Electrificación 'Medio', ¿cuántos circuitos mínimos exige la norma?", options: ["1 circuito.", "2 circuitos.", "3 circuitos (ej. 2 IUG + 1 TUG).", "5 circuitos."], correct: 2, explanation: "El grado Medio exige un mínimo de 3 circuitos en total." },
    { id: 39, category: "Baños", question: "Un termotanque eléctrico en el baño, ¿qué condición debe cumplir?", options: ["Conexión con ficha y tomacorriente común en Zona 1.", "Conexión fija, fuera de Zona 0 y 1, y protegido diferencialmente.", "No se permiten.", "Al circuito de iluminación."], correct: 1, explanation: "Los calentadores de agua en baños deben tener instalación fija, estar en Zona 2/3 y contar con protección diferencial." },
    { id: 40, category: "Bocas", question: "¿A qué altura aproximada se recomienda instalar los tomacorrientes de uso general?", options: ["A 10 cm.", "Entre 30 cm y 90 cm del piso.", "A 2,50 metros.", "En cielorraso."], correct: 1, explanation: "La norma recomienda instalar las cajas de tomacorrientes entre 0,30 m y 0,90 m de altura." },

    // ELECTROTECNIA Y CÁLCULOS
    { id: 41, category: "Electrotecnia", question: "¿Qué corriente circulará por un artefacto resistivo de 2200 W a 220 V (cos φ = 1)?", options: ["5 A", "10 A", "15 A", "22 A"], correct: 1, explanation: "I = P / (V × cos φ) -> I = 2200 / 220 = 10 Amperes." },
    { id: 42, category: "Electrotecnia", question: "Si se conectan dos resistencias idénticas de 10 Ohms en paralelo, ¿cuál es la resistencia equivalente?", options: ["20 Ohms", "10 Ohms", "5 Ohms", "2,5 Ohms"], correct: 2, explanation: "Req = (10 × 10) / (10 + 10) = 100 / 20 = 5 Ohms." },
    { id: 43, category: "Electrotecnia", question: "Según la Ley de Ohm, si la resistencia es constante y la tensión se duplica, la corriente:", options: ["Se reduce a la mitad.", "Se mantiene igual.", "Se duplica.", "Se cuadruplica."], correct: 2, explanation: "I = V / R. Son directamente proporcionales." },
    { id: 44, category: "Electrotecnia", question: "¿Qué unidad se utiliza para medir la Potencia Activa en corriente alterna?", options: ["Volt-Amper (VA)", "Watt (W)", "Volt-Amper Reactivo (VAr)", "Joule (J)"], correct: 1, explanation: "La Potencia Activa se mide en Watts (W) o Kilowatts (kW)." },
    { id: 45, category: "Electrotecnia", question: "En un sistema trifásico 380V/220V, ¿qué tensión se mide entre dos fases cualesquiera?", options: ["220 V", "380 V", "110 V", "0 V"], correct: 1, explanation: "La tensión de línea (entre fases) es de 380V (o 400V)." },
    { id: 46, category: "Electrotecnia", question: "Si un motor monofásico consume 10A a 220V y su factor de potencia es 0.8, su Potencia Activa es:", options: ["2200 W", "1760 W", "2750 W", "1000 W"], correct: 1, explanation: "P = V × I × cos φ = 220 × 10 × 0.8 = 1760 Watts." },
    { id: 47, category: "Instrumentos", question: "¿Qué instrumento mide la resistencia de aislación de los conductores?", options: ["Pinza amperométrica", "Telurímetro", "Megóhmetro (Megger)", "Luxómetro"], correct: 2, explanation: "El Megóhmetro aplica tensión continua elevada para medir fugas en la aislación." },
    { id: 48, category: "Instrumentos", question: "¿Qué mide un Telurímetro?", options: ["El consumo en kWh.", "La resistencia de puesta a tierra.", "La temperatura.", "La frecuencia."], correct: 1, explanation: "Mide el valor resistivo (en Ohms) de los sistemas de puesta a tierra." },
    { id: 49, category: "Acometidas", question: "¿Qué altura mínima sobre nivel de vereda debe respetar la pipeta de acometida aérea?", options: ["1,80 metros", "2,50 metros", "4,00 metros", "5,50 metros"], correct: 2, explanation: "Generalmente se exigen 4,00 m libres para evitar contactos en la vía pública." },
    { id: 50, category: "Acometidas", question: "El caño de bajada galvanizado del pilar, ¿debe estar conectado a tierra?", options: ["Sí, obligatorio a jabalina de prestataria.", "No, aislación de cable basta.", "Solo si se solicita.", "Se conecta al neutro interno."], correct: 0, explanation: "Las envolventes metálicas de medición deben poseer una puesta a tierra de protección propia del pilar." }
];

const QUESTIONS_PER_ROUND = 10;
let usedIndices = new Set();
let currentRoundQuestions = [];

function loadSession() {
    const stored = sessionStorage.getItem('usedQuestionIndices');
    if (stored) usedIndices = new Set(JSON.parse(stored));
    updateStats();
}

function saveSession() {
    sessionStorage.setItem('usedQuestionIndices', JSON.stringify(Array.from(usedIndices)));
}

function updateStats() {
    const total = masterQuestionBank.length;
    const answered = usedIndices.size;
    
    document.getElementById('total-questions-count').value = total;
    document.getElementById('remaining-count').value = total - answered;
}

function getNextQuestions(count) {
    const available = masterQuestionBank.filter((_, index) => !usedIndices.has(index));

    if (available.length === 0) {
        alert("¡Has completado todas las preguntas! El historial se reiniciará para continuar practicando.");
        usedIndices.clear();
        saveSession();
        return getNextQuestions(count);
    }

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    selected.forEach(q => {
        const globalIdx = masterQuestionBank.findIndex(item => item.id === q.id);
        if (globalIdx !== -1) usedIndices.add(globalIdx);
    });

    saveSession();
    updateStats();
    return selected;
}

function renderQuiz() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    
    // Ocultar banner usando .hidden
    document.getElementById('score-banner').classList.add('hidden');
    document.getElementById('btn-submit').classList.remove('hidden');
    document.getElementById('btn-next').classList.add('hidden');

    currentRoundQuestions = getNextQuestions(QUESTIONS_PER_ROUND);

    currentRoundQuestions.forEach((q, qIndex) => {
        const card = document.createElement('div');
        card.className = 'question-card card';
        card.id = `q-card-${qIndex}`;

        let optionsHTML = '';
        q.options.forEach((opt, optIndex) => {
            optionsHTML += `
                <label class="option-label" id="label_${qIndex}_${optIndex}">
                    <input type="radio" name="question_${qIndex}" id="q_${qIndex}_opt_${optIndex}" value="${optIndex}" class="sr-only option-input" onchange="styleRadio(${qIndex}, ${optIndex})">
                    <div class="custom-radio"></div>
                    <span class="option-text" style="flex:1;">${opt}</span>
                </label>
            `;
        });

        card.innerHTML = `
            <h4>Pregunta ${qIndex + 1} <span style="float: right; font-size: 0.7rem; color: var(--text); opacity:0.6;">${q.category}</span></h4>
            <div class="question-text">${q.question}</div>
            <div class="options-list">
                ${optionsHTML}
            </div>
            <div class="explanation-box hidden" id="explanation-${qIndex}">
                <strong>💡 Fundamento Reglamentario:</strong><br>${q.explanation}
            </div>
        `;

        container.appendChild(card);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Estilizar visualmente la etiqueta seleccionada
function styleRadio(qIndex, optIndex) {
    // Quitar estilo de todas las opciones de esta pregunta
    const labels = document.querySelectorAll(`input[name="question_${qIndex}"]`);
    labels.forEach((_, idx) => {
        document.getElementById(`label_${qIndex}_${idx}`).classList.remove('checked-style');
    });
    // Añadir al seleccionado
    document.getElementById(`label_${qIndex}_${optIndex}`).classList.add('checked-style');
}

function evaluateQuiz() {
    let score = 0;

    currentRoundQuestions.forEach((q, qIndex) => {
        const selected = document.querySelector(`input[name="question_${qIndex}"]:checked`);
        const card = document.getElementById(`q-card-${qIndex}`);
        card.classList.add('evaluated');

        const expBox = document.getElementById(`explanation-${qIndex}`);
        expBox.classList.remove('hidden');

        q.options.forEach((_, optIndex) => {
            const label = document.getElementById(`label_${qIndex}_${optIndex}`);
            const input = document.getElementById(`q_${qIndex}_opt_${optIndex}`);
            input.disabled = true;
            label.classList.remove('checked-style'); // Limpiamos el borde cyan

            if (optIndex === q.correct) {
                label.classList.add('correct-choice');
            }

            if (selected && parseInt(selected.value) === optIndex && optIndex !== q.correct) {
                label.classList.add('wrong-choice');
            }
        });

        if (selected && parseInt(selected.value) === q.correct) {
            score++;
        }
    });

    // Mostrar puntaje
    const banner = document.getElementById('score-banner');
    const scoreText = document.getElementById('score-text');
    const feedback = document.getElementById('score-feedback');
    const percentage = (score / currentRoundQuestions.length) * 100;

    scoreText.innerText = `${score} / ${currentRoundQuestions.length}`;

    if (percentage >= 80) {
        feedback.innerHTML = "¡Excelente! 🟢<br>Dominio alto de reglamentaciones AEA y ERSeP.";
        scoreText.style.color = "var(--success)";
    } else if (percentage >= 60) {
        feedback.innerHTML = "Aprobado 🟡<br>Revisa las justificaciones técnicas para reforzar.";
        scoreText.style.color = "#ff9800";
    } else {
        feedback.innerHTML = "Atención 🔴<br>Se recomienda repaso intensivo de la Ley 10281 y AEA 90364.";
        scoreText.style.color = "var(--error)";
    }

    banner.classList.remove('hidden');
    document.getElementById('btn-submit').classList.add('hidden');
    document.getElementById('btn-next').classList.remove('hidden');

    banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function nextRound() {
    renderQuiz();
}

function resetHistory() {
    if (confirm("¿Deseas reiniciar el banco? Volverán a aparecer las preguntas ya respondidas.")) {
        usedIndices.clear();
        sessionStorage.removeItem('usedQuestionIndices');
        updateStats();
        renderQuiz();
    }
}

// Inicializar
window.onload = function() {
    loadSession();
    renderQuiz();
};
