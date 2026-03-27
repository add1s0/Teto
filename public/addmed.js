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
                list.innerHTML = "";
                return;
            }

            try {
                const res = await fetch(`http://localhost:3000/meds/search?term=${encodeURIComponent(val)}`);
                const medicines = await res.json();

                if (Array.isArray(medicines) && medicines.length > 0) {
                    list.innerHTML = medicines
                        .map(m => `<li class="suggestion-item">${m.name}</li>`)
                        .join("");
                    list.style.display = "block";
                } else {
                    list.innerHTML = "";
                    list.style.display = "none";
                }
            } catch (err) {
                console.error("Грешка при търсене на лекарства:", err);
                list.innerHTML = "";
                list.style.display = "none";
            }
        });

        list.addEventListener("click", (e) => {
            if (e.target.classList.contains("suggestion-item")) {
                input.value = e.target.innerText.trim();
                list.innerHTML = "";
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

        if (!doseInput || !timeContainer) return;

        doseInput.addEventListener("input", () => {
            const dose = parseInt(doseInput.value, 10);
            timeContainer.innerHTML = "";

            if (!dose || dose < 1) return;

            for (let i = 0; i < dose; i++) {
                const wrapper = document.createElement("div");
                wrapper.classList.add("time-input-group");

                const label = document.createElement("label");
                label.textContent = `Час ${i + 1}:`;

                const timeInput = document.createElement("input");
                timeInput.type = "time";
                timeInput.name = "time";
                timeInput.required = true;

                wrapper.appendChild(label);
                wrapper.appendChild(timeInput);
                timeContainer.appendChild(wrapper);
            }
        });
    }

    function attachRemoveListener(card) {
        const removeBtn = card.querySelector(".remove-btn");

        if (!removeBtn) return;

        removeBtn.addEventListener("click", () => {
            const allCards = document.querySelectorAll(".medicine-card");

            if (allCards.length === 1) {
                alert("Трябва да има поне едно лекарство.");
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

    function createMedicineCard() {
        const newCard = document.createElement("div");
        newCard.className = "card medicine-card";

        newCard.innerHTML = `
            <button type="button" class="remove-btn">✕</button>

            <div class="autocomplete-wrapper">
                <input
                    type="text"
                    name="name"
                    class="medInput"
                    placeholder="Име на лекарството"
                    required
                    autocomplete="off"
                >
                <ul class="suggestionsList"></ul>
            </div>

            <input
                type="number"
                name="dose"
                placeholder="Дневна доза (пъти на ден)"
                min="1"
                max="12"
                required
            >

            <div class="time-container"></div>
        `;

        return newCard;
    }

    document.querySelectorAll(".medicine-card").forEach(setupCard);

    addMedicineBtn.addEventListener("click", () => {
        const newCard = createMedicineCard();
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
            const nameInput = card.querySelector("[name='name']");
            const doseInput = card.querySelector("[name='dose']");
            const timeInputs = card.querySelectorAll("[name='time']");

            const name = nameInput ? nameInput.value.trim() : "";
            const dose = doseInput ? doseInput.value.trim() : "";

            if (!name || !dose) {
                alert("Моля, попълни име и доза за всяко лекарство.");
                return;
            }

            if (!timeInputs.length) {
                alert("Моля, въведи часовете за прием на всяко лекарство.");
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
            const results = await Promise.all(
                responses.map(async (response) => {
                    try {
                        return await response.json();
                    } catch {
                        return null;
                    }
                })
            );

            const failedResponse = responses.find(response => !response.ok);

            if (failedResponse) {
                console.log("Add medicine results:", results);
                alert("Грешка при добавяне на някои лекарства.");
                return;
            }

            console.log("Add medicine results:", results);
            alert("Лекарствата са добавени успешно!");
            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("Грешка при изпращане на лекарствата:", error);
            alert("Няма връзка със сървъра.");
        }
    });
});