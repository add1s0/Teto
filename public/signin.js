document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("signupForm");
    const passwordInput = document.getElementById("password");
    const errorText = document.getElementById("passwordError");

    function validatePassword() {
        const password = passwordInput.value;

        const hasMinLength = password.length >= 8;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasMinLength || !hasSpecialChar) {

            // 👉 текст на 2 реда + nowrap за символите
            let message = "Password must contain:<br>at least 8 characters; at least 1 special symbol <span class='nowrap'>(!@#...)</span>";

            errorText.innerHTML = message;
            errorText.style.display = "block";

            // 👉 shake ефект
            passwordInput.classList.add("shake");

            setTimeout(() => {
                passwordInput.classList.remove("shake");
            }, 300);

            // 👉 изтриваме само паролата
            passwordInput.value = "";

            return false;
        }

        errorText.style.display = "none";
        return true;
    }

    // 👉 submit проверка
    form.addEventListener("submit", function (e) {
        if (!validatePassword()) {
            e.preventDefault();
        }
    });

});