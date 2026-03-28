document.addEventListener("DOMContentLoaded", async () => {
    const userNameEl = document.getElementById("userName");
    const medsCountEl = document.getElementById("meds-count");
    const nextReminderEl = document.getElementById("next-reminder");
    const symptomsCountEl = document.getElementById("symptoms-count");
    const scheduleContainer = document.getElementById("daily-schedule");
    const symptomsContainer = document.getElementById("recent-symptoms");
    const progressTextEl = document.getElementById("progress-text");
    const progressBarFillEl = document.getElementById("progress-bar-fill");

    if (progressTextEl) {
        progressTextEl.textContent = "2 дни поред";
    }

    if (progressBarFillEl) {
        progressBarFillEl.style.width = "35%";
    }

    if (symptomsCountEl) {
        symptomsCountEl.textContent = "1 днес";
    }

    if (symptomsContainer) {
        symptomsContainer.innerHTML = `
            <div class="symptom-row" style="padding:0.8rem 0; border-bottom:1px solid #eee;">
                <strong style="display:block; color:#124170;">Силен главобол</strong>
                <p style="margin:2px 0; font-size:0.9rem; color:#555;">Имал/а е силен главобол</p>
                <small style="color:#999;">28.03 в 02:22</small>
            </div>
        `;
    }

    const savedUser = localStorage.getItem("medguideUser");
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (userNameEl) {
            userNameEl.textContent = user.firstName || "потребител";
        }
    } else {
        if (userNameEl) {
            userNameEl.textContent = "потребител";
        }
    }

    try {
        const medsRes = await fetch("http://localhost:3000/meds/all");
        if (!medsRes.ok) throw new Error("Грешка при зареждане на лекарствата");

        const medications = await medsRes.json();

        if (medications && medications.length > 0) {
            if (medsCountEl) {
                medsCountEl.textContent = `${medications.length} лекарства`;
            }

            const now = new Date();
            const currentTotalMin = now.getHours() * 60 + now.getMinutes();

            const upcoming = medications
                .map(m => {
                    const [h, min] = m.time.split(":");
                    return { ...m, totalMin: parseInt(h) * 60 + parseInt(min) };
                })
                .filter(m => m.totalMin > currentTotalMin && !m.isTaken)
                .sort((a, b) => a.totalMin - b.totalMin);

            if (nextReminderEl) {
                nextReminderEl.textContent =
                    upcoming.length > 0 ? upcoming[0].time.slice(0, 5) : "Край за днес";
            }

            if (scheduleContainer) {
                scheduleContainer.innerHTML = medications.map(med => `
                    <div class="schedule-item" style="display:flex; justify-content:space-between; align-items:center; background:white; padding:1.2rem; margin-bottom:1rem; border-radius:1rem; box-shadow:0 2px 8px rgba(0,0,0,0.05); border:1px solid #f0f0f0;">
                        <div>
                            <b style="color:#67C090; font-size:1.2rem; margin-right:10px;">${med.time.slice(0, 5)}</b>
                            <span style="font-weight:bold; color:#124170;">${med.name}</span>
                            <div style="font-size:0.85rem; color:#666; margin-left:55px;">${med.dosage || "Няма посочена доза"}</div>
                        </div>
                        <button
                            class="take-btn"
                            onclick="markAsTaken(${med.id})"
                            ${med.isTaken ? "disabled" : ""}
                            style="background:${med.isTaken ? "#67C090" : "#124170"}; color:white; border:none; padding:0.6rem 1.2rem; border-radius:0.6rem; cursor:pointer; font-weight:bold; transition:0.3s;">
                            ${med.isTaken ? "Взето ✓" : "Прието"}
                        </button>
                    </div>
                `).join("");
            }
        } else {
            if (medsCountEl) {
                medsCountEl.textContent = "0";
            }

            if (scheduleContainer) {
                scheduleContainer.innerHTML = "<p class='loading-msg'>Няма добавени лекарства за днес.</p>";
            }
        }
    } catch (err) {
        console.error("Dashboard Error:", err);

        if (scheduleContainer) {
            scheduleContainer.innerHTML = "<p style='color:red;'>Възникна грешка при връзката със сървъра.</p>";
        }
    }
});

async function markAsTaken(medId) {
    try {
        const response = await fetch(`http://localhost:3000/meds/taken/${medId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            location.reload();
        } else {
            alert("Проблем при обновяването на статуса.");
        }
    } catch (error) {
        console.error("Грешка при markAsTaken:", error);
    }
}