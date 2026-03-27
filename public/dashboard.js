document.addEventListener("DOMContentLoaded", async () => {
    // --- 1. СЕЛЕКТИРАНЕ НА ЕЛЕМЕНТИТЕ ---
    const userNameEl = document.getElementById("userName");
    const medsCountEl = document.getElementById("meds-count");
    const nextReminderEl = document.getElementById("next-reminder");
    const symptomsCountEl = document.getElementById("symptoms-count");
    const scheduleContainer = document.getElementById("daily-schedule");
    const symptomsContainer = document.getElementById("recent-symptoms");

    // --- 2. ДИНАМИЧНО ИМЕ НА ПОТРЕБИТЕЛЯ ---
    const savedUser = localStorage.getItem("medguideUser");
    if (savedUser) {
        const user = JSON.parse(savedUser);
        // Изписва името от localStorage или "потребител" по подразбиране
        userNameEl.textContent = user.firstName || "потребител";
    } else {
        userNameEl.textContent = "потребител";
    }

    try {
        // --- 3. ИЗВЛИЧАНЕ НА ЛЕКАРСТВА (ГРАФИК) ---
        const medsRes = await fetch("http://localhost:3000/meds/all");
        if (!medsRes.ok) throw new Error("Грешка при зареждане на лекарствата");
        
        const medications = await medsRes.json();

        if (medications && medications.length > 0) {
            // Обновяваме брояча в горната карта
            medsCountEl.textContent = `${medications.length} лекарства`;

            // Логика за "Следващ прием"
            const now = new Date();
            const currentTotalMin = now.getHours() * 60 + now.getMinutes();
            
            const upcoming = medications
                .map(m => {
                    const [h, min] = m.time.split(':');
                    return { ...m, totalMin: parseInt(h) * 60 + parseInt(min) };
                })
                .filter(m => m.totalMin > currentTotalMin && !m.isTaken)
                .sort((a, b) => a.totalMin - b.totalMin);

            nextReminderEl.textContent = upcoming.length > 0 ? upcoming[0].time.slice(0, 5) : "Край за днес";

            // Генериране на списъка с лекарства (използва стиловете от твоя CSS)
            scheduleContainer.innerHTML = medications.map(med => `
                <div class="schedule-item" style="display:flex; justify-content:space-between; align-items:center; background:white; padding:1.2rem; margin-bottom:1rem; border-radius:1rem; box-shadow:0 2px 8px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
                    <div>
                        <b style="color:#67C090; font-size:1.2rem; margin-right:10px;">${med.time.slice(0, 5)}</b>
                        <span style="font-weight:bold; color:#124170;">${med.name}</span>
                        <div style="font-size:0.85rem; color:#666; margin-left:55px;">${med.dosage || 'Няма посочена доза'}</div>
                    </div>
                    <button class="take-btn" 
                        onclick="markAsTaken(this, ${med.id})" 
                        ${med.isTaken ? 'disabled' : ''}
                        style="background: ${med.isTaken ? '#67C090' : '#124170'}; color:white; border:none; padding:0.6rem 1.2rem; border-radius:0.6rem; cursor:pointer; font-weight:bold; transition: 0.3s;">
                        ${med.isTaken ? 'Взето ✓' : 'Прието'}
                    </button>
                </div>
            `).join('');
        } else {
            medsCountEl.textContent = "0";
            scheduleContainer.innerHTML = "<p class='loading-msg'>Няма добавени лекарства за днес.</p>";
        }

        // --- 4. ИЗВЛИЧАНЕ НА СИМПТОМИ (ИСТОРИЯ) ---
        // Използваме маршрута /summary, който подготвихме за обобщени данни
        const sympRes = await fetch("http://localhost:3000/symptoms/summary");
        if (!sympRes.ok) throw new Error("Грешка при зареждане на симптомите");
        
        const sympData = await sympRes.json();

        if (sympData.success) {
            // Обновяваме брояча "Проследени симптоми"
            symptomsCountEl.textContent = `${sympData.countToday} днес`;

            // Пълним историята в страничната лента (Sidebar)
            if (sympData.recent && sympData.recent.length > 0) {
                symptomsContainer.innerHTML = sympData.recent.map(log => `
                    <div class="symptom-row" style="padding:0.8rem 0; border-bottom:1px solid #eee;">
                        <strong style="display:block; color:#124170;">${log.title}</strong>
                        <p style="margin:2px 0; font-size:0.9rem; color:#555;">${log.description}</p>
                        <small style="color:#999;">днес в ${new Date(log.createdAt).toLocaleTimeString('bg-BG', {hour: '2-digit', minute:'2-digit'})}</small>
                    </div>
                `).join('');
            } else {
                symptomsContainer.innerHTML = "<p class='loading-msg'>Няма скорошни записи.</p>";
            }
        }

    } catch (err) {
        console.error("Dashboard Error:", err);
        if (scheduleContainer) {
            scheduleContainer.innerHTML = "<p style='color:red;'>Възникна грешка при връзката със сървъра.</p>";
        }
    }
});

/**
 * Функция за отбелязване на лекарство като изпито
 * Извиква се при клик на бутона "Прието" в графика
 */
async function markAsTaken(btn, medId) {
    try {
        const response = await fetch(`http://localhost:3000/meds/taken/${medId}`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            // Презареждаме страницата, за да се обновят автоматично всички броячи и "Следващ прием"
            location.reload();
        } else {
            alert("Проблем при обновяването на статуса.");
        }
    } catch (error) {
        console.error("Грешка при markAsTaken:", error);
    }
}