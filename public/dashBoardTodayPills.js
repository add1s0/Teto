document.addEventListener("DOMContentLoaded", async () => {
    const userNameEl = document.getElementById("userName");
    const medsCountEl = document.getElementById("meds-count");
    const nextReminderEl = document.getElementById("next-reminder");
    const scheduleContainer = document.getElementById("daily-schedule");

    const savedUser = localStorage.getItem("medguideUser");

    if (!savedUser) {
        if (userNameEl) userNameEl.textContent = "потребител";
        if (scheduleContainer) {
            scheduleContainer.innerHTML = "<p class='loading-msg'>Моля, влез в профила си.</p>";
        }
        return;
    }

    const user = JSON.parse(savedUser);
    const currentUserId = Number(user.id);

    if (userNameEl) {
        userNameEl.textContent = user.firstName || "потребител";
    }

    function getCurrentMinutes() {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    }

    function timeToMinutes(timeString) {
        const hhmm = String(timeString).slice(0, 5);
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    }

    function formatTime(timeString) {
        return String(timeString).slice(0, 5);
    }

    try {
        const medsRes = await fetch("http://localhost:3000/meds/all");

        if (!medsRes.ok) {
            throw new Error("Грешка при зареждане на лекарствата");
        }

        const allMedications = await medsRes.json();

        const userMedications = allMedications
            .filter(med => Number(med.userId) === currentUserId)
            .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

        if (!userMedications.length) {
            medsCountEl.textContent = "0";
            nextReminderEl.textContent = "--:--";
            scheduleContainer.innerHTML = "<p class='loading-msg'>Няма добавени лекарства за днес.</p>";
            return;
        }

        medsCountEl.textContent = `${userMedications.length} лекарства`;

        const nowMinutes = getCurrentMinutes();

        const upcoming = userMedications
            .filter(med => !med.isTaken && timeToMinutes(med.time) >= nowMinutes)
            .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

        nextReminderEl.textContent = upcoming.length
            ? formatTime(upcoming[0].time)
            : "Край за днес";

        scheduleContainer.innerHTML = userMedications.map(med => `
            <div class="schedule-item" style="display:flex; justify-content:space-between; align-items:center; background:white; padding:1.2rem; margin-bottom:1rem; border-radius:1rem; box-shadow:0 2px 8px rgba(0,0,0,0.05); border:1px solid #f0f0f0;">
                <div>
                    <b style="color:#67C090; font-size:1.2rem; margin-right:10px;">${formatTime(med.time)}</b>
                    <span style="font-weight:bold; color:#124170;">${med.name}</span>
                    <div style="font-size:0.85rem; color:#666; margin-left:55px;">
                        ${med.dosage || "Няма посочена доза"}
                    </div>
                </div>

                <button
                    class="take-btn"
                    onclick="markTodayMedicationAsTaken(${med.id})"
                    ${med.isTaken ? "disabled" : ""}
                    style="background:${med.isTaken ? '#67C090' : '#124170'}; color:white; border:none; padding:0.6rem 1.2rem; border-radius:0.6rem; cursor:pointer; font-weight:bold;"
                >
                    ${med.isTaken ? "Взето ✓" : "Прието"}
                </button>
            </div>
        `).join("");
    } catch (error) {
        console.error("Dashboard meds today error:", error);
        medsCountEl.textContent = "0";
        nextReminderEl.textContent = "--:--";
        scheduleContainer.innerHTML = "<p style='color:red;'>Възникна грешка при зареждане на лекарствата.</p>";
    }
});

async function markTodayMedicationAsTaken(medId) {
    try {
        const response = await fetch(`http://localhost:3000/meds/taken/${medId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            alert("Проблем при отбелязване на лекарството.");
            return;
        }

        location.reload();
    } catch (error) {
        console.error("Грешка при отбелязване:", error);
        alert("Сървърна грешка при отбелязване.");
    }
}