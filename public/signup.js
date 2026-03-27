document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
    const passwordInput = document.getElementById("password");
    const errorText = document.getElementById("passwordError");

    if (!form) return;

    function validatePassword() {
        const password = passwordInput.value;

        const hasMinLength = password.length >= 8;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasMinLength || !hasSpecialChar) {
            const message =
                "Password must contain:<br>at least 8 characters; at least 1 special symbol <span class='nowrap'>(!@#...)</span>";

            errorText.innerHTML = message;
            errorText.style.display = "block";

            passwordInput.classList.add("shake");

            setTimeout(() => {
                passwordInput.classList.remove("shake");
            }, 300);

            passwordInput.value = "";
            return false;
        }

        errorText.style.display = "none";
        return true;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!validatePassword()) {
            return;
        }

        const data = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value,
            emergencyFirstName: document.getElementById("emergencyFirstName").value.trim(),
            emergencyLastName: document.getElementById("emergencyLastName").value.trim(),
            emergencyEmail: document.getElementById("emergencyEmail").value.trim()
        };

        try {
            const response = await fetch("http://localhost:3000/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log("Signup result:", result);

            if (!response.ok) {
                alert(result.message || "Грешка при регистрация.");
                return;
            }

            if (result.user) {
                localStorage.setItem("medguideUser", JSON.stringify(result.user));
            }

            alert(result.message || "Регистрацията е успешна.");
            window.location.href = "addmed.html";
        } catch (error) {
            console.error("Signup error:", error);
            alert("Сървърна грешка при регистрация.");
        }
    });
});