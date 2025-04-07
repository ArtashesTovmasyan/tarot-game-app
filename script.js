document.addEventListener("DOMContentLoaded", () => {
    console.log("Страница загружена, начинаю загрузку данных...");
    loadSpreads();
    loadZodiacSigns();
    loadHistory();
    loadCards();

    document.getElementById("zodiac-sign").addEventListener("change", (e) => {
        const sign = e.target.value;
        if (sign) {
            console.log(`Загружаю гороскоп для знака: ${sign}`);
            fetch(`/api/horoscope/${sign}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Гороскоп получен:", data);
                    document.getElementById("horoscope-result").innerHTML = `<p>${data.horoscope}</p>`;
                })
                .catch(error => console.error("Ошибка при загрузке гороскопа:", error));
        } else {
            document.getElementById("horoscope-result").innerHTML = "";
        }
    });
});

function showTab(tabId) {
    console.log(`Переключаюсь на вкладку: ${tabId}`);
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    document.querySelector(`.tab[onclick="showTab('${tabId}')"]`).classList.add("active");

    if (tabId === "spreads") loadSpreads();
    if (tabId === "history") loadHistory();
    if (tabId === "horoscope") loadZodiacSigns();
    if (tabId === "cards") loadCards();
}

function loadSpreads() {
    console.log("Загружаю расклады...");
    fetch("/api/spreads")
        .then(response => {
            console.log("Ответ от /api/spreads:", response);
            return response.json();
        })
        .then(spreads => {
            console.log("Полученные расклады:", spreads);
            const spreadsList = document.getElementById("spreads-list");
            spreadsList.innerHTML = "";
            spreads.forEach(spread => {
                const div = document.createElement("div");
                div.className = "spread-item";
                div.innerHTML = `<div class="icon">${spread.icon}</div>${spread.name}`;
                div.onclick = () => getSpread(spread.name);
                spreadsList.appendChild(div);
            });
        })
        .catch(error => console.error("Ошибка при загрузке раскладов:", error));
}

function loadZodiacSigns() {
    console.log("Загружаю знаки зодиака...");
    fetch("/api/zodiac_signs")
        .then(response => {
            console.log("Ответ от /api/zodiac_signs:", response);
            return response.json();
        })
        .then(signs => {
            console.log("Полученные знаки зодиака:", signs);
            const select = document.getElementById("zodiac-sign");
            select.innerHTML = '<option value="">Выберите знак</option>';
            signs.forEach(sign => {
                const option = document.createElement("option");
                option.value = sign;
                option.textContent = sign;
                select.appendChild(option);
            });
        })
        .catch(error => console.error("Ошибка при загрузке знаков зодиака:", error));
}

function loadHistory() {
    const userId = "123";
    console.log(`Загружаю историю для user_id: ${userId}...`);
    fetch(`/api/history/${userId}`)
        .then(response => {
            console.log("Ответ от /api/history:", response);
            return response.json();
        })
        .then(history => {
            console.log("Полученная история:", history);
            const historyList = document.getElementById("history-list");
            historyList.innerHTML = "";
            if (history.length === 0) {
                historyList.innerHTML = "<p>История пуста.</p>";
                return;
            }
            history.forEach(entry => {
                const div = document.createElement("div");
                div.className = "history-item";
                div.innerHTML = `<strong>${entry.date}</strong>: ${entry.spread_name}<br>` +
                    entry.cards.map(card => `${card.name} (${card.position}): ${card.meaning}`).join("<br>");
                historyList.appendChild(div);
            });
        })
        .catch(error => console.error("Ошибка при загрузке истории:", error));
}

function loadCards() {
    console.log("Загружаю карты...");
    fetch("/api/cards")
        .then(response => {
            console.log("Ответ от /api/cards:", response);
            return response.json();
        })
        .then(cards => {
            console.log("Полученные карты:", cards);
            const cardsList = document.getElementById("cards-list");
            cardsList.innerHTML = "";
            cards.forEach(card => {
                const div = document.createElement("div");
                div.className = "card-item";
                div.textContent = card;
                div.onclick = () => showCardDetails(card); // Добавляем обработчик клика
                cardsList.appendChild(div);
            });
        })
        .catch(error => console.error("Ошибка при загрузке карт:", error));
}

function showCardDetails(cardName) {
    console.log(`Запрашиваю данные для карты: ${cardName}`);
    fetch(`/api/card/${encodeURIComponent(cardName)}`)
        .then(response => {
            console.log("Ответ от /api/card:", response);
            return response.json();
        })
        .then(card => {
            console.log("Полученные данные карты:", card);
            if (card.error) {
                console.error("Карта не найдена:", card.error);
                return;
            }
            const cardsList = document.getElementById("cards-list");
            cardsList.innerHTML = `<h3>${card.name}</h3>` +
                `<div class="card-details">` +
                `<strong>Прямое значение ⬆️:</strong><br>${card.upright}<br><br>` +
                `<strong>Перевёрнутое значение 🔃:</strong><br>${card.reversed}` +
                `</div>`;
            const backButton = document.createElement("button");
            backButton.textContent = "Назад";
            backButton.onclick = loadCards;
            cardsList.appendChild(backButton);
        })
        .catch(error => console.error("Ошибка при загрузке данных карты:", error));
}

function getSpread(spreadName) {
    const userId = "123";
    console.log(`Получаю расклад: ${spreadName} для user_id: ${userId}...`);
    fetch(`/api/spread/${spreadName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
    })
        .then(response => {
            console.log("Ответ от /api/spread:", response);
            return response.json();
        })
        .then(cards => {
            console.log("Полученные карты для расклада:", cards);
            const spreadsList = document.getElementById("spreads-list");
            spreadsList.innerHTML = `<h3>${spreadName}</h3>`;
            cards.forEach(card => {
                const div = document.createElement("div");
                div.className = "spread-result";
                div.innerHTML = `<strong>${card.name}</strong> (${card.position})<br>${card.meaning}`;
                spreadsList.appendChild(div);
            });
            const backButton = document.createElement("button");
            backButton.textContent = "Назад";
            backButton.onclick = loadSpreads;
            spreadsList.appendChild(backButton);
        })
        .catch(error => console.error("Ошибка при получении расклада:", error));
}