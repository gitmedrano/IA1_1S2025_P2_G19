(function() {
    if (!window.indexedDB) {
        console.error("IndexedDB no es soportado por tu navegador.");
        alert("Tu navegador no soporta IndexedDB, esta funcionalidad no estará disponible.");
        return;
    }

    const DB_NAME = 'mediaDB';
    const STORE_NAME = 'mediaStore';
    // IMPORTANTE: Incrementar la versión para aplicar los cambios de estructura
    const DB_VERSION = 2;
    let db;

    // Referencias a los nuevos elementos HTML
    const groupPrefixInput = document.getElementById('groupPrefixInput');
    const loadGroupInput = document.getElementById('loadGroupInput');
    const loadGroupButton = document.getElementById('loadGroupButton');
    const mediaInput = document.getElementById('mediaInput');
    const saveButton = document.getElementById('saveButton');
    const loadAllButton = document.getElementById('loadAllButton'); // Renombrado
    const feedbackDiv = document.getElementById('feedback');
    const mediaDisplayDiv = document.getElementById('mediaDisplay');

    // --- Funciones de Base de Datos ---

    function openDB() {
        console.log("Abriendo base de datos (v" + DB_VERSION + ")...");
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Error al abrir la base de datos:", event.target.error);
            showFeedback("Error al abrir la base de datos.", true);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Base de datos abierta exitosamente.");
            showFeedback("Base de datos lista.", false);
        };

        // Se ejecuta si la versión es nueva o la DB no existe
        request.onupgradeneeded = (event) => {
            console.log("Actualizando/Creando base de datos...");
            let db = event.target.result;
            let store;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                console.log(`Object Store '${STORE_NAME}' creado.`);
            } else {
                // Si ya existe, obtenemos la referencia para añadir el índice
                store = event.target.transaction.objectStore(STORE_NAME);
                console.log(`Object Store '${STORE_NAME}' ya existe.`);
            }

            // --- CAMBIO IMPORTANTE: Crear Índice para el grupo ---
            // Se crea sólo si no existe ya en esta versión
            if (!store.indexNames.contains('group')) {
                // Índice 'group': permite buscar eficientemente por el campo 'group'
                store.createIndex('group', 'group', { unique: false });
                console.log("Índice 'group' creado en el Object Store.");
            }
            // Crear otros índices si no existen (del ejemplo anterior)
            if (!store.indexNames.contains('name')) {
                store.createIndex('name', 'name', { unique: false });
                console.log("Índice 'name' creado.");
            }
            if (!store.indexNames.contains('type')) {
                store.createIndex('type', 'type', { unique: false });
                console.log("Índice 'type' creado.");
            }
        };
    }

    function saveMedia() {
        if (!db) {
            showFeedback("La base de datos no está lista.", true); return;
        }
        // --- CAMBIO: Obtener y validar el prefijo del grupo ---
        const groupPrefix = groupPrefixInput.value.trim();
        if (!groupPrefix) {
            showFeedback("Por favor, ingresa un prefijo/nombre para el grupo.", true);
            groupPrefixInput.focus();
            return;
        }
        if (mediaInput.files.length === 0) {
            showFeedback("No has seleccionado ningún archivo.", true); return;
        }

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        let filesProcessed = 0;

        transaction.onerror = (event) => {
            console.error("Error en la transacción:", event.target.error);
            showFeedback(`Error al guardar: ${event.target.error.message}`, true);
        };
        transaction.oncomplete = (event) => {
            console.log("Transacción completada.");
            showFeedback(`${filesProcessed} archivo(s) guardado(s) en el grupo '${groupPrefix}'.`, false);
            mediaInput.value = ''; // Limpiar input de archivos
            // Opcional: limpiar input de prefijo? groupPrefixInput.value = '';
            // No refrescamos la vista automáticamente, el usuario elige qué cargar.
        };

        Array.from(mediaInput.files).forEach(file => {
            // --- CAMBIO: Añadir el prefijo al objeto guardado ---
            const mediaRecord = {
                group: groupPrefix, // <-- ¡NUEVO CAMPO!
                name: file.name,
                type: file.type,
                file: file
            };
            const request = store.add(mediaRecord);
            request.onsuccess = () => { filesProcessed++; };
            request.onerror = (event) => {
                console.error(`Error al añadir '${file.name}':`, event.target.error);
            };
        });
    }

    // Función para mostrar medios (genérica, usada por las otras dos)
    function renderMedia(mediaRecords) {
        mediaDisplayDiv.innerHTML = ''; // Limpiar vista previa

        if (!mediaRecords || mediaRecords.length === 0) {
            mediaDisplayDiv.innerHTML = '<p>No se encontraron medios para mostrar.</p>';
            showFeedback("No hay medios que coincidan.", false);
            return;
        }

        showFeedback(`Mostrando ${mediaRecords.length} medio(s)...`, false);

        mediaRecords.forEach(mediaRecord => {
            const mediaElementContainer = document.createElement('div');
            const objectURL = URL.createObjectURL(mediaRecord.file);
            let mediaElement;

            if (mediaRecord.type.startsWith('image/')) {
                mediaElement = document.createElement('img');
                mediaElement.alt = mediaRecord.name;
            } else if (mediaRecord.type.startsWith('video/')) {
                mediaElement = document.createElement('video');
                mediaElement.controls = true;
            } else {
                mediaElement = document.createElement('p');
                mediaElement.textContent = `Archivo: ${mediaRecord.name}`;
            }

            if (mediaElement.tagName === 'IMG' || mediaElement.tagName === 'VIDEO') {
                mediaElement.src = objectURL;
                console.log(`Url creado para ${mediaRecord.name}: ${objectURL}`);
                // Considerar manejo de revokeObjectURL si es necesario
            }

            // --- CAMBIO: Mostrar el grupo y el nombre ---
            const infoParagraph = document.createElement('p');
            infoParagraph.innerHTML = `<b>Grupo:</b> ${mediaRecord.group}<br><b>Nombre:</b> ${mediaRecord.name}`;
            infoParagraph.style.fontSize = '0.85em'; // Hacerlo un poco más pequeño

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.classList.add('delete-button');
            deleteButton.title = `Borrar ${mediaRecord.name}`;
            deleteButton.dataset.id = mediaRecord.id;
            deleteButton.addEventListener('click', handleDeleteClick);

            mediaElementContainer.appendChild(mediaElement);
            mediaElementContainer.appendChild(infoParagraph);
            mediaElementContainer.appendChild(deleteButton);
            mediaDisplayDiv.appendChild(mediaElementContainer);
        });

        console.log(`${mediaRecords.length} medios renderizados.`);
        showFeedback(`Mostrando ${mediaRecords.length} medio(s).`, false);
    }

    // Función para cargar TODOS los medios
    function displayAllMedia() {
        if (!db) { showFeedback("La base de datos no está lista para cargar.", true); return; }
        showFeedback("Cargando todos los medios...", false);

        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll(); // Más simple que el cursor para obtener todo

        request.onerror = (event) => {
            console.error("Error al obtener todos los medios:", event.target.error);
            showFeedback("Error al cargar todos los medios.", true);
        };

        request.onsuccess = (event) => {
            const allMedia = event.target.result;
            console.log(`Se encontraron ${allMedia.length} medios en total.`);
            renderMedia(allMedia);
        };
    }

    // --- NUEVA FUNCIÓN: Cargar medios por Grupo ---
    function displayMediaByGroup(groupPrefix) {
        if (!db) { showFeedback("La base de datos no está lista para cargar por grupo.", true); return; }
        if (!groupPrefix) { showFeedback("Por favor, ingresa el prefijo del grupo a cargar.", true); return; }

        showFeedback(`Cargando medios del grupo '${groupPrefix}'...`, false);

        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        // --- Usar el índice 'group' para buscar ---
        const index = store.index('group');
        // getAll(groupPrefix) obtiene todos los registros donde el campo 'group' coincide exactamente
        const request = index.getAll(groupPrefix);

        request.onerror = (event) => {
            console.error(`Error al buscar por grupo '${groupPrefix}':`, event.target.error);
            showFeedback(`Error al cargar el grupo '${groupPrefix}'.`, true);
        };

        request.onsuccess = (event) => {
            const groupMedia = event.target.result;
            console.log(`Se encontraron ${groupMedia.length} medios en el grupo '${groupPrefix}'.`);
            renderMedia(groupMedia); // Reutilizamos la función de renderizado
        };
    }


    function deleteMedia(id) {
        if (!db) { showFeedback("La base de datos no está lista para borrar.", true); return; }
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) { console.error("ID inválido para borrar:", id); return; }

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(numericId);

        request.onerror = (event) => {
            console.error("Error al borrar el registro:", event.target.error);
            showFeedback(`Error al borrar el archivo: ${event.target.error.message}`, true);
        };
        request.onsuccess = (event) => {
            console.log(`Registro con ID ${numericId} borrado exitosamente.`);
            showFeedback("Archivo borrado.", false);
            // Decidir qué recargar: ¿todo o el último grupo visto? Por simplicidad, limpiamos.
            mediaDisplayDiv.innerHTML = '<p>Lista actualizada. Carga de nuevo un grupo o todos los medios.</p>';
        };
    }

    // --- Manejadores de Eventos ---

    saveButton.addEventListener('click', saveMedia);
    loadAllButton.addEventListener('click', displayAllMedia); // Botón para cargar todo
    // --- NUEVO: Event listener para cargar por grupo ---
    loadGroupButton.addEventListener('click', () => {
        const groupToLoad = loadGroupInput.value.trim();
        displayMediaByGroup(groupToLoad);
    });

    function handleDeleteClick(event) {
        if (event.target.classList.contains('delete-button')) {
            const mediaId = event.target.dataset.id;
            if (mediaId && confirm(`¿Estás seguro de que quieres borrar este archivo?`)) {
                deleteMedia(mediaId);
            }
        }
    }

    function showFeedback(message, isError = false) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = isError ? 'error' : (message ? 'success' : '');
    }

    // --- Inicialización ---
    openDB();

})();
