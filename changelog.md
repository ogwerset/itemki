# Changelog v2.2

## Najważniejsze zmiany

- Pełny refaktor skanera: naprawione błędy, stabilność na wszystkich przeglądarkach
- domyślna zakładka = skaner (działający start/stop/toggle/feedback)
- modalowa, szybka edycja i usuwanie przedmiotów z widoku kart i tabeli
- modalowa edycja/usuwanie/dodawanie pudełek
- prosty, logiczny widok kart oraz tabela (layout wraca do pierwotnej estetyki)
- powiadomienia są widoczne zawsze (overlay, feedback dźwiękowy i wibracyjny)
- Import i eksport danych w formacie JSON/CSV, kompatybilność z Google Sheets
- kod minimalistyczny, testowany na Chrome, Firefox, Safari, iOS, Android

## Proces aktualizacji
1. Zamień pliki na wersję v2.2:
   - `index.html`  
   - `app.js`  
   - `style.css`  
   - `data.json`  
2. Uruchom na HTTPS (np: GitHub Pages, Netlify, Vercel)
3. Daj uprawnienia do kamery przy pierwszym skanowaniu

## Test Case
- Skaner: start/stop; przełączanie kamery, feedback
- Edycja/usuwanie/dodawanie przedmiotu i pudełka przez modale
- Import/eksport danych .json/.csv
- Reszta zachowuje UX jak w wersji pierwotnej
- Brak błędów w konsoli

## Uwagi
Wszystko działa w RAM (zmiany do pliku przez eksport), destrukcja modalów, responsywność na mobile i desktop.
