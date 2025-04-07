import json
import time
import schedule
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import logging

# Настройка логирования
logging.basicConfig(
    filename="logs/horoscope_scraper.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    encoding="utf-8"
)

# Список всех знаков зодиака и их URL
ZODIAC_SIGNS = {
    "aries": "Овен",
    "taurus": "Телец",
    "gemini": "Близнецы",
    "cancer": "Рак",
    "leo": "Лев",
    "virgo": "Дева",
    "libra": "Весы",
    "scorpio": "Скорпион",
    "sagittarius": "Стрелец",
    "capricorn": "Козерог",
    "aquarius": "Водолей",
    "pisces": "Рыбы"
}

class HoroscopeScraper:
    def __init__(self):
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        self.driver.implicitly_wait(10)
        self.horoscopes = {}

    def scrape_horoscopes(self):
        logging.info("Начало парсинга гороскопов")
        for sign, name in ZODIAC_SIGNS.items():
            url = f"https://1001goroskop.ru/?znak={sign}"
            try:
                self.driver.get(url)
                time.sleep(2)

                horoscope_text = self.driver.find_element(
                    By.CSS_SELECTOR, "div[itemprop='description'] p"
                ).text
                self.horoscopes[name] = horoscope_text
                logging.info(f"Собран гороскоп для {name}")
            except Exception as e:
                self.horoscopes[name] = "Не удалось получить гороскоп"
                logging.error(f"Ошибка при сборе гороскопа для {name}: {str(e)}")

    def save_to_file(self, filename="data/horoscopes.json"):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(self.horoscopes, f, ensure_ascii=False, indent=2)
        logging.info(f"Гороскопы сохранены в файл {filename}")

    def close(self):
        self.driver.quit()
        logging.info("Драйвер Selenium закрыт")

def run_scraper():
    scraper = HoroscopeScraper()
    try:
        scraper.scrape_horoscopes()
        scraper.save_to_file()
    finally:
        scraper.close()

# Планировщик: запуск парсинга каждый день в 7:00
schedule.every().day.at("16:09").do(run_scraper)

if __name__ == "__main__":
    logging.info("Скрипт парсинга запущен")
    while True:
        schedule.run_pending()
        time.sleep(60)