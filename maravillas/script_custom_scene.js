if (localStorage.getItem("customMind") && JSON.parse(localStorage.getItem("customMind"))
    && JSON.parse(localStorage.getItem("customData"))) {
    let customData = JSON.parse(localStorage.getItem("customData"));
    createScene(customData.filter(item => item.id !== 'custom_mind'), "custom_scene");
}

