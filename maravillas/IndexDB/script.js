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
    const exportJsonButton = document.getElementById('exportJsonButton');
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

    // --- NUEVA FUNCIÓN: Generar y Guardar JSON ---
    function generateAndSaveJson() {
        if (!db) {
            showFeedback("La base de datos no está lista para exportar.", true);
            return;
        }
        showFeedback("Iniciando exportación a JSON...", false);

        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll(); // Obtener todos los registros

        request.onerror = (event) => {
            console.error("Error al obtener todos los medios para exportar:", event.target.error);
            showFeedback("Error al leer datos para exportar JSON.", true);
        };

        request.onsuccess = (event) => {
            const allMedia = event.target.result;
            if (!allMedia || allMedia.length === 0) {
                showFeedback("No hay medios en IndexedDB para exportar.", false);
                return;
            }

            console.log(`Procesando ${allMedia.length} registros para JSON...`);

            // Paso 1: Agrupar medios por 'group'
            const groupedMedia = allMedia.reduce((acc, media) => {
                const group = media.group;
                if (!acc[group]) {
                    acc[group] = []; // Crear array para este grupo si no existe
                }
                acc[group].push(media); // Añadir el medio al array de su grupo
                return acc;
            }, {}); // El acumulador inicial es un objeto vacío

            console.log(`Encontrados ${Object.keys(groupedMedia).length} grupos únicos.`);

            // Paso 2: Procesar cada grupo para generar la estructura JSON deseada
            const finalJsonArray = [];
            let imageCounter = 1; // Para generar IDs únicos de imagen dentro de un grupo

            for (const groupPrefix in groupedMedia) {
                if (groupedMedia.hasOwnProperty(groupPrefix)) {
                    const mediaInGroup = groupedMedia[groupPrefix];
                    imageCounter = 1; // Reiniciar contador para cada grupo

                    // Formatear nombre del grupo para 'alt' y placeholders
                    const formattedGroupName = formatGroupNameForDisplay(groupPrefix);

                    const groupJsonObject = {
                        id: groupPrefix, // Usar el prefijo del grupo como ID principal
                        targetIndex: "targetIndex: 0", // Valor fijo según tu estructura
                        images: [],
                        // Ruta web hipotética
                        web: `.././pages/${groupPrefix}.html`,
                        // Location fija según tu estructura
                        location: "https://maps.app.goo.gl/mM8dMYTouK4HM7Z67",
                        video: null, // Inicializar video como null
                        // Texto de marcador de posición
                        text: `Descripción para ${formattedGroupName}. Esta información debe ser añadida manualmente.`
                    };

                    // Iterar sobre los medios DENTRO de este grupo específico
                    mediaInGroup.forEach(media => {
                        // Si es imagen, añadir al array 'images'
                        if (media.type.startsWith('image/')) {
                            const imageId = `${groupPrefix}_${imageCounter++}`;
                            // Ruta src hipotética
                            const imageSrc = `../assets/${groupPrefix}/${media.name}`;

                            groupJsonObject.images.push({
                                id: imageId,
                                src: imageSrc,
                                alt: formattedGroupName // Usar nombre de grupo formateado como alt
                            });
                        }
                        // Si es video Y aún no hemos añadido uno para este grupo
                        else if (media.type.startsWith('video/') && groupJsonObject.video === null) {
                            const videoId = `${groupPrefix}_video_1`;
                            // Ruta src hipotética
                            const videoSrc = `../assets/${groupPrefix}/${media.name}`;

                            groupJsonObject.video = {
                                id: videoId,
                                src: videoSrc
                            };
                        }
                    }); // Fin forEach mediaInGroup

                    finalJsonArray.push(groupJsonObject);
                } // Fin hasOwnProperty check
            } // Fin for...in groupedMedia

            // Paso 3: Guardar en Local Storage
            try {
                const jsonString = JSON.stringify(finalJsonArray, null, 2); // null, 2 para indentación bonita
                localStorage.setItem('mediaGroupsJson', jsonString);
                console.log("JSON generado y guardado en Local Storage ('mediaGroupsJson').");
                console.log(jsonString); // Mostrar en consola para verificación
                showFeedback(`JSON generado para ${finalJsonArray.length} grupos y guardado en Local Storage.`, false);

                // Opcional: Ofrecer descarga del JSON
                // offerJsonDownload(jsonString, 'media_groups_export.json');

            } catch (error) {
                console.error("Error al convertir a JSON o guardar en Local Storage:", error);
                showFeedback("Error al generar o guardar el JSON.", true);
                if (error.name === 'QuotaExceededError') {
                    alert("Error: El JSON generado es demasiado grande para guardarlo en Local Storage. Revisa la consola para ver el JSON.");
                }
            }
        }; // Fin request.onsuccess
    }

    // --- NUEVA FUNCIÓN Auxiliar: Formatear nombre de grupo ---
    function formatGroupNameForDisplay(prefix) {
        if (!prefix) return "Grupo Desconocido";
        // Reemplaza guiones bajos por espacios y capitaliza cada palabra
        return prefix.replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    // --- NUEVA FUNCIÓN Opcional: Ofrecer descarga del JSON ---
    function offerJsonDownload(jsonString, filename) {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a); // Necesario para Firefox
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Liberar memoria
        console.log(`Ofreciendo descarga del archivo: ${filename}`);
    }

    // --- Manejadores de Eventos ---
    exportJsonButton.addEventListener('click', generateAndSaveJson);
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
