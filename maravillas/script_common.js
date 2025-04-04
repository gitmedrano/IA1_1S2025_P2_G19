function createScene(data, sceneId) {
    const arContainer = document.querySelector('#id_ar_container');
    const sceneContainer = document.createElement('a-scene');
    const assetsContainer = document.createElement('a-assets');
    const acamera = document.createElement('a-camera');

    acamera.setAttribute('position', '0 0 0');
    acamera.setAttribute('look-controls', 'enabled: false');
    acamera.setAttribute('cursor', 'fuse: false; rayOrigin: mouse;');
    acamera.setAttribute('raycaster', 'near: 10; far: 10000; objects: .clickable');

    let assetsList = [
        {id: `icon-web-${sceneId}`, src: '../assets/icons/btn_web.png', alt: 'Web'},
        {id: `icon-location-${sceneId}`, src: '../assets/icons/btn_map.png', alt: 'Location'},
        {id: `icon-play-${sceneId}`, src: '../assets/icons/btn_play.png', alt: 'Play'},
        {id: `icon-pause-${sceneId}`, src: '../assets/icons/btn_pause.png', alt: 'Pause'},
        {id: `icon-filter-${sceneId}`, src: '../assets/icons/btn_filter.png', alt: 'Filter'}
    ];


    assetsList.forEach(asset => {
        const img = document.createElement('img');
        img.id = asset.id;
        img.src = asset.src;
        img.alt = asset.alt;
        assetsContainer.appendChild(img);
    });
    acamera.setAttribute('position', '0 0 0');
    acamera.setAttribute('look-controls', 'enabled: false');
    acamera.setAttribute('cursor', 'fuse: false; rayOrigin: mouse;');
    acamera.setAttribute('raycaster', 'near: 10; far: 10000; objects: .clickable');

    sceneContainer.setAttribute('id', sceneId);
    sceneContainer.appendChild(assetsContainer);
    sceneContainer.appendChild(acamera);

    sceneContainer.setAttribute('mindar-image', `imageTargetSrc: ./14_maravillas_scale_2.mind;`);
    if (sceneId === "custom_scene") {
        let customMind = JSON.parse(localStorage.getItem("customMind"));
        console.log("customMind: ", customMind);
        console.log("Setting mindar-image attribute to: ", customMind.web);
        sceneContainer.setAttribute('mindar-image', `imageTargetSrc: ${customMind.web}; uiScanning:no`);
    }
    sceneContainer.setAttribute('class', 'ar-scene');
    sceneContainer.setAttribute('vr-mode-ui', 'enabled: false');
    sceneContainer.setAttribute('device-orientation-permission-ui', 'enabled: false');

    sceneContainer.addEventListener('arError', function (ev) {
        // loading.classList.remove('active');
        alert('Lo sentimos, hubo un error al iniciar la experiencia AR. Por favor, asegúrate de dar permiso a la cámara y refresca la página.');
    });

    sceneContainer.addEventListener("arReady", (event) => {
        console.log("MindAR is ready")
    });
    // arError event triggered when something went wrong. Mostly browser compatbility issue
    sceneContainer.addEventListener("arError", (event) => {
        console.log("MindAR failed to start")
    });

    arContainer.appendChild(sceneContainer);
    // }

    data.forEach(item => {
        // Crear elementos de assets
        item.images.forEach(image => {
            const img = document.createElement('img');
            img.id = image.id;
            img.src = image.src;
            img.alt = image.alt;
            assetsContainer.appendChild(img);
        });

        const video = document.createElement('video');
        video.id = item.video.id;
        video.src = item.video.src;
        video.setAttribute('autoplay', 'false');
        video.setAttribute('loop', 'false');
        assetsContainer.appendChild(video);

        // Crear entidad principal
        const entity = document.createElement('a-entity');
        entity.id = `entity-${item.id}`;
        entity.setAttribute('mindar-image-target', item.targetIndex);
        if (sceneId === "custom_scene") {
            entity.setAttribute("data-custom", sceneId);
            entity.setAttribute("data-id", item.id);
        }

        const plane = document.createElement('a-plane');
        plane.id = `plane-${item.id}`;
        plane.classList.add('clickable');
        plane.setAttribute('src', `#${item.images[0].id}`);
        plane.setAttribute('position', '0 0 0');
        plane.setAttribute('width', '1');
        plane.setAttribute('height', '1');
        plane.setAttribute('rotation', '0 0 0');
        entity.appendChild(plane);

        const panel = document.createElement('a-entity');
        panel.id = `panel-${item.id}`;
        panel.setAttribute('visible', 'true');
        panel.setAttribute('position', '0 0 0');

        const buttons = [
            {id: `web-button-${sceneId}`, src: `#icon-web-${sceneId}`, position: '-0.8 0.4 0'},
            {id: `location-button-${sceneId}`, src: `#icon-location-${sceneId}`, position: '-0.8 0.2 0'},
            {id: `play-button-${sceneId}`, src: `#icon-play-${sceneId}`, position: '-0.8 0 0'},
            {id: `pause-button-${sceneId}`, src: `#icon-pause-${sceneId}`, position: '-0.8 -0.2 0'},
            {id: `filter-button-${sceneId}`, src: `#icon-filter-${sceneId}`, position: '-0.8 -0.4 0'}
        ];

        buttons.forEach(button => {
            const aImage = document.createElement('a-image');
            aImage.id = `${button.id}-${item.id}`;
            aImage.classList.add('clickable');
            aImage.setAttribute('src', button.src);
            aImage.setAttribute('position', button.position);
            aImage.setAttribute('height', '0.15');
            aImage.setAttribute('width', '0.15');
            aImage.setAttribute('animation', 'property: scale; to: 1.2 1.2 1.2; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate');
            aImage.style.zIndex = '9999';
            panel.appendChild(aImage);
        });

        const aVideo = document.createElement('a-video');
        aVideo.id = item.video.id;
        aVideo.setAttribute('webkit-playsinline', '');
        aVideo.setAttribute('playsinline', '');
        aVideo.setAttribute('src', `#${item.video.id}`);
        aVideo.setAttribute('position', '0 0 0');
        aVideo.setAttribute('width', '1');
        aVideo.setAttribute('height', '1');
        panel.appendChild(aVideo);

        item.images.forEach((image, index) => {
            if (index < 2) {
                const aImage = document.createElement('a-image');
                aImage.id = image.id;
                aImage.setAttribute('src', `#${image.id}`);
                aImage.setAttribute('position', index === 1 ? '-0.3 0.8 0' : '0.3 0.8 0');
                aImage.setAttribute('width', '0.5');
                aImage.setAttribute('height', '0.5');
                panel.appendChild(aImage);
            }
        });

        const aText = document.createElement('a-text');
        aText.setAttribute('value', item.text);
        aText.setAttribute('color', 'white');
        aText.setAttribute('align', 'center');
        aText.setAttribute('anchor', 'center');
        aText.setAttribute('width', '1');
        aText.setAttribute('height', '1');
        aText.setAttribute('position', '0 -0.8 0.5');
        aText.setAttribute('font-weight', 'bold');
        aText.setAttribute('font-size', '50');
        panel.appendChild(aText);

        entity.appendChild(panel);
        sceneContainer.appendChild(entity);
        setupEntityEvents(item, sceneId);
    });

}

