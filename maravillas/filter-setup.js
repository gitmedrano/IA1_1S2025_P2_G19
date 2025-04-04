import * as THREE from 'three';
import {MindARThree} from 'mindar-face-three';

let mindarThree, renderer, scene, camera, faceMesh;

function setupFilter(filter) {
    if (mindarThree) {
        mindarThree.stop();
        renderer.setAnimationLoop(null);
        scene.clear();
        faceMesh = null;
    }

    mindarThree = new MindARThree({
        container: document.querySelector("#container"),
    });

    ({renderer, scene, camera} = mindarThree);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    if (faceMesh) scene.remove(faceMesh);
    faceMesh = mindarThree.addFaceMesh();
    const texture = new THREE.TextureLoader().load(filter);

    faceMesh.material.map = texture;
    faceMesh.material.transparent = true;
    faceMesh.material.needsUpdate = true;

    scene.add(faceMesh);

    const start = async () => {
        await mindarThree.start();
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });
    }
    start();
}

window.addEventListener('message', (evento) => {
    console.log("origen: ", evento.data.origen);
    console.log("mensaje: ", evento.data.mensaje);
    console.log("filter: ", evento.data.filter);
    if (evento.data.origen === 'father' && evento.data.mensaje === 'applyFilter') {
        setupFilter(evento.data.filter);
    }
});
