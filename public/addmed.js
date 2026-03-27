document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("medications-container");
    const form = document.getElementById("medicineForm");
    const addMedicineBtn = document.getElementById("addMedicineBtn");

    // ===== 1. ЛОГИКА ЗА АУТО-КОМПЛИТ =====
    function setupAutocomplete(card) {
        const input = card.querySelector('.medInput');
        const list = card.querySelector('.suggestionsList');

        if (!input || !list) return;

        input.addEventListener('input', async () => {
            const val = input.value.trim();
            
            // Търсим само ако има поне 2 символа
            if (val.length < 2) { 
                list.style.display = 'none'; 
                return; 
            }

            try {
                // ВАЖНО: Увери се, че бекендът ти слуша на този URL
                const res = await fetch(`http://localhost:3000/meds/search?term=${encodeURIComponent(val)}`);
                const medicines = await res.json();

                if (medicines.length > 0) {
                    list.innerHTML = medicines.map(m => `
                        <li class="suggestion-item">
                            ${m.name}
                        </li>
                    `).join('');
                    list.style.display = 'block';
                } else {
                    list.style.display = 'none';
                }
            } catch (err) {
                console.error("Грешка при търсене на лекарства:", err);
            }
        });

        // Избор от списъка
        list.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                input.value = e.target.innerText;
                list.style.display = 'none';
            }
        });

        // Затваряне на менюто при клик извън него
        document.addEventListener('click', (e) => {
            if (!card.contains(e.target)) {
                list.style.display = 'none';
            }
        });
    }

    // ===== 2. ГЕНЕРИРАНЕ НА ПОЛЕТА ЗА ЧАС СПРЕД ДОЗАТА =====
    function attachDoseListener(card) {
        const doseInput = card.querySelector("[name='dose']");
        const timeContainer = card.querySelector(".time-container");

        doseInput.addEventListener("input", () => {
            const dose = parseInt(doseInput.value);
            timeContainer.innerHTML = ""; // Изчистваме старите часове

            if (!dose || dose < 1) return;

            // Създаваме толкова input-а, колкото е дозата
            for (let i = 0; i < dose; i++) {
                const timeInput = document.createElement("input");
                timeInput.type = "time";
                timeInput.name = "time";
                timeInput.required = true;
                timeContainer.appendChild(timeInput);
            }
        });
    }

    // ===== 3. ПРЕМАХВАНЕ НА КАРТА =====
    function attachRemoveListener(card) {
        const removeBtn = card.querySelector(".remove-btn");
        
        removeBtn.addEventListener("click", () => {
            const allCards = document.querySelectorAll(".medicine-card");
            if (allCards.length > 1) {
                card.remove();
            } else {
                alert("Трябва да добавите поне едно лекарство!");
            }
        });
    }

    // ===== 4. ИНИЦИАЛИЗИРАНЕ НА ПЪРВАТА КАРТА =====
    const initialCard = document.querySelector(".medicine-card");
    if (initialCard) {
        attachDoseListener(initialCard);
        attachRemoveListener(initialCard);
        setupAutocomplete(initialCard);
    }

    // ===== 5. ДОБАВЯНЕ НА НОВА КАРТА (БУТОН +) =====
    addMedicineBtn.addEventListener("click", () => {
        const newCard = document.createElement("div");
        newCard.className = "card medicine-card";

        // Структурата трябва да е идентична с първата карта
        newCard.innerHTML = `
            <button type="button" class="remove-btn">✕</button>
            <div class="autocomplete-wrapper">
                <input type="text" name="name" class="medInput" placeholder="Име на лекарството" required autocomplete="off">
                <ul class="suggestionsList"></ul>
            </div>
            <input type="number" name="dose" placeholder="Дневна доза" min="1" required>
            <div class="time-container"></div>
        `;

        container.appendChild(newCard);

        // Закачаме всички слушатели за новата карта
        attachDoseListener(newCard);
        attachRemoveListener(newCard);
        setupAutocomplete(newCard);
    });

    // ===== 6. ИЗПРАЩАНЕ НА ФОРМАТА =====
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const cards = document.querySelectorAll(".medicine-card");
        const medicinesData = [];

        cards.forEach(card => {
            const name = card.querySelector("[name='name']").value;
            const dose = card.querySelector("[name='dose']").value;
            const times = Array.from(card.querySelectorAll("[name='time']")).map(t => t.value);

            if (name && dose) {
                medicinesData.push({
                    name: name,
                    dose: dose,
                    times: times
                });
            }
        });

        if (medicinesData.length === 0) return;

        try {
            const response = await fetch("http://localhost:3000/meds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ medicines: medicinesData })
            });

            if (response.ok) {
                alert("Лекарствата бяха записани успешно!");
                window.location.href = 'dashboard.html';
            } else {
                alert("Грешка при запис на данните.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Няма връзка със сървъра.");
        }
    });
});