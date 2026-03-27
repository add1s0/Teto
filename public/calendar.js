document.addEventListener("DOMContentLoaded", async () => {
    const calendarContainer = document.getElementById("calendarContainer");
    const aiWarnings = document.getElementById("aiWarnings");
    const currentLabel = document.getElementById("currentLabel");
    const viewButtons = document.querySelectorAll(".view-btn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    let currentView = "day";
    let currentDate = new Date();
    let events = [];

    const savedUser = localStorage.getItem("medguideUser");
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    const currentUserId = currentUser ? Number(currentUser.id) : null;

    function formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function formatPrettyDate(date) {
        return date.toLocaleDateString("bg-BG", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    function getWeekStart(date) {
        const result = new Date(date);
        const day = result.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        result.setDate(result.getDate() + diff);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    function getMonthName(date) {
        return date.toLocaleDateString("bg-BG", {
            month: "long",
            year: "numeric"
        });
    }

    function capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function getStatusClass(status) {
        if (status === "прието") return "taken";
        if (status === "пропуснато") return "missed";
        return "";
    }

    function updateLabel() {
        if (currentView === "day") {
            currentLabel.textContent = formatPrettyDate(currentDate);
        } else if (currentView === "week") {
            const start = getWeekStart(currentDate);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            currentLabel.textContent =
                `${start.toLocaleDateString("bg-BG")} - ${end.toLocaleDateString("bg-BG")}`;
        } else {
            currentLabel.textContent = getMonthName(currentDate);
        }
    }

    function getEventsForDate(dateKey) {
        return events.filter(event => event.date === dateKey);
    }

    function renderDayView() {
        const dateKey = formatDateKey(currentDate);
        const dayEvents = getEventsForDate(dateKey);

        if (dayEvents.length === 0) {
            calendarContainer.innerHTML = `
                <div class="day-view">
                    <div class="day-card">
                        <h3>Няма събития за този ден</h3>
                        <p>Нямате планирани лекарства за тази дата.</p>
                    </div>
                </div>
            `;
            return;
        }

        calendarContainer.innerHTML = `
            <div class="day-view">
                ${dayEvents.map(event => `
                    <div class="day-card ${getStatusClass(event.status)}">
                        <div class="day-card-header">
                            <div>
                                <h3>${event.title}</h3>
                                <p><strong>Тип:</strong> ${capitalize(event.type)}</p>
                                <p><strong>Час:</strong> ${event.time}</p>
                                ${event.dosage ? `<p><strong>Доза:</strong> ${event.dosage}</p>` : ""}
                            </div>
                            <span class="status-badge ${getStatusClass(event.status)}">
                                ${capitalize(event.status)}
                            </span>
                        </div>
                        ${event.status !== "прието" ? `
                            <button
                                onclick="markCalendarMedicationAsTaken(${event.id})"
                                style="margin-top: 0.8rem; background:#124170; color:white; border:none; padding:0.65rem 1rem; border-radius:0.7rem; cursor:pointer; font-weight:bold;"
                            >
                                Отбележи като прието
                            </button>
                        ` : ""}
                    </div>
                `).join("")}
            </div>
        `;
    }

    function renderWeekView() {
        const start = getWeekStart(currentDate);
        let html = `<div class="week-grid">`;

        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            const dateKey = formatDateKey(day);
            const dayEvents = getEventsForDate(dateKey);

            html += `
                <div class="week-day">
                    <h3>${day.toLocaleDateString("bg-BG", {
                        weekday: "short",
                        day: "numeric",
                        month: "short"
                    })}</h3>
                    ${dayEvents.length
                        ? dayEvents.map(event => `
                            <div class="week-event ${getStatusClass(event.status)}">
                                ${event.time} • ${event.title}
                            </div>
                        `).join("")
                        : `<p>Няма събития</p>`
                    }
                </div>
            `;
        }

        html += `</div>`;
        calendarContainer.innerHTML = html;
    }

    function renderMonthView() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const dayNames = ["Пон", "Вт", "Ср", "Чет", "Пет", "Съб", "Нед"];

        let html = `<div class="month-grid">`;

        dayNames.forEach(day => {
            html += `<div class="month-day-name">${day}</div>`;
        });

        for (let i = 0; i < startDay; i++) {
            html += `<div class="month-cell empty"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const dateKey = formatDateKey(cellDate);
            const dayEvents = getEventsForDate(dateKey);

            html += `
                <div class="month-cell">
                    <div class="month-date">${day}</div>
                    ${dayEvents.map(event => `
                        <div
                            class="month-dot ${getStatusClass(event.status)}"
                            title="${event.title} - ${capitalize(event.status)} - ${event.time}"
                        ></div>
                    `).join("")}
                </div>
            `;
        }

        html += `</div>`;
        calendarContainer.innerHTML = html;
    }

    function generateAIWarnings() {
        const missedEvents = events.filter(event => event.status === "пропуснато");

        if (missedEvents.length > 0) {
            aiWarnings.innerHTML = `
                <div class="ai-card">
                    <h3>Предупреждение за пропусната доза</h3>
                    <p>Имате ${missedEvents.length} пропуснати лекарствени събития. Повтарящите се пропуски могат да намалят ефективността на лечението.</p>
                </div>
            `;
        } else {
            aiWarnings.innerHTML = `
                <div class="ai-card safe">
                    <h3>Чудесна работа</h3>
                    <p>Всички налични лекарства в календара са отбелязани като приети или предстоят.</p>
                </div>
            `;
        }
    }

    function renderCalendar() {
        updateLabel();

        if (currentView === "day") {
            renderDayView();
        } else if (currentView === "week") {
            renderWeekView();
        } else {
            renderMonthView();
        }

        generateAIWarnings();
    }

    async function loadMedicationEvents() {
        if (!currentUserId) {
            calendarContainer.innerHTML = `
                <div class="day-view">
                    <div class="day-card">
                        <h3>Няма логнат потребител</h3>
                        <p>Моля, влез в профила си, за да видиш календара.</p>
                    </div>
                </div>
            `;
            aiWarnings.innerHTML = "";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/meds/all");

            if (!response.ok) {
                throw new Error("Грешка при зареждане на лекарствата");
            }

            const medications = await response.json();

            const userMeds = medications.filter(med => Number(med.userId) === currentUserId);

            const todayKey = formatDateKey(new Date());

            events = userMeds.map(med => ({
                id: med.id,
                title: med.name,
                type: "лекарство",
                date: med.lastReminderDate || todayKey,
                time: String(med.time).slice(0, 5),
                dosage: med.dosage || "",
                status: med.isTaken ? "прието" : "пропуснато"
            }));

            renderCalendar();
        } catch (error) {
            console.error("Calendar load error:", error);
            calendarContainer.innerHTML = `
                <div class="day-view">
                    <div class="day-card">
                        <h3>Грешка</h3>
                        <p>Неуспешно зареждане на данните от сървъра.</p>
                    </div>
                </div>
            `;
            aiWarnings.innerHTML = "";
        }
    }

    viewButtons.forEach(button => {
        button.addEventListener("click", () => {
            viewButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentView = button.dataset.view;
            renderCalendar();
        });
    });

    prevBtn.addEventListener("click", () => {
        if (currentView === "day") {
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (currentView === "week") {
            currentDate.setDate(currentDate.getDate() - 7);
        } else {
            currentDate.setMonth(currentDate.getMonth() - 1);
        }

        currentDate = new Date(currentDate);
        renderCalendar();
    });

    nextBtn.addEventListener("click", () => {
        if (currentView === "day") {
            currentDate.setDate(currentDate.getDate() + 1);
        } else if (currentView === "week") {
            currentDate.setDate(currentDate.getDate() + 7);
        } else {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        currentDate = new Date(currentDate);
        renderCalendar();
    });

    window.markCalendarMedicationAsTaken = async function (medId) {
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

            await loadMedicationEvents();
        } catch (error) {
            console.error("Mark taken error:", error);
            alert("Сървърна грешка при отбелязване.");
        }
    };

    await loadMedicationEvents();
});