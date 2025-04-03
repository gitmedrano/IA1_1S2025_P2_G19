function validateLoggedIn(){
    let loggedIn = sessionStorage.getItem('loggedIn');
    return loggedIn ? loggedIn.toLowerCase() === "true" : false;
}

function validateLoginRoute() {

    if (!validateLoggedIn()) {
        window.location.href = "./administrador/login/login.html";
    }else{
        window.location.href = "./administrador/custom_data/add_custom_data.html";
    }
}
