document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".schedule-item").forEach(item => {
        const buttons = item.querySelectorAll(".schedule-actions button");

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                buttons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                console.log("Статус:", btn.textContent);
            });
        });
    });

    document.querySelectorAll(".quick-actions button").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!btn.hasAttribute("onclick")) {
                alert(btn.textContent);
            }
        });
    });

    document.querySelectorAll(".secondary-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            alert("Добавяне на симптом...");
        });
    });
});