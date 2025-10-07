# README - Aplikacja Inwentarza Domowego v2.0

## 📱 **O APLIKACJI**

Inwentarz Domowy to aplikacja webowa do katalogowania i zarządzania przedmiotami w domu z zaawansowanym skanerem kodów QR. Zoptymalizowana dla urządzeń mobilnych, szczególnie iPhone.

### ✨ **Główne funkcje:**
- 📦 Zarządzanie przedmiotami i pudełkami
- 📱 Skaner kodów QR z przełączaniem kamer i flashem
- 🎯 Filtrowanie i sortowanie
- 📊 Widok tabelaryczny i kartowy
- 💾 Import/Export danych (JSON, CSV)
- 🎨 Responsywny design

## 🚀 **QUICK START**

### 1. Hosting na GitHub Pages
```bash
1. Fork/clone repozytorium
2. Umieść pliki w głównym folderze
3. Włącz GitHub Pages w ustawieniach repo
4. Aplikacja dostępna pod: https://[username].github.io/[repo-name]
```

### 2. Wymagania
- ✅ HTTPS (wymagane dla kamery)
- ✅ Nowoczesna przeglądarka (Chrome, Safari, Firefox)
- ✅ Uprawnienia do kamery

### 3. Struktura plików
```
/
├── index.html      # Główny plik HTML
├── style.css       # Style CSS z design system
├── app.js          # Logika aplikacji JavaScript  
└── README.md       # Ta dokumentacja
```

## 📋 **INSTRUKCJA UŻYTKOWANIA**

### 🔍 **Lista przedmiotów**
1. **Przeglądanie**: Przełączaj między widokiem kart i tabeli
2. **Filtrowanie**: Użyj pola wyszukiwania lub filtrów pudełek
3. **Sortowanie**: Kliknij nagłówki kolumn w widoku tabeli
4. **Dodawanie**: Kliknij "+" aby dodać nowy przedmiot

### 📦 **Pudełka**
1. **Dodawanie pudełka**: Kliknij "Dodaj pudełko"
2. **Kody**: Automatycznie generowane BOX01-BOX20
3. **Edycja**: Kliknij na pudełko aby edytować
4. **Usuwanie**: Przycisk usuwania (tylko puste pudełka)

### 📱 **Skaner QR**

#### **Podstawowe użycie:**
1. Kliknij zakładkę "Skaner QR"
2. Kliknij "Uruchom skaner"
3. Zezwól na dostęp do kamery
4. Skieruj kamerę na kod QR
5. Aplikacja automatycznie znajdzie przedmiot

#### **Zaawansowane funkcje:**
- **🔄 Przełącz kamerę**: Zmień między przednią/tylną
- **💡 Flash**: Włącz/wyłącz latarkę
- **📊 Tryb wsadowy**: Skanuj wiele kodów na raz

### 💾 **Import/Export**
- **JSON**: Pełny backup z ustawieniami
- **CSV**: Lista przedmiotów dla Excel/Sheets

## 🔧 **KONFIGURACJA**

### **Personalizacja kodów:**
```javascript
// W app.js można zmienić prefiksy:
const ITEM_PREFIX = 'DOM';     // DOM001, DOM002...
const BOX_PREFIX = 'BOX';      // BOX01, BOX02...
const MAX_BOXES = 20;          // Maksymalna liczba pudełek
```

### **Optymalizacja wydajności:**
```javascript
// Parametry paginacji:
this.itemsPerPage = 12;        // Przedmioty na stronę
this.scanTimeout = 5000;       // Timeout skanera (ms)
```

## 📱 **OPTYMALIZACJA MOBILNA**

### **iPhone/Safari:**
- ✅ Touch targets 44px minimum
- ✅ Viewport meta tag zoptymalizowany
- ✅ iOS Safari scroll bounce wyłączony
- ✅ Hardware acceleration włączony

### **Android/Chrome:**
- ✅ Material Design patterns
- ✅ Haptic feedback symulowany
- ✅ Chrome DevTools friendly

### **PWA Ready:**
```html
<!-- Dodaj do <head> dla PWA: -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.json">
```

## 🛠️ **TROUBLESHOOTING**

### **Skaner nie działa:**
```
1. Sprawdź czy używasz HTTPS
2. Zezwól na dostęp do kamery w przeglądarce  
3. Sprawdź konsolę deweloperską (F12)
4. Sprawdź czy kamera nie jest używana przez inną aplikację
5. Spróbuj przełączyć kamerę
```

### **Aplikacja wolno się ładuje:**
```
1. Sprawdź połączenie internetowe
2. Wyczyść cache przeglądarki (Shift+F5)
3. Sprawdź czy CDN bibliotek działa
4. Sprawdź Network tab w DevTools
```

### **Błędy JavaScript:**
```
1. Otwórz Console (F12)
2. Odśwież stronę i sprawdź błędy
3. Sprawdź czy wszystkie pliki się ładują
4. Sprawdź kompatybilność przeglądarki
```

## 🔒 **BEZPIECZEŃSTWO**

### **Prywatność:**
- ✅ Dane przechowywane lokalnie (localStorage)
- ✅ Brak wysyłania danych na serwery zewnętrzne
- ✅ Kamera używana tylko do skanowania (brak zapisywania)

### **Uprawnienia:**
- 📷 Camera: Tylko podczas skanowania QR
- 💾 Storage: localStorage do zapisywania danych

## 📊 **STATYSTYKI WYDAJNOŚCI**

### **Rozmiary plików:**
```
index.html: ~11KB (compressed)
style.css:  ~36KB (compressed)  
app.js:     ~38KB (compressed)
Total:      ~85KB + CDN biblioteki
```

### **Czas ładowania (GitHub Pages):**
```
First Contentful Paint: <1.5s
Time to Interactive:    <2.0s
Largest Contentful Paint: <2.5s
```

## 🚀 **DEPLOYMENT**

### **GitHub Pages:**
1. Push pliki do głównej gałęzi
2. Settings → Pages → Deploy from branch: main
3. Aplikacja dostępna pod: `https://[username].github.io/[repo]`

### **Inne hostingi:**
- ✅ Netlify: Drag & drop folder
- ✅ Vercel: Import GitHub repo  
- ✅ Firebase Hosting: `firebase deploy`

## 📞 **WSPARCIE**

### **Znane problemy:**
1. **iOS Safari < 14**: Limited camera API support
2. **Chrome < 80**: No advanced camera features
3. **Firefox mobile**: Limited flash control

### **Kontakt:**
- 🐛 Bugs: Sprawdź changelog i README
- 💡 Feature requests: Fork i pull request
- ❓ Pytania: Issues na GitHub

---

## 🎯 **KOLEJNE WERSJE**

### **v2.1 (Planned):**
- [ ] PWA support z offline mode
- [ ] Cloud sync (Google Drive/iCloud)
- [ ] Statystyki użycia przedmiotów
- [ ] Push notifications

### **v2.2 (Future):**
- [ ] Multi-user support
- [ ] Barcode scanning (nie tylko QR)
- [ ] AI image recognition
- [ ] API integrations (shops, prices)

---

*Inwentarz Domowy v2.0 - Profesjonalny system zarządzania przedmiotami*  
*Zoptymalizowany dla iPhone i urządzeń mobilnych*  
*Ostatnia aktualizacja: 2025-10-07*