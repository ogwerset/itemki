// Inwentarz Domowy v2.1 - COMPLETE VERSION
// Autor: AI Assistant | Data: 2025-10-07
// UPDATED: All requested improvements implemented

class InventoryApp {
    constructor() {
        // UPDATED: Scanner tab is now first by default
        this.currentTab = 'scanner'; // UPDATED: Default to scanner tab
        this.currentView = 'table'; // UPDATED: Default to table view
        this.currentPage = 1;
        this.itemsPerPage = 25; // UPDATED: Default to 25 items per page
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
        this.scanMode = 'single'; // UPDATED: single = individual assignment, batch = bulk transfer
        this.cameraPermissionGranted = false;
        
        // UPDATED: Load data from external JSON file
        this.data = { items: [], boxes: [] };
        
        this.init();
    }
    
    async init() {
        // UPDATED: Load inventory data from external JSON file
        await this.loadInventoryData();
        this.bindEvents();
        this.initializeTabs();
        this.renderItems();
        this.renderBoxes();
        this.updateStats();
        this.populateBoxFilter();
        console.log('🚀 Inwentarz Domowy v2.1 uruchomiony!');
    }
    
    // UPDATED: Load data from external JSON file (45 items only)
    async loadInventoryData() {
        try {
            const response = await fetch('inventory_data.json');
            if (response.ok) {
                const data = await response.json();
                this.data = data;
                console.log(`✅ Załadowano ${this.data.items.length} przedmiotów z pliku JSON`);
            } else {
                console.warn('⚠️ Nie można załadować pliku inventory_data.json, używam domyślnych danych');
                this.loadDefaultData();
            }
        } catch (error) {
            console.warn('⚠️ Błąd ładowania inventory_data.json:', error);
            this.loadDefaultData();
        }
    }
    
    // UPDATED: Fallback to minimal data if JSON loading fails
    loadDefaultData() {
        this.data = {
            "items": [
                {"serial":"DOM001","item":"Przykładowy przedmiot","box":"","lastSeen":"","boxChanged":""}
            ],
            "boxes": []
        };
    }
    
    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // View toggle
        document.getElementById('view-cards').addEventListener('click', () => this.switchView('cards'));
        document.getElementById('view-table').addEventListener('click', () => this.switchView('table'));
        
