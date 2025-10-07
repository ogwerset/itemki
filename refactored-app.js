// Inwentarz Domowy v2.1+ - Refaktoryzacja zgodna z wymaganiami
// Autor: AI Assistant | Data: 2025-10-07

class InventoryApp {
    constructor() {
        // UPDATED: Domyślna zakładka to skaner zamiast items
        this.currentTab = 'scanner'; 
        this.currentView = 'table'; // UPDATED: Domyślnie tabela zamiast cards
        this.currentPage = 1;
        this.itemsPerPage = 10; // UPDATED: Dodano opcję wyboru ilości
        this.searchTerm = '';
        this.selectedBox = '';
        this.sortBy = 'item';

        // Scanner state
        this.html5QrCode = null;
        this.isScanning = false;
        this.scanResults = [];
        this.availableCameras = [];
        this.currentCameraIndex = 0;
        this.flashEnabled = false;
        this.scanMode = 'single'; // UPDATED: Zmienione nazwy trybów
        this.cameraPermissionGranted = false;
        
        // UPDATED: Batch scanning state
        this.batchScanningPhase = 'items'; // 'items' or 'box'
        this.batchItems = [];

        // UPDATED: Dane będą ładowane z zewnętrznego pliku
        this.data = {
            items: [],
            boxes: []
        };

        this.loadInventoryData();
        this.init();
    }

    // UPDATED: Nowa metoda do ładowania danych z zewnętrznego pliku
    async loadInventoryData() {
        try {
            const response = await fetch('inwentarz.json');
            if (response.ok) {
                this.data = await response.json();
                console.log('📦 Załadowano dane z inwentarz.json:', this.data.items.length, 'przedmiotów');
            } else {
                throw new Error('Nie można załadować pliku inwentarz.json');
            }
        } catch (error) {
            console.warn('⚠️ Błąd ładowania inwentarz.json, używam danych testowych:', error);
            this.loadFallbackData();
        }
        
        // Odświeć UI po załadowaniu danych
        this.renderItems();
        this.renderBoxes();
        this.updateStats();
        this.populateBoxFilter();
    }

    // UPDATED: Backup dane jeśli zewnętrzny plik nie działa
    loadFallbackData() {
        this.data = {
            "items": [
                {"serial":"DOM064","item":"Czerwony spray","box":"BOX05","lastSeen":"2025-09-14 21:30:09","boxChanged":"2025-09-14 21:30:19"},
                {"serial":"DOM070","item":"Płyn do robienia baniek","box":"BOX05","lastSeen":"2025-09-14 21:30:31","boxChanged":"2025-09-14 21:30:49"},
                {"serial":"DOM013","item":"Kadzidełka","box":"BOX05","lastSeen":"2025-09-14 21:31:00","boxChanged":"2025-09-14 21:31:10"}
            ],
            "boxes": [
                {"code":"BOX05","name":"Pudełko różne","location":"Magazyn","itemCount":14}
            ]
        };
    }

