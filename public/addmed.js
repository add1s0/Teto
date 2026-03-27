document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("medications-container");
    const form = document.getElementById("medicineForm");
    const addMedicineBtn = document.getElementById("addMedicineBtn");

    function setupAutocomplete(card) {
        const input = card.querySelector(".medInput");
        const list = card.querySelector(".suggestionsList");

        if (!input || !list) return;

        input.addEventListener("input", async () => {
            const val = input.value.trim();

            if (val.length < 2) {
                list.style.display = "none";
                return;
            }

            try {
                const res = await fetch(`http://localhost:3000/meds/search?term=${encodeURIComponent(val)}`);
                const medicines = await res.json();

                if (medicines.length > 0) {
                    list.innerHTML = medicines
                        .map(m => `<li class="suggestion-item">${m.name}</li>`)
                        .join("");
                    list.style.display = "block";
                } else {
                    list.style.display = "none";
                }
            } catch (err) {
                console.error("Autocomplete error:", err);
            }
        });

        list.addEventListener("click", (e) => {
            if (e.target.classList.contains("suggestion-item")) {
                input.value = e.target.innerText;
                list.style.display = "none";
            }
        });

        document.addEventListener("click", (e) => {
            if (!card.contains(e.target)) {
                list.style.display = "none";
            }
        });
    }

    function attachDoseListener(card) {
        const doseInput = card.querySelector("[name='dose']");
        const timeContainer = card.querySelector(".time-container");

        doseInput.addEventListener("input", () => {
            const dose = parseInt(doseInput.value);
            timeContainer.innerHTML = "";

            if (!dose || dose < 1) return;

            for (let i = 0; i < dose; i++) {
                const label = document.createElement("label");
                label.textContent = `Час ${i + 1}:`;

                const timeInput = document.createElement("input");
                timeInput.type = "time";
                timeInput.name = "time";
                timeInput.required = true;

                timeContainer.appendChild(label);
                timeContainer.appendChild(timeInput);
            }
        });
    }

    function attachRemoveListener(card) {
        const removeBtn = card.querySelector(".remove-btn");

        removeBtn.addEventListener("click", () => {
            if (document.querySelectorAll(".medicine-card").length === 1) {
                alert("Трябва да има поне едно лекарство");
                return;
            }

            card.remove();
        });
    }

    function setupCard(card) {
        attachDoseListener(card);
        attachRemoveListener(card);
        setupAutocomplete(card);
    }

    document.querySelectorAll(".medicine-card").forEach(setupCard);

    addMedicineBtn.addEventListener("click", () => {
        const newCard = document.createElement("div");
        newCard.classList.add("card", "medicine-card");

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
        setupCard(newCard);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const savedUser = JSON.parse(localStorage.getItem("medguideUser"));

        if (!savedUser || !savedUser.id) {
            alert("Няма логнат потребител. Моля, влез отново.");
            window.location.href = "login.html";
            return;
        }

        const userId = savedUser.id;
        const cards = document.querySelectorAll(".medicine-card");

        const requests = [];

        for (const card of cards) {
            const name = card.querySelector("[name='name']").value.trim();
            const dose = card.querySelector("[name='dose']").value.trim();
            const timeInputs = card.querySelectorAll("[name='time']");

            if (!name || !dose || timeInputs.length === 0) {
                alert("Моля, попълни всички полета за всяко лекарство.");
                return;
            }

            for (const timeInput of timeInputs) {
                const time = timeInput.value;

                if (!time) {
                    alert("Моля, попълни всички часове.");
                    return;
                }

                requests.push(
                    fetch("http://localhost:3000/meds/add", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userId,
                            name,
                            dosage: `${dose} пъти дневно`,
                            time
                        })
                    })
                );
            }
        }

        try {
            const responses = await Promise.all(requests);
            const results = await Promise.all(responses.map(r => r.json()));

            const failed = responses.find(r => !r.ok);

            if (failed) {
                console.log(results);
                alert("Грешка при добавяне на някои лекарства.");
                return;
            }

            alert("Лекарствата са добавени успешно!");
            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("Add medicine error:", error);
            alert("Грешка при изпращане!");
        }
    });
});