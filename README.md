# Inwentarz Domowy 2.0

Aplikacja webowa do zarządzania inwentarzem domowym z obsługą skanowania kodów QR i zarządzaniem pudełkami magazynowymi.

## 🚀 Funkcje

### 📦 Zarządzanie Pudełkami
- **Nowa zakładka "Pudełka"** do zarządzania pudełkami magazynowymi
- Tworzenie, edycja i usuwanie pudełek
- Automatyczne tworzenie pudełek podczas dodawania przedmiotów
- Śledzenie liczby przedmiotów w każdym pudełku
- Przypisywanie lokalizacji do pudełek

### 📱 Skanowanie Kodów QR/Kodów Kreskowych

#### Tryb Pojedynczy
- Skanuj kod → znajdź istniejący przedmiot → podświetl w inwentarzu
- Skanuj kod → nowy przedmiot → przejdź do formularza dodawania z wypełnionym kodem

#### Tryb Seryjny (Batch)
- **Szybkie dodawanie wielu przedmiotów** bez przełączania zakładek
- Modal szybkiego dodawania pojawia się bezpośrednio na widoku skanera
- **"Zapamiętaj pudełko"** - automatyczne wybieranie ostatnio używanego pudełka
- **Licznik skanów** - na bieżąco pokazuje liczbę zeskanowanych przedmiotów
- **Skróty klawiszowe**:
  - Enter - zapisz i skanuj dalej
  - Esc - anuluj
- Auto-fokus na polu nazwy dla szybkiego wprowadzania
- Przycisk "Zakończ skanowanie" do przeglądu dodanych przedmiotów

### 📋 Zarządzanie Inwentarzem
- Lista wszystkich przedmiotów z filtrowaniem i sortowaniem
- Widok tabeli i kart
- Wyszukiwanie po nazwie, opisie lub kodzie
- Filtrowanie po pudełku i lokalizacji
- Edycja i usuwanie przedmiotów
- Automatyczne znaczniki czasowe (ostatnio widziane, pudełko zmienione)

### 💾 Import/Export
- **Export JSON** - format zgodny z `inwentarz.json` (items + boxes)
- **Export CSV** - dla kompatybilności z arkuszami kalkulacyjnymi
- **Pełny backup** - zawiera inwentarz, pudełka i ustawienia
- **Import** - możliwość importu danych z plików JSON/CSV

### ⚙️ Ustawienia
- Motyw ciemny/jasny
- Dźwięk i wibracje po skanowaniu
- Auto-focus kamery
- Przełączanie kamer (przednia/tylna)
- Latarka (jeśli obsługiwana)

## 📁 Struktura Danych

### Format JSON (inwentarz.json)
```json
{
  "items": [
    {
      "serial": "DOM001",
      "item": "Nazwa przedmiotu",
      "box": "BOX05",
      "lastSeen": "2025-10-08 12:30:00",
      "boxChanged": "2025-10-08 12:30:00"
    }
  ],
  "boxes": [
    {
      "code": "BOX05",
      "name": "Pudełko BOX05",
      "location": "Magazyn",
      "itemCount": 14
    }
  ]
}
```

### Pola Przedmiotu
- **serial/qrCode** - Unikalny kod przedmiotu (np. DOM001)
- **item/name** - Nazwa przedmiotu
- **box/category** - Kod pudełka lub "Bez pudełka"
- **location** - Fizyczna lokalizacja (np. Magazyn, Studio)
- **lastSeen** - Ostatnio widziane (timestamp)
- **boxChanged** - Data zmiany pudełka (timestamp)
- **description** - Dodatkowe notatki

### Pola Pudełka
- **code** - Unikalny kod pudełka (np. BOX05, TIDAL)
- **name** - Czytelna nazwa pudełka
- **location** - Miejsce przechowywania pudełka
- **itemCount** - Liczba przedmiotów (obliczana automatycznie)

## 🎯 Użycie

### Szybki Start
1. Otwórz `index.html` w przeglądarce
2. Dane zostaną załadowane z `inwentarz.json` (jeśli istnieje)
3. Jeśli brak pliku, aplikacja zacznie z pustym inwentarzem

### Dodawanie Przedmiotów

#### Metoda 1: Skanowanie Pojedyncze
1. Przejdź do zakładki "Skaner"
2. Wybierz tryb "Pojedynczy"
3. Kliknij "Uruchom skaner"
4. Zeskanuj kod QR
5. Wypełnij formularz w zakładce "Dodaj"
6. Zapisz przedmiot

