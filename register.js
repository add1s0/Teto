const form = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const errorText = document.getElementById("passwordError");

function validatePassword() {
    const password = passwordInput.value;

    const hasMinLength = password.length >= 8;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasMinLength || !hasSpecialChar) {
        let message = "Паролата трябва да има:";

        if (!hasMinLength) {
            message += " поне 8 символа;";
        }

        if (!hasSpecialChar) {
            message += " поне 1 специален символ (!@#...)";
        }

        errorText.innerText = message;
        errorText.style.display = "block";
        return false;
    }

    errorText.style.display = "none";
    return true;
}

form.addEventListener("submit", function(e) {
    if (!validatePassword()) {
        e.preventDefault();
    }
});

passwordInput.addEventListener("input", function() {
    validatePassword();
});