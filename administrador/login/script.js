document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que el formulario se envíe

    // Datos de usuario válidos (simulados)
    const validUsername = "admin";
    const validPassword = "password";

    // Obtener valores del formulario
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validar credenciales
    if (username === validUsername && password === validPassword) {
        // Redirigir a otra página
        window.location.href = "../custom_data/add_custom_data.html";
        sessionStorage.setItem('loggedIn', true);
    } else {
        sessionStorage.removeItem('loggedIn');
        // Mostrar mensaje de error
        document.getElementById('error-message').textContent = "Usuario o contraseña incorrectos.";
    }
});
