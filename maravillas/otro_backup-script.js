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


    const entityLagunaBrava = document.querySelector('#entity-laguna_brava');
    const planeLagunaBrava = document.querySelector('#plane-laguna_brava');
    const panelLagunaBrava = document.querySelector('#panel-laguna_brava');
    const playButtonLagunaBrava = document.querySelector('#play-button-laguna_brava');
    const pauseButtonLagunaBrava = document.querySelector('#pause-button-laguna_brava');
    const videoLagunaBrava = document.querySelector('#laguna_brava_video_1');


    sceneEl.addEventListener("arReady", (event) => {
        console.log("MindAR is ready")
    });
    // arError event triggered when something went wrong. Mostly browser compatbility issue
    sceneEl.addEventListener("arError", (event) => {
        console.log("MindAR failed to start")
    });

    playButtonLagunaBrava.addEventListener('click', function () {
        videoLagunaBrava.play();
    });

    pauseButtonLagunaBrava.addEventListener('click', function () {
        videoLagunaBrava.pause();
    });

    // detect target found
    entityLagunaBrava.addEventListener("targetFound", event => {
        console.log("target found");
        console.log("event: ", event);
        panelLagunaBrava.setAttribute('visible', true);
    });

    // detect target lost
    entityLagunaBrava.addEventListener("targetLost", event => {
        console.log("target lost");
        videoLagunaBrava.pause();
        panelLagunaBrava.setAttribute('visible', false);
    });

    //add event listener to all planes
    planeLagunaBrava.addEventListener("click", event => {
        console.log("plane click");
        window.location.href = ".././pages/laguna_brava.html";
    });



    const entityLagunaBrava_1 = document.querySelector('#entity-laguna_brava-1');
    const planeLagunaBrava_1 = document.querySelector('#plane-laguna_brava-1');
    const panelLagunaBrava_1 = document.querySelector('#panel-laguna_brava-1');
    const playButtonLagunaBrava_1 = document.querySelector('#play-button-laguna_brava-1');
    const pauseButtonLagunaBrava_1 = document.querySelector('#pause-button-laguna_brava-1');
    const videoLagunaBrava_1 = document.querySelector('#laguna_brava_video_1-1');

    // detect target found
    entityLagunaBrava_1.addEventListener("targetFound", event => {
        console.log("target found");
        console.log("event: ", event);
        panelLagunaBrava_1.setAttribute('visible', true);
    });

    // detect target lost
    entityLagunaBrava_1.addEventListener("targetLost", event => {
        console.log("target lost");
        videoLagunaBrava.pause();
        panelLagunaBrava_1.setAttribute('visible', false);
    });

    //add event listener to all planes
    planeLagunaBrava_1.addEventListener("click", event => {
        console.log("plane click");
        window.location.href = ".././pages/laguna_brava.html";
    });

    playButtonLagunaBrava_1.addEventListener('click', function () {
        videoLagunaBrava_1.play();
    });

    pauseButtonLagunaBrava_1.addEventListener('click', function () {
        videoLagunaBrava_1.pause();
    });



});


// AFRAME.registerComponent('mytarget', {
//     init: function () {
//         this.el.addEventListener('targetFound', event => {
//             console.log("target found");
//             showAvatar(() => {
//                 setTimeout(() => {
//                     showPortfolio(() => {
//                         setTimeout(() => {
//                             showInfo();
//                         }, 300);
//                     });
//                 }, 300);
//             });
//         });
//         this.el.addEventListener('targetLost', event => {
//             console.log("target found");
//         });
//         //this.el.emit('targetFound');
//     }
// });


function consoleLog(message) {
    console.log(message);
}
