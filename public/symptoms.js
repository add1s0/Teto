document.addEventListener("DOMContentLoaded", () => {
    const symptomsContainer = document.getElementById("symptoms-container");
    const addSymptomBtn = document.getElementById("addSymptomBtn");
    const symptomForm = document.getElementById("symptomForm");

   

    function attachRemoveEvent(button) {
        button.addEventListener("click", () => {
            const allCards = document.querySelectorAll(".symptom-card");
            if (allCards.length > 1) {
                button.closest('.symptom-card').remove();
            } else {
                alert("Трябва да има поне един симптом.");
            }
        });
    }

    function attachDateFormatting(input) {
        input.addEventListener("input", () => {
            let value = input.value.replace(/\D/g, "");
            if (value.length > 4) value = value.slice(0, 4);
            if (value.length >= 3) {
                input.value = value.slice(0, 2) + "." + value.slice(2);
            } else {
                input.value = value;
            }
        });
    }

    function attachTimeFormatting(input) {
        input.addEventListener("input", () => {
            let value = input.value.replace(/\D/g, "");
            if (value.length > 4) value = value.slice(0, 4);
            if (value.length >= 3) {
                input.value = value.slice(0, 2) + ":" + value.slice(2);
            } else {
                input.value = value;
            }
        });
    }

    function attachCardEvents(card) {
        const removeBtn = card.querySelector(".remove-btn");
        const dateInput = card.querySelector('input[name="date"]');
        const timeInput = card.querySelector('input[name="time"]');

        if (removeBtn) attachRemoveEvent(removeBtn);
        if (dateInput) attachDateFormatting(dateInput);
        if (timeInput) attachTimeFormatting(timeInput);
    }

    document.querySelectorAll(".symptom-card").forEach(card => {
        attachCardEvents(card);
    });

    addSymptomBtn.addEventListener("click", () => {
        const symptomCard = document.createElement("div");
        symptomCard.className = "card symptom-card";
        symptomCard.innerHTML = `
            <button type="button" class="remove-btn">✕</button>
            <input type="text" name="symptom" placeholder="Въведи симптом" required>
            <select name="severity" required>
                <option value="" disabled selected>Избери колко е силен симптомът</option>
                <option value="слаб">Слаб</option>
                <option value="среден">Среден</option>
                <option value="силен">Силен</option>
            </select>
            <div class="date-time-group">
                <input type="text" name="date" placeholder="ДД.ММ" maxlength="5" required>
                <input type="text" name="time" placeholder="ЧЧ:ММ" maxlength="5" required>
            </div>
        `;
        symptomsContainer.appendChild(symptomCard);
        attachCardEvents(symptomCard);
    });

    

    symptomForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const symptomCards = document.querySelectorAll(".symptom-card");
        const symptomsData = [];
        let hasError = false;

        symptomCards.forEach(card => {
            const symptomName = card.querySelector('input[name="symptom"]').value.trim();
            const severity = card.querySelector('select[name="severity"]').value;
            const dateInput = card.querySelector('input[name="date"]');
            const timeInput = card.querySelector('input[name="time"]');
            const date = dateInput.value.trim();
            const time = timeInput.value.trim();

            // Валидация
            const datePattern = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])$/;
            const timePattern = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

            if (!datePattern.test(date) || !timePattern.test(time)) {
                hasError = true;
                if (!datePattern.test(date)) dateInput.style.borderColor = "#ff6b6b";
                if (!timePattern.test(time)) timeInput.style.borderColor = "#ff6b6b";
                return;
            }

            symptomsData.push({
                symptom: symptomName,
                severity: severity,
                date: date,
                time: time
            });
        });

        if (hasError) {
            alert("Моля въведи дата във формат ДД.ММ и час във формат ЧЧ:ММ");
            return;
        }

        try {
            
            const response = await fetch("http://localhost:3000/symptoms/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    symptoms: symptomsData,
                    userId: 1
                })
            });

            const result = await response.json();

            if (result.success) {
                alert("Симптомите бяха записани успешно!");
                window.location.href = "dashboard.html";
            } else {
                alert("Грешка при запис: " + (result.error || "Неизвестна грешка"));
            }
        } catch (error) {
            console.error("Грешка при връзка със сървъра:", error);
            alert("Няма връзка със сървъра. Проверете дали Node.js работи.");
        }
    });
});