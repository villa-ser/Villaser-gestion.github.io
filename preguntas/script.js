// ============================================================================
// BANCO DE PREGUNTAS (ESTRUCTURA ESCALABLE HASTA 1000+ PREGUNTAS)
// ============================================================================
const masterQuestionBank = [
    // LEY 10281 & ERSEP
    {
        id: 1,
        category: "Ley 10281 Córdoba",
        question: "¿Cuál es el objetivo principal de la Ley Provincial N° 10.281 de Seguridad Eléctrica de Córdoba?",
        options: [
            "Establecer las tarifas de suministro eléctrico para usuarios residenciales.",
            "Garantizar la seguridad eléctrica en instalaciones públicas y privadas en todo el territorio provincial.",
            "Regular la importación de materiales eléctricos y electrodomésticos.",
            "Crear el sindicato de trabajadores de la energía eléctrica de Córdoba."
        ],
        correct: 1,
        explanation: "La Ley 10281 tiene por objeto garantizar la seguridad de las personas, bienes y medio ambiente en las instalaciones eléctricas en todo el territorio de la Provincia de Córdoba."
    },
    {
        id: 2,
        category: "Ley 10281 / ERSeP",
        question: "Según la normativa del ERSeP en Córdoba, ¿qué documento es obligatorio presentar para solicitar una nueva conexión de suministro eléctrico?",
        options: [
            "Un plano arquitectónico firmado por un maestro mayor de obras.",
            "El Certificado de Instalación Eléctrica Apta (CIEA) emitido por un Instalador Habilitado.",
            "Una factura previa de servicio público de gas o agua.",
            "Una declaración jurada simple firmada únicamente por el usuario solicitante."
        ],
        correct: 1,
        explanation: "El Certificado de Instalación Eléctrica Apta (CIEA) firmado por un Electricista Habilitado registrado en ERSeP es el requisito indispensable para dar el alta del servicio."
    },
    {
        id: 3,
        category: "ERSeP - Categorías",
        question: "¿Qué instalaciones está facultado a certificar un Electricista Habilitado Categoría III según el ERSeP?",
        options: [
            "Instalaciones industriales complejas de media y alta tensión sin límite de potencia.",
            "Instalaciones domiciliarias, comerciales o de servicios en baja tensión de hasta 10 kW de demanda máxima.",
            "Únicamente redes aéreas de distribución pública de la distribuidora EPEC.",
            "Solamente tableros de transferencia automática para grupos electrógenos."
        ],
        correct: 1,
        explanation: "La Categoría III (Idóneos Habilitados) abarca instalaciones de Baja Tensión en inmuebles residenciales o comerciales de baja complejidad hasta 10 kW."
    },
    {
        id: 4,
        category: "Ley 10281 / Responsabilidad",
        question: "Según la Ley 10281, ¿quién es el responsable legal directo del mantenimiento y estado de seguridad de las instalaciones eléctricas internas de un inmueble una vez habilitado?",
        options: [
            "El ERSeP exclusivamente.",
            "La empresa distribuidora de energía (ej. EPEC o Cooperativa).",
            "El propietario, tenedor u ocupante del inmueble.",
            "El municipio de la localidad."
        ],
        correct: 2,
        explanation: "La Ley establece que el propietario o poseedor del inmueble guarda la obligación de mantener la instalación en condiciones de seguridad."
    },
    {
        id: 5,
        category: "ERSeP - CIEA",
        question: "¿Qué vigencia tiene un Certificado de Instalación Eléctrica Apta (CIEA) para un suministro transitorio (ej. obra)?",
        options: [
            "6 meses, renovable.",
            "1 año.",
            "2 años.",
            "Es definitivo y no tiene vencimiento."
        ],
        correct: 1,
        explanation: "Para suministros transitorios, el CIEA suele tener una vigencia de 1 año, pudiendo requerirse renovación si la obra continúa."
    },
    {
        id: 6,
        category: "Ley 10281 Córdoba",
        question: "¿A qué tipo de instalaciones aplica la Ley 10281?",
        options: [
            "Solo a instalaciones nuevas.",
            "Solo a instalaciones industriales.",
            "A instalaciones nuevas y existentes públicas o privadas.",
            "Solo a instalaciones de alumbrado público."
        ],
        correct: 2,
        explanation: "La ley exige adecuación y seguridad tanto para instalaciones nuevas como para las ya existentes que requieran trámites o modificaciones."
    },
    {
        id: 7,
        category: "ERSeP - Categorías",
        question: "¿Un Instalador Categoría III puede certificar una instalación trifásica?",
        options: [
            "No, solo puede certificar instalaciones monofásicas.",
            "Sí, siempre que la potencia total no supere los 10 kW en baja tensión.",
            "Sí, pero solo si es para uso exclusivamente industrial.",
            "No, las instalaciones trifásicas son exclusivas de la Categoría I."
        ],
        correct: 1,
        explanation: "La restricción de la Categoría III es la potencia (hasta 10 kW) y la tensión (Baja Tensión), no la cantidad de fases."
    },
    {
        id: 8,
        category: "ERSeP - Registro",
        question: "¿Qué organismo lleva el Registro de Instaladores Electricistas Habilitados en la Provincia de Córdoba?",
        options: [
            "EPEC (Empresa Provincial de Energía de Córdoba)",
            "ERSeP (Ente Regulador de los Servicios Públicos)",
            "El Ministerio de Trabajo",
            "El Colegio de Ingenieros Civiles"
        ],
        correct: 1,
        explanation: "El ERSeP es la autoridad de aplicación de la Ley 10281 y quien administra el registro oficial de instaladores."
    },
    {
        id: 9,
        category: "Ley 10281 / Infracciones",
        question: "¿Qué sucede si se detecta que un Instalador Habilitado emite un CIEA con datos falsos?",
        options: [
            "Solo se le cobra una multa económica a la distribuidora.",
            "El ERSeP puede aplicar sanciones, incluyendo la suspensión o exclusión del registro.",
            "No sucede nada, es responsabilidad del propietario.",
            "Se le obliga a rehacer el plano en 24 horas."
        ],
        correct: 1,
        explanation: "La falsedad en el CIEA es una falta grave que conlleva sanciones administrativas por parte del ERSeP, incluyendo la inhabilitación."
    },
    {
        id: 10,
        category: "ERSeP - Categorías",
        question: "¿A qué profesionales abarca la Categoría I del registro del ERSeP?",
        options: [
            "Profesionales con título de grado (Ingenieros) con incumbencias en materia eléctrica.",
            "Técnicos electromecánicos con título secundario.",
            "Idóneos capacitados por cursos oficiales.",
            "Arquitectos sin especialización eléctrica."
        ],
        correct: 0,
        explanation: "La Categoría I está reservada para profesionales con título de grado universitario (ej. Ingenieros Electricistas/Electromecánicos) y matriculados en sus respectivos colegios."
    },

    // AEA 90364 - PROTECCIONES & ESQUEMAS
    {
        id: 11,
        category: "AEA 90364 - Protecciones",
        question: "Según la reglamentación AEA 90364-7-771, ¿cuál es la sensibilidad máxima autorizada para el Interruptor Diferencial (ID) en protección contra contactos indirectos en circuitos de tomacorrientes residenciales?",
        options: [
            "300 mA",
            "100 mA",
            "30 mA",
            "10 mA"
        ],
        correct: 2,
        explanation: "La norma AEA 90364 exige alta sensibilidad (IΔn ≤ 30 mA) para la protección de personas contra contactos directos e indirectos en viviendas y oficinas."
    },
    {
        id: 12,
        category: "AEA 90364 - Esquemas de Tierra",
        question: "En el esquema de conexión a tierra TT exigido por AEA en redes de distribución pública de baja tensión, ¿cómo se vinculan las masas de la instalación?",
        options: [
            "Se conectan directamente al neutro de la red de la distribuidora.",
            "Se conectan a un electrodo de puesta a tierra (jabalina) propio e independiente del neutro de la red.",
            "Quedan completamente aisladas sin conexión a tierra.",
            "Se conectan a la cañería metálica de agua corriente municipal."
        ],
        correct: 1,
        explanation: "El esquema TT requiere una puesta a tierra propia local en la instalación, independiente del punto neutro del transformador de la distribuidora."
    },
    {
        id: 13,
        category: "Protecciones",
        question: "¿Cuál es la función principal de una Llave Termomagnética (PIA) en un tablero eléctrico?",
        options: [
            "Proteger a las personas contra choques eléctricos por fuga a tierra.",
            "Proteger las líneas de los conductores contra sobrecargas y cortocircuitos.",
            "Medir el consumo de energía en kilovatios-hora.",
            "Mejorar el factor de potencia cos φ de la instalación."
        ],
        correct: 1,
        explanation: "Las termomagnéticas actúan por efecto térmico (sobrecargas prolongadas) y magnético (cortocircuitos) para preservar la integridad de los conductores."
    },
    {
        id: 14,
        category: "AEA 90364 - Protecciones",
        question: "¿Qué parámetro de un interruptor termomagnético indica la corriente máxima de cortocircuito que puede interrumpir sin destruirse?",
        options: [
            "Corriente nominal (In)",
            "Tensión nominal (Vn)",
            "Capacidad de ruptura (Icn)",
            "Corriente diferencial (IΔn)"
        ],
        correct: 2,
        explanation: "La capacidad de ruptura (ej. 3000A, 4500A, 6000A) es el máximo valor eficaz de corriente de cortocircuito presunta que el dispositivo puede despejar."
    },
    {
        id: 15,
        category: "AEA 90364 - Puesta a Tierra",
        question: "¿Cuál es el valor máximo de resistencia de puesta a tierra recomendado por AEA para un esquema TT con diferencial de 30 mA, para asegurar que la tensión de contacto no supere los 24V?",
        options: [
            "5 Ohms",
            "10 Ohms",
            "40 Ohms",
            "800 Ohms"
        ],
        correct: 2,
        explanation: "Para locales secos/húmedos (tensión límite 24V), Ra = 24V / 0.03A = 800 Ohms, pero AEA suele recomendar valores prácticos menores (ej. 40 Ohms) para garantizar operación."
    },
    {
        id: 16,
        category: "AEA 90364 - Tableros",
        question: "¿Qué elemento es obligatorio como corte general en el Tablero Principal (TP) de una vivienda según AEA 771?",
        options: [
            "Un seccionador fusible.",
            "Un interruptor automático (termomagnético) o interruptor seccionador que corte todos los conductores activos, incluido el neutro.",
            "Un contactor operado a distancia.",
            "Un interruptor unipolar en la fase."
        ],
        correct: 1,
        explanation: "El corte general debe ser bipolar (en monofásica) o tetrapolar (en trifásica), interrumpiendo simultáneamente fases y neutro."
    },
    {
        id: 17,
        category: "AEA 90364 - Protecciones",
        question: "En una curva de disparo tipo 'C' de una termomagnética, ¿en qué rango de veces la corriente nominal (In) actúa el disparo magnético (cortocircuito)?",
        options: [
            "Entre 3 y 5 veces In.",
            "Entre 5 y 10 veces In.",
            "Entre 10 y 20 veces In.",
            "A más de 50 veces In."
        ],
        correct: 1,
        explanation: "La curva C es estándar para usos generales y actúa magnéticamente entre 5 y 10 veces la In."
    },
    {
        id: 18,
        category: "AEA 90364 - Protecciones",
        question: "¿Se permite colocar en paralelo dos termomagnéticas unipolares para sumar sus corrientes nominales y proteger un cable de mayor sección?",
        options: [
            "Sí, siempre que sean de la misma marca y curva.",
            "Sí, pero solo en circuitos de iluminación.",
            "No, está expresamente prohibido por la reglamentación.",
            "Solo si el ERSeP lo autoriza por escrito."
        ],
        correct: 2,
        explanation: "No se pueden poner en paralelo dispositivos de protección para aumentar la capacidad, ya que no se garantiza el reparto equitativo de corriente."
    },
    {
        id: 19,
        category: "AEA 90364 - Tableros",
        question: "En un tablero eléctrico con frente muerto, ¿qué grado de protección mínimo contra penetración de objetos sólidos y agua (IP) se exige para la envolvente (tapa cerrada)?",
        options: [
            "IP20",
            "IP40",
            "IP54",
            "IP65"
        ],
        correct: 1,
        explanation: "Para interiores, se exige generalmente un IP mínimo de 40 para tableros con la puerta cerrada."
    },
    {
        id: 20,
        category: "AEA 90364 - Protecciones",
        question: "¿Qué prueba periódica indica el fabricante y recomienda AEA para verificar el mecanismo del Interruptor Diferencial?",
        options: [
            "Someterlo a un cortocircuito provocado una vez al año.",
            "Presionar el botón de test (T) periódicamente (ej. mensualmente).",
            "Medir su temperatura con cámara termográfica.",
            "Limpiarlo internamente con alcohol isopropílico."
        ],
        correct: 1,
        explanation: "El botón de test simula una fuga de corriente calibrada para verificar que el mecanismo de disparo electromecánico funciona correctamente."
    },

    // AEA 90364 - CONDUCTORES & CANALIZACIONES
    {
        id: 21,
        category: "AEA 90364 - Conductores",
        question: "¿Cuál es la sección mínima normada por AEA 771 para el conductor de protección (PE) o Puesta a Tierra en un circuito seccional residencias?",
        options: [
            "1,0 mm²",
            "1,5 mm²",
            "2,5 mm²",
            "4,0 mm²"
        ],
        correct: 2,
        explanation: "La sección mínima permitida por AEA para conductores de línea en tomacorrientes y para el conductor de protección PE en esos circuitos es de 2,5 mm²."
    },
    {
        id: 22,
        category: "AEA 90364 - Colores de Cables",
        question: "Según la norma IRAM / AEA, ¿cuál es el código de colores estandarizado para los conductores en instalaciones monofásicas?",
        options: [
            "Fase: Marrón/Negro/Rojo | Neutro: Celeste | Protección PE: Verde-Amarillo",
            "Fase: Verde | Neutro: Blanco | Protección PE: Rojo",
            "Fase: Celeste | Neutro: Marrón | Protección PE: Negro",
            "Fase: Azul | Neutro: Amarillo | Protección PE: Gris"
        ],
        correct: 0,
        explanation: "El reglamento exige Neutro exclusivamente Celeste, Protección PE exclusivamente Verde/Amarillo, y Fase en Marrón, Negro o Rojo."
    },
    {
        id: 23,
        category: "AEA 90364 - Conductores",
        question: "¿Qué sección mínima exige la AEA para los conductores de línea en un circuito de Iluminación de Uso General (IUG)?",
        options: [
            "1,0 mm²",
            "1,5 mm²",
            "2,5 mm²",
            "4,0 mm²"
        ],
        correct: 1,
        explanation: "Para circuitos de iluminación general (IUG), la sección mínima permitida para fase, neutro y retorno es de 1,5 mm²."
    },
    {
        id: 24,
        category: "AEA 90364 - Canalizaciones",
        question: "En una cañería embutida, ¿cuál es el porcentaje máximo de ocupación permitido por la sección total de los conductores respecto al área interna del caño?",
        options: [
            "25%",
            "35%",
            "50%",
            "75%"
        ],
        correct: 1,
        explanation: "La suma de las secciones totales (incluyendo aislación) de los conductores no debe superar el 35% de la sección interna de la cañería para facilitar el tiraje y disipación térmica."
    },
    {
        id: 25,
        category: "AEA 90364 - Conductores",
        question: "¿Está permitido utilizar conductores tipo 'Taller' (TPR flexible con envoltura) embutidos dentro de cañerías en instalaciones fijas?",
        options: [
            "Sí, porque tienen doble aislación.",
            "Sí, pero solo para circuitos de iluminación.",
            "No, están diseñados para conexiones móviles o aparatos portátiles.",
            "Solo si la cañería es de metal rígido."
        ],
        correct: 2,
        explanation: "Los cables tipo taller no cumplen con los ensayos de no propagación de incendio requeridos para instalaciones fijas embutidas (se usan cables norma IRAM 247-3)."
    },
    {
        id: 26,
        category: "AEA 90364 - Empalmes",
        question: "¿Dónde está permitido realizar empalmes de conductores en una instalación domiciliaria?",
        options: [
            "Dentro de los tramos de cañería para ahorrar cable.",
            "Exclusivamente dentro de las cajas de paso, derivación o de conexión de artefactos.",
            "En cualquier lugar siempre que se use cinta aisladora homologada.",
            "No se permiten empalmes en baja tensión."
        ],
        correct: 1,
        explanation: "Todos los empalmes o derivaciones deben realizarse indefectiblemente dentro de cajas (de paso, de llaves o tomacorrientes), quedando accesibles."
    },
    {
        id: 27,
        category: "AEA 90364 - Conductores",
        question: "Si en un circuito monofásico la fase es de 4 mm², ¿qué sección mínima debe tener el conductor de Protección (PE)?",
        options: [
            "1,5 mm²",
            "2,5 mm²",
            "4,0 mm²",
            "6,0 mm²"
        ],
        correct: 2,
        explanation: "Hasta 16 mm², la sección del conductor de protección PE debe ser igual a la sección de los conductores de fase del circuito."
    },
    {
        id: 28,
        category: "AEA 90364 - Canalizaciones",
        question: "¿Se permite instalar conductores de corrientes débiles (telefonía, datos, TV) en la misma cañería que los conductores de baja tensión (220V)?",
        options: [
            "Sí, siempre que los cables de datos tengan buena aislación.",
            "Sí, pero solo si el recorrido es menor a 5 metros.",
            "No, deben ir por canalizaciones y cajas separadas e independientes.",
            "Solo si se envuelven con cinta aisladora especial."
        ],
        correct: 2,
        explanation: "Para evitar interferencias electromagnéticas y riesgos de contacto accidental, las canalizaciones de baja tensión y muy baja tensión (señales/datos) deben estar separadas."
    },
    {
        id: 29,
        category: "AEA 90364 - Conductores",
        question: "El conductor Neutro en una instalación trifásica con cargas desequilibradas, ¿puede tener menor sección que los conductores de fase?",
        options: [
            "Sí, siempre puede ser la mitad de la sección de fase.",
            "No, generalmente debe tener la misma sección que las fases, especialmente si hay presencia de armónicos.",
            "No es necesario instalar neutro si hay cargas desequilibradas.",
            "Puede ser de cualquier sección mientras sea celeste."
        ],
        correct: 1,
        explanation: "En presencia de cargas desequilibradas y especialmente armónicos (luces LED, fuentes conmutadas), el neutro puede cargar corrientes importantes, por lo que no se permite reducir su sección sin estudio previo."
    },
    {
        id: 30,
        category: "AEA 90364 - Canalizaciones",
        question: "Al utilizar bandejas portacables (canales portacables), ¿qué tipo de conductor es obligatorio utilizar?",
        options: [
            "Conductores unipolares tipo IRAM 247-3 (tipo VN).",
            "Conductores con envoltura de protección tipo IRAM 2178 (tipo subterráneo).",
            "Cables coaxiles.",
            "Cables de aluminio desnudo."
        ],
        correct: 1,
        explanation: "Sobre bandejas portacables se exige usar cables con aislación y envoltura de protección (doble aislación), como los cables IRAM 2178 (Sintenax/Subterráneo)."
    },

    // AEA 90364 - CIRCUITOS, BOCAS Y CAÍDA DE TENSIÓN
    {
        id: 31,
        category: "AEA 90364 - Circuitos",
        question: "¿Cuál es la cantidad máxima de bocas de salida permitida por la norma AEA 771 para un Circuito de Usos Generales (IUG o TUG)?",
        options: [
            "10 bocas",
            "15 bocas",
            "20 bocas",
            "Sin límite de bocas"
        ],
        correct: 1,
        explanation: "Los circuitos de uso general (tanto Iluminación IUG como Tomacorrientes TUG) pueden alimentar un máximo de 15 bocas de salida por circuito."
    },
    {
        id: 32,
        category: "AEA 90364 - Caída de Tensión",
        question: "¿Cuál es el límite máximo admisible de caída de tensión desde el origen de la instalación (medidor) hasta el punto de utilización más desfavorable para circuitos de alumbrado según AEA?",
        options: [
            "1 %",
            "3 %",
            "5 %",
            "10 %"
        ],
        correct: 1,
        explanation: "AEA establece un límite máximo del 3% para alumbrado y 5% para motores/fuerza motriz durante la operación normal."
    },
    {
        id: 33,
        category: "AEA 90364 - Baños",
        question: "En el baño de una vivienda, ¿qué norma de seguridad aplica AEA respecto a la instalación de llaves o tomacorrientes dentro de la Zona 1 (volumen sobre la bañera/ducha)?",
        options: [
            "Se permiten tomacorrientes comunes siempre que tengan tapa estanca IP54.",
            "Está totalmente prohibida la instalación de aparatos de maniobra, llaves e interruptores en la Zona 1.",
            "Se permiten interrupteores si funcionan a 220V con protección diferencial.",
            "Se pueden colocar tomacorrientes a más de 30 cm del suelo."
        ],
        correct: 1,
        explanation: "La Zona 0 y Zona 1 de los cuartos de baño son volúmenes de muy alto riesgo donde no se permite instalar mecanismos de maniobra ni tomacorrientes ordinarios."
    },
    {
        id: 34,
        category: "AEA 90364 - Circuitos",
        question: "¿Cuál es la demanda de potencia máxima simultánea que se le asigna por reglamento a un circuito de Tomacorrientes de Uso General (TUG)?",
        options: [
            "1100 VA",
            "1500 VA",
            "2200 VA",
            "3300 VA"
        ],
        correct: 2,
        explanation: "Para el cálculo de demanda (Grado de Electrificación), a un circuito TUG se le asigna convencionalmente 2200 VA."
    },
    {
        id: 35,
        category: "AEA 90364 - Circuitos",
        question: "Un tomacorriente que alimenta un aire acondicionado fijo de 18 Amperes, ¿a qué tipo de circuito debe conectarse?",
        options: [
            "Circuito de Tomacorrientes de Uso General (TUG).",
            "Circuito de Iluminación de Uso Especial (IUE).",
            "Circuito de Tomacorrientes de Uso Especial (TUE) o de Uso Específico (ACU).",
            "A la línea de acometida directamente."
        ],
        correct: 2,
        explanation: "Cargas de más de 10A o fijas de gran consumo requieren circuitos especiales (TUE) con tomacorrientes de 20A, o circuitos de conexión directa específicos."
    },
    {
        id: 36,
        category: "AEA 90364 - Bocas",
        question: "En una caja rectangular de 5x10 cm, ¿cuántos módulos de tomacorrientes 10A se pueden instalar como máximo según la norma?",
        options: [
            "Un solo módulo.",
            "Dos módulos (o un módulo doble).",
            "Tres módulos individuales.",
            "Cuatro módulos si la caja es profunda."
        ],
        correct: 1,
        explanation: "Por razones de espacio y disipación térmica de los cables de 2.5mm², se permite un máximo de 2 tomacorrientes por caja rectangular convencional."
    },
    {
        id: 37,
        category: "AEA 90364 - Grado de Electrificación",
        question: "El 'Grado de Electrificación' de un inmueble según AEA se determina principalmente en base a:",
        options: [
            "La cantidad de personas que habitan la vivienda.",
            "La superficie 'Límite de Aplicación' (superficie cubierta + 50% de la semicubierta).",
            "El presupuesto de la obra.",
            "La distancia al centro de transformación de EPEC."
        ],
        correct: 1,
        explanation: "El Grado de Electrificación (Mínimo, Medio, Elevado, Superior) se define inicialmente por la superficie calculada del inmueble."
    },
    {
        id: 38,
        category: "AEA 90364 - Circuitos",
        question: "Para un Grado de Electrificación 'Medio', ¿cuántos circuitos mínimos exige la reglamentación?",
        options: [
            "1 circuito (TUG mixto).",
            "2 circuitos (1 IUG + 1 TUG).",
            "3 circuitos (ej. 2 IUG + 1 TUG o viceversa).",
            "5 circuitos como mínimo."
        ],
        correct: 2,
        explanation: "El grado Medio exige un mínimo de 3 circuitos (por ejemplo, dos de iluminación y uno de tomas, o uno de iluminación y dos de tomas)."
    },
    {
        id: 39,
        category: "AEA 90364 - Baños",
        question: "Un termotanque eléctrico instalado en el cuarto de baño, ¿qué condición debe cumplir respecto a su conexión?",
        options: [
            "Debe conectarse con ficha y tomacorriente común de 10A dentro de la Zona 1.",
            "Debe tener conexión fija, estar fuera de Zona 0 y 1, y protegido diferencialmente.",
            "No se permiten termotanques eléctricos en baños bajo ninguna circunstancia.",
            "Puede conectarse al circuito de iluminación para ahorrar cables."
        ],
        correct: 1,
        explanation: "Los calentadores de agua en baños deben tener instalación fija, ubicarse en zonas permitidas (ej. Zona 3) y contar con protección diferencial de 30mA."
    },
    {
        id: 40,
        category: "AEA 90364 - Bocas",
        question: "¿A qué altura aproximada se recomienda instalar los tomacorrientes de uso general sobre el nivel del piso terminado (NPT)?",
        options: [
            "A 10 cm del suelo.",
            "Entre 30 cm y 90 cm del NPT.",
            "A 2,50 metros de altura.",
            "En el cielorraso."
        ],
        correct: 1,
        explanation: "La norma recomienda instalar las cajas de tomacorrientes a una altura segura y accesible, típicamente entre 0,30 m y 0,90 m."
    },

    // ELECTROTECNIA Y CÁLCULOS
    {
        id: 41,
        category: "Electrotecnia",
        question: "¿Qué valor de corriente circulará por un artefacto calefactor resistivo de 2200 W conectado a una red monofásica de 220 V (cos φ = 1)?",
        options: [
            "5 A",
            "10 A",
            "15 A",
            "22 A"
        ],
        correct: 1,
        explanation: "Aplicando I = P / (V × cos φ) -> I = 2200 W / (220 V × 1) = 10 Amperes."
    },
    {
        id: 42,
        category: "Electrotecnia",
        question: "Si se conectan dos resistencias idénticas de 10 Ohms en paralelo, ¿cuál es la resistencia equivalente del circuito?",
        options: [
            "20 Ohms",
            "10 Ohms",
            "5 Ohms",
            "2,5 Ohms"
        ],
        correct: 2,
        explanation: "En paralelo, Req = (R1 × R2) / (R1 + R2) = (10 × 10) / (10 + 10) = 100 / 20 = 5 Ohms."
    },
    {
        id: 43,
        category: "Electrotecnia",
        question: "Según la Ley de Ohm, si la resistencia de un circuito se mantiene constante y la tensión aplicada se duplica, ¿qué ocurre con la corriente?",
        options: [
            "Se reduce a la mitad.",
            "Se mantiene igual.",
            "Se duplica.",
            "Se cuadruplica."
        ],
        correct: 2,
        explanation: "I = V / R. Si V se multiplica por 2 (y R es constante), I también se multiplica por 2 (son directamente proporcionales)."
    },
    {
        id: 44,
        category: "Electrotecnia",
        question: "¿Qué unidad se utiliza para medir la Potencia Activa en un circuito de corriente alterna?",
        options: [
            "Volt-Amper (VA)",
            "Watt (W)",
            "Volt-Amper Reactivo (VAr)",
            "Joule (J)"
        ],
        correct: 1,
        explanation: "La Potencia Activa (la que realmente realiza trabajo útil, como calor o movimiento) se mide en Watts (W) o Kilowatts (kW)."
    },
    {
        id: 45,
        category: "Electrotecnia",
        question: "En un sistema trifásico tetrafilar (3 fases + neutro) de 380V/220V, ¿qué tensión se mide entre dos fases cualesquiera (ej. R y S)?",
        options: [
            "220 V",
            "380 V (o 400 V nominal)",
            "110 V",
            "0 V"
        ],
        correct: 1,
        explanation: "La tensión entre dos fases (tensión de línea) en este sistema es de 380V (o 400V según estándar actual). 220V es la tensión de fase (entre fase y neutro)."
    },
    {
        id: 46,
        category: "Electrotecnia",
        question: "Si un motor monofásico consume 10A a 220V, pero su factor de potencia (cos φ) es 0.8, ¿cuál es su Potencia Activa consumida?",
        options: [
            "2200 W",
            "1760 W",
            "2750 W",
            "1000 W"
        ],
        correct: 1,
        explanation: "P = V × I × cos φ = 220V × 10A × 0.8 = 1760 Watts."
    },
    {
        id: 47,
        category: "Electrotecnia",
        question: "¿Qué instrumento se utiliza para medir la resistencia de aislación de los conductores en una instalación eléctrica?",
        options: [
            "Pinza amperométrica",
            "Telurímetro",
            "Megóhmetro (Megger)",
            "Luxómetro"
        ],
        correct: 2,
        explanation: "El Megóhmetro aplica una tensión continua elevada (ej. 500V) para medir fugas en la aislación de los cables."
    },
    {
        id: 48,
        category: "Electrotecnia",
        question: "¿Qué mide un Telurímetro?",
        options: [
            "El consumo de energía en kWh.",
            "La resistencia de puesta a tierra del electrodo (jabalina).",
            "La temperatura de los cables.",
            "La frecuencia de la red (Hz)."
        ],
        correct: 1,
        explanation: "El Telurímetro es el instrumento específico para medir el valor resistivo (en Ohms) de los sistemas de puesta a tierra."
    },
    {
        id: 49,
        category: "AEA 95705 - Acometidas",
        question: "¿Qué altura mínima sobre el nivel de vereda debe respetar la pipeta de entrada de la línea de acometida aérea según las especificaciones técnicas de EPEC / AEA?",
        options: [
            "1,80 metros",
            "2,50 metros",
            "4,00 metros",
            "5,50 metros"
        ],
        correct: 2,
        explanation: "Las pautas de acometidas aéreas exigen que la cañería de bajada y pipeta de entrada mantengan alturas de seguridad reglamentarias, generalmente de 4,00 m para evitar contactos con vehículos o peatones."
    },
    {
        id: 50,
        category: "AEA 95705 - Acometidas",
        question: "El caño de bajada galvanizado o pilar premoldeado que soporta la acometida, ¿debe estar conectado a tierra?",
        options: [
            "Sí, es obligatorio vincular las partes metálicas de la acometida a una jabalina específica de la prestataria.",
            "No, la aislación del cable de acometida es suficiente.",
            "Solo si el cliente lo solicita.",
            "Se conecta al neutro de la instalación interna."
        ],
        correct: 0,
        explanation: "Las envolventes metálicas y caños de bajada del pilar de medición deben poseer una puesta a tierra de protección propia (independiente de la del usuario en TT) según las normativas de las distribuidoras."
    }
];

