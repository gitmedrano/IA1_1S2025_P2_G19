document.addEventListener('DOMContentLoaded', function () {
    const loading = document.querySelector('.loading');
    loading.classList.add('active');

    const sceneEl = document.querySelector('a-scene');
    sceneEl.addEventListener('loaded', function () {
        loading.classList.remove('active');
    });

    sceneEl.addEventListener('arError', function (ev) {
        loading.classList.remove('active');
        alert('Lo sentimos, hubo un error al iniciar la experiencia AR. Por favor, asegúrate de dar permiso a la cámara y refresca la página.');
    });

    const entityCenotes = document.querySelector('#entity-cenotes_candelaria');
    const planeCenotes = document.querySelector('#plane-cenotes_candelaria');
    const entityLagoAtitlan = document.querySelector('#entity-lago_atitlan');
    const planeLagoAtitlan = document.querySelector('#plane-lago_atitlan');
    const entityLagunaBrava = document.querySelector('#entity-laguna_brava');
    const planeLagunaBrava = document.querySelector('#plane-laguna_brava');
    const entityLasConchas = document.querySelector('#entity-las_conchas');
    const planeLasConchas = document.querySelector('#plane-las_conchas');
    const entityRioDulce = document.querySelector('#entity-rio_dulce');
    const planeRioDulce = document.querySelector('#plane-rio_dulce');
    const entitySemucChampey = document.querySelector('#entity-semuc_champey');
    const planeSemucChampey = document.querySelector('#plane-semuc_champey');
    const entityTikal = document.querySelector('#entity-tikal');
    const planeTikal = document.querySelector('#plane-tikal');

    const panelLagunaBrava = document.querySelector('#panel-laguna_brava');
    const playButtonLagunaBrava = document.querySelector('#play-button-laguna_brava');
    const pauseButtonLagunaBrava = document.querySelector('#pause-button-laguna_brava');
    const videoLagunaBrava = document.querySelector('#laguna_brava_video_1');

    playButtonLagunaBrava.addEventListener('click', function () {
        videoLagunaBrava.play();
    });

    pauseButtonLagunaBrava.addEventListener('click', function () {
        videoLagunaBrava.pause();
    });

    sceneEl.addEventListener("arReady", (event) => {
        console.log("MindAR is ready")
    });
    // arError event triggered when something went wrong. Mostly browser compatbility issue
    sceneEl.addEventListener("arError", (event) => {
        console.log("MindAR failed to start")
    });
    // detect target found
    entityCenotes.addEventListener("targetFound", event => {
        console.log("target found");
        console.log("event: ", event);
    });

    entityLagoAtitlan.addEventListener("targetFound", event => {
        console.log("target found");
        console.log("event: ", event);
    });

    entityLagunaBrava.addEventListener("targetFound", event => {
        console.log("target found");
        console.log("event: ", event);
        panelLagunaBrava.setAttribute('visible', true);
    });

    entityLasConchas.addEventListener("targetFound", event => {
        console.log("target found");
        console.log("event: ", event);
    });

    entityRioDulce.addEventListener("targetFound", event => {
        console.log("target found");
        console.log("event: ", event);
    });

    entitySemucChampey.addEventListener("targetFound", event => {
        console.log("target found");
        console.log("event: ", event);
    });

    entityTikal.addEventListener("targetFound", event => {
        console.log("target found");
        console.log("event: ", event);
    });


    // detect target lost
    entityCenotes.addEventListener("targetLost", event => {
        console.log("target lost");
    });

    entityLagoAtitlan.addEventListener("targetLost", event => {
        console.log("target lost");
    });

    entityLagunaBrava.addEventListener("targetLost", event => {
        console.log("target lost");
        videoLagunaBrava.pause();
        panelLagunaBrava.setAttribute('visible', false);
    });

    entityLasConchas.addEventListener("targetLost", event => {
        console.log("target lost");
    });

    entityRioDulce.addEventListener("targetLost", event => {
        console.log("target lost");
    });

    entitySemucChampey.addEventListener("targetLost", event => {
        console.log("target lost");
    });

    entityTikal.addEventListener("targetLost", event => {
        console.log("target lost");
    });


    //add event listener to all planes
    planeCenotes.addEventListener("click", event => {
        console.log("plane click");
        window.location.href = ".././pages/cenotes_candelaria.html";
    });

    planeLagoAtitlan.addEventListener("click", event => {
        console.log("plane click");
        window.location.href = ".././pages/lago_atitlan.html";
    });

    planeLagunaBrava.addEventListener("click", event => {
        console.log("plane click");
        window.location.href = ".././pages/laguna_brava.html";
    });

    planeLasConchas.addEventListener("click", event => {
        console.log("plane click");
        window.location.href = ".././pages/las_conchas.html";
    });

    planeRioDulce.addEventListener("click", event => {
        console.log("plane click");
        window.location.href = ".././pages/rio_dulce.html";
    });

    planeSemucChampey.addEventListener("click", event => {
        console.log("plane click");
        window.location.href = ".././pages/semuc_champey.html";
    });

    planeTikal.addEventListener("click", event => {
        console.log("plane click");
        window.location.href = ".././pages/tikal.html";
    });

});
