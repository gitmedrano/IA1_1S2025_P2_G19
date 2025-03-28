// document.addEventListener('DOMContentLoaded', function () {
//     const loading = document.querySelector('.loading');
//     loading.classList.add('active');
//
//     const sceneEl = document.querySelector('a-scene');
//     sceneEl.addEventListener('loaded', function () {
//         loading.classList.remove('active');
//     });
//
//     sceneEl.addEventListener('arError', function (ev) {
//         loading.classList.remove('active');
//         alert('Lo sentimos, hubo un error al iniciar la experiencia AR. Por favor, asegúrate de dar permiso a la cámara y refresca la página.');
//     });
//
//     const entityCenotes = document.querySelector('#entity-cenotes_candelaria');
//     const planeCenotes = document.querySelector('#plane-cenotes_candelaria');
//     const entityLagoAtitlan = document.querySelector('#entity-lago_atitlan');
//     const planeLagoAtitlan = document.querySelector('#plane-lago_atitlan');
//     const entityLagunaBrava = document.querySelector('#entity-laguna_brava');
//     const planeLagunaBrava = document.querySelector('#plane-laguna_brava');
//     const entityLasConchas = document.querySelector('#entity-las_conchas');
//     const planeLasConchas = document.querySelector('#plane-las_conchas');
//     const entityRioDulce = document.querySelector('#entity-rio_dulce');
//     const planeRioDulce = document.querySelector('#plane-rio_dulce');
//     const entitySemucChampey = document.querySelector('#entity-semuc_champey');
//     const planeSemucChampey = document.querySelector('#plane-semuc_champey');
//     const entityTikal = document.querySelector('#entity-tikal');
//     const planeTikal = document.querySelector('#plane-tikal');
//
//     const panelLagunaBrava = document.querySelector('#panel-laguna_brava');
//     const playButtonLagunaBrava = document.querySelector('#play-button-laguna_brava');
//     const pauseButtonLagunaBrava = document.querySelector('#pause-button-laguna_brava');
//     const videoLagunaBrava = document.querySelector('#laguna_brava_video_1');
//
//     playButtonLagunaBrava.addEventListener('click', function () {
//         videoLagunaBrava.play();
//     });
//
//     pauseButtonLagunaBrava.addEventListener('click', function () {
//         videoLagunaBrava.pause();
//     });
//
//     sceneEl.addEventListener("arReady", (event) => {
//         console.log("MindAR is ready")
//     });
//     // arError event triggered when something went wrong. Mostly browser compatbility issue
//     sceneEl.addEventListener("arError", (event) => {
//         console.log("MindAR failed to start")
//     });
//     // detect target found
//     entityCenotes.addEventListener("targetFound", event => {
//         console.log("target found");
//         console.log("event: ", event);
//     });
//
//     entityLagoAtitlan.addEventListener("targetFound", event => {
//         console.log("target found");
//         console.log("event: ", event);
//     });
//
//     entityLagunaBrava.addEventListener("targetFound", event => {
//         console.log("target found");
//         console.log("event: ", event);
//         panelLagunaBrava.setAttribute('visible', true);
//     });
//
//     entityLasConchas.addEventListener("targetFound", event => {
//         console.log("target found");
//         console.log("event: ", event);
//     });
//
//     entityRioDulce.addEventListener("targetFound", event => {
//         console.log("target found");
//         console.log("event: ", event);
//     });
//
//     entitySemucChampey.addEventListener("targetFound", event => {
//         console.log("target found");
//         console.log("event: ", event);
//     });
//
//     entityTikal.addEventListener("targetFound", event => {
//         console.log("target found");
//         console.log("event: ", event);
//     });
//
//
//     // detect target lost
//     entityCenotes.addEventListener("targetLost", event => {
//         console.log("target lost");
//     });
//
//     entityLagoAtitlan.addEventListener("targetLost", event => {
//         console.log("target lost");
//     });
//
//     entityLagunaBrava.addEventListener("targetLost", event => {
//         console.log("target lost");
//         videoLagunaBrava.pause();
//         panelLagunaBrava.setAttribute('visible', false);
//     });
//
//     entityLasConchas.addEventListener("targetLost", event => {
//         console.log("target lost");
//     });
//
//     entityRioDulce.addEventListener("targetLost", event => {
//         console.log("target lost");
//     });
//
//     entitySemucChampey.addEventListener("targetLost", event => {
//         console.log("target lost");
//     });
//
//     entityTikal.addEventListener("targetLost", event => {
//         console.log("target lost");
//     });
//
//
//     //add event listener to all planes
//     planeCenotes.addEventListener("click", event => {
//         console.log("plane click");
//         window.location.href = ".././pages/cenotes_candelaria.html";
//     });
//
//     planeLagoAtitlan.addEventListener("click", event => {
//         console.log("plane click");
//         window.location.href = ".././pages/lago_atitlan.html";
//     });
//
//     planeLagunaBrava.addEventListener("click", event => {
//         console.log("plane click");
//         window.location.href = ".././pages/laguna_brava.html";
//     });
//
//     planeLasConchas.addEventListener("click", event => {
//         console.log("plane click");
//         window.location.href = ".././pages/las_conchas.html";
//     });
//
//     planeRioDulce.addEventListener("click", event => {
//         console.log("plane click");
//         window.location.href = ".././pages/rio_dulce.html";
//     });
//
//     planeSemucChampey.addEventListener("click", event => {
//         console.log("plane click");
//         window.location.href = ".././pages/semuc_champey.html";
//     });
//
//     planeTikal.addEventListener("click", event => {
//         console.log("plane click");
//         window.location.href = ".././pages/tikal.html";
//     });
//
// });


fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('ar-scene');
        data.forEach((item, index) => {
            const entity = document.createElement('a-entity');
            entity.setAttribute('id', `entity-${item.id}`);
            entity.setAttribute('mindar-image-target', `targetIndex: ${index}`);
            entity.innerHTML = `           
                    <a-plane id="plane-${item.id}" class="clickable" src="${item.src}" position="0 0 0" width="${item.width}" height="${item.height}" rotation="0 0 0"></a-plane>
                    <a-entity visible=false id="panel-${item.id}" position="0 0 0">
                        <a-image visible=true id="web-button-${item.id}" class="clickable" src="#icon-web" alpha-test="0.5" position="-0.8 0.4 0" height="0.15" width="0.15" animation="property: scale; to: 1.2 1.2 1.2; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate"></a-image>
                        <a-image visible=true id="location-button-${item.id}" class="clickable" src="#icon-location" position="-0.8 0.2 0" height="0.15" width="0.15" animation="property: scale; to: 1.2 1.2 1.2; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate"></a-image>
                        <a-image visible=true id="play-button-${item.id}" class="clickable" src="#icon-play" position="-0.8 0 0" height="0.15" width="0.15" animation="property: scale; to: 1.2 1.2 1.2; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate"></a-image>
                        <a-image visible=true id="pause-button-${item.id}" class="clickable" src="#icon-pause" position="-0.8 -0.2 0" height="0.15" width="0.15" animation="property: scale; to: 1.2 1.2 1.2; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate"></a-image>
                        <a-video id="${item.id}_video_1" webkit-playsinline playsinline src="#${item.id}_video_1" position="0 0 0" width="1" height="1"></a-video>
                        <a-image id="${item.id}_2" src="#${item.id}_2" position="-0.3 0.8 0" width="0.5" height="0.5"></a-image>
                        <a-image id="${item.id}_3" src="#${item.id}_3" position="0.3 0.8 0" width="0.5" height="0.5"></a-image>
                        <a-text value="${item.text}" color="white" align="center" anchor="center" width="1" height="1" position="0 -0.8 0.5" font-weight="bold" font-size="50"></a-text>
                    </a-entity>
                `;
            container.appendChild(entity);
        });
    });