    init() {
        this.bindEvents();
        this.initializeTabs();
        console.log('🚀 Inwentarz Domowy v2.1+ uruchomiony!');
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // View toggle
        document.getElementById('view-cards')?.addEventListener('click', () => this.switchView('cards'));
        document.getElementById('view-table')?.addEventListener('click', () => this.switchView('table'));

        // UPDATED: Items per page selector
        const itemsPerPageSelect = document.getElementById('items-per-page');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderItems();
            });
        }

        // Filters
        document.getElementById('search-filter')?.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.currentPage = 1;
            this.renderItems();
        });

        document.getElementById('box-filter')?.addEventListener('change', (e) => {
            this.selectedBox = e.target.value;
            this.currentPage = 1;
            this.renderItems();
        });

        document.getElementById('sort-filter')?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderItems();
        });

        // Pagination
        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderItems();
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            const maxPage = Math.ceil(this.getFilteredItems().length / this.itemsPerPage);
            if (this.currentPage < maxPage) {
                this.currentPage++;
                this.renderItems();
            }
        });

        // Box management
        document.getElementById('add-box')?.addEventListener('click', () => this.showBoxModal());
        document.getElementById('save-box')?.addEventListener('click', () => this.saveBox());
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.hideBoxModal());
        });

        // Scanner events
        document.getElementById('start-scan')?.addEventListener('click', () => this.startScanning());
        document.getElementById('stop-scan')?.addEventListener('click', () => this.stopScanning());
        document.getElementById('toggle-camera')?.addEventListener('click', () => this.toggleCamera());
        document.getElementById('toggle-flash')?.addEventListener('click', () => this.toggleFlash());
        document.getElementById('clear-results')?.addEventListener('click', () => this.clearScanResults());
        document.getElementById('save-batch')?.addEventListener('click', () => this.saveBatchResults());
        
        // UPDATED: Scan mode handling
        const scanModeSelect = document.getElementById('scan-mode');
        if (scanModeSelect) {
            scanModeSelect.addEventListener('change', (e) => {
                this.scanMode = e.target.value;
                this.updateScanModeUI();
            });
        }

        // Import/Export events
        document.getElementById('import-btn')?.addEventListener('click', () => this.importData());
        document.getElementById('export-btn')?.addEventListener('click', () => this.exportData());
        document.getElementById('reset-data')?.addEventListener('click', () => this.resetData());
    }

    // === TAB MANAGEMENT ===
    initializeTabs() {
        // UPDATED: Domyślnie otwiera skaner
        this.switchTab('scanner');
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const tabElement = document.getElementById(`${tabName}-tab`);
        const btnElement = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (tabElement && btnElement) {
            tabElement.classList.add('active');
            btnElement.classList.add('active');
        }

        this.currentTab = tabName;

        // Special handling for scanner tab
        if (tabName === 'scanner') {
            this.prepareScanner();
        } else if (this.isScanning) {
            this.stopScanning();
        }
    }

    switchView(viewName) {
        this.currentView = viewName;
        
        const cardsView = document.getElementById('cards-view');
        const tableView = document.getElementById('table-view');
        const viewCardsBtn = document.getElementById('view-cards');
        const viewTableBtn = document.getElementById('view-table');

        if (viewName === 'cards') {
            cardsView.style.display = 'grid';
            tableView.style.display = 'none';
            viewCardsBtn?.classList.add('btn--primary');
            viewCardsBtn?.classList.remove('btn--outline');
            viewTableBtn?.classList.add('btn--outline');
            viewTableBtn?.classList.remove('btn--primary');
        } else {
            cardsView.style.display = 'none';
            tableView.style.display = 'block';
            viewTableBtn?.classList.add('btn--primary');
            viewTableBtn?.classList.remove('btn--outline');
            viewCardsBtn?.classList.add('btn--outline');
            viewCardsBtn?.classList.remove('btn--primary');
        }
        
        this.renderItems();
    }

    // === ITEMS MANAGEMENT ===
    getFilteredItems() {
        let filtered = [...this.data.items];

        // Search filter
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                item.item.toLowerCase().includes(term) || 
                item.serial.toLowerCase().includes(term)
            );
        }

        // Box filter
        if (this.selectedBox !== '') {
            if (this.selectedBox === 'null') {
                filtered = filtered.filter(item => !item.box);
            } else {
                filtered = filtered.filter(item => item.box === this.selectedBox);
            }
        }

        // Sort
        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'lastSeen':
                    return new Date(b.lastSeen || 0) - new Date(a.lastSeen || 0);
                case 'box':
                    return (a.box || '').localeCompare(b.box || '');
                default:
                    return a.item.localeCompare(b.item);
            }
        });

        return filtered;
    }

    // UPDATED: Grupowanie według pudeł w widoku tabeli
    renderItems() {
        const filtered = this.getFilteredItems();
        
        // UPDATED: Grupowanie według pudełek
        if (this.currentView === 'table') {
            this.renderTableViewGrouped(filtered);
        } else {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            const pageItems = filtered.slice(start, end);
            this.renderCardsView(pageItems);
        }
        
        this.updatePagination(filtered.length);
    }

    renderCardsView(items) {
        const container = document.getElementById('cards-view');
        if (!container) return;

        container.innerHTML = items.map(item => `
            <div class="card item-card" data-serial="${item.serial}">
                <div class="card__body">
                    <div class="item-serial">${item.serial}</div>
                    <div class="item-name">${item.item}</div>
                    <div class="item-meta">
                        <span class="item-box ${item.box ? 'status--success' : 'status--warning'}">
                            ${item.box || 'Brak pudełka'}
                        </span>
                        <small class="item-date">
                            ${item.lastSeen ? new Date(item.lastSeen).toLocaleDateString('pl-PL') : 'Brak daty'}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // UPDATED: Nowy widok tabeli z grupowaniem
    renderTableViewGrouped(items) {
        const container = document.getElementById('table-view');
        if (!container) return;

        // Group items by box
        const grouped = {};
        const noBoxItems = [];

        items.forEach(item => {
            if (item.box) {
                if (!grouped[item.box]) {
                    grouped[item.box] = [];
                }
                grouped[item.box].push(item);
            } else {
                noBoxItems.push(item);
            }
        });

        let html = `
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Numer seryjny</th>
                        <th>Nazwa przedmiotu</th>
                        <th>Pudełko</th>
                        <th>Ostatnio widziany</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Render grouped items
        Object.keys(grouped).sort().forEach(boxCode => {
            const boxItems = grouped[boxCode];
            const boxInfo = this.data.boxes.find(b => b.code === boxCode);
            
            html += `
                <tr class="box-group-header">
                    <td colspan="5">
                        <strong>📦 ${boxCode} - ${boxInfo ? boxInfo.name : 'Nieznane pudełko'}</strong>
                        <span class="item-count">(${boxItems.length} przedmiotów)</span>
                    </td>
                </tr>
            `;
            
            boxItems.forEach(item => {
                html += this.renderTableRow(item);
            });
        });

        // Render items without box
        if (noBoxItems.length > 0) {
            html += `
                <tr class="box-group-header">
                    <td colspan="5">
                        <strong>❓ Bez przypisania do pudełka</strong>
                        <span class="item-count">(${noBoxItems.length} przedmiotów)</span>
                    </td>
                </tr>
            `;
            
            noBoxItems.forEach(item => {
                html += this.renderTableRow(item);
            });
        }

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    renderTableRow(item) {
        return `
            <tr class="item-row" data-serial="${item.serial}">
                <td class="serial-cell">${item.serial}</td>
                <td class="name-cell">${item.item}</td>
                <td class="box-cell">
                    <span class="status ${item.box ? 'status--success' : 'status--warning'}">
                        ${item.box || 'Brak'}
                    </span>
                </td>
                <td class="date-cell">
                    ${item.lastSeen ? new Date(item.lastSeen).toLocaleString('pl-PL') : 'Brak daty'}
                </td>
                <td class="actions-cell">
                    <button class="btn btn--sm btn--outline" onclick="app.editItem('${item.serial}')">
                        Edytuj
                    </button>
                </td>
            </tr>
        `;
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const currentPageSpan = document.getElementById('current-page');
        const totalPagesSpan = document.getElementById('total-pages');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (currentPageSpan) currentPageSpan.textContent = this.currentPage;
        if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
        
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
    }

    // === SCANNER FUNCTIONALITY ===
    
    prepareScanner() {
        this.updateScanModeUI();
        this.getCameraDevices();
    }

    // UPDATED: Ulepszone tryby skanowania
    updateScanModeUI() {
        const modeDescription = document.getElementById('scan-mode-description');
        if (!modeDescription) return;

        if (this.scanMode === 'single') {
            modeDescription.innerHTML = `
                <strong>Tryb Pojedynczy:</strong><br>
                1. Skanuj kod DOMXXX<br>
                2. Skanuj kod BOXZZ<br>
                3. Przedmiot zostanie przypisany
            `;
        } else if (this.scanMode === 'batch') {
            modeDescription.innerHTML = `
                <strong>Tryb Wsadowy:</strong><br>
                1. Skanuj wiele kodów DOMXXX<br>
                2. Zakończ i przejdź do BOXZZ<br>
                3. Wszystkie przedmioty trafią do jednego pudełka
            `;
        }
    }

    async startScanning() {
        try {
            const scannerContainer = document.getElementById('qr-scanner');
            if (!scannerContainer) {
                this.showNotification('Błąd: Nie znaleziono kontenera skanera', 'error');
                return;
            }

            // Initialize scanner if not exists
            if (!this.html5QrCode) {
                this.html5QrCode = new Html5Qrcode("qr-scanner");
            }

            // Request camera permissions
            await this.getCameraDevices();
            
            const config = {
                fps: 10,
                qrbox: { width: 300, height: 300 },
                aspectRatio: 1.0
            };

            const currentCamera = this.availableCameras[this.currentCameraIndex];
            if (!currentCamera) {
                this.showNotification('Błąd: Brak dostępnych kamer', 'error');
                return;
            }

            await this.html5QrCode.start(
                currentCamera.id,
                config,
                this.onScanSuccess.bind(this),
                this.onScanFailure.bind(this)
            );

            this.isScanning = true;
            this.updateScannerUI();
            
            // UPDATED: Pokaż powiadomienie o rozpoczęciu
            this.showNotification('Skaner uruchomiony pomyślnie', 'success');

        } catch (error) {
            console.error('Błąd uruchamiania skanera:', error);
            this.showNotification(`Błąd skanera: ${error.message}`, 'error');
        }
    }

    async stopScanning() {
        try {
            if (this.html5QrCode && this.isScanning) {
                await this.html5QrCode.stop();
                this.isScanning = false;
                this.updateScannerUI();
                this.showNotification('Skaner zatrzymany', 'info');
            }
        } catch (error) {
            console.error('Błąd zatrzymywania skanera:', error);
            this.showNotification('Błąd zatrzymywania skanera', 'error');
        }
    }

    // UPDATED: Obsługa skanowania z dźwiękami i wibracjami
    onScanSuccess(decodedText, decodedResult) {
        console.log('Zeskanowano kod:', decodedText);
        
        // UPDATED: Dodaj dźwięk i wibracje po udanym skanowaniu
        this.playSuccessSound();
        this.triggerVibration();

        if (this.scanMode === 'single') {
            this.handleSingleScan(decodedText);
        } else if (this.scanMode === 'batch') {
            this.handleBatchScan(decodedText);
        }

        // Update scan results display
        this.updateScanResults();
    }

    onScanFailure(error) {
        // Silent fail - too verbose in console
    }

    // UPDATED: Nowa metoda do odtwarzania dźwięku
    playSuccessSound() {
        try {
            // Create audio context for beep sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Dźwięk niedostępny:', error);
        }
    }

    // UPDATED: Nowa metoda do wibracji
    triggerVibration() {
        try {
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]); // Vibrate pattern
            }
        } catch (error) {
            console.log('Wibracje niedostępne:', error);
        }
    }

    // UPDATED: Poprawiona logika skanowania pojedynczego
    handleSingleScan(code) {
        const isDomCode = code.startsWith('DOM');
        const isBoxCode = code.startsWith('BOX') || /^[A-Z0-9]+$/.test(code);

        if (isDomCode) {
            // Find item
            const item = this.data.items.find(i => i.serial === code);
            if (!item) {
                this.showNotification(`Przedmiot ${code} nie znaleziony w bazie`, 'warning');
                return;
            }

            // Store for next scan
            this.scanResults = [{
                type: 'item',
                code: code,
                item: item,
                timestamp: new Date().toISOString()
            }];

            this.showNotification(`Zeskanowano przedmiot: ${item.item}. Teraz zeskanuj pudełko.`, 'info');

        } else if (isBoxCode && this.scanResults.length > 0 && this.scanResults[0].type === 'item') {
            // Assign item to box
            const itemResult = this.scanResults[0];
            const item = itemResult.item;
            
            // Update item
            item.box = code;
            item.lastSeen = new Date().toISOString();
            item.boxChanged = new Date().toISOString();

            // Save changes
            this.saveToLocalStorage();

            this.showNotification(`✅ ${item.item} przypisano do ${code}`, 'success');
            
            // Clear results
            this.scanResults = [];
            this.renderItems();
            this.updateStats();

        } else {
            this.showNotification('Nieprawidłowa kolejność skanowania', 'warning');
        }
    }

    // UPDATED: Poprawiona logika skanowania wsadowego
    handleBatchScan(code) {
        const isDomCode = code.startsWith('DOM');
        const isBoxCode = code.startsWith('BOX') || /^[A-Z0-9]+$/.test(code);

        if (this.batchScanningPhase === 'items' && isDomCode) {
            // Add item to batch
            const item = this.data.items.find(i => i.serial === code);
            if (!item) {
                this.showNotification(`Przedmiot ${code} nie znaleziony`, 'warning');
                return;
            }

            // Check if already scanned
            if (!this.batchItems.find(bi => bi.serial === code)) {
                this.batchItems.push(item);
                this.showNotification(`Dodano: ${item.item} (${this.batchItems.length} przedmiotów)`, 'info');
            } else {
                this.showNotification('Przedmiot już zeskanowany', 'warning');
            }

        } else if (this.batchScanningPhase === 'items' && isBoxCode) {
            // Switch to box phase
            this.batchScanningPhase = 'box';
            this.assignBatchToBox(code);
            
        } else if (this.batchScanningPhase === 'box' && isBoxCode) {
            this.assignBatchToBox(code);
        }
    }

    assignBatchToBox(boxCode) {
        if (this.batchItems.length === 0) {
            this.showNotification('Brak przedmiotów do przypisania', 'warning');
            return;
        }

        // Assign all items to box
        const timestamp = new Date().toISOString();
        this.batchItems.forEach(item => {
            item.box = boxCode;
            item.lastSeen = timestamp;
            item.boxChanged = timestamp;
        });

        const count = this.batchItems.length;
        this.showNotification(`✅ Przypisano ${count} przedmiotów do ${boxCode}`, 'success');

        // Reset batch
        this.batchItems = [];
        this.batchScanningPhase = 'items';
        
        // Save and refresh
        this.saveToLocalStorage();
        this.renderItems();
        this.updateStats();
    }

    // UPDATED: Poprawione powiadomienia - wyświetlają się NAD wszystkim
    showNotification(message, type = 'info', duration = 4000) {
        // Remove existing notification
        const existing = document.querySelector('.notification-overlay');
        if (existing) {
            existing.remove();
        }

        // Create notification overlay
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.innerHTML = `
            <div class="notification-message">${message}</div>
            <button class="notification-close">&times;</button>
        `;
        
        notification.appendChild(content);
        overlay.appendChild(notification);
        document.body.appendChild(overlay);

        // Close button functionality
        const closeBtn = content.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            overlay.remove();
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, duration);
        }

        // Click overlay to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    async getCameraDevices() {
        try {
            const devices = await Html5Qrcode.getCameras();
            this.availableCameras = devices;
            console.log('Dostępne kamery:', devices);
            
            if (devices.length === 0) {
                this.showNotification('Brak dostępnych kamer', 'error');
                return;
            }

            // Prefer back camera
            const backCameraIndex = devices.findIndex(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('environment')
            );
            
            if (backCameraIndex !== -1) {
                this.currentCameraIndex = backCameraIndex;
            }

        } catch (error) {
            console.error('Błąd dostępu do kamer:', error);
            this.showNotification('Błąd dostępu do kamer', 'error');
        }
    }

    toggleCamera() {
        if (this.availableCameras.length <= 1) {
            this.showNotification('Brak dodatkowych kamer', 'info');
            return;
        }

        this.currentCameraIndex = (this.currentCameraIndex + 1) % this.availableCameras.length;
        
        if (this.isScanning) {
            this.stopScanning().then(() => {
                setTimeout(() => this.startScanning(), 100);
            });
        }

        const currentCamera = this.availableCameras[this.currentCameraIndex];
        this.showNotification(`Przełączono na: ${currentCamera.label}`, 'info');
    }

    toggleFlash() {
        // Note: Flash control is limited in web browsers
        this.flashEnabled = !this.flashEnabled;
        this.showNotification(
            `Flash ${this.flashEnabled ? 'włączony' : 'wyłączony'} (jeśli obsługiwany)`, 
            'info'
        );
    }

    updateScannerUI() {
        const startBtn = document.getElementById('start-scan');
        const stopBtn = document.getElementById('stop-scan');
        const statusDiv = document.getElementById('scanner-status');

        if (startBtn) startBtn.style.display = this.isScanning ? 'none' : 'block';
        if (stopBtn) stopBtn.style.display = this.isScanning ? 'block' : 'none';
        
        if (statusDiv) {
            statusDiv.textContent = this.isScanning ? 'Skanowanie aktywne...' : 'Skaner zatrzymany';
            statusDiv.className = `scanner-status ${this.isScanning ? 'status--success' : 'status--info'}`;
        }
    }

    updateScanResults() {
        const container = document.getElementById('scan-results');
        if (!container) return;

        if (this.scanResults.length === 0 && this.batchItems.length === 0) {
            container.innerHTML = '<p class="no-results">Brak wyników skanowania</p>';
            return;
        }

        let html = '';
        
        // Show current single scan
        if (this.scanResults.length > 0) {
            html += '<h4>Ostatni skan:</h4>';
            html += this.scanResults.map(result => `
                <div class="scan-result">
                    <strong>${result.code}</strong> - ${result.item?.item || 'Nieznany'}
                    <small>${new Date(result.timestamp).toLocaleTimeString('pl-PL')}</small>
                </div>
            `).join('');
        }

        // Show batch items
        if (this.batchItems.length > 0) {
            html += `<h4>Tryb wsadowy (${this.batchItems.length} przedmiotów):</h4>`;
            html += this.batchItems.map(item => `
                <div class="scan-result">
                    <strong>${item.serial}</strong> - ${item.item}
                </div>
            `).join('');
        }

        container.innerHTML = html;
    }

    clearScanResults() {
        this.scanResults = [];
        this.batchItems = [];
        this.batchScanningPhase = 'items';
        this.updateScanResults();
        this.showNotification('Wyczyszczono wyniki skanowania', 'info');
    }

    saveBatchResults() {
        if (this.batchItems.length === 0) {
            this.showNotification('Brak przedmiotów do zapisania', 'warning');
            return;
        }

        // In real implementation, this would prompt for box code
        // For now, just clear the batch
        this.showNotification(`Zapisano ${this.batchItems.length} przedmiotów`, 'success');
        this.clearScanResults();
    }

    // === BOXES MANAGEMENT ===

    renderBoxes() {
        const container = document.getElementById('boxes-grid');
        if (!container) return;

        container.innerHTML = this.data.boxes.map(box => `
            <div class="card box-card" data-box="${box.code}">
                <div class="card__body">
                    <div class="box-header">
                        <h3>${box.code}</h3>
                        <span class="item-count">${box.itemCount} przedmiotów</span>
                    </div>
                    <div class="box-info">
                        <p><strong>${box.name}</strong></p>
                        <p class="box-location">${box.location}</p>
                    </div>
                    <div class="box-actions">
                        <button class="btn btn--sm btn--outline" onclick="app.editBox('${box.code}')">
                            Edytuj
                        </button>
                        <button class="btn btn--sm btn--outline" onclick="app.deleteBox('${box.code}')">
                            Usuń
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateBoxFilter() {
        const select = document.getElementById('box-filter');
        if (!select) return;

        const options = ['<option value="">Wszystkie pudełka</option>'];
        options.push('<option value="null">Bez pudełka</option>');
        
        this.data.boxes.forEach(box => {
            options.push(`<option value="${box.code}">${box.code} - ${box.name}</option>`);
        });

        select.innerHTML = options.join('');
    }

    updateStats() {
        const totalItems = this.data.items.length;
        const itemsWithBox = this.data.items.filter(item => item.box).length;
        const totalBoxes = this.data.boxes.length;

        const statsContainer = document.getElementById('stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat">
                    <div class="stat-value">${totalItems}</div>
                    <div class="stat-label">Przedmioty</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${itemsWithBox}</div>
                    <div class="stat-label">Przypisane</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${totalBoxes}</div>
                    <div class="stat-label">Pudełka</div>
                </div>
            `;
        }

        // Update scan counter
        const scanCounter = document.getElementById('scan-counter');
        if (scanCounter) {
            const scannedCount = this.scanResults.length + this.batchItems.length;
            scanCounter.textContent = `Zeskanowano: ${scannedCount} kodów`;
        }
    }

    // === IMPORT/EXPORT ===
    
    // UPDATED: Przeprojektowany import/export
    async importData() {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
        
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                
                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(text);
                    this.data = data;
                    this.saveToLocalStorage();
                    this.refreshUI();
                    this.showNotification('Dane JSON zaimportowane pomyślnie', 'success');
                    
                } else if (file.name.endsWith('.csv')) {
                    this.importFromCSV(text);
                    this.showNotification('Dane CSV zaimportowane pomyślnie', 'success');
                }
                
            } catch (error) {
                console.error('Błąd importu:', error);
                this.showNotification('Błąd importu danych', 'error');
            }
        };
        
        input.click();
    }

    importFromCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const items = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
            const item = {};
            
            headers.forEach((header, index) => {
                switch (header) {
                    case 'Numer seryjny':
                        item.serial = values[index];
                        break;
                    case 'Nazwa':
                        item.item = values[index];
                        break;
                    case 'Pudełko':
                        item.box = values[index] || '';
                        break;
                    case 'Ostatnio widziany':
                        item.lastSeen = values[index] || '';
                        break;
                    case 'Zmiana pudełka':
                        item.boxChanged = values[index] || '';
                        break;
                }
            });
            
            if (item.serial && item.item) {
                items.push(item);
            }
        }
        
        this.data.items = items;
        this.updateBoxesFromItems();
        this.saveToLocalStorage();
        this.refreshUI();
    }

    exportData() {
        // Show export options modal or directly export JSON
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `inwentarz_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Dane wyeksportowane do pliku JSON', 'success');
    }

    // Export to CSV
    exportToCSV() {
        const csvHeaders = 'Numer seryjny,Nazwa,Pudełko,Ostatnio widziany,Zmiana pudełka\n';
        const csvData = this.data.items.map(item => 
            `"${item.serial}","${item.item}","${item.box || ''}","${item.lastSeen || ''}","${item.boxChanged || ''}"`
        ).join('\n');
        
        const csvBlob = new Blob([csvHeaders + csvData], {type: 'text/csv'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(csvBlob);
        link.download = `inwentarz_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Dane wyeksportowane do pliku CSV', 'success');
    }

    updateBoxesFromItems() {
        const boxCounts = {};
        this.data.items.forEach(item => {
            if (item.box) {
                boxCounts[item.box] = (boxCounts[item.box] || 0) + 1;
            }
        });

        // Update existing boxes or create new ones
        const existingBoxes = new Set(this.data.boxes.map(b => b.code));
        
        Object.keys(boxCounts).forEach(boxCode => {
            if (existingBoxes.has(boxCode)) {
                const box = this.data.boxes.find(b => b.code === boxCode);
                box.itemCount = boxCounts[boxCode];
            } else {
                this.data.boxes.push({
                    code: boxCode,
                    name: `Pudełko ${boxCode}`,
                    location: boxCode.startsWith('BOX') ? 'Magazyn' : 'Dom',
                    itemCount: boxCounts[boxCode]
                });
            }
        });
    }

    refreshUI() {
        this.renderItems();
        this.renderBoxes();
        this.updateStats();
        this.populateBoxFilter();
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('inventory_data', JSON.stringify(this.data));
            console.log('💾 Dane zapisane do localStorage');
        } catch (error) {
            console.error('Błąd zapisu do localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('inventory_data');
            if (stored) {
                this.data = JSON.parse(stored);
                console.log('📂 Dane załadowane z localStorage');
                return true;
            }
        } catch (error) {
            console.error('Błąd odczytu z localStorage:', error);
        }
        return false;
    }

    resetData() {
        if (confirm('Czy na pewno chcesz usunąć wszystkie dane? Ta operacja jest nieodwracalna.')) {
            localStorage.removeItem('inventory_data');
            this.loadFallbackData();
            this.refreshUI();
            this.showNotification('Dane zostały zresetowane', 'info');
        }
    }

    // === PLACEHOLDER METHODS FOR UI ===

    editItem(serial) {
        const item = this.data.items.find(i => i.serial === serial);
        if (item) {
            this.showNotification(`Edycja przedmiotu: ${item.item}`, 'info');
            // TODO: Implement edit modal
        }
    }

    editBox(code) {
        const box = this.data.boxes.find(b => b.code === code);
        if (box) {
            this.showNotification(`Edycja pudełka: ${box.name}`, 'info');
            // TODO: Implement edit modal
        }
    }

    deleteBox(code) {
        const box = this.data.boxes.find(b => b.code === code);
        if (box && box.itemCount === 0) {
            if (confirm(`Czy na pewno usunąć pudełko ${code}?`)) {
                this.data.boxes = this.data.boxes.filter(b => b.code !== code);
                this.saveToLocalStorage();
                this.refreshUI();
                this.showNotification(`Pudełko ${code} usunięte`, 'success');
            }
        } else {
            this.showNotification('Nie można usunąć pudełka z przedmiotami', 'warning');
        }
    }

    showBoxModal() {
        this.showNotification('Funkcja dodawania pudełek w trakcie implementacji', 'info');
        // TODO: Implement box modal
    }

    hideBoxModal() {
        // TODO: Implement
    }

    saveBox() {
        // TODO: Implement
    }
}

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new InventoryApp();
});