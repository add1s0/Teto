document.addEventListener("DOMContentLoaded", () => {

    // ===== TAKEN / MISSED / SNOOZE =====
    document.querySelectorAll(".schedule-item").forEach(item => {

        const buttons = item.querySelectorAll("button");

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {

                // махаме всички стилове
                buttons.forEach(b => b.classList.remove("active"));

                // маркираме текущия
                btn.classList.add("active");

                // текст (optional)
                console.log("Status:", btn.textContent);
            });
        });
    });

    // ===== QUICK ACTIONS =====
    document.querySelectorAll(".quick-actions button").forEach(btn => {
        btn.addEventListener("click", () => {
            alert(btn.textContent + " clicked");
        });
    });


    // ===== BOTTOM ACTIONS =====
    document.querySelectorAll(".quick-actions-bottom button").forEach(btn => {
        btn.addEventListener("click", () => {
            alert(btn.textContent);
        });
    });


    // ===== VIEW DETAILS =====
    document.querySelectorAll(".condition-item button").forEach(btn => {
        btn.addEventListener("click", () => {
            alert("Opening condition details...");
        });
    });

    document.addEventListener("DOMContentLoaded", () => {

    // ===== BUTTONS IN SCHEDULE =====
    document.querySelectorAll(".schedule-item button").forEach(btn => {

        btn.addEventListener("click", () => {

            // намира всички бутони в реда
            const parent = btn.parentElement;
            const allBtns = parent.querySelectorAll("button");

            // маха active от всички
            allBtns.forEach(b => b.classList.remove("active"));

            // слага active на натиснатия
            btn.classList.add("active");

        });

    });

});