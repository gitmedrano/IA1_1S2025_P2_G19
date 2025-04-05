// window.addEventListener('message', (evento) => {
//     console.log("origen: ", evento.data.origen);
//     if (evento.data.origen === 'father') {
//         console.log("mensaje: ", evento.data.mensaje);
//         console.log("filter: ", evento.data.filter);
//     }
// });
//
//
function senMessage() {
    // const iframe = document.getElementById('normal_scene');
    // const mensaje = {origen: "filter", mensaje: "filter"};
    // iframe.contentWindow.postMessage(mensaje, '*');
    window.parent.postMessage({origen: 'filter', mensaje: 'removeFilter'}, '*');
}
