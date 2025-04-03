function validateLoggedIn(){
    let loggedIn = sessionStorage.getItem('loggedIn');
    return loggedIn ? loggedIn.toLowerCase() === "true" : false;
}

