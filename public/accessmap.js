document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('medications-container');
    const addBtn = document.getElementById('addMedicineBtn');
    const form = document.getElementById('medicineForm');

    // 1. ТАЗИ ФУНКЦИЯ ПРАВИ МАГИЯТА
    function setupAutocomplete(card) {
        // Търсим елементите по КЛАС, а не по ID, за да работи във всяка карта
        const input = card.querySelector('.medInput');
        const list = card.querySelector('.suggestionsList');

        if (!input || !list) {
            console.error("Липсват .medInput или .suggestionsList в картата!");
            return;
        }

        input.addEventListener('input', async () => {
            const val = input.value.trim();
            
            if (val.length < 2) {
                list.style.display = 'none';
                return;
            }

            try {
                // Пътят до твоя API за търсене
                const res = await fetch(`/meds/search?term=${encodeURIComponent(val)}`);
                const medicines = await res.json();

                if (medicines.length > 0) {
                    // Генерираме съдържанието на менюто
                    list.innerHTML = medicines.map(m => `
                        <li class="suggestion-item" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;">${m.name}</li>
                    `).join('');
                    
                    // СИЛОВО ПОКАЗВАМЕ МЕНЮТО
                    list.style.display = 'block'; 
                    list.style.opacity = '1';
                    list.style.visibility = 'visible';
                } else {
                    list.style.display = 'none';
                }
            } catch (err) {
                console.error('Грешка при връзка със сървъра:', err);
            }
        });

        // Избор от менюто
        list.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                input.value = e.target.innerText;
                list.style.display = 'none';
            }
        });

        // Затваряне при клик извън картата
        document.addEventListener('click', (e) => {
            if (!card.contains(e.target)) {
                list.style.display = 'none';
            }
        });
    }

    // 2. ГЕНЕРИРАНЕ НА НОВА КАРТА (за бутона +)
    function createMedicineCard() {
        const card = document.createElement('div');
        card.className = 'card medicine-card';
        card.innerHTML = `
            <button type="button" class="remove-btn">✕</button>
            <div class="input-group" style="position: relative;">
                <input type="text" class="medInput" name="name" placeholder="Име на лекарството" autocomplete="off" required>
                <ul class="suggestionsList" style="display: none; position: absolute; width: 100%; background: white; z-index: 1000; border: 1px solid #ddd; list-style: none; padding: 0;"></ul>
            </div>
            <div class="input-group">
                <input type="number" name="dose" class="doseInput" placeholder="Дневна доза" min="1" required>
            </div>
            <div class="time-container"></div>
        `;

        card.querySelector('.remove-btn').onclick = () => card.remove();
        
        // Часове според дозата
        card.querySelector('.doseInput').oninput = (e) => {
            const tContainer = card.querySelector('.time-container');
            tContainer.innerHTML = '';
            for (let i = 0; i < Math.min(e.target.value, 12); i++) {
                const t = document.createElement('input');
                t.type = 'time';
                t.required = true;
                t.style.display = 'block';
                t.style.marginTop = '5px';
                tContainer.appendChild(t);
            }
        };

        setupAutocomplete(card);
        return card;
    }

    // 3. ПУСКАМЕ ГО ЗА ПЪРВОНАЧАЛНАТА КАРТА
    const initialCard = document.querySelector('.medicine-card');
    if (initialCard) {
        setupAutocomplete(initialCard);
        // Добави ръчно логиката за часове на първата карта тук, ако я нямаш
    }

    // БУТОН ЗА ДОБАВЯНЕ
    if (addBtn) {
        addBtn.onclick = () => container.appendChild(createMedicineCard());
    }
});