// fetch('data.json')
//     .then(response => response.json())
//     .then(data => {
//         const assetsContainer = document.querySelector('a-assets');
//         const sceneContainer = document.querySelector('a-scene');
//
//         data.forEach(item => {
//             // Crear elementos de assets
//             item.images.forEach(image => {
//                 const img = document.createElement('img');
//                 img.id = image.id;
//                 img.src = image.src;
//                 img.alt = image.alt;
//                 assetsContainer.appendChild(img);
//             });
//
//             const video = document.createElement('video');
//             video.id = item.video.id;
//             video.src = item.video.src;
//             video.setAttribute('autoplay', 'false');
//             video.setAttribute('loop', 'false');
//             assetsContainer.appendChild(video);
//
//             // Crear entidad principal
//             const entity = document.createElement('a-entity');
//             entity.id = `entity-${item.id}`;
//             entity.setAttribute('mindar-image-target', `targetIndex: ${item.targetIndex}`);
//
//             const plane = document.createElement('a-plane');
//             plane.id = `plane-${item.id}`;
//             plane.classList.add('clickable');
//             plane.setAttribute('src', `#${item.images[0].id}`);
//             plane.setAttribute('position', '0 0 0');
//             plane.setAttribute('width', '1');
//             plane.setAttribute('height', '1');
//             plane.setAttribute('rotation', '0 0 0');
//             entity.appendChild(plane);
//
//             const panel = document.createElement('a-entity');
//             panel.id = `panel-${item.id}`;
//             panel.setAttribute('visible', 'false');
//             panel.setAttribute('position', '0 0 0');
//
//             const buttons = [
//                 { id: 'web-button', src: '#icon-web', position: '-0.8 0.4 0' },
//                 { id: 'location-button', src: '#icon-location', position: '-0.8 0.2 0' },
//                 { id: 'play-button', src: '#icon-play', position: '-0.8 0 0' },
//                 { id: 'pause-button', src: '#icon-pause', position: '-0.8 -0.2 0' }
//             ];
//
//             buttons.forEach(button => {
//                 const aImage = document.createElement('a-image');
//                 aImage.id = `${button.id}-${item.id}`;
//                 aImage.classList.add('clickable');
//                 aImage.setAttribute('src', button.src);
//                 aImage.setAttribute('position', button.position);
//                 aImage.setAttribute('height', '0.15');
//                 aImage.setAttribute('width', '0.15');
//                 aImage.setAttribute('animation', 'property: scale; to: 1.2 1.2 1.2; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate');
//                 panel.appendChild(aImage);
//             });
//
//             const aVideo = document.createElement('a-video');
//             aVideo.id = item.video.id;
//             aVideo.setAttribute('webkit-playsinline', '');
//             aVideo.setAttribute('playsinline', '');
//             aVideo.setAttribute('src', `#${item.video.id}`);
//             aVideo.setAttribute('position', '0 0 0');
//             aVideo.setAttribute('width', '1');
//             aVideo.setAttribute('height', '1');
//             panel.appendChild(aVideo);
//
//             item.images.forEach((image, index) => {
//                 if (index > 0) {
//                     const aImage = document.createElement('a-image');
//                     aImage.id = image.id;
//                     aImage.setAttribute('src', `#${image.id}`);
//                     aImage.setAttribute('position', index === 1 ? '-0.3 0.8 0' : '0.3 0.8 0');
//                     aImage.setAttribute('width', '0.5');
//                     aImage.setAttribute('height', '0.5');
//                     panel.appendChild(aImage);
//                 }
//             });
//
//             const aText = document.createElement('a-text');
//             aText.setAttribute('value', item.text);
//             aText.setAttribute('color', 'white');
//             aText.setAttribute('align', 'center');
//             aText.setAttribute('anchor', 'center');
//             aText.setAttribute('width', '1');
//             aText.setAttribute('height', '1');
//             aText.setAttribute('position', '0 -0.8 0.5');
//             aText.setAttribute('font-weight', 'bold');
//             aText.setAttribute('font-size', '50');
//             panel.appendChild(aText);
//
//             entity.appendChild(panel);
//             sceneContainer.appendChild(entity);
//         });
//     });