        // Filters
        document.getElementById('search-filter').addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.currentPage = 1;
            this.renderItems();
        });
        
        document.getElementById('box-filter').addEventListener('change', (e) => {
            this.selectedBox = e.target.value;
            this.currentPage = 1;
            this.renderItems();
        });
        
        document.getElementById('sort-filter').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderItems();
        });
        
        // UPDATED: Items per page control
        document.getElementById('items-per-page').addEventListener('change', (e) => {
            this.itemsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.renderItems();
        });
        
        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderItems();
            }
        });
        
        document.getElementById('next-page').addEventListener('click', () => {
            const maxPage = Math.ceil(this.getFilteredItems().length / this.itemsPerPage);
            if (this.currentPage < maxPage) {
                this.currentPage++;
                this.renderItems();
            }
        });
        
        // Box management
        document.getElementById('add-box').addEventListener('click', () => this.showBoxModal());
        document.getElementById('save-box').addEventListener('click', () => this.saveBox());
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.hideBoxModal());
        });
        
        // Scanner events
        document.getElementById('start-scan').addEventListener('click', () => this.startScanning());
        document.getElementById('stop-scan').addEventListener('click', () => this.stopScanning());
        document.getElementById('toggle-camera').addEventListener('click', () => this.toggleCamera());
        document.getElementById('toggle-flash').addEventListener('click', () => this.toggleFlash());
        document.getElementById('clear-results').addEventListener('click', () => this.clearScanResults());
        document.getElementById('save-batch').addEventListener('click', () => this.saveBatchResults());
        document.getElementById('scan-mode').addEventListener('change', (e) => {
            this.scanMode = e.target.value;
        });
        
        // UPDATED: Enhanced Import/Export events
        document.getElementById('import-json-file').addEventListener('click', () => this.importFromJsonFile());
        document.getElementById('import-csv-file').addEventListener('click', () => this.importFromCsvFile());
        document.getElementById('import-text-json').addEventListener('click', () => this.importFromTextJson());
        document.getElementById('import-text-csv').addEventListener('click', () => this.importFromTextCsv());
        document.getElementById('export-json').addEventListener('click', () => this.exportToJson());
        document.getElementById('export-csv').addEventListener('click', () => this.exportToCsv());
        document.getElementById('copy-json').addEventListener('click', () => this.copyJsonToClipboard());
        document.getElementById('copy-csv').addEventListener('click', () => this.copyCsvToClipboard());
        document.getElementById('reset-data').addEventListener('click', () => this.resetData());
        
        // UPDATED: Enhanced notification system
        document.getElementById('notification-close').addEventListener('click', () => this.hideNotification());
    }
    
    // === TAB MANAGEMENT ===
    initializeTabs() {
        // UPDATED: Start with scanner tab
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
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.querySelector(`[data-tab=\"${tabName}\"]`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Special handling for scanner tab
        if (tabName === 'scanner') {
            this.prepareScanner();
        } else if (this.isScanning) {
            this.stopScanning();
        }
        
        // Update stats when switching to import-export tab
        if (tabName === 'import-export') {
            this.updateDataStats();
        }
    }
    
    switchView(viewName) {
        this.currentView = viewName;
        if (viewName === 'cards') {
            document.getElementById('cards-view').style.display = 'grid';
            document.getElementById('table-view').style.display = 'none';
            document.getElementById('view-cards').classList.add('btn--primary');
            document.getElementById('view-cards').classList.remove('btn--outline');
            document.getElementById('view-table').classList.add('btn--outline');
            document.getElementById('view-table').classList.remove('btn--primary');
        } else {
            document.getElementById('cards-view').style.display = 'none';
            document.getElementById('table-view').style.display = 'block';
            document.getElementById('view-table').classList.add('btn--primary');
            document.getElementById('view-table').classList.remove('btn--outline');
            document.getElementById('view-cards').classList.add('btn--outline');
            document.getElementById('view-cards').classList.remove('btn--primary');
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
    
    renderItems() {
        const filtered = this.getFilteredItems();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = filtered.slice(start, end);
        
        if (this.currentView === 'cards') {
            this.renderCardsView(pageItems);
        } else {
            // UPDATED: Render table view grouped by box
            this.renderTableViewGrouped(filtered, start, end);
        }
        
        this.updatePagination(filtered.length);
        this.updateItemsInfo(filtered.length, start + 1, Math.min(end, filtered.length));
    }
    
    // UPDATED: Enhanced table view with Monday.com-style grouping
    renderTableViewGrouped(allItems, start, end) {
        const container = document.getElementById('table-view');
        
        // Group items by box
        const grouped = {};
        const pageItems = allItems.slice(start, end);
        
        pageItems.forEach(item => {
            const boxKey = item.box || 'Bez pudełka';
            if (!grouped[boxKey]) {
                grouped[boxKey] = [];
            }
            grouped[boxKey].push(item);
        });
        
        let html = '';
        
        // Render each group
        Object.keys(grouped).forEach(boxKey => {
            const items = grouped[boxKey];
            const boxInfo = this.data.boxes.find(b => b.code === boxKey) || 
                           { code: boxKey, name: boxKey === 'Bez pudełka' ? 'Przedmioty bez pudełka' : boxKey };
            
            html += `
                <div class="table-group">
                    <div class="table-group-header">
                        <div class="group-title">
                            <span>📦 ${boxInfo.name}</span>
                            ${boxKey !== 'Bez pudełka' ? `<small>(${boxKey})</small>` : ''}
                        </div>
                        <div class="group-count">${items.length} element${items.length !== 1 ? 'ów' : ''}</div>
                    </div>
                    <div class="table-responsive">
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>Kod</th>
                                    <th>Przedmiot</th>
                                    <th>Ostatnio widziany</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => `
                                    <tr>
                                        <td><span class="item-code">${item.serial}</span></td>
                                        <td><span class="item-name">${item.item}</span></td>
                                        <td><span class="item-date">${item.lastSeen ? new Date(item.lastSeen).toLocaleString('pl-PL') : 'Brak danych'}</span></td>
                                        <td>
                                            <span class="status ${item.box ? 'status--success' : 'status--warning'}">
                                                ${item.box ? '📦 W pudełku' : '🔍 Do przypisania'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    renderCardsView(items) {
        const container = document.getElementById('cards-view');
        container.innerHTML = items.map(item => `
            <div class="card">
                <div class="card__body">
                    <div class="item-header">
                        <span class="item-serial">${item.serial}</span>
                        <span class="status ${item.box ? 'status--success' : 'status--warning'}">
                            ${item.box ? '📦' : '🔍'}
                        </span>
                    </div>
                    <h3 class="item-name">${item.item}</h3>
                    <div class="item-details">
                        <div class="item-box">
                            <strong>Pudełko:</strong> ${item.box || 'Brak przypisania'}
                        </div>
                        <div class="item-last-seen">
                            <strong>Ostatnio:</strong> 
                            ${item.lastSeen ? new Date(item.lastSeen).toLocaleString('pl-PL') : 'Brak danych'}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    updatePagination(totalItems) {
        const maxPage = Math.ceil(totalItems / this.itemsPerPage);
        document.getElementById('page-info').textContent = `Strona ${this.currentPage} z ${maxPage}`;
        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === maxPage;
    }
    
    // UPDATED: Items info display
    updateItemsInfo(total, start, end) {
        const info = total === 0 ? 'Brak elementów' : `Elementy ${start}-${end} z ${total}`;
        document.getElementById('items-info').textContent = info;
    }
    
    // === SCANNER MANAGEMENT ===
    async prepareScanner() {
        try {
            this.availableCameras = await Html5Qrcode.getCameras();
            console.log('📱 Dostępne kamery:', this.availableCameras.length);
            
            if (this.availableCameras.length > 0) {
                this.cameraPermissionGranted = true;
                document.getElementById('start-scan').disabled = false;
            } else {
                this.showNotification('⚠️ Brak dostępnych kamer', 'warning');
            }
        } catch (err) {
            console.error('❌ Błąd dostępu do kamer:', err);
            this.showNotification('❌ Błąd dostępu do kamery', 'error');
        }
    }
    
    async startScanning() {
        if (!this.cameraPermissionGranted) {
            await this.prepareScanner();
        }
        
        if (this.availableCameras.length === 0) {
            this.showNotification('❌ Brak dostępnych kamer', 'error');
            return;
        }
        
        try {
            this.html5QrCode = new Html5Qrcode("reader");
            const camera = this.availableCameras[this.currentCameraIndex];
            
            await this.html5QrCode.start(
                camera.id,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    rememberLastUsedCamera: true
                },
                (decodedText, decodedResult) => this.handleScanResult(decodedText, decodedResult),
                (errorMessage) => {
                    // Ignore frequent scanning errors
                }
            );
            
            this.isScanning = true;
            this.updateScanControls();
            this.showNotification('🎯 Skanowanie rozpoczęte', 'success');
            
        } catch (err) {
            console.error('❌ Błąd uruchamiania skanera:', err);
            this.showNotification('❌ Błąd uruchamiania skanera', 'error');
        }
    }
    
    async stopScanning() {
        if (this.html5QrCode && this.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.html5QrCode = null;
                this.isScanning = false;
                this.updateScanControls();
                this.showNotification('⏹️ Skanowanie zatrzymane', 'success');
            } catch (err) {
                console.error('❌ Błąd zatrzymywania skanera:', err);
            }
        }
    }
    
    // UPDATED: Enhanced scan result handling with sound and vibration
    handleScanResult(decodedText, decodedResult) {
        const code = decodedText.trim().toUpperCase();
        
        // UPDATED: Play sound on successful scan
        this.playScanSound();
        
        // UPDATED: Trigger vibration on mobile devices
        if (navigator.vibrate) {
            navigator.vibrate(100); // 100ms vibration
        }
        
        // UPDATED: Enhanced scan mode logic with new names
        if (this.scanMode === 'single') {
            // Single mode: Individual Assignment (DOM -> BOX -> Done)
            this.handleSingleScanMode(code);
        } else {
            // Batch mode: Bulk Transfer (n*DOM -> BOX -> All assigned)
            this.handleBatchScanMode(code);
        }
        
        this.updateScanCounter();
        this.renderScanResults();
        
        // Show success notification
        this.showNotification(`✅ Zeskanowano: ${code}`, 'success', 2000);
    }
    
    // UPDATED: Play scan success sound
    playScanSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800; // High frequency beep
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Audio not supported or blocked');
        }
    }
    
    // UPDATED: Single scan mode (Individual Assignment)
    handleSingleScanMode(code) {
        if (code.startsWith('DOM')) {
            // Step 1: Item scanned
            const existingResult = this.scanResults.find(r => r.type === 'item' && r.code === code);
            if (!existingResult) {
                const item = this.data.items.find(i => i.serial === code);
                this.scanResults.push({
                    id: Date.now(),
                    type: 'item',
                    code: code,
                    item: item ? item.item : 'Nieznany przedmiot',
                    timestamp: new Date(),
                    status: 'awaiting_box'
                });
                this.showNotification(`📦 Przedmiot zeskanowany. Teraz zeskanuj pudełko.`, 'success');
            }
        } else if (code.startsWith('BOX') || this.data.boxes.find(b => b.code === code)) {
            // Step 2: Box scanned - assign pending items to this box
            const pendingItems = this.scanResults.filter(r => r.status === 'awaiting_box');
            if (pendingItems.length > 0) {
                pendingItems.forEach(result => {
                    result.targetBox = code;
                    result.status = 'ready_to_assign';
                });
                this.showNotification(`✅ Przypisano ${pendingItems.length} przedmiot(ów) do ${code}`, 'success');
                document.getElementById('save-batch').disabled = false;
            } else {
                this.showNotification(`⚠️ Brak przedmiotów do przypisania`, 'warning');
            }
        }
    }
    
    // UPDATED: Batch scan mode (Bulk Transfer)
    handleBatchScanMode(code) {
        if (code.startsWith('DOM')) {
            // Collect multiple items
            const existingResult = this.scanResults.find(r => r.type === 'item' && r.code === code);
            if (!existingResult) {
                const item = this.data.items.find(i => i.serial === code);
                this.scanResults.push({
                    id: Date.now(),
                    type: 'item',
                    code: code,
                    item: item ? item.item : 'Nieznany przedmiot',
                    timestamp: new Date(),
                    status: 'collected'
                });
            }
        } else if (code.startsWith('BOX') || this.data.boxes.find(b => b.code === code)) {
            // Assign all collected items to this box
            const collectedItems = this.scanResults.filter(r => r.status === 'collected');
            if (collectedItems.length > 0) {
                collectedItems.forEach(result => {
                    result.targetBox = code;
                    result.status = 'ready_to_assign';
                });
                this.showNotification(`✅ Przygotowano ${collectedItems.length} przedmiot(ów) do przeniesienia do ${code}`, 'success');
                document.getElementById('save-batch').disabled = false;
            }
        }
    }
    
    async saveBatchResults() {
        const readyItems = this.scanResults.filter(r => r.status === 'ready_to_assign');
        
        if (readyItems.length === 0) {
            this.showNotification('⚠️ Brak elementów do zapisania', 'warning');
            return;
        }
        
        let successCount = 0;
        
        readyItems.forEach(result => {
            const itemIndex = this.data.items.findIndex(item => item.serial === result.code);
            if (itemIndex !== -1) {
                this.data.items[itemIndex].box = result.targetBox;
                this.data.items[itemIndex].lastSeen = new Date().toISOString().replace('T', ' ').substring(0, 19);
                this.data.items[itemIndex].boxChanged = new Date().toISOString().replace('T', ' ').substring(0, 19);
                successCount++;
                
                result.status = 'assigned';
            }
        });
        
        if (successCount > 0) {
            this.updateBoxCounts();
            this.renderItems();
            this.renderBoxes();
            this.updateStats();
            this.showNotification(`✅ Zapisano zmiany dla ${successCount} przedmiot(ów)`, 'success');
            
            // Clear successful results after delay
            setTimeout(() => {
                this.scanResults = this.scanResults.filter(r => r.status !== 'assigned');
                this.renderScanResults();
                document.getElementById('save-batch').disabled = true;
            }, 2000);
        }
    }
    
    renderScanResults() {
        const container = document.getElementById('scan-results-list');
        
        if (this.scanResults.length === 0) {
            container.innerHTML = '<p class="empty-state">Brak wyników skanowania</p>';
            return;
        }
        
        container.innerHTML = this.scanResults.map(result => {
            let statusIcon = '⏳';
            let statusText = 'Oczekuje';
            let statusClass = 'status--info';
            
            switch (result.status) {
                case 'awaiting_box':
                    statusIcon = '📦';
                    statusText = 'Czeka na pudełko';
                    statusClass = 'status--warning';
                    break;
                case 'collected':
                    statusIcon = '📥';
                    statusText = 'Zebrano';
                    statusClass = 'status--info';
                    break;
                case 'ready_to_assign':
                    statusIcon = '✅';
                    statusText = `Gotowy → ${result.targetBox}`;
                    statusClass = 'status--success';
                    break;
                case 'assigned':
                    statusIcon = '💾';
                    statusText = 'Zapisano';
                    statusClass = 'status--success';
                    break;
            }
            
            return `
                <div class="scan-result-item">
                    <div class="result-header">
                        <span class="result-code">${result.code}</span>
                        <span class="status ${statusClass}">
                            ${statusIcon} ${statusText}
                        </span>
                    </div>
                    <div class="result-name">${result.item}</div>
                    <div class="result-time">${result.timestamp.toLocaleTimeString('pl-PL')}</div>
                </div>
            `;
        }).join('');
    }
    
    updateScanCounter() {
        document.getElementById('scan-counter').textContent = this.scanResults.length;
    }
    
    updateScanControls() {
        document.getElementById('start-scan').disabled = this.isScanning;
        document.getElementById('stop-scan').disabled = !this.isScanning;
        document.getElementById('toggle-camera').disabled = !this.isScanning;
        document.getElementById('toggle-flash').disabled = !this.isScanning;
    }
    
    clearScanResults() {
        this.scanResults = [];
        this.renderScanResults();
        this.updateScanCounter();
        document.getElementById('save-batch').disabled = true;
        this.showNotification('🗑️ Wyniki skanowania wyczyszczone', 'success');
    }
    
    async toggleCamera() {
        if (this.availableCameras.length < 2) {
            this.showNotification('⚠️ Brak dodatkowych kamer', 'warning');
            return;
        }
        
        this.currentCameraIndex = (this.currentCameraIndex + 1) % this.availableCameras.length;
        
        if (this.isScanning) {
            await this.stopScanning();
            setTimeout(() => this.startScanning(), 500);
        }
    }
    
    async toggleFlash() {
        this.flashEnabled = !this.flashEnabled;
        this.showNotification(
            this.flashEnabled ? '💡 Latarka włączona' : '💡 Latarka wyłączona', 
            'success'
        );
    }
    
    // === NOTIFICATION SYSTEM ===
    // UPDATED: Enhanced notification system (center screen, large, dismissible)
    showNotification(message, type = 'success', duration = 4000) {
        const notification = document.getElementById('notification');
        const icon = document.getElementById('notification-icon');
        const messageEl = document.getElementById('notification-message');
        
        // Set icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        icon.textContent = icons[type] || icons.info;
        messageEl.textContent = message;
        
        // Reset classes and add new type
        notification.className = `notification show ${type}`;
        
        // Auto-hide after duration
        setTimeout(() => {
            this.hideNotification();
        }, duration);
    }
    
    hideNotification() {
        const notification = document.getElementById('notification');
        notification.classList.remove('show');
    }
    
    // === BOX MANAGEMENT ===
    renderBoxes() {
        const container = document.getElementById('boxes-list');
        
        if (this.data.boxes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>📦 Brak pudełek</h3>
                    <p>Dodaj pierwsze pudełko, aby rozpocząć organizację przedmiotów.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.data.boxes.map(box => `
            <div class="card">
                <div class="card__body">
                    <div class="box-header">
                        <h3>${box.name}</h3>
                        <span class="box-code">${box.code}</span>
                    </div>
                    <div class="box-details">
                        <div class="box-location">📍 ${box.location}</div>
                        <div class="box-count">📦 ${box.itemCount} przedmiot${box.itemCount !== 1 ? 'ów' : ''}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    showBoxModal() {
        document.getElementById('box-modal').style.display = 'flex';
    }
    
    hideBoxModal() {
        document.getElementById('box-modal').style.display = 'none';
        // Clear form
        document.getElementById('box-code').value = '';
        document.getElementById('box-name').value = '';
        document.getElementById('box-location').value = '';
    }
    
    saveBox() {
        const code = document.getElementById('box-code').value.trim().toUpperCase();
        const name = document.getElementById('box-name').value.trim();
        const location = document.getElementById('box-location').value.trim();
        
        if (!code || !name) {
            this.showNotification('⚠️ Kod i nazwa pudełka są wymagane', 'warning');
            return;
        }
        
        // Check if box already exists
        if (this.data.boxes.find(box => box.code === code)) {
            this.showNotification('⚠️ Pudełko o tym kodzie już istnieje', 'warning');
            return;
        }
        
        // Add new box
        this.data.boxes.push({
            code: code,
            name: name,
            location: location || 'Nieznana',
            itemCount: 0
        });
        
        this.updateBoxCounts();
        this.renderBoxes();
        this.populateBoxFilter();
        this.hideBoxModal();
        
        this.showNotification(`✅ Dodano pudełko: ${name} (${code})`, 'success');
    }
    
    updateBoxCounts() {
        this.data.boxes.forEach(box => {
            box.itemCount = this.data.items.filter(item => item.box === box.code).length;
        });
    }
    
    populateBoxFilter() {
        const select = document.getElementById('box-filter');
        const currentValue = select.value;
        
        select.innerHTML = `
            <option value="">Wszystkie pudełka</option>
            <option value="null">Bez pudełka</option>
            ${this.data.boxes.map(box => 
                `<option value="${box.code}">${box.name} (${box.code})</option>`
            ).join('')}
        `;
        
        if (currentValue) {
            select.value = currentValue;
        }
    }
    
    updateStats() {
        console.log(`📊 Statystyki: ${this.data.items.length} przedmiotów, ${this.data.boxes.length} pudełek`);
    }
    
    // UPDATED: Enhanced data statistics for import/export tab
    updateDataStats() {
        const container = document.getElementById('data-stats');
        const totalItems = this.data.items.length;
        const itemsWithBoxes = this.data.items.filter(item => item.box).length;
        const itemsWithoutBoxes = totalItems - itemsWithBoxes;
        const totalBoxes = this.data.boxes.length;
        
        container.innerHTML = `
            <div class="stat-item">
                <span>Wszystkie przedmioty:</span>
                <strong>${totalItems}</strong>
            </div>
            <div class="stat-item">
                <span>W pudełkach:</span>
                <strong>${itemsWithBoxes}</strong>
            </div>
            <div class="stat-item">
                <span>Bez pudełek:</span>
                <strong>${itemsWithoutBoxes}</strong>
            </div>
            <div class="stat-item">
                <span>Liczba pudełek:</span>
                <strong>${totalBoxes}</strong>
            </div>
        `;
    }
    
    // === ENHANCED IMPORT/EXPORT METHODS ===
    
    importFromJsonFile() {
        const fileInput = document.getElementById('json-file-input');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('⚠️ Wybierz plik JSON', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.importData(data);
            } catch (error) {
                this.showNotification('❌ Błędny format pliku JSON', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    importFromCsvFile() {
        const fileInput = document.getElementById('csv-file-input');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('⚠️ Wybierz plik CSV', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvData = e.target.result;
                this.importCsvData(csvData);
            } catch (error) {
                this.showNotification('❌ Błąd odczytu pliku CSV', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    importFromTextJson() {
        const text = document.getElementById('import-text').value.trim();
        if (!text) {
            this.showNotification('⚠️ Wklej dane JSON', 'warning');
            return;
        }
        
        try {
            const data = JSON.parse(text);
            this.importData(data);
        } catch (error) {
            this.showNotification('❌ Błędny format JSON', 'error');
        }
    }
    
    importFromTextCsv() {
        const text = document.getElementById('import-text').value.trim();
        if (!text) {
            this.showNotification('⚠️ Wklej dane CSV', 'warning');
            return;
        }
        
        this.importCsvData(text);
    }
    
    importCsvData(csvText) {
        try {
            const lines = csvText.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                throw new Error('Plik CSV musi zawierać nagłówek i przynajmniej jeden rekord');
            }
            
            const headers = this.parseCsvLine(lines[0]);
            const items = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCsvLine(lines[i]);
                if (values.length >= headers.length) {
                    const item = {};
                    headers.forEach((header, index) => {
                        const cleanHeader = header.replace(/[""]/g, '').trim();
                        let key = '';
                        
                        switch (cleanHeader.toLowerCase()) {
                            case 'numer seryjny':
                            case 'serial':
                            case 'kod':
                                key = 'serial';
                                break;
                            case 'nazwa':
                            case 'item':
                            case 'przedmiot':
                                key = 'item';
                                break;
                            case 'pudełko':
                            case 'box':
                                key = 'box';
                                break;
                            case 'ostatnio widziany':
                            case 'lastseen':
                            case 'last seen':
                                key = 'lastSeen';
                                break;
                            case 'zmiana pudełka':
                            case 'boxchanged':
                            case 'box changed':
                                key = 'boxChanged';
                                break;
                            default:
                                key = cleanHeader;
                        }
                        
                        item[key] = values[index] ? values[index].replace(/[""]/g, '').trim() : '';
                    });
                    
                    if (item.serial && item.item) {
                        items.push(item);
                    }
                }
            }
            
            if (items.length > 0) {
                const importData = { items: items, boxes: this.data.boxes };
                this.importData(importData);
            } else {
                this.showNotification('⚠️ Nie znaleziono poprawnych danych w pliku CSV', 'warning');
            }
            
        } catch (error) {
            this.showNotification(`❌ Błąd importu CSV: ${error.message}`, 'error');
        }
    }
    
    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }
    
    importData(data) {
        if (!data || typeof data !== 'object') {
            this.showNotification('❌ Nieprawidłowe dane', 'error');
            return;
        }
        
        let importedItems = 0;
        let importedBoxes = 0;
        
        // Import items
        if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
                if (item.serial && item.item) {
                    const existingIndex = this.data.items.findIndex(existing => existing.serial === item.serial);
                    if (existingIndex !== -1) {
                        this.data.items[existingIndex] = { ...this.data.items[existingIndex], ...item };
                    } else {
                        this.data.items.push(item);
                    }
                    importedItems++;
                }
            });
        }
        
        // Import boxes
        if (data.boxes && Array.isArray(data.boxes)) {
            data.boxes.forEach(box => {
                if (box.code && box.name) {
                    const existingIndex = this.data.boxes.findIndex(existing => existing.code === box.code);
                    if (existingIndex !== -1) {
                        this.data.boxes[existingIndex] = { ...this.data.boxes[existingIndex], ...box };
                    } else {
                        this.data.boxes.push(box);
                        importedBoxes++;
                    }
                }
            });
        }
        
        if (importedItems > 0 || importedBoxes > 0) {
            this.updateBoxCounts();
            this.renderItems();
            this.renderBoxes();
            this.populateBoxFilter();
            this.updateStats();
            this.updateDataStats();
            
            this.showNotification(
                `✅ Zaimportowano: ${importedItems} przedmiot(ów), ${importedBoxes} pudełek`, 
                'success'
            );
            
            document.getElementById('import-text').value = '';
        } else {
            this.showNotification('⚠️ Nie zaimportowano żadnych danych', 'warning');
        }
    }
    
    exportToJson() {
        const data = JSON.stringify(this.data, null, 2);
        this.downloadFile(data, 'inwentarz.json', 'application/json');
        this.showNotification('💾 Eksport JSON zakończony', 'success');
    }
    
    exportToCsv() {
        const csvData = this.generateCsv();
        this.downloadFile(csvData, 'inwentarz.csv', 'text/csv');
        this.showNotification('📊 Eksport CSV zakończony', 'success');
    }
    
    async copyJsonToClipboard() {
        const data = JSON.stringify(this.data, null, 2);
        try {
            await navigator.clipboard.writeText(data);
            document.getElementById('export-preview').value = data;
            this.showNotification('📋 JSON skopiowany do schowka', 'success');
        } catch (error) {
            document.getElementById('export-preview').value = data;
            this.showNotification('📋 JSON wyświetlony w podglądzie', 'success');
        }
    }
    
    async copyCsvToClipboard() {
        const csvData = this.generateCsv();
        try {
            await navigator.clipboard.writeText(csvData);
            document.getElementById('export-preview').value = csvData;
            this.showNotification('📋 CSV skopiowany do schowka', 'success');
        } catch (error) {
            document.getElementById('export-preview').value = csvData;
            this.showNotification('📋 CSV wyświetlony w podglądzie', 'success');
        }
    }
    
    generateCsv() {
        const headers = ['Numer seryjny', 'Nazwa', 'Pudełko', 'Ostatnio widziany', 'Zmiana pudełka'];
        const csvRows = [headers.map(h => `"${h}"`).join(',')];
        
        this.data.items.forEach(item => {
            const row = [
                `"${item.serial || ''}"`,
                `"${(item.item || '').replace(/"/g, '""')}"`,
                `"${item.box || ''}"`,
                `"${item.lastSeen || ''}"`,
                `"${item.boxChanged || ''}"`
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    resetData() {
        const confirmed = confirm(
            '⚠️ UWAGA!\n\nCzy na pewno chcesz usunąć wszystkie dane?\n\nTa operacja:\n' +
            '• Usunie wszystkie przedmioty\n' +
            '• Usunie wszystkie pudełka\n' +
            '• Nie może być cofnięta\n\n' +
            'Zalecamy wykonanie kopii zapasowej przed kontynuowaniem.\n\n' +
            'Kliknij OK aby kontynuować lub Anuluj aby przerwać.'
        );
        
        if (confirmed) {
            this.data = { items: [], boxes: [] };
            this.renderItems();
            this.renderBoxes();
            this.populateBoxFilter();
            this.updateStats();
            this.updateDataStats();
            this.showNotification('🗑️ Wszystkie dane zostały usunięte', 'success');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.inventoryApp = new InventoryApp();
});