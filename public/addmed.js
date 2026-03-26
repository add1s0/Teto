document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("medications-container");
    const form = document.getElementById("medicineForm");
    function setupAutocomplete(card) {
    const input = card.querySelector('.medInput');
    const list = card.querySelector('.suggestionsList');
    input.addEventListener('input', async () => {
        const val = input.value.trim();
        if (val.length < 2) { list.style.display = 'none'; return; }
        try {
            const res = await fetch(`http://localhost:3000/meds/search?term=${encodeURIComponent(val)}`);
            const medicines = await res.json();
            if (medicines.length > 0) {
                list.innerHTML = medicines.map(m => `<li class="suggestion-item">${m.name}</li>`).join('');
                list.style.display = 'block';
            } else { list.style.display = 'none'; }
        } catch (err) { console.error(err); }
    });
    list.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-item')) {
            input.value = e.target.innerText;
            list.style.display = 'none';
        }
    });
    document.addEventListener('click', (e) => { if (!card.contains(e.target)) list.style.display = 'none'; });
}

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
        setupAutocomplete(card);
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
            setupAutocomplete(newCard);
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