if (!validateLoggedIn()) {
    window.location.href = "../index.html";
}

function loggOut() {
    sessionStorage.clear();
    location.href = '.././index.html';
}

let configuraciones = JSON.parse(localStorage.getItem('configuraciones'));

//upload customProlog
let session = pl.create(1000);
let prologCode = "";


document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        prologCode = e.target.result;
        session = pl.create(1000);
        session.consult(prologCode, {
            success: function () {
                document.getElementById("output").value = "Código cargado correctamente.\n";
                generarConfiguraciones(prologCode);
                updateAdminPage();
            },
            error: function (err) {
                document.getElementById("output").value = "Error al cargar el código: " + err;
            }
        });
    };
    reader.readAsText(file);
});

function runQuery() {
    const query = document.getElementById("queryInput").value;
    document.getElementById("output").value = "Ejecutando consulta...\n";

    session.query(query, {
        success: function () {
            document.getElementById("output").value = "";
            session.answers(x => {
                if (x === false) {
                    document.getElementById("output").value += "No hay más soluciones.\n";
                    return;
                }
                document.getElementById("output").value += pl.format_answer(x) + "\n";
            });
        },
        fail: function () {
            document.getElementById("output").value += "No hay resultados.\n";
        },
        error: function (err) {
            document.getElementById("output").value += "Error en la consulta: " + err + "\n";
        }
    });
}

//end upload customProlog


//variables
let selectedFacultadCarrera = "";
let optionsSelectedFacultad = "";
let optionsSelectedCarrera = "";

addOptionsFacultadSelect();
addOptionsConfigFacultadSelect();
tablesWithoutFilters();

function addOptionToTable(tableId, column1Text, optionText) {
    let tableBody = document.getElementById(tableId);
    let newRow = document.createElement("tr");

    newRow.innerHTML = `
                <td class="option-text1">${formatText(column1Text)}</td>
                <td class="option-text">${formatText(optionText)}</td>
                <td>
                    <span class="action-btn edit-btn" onclick="editRow(this)">✏️</span>
                    <span class="action-btn delete-btn"
                     data-table="${tableId}"
                     data-key="${column1Text}"
                     data-value="${formatTextBack(optionText)}"
                     onclick="deleteRow(this)">
                     ❌
                     </span>
                </td>
            `;

    tableBody.appendChild(newRow);
}


function addOptionToHorarioTable(tableId, horario, addCheckbox = true) {
    let tableBody = document.getElementById(tableId);
    let newRow = document.createElement("tr");
    newRow.innerHTML = `
                <td class="option-text1">${formatText(horario.carrera)}</td>
                <td class="option-text">${formatText(horario.curso)}</td>
                <td class="option-text">${formatText(horario.seccion)}</td>
                <td class="option-text">${horario.hora_inicio}</td>
                <td class="option-text">${horario.hora_fin}</td>
                <td>
<!--                        <span class="action-btn edit-btn" onclick="editRow(this)">✏️</span>-->
                    <span class="action-btn delete-btn"
                     data-table="${tableId}"
                     data-key="${horario.carrera}"
                     data-value="${horario.id}"
                     onclick="deleteRow(this)">
                     ❌
                     </span>
                </td>
            `;
    tableBody.appendChild(newRow);
}

function addOption(inputId, column1Text, tableId) {
    let addToTable = false;
    let input = document.getElementById(inputId);
    let optionText = input.value.trim();

    if (optionText === "" || column1Text === "") {
        alert("Por favor, ingrese una opción válida.");
        return;
    }

    if (tableId === "tableFacultad") {
        addToTable = agregarFacultad(formatTextBack(optionText));
    } else if (tableId === "tableCarrera") {
        addToTable = agregarCarrera(selectedFacultadCarrera, formatTextBack(optionText));
    } else if (tableId === "tableHorario") {
        console.log(optionText.split(","));
    }

    if (addToTable) {
        addOptionToTable(tableId, column1Text, optionText);
    }
    updateAdminPage();
    input.value = "";
}