// ============================================================================
// LÓGICA DE SELECCIÓN SIN REPETICIÓN Y MANEJO DEL ESTADO
// ============================================================================
const QUESTIONS_PER_ROUND = 10;
let usedIndices = new Set();
let currentRoundQuestions = [];

// Cargar historial de sesión si existe
function loadSession() {
    const stored = sessionStorage.getItem('usedQuestionIndices');
    if (stored) {
        usedIndices = new Set(JSON.parse(stored));
    }
    updateStats();
}

function saveSession() {
    sessionStorage.setItem('usedQuestionIndices', JSON.stringify(Array.from(usedIndices)));
}

function updateStats() {
    const total = masterQuestionBank.length;
    const answered = usedIndices.size;
    const remaining = total - answered;

    document.getElementById('total-questions-count').innerText = total;
    document.getElementById('answered-count').innerText = answered;
    document.getElementById('remaining-count').innerText = remaining;
}

// Algoritmo de selección aleatoria sin repetición
function getNextQuestions(count) {
    // Filtrar preguntas no utilizadas
    const available = masterQuestionBank.filter((_, index) => !usedIndices.has(index));

    if (available.length === 0) {
        alert("¡Has completado todas las preguntas disponibles en el banco de datos! El historial se reiniciará para continuar practicando.");
        usedIndices.clear();
        saveSession();
        return getNextQuestions(count);
    }

    // Mezclar el array de disponibles (Algoritmo Fisher-Yates)
    const shuffled = [...available];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Seleccionar hasta 'count' preguntas
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    // Registrar sus índices globales como usados
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
    document.getElementById('score-banner').style.display = 'none';
    document.getElementById('btn-submit').style.display = 'inline-flex';
    document.getElementById('btn-next').style.display = 'none';

    currentRoundQuestions = getNextQuestions(QUESTIONS_PER_ROUND);

    currentRoundQuestions.forEach((q, qIndex) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.id = `q-card-${qIndex}`;

        let optionsHTML = '';
        q.options.forEach((opt, optIndex) => {
            optionsHTML += `
                <li class="option-item">
                    <input type="radio" 
                           name="question_${qIndex}" 
                           id="q_${qIndex}_opt_${optIndex}" 
                           value="${optIndex}" 
                           class="option-input">
                    <label for="q_${qIndex}_opt_${optIndex}" class="option-label" id="label_${qIndex}_${optIndex}">
                        <span class="custom-radio"></span>
                        <span>${opt}</span>
                    </label>
                </li>
            `;
        });

        card.innerHTML = `
            <div class="question-header">
                <span class="question-number">Pregunta ${qIndex + 1} de ${currentRoundQuestions.length}</span>
                <span class="question-category">${q.category}</span>
            </div>
            <div class="question-title">${q.question}</div>
            <ul class="options-list">
                ${optionsHTML}
            </ul>
            <div class="explanation-box" id="explanation-${qIndex}">
                <strong>💡 Fundamentación Técnica / Reglamentaria:</strong><br>
                ${q.explanation}
            </div>
        `;

        container.appendChild(card);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function evaluateQuiz() {
    let score = 0;
    let unanswered = 0;

    currentRoundQuestions.forEach((q, qIndex) => {
        const selected = document.querySelector(`input[name="question_${qIndex}"]:checked`);
        const card = document.getElementById(`q-card-${qIndex}`);
        card.classList.add('evaluated');

        const expBox = document.getElementById(`explanation-${qIndex}`);
        expBox.style.display = 'block';

        if (!selected) {
            unanswered++;
        }

        q.options.forEach((_, optIndex) => {
            const label = document.getElementById(`label_${qIndex}_${optIndex}`);
            const input = document.getElementById(`q_${qIndex}_opt_${optIndex}`);
            input.disabled = true;

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

    const total = currentRoundQuestions.length;
    const percentage = (score / total) * 100;

    scoreText.innerText = `${score} / ${total} (${percentage}%)`;

    if (percentage >= 80) {
        feedback.innerText = "🎉 ¡Excelente nivel! Demuestras un dominio alto de las reglamentaciones y electrotecnia.";
        feedback.style.color = "#4ade80";
    } else if (percentage >= 60) {
        feedback.innerText = "👍 Buen resultado. Revisa la fundamentación de las preguntas falladas para reforzar.";
        feedback.style.color = "#facc15";
    } else {
        feedback.innerText = "⚠️ Se recomienda repasar los artículos de la Ley 10281 y las secciones de AEA 90364.";
        feedback.style.color = "#f87171";
    }

    banner.style.display = 'block';
    document.getElementById('btn-submit').style.display = 'none';
    document.getElementById('btn-next').style.display = 'inline-flex';

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function nextRound() {
    renderQuiz();
}

function resetHistory() {
    if (confirm("¿Deseas reiniciar el historial de preguntas respondidas? Volverás a poder ver todas las preguntas desde el inicio.")) {
        usedIndices.clear();
        sessionStorage.removeItem('usedQuestionIndices');
        updateStats();
        renderQuiz();
    }
}

// Inicializar al cargar la página
window.onload = function() {
    loadSession();
    renderQuiz();
};
