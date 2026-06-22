/* ============================================
   RECYCLUM - SCRIPT PRINCIPAL
   ============================================ */

$(document).ready(function() {

    // ==========================================
    // 1. PRELOADER
    // ==========================================
    const preloader = $('#preloader');
    // Simular tiempo de carga (2.5s) y ocultar
    setTimeout(function() {
        preloader.addClass('hidden');
    }, 2800); // Coincide con la animación de la barra

    // ==========================================
    // 2. MENÚ (Estilo CodePen adaptado)
    // ==========================================
    const menuTrigger = $('#menuTrigger');
    const menuBars = menuTrigger.find('.menu-trigger-bar');
    const menu = $('#mainMenu');
    const menuBg = $('.menu-bg');

    function toggleMenu() {
        menuBars.toggleClass('active');
        menu.toggleClass('open');
        menuBg.toggleClass('open');
        // Bloquear scroll cuando el menú está abierto
        $('body').toggleClass('menu-open');
    }

    menuTrigger.on('click', toggleMenu);

    // Cerrar menú al hacer clic en un enlace
    menu.find('a').on('click', function() {
        if (menu.hasClass('open')) {
            toggleMenu();
        }
    });

    // Cerrar menú al hacer clic fuera (en el fondo)
    menuBg.on('click', function() {
        if (menu.hasClass('open')) {
            toggleMenu();
        }
    });

    // ==========================================
    // 3. CARGA DE DATOS (JSON)
    // ==========================================
    let centrosData = [];
    let filteredData = [];
    let currentFilter = 'todos';

    // Ruta al archivo JSON (ajusta si es necesario)
    const JSON_URL = 'data/centros-reciclaje.json';

    function loadCentros() {
        $('#resultsContainer').html('<div class="loading-results"><i class="fas fa-spinner fa-spin"></i> Cargando centros...</div>');

        $.getJSON(JSON_URL)
            .done(function(data) {
                centrosData = data;
                filteredData = [...centrosData];
                renderResults(filteredData);
                updateResultCount(filteredData.length);
            })
            .fail(function() {
                // Fallback: si no se puede cargar el JSON, usar datos de ejemplo
                console.warn('No se pudo cargar el JSON. Usando datos de ejemplo.');
                centrosData = getFallbackData();
                filteredData = [...centrosData];
                renderResults(filteredData);
                updateResultCount(filteredData.length);
            });
    }

    // Datos de ejemplo (fallback)
    function getFallbackData() {
        return [
            {
                id: 1,
                nombre: "Centro de Reciclaje Centro",
                direccion: "Av. 5 de Febrero 123, Col. Centro",
                colonia: "Centro",
                cp: "76000",
                telefono: "442 123 4567",
                materiales: ["papel", "cartón", "plástico"],
                lat: 20.5888,
                lng: -100.3898
            },
            {
                id: 2,
                nombre: "EcoRecicla Jurica",
                direccion: "Paseo de la República 456, Jurica",
                colonia: "Jurica",
                cp: "76100",
                telefono: "442 987 6543",
                materiales: ["vidrio", "plástico", "metal"],
                lat: 20.6819,
                lng: -100.4463
            },
            {
                id: 3,
                nombre: "Reciclados El Marqués",
                direccion: "Carretera a Tlacote 789, El Marqués",
                colonia: "El Marqués",
                cp: "76240",
                telefono: "442 456 7890",
                materiales: ["electrónico", "pilas", "plástico"],
                lat: 20.6265,
                lng: -100.2738
            },
            {
                id: 4,
                nombre: "Punto Verde Alamos",
                direccion: "Calle Álamos 222, Col. Álamos",
                colonia: "Álamos",
                cp: "76148",
                telefono: "442 234 5678",
                materiales: ["orgánico", "papel", "cartón"],
                lat: 20.6173,
                lng: -100.3805
            },
            {
                id: 5,
                nombre: "ReciclaTec",
                direccion: "Blvd. Bernardo Quintana 1500, Col. Carretas",
                colonia: "Carretas",
                cp: "76020",
                telefono: "442 345 6789",
                materiales: ["plástico", "electrónico", "metal"],
                lat: 20.5961,
                lng: -100.4063
            }
        ];
    }

    // ==========================================
    // 4. RENDERIZADO DE RESULTADOS
    // ==========================================
    function renderResults(data) {
        const container = $('#resultsContainer');
        const noResults = $('#noResults');

        if (data.length === 0) {
            container.html('');
            noResults.show();
            updateResultCount(0);
            return;
        }

        noResults.hide();
        let html = '';
        data.forEach(item => {
            const materiales = item.materiales.map(m =>
                `<span class="badge">${m}</span>`
            ).join('');

            html += `
                <div class="result-card" data-id="${item.id}">
                    <h4>${item.nombre}</h4>
                    <p class="address"><i class="fas fa-map-pin" style="color: #4caf50;"></i> ${item.direccion}</p>
                    <p><i class="fas fa-phone" style="color: #4caf50;"></i> ${item.telefono || 'No disponible'}</p>
                    <p><i class="fas fa-tag" style="color: #4caf50;"></i> Colonia: ${item.colonia} (CP ${item.cp})</p>
                    <div style="margin-top: 10px;">${materiales}</div>
                </div>
            `;
        });

        container.html(html);
        updateResultCount(data.length);
    }

    function updateResultCount(count) {
        $('#resultCount').text(`(${count})`);
    }

    // ==========================================
    // 5. BÚSQUEDA Y FILTROS
    // ==========================================
    function searchCentros(query) {
        const searchTerm = query.trim().toLowerCase();
        if (searchTerm === '') {
            filteredData = [...centrosData];
        } else {
            filteredData = centrosData.filter(item => {
                const colonia = item.colonia.toLowerCase();
                const cp = item.cp;
                const nombre = item.nombre.toLowerCase();
                const direccion = item.direccion.toLowerCase();
                return colonia.includes(searchTerm) ||
                       cp.includes(searchTerm) ||
                       nombre.includes(searchTerm) ||
                       direccion.includes(searchTerm);
            });
        }

        // Aplicar filtro de material si está activo
        if (currentFilter !== 'todos') {
            filteredData = filteredData.filter(item =>
                item.materiales.includes(currentFilter)
            );
        }

        renderResults(filteredData);
    }

    // Evento de búsqueda
    $('#searchBtn').on('click', function() {
        const query = $('#searchInput').val();
        searchCentros(query);
    });

    $('#searchInput').on('keyup', function(e) {
        if (e.key === 'Enter') {
            const query = $(this).val();
            searchCentros(query);
        }
    });

    // Filtros por material
    $('.filter-tag').on('click', function() {
        $('.filter-tag').removeClass('active');
        $(this).addClass('active');
        currentFilter = $(this).data('filter');

        const query = $('#searchInput').val();
        searchCentros(query);
    });

    // ==========================================
    // 6. VISTA (Lista/Mapa) - Simulación
    // ==========================================
    $('.view-toggle i').on('click', function() {
        $('.view-toggle i').removeClass('active');
        $(this).addClass('active');
        const view = $(this).data('view');
        if (view === 'map') {
            // Aquí se podría integrar un mapa (ej. Leaflet)
            // Por ahora solo mostramos un mensaje
            alert('Función de mapa en desarrollo. Pronto podrás ver los centros en un mapa interactivo.');
        }
        // Si es 'list', ya está visible
    });

    // ==========================================
    // 7. INICIALIZACIÓN
    // ==========================================
    loadCentros();

    // Establecer filtro "Todos" como activo por defecto
    $('.filter-tag[data-filter="todos"]').addClass('active');

});