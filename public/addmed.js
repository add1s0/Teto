document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("medications-container");
    const form = document.getElementById("medicineForm");

    // ===== DOSE → CREATE TIME INPUTS =====
    function attachDoseListener(card) {

        const doseInput = card.querySelector("[name='dose']");
        const timeContainer = card.querySelector(".time-container");

        doseInput.addEventListener("input", () => {

            const dose = parseInt(doseInput.value);

            timeContainer.innerHTML = "";

            if (!dose || dose < 1) return;

            for (let i = 0; i < dose; i++) {

                const timeInput = document.createElement("input");
                timeInput.type = "time";
                timeInput.name = "time";
                timeInput.required = true;

                timeContainer.appendChild(timeInput);
            }
        });
    }

    // ===== REMOVE MEDICINE =====
    function attachRemoveListener(card) {

        const removeBtn = card.querySelector(".remove-btn");

        removeBtn.addEventListener("click", () => {

            // не позволява да изтриеш последния
            if (document.querySelectorAll(".medicine-card").length === 1) {
                alert("Трябва да има поне едно лекарство");
                return;
            }

            card.remove();
        });
    }

    // ===== APPLY TO FIRST CARD =====
    document.querySelectorAll(".medicine-card").forEach(card => {
        attachDoseListener(card);
        attachRemoveListener(card);
    });

    // ===== ADD NEW MEDICINE =====
    document.getElementById("addMedicineBtn").addEventListener("click", () => {

        const newCard = document.createElement("div");
        newCard.classList.add("card", "medicine-card");

        newCard.innerHTML = `
            <button type="button" class="remove-btn">✕</button>

            <input type="text" name="name" placeholder="Име на лекарството" required>

            <input type="number" name="dose" placeholder="Дневна доза" min="1" required>

            <div class="time-container"></div>
        `;

        container.appendChild(newCard);

        attachDoseListener(newCard);
        attachRemoveListener(newCard);
    });

    // ===== SUBMIT =====
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const cards = document.querySelectorAll(".medicine-card");

        const medicines = [];

        cards.forEach(card => {

            const name = card.querySelector("[name='name']").value;
            const dose = card.querySelector("[name='dose']").value;

            const times = [];

            card.querySelectorAll("[name='time']").forEach(t => {
                times.push(t.value);
            });

            medicines.push({
                name,
                dose,
                times
            });
        });

        console.log("DATA:", medicines);

        try {
            const response = await fetch("http://localhost:3000/meds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ medicines })
            });

            const data = await response.json();

            alert("Лекарствата са добавени успешно!");
            console.log(data);

        } catch (error) {
            console.error(error);
            alert("Грешка при изпращане!");
        }
    });

});