function setupEntityEvents(item, sceneId) {
    const id = item.id;
    const entity = document.getElementById(`entity-${id}`);
    const plane = document.getElementById(`plane-${id}`);
    const panel = document.getElementById(`panel-${id}`);
    const playButton = document.getElementById(`play-button-${sceneId}-${id}`);
    const pauseButton = document.getElementById(`pause-button-${sceneId}-${id}`);
    const webButton = document.getElementById(`web-button-${sceneId}-${id}`);
    const locationButton = document.getElementById(`location-button-${sceneId}-${id}`);
    const filterButton = document.getElementById(`filter-button-${sceneId}-${id}`);
    const video = document.getElementById(`${id}_video_1`);


    playButton.addEventListener('click', function () {
        console.log("play button click");
        video.play();
    });

    pauseButton.addEventListener('click', function () {
        console.log("pause button click");
        video.pause();
    });

    webButton.addEventListener('click', function () {
        console.log("web button click");
        window.open(item.web, '_blank');
    });
    locationButton.addEventListener('click', function () {
        console.log("location button click");
        // window.location.href = item.location;
        window.open(item.location, '_blank');
    });
    filterButton.addEventListener('click', function () {
        console.log("filter button click");
        video.pause();
        window.parent.postMessage({origen: sceneId, mensaje: 'filter'}, '*');
    });

    // detect target found
    entity.addEventListener("targetFound", event => {
        console.log("target found");
        console.log("event: ", event);
        window.parent.postMessage({origen: sceneId, mensaje: 'targetFound'}, '*');
        panel.setAttribute('visible', true);
    });

    // detect target lost
    entity.addEventListener("targetLost", event => {
        console.log("target lost");
        video.pause();
        window.parent.postMessage({origen: sceneId, mensaje: 'targetLost'}, '*');
        panel.setAttribute('visible', false);
    });

    // add event listener to the plane
    plane.addEventListener("click", event => {
        console.log("plane click");
        window.location.href = `.././pages/${id}.html`;
    });
}