#### Metoda 2: Skanowanie Seryjne (Szybkie)
1. Przejdź do zakładki "Skaner"
2. Wybierz tryb "Seryjny"
3. Kliknij "Uruchom skaner"
4. Dla każdego kodu:
   - Zeskanuj kod
   - Wpisz nazwę w modalu
   - Wybierz pudełko (lub zostaw zapamiętane)
   - Naciśnij Enter
5. Po zakończeniu kliknij "Zakończ skanowanie"

#### Metoda 3: Ręczne Dodawanie
1. Przejdź do zakładki "Dodaj"
2. Wypełnij formularz
3. Kliknij "Dodaj przedmiot"

### Zarządzanie Pudełkami
1. Przejdź do zakładki "Pudełka"
2. Kliknij "Dodaj pudełko"
3. Wprowadź kod, nazwę i lokalizację
4. Zapisz

**Pudełka są tworzone automatycznie** jeśli wpiszesz nowy kod podczas dodawania przedmiotu!

## 💡 Wskazówki

### Efektywne Skanowanie Seryjne
- Zaznacz "Zapamiętaj pudełko" aby nie wybierać pudełka za każdym razem
- Używaj krótkiego formatu nazwy dla szybkości
- Możesz edytować szczegóły później w zakładce "Lista"

### Organizacja Pudełek
- Używaj spójnych kodów (np. BOX01, BOX02, TIDAL, SPORT)
- Przypisuj czytelne lokalizacje (np. "Magazyn - Półka 1")
- Regularnie sprawdzaj liczbę przedmiotów w każdym pudełku

### Import/Export
- Regularnie eksportuj backup dla bezpieczeństwa
- Format JSON zachowuje pełną strukturę danych
- CSV jest przydatny do analizy w Excelu/Sheets

## 🔧 Wymagania Techniczne

- Przeglądarka z obsługą:
  - JavaScript ES6+
  - WebRTC (getUserMedia) dla kamery
  - LocalStorage
  - Fetch API
- Kamera (dla funkcji skanowania)
- HTTPS lub localhost (wymagane dla dostępu do kamery)

## 📱 Responsywność

Aplikacja jest zoptymalizowana dla:
- Telefony komórkowe (główny przypadek użycia)
- Tablety
- Desktopy

## 🛠️ Rozwój

### Struktura Plików
```
inwentarz-home-v2/
├── index.html          # Główny plik HTML
├── app.js              # Logika aplikacji
├── style.css           # Style
├── inwentarz.json      # Dane (items + boxes)
├── README.md           # Ten plik
└── CHANGELOG.md        # Historia zmian
```

### Główne Klasy i Funkcje

#### Zarządzanie Pudełkami
- `renderBoxes()` - Renderowanie listy pudełek
- `addBox()` / `editBox()` / `deleteBox()` - CRUD operacje
- `updateCategoriesFromData()` - Aktualizacja listy kategorii z pudełek

#### Skanowanie
- `handleScanResult(data)` - Obsługa zeskanowanego kodu (tryb single/batch)
- `openQuickAddModal(qrCode)` - Otwarcie modalnego szybkiego dodawania
- `saveQuickAdd()` - Zapisanie przedmiotu w trybie batch
- `updateScanModeUI()` - Aktualizacja UI według trybu skanowania

#### Inwentarz
- `addItem()` - Dodawanie przedmiotu (z auto-tworzeniem pudełka)
- `saveEditItem()` - Edycja przedmiotu (z auto-tworzeniem pudełka)
- `parseInventoryJSON(jsonData)` - Parsowanie formatu JSON

## 📄 Licencja

MIT License - wolne do użytku osobistego i komercyjnego

## 🤝 Wsparcie

W przypadku problemów lub pytań:
1. Sprawdź konsolę przeglądarki (F12) dla logów debug
2. Upewnij się, że plik `inwentarz.json` jest w poprawnym formacie
3. Sprawdź czy przeglądarka ma dostęp do kamery (HTTPS/localhost)

## 🎉 Changelog

Zobacz [CHANGELOG.md](CHANGELOG.md) dla pełnej historii zmian.

---

**Wersja:** 2.0.0
**Data:** 2025-10-08
**Autor:** Claude Code + ogwerset
