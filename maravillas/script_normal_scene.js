fetch('data.json')
    .then(response => response.json())
    .then(data => {
        createScene(data, "normal_scene");
    });
