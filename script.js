const BASE_URL = "https://tarot-game-app.onrender.com";

// Обратное сопоставление: русское название -> английское для карт
const cardNameMapping = {
    "0. Дурак": "thefool",
    "1. Маг": "themagician",
    "2. Верховная Жрица": "thehighpriestess",
    "3. Императрица": "theempress",
    "4. Император": "theemperor",
    "5. Иерофант": "thehierophant",
    "6. Влюбленные": "thelovers",
    "7. Колесница": "thechariot",
    "8. Сила": "strength",
    "9. Отшельник": "thehermit",
    "10. Колесо Фортуны": "wheeloffortune",
    "11. Справедливость": "justice",
    "12. Повешенный": "thehangedman",
    "13. Смерть": "death",
    "14. Умеренность": "temperance",
    "15. Дьявол": "thedevil",
    "16. Башня": "thetower",
    "17. Звезда": "thestar",
    "18. Луна": "themoon",
    "19. Солнце": "thesun",
    "20. Суд": "judgement",
    "21. Мир": "theworld"
};

// Обратное сопоставление: русское название -> английское для знаков зодиака
const zodiacSignMapping = {
    "Овен ♈": "aries",
    "Телец ♉": "taurus",
    "Близнецы ♊": "gemini",
    "Рак ♋": "cancer",
    "Лев ♌": "leo",
    "Дева ♍": "virgo",
    "Весы ♎": "libra",
    "Скорпион ♏": "scorpio",
    "Стрелец ♐": "sagittarius",
    "Козерог ♑": "capricorn",
    "Водолей ♒": "aquarius",
    "Рыбы ♓": "pisces"
};

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
            fetchWithErrorHandling(`${BASE_URL}/api/horoscope/${sign}`)
                .then(data => {
                    if (data) {
                        console.log("Гороскоп получен:", data);
                        document.getElementById("horoscope-result").innerHTML = `<p>${data.horoscope}</p>`;
                    } else {
                        document.getElementById("horoscope-result").innerHTML = "<p>Не удалось загрузить гороскоп.</p>";
                    }
                });
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

// Функция для безопасного выполнения fetch-запросов
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Ошибка при запросе ${url}:`, error);
        return null; // Возвращаем null в случае ошибки
    }
}

function loadSpreads() {
    console.log("Загружаю расклады...");
    fetchWithErrorHandling(`${BASE_URL}/api/spreads`)
        .then(spreads => {
            if (spreads) {
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
            } else {
                document.getElementById("spreads-list").innerHTML = "<p>Не удалось загрузить расклады.</p>";
            }
        });
}

function loadZodiacSigns() {
    console.log("Загружаю знаки зодиака...");
    fetchWithErrorHandling(`${BASE_URL}/api/zodiac_signs`)
        .then(signs => {
            if (signs) {
                console.log("Полученные знаки зодиака:", signs);
                const select = document.getElementById("zodiac-sign");
                select.innerHTML = '<option value="">Выберите знак</option>';
                signs.forEach(sign => {
                    const option = document.createElement("option");
                    // Используем английское название для value
                    const signName = zodiacSignMapping[sign] || sign;
                    option.value = signName;
                    option.textContent = sign;
                    select.appendChild(option);
                });
            } else {
                document.getElementById("zodiac-sign").innerHTML = '<option value="">Ошибка загрузки знаков</option>';
            }
        });
}

function loadHistory() {
    const userId = "123";
    console.log(`Загружаю историю для user_id: ${userId}...`);
    fetchWithErrorHandling(`${BASE_URL}/api/history/${userId}`)
        .then(history => {
            const historyList = document.getElementById("history-list");
            if (history) {
                console.log("Полученная история:", history);
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
            } else {
                historyList.innerHTML = "<p>Не удалось загрузить историю.</p>";
            }
        });
}

function loadCards() {
    console.log("Загружаю карты...");
    fetchWithErrorHandling(`${BASE_URL}/api/cards`)
        .then(cards => {
            const cardsList = document.getElementById("cards-list");
            if (cards) {
                console.log("Полученные карты:", cards);
                cardsList.innerHTML = "";
                cards.forEach(card => {
                    const div = document.createElement("div");
                    div.className = "card-item";
                    div.textContent = card;
                    div.onclick = () => showCardDetails(card);
                    cardsList.appendChild(div);
                });
            } else {
                cardsList.innerHTML = "<p>Не удалось загрузить карты.</p>";
            }
        });
}

function showCardDetails(cardName) {
    console.log(`Запрашиваю данные для карты: ${cardName}`);
    // Преобразуем русское название в английское
    const englishCardName = cardNameMapping[cardName] || cardName;
    fetchWithErrorHandling(`${BASE_URL}/api/card/${encodeURIComponent(englishCardName)}`)
        .then(card => {
            const cardsList = document.getElementById("cards-list");
            if (card && !card.error) {
                console.log("Полученные данные карты:", card);
                cardsList.innerHTML = `<h3>${cardName}</h3>` +
                    `<div class="card-details">` +
                    `<strong>Прямое значение ⬆️:</strong><br>${card.upright}<br><br>` +
                    `<strong>Перевёрнутое значение 🔃:</strong><br>${card.reversed}` +
                    `</div>`;
                const backButton = document.createElement("button");
                backButton.textContent = "Назад";
                backButton.onclick = loadCards;
                cardsList.appendChild(backButton);
            } else {
                console.error("Карта не найдена:", card ? card.error : "Ошибка загрузки");
                cardsList.innerHTML = "<p>Карта не найдена.</p>";
                const backButton = document.createElement("button");
                backButton.textContent = "Назад";
                backButton.onclick = loadCards;
                cardsList.appendChild(backButton);
            }
        });
}

function getSpread(spreadName) {
    const userId = "123";
    console.log(`Получаю расклад: ${spreadName} для user_id: ${userId}...`);
    fetchWithErrorHandling(`${BASE_URL}/api/spread/${spreadName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
    })
        .then(cards => {
            const spreadsList = document.getElementById("spreads-list");
            if (cards) {
                console.log("Полученные карты для расклада:", cards);
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
            } else {
                spreadsList.innerHTML = "<p>Не удалось получить расклад.</p>";
                const backButton = document.createElement("button");
                backButton.textContent = "Назад";
                backButton.onclick = loadSpreads;
                spreadsList.appendChild(backButton);
            }
        });
}