function addHorario() {
    // optionsSelectedCarrera = "sistemas";
    if (!optionsSelectedCarrera || optionsSelectedCarrera === "") {
        alert("no ha seleccionado una carrera");
        return;
    }

    const curso = document.getElementById('curso').value;
    const seccion = document.getElementById('seccion').value;
    const hora_inicio = parseInt(document.getElementById('hora_inicio').value);
    const hora_fin = parseInt(document.getElementById('hora_fin').value);

    const horario = {
        carrera: optionsSelectedCarrera,
        curso: formatTextBack(curso),
        seccion: formatTextBack(seccion),
        hora_inicio: hora_inicio,
        hora_fin: hora_fin,
        id: 0
    };
    if (agregarHorarioCarrera(optionsSelectedCarrera, horario)) {
        addOptionToHorarioTable('tableHorario', horario)
        generarConfiguraciones(generarNuevoProlog());
    }


}

document.getElementById('cursoForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita que el formulario se envíe
    addHorario();
    document.getElementById("cursoForm").reset();
});

function updateAdminPage() {
    generarConfiguraciones(generarNuevoProlog());
    clearAllTables();
    addOptionsFacultadSelect();
    addOptionsConfigFacultadSelect();
    tablesWithoutFilters();
}


function addOptionConfig(inputId, column1Text, tableId, mapConfig) {
    // if (column1Text === "") return;
    let input = document.getElementById(inputId);
    let optionText = input.value.trim();

    if (optionText === "" || column1Text === "") {
        alert("Por favor, ingrese una opción válida.");
        return;
    }

    if (agregarConfiguracionCarrera(mapConfig, optionsSelectedCarrera, formatTextBack(optionText))) {
        generarConfiguraciones(generarNuevoProlog());
        addOptionToTable(tableId, column1Text, optionText);
    }

    input.value = "";
}

function deleteRow(element) {
    console.log("dataset del elemento a eliminar: ", element.dataset);
    if (deleteAdminConfig(element.dataset)) {
        let row = element.parentNode.parentNode;
        row.parentNode.removeChild(row);
        verifyRefresh(element.dataset.table);
    }
}

function editRow(element) {
    let row = element.parentNode.parentNode;
    let cell = row.querySelector(".option-text");
    let newText = prompt("Editar opción:", cell.textContent);

    if (newText !== null && newText.trim() !== "") {
        cell.textContent = newText.trim();
    }
}

function verifyRefresh(tableId) {
    if (tableId === "tableFacultad" || tableId === "tableCarrera") {
        updateAdminPage();
    } else {
        generarConfiguraciones(generarNuevoProlog());
    }
}

function deleteAdminConfig(elementDataSet) {
    switch (elementDataSet.table) {
        case "tableFacultad": {
            return eliminarFacultad(elementDataSet.value);
        }
        case "tableCarrera": {
            return eliminarCarrera(elementDataSet.value);
        }
        case "tablePerfil": {
            return eliminarConfiguracionCarrera(adminConfiguration.perfilMap, elementDataSet.key, elementDataSet.value);
        }
        case "tableHabilidad": {
            return eliminarConfiguracionCarrera(adminConfiguration.habilidadMap, elementDataSet.key, elementDataSet.value);
        }
        case "tablePreferencia": {
            return eliminarConfiguracionCarrera(adminConfiguration.preferenciaMap, elementDataSet.key, elementDataSet.value);
        }
        case "tableTema": {
            return eliminarConfiguracionCarrera(adminConfiguration.temaMap, elementDataSet.key, elementDataSet.value);
        }
        case "tableHorario": {
            return eliminarHorarioCarrera(elementDataSet.key, elementDataSet.value);
        }
    }
}


function addSelectOption(newSelectOptionText, dynamicSelectId) {
    const select = document.getElementById(dynamicSelectId);
    const newOption = document.createElement("option");
    newOption.value = newSelectOptionText;
    newOption.textContent = formatText(newSelectOptionText);
    select.appendChild(newOption);
}

function optionSelected() {
    const select = document.getElementById("facultadSelect");
    if (select.value === "") {
        selectedFacultadCarrera = "";
    }
    if (select.value !== "") {
        selectedFacultadCarrera = select.value;
    }
}

function optionFacultadSelected() {
    const select = document.getElementById("opcionesFacultadSelect");
    clearSelect("opcionesCarreraSelect");
    clearOptionsTables();
    if (select.value === "") {
        optionsSelectedFacultad = "";
        tablesWithoutFilters();
    }
    if (select.value !== "") {
        optionsSelectedFacultad = select.value;
        configuraciones.carreras.filter(carrera => carrera.facultad === optionsSelectedFacultad).forEach(carrera => {
            addSelectOption(carrera.nombre, "opcionesCarreraSelect")
        });
    }
}

