(function() {
    if (!window.indexedDB) { /* ... chequeo soporte ... */ return; }

    const DB_NAME = 'mediaDB';
    const MEDIA_STORE_NAME = 'mediaStore'; // Renombrado para claridad
    const GROUP_METADATA_STORE_NAME = 'groupMetadataStore'; // Nuevo Store
    const DB_VERSION = 3; // <-- IMPORTANTE: Incrementar versión
    let db;

    // --- Referencias HTML ---
    // Sección Metadatos
    const metaGroupPrefixInput = document.getElementById('metaGroupPrefixInput');
    const loadMetaButton = document.getElementById('loadMetaButton');
    const metaTargetIndexInput = document.getElementById('metaTargetIndexInput');
    const metaWebInput = document.getElementById('metaWebInput');
    const metaLocationInput = document.getElementById('metaLocationInput');
    const metaTextInput = document.getElementById('metaTextInput');
    const saveMetaButton = document.getElementById('saveMetaButton');
    const metadataFeedbackDiv = document.getElementById('metadataFeedback');

    // Sección Archivos
    const fileGroupPrefixInput = document.getElementById('fileGroupPrefixInput');
    const mediaInput = document.getElementById('mediaInput');
    const saveFilesButton = document.getElementById('saveFilesButton');
    const fileFeedbackDiv = document.getElementById('fileFeedback');

    // Sección Visualizar/Exportar
    const loadGroupInput = document.getElementById('loadGroupInput');
    const loadGroupButton = document.getElementById('loadGroupButton');
    const loadAllButton = document.getElementById('loadAllButton');
    const exportJsonButton = document.getElementById('exportJsonButton');
    const displayFeedbackDiv = document.getElementById('displayFeedback');
    const mediaDisplayDiv = document.getElementById('mediaDisplay');

    // --- Funciones Feedback Específicas ---
    function showMetadataFeedback(message, isError = false) { showFeedback(metadataFeedbackDiv, message, isError); }
    function showFileFeedback(message, isError = false) { showFeedback(fileFeedbackDiv, message, isError); }
    function showDisplayFeedback(message, isError = false) { showFeedback(displayFeedbackDiv, message, isError); }
    function showFeedback(divElement, message, isError) { // Función genérica
        divElement.textContent = message;
        divElement.className = isError ? 'error' : (message ? 'success' : '');
    }

    // --- Funciones de Base de Datos ---
    function openDB() {
        console.log("Abriendo base de datos (v" + DB_VERSION + ")...");
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => { /* ... manejo de error ... */ };
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Base de datos abierta.");
            showMetadataFeedback("Base de datos lista.", false);
            showFileFeedback("", false); // Limpiar otros feedbacks
            showDisplayFeedback("", false);
        };

        request.onupgradeneeded = (event) => {
            console.log("Actualizando/Creando base de datos...");
            let db = event.target.result;
            let transaction = event.target.transaction; // Usar transacción existente

            // Crear/Actualizar Media Store
            let mediaStore;
            if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
                mediaStore = db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                console.log(`Object Store '${MEDIA_STORE_NAME}' creado.`);
            } else {
                mediaStore = transaction.objectStore(MEDIA_STORE_NAME);
            }
            // Asegurar índices en mediaStore
            if (!mediaStore.indexNames.contains('group')) { mediaStore.createIndex('group', 'group', { unique: false }); console.log("Índice 'group' creado en Media Store.");}
            if (!mediaStore.indexNames.contains('name')) { mediaStore.createIndex('name', 'name', { unique: false }); }
            if (!mediaStore.indexNames.contains('type')) { mediaStore.createIndex('type', 'type', { unique: false }); }


            // --- NUEVO: Crear Group Metadata Store ---
            if (!db.objectStoreNames.contains(GROUP_METADATA_STORE_NAME)) {
                // Usamos 'group' como keyPath, debe ser único para los metadatos.
                let metadataStore = db.createObjectStore(GROUP_METADATA_STORE_NAME, { keyPath: 'group' });
                console.log(`Object Store '${GROUP_METADATA_STORE_NAME}' creado.`);
                // No necesitamos otros índices aquí si siempre buscamos por 'group' (la key)
            } else {
                console.log(`Object Store '${GROUP_METADATA_STORE_NAME}' ya existe.`);
            }
        };
    }

    // --- NUEVO: Funciones de Gestión de Metadatos ---
    function saveGroupMetadata() {
        const groupPrefix = metaGroupPrefixInput.value.trim();
        if (!groupPrefix) {
            showMetadataFeedback("El Prefijo/Nombre del Grupo es obligatorio.", true);
            metaGroupPrefixInput.focus();
            return;
        }
        if (!db) { showMetadataFeedback("La base de datos no está lista.", true); return; }

        const metadataRecord = {
            group: groupPrefix,
            targetIndex: metaTargetIndexInput.value.trim(),
            web: metaWebInput.value.trim(),
            location: metaLocationInput.value.trim(),
            text: metaTextInput.value.trim()
        };

        const transaction = db.transaction([GROUP_METADATA_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(GROUP_METADATA_STORE_NAME);
        // Usamos put() para insertar o actualizar si ya existe la clave 'group'
        const request = store.put(metadataRecord);

        request.onerror = (event) => {
            console.error("Error al guardar metadatos:", event.target.error);
            showMetadataFeedback(`Error al guardar metadatos: ${event.target.error.message}`, true);
        };
        request.onsuccess = (event) => {
            console.log(`Metadatos para el grupo '${groupPrefix}' guardados/actualizados.`);
            showMetadataFeedback(`Metadatos para '${groupPrefix}' guardados exitosamente.`, false);
            // Limpiar formulario de metadatos (opcional)
            // metaGroupPrefixInput.value = '';
            // metaTargetIndexInput.value = 'targetIndex: 0';
            // metaWebInput.value = '';
            // metaLocationInput.value = '';
            // metaTextInput.value = '';
        };
    }

    function loadGroupMetadataForEditing() {
        const groupPrefix = metaGroupPrefixInput.value.trim();
        if (!groupPrefix) {
            showMetadataFeedback("Ingresa el Prefijo del Grupo que deseas cargar.", true);
            metaGroupPrefixInput.focus();
            return;
        }
        if (!db) { showMetadataFeedback("La base de datos no está lista.", true); return; }

        const transaction = db.transaction([GROUP_METADATA_STORE_NAME], 'readonly');
        const store = transaction.objectStore(GROUP_METADATA_STORE_NAME);
        const request = store.get(groupPrefix); // get() busca por la clave primaria

        request.onerror = (event) => {
            console.error("Error al cargar metadatos:", event.target.error);
            showMetadataFeedback(`Error al cargar metadatos para '${groupPrefix}'.`, true);
        };
        request.onsuccess = (event) => {
            const record = event.target.result;
            if (record) {
                metaTargetIndexInput.value = record.targetIndex || 'targetIndex: 0';
                metaWebInput.value = record.web || '';
                metaLocationInput.value = record.location || '';
                metaTextInput.value = record.text || '';
                showMetadataFeedback(`Metadatos para '${groupPrefix}' cargados.`, false);
            } else {
                showMetadataFeedback(`No se encontraron metadatos para el grupo '${groupPrefix}'. Puedes crearlos ahora.`, true);
                // Opcional: limpiar campos si no se encuentra
                metaTargetIndexInput.value = 'targetIndex: 0';
                metaWebInput.value = '';
                metaLocationInput.value = '';
                metaTextInput.value = '';
            }
        };
    }

    // --- Función para guardar archivos (ahora llamada saveFilesToGroup) ---
    function saveFilesToGroup() {
        const groupPrefix = fileGroupPrefixInput.value.trim(); // Input de la sección de archivos
        if (!groupPrefix) {
            showFileFeedback("Por favor, ingresa el prefijo del grupo al que pertenecen los archivos.", true);
            fileGroupPrefixInput.focus();
            return;
        }
        if (mediaInput.files.length === 0) {
            showFileFeedback("No has seleccionado ningún archivo.", true); return;
        }
        if (!db) { showFileFeedback("La base de datos no está lista.", true); return; }

        // Opcional: Podríamos verificar si existen metadatos para este grupo antes de guardar archivos
        // pero por simplicidad, lo omitimos. Asumimos que el usuario gestiona los metadatos.

        const transaction = db.transaction([MEDIA_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(MEDIA_STORE_NAME);
        let filesProcessed = 0;

        transaction.onerror = (event) => {
            console.error("Error en transacción de archivos:", event.target.error);
            showFileFeedback(`Error al guardar archivos: ${event.target.error.message}`, true);
        };
        transaction.oncomplete = (event) => {
            console.log("Transacción de archivos completada.");
            showFileFeedback(`${filesProcessed} archivo(s) añadido(s) al grupo '${groupPrefix}'.`, false);
            mediaInput.value = ''; // Limpiar input de archivos
            // fileGroupPrefixInput.value = ''; // Opcional: limpiar prefijo
        };

        Array.from(mediaInput.files).forEach(file => {
            console.log(`Guardando archivo '${file.name}' (${file.type}) en el grupo '${groupPrefix}'`);
            const mediaRecord = {
                group: groupPrefix, // Asociar con el grupo
                name: file.name,
                type: file.type || "mind",
                file: file
            };
            const request = store.add(mediaRecord); // add() para añadir nuevo archivo
            request.onsuccess = () => { filesProcessed++; };
            request.onerror = (event) => { console.error(`Error al añadir '${file.name}':`, event.target.error); };
        });
    }

    // --- Funciones de Visualización (displayAllMedia, displayMediaByGroup, renderMedia) ---
    // Sin cambios significativos en su lógica interna de lectura del MEDIA_STORE_NAME
    // y renderizado, pero usamos los nuevos feedbacks.
    function displayAllMedia() {
        if (!db) { showDisplayFeedback("La base de datos no está lista.", true); return; }
        showDisplayFeedback("Cargando todos los medios...", false);
        const transaction = db.transaction([MEDIA_STORE_NAME], 'readonly');
        const store = transaction.objectStore(MEDIA_STORE_NAME);
        const request = store.getAll();
        request.onerror = (event) => { showDisplayFeedback("Error al cargar todos.", true); console.error(event.target.error);};
        request.onsuccess = (event) => { renderMedia(event.target.result, "Todos los Medios"); };
    }
    function displayMediaByGroup(groupPrefix) {
        if (!db) { showDisplayFeedback("La base de datos no está lista.", true); return; }
        if (!groupPrefix) { showDisplayFeedback("Ingresa el prefijo del grupo a cargar.", true); return; }
        showDisplayFeedback(`Cargando grupo '${groupPrefix}'...`, false);
        const transaction = db.transaction([MEDIA_STORE_NAME], 'readonly');
        const store = transaction.objectStore(MEDIA_STORE_NAME);
        const index = store.index('group');
        const request = index.getAll(groupPrefix);
        request.onerror = (event) => { showDisplayFeedback(`Error al cargar grupo '${groupPrefix}'.`, true); console.error(event.target.error);};
        request.onsuccess = (event) => { renderMedia(event.target.result, `Grupo: ${groupPrefix}`); };
    }
    function renderMedia(mediaRecords, title) { // Añadido título para contexto
        mediaDisplayDiv.innerHTML = '';
        if (!mediaRecords || mediaRecords.length === 0) {
            mediaDisplayDiv.innerHTML = `<p>No se encontraron medios para '${title}'.</p>`;
            showDisplayFeedback(`No hay medios que mostrar para '${title}'.`, false);
            return;
        }
        showDisplayFeedback(`Mostrando ${mediaRecords.length} medio(s) para '${title}'...`, false);
        mediaRecords.forEach(mediaRecord => {
            const mediaElementContainer = document.createElement('div');
            const objectURL = URL.createObjectURL(mediaRecord.file);
            console.log(`Creando objeto URL para '${mediaRecord.name}' (${objectURL})`);
            let mediaElement;
            // ... (creación de img/video/p element) ...
            if (mediaRecord.type.startsWith('image/')) { mediaElement = document.createElement('img'); mediaElement.alt = mediaRecord.name;}
            else if (mediaRecord.type.startsWith('video/')) { mediaElement = document.createElement('video'); mediaElement.controls = true;}
            else { mediaElement = document.createElement('p'); mediaElement.textContent = `Archivo: ${mediaRecord.name}`; }
            if (mediaElement.tagName === 'IMG' || mediaElement.tagName === 'VIDEO') { mediaElement.src = objectURL; }

            const formattedGroupName = formatGroupNameForDisplay(mediaRecord.group);
            const infoParagraph = document.createElement('p');
            infoParagraph.innerHTML = `<b>Grupo:</b> ${formattedGroupName}<br><b>Nombre:</b> ${mediaRecord.name}`;
            infoParagraph.style.fontSize = '0.85em';
            const deleteButton = document.createElement('button'); /* ... delete button ... */
            deleteButton.textContent = 'X'; deleteButton.classList.add('delete-button'); deleteButton.title = `Borrar ${mediaRecord.name}`; deleteButton.dataset.id = mediaRecord.id; deleteButton.addEventListener('click', handleDeleteClick);

            mediaElementContainer.appendChild(mediaElement);
            mediaElementContainer.appendChild(infoParagraph);
            mediaElementContainer.appendChild(deleteButton);
            mediaDisplayDiv.appendChild(mediaElementContainer);
        });
        showDisplayFeedback(`Mostrando ${mediaRecords.length} medio(s) para '${title}'.`, false);
    }


    // --- Función de Borrado (deleteMedia) ---
    function deleteMedia(id) { // Borra solo del MEDIA_STORE_NAME
        if (!db) { showDisplayFeedback("La base de datos no está lista.", true); return; }
        const numericId = parseInt(id, 10); if (isNaN(numericId)) return;
        const transaction = db.transaction([MEDIA_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(MEDIA_STORE_NAME);
        const request = store.delete(numericId);
        request.onerror = (event) => { showDisplayFeedback(`Error al borrar archivo: ${event.target.error.message}`, true); };
        request.onsuccess = (event) => {
            showDisplayFeedback("Archivo borrado.", false);
            mediaDisplayDiv.innerHTML = '<p>Lista actualizada. Carga de nuevo un grupo o todos los medios.</p>';
        };
        // Nota: Esto no borra los metadatos del grupo si este queda vacío.
        // Se podría añadir lógica para limpiar metadatos de grupos sin archivos.
    }

    // --- MODIFICADO: Generar JSON usando ambos Stores ---
    function generateAndSaveJson() {
        if (!db) {
            showDisplayFeedback("La base de datos no está lista para exportar.", true);
            return;
        }
        showDisplayFeedback("Iniciando exportación a JSON...", false);

        // Usaremos Promises para manejar las dos lecturas asíncronas
        Promise.all([
            getAllRecords(GROUP_METADATA_STORE_NAME), // Obtener todos los metadatos
            getAllRecords(MEDIA_STORE_NAME)           // Obtener todos los archivos multimedia
        ])
            .then(([metadataRecords, mediaRecords]) => {
                if (!mediaRecords || mediaRecords.length === 0) {
                    showDisplayFeedback("No hay archivos multimedia en IndexedDB para exportar.", false);
                    return;
                }

                // Crear un Mapa para acceso rápido a los metadatos por grupo
                const metadataMap = new Map();
                metadataRecords.forEach(meta => {
                    metadataMap.set(meta.group, meta); // group es la key
                });
                console.log(`Metadatos cargados para ${metadataMap.size} grupos.`);

                // Agrupar medios por 'group' (como antes)
                const groupedMedia = mediaRecords.reduce((acc, media) => {
                    const group = media.group;
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(media);
                    return acc;
                }, {});
                console.log(`Archivos agrupados para ${Object.keys(groupedMedia).length} grupos.`);

                //Objeto para el custom mind
                const customMind = {};

                const finalJsonArray = [];
                let imageCounter = 1;

                for (const groupPrefix in groupedMedia) {
                    if (groupedMedia.hasOwnProperty(groupPrefix)) {
                        const mediaInGroup = groupedMedia[groupPrefix];
                        imageCounter = 1;

                        // --- ¡NUEVO! Obtener metadatos para este grupo del Mapa ---
                        const metadata = metadataMap.get(groupPrefix) || {}; // Usar {} si no hay metadatos

                        const formattedGroupName = formatGroupNameForDisplay(groupPrefix);

                        const groupJsonObject = {
                            id: groupPrefix,
                            // Usar metadatos si existen, con valores por defecto si no
                            targetIndex: metadata.targetIndex || "targetIndex: 0",
                            images: [],
                            web: metadata.web || `.././pages/${groupPrefix}.html`, // Default si no existe
                            location: metadata.location || "", // Default vacío si no existe
                            video: null,
                            text: metadata.text || `Descripción para ${formattedGroupName} no definida.` // Default si no existe
                        };

                        // Procesar imágenes y video (igual que antes)
                        mediaInGroup.forEach(media => {
                            console.log(`Procesando '${media.name}' (${media.type}) para el grupo '${groupPrefix}'`);
                            if (media.type.startsWith('image/')) {
                                const imageId = `${groupPrefix}_${imageCounter++}`;
                                const imageSrc = URL.createObjectURL(media.file) || `../assets/${groupPrefix}/${media.name}`; // Ruta hipotética
                                groupJsonObject.images.push({ id: imageId, src: imageSrc, alt: formattedGroupName });
                            } else if (media.type.startsWith('video/') && groupJsonObject.video === null) {
                                const videoId = `${groupPrefix}_video_1`;
                                const videoSrc = URL.createObjectURL(media.file) || `../assets/${groupPrefix}/${media.name}`; // Ruta hipotética
                                groupJsonObject.video = { id: videoId, src: videoSrc };
                            } else if(media.type.startsWith('mind')) {
                                console.log(`media.type no es video ni imagen: ${media.type}`);
                                // groupJsonObject.web = URL.createObjectURL(media.file);
                            }
                        });
                        if(groupJsonObject.id === "custom_mind") {
                            localStorage.setItem('customMind', JSON.stringify(groupJsonObject));
                        }
                        if(groupJsonObject.id !== "custom_mind") {
                            finalJsonArray.push(groupJsonObject);
                        }
                    }
                } // Fin for...in

                // Guardar en Local Storage (igual que antes)
                try {
                    const jsonString = JSON.stringify(finalJsonArray, null, 2);
                    localStorage.setItem('mediaGroupsJson', jsonString);
                    console.log("JSON generado con metadatos y guardado en Local Storage ('mediaGroupsJson').");
                    console.log(jsonString);
                    showDisplayFeedback(`JSON generado para ${finalJsonArray.length} grupos y guardado en LS.`, false);
                    // offerJsonDownload(jsonString, 'media_groups_export.json'); // Descomentar si quieres descarga
                } catch (error) { /* ... manejo error JSON/LS ... */ }

            })
            .catch(error => {
                console.error("Error al leer datos de IndexedDB para exportar:", error);
                showDisplayFeedback("Error al leer datos para exportar JSON.", true);
            });
    }

    // --- NUEVA Función Auxiliar para leer todos los registros de un store ---
    function getAllRecords(storeName) {
        return new Promise((resolve, reject) => {
            if (!db) { return reject("La base de datos no está abierta."); }
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onerror = (event) => reject(event.target.error);
            request.onsuccess = (event) => resolve(event.target.result);
        });
    }

    // --- Función Auxiliar: Formatear nombre de grupo (sin cambios) ---
    function formatGroupNameForDisplay(prefix) { /* ... */
        if (!prefix) return "Grupo Desconocido";
        return prefix.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
    // --- Función Opcional: Descarga JSON (sin cambios) ---
    function offerJsonDownload(jsonString, filename) { /* ... */ }


    // --- Manejadores de Eventos ---
    saveMetaButton.addEventListener('click', saveGroupMetadata);
    loadMetaButton.addEventListener('click', loadGroupMetadataForEditing);
    saveFilesButton.addEventListener('click', saveFilesToGroup); // Usar la función renombrada
    loadAllButton.addEventListener('click', displayAllMedia);
    loadGroupButton.addEventListener('click', () => displayMediaByGroup(loadGroupInput.value.trim()));
    exportJsonButton.addEventListener('click', generateAndSaveJson);
    // El event listener para borrar (handleDeleteClick) no necesita cambios

    function handleDeleteClick(event) { /* ... sin cambios ... */
        if (event.target.classList.contains('delete-button')) {
            const mediaId = event.target.dataset.id;
            if (mediaId && confirm(`¿Estás seguro de que quieres borrar este archivo? (Esto no borra los metadatos del grupo)`)) {
                deleteMedia(mediaId);
            }
        }
    }


    // --- Inicialización ---
    openDB();

})(); // Fin IIFE
