document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const data = {
            email: document.getElementById("loginEmail").value.trim(),
            password: document.getElementById("loginPassword").value
        };

        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log("LOGIN RESULT:", result);

            if (!response.ok) {
                alert(result.message || "Грешка при вход.");
                return;
            }

            localStorage.setItem("medguideUser", JSON.stringify(result.user));
            console.log("STORED USER:", localStorage.getItem("medguideUser"));

            alert(result.message || "Входът е успешен.");
            window.location.href = "home2.html";
        } catch (error) {
            console.error("Login error:", error);
            alert("Сървърна грешка при вход.");
        }
    });
});