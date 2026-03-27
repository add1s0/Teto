document.addEventListener("DOMContentLoaded", () => {
    const symptomsContainer = document.getElementById("symptoms-container");
    const addSymptomBtn = document.getElementById("addSymptomBtn");
    const symptomForm = document.getElementById("symptomForm");

    // Функция за изтриване на карта
    function attachRemoveEvent(button) {
        button.addEventListener("click", () => {
            const allCards = document.querySelectorAll(".symptom-card");
            // Проверка да не изтрием последната останала карта
            if (allCards.length > 1) {
                button.closest('.symptom-card').remove();
            } else {
                alert("Трябва да има поне един симптом.");
            }
        });
    }

    // Форматиране на дата (ДД.ММ)
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

    // Форматиране на час (ЧЧ:ММ)
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

    // Закачане на всички събития към една карта
    function attachCardEvents(card) {
        const removeBtn = card.querySelector(".remove-btn");
        const dateInput = card.querySelector('input[name="date"]');
        const timeInput = card.querySelector('input[name="time"]');

        if (removeBtn) attachRemoveEvent(removeBtn);
        if (dateInput) attachDateFormatting(dateInput);
        if (timeInput) attachTimeFormatting(timeInput);
    }

    // Първоначално закачане на събития към съществуващата карта
    document.querySelectorAll(".symptom-card").forEach(card => {
        attachCardEvents(card);
    });

    // Логика за бутона "+ Добави още"
    addSymptomBtn.addEventListener("click", () => {
        const symptomCard = document.createElement("div");
        symptomCard.className = "card symptom-card";

        // Генерираме новия HTML с правилното хиксче
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

    // Обработка на формата при изпращане
    symptomForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const symptomCards = document.querySelectorAll(".symptom-card");
        const symptoms = [];
        let hasError = false;

        symptomCards.forEach(card => {
            const symptom = card.querySelector('input[name="symptom"]').value.trim();
            const severity = card.querySelector('select[name="severity"]').value;
            const dateInput = card.querySelector('input[name="date"]');
            const timeInput = card.querySelector('input[name="time"]');
            const date = dateInput.value.trim();
            const time = timeInput.value.trim();

            const datePattern = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])$/;
            const timePattern = /^([01][0-9]|2[0-3]):([0-5][0-9])$/ ;

            if (!datePattern.test(date)) {
                hasError = true;
                dateInput.style.borderColor = "#ff6b6b";
            } else {
                dateInput.style.borderColor = "#eee";
            }

            if (!timePattern.test(time)) {
                hasError = true;
                timeInput.style.borderColor = "#ff6b6b";
            } else {
                timeInput.style.borderColor = "#eee";
            }

            symptoms.push({ symptom, severity, date, time });
        });

        if (hasError) {
            alert("Моля въведи дата във формат ДД.ММ и час във формат ЧЧ:ММ");
            return;
        }

        console.log("Изпращане на симптоми към сървъра...", symptoms);
        alert("Симптомите са добавени успешно!");
        window.location.href = "dashboard.html";
    });
});