function optionCarreraSelected() {
    const select = document.getElementById("opcionesCarreraSelect");
    if (select.value === "") {
        optionsSelectedCarrera = "";
        clearOptionsTables();
        tablesWithoutFilters();
    }
    if (select.value !== "") {
        optionsSelectedCarrera = select.value;
        clearOptionsTables();
        applyFiltersTables();
    }
}

function clearFacultadAndCarreraTables() {
    clearTable("tableFacultad");
    clearTable("tableCarrera");
}

function clearAllTables() {
    clearFacultadAndCarreraTables();
    clearSelect("facultadSelect");
    clearSelectsConfigs();
    clearOptionsTables();
}

function clearSelectsConfigs() {
    clearSelect("opcionesFacultadSelect");
    clearSelect("opcionesCarreraSelect");
}

function clearOptionsTables() {
    clearTable('tablePerfil');
    clearTable('tableHabilidad');
    clearTable('tablePreferencia');
    clearTable('tableTema');
    clearTable('tableHorario');
}

function addOptionsFacultadSelect() {
    configuraciones = JSON.parse(localStorage.getItem('configuraciones'));
    configuraciones.facultades.forEach(facultad => {
        addOptionToTable('tableFacultad', "USAC", facultad);
        addSelectOption(facultad, "facultadSelect");
    });
}

function addOptionsConfigFacultadSelect() {
    configuraciones = JSON.parse(localStorage.getItem('configuraciones'));
    configuraciones.facultades.forEach(facultad => {
        addSelectOption(facultad, "opcionesFacultadSelect");
    });

    configuraciones.carreras.forEach(carrera => addOptionToTable('tableCarrera', carrera.facultad, carrera.nombre));
}

function tablesWithoutFilters() {
    configuraciones.perfiles.forEach(perfil => {
        perfil.skills.forEach(x => {
            addOptionToTable('tablePerfil', perfil.carrera, x);
        })
    });

    configuraciones.habilidades.forEach(habilidad => {
        habilidad.habilidades.forEach(x => {
            addOptionToTable('tableHabilidad', habilidad.carrera, x);
        })
    });

    configuraciones.preferencias.forEach(preferencia => {
        preferencia.preferencias.forEach(x => {
            addOptionToTable('tablePreferencia', preferencia.carrera, x);
        })
    });

    configuraciones.temas.forEach(tema => {
        tema.temas.forEach(x => {
            addOptionToTable('tableTema', tema.carrera, x);
        })
    });

    configuraciones.horarios.forEach(horario => {
        addOptionToHorarioTable('tableHorario', horario);
    });
}

function applyFiltersTables() {

    adminConfiguration.perfilMap.get(optionsSelectedCarrera)?.forEach(perfil =>
        addOptionToTable('tablePerfil', optionsSelectedCarrera, perfil)
    );

    adminConfiguration.habilidadMap.get(optionsSelectedCarrera)?.forEach(habilidad => {
        addOptionToTable('tableHabilidad', optionsSelectedCarrera, habilidad);
    });

    adminConfiguration.preferenciaMap.get(optionsSelectedCarrera)?.forEach(preferencia => {
        addOptionToTable('tablePreferencia', optionsSelectedCarrera, preferencia);
    });

    adminConfiguration.temaMap.get(optionsSelectedCarrera)?.forEach(tema => {
        addOptionToTable('tableTema', optionsSelectedCarrera, tema);
    });

    adminConfiguration.horarioMap.get(optionsSelectedCarrera)?.forEach(horario => {
        addOptionToHorarioTable('tableHorario', horario);
    });

}

function clearTable(tableId) {
    let tableBody = document.getElementById(tableId);
    tableBody.innerHTML = "";
}

function clearSelect(dynamicSelectId) {
    let selectElement = document.getElementById(dynamicSelectId);
    selectElement.innerHTML = "";
    const newOption = document.createElement("option");
    newOption.value = "";
    newOption.textContent = "-- Selecciona --";
    selectElement.appendChild(newOption);
}