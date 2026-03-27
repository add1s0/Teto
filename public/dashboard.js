document.addEventListener("DOMContentLoaded", async () => {
    // Базов URL към вашия API
    const API_URL = "http://localhost:3000/api";

    try {
        // Зареждане на данни за лекарства и симптоми едновременно
        const [medsRes, eventsRes] = await Promise.all([
            fetch(`${API_URL}/meds`),
            fetch(`${API_URL}/symptoms/all`)
        ]);

        if (!medsRes.ok || !eventsRes.ok) throw new Error("Грешка при връзка с API");

        const medications = await medsRes.json();
        const allEvents = await eventsRes.json();

        // Обновяване на всички секции
        updateTopStats(medications, allEvents);
        renderExpandedSchedule(medications);
        renderRecentSymptoms(allEvents);

    } catch (err) {
        console.error("Dashboard Error:", err);
        // Показване на съобщение за грешка в стария стил (червен текст)
        const scheduleContainer = document.getElementById('daily-schedule');
        if (scheduleContainer) {
            scheduleContainer.innerHTML = `<p class="loading-msg" style="color: #ff6b6b; font-style: normal;">Грешка при зареждане на данните. Моля, проверете бекенда.</p>`;
        }
    }

    // 1. Обновяване на големите карти със статистики
    function updateTopStats(meds, events) {
        const medsCountElem = document.getElementById('meds-count');
        const nextReminderElem = document.getElementById('next-reminder');
        const symptomsCountElem = document.getElementById('symptoms-count');

        // Брой лекарства
        if (medsCountElem) medsCountElem.innerText = `${meds.length} лекарства`;

        // Брой симптоми за днес
        const today = new Date().toISOString().split('T')[0];
        const todaysCount = events.filter(e => e.date === today).length;
        if (symptomsCountElem) symptomsCountElem.innerText = `${todaysCount} днес`;

        // Изчисляване на следващо напомняне
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        let closestMins = null;

        meds.forEach(med => {
            const times = Array.isArray(med.times) ? med.times : JSON.parse(med.times || "[]");
            times.forEach(t => {
                const [h, m] = t.split(':').map(Number);
                const doseMins = h * 60 + m;
                if (doseMins > currentMins) {
                    if (closestMins === null || doseMins < closestMins) closestMins = doseMins;
                }
            });
        });

        if (nextReminderElem) {
            if (closestMins !== null) {
                const h = Math.floor(closestMins / 60).toString().padStart(2, '0');
                const m = (closestMins % 60).toString().padStart(2, '0');
                nextReminderElem.innerText = `${h}:${m}`;
            } else {
                nextReminderElem.innerText = "--:--";
            }
        }
    }

    // 2. Рендериране на графика (разпънат вариант)
    function renderExpandedSchedule(meds) {
        const container = document.getElementById('daily-schedule');
        if (!container) return;

        let fullSchedule = [];
        meds.forEach(med => {
            const times = Array.isArray(med.times) ? med.times : JSON.parse(med.times || "[]");
            times.forEach(t => {
                const [h, m] = t.split(':').map(Number);
                fullSchedule.push({ name: med.name, time: t, mins: h * 60 + m });
            });
        });

        // Сортиране по час
        fullSchedule.sort((a, b) => a.mins - b.mins);

        if (fullSchedule.length === 0) {
            container.innerHTML = `<p class="loading-msg">Няма планирани лекарства за днес.</p>`;
            return;
        }

        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        // Генериране на HTML за всяко лекарство с новите бутони
        container.innerHTML = fullSchedule.map(item => `
            <div class="schedule-item" style="margin-bottom: 1.5rem; padding: 1.5rem; background: #f9fbf9; border-radius: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 1.3rem; font-weight: bold; color: #124170;">${item.time} – ${item.name}</span>
                <div class="schedule-actions" style="display: flex; gap: 1rem;">
                    ${item.mins <= currentMins 
                        ? `<button onclick="markTaken('${item.name}')" style="background: #67C090; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 0.8rem; cursor: pointer; font-weight: bold;">Прието</button>` 
                        : `<button style="background: #d9d9d9; color: #666; border: none; padding: 0.8rem 1.5rem; border-radius: 0.8rem; cursor: not-allowed;" disabled>Изчаква</button>`}
                </div>
            </div>
        `).join('');
    }

    // 3. Рендериране на история на симптомите в дясната колона
    function renderRecentSymptoms(events) {
        const container = document.getElementById('recent-symptoms');
        if (!container) return;

        if (events.length === 0) {
            container.innerHTML = `<p class="loading-msg">Няма скорошни записи.</p>`;
            return;
        }

        // Показваме последните 3 симптома, за да запълним мястото
        container.innerHTML = events.slice(0, 3).map(e => `
            <div class="symptom-row" style="padding: 1rem 0; border-bottom: 1px solid #eee;">
                <p style="margin: 0; font-weight: bold; font-size: 1.1rem; color: #124170;">${e.title}</p>
                <p style="margin: 5px 0 0 0; color: #26667F; font-size: 0.95rem;">${e.date} • ${e.time} — ${e.severity || 'лек'}</p>
            </div>
        `).join('');
    }
});

// Глобална функция за бутона "Прието"
function markTaken(name) {
    alert(`Браво! Отбелязахте приема на ${name}.`);
}