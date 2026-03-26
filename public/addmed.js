document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('medications-container');
    const addBtn = document.getElementById('addMedicineBtn');
    const form = document.getElementById('medicineForm');

    function setupAutocomplete(card) {
        const input = card.querySelector('.medInput');
        const list = card.querySelector('.suggestionsList');

        input.addEventListener('input', async () => {
            const val = input.value.trim();
            if (val.length < 2) {
                list.style.display = 'none';
                return;
            }

            try {
                const res = await fetch(`/meds/search?term=${encodeURIComponent(val)}`);
                const medicines = await res.json();

                if (medicines.length > 0) {
                    list.innerHTML = medicines.map(m => `
                        <li class="suggestion-item">${m.name}</li>
                    `).join('');
                    list.style.display = 'block';
                } else {
                    list.style.display = 'none';
                }
            } catch (err) { console.error(err); }
        });

        list.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                input.value = e.target.innerText;
                list.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (!card.contains(e.target)) list.style.display = 'none';
        });
    }

    function createCard() {
        const div = document.createElement('div');
        div.className = 'card medicine-card';
        div.innerHTML = `
            <button type="button" class="remove-btn">✕</button>
            <div class="input-group">
                <input type="text" class="medInput" name="name" placeholder="Име на лекарството" autocomplete="off" required>
                <ul class="suggestionsList"></ul>
            </div>
            <div class="input-group">
                <input type="number" name="dose" placeholder="Дневна доза" min="1" required>
            </div>
            <div class="time-container"></div>
        `;
        div.querySelector('.remove-btn').onclick = () => div.remove();
        setupAutocomplete(div);
        return div;
    }

    const firstCard = document.querySelector('.medicine-card');
    if (firstCard) setupAutocomplete(firstCard);

    if (addBtn) {
        addBtn.onclick = () => container.appendChild(createCard());
    }
});