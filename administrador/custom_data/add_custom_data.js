
if (!validateLoggedIn()) {
    window.location.href = "../index.html";
}

function loggOut() {
    sessionStorage.clear();
    location.href = '../.././index.html';
}


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('customDataForm');
    const fileInput = document.getElementById('jsonFileInput');
    const customDataList = document.getElementById('customDataList');
    const cancelButton = document.getElementById('cancelButton');
    const downloadButton = document.getElementById('downloadButton');

    function loadCustomData() {
        const customData = JSON.parse(localStorage.getItem('customData')) || [];
        let customMind = customData.find(item => item.id === 'custom_mind');
        if (customMind) {
            localStorage.setItem('customMind', JSON.stringify(customMind));
        }

        const customDataList = document.getElementById('customDataList');
        customDataList.innerHTML = '';

        customData.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
            <div class="card-content">
                <div class="card-field"><strong>ID:</strong> ${item.id}</div>
                <div class="card-field"><strong>Target Index:</strong> ${item.targetIndex}</div>
                <div class="card-field"><strong>Images:</strong> <span class="truncate">${item.images.map(img => img.src).join(', ')}</span></div>
                <div class="card-field"><strong>Filter:</strong> <span class="truncate">${item.filter}</span></div>
                <div class="card-field"><strong>Web:</strong> <span class="truncate">${item.web}</span></div>
                <div class="card-field"><strong>Location:</strong> <span class="truncate">${item.location}</span></div>
                <div class="card-field"><strong>Video:</strong> <span class="truncate">${item.video.src}</span></div>
                <div class="card-field"><strong>Text:</strong> <span class="truncate">${item.text}</span></div>
                <div class="card-actions">
                    <button onclick="editItem(${index})">Editar</button>
                    <button onclick="deleteItem(${index})">Eliminar</button>
                </div>
            </div>
        `;
            customDataList.appendChild(card);
        });
    }

    window.editItem = function(index) {
        const customData = JSON.parse(localStorage.getItem('customData')) || [];
        const item = customData[index];
        form.id.value = item.id;
        form.targetIndex.value = item.targetIndex;
        form.images.value = item.images.map(img => img.src).join(', ');
        form.filter.value = item.filter;
        form.web.value = item.web;
        form.location.value = item.location;
        form.video.value = item.video.src;
        form.text.value = item.text;
        form.dataset.index = index;
    }

    window.deleteItem = function(index) {
        let customData = JSON.parse(localStorage.getItem('customData')) || [];
        customData.splice(index, 1);
        localStorage.setItem('customData', JSON.stringify(customData));
        loadCustomData();
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const newObject = {
            id: formData.get('id'),
            targetIndex: formData.get('targetIndex'),
            images: formData.get('images').split(',').map((url, index) => ({
                id: `${formData.get('id')}_${index + 1}`,
                src: url.trim(),
                alt: formData.get('id')
            })),
            filter: formData.get('filter'),
            web: formData.get('web'),
            location: formData.get('location'),
            video: { id: `${formData.get('id')}_video_1`, src: formData.get('video') },
            text: formData.get('text')
        };
        let customData = JSON.parse(localStorage.getItem('customData')) || [];
        const index = form.dataset.index;
        if (index !== undefined) {
            customData[index] = newObject;
            delete form.dataset.index;
        } else {
            customData.push(newObject);
        }
        localStorage.setItem('customData', JSON.stringify(customData));
        form.reset();
        loadCustomData();
        alert('Maravilla agregada/actualizada exitosamente');
    });

    cancelButton.addEventListener('click', () => {
        form.reset();
        delete form.dataset.index;
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    localStorage.setItem('customData', JSON.stringify(jsonData));
                    loadCustomData();
                    alert('Archivo JSON cargado exitosamente');
                } catch (error) {
                    alert('Error al cargar el archivo JSON');
                }
            };
            reader.readAsText(file);
        }
    });

    downloadButton.addEventListener('click', () => {
        const customData = localStorage.getItem('customData') || '[]';
        const blob = new Blob([customData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customData.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    loadCustomData();
});
