# Inwentarz Domowy v2.2

Aplikacja webowa do zarządzania domowym inwentarzem z szybkim skanowaniem QR, pełną edycją przedmiotów i pudełek, importem/eksportem JSON i CSV. Wersja 2.2 = stabilność + kompletność + najprostsza obsługa.

## Instalacja
1. Skopiuj pliki do katalogu repo:
   - `index.html`
   - `app.js`
   - `style.css`
   - `data.json`
2. Wymagany serwer HTTPS (np. GitHub Pages, Vercel, Netlify).
3. Aplikacja działa w każdej nowoczesnej mobilnej/przeglądarkowej przeglądarce.

## Funkcje
- **Skaner QR** z detekcją kamer i klasycznym feedbackiem (dźwięk, wibracja)
- **Widok kart/kafli** + **widok tabelaryczny** przedmiotów (obsługa edycji/usuń/dodaj)
- **Pełna edycja i usuwanie pudełek** (modal window)
- **Import/eksport danych** do CSV/JSON (w pełni wymienialny z Google Sheets)
- **Responsywność** i **prosty kod** gotowy pod rozszerzenia
- **Powiadomienia** zawsze widoczne na overlay (success, error)
- **Modale** do edycji przedmiotów i pudełek

## FAQ
- Jeśli skaner nie działa: sprawdź HTTPS i pozwolenia na kamerę
- Dane nie zapisują się po odświeżeniu? Edycja tylko w RAM, eksportuj do pliku aby zachować zmiany na stałe.
- Struktura pliku `data.json`:

```json
{
  "items": [ { "serial": "DOM064", "item": "Nazwa...", "box": "BOX05" } ],
  "boxes": [ { "code": "BOX05", "name": "...", "location": "..." } ]
}
```

## Skróty
- Skaner: [Start] - uruchom/kamera, [Stop] - zatrzymaj, [Kamera] - zmień kamerę
- Przedmioty: [Dodaj przedmiot] / [Edytuj] / [Usuń]
- Pudełka: [Dodaj pudełko] / [Edytuj] / [Usuń]
- Import: wybierz plik .json lub .csv
- Eksport: pobierz aktualne dane w pożądanym formacie

## Zgłaszanie błędów
Twórz issue lub pull request na GitHub.
