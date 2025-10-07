// Inventory App v2.0 - Main Application Logic

class InventoryApp {
    constructor() {
        this.inventory = [];
        this.currentTab = 'scanner';
        this.currentView = 'table';
        this.isScanning = false;
        this.scanMode = 'single';
        this.currentCamera = 'environment'; // back camera
        this.stream = null;
        this.animationFrame = null;
        
        // Settings
        this.settings = {
            sound: true,
            vibration: true,
            autoFocus: true,
            theme: 'dark'
        };
        
        // Sort state
        this.sortColumn = null;
        this.sortDirection = 'asc';
        
        // Categories list
        this.categories = [
            'Elektronika',
            'Meble', 
            'AGD',
            'Sport',
            'Narzędzia',
            'Ubrania',
            'Książki',
            'Inne'
        ];
        
        this.init();
    }

    async init() {
        this.loadSettings();
        this.setupEventListeners();
        await this.loadInventoryData();
        this.renderInventory();
        this.updateStats();
        this.showTab('scanner'); // Default to scanner tab
        this.ensureCategoryDropdowns(); // Ensure category dropdowns are populated
    }

    // Ensure category dropdowns are properly populated
    ensureCategoryDropdowns() {
        const addCategorySelect = document.getElementById('item-category');
        const editCategorySelect = document.getElementById('edit-item-category');
        
        // Check if add form category dropdown needs to be populated
        if (addCategorySelect && addCategorySelect.children.length <= 1) {
            addCategorySelect.innerHTML = '<option value="">Wybierz kategorię</option>' +
                this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
        
        // Check if edit form category dropdown needs to be populated  
        if (editCategorySelect && editCategorySelect.children.length === 0) {
            editCategorySelect.innerHTML = this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
    }

    // Data Loading and Management
    async loadInventoryData() {
        try {
            // Try to load from external CSV first
            const response = await fetch('https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/79707295/123d454f-137c-4456-a9d2-6533a29811b6/inwentarz.csv');
            if (response.ok) {
                const csvText = await response.text();
                this.inventory = this.parseCSV(csvText);
                this.showNotification('Dane załadowane z zewnętrznego pliku', 'success');
            } else {
                throw new Error('Could not load external data');
            }
        } catch (error) {
            console.log('Loading from external source failed, using fallback data');
            // Fallback to sample data
            this.inventory = [
                {
                    id: "item001",
                    name: "iPhone 14 Pro",
                    category: "Elektronika", 
                    location: "Sypialnia",
                    qrCode: "QR001",
                    value: 4500,
                    purchaseDate: "2023-09-15",
                    warranty: "2025-09-15",
                    description: "Space Black, 256GB"
                },
                {
                    id: "item002", 
                    name: "Samsung TV 55\"",
                    category: "Elektronika",
                    location: "Salon", 
                    qrCode: "QR002",
                    value: 2200,
                    purchaseDate: "2023-01-10",
                    warranty: "2025-01-10",
                    description: "4K QLED Smart TV"
                },
                {
                    id: "item003",
                    name: "Sofa narożna",
                    category: "Meble",
                    location: "Salon",
                    qrCode: "QR003", 
                    value: 1800,
                    purchaseDate: "2022-11-20",
                    warranty: "2024-11-20",
                    description: "Szara, rozkładana"
                },
                {
                    id: "item004",
                    name: "MacBook Air M2",
                    category: "Elektronika",
                    location: "Biuro domowe",
                    qrCode: "QR004",
                    value: 5200,
                    purchaseDate: "2023-07-05", 
                    warranty: "2026-07-05",
                    description: "Silver, 512GB SSD"
                },
                {
                    id: "item005",
                    name: "Szafa 3-drzwiowa",
                    category: "Meble",
                    location: "Sypialnia", 
                    qrCode: "QR005",
                    value: 1200,
                    purchaseDate: "2022-08-15",
                    warranty: "2024-08-15",
                    description: "Biała, lustrzane drzwi"
                },
                {
                    id: "item006",
                    name: "Dyson V15 Detect",
                    category: "AGD",
                    location: "Schowek",
                    qrCode: "QR006", 
                    value: 1600,
                    purchaseDate: "2023-03-22",
                    warranty: "2025-03-22",
                    description: "Odkurzacz bezprzewodowy"
                },
                {
                    id: "item007",
                    name: "Ekspres DeLonghi",
                    category: "AGD",
                    location: "Kuchnia",
                    qrCode: "QR007",
                    value: 800,
                    purchaseDate: "2022-12-01", 
                    warranty: "2024-12-01",
                    description: "Automatyczny, cappuccino"
                },
                {
                    id: "item008",
                    name: "Rower górski Trek",
                    category: "Sport",
                    location: "Balkon",
                    qrCode: "QR008",
                    value: 3200,
                    purchaseDate: "2023-04-18",
                    warranty: "2025-04-18", 
                    description: "Rozmiar L, 29 cali"
                },
                {
                    id: "item009",
                    name: "Zestaw narzędzi Bosch",
                    category: "Narzędzia",
                    location: "Piwnica",
                    qrCode: "QR009",
                    value: 450,
                    purchaseDate: "2023-02-10",
                    warranty: "2025-02-10",
                    description: "78 elementów w walizce"
                },
                {
                    id: "item010",
                    name: "Biblioteczka dębowa", 
                    category: "Meble",
                    location: "Biuro domowe",
                    qrCode: "QR010",
                    value: 950,
                    purchaseDate: "2022-10-05",
                    warranty: "2024-10-05",
                    description: "5 półek, lite drewno"
                }
            ];
            
            // Try to load from localStorage
            const stored = localStorage.getItem('inventory_data');
            if (stored) {
                try {
                    const parsedData = JSON.parse(stored);
                    if (Array.isArray(parsedData) && parsedData.length > 0) {
                        this.inventory = parsedData;
                        this.showNotification('Dane załadowane z pamięci lokalnej', 'success');
                    }
                } catch (e) {
                    console.error('Error parsing stored data:', e);
                }
            }
        }
        
        this.saveToStorage();
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            if (values.length === headers.length) {
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = values[index];
                });
                
                // Convert numeric values
                if (item.value) item.value = parseFloat(item.value) || 0;
                
                data.push(item);
            }
        }
        
        return data;
    }

    saveToStorage() {
        try {
            localStorage.setItem('inventory_data', JSON.stringify(this.inventory));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.showTab(tab);
            });
        });

        // Scanner controls
        const startBtn = document.getElementById('start-scanner');
        const stopBtn = document.getElementById('stop-scanner');
        const toggleCamera = document.getElementById('toggle-camera');
        const toggleTorch = document.getElementById('toggle-torch');
        const scanMode = document.getElementById('scan-mode');

        if (startBtn) startBtn.addEventListener('click', () => this.startScanner());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stopScanner());
        if (toggleCamera) toggleCamera.addEventListener('click', () => this.toggleCamera());
        if (toggleTorch) toggleTorch.addEventListener('click', () => this.toggleTorch());
        if (scanMode) scanMode.addEventListener('change', (e) => this.scanMode = e.target.value);

        // Add item form
        const addForm = document.getElementById('add-item-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addItem();
            });
        }

        // Edit item form
        const editForm = document.getElementById('edit-item-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEditItem();
            });
        }

        // Search and filters
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const locationFilter = document.getElementById('location-filter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderInventory());
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.renderInventory());
        }
        if (locationFilter) {
            locationFilter.addEventListener('change', () => this.renderInventory());
        }

        // View toggles
        const tableView = document.getElementById('table-view');
        const cardView = document.getElementById('card-view');

        if (tableView) {
            tableView.addEventListener('click', () => this.toggleView('table'));
        }
        if (cardView) {
            cardView.addEventListener('click', () => this.toggleView('card'));
        }

        // Import/Export
        const exportCsv = document.getElementById('export-csv');
        const exportJson = document.getElementById('export-json');
        const exportBackup = document.getElementById('export-backup');
        const importFile = document.getElementById('import-file');
        const importData = document.getElementById('import-data');
        const confirmImport = document.getElementById('confirm-import');
        const cancelImport = document.getElementById('cancel-import');
        const clearData = document.getElementById('clear-data');
        const resetData = document.getElementById('reset-data');

        if (exportCsv) exportCsv.addEventListener('click', () => this.exportData('csv'));
        if (exportJson) exportJson.addEventListener('click', () => this.exportData('json'));
        if (exportBackup) exportBackup.addEventListener('click', () => this.exportData('backup'));
        if (importFile) importFile.addEventListener('change', (e) => this.handleFileImport(e));
        if (importData) importData.addEventListener('click', () => this.processImport());
        if (confirmImport) confirmImport.addEventListener('click', () => this.confirmImport());
        if (cancelImport) cancelImport.addEventListener('click', () => this.cancelImport());
        if (clearData) clearData.addEventListener('click', () => this.clearAllData());
        if (resetData) resetData.addEventListener('click', () => this.resetToSampleData());

        // Table sorting
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-sort]')) {
                const column = e.target.closest('[data-sort]').dataset.sort;
                this.sortInventory(column);
            }
        });
    }

    // Tab Management
    showTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });

        // Load specific tab data
        if (tabName === 'inventory') {
            this.renderInventory();
            this.populateFilters();
        } else if (tabName === 'add') {
            // Ensure category dropdown is populated when showing add tab
            this.ensureCategoryDropdowns();
        }
    }

    // Scanner Functionality
    async startScanner() {
        try {
            const video = document.getElementById('scanner-video');
            const startBtn = document.getElementById('start-scanner');
            const stopBtn = document.getElementById('stop-scanner');
            const info = document.getElementById('scanner-info');

            if (!video || !startBtn || !stopBtn) return;

            startBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
            info.textContent = 'Inicjalizacja kamery...';

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this.currentCamera,
                    width: { ideal: 640 },
                    height: { ideal: 640 }
                }
            });

            video.srcObject = this.stream;
            video.play();

            info.textContent = 'Skieruj kamerę na kod QR lub kod kreskowy';
            this.isScanning = true;
            this.scanQRCode();

        } catch (error) {
            console.error('Error starting scanner:', error);
            this.showNotification('Nie można uruchomić kamery. Sprawdź uprawnienia.', 'error');
            this.stopScanner();
        }
    }

    stopScanner() {
        this.isScanning = false;
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        const video = document.getElementById('scanner-video');
        const startBtn = document.getElementById('start-scanner');
        const stopBtn = document.getElementById('stop-scanner');
        const info = document.getElementById('scanner-info');

        if (video) video.srcObject = null;
        if (startBtn) startBtn.classList.remove('hidden');
        if (stopBtn) stopBtn.classList.add('hidden');
        if (info) info.textContent = 'Skieruj kamerę na kod QR lub kod kreskowy';
    }

    scanQRCode() {
        if (!this.isScanning) return;

        const video = document.getElementById('scanner-video');
        const canvas = document.getElementById('scanner-canvas');
        const context = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            if (typeof jsQR !== 'undefined') {
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    this.handleScanResult(code.data);
                    return;
                }
            }
        }

        this.animationFrame = requestAnimationFrame(() => this.scanQRCode());
    }

    handleScanResult(data) {
        this.playSuccessSound();
        this.triggerVibration();
        
        // Find existing item with this QR code
        const existingItem = this.inventory.find(item => item.qrCode === data);
        
        if (existingItem) {
            this.showNotification(`Znaleziono: ${existingItem.name}`, 'success');
            // Switch to inventory tab to show the item
            setTimeout(() => {
                this.showTab('inventory');
                this.highlightItem(existingItem.id);
            }, 1000);
        } else {
            this.showNotification(`Zeskanowano kod: ${data}`, 'success');
            // Pre-fill add form with QR code
            setTimeout(() => {
                this.showTab('add');
                const qrInput = document.getElementById('item-qr-code');
                if (qrInput) qrInput.value = data;
            }, 1000);
        }

        if (this.scanMode === 'single') {
            this.stopScanner();
        }
    }

    async toggleCamera() {
        if (this.isScanning) {
            this.stopScanner();
            this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
            await this.startScanner();
        } else {
            this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
        }
    }

    async toggleTorch() {
        if (this.stream) {
            const track = this.stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            
            if (capabilities.torch) {
                const constraints = track.getConstraints();
                const currentTorch = constraints.torch || false;
                
                await track.applyConstraints({
                    ...constraints,
                    torch: !currentTorch
                });
                
                const btn = document.getElementById('toggle-torch');
                if (btn) {
                    const icon = btn.querySelector('.material-icons');
                    if (icon) {
                        icon.textContent = currentTorch ? 'flashlight_on' : 'flashlight_off';
                    }
                }
            }
        }
    }

    playSuccessSound() {
        if (!this.settings.sound) return;
        
        try {
            // Create a simple beep sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Could not play sound:', error);
        }
    }

    triggerVibration() {
        if (!this.settings.vibration || !navigator.vibrate) return;
        
        try {
            navigator.vibrate([100, 50, 100]);
        } catch (error) {
            console.log('Could not vibrate:', error);
        }
    }

    // Inventory Management
    addItem() {
        const form = document.getElementById('add-item-form');
        
        const item = {
            id: `item${Date.now()}`,
            name: document.getElementById('item-name').value.trim(),
            category: document.getElementById('item-category').value,
            location: document.getElementById('item-location').value.trim(),
            value: parseFloat(document.getElementById('item-value').value) || 0,
            purchaseDate: document.getElementById('item-purchase-date').value,
            warranty: document.getElementById('item-warranty').value,
            qrCode: document.getElementById('item-qr-code').value.trim() || `QR${Date.now()}`,
            description: document.getElementById('item-description').value.trim()
        };

        if (!item.name || !item.category || !item.location) {
            this.showNotification('Wypełnij wszystkie wymagane pola', 'error');
            return;
        }

        this.inventory.push(item);
        this.saveToStorage();
        
        form.reset();
        this.showNotification(`Dodano: ${item.name}`, 'success');
        
        // Switch to inventory tab
        setTimeout(() => {
            this.showTab('inventory');
            this.renderInventory();
            this.updateStats();
        }, 1000);
    }

    deleteItem(id) {
        if (confirm('Czy na pewno chcesz usunąć ten przedmiot?')) {
            const index = this.inventory.findIndex(item => item.id === id);
            if (index !== -1) {
                const item = this.inventory[index];
                this.inventory.splice(index, 1);
                this.saveToStorage();
                this.renderInventory();
                this.updateStats();
                this.showNotification(`Usunięto: ${item.name}`, 'success');
            }
        }
    }

    editItem(id) {
        const item = this.inventory.find(item => item.id === id);
        if (!item) return;

        // Ensure category dropdown is populated before opening modal
        this.ensureCategoryDropdowns();

        // Populate edit form
        document.getElementById('edit-item-id').value = item.id;
        document.getElementById('edit-item-name').value = item.name;
        document.getElementById('edit-item-category').value = item.category;
        document.getElementById('edit-item-location').value = item.location;
        document.getElementById('edit-item-value').value = item.value;
        document.getElementById('edit-item-purchase-date').value = item.purchaseDate;
        document.getElementById('edit-item-warranty').value = item.warranty;
        document.getElementById('edit-item-qr-code').value = item.qrCode;
        document.getElementById('edit-item-description').value = item.description;

        // Show modal
        document.getElementById('edit-modal').classList.remove('hidden');
    }

    saveEditItem() {
        const id = document.getElementById('edit-item-id').value;
        const item = this.inventory.find(item => item.id === id);
        
        if (!item) return;

        item.name = document.getElementById('edit-item-name').value.trim();
        item.category = document.getElementById('edit-item-category').value;
        item.location = document.getElementById('edit-item-location').value.trim();
        item.value = parseFloat(document.getElementById('edit-item-value').value) || 0;
        item.purchaseDate = document.getElementById('edit-item-purchase-date').value;
        item.warranty = document.getElementById('edit-item-warranty').value;
        item.qrCode = document.getElementById('edit-item-qr-code').value.trim();
        item.description = document.getElementById('edit-item-description').value.trim();

        if (!item.name || !item.category || !item.location) {
            this.showNotification('Wypełnij wszystkie wymagane pola', 'error');
            return;
        }

        this.saveToStorage();
        this.renderInventory();
        this.updateStats();
        this.closeEditModal();
        this.showNotification(`Zapisano zmiany: ${item.name}`, 'success');
    }

    highlightItem(id) {
        setTimeout(() => {
            const row = document.querySelector(`tr[data-id="${id}"]`);
            const card = document.querySelector(`.item-card[data-id="${id}"]`);
            
            const element = row || card;
            if (element) {
                element.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.2)';
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                setTimeout(() => {
                    element.style.backgroundColor = '';
                }, 3000);
            }
        }, 100);
    }

    // Rendering Functions
    renderInventory() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('category-filter')?.value || '';
        const locationFilter = document.getElementById('location-filter')?.value || '';

        let filteredInventory = this.inventory.filter(item => {
            const matchesSearch = !searchTerm || 
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.qrCode.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            const matchesLocation = !locationFilter || item.location === locationFilter;

            return matchesSearch && matchesCategory && matchesLocation;
        });

        // Apply sorting
        if (this.sortColumn) {
            filteredInventory.sort((a, b) => {
                let aVal = a[this.sortColumn];
                let bVal = b[this.sortColumn];

                // Handle numeric values
                if (this.sortColumn === 'value') {
                    aVal = parseFloat(aVal) || 0;
                    bVal = parseFloat(bVal) || 0;
                }
                
                // Handle dates
                if (this.sortColumn === 'purchaseDate' || this.sortColumn === 'warranty') {
                    aVal = new Date(aVal || '1900-01-01');
                    bVal = new Date(bVal || '1900-01-01');
                }

                if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        if (this.currentView === 'table') {
            this.renderTable(filteredInventory);
        } else {
            this.renderCards(filteredInventory);
        }
    }

    renderTable(items) {
        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Brak przedmiotów do wyświetlenia</td></tr>';
            return;
        }

        const grouped = this.groupItemsByCategory(items);
        
        tbody.innerHTML = '';
        
        Object.keys(grouped).forEach(category => {
            // Category header
            const categoryRow = document.createElement('tr');
            categoryRow.className = 'category-header';
            categoryRow.innerHTML = `
                <td colspan="6" style="background-color: var(--color-bg-2); font-weight: var(--font-weight-semibold); padding: var(--space-12) var(--space-16);">
                    ${category} (${grouped[category].length})
                </td>
            `;
            tbody.appendChild(categoryRow);

            // Items in category
            grouped[category].forEach(item => {
                const row = document.createElement('tr');
                row.dataset.id = item.id;
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.location}</td>
                    <td>${item.value ? item.value.toLocaleString('pl-PL') + ' zł' : '-'}</td>
                    <td>${item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('pl-PL') : '-'}</td>
                    <td>
                        <div class="item-actions">
                            <button class="btn btn--sm btn--secondary" onclick="app.editItem('${item.id}')">
                                <span class="material-icons">edit</span>
                            </button>
                            <button class="btn btn--sm status--error" onclick="app.deleteItem('${item.id}')">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        });
    }

    renderCards(items) {
        const container = document.getElementById('inventory-cards');
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = '<div class="text-center">Brak przedmiotów do wyświetlenia</div>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="item-card" data-id="${item.id}">
                <div class="item-card-header">
                    <h3 class="item-card-title">${item.name}</h3>
                    <div class="item-card-meta">
                        <span>${item.category}</span>
                        <span>${item.location}</span>
                    </div>
                </div>
                <div class="item-card-body">
                    ${item.value ? `
                        <div class="item-card-field">
                            <span class="label">Wartość:</span>
                            <span class="value">${item.value.toLocaleString('pl-PL')} zł</span>
                        </div>
                    ` : ''}
                    ${item.purchaseDate ? `
                        <div class="item-card-field">
                            <span class="label">Data zakupu:</span>
                            <span class="value">${new Date(item.purchaseDate).toLocaleDateString('pl-PL')}</span>
                        </div>
                    ` : ''}
                    ${item.warranty ? `
                        <div class="item-card-field">
                            <span class="label">Gwarancja do:</span>
                            <span class="value">${new Date(item.warranty).toLocaleDateString('pl-PL')}</span>
                        </div>
                    ` : ''}
                    ${item.qrCode ? `
                        <div class="item-card-field">
                            <span class="label">Kod QR:</span>
                            <span class="value">${item.qrCode}</span>
                        </div>
                    ` : ''}
                    ${item.description ? `
                        <div class="item-card-field">
                            <span class="label">Opis:</span>
                            <span class="value">${item.description}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="item-card-actions">
                    <button class="btn btn--sm btn--secondary" onclick="app.editItem('${item.id}')">
                        <span class="material-icons">edit</span>
                        Edytuj
                    </button>
                    <button class="btn btn--sm status--error" onclick="app.deleteItem('${item.id}')">
                        <span class="material-icons">delete</span>
                        Usuń
                    </button>
                </div>
            </div>
        `).join('');
    }

    groupItemsByCategory(items) {
        return items.reduce((groups, item) => {
            const category = item.category || 'Inne';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {});
    }

    toggleView(view) {
        this.currentView = view;
        
        // Update buttons
        document.getElementById('table-view').classList.toggle('active', view === 'table');
        document.getElementById('card-view').classList.toggle('active', view === 'card');
        
        // Update containers
        document.getElementById('inventory-table').classList.toggle('hidden', view !== 'table');
        document.getElementById('inventory-cards').classList.toggle('hidden', view !== 'card');
        
        this.renderInventory();
    }

    sortInventory(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        // Update sort indicators
        document.querySelectorAll('.sort-icon').forEach(icon => {
            icon.textContent = 'unfold_more';
            icon.parentElement.classList.remove('sorted');
        });

        const currentHeader = document.querySelector(`[data-sort="${column}"]`);
        if (currentHeader) {
            const icon = currentHeader.querySelector('.sort-icon');
            if (icon) {
                icon.textContent = this.sortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
                currentHeader.classList.add('sorted');
            }
        }

        this.renderInventory();
    }

    populateFilters() {
        const categories = [...new Set(this.inventory.map(item => item.category))].sort();
        const locations = [...new Set(this.inventory.map(item => item.location))].sort();

        const categoryFilter = document.getElementById('category-filter');
        const locationFilter = document.getElementById('location-filter');

        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">Wszystkie kategorie</option>' +
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }

        if (locationFilter) {
            locationFilter.innerHTML = '<option value="">Wszystkie lokalizacje</option>' +
                locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
        }
    }

    updateStats() {
        const totalItems = document.getElementById('total-items');
        const totalValue = document.getElementById('total-value');

        if (totalItems) {
            totalItems.textContent = this.inventory.length.toLocaleString('pl-PL');
        }

        if (totalValue) {
            const sum = this.inventory.reduce((total, item) => total + (item.value || 0), 0);
            totalValue.textContent = sum.toLocaleString('pl-PL') + ' zł';
        }
    }

    // Import/Export Functions
    exportData(format) {
        let data, filename, type;

        switch (format) {
            case 'csv':
                data = this.exportToCSV();
                filename = `inwentarz_${new Date().toISOString().split('T')[0]}.csv`;
                type = 'text/csv';
                break;
            case 'json':
                data = JSON.stringify(this.inventory, null, 2);
                filename = `inwentarz_${new Date().toISOString().split('T')[0]}.json`;
                type = 'application/json';
                break;
            case 'backup':
                data = JSON.stringify({
                    inventory: this.inventory,
                    settings: this.settings,
                    exportDate: new Date().toISOString()
                }, null, 2);
                filename = `inwentarz_backup_${new Date().toISOString().split('T')[0]}.json`;
                type = 'application/json';
                break;
        }

        this.downloadFile(data, filename, type);
        this.showNotification(`Eksportowano dane (${format.toUpperCase()})`, 'success');
    }

    exportToCSV() {
        if (this.inventory.length === 0) return '';

        const headers = Object.keys(this.inventory[0]);
        const csvRows = [headers.join(',')];

        this.inventory.forEach(item => {
            const values = headers.map(header => {
                const value = item[header] || '';
                // Escape commas and quotes
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    }

    downloadFile(data, filename, type) {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileName = document.getElementById('file-name');
        const importBtn = document.getElementById('import-data');

        if (fileName) fileName.textContent = file.name;
        if (importBtn) importBtn.disabled = false;

        this.selectedFile = file;
    }

    async processImport() {
        if (!this.selectedFile) return;

        try {
            const text = await this.selectedFile.text();
            let data;

            if (this.selectedFile.name.endsWith('.csv')) {
                data = this.parseCSV(text);
            } else if (this.selectedFile.name.endsWith('.json')) {
                const parsed = JSON.parse(text);
                data = Array.isArray(parsed) ? parsed : parsed.inventory || [];
            } else {
                throw new Error('Nieobsługiwany format pliku');
            }

            this.showImportPreview(data);

        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Błąd importu: ' + error.message, 'error');
        }
    }

    showImportPreview(data) {
        const preview = document.getElementById('import-preview');
        const content = preview?.querySelector('.preview-content');

        if (!preview || !content) return;

        content.innerHTML = `
            <p><strong>Znaleziono ${data.length} przedmiotów:</strong></p>
            <ul>
                ${data.slice(0, 5).map(item => `<li>${item.name} (${item.category})</li>`).join('')}
                ${data.length > 5 ? '<li>... i więcej</li>' : ''}
            </ul>
        `;

        preview.classList.remove('hidden');
        this.previewData = data;
    }

    confirmImport() {
        if (!this.previewData) return;

        // Add imported items with new IDs
        this.previewData.forEach(item => {
            item.id = `item${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.inventory.push(item);
        });

        this.saveToStorage();
        this.renderInventory();
        this.updateStats();
        this.populateFilters();
        
        this.showNotification(`Zaimportowano ${this.previewData.length} przedmiotów`, 'success');
        this.cancelImport();
    }

    cancelImport() {
        const preview = document.getElementById('import-preview');
        const fileInput = document.getElementById('import-file');
        const fileName = document.getElementById('file-name');
        const importBtn = document.getElementById('import-data');

        if (preview) preview.classList.add('hidden');
        if (fileInput) fileInput.value = '';
        if (fileName) fileName.textContent = '';
        if (importBtn) importBtn.disabled = true;

        this.previewData = null;
        this.selectedFile = null;
    }

    clearAllData() {
        if (confirm('Czy na pewno chcesz usunąć wszystkie dane? Ta operacja jest nieodwracalna.')) {
            this.inventory = [];
            this.saveToStorage();
            this.renderInventory();
            this.updateStats();
            this.populateFilters();
            this.showNotification('Wszystkie dane zostały usunięte', 'success');
        }
    }

    resetToSampleData() {
        if (confirm('Czy chcesz przywrócić przykładowe dane? Obecne dane zostaną zastąpione.')) {
            this.loadInventoryData();
            this.renderInventory();
            this.updateStats();
            this.populateFilters();
            this.showNotification('Przywrócono przykładowe dane', 'success');
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        const overlay = document.getElementById('notification-overlay');
        const notification = document.getElementById('notification');
        const icon = notification?.querySelector('.notification-icon');
        const messageEl = notification?.querySelector('.notification-message');

        if (!overlay || !notification || !icon || !messageEl) return;

        // Set icon based on type
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        icon.textContent = icons[type] || icons.info;
        messageEl.textContent = message;
        
        // Remove old classes and add new one
        notification.className = `notification ${type}`;
        
        // Show notification
        overlay.classList.remove('hidden');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.closeNotification();
        }, 3000);
    }

    closeNotification() {
        const overlay = document.getElementById('notification-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    // Modal Management
    closeEditModal() {
        const modal = document.getElementById('edit-modal');
        if (modal) modal.classList.add('hidden');
    }

    openSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            // Load current settings
            document.getElementById('setting-sound').checked = this.settings.sound;
            document.getElementById('setting-vibration').checked = this.settings.vibration;
            document.getElementById('setting-auto-focus').checked = this.settings.autoFocus;
            document.getElementById('theme-select').value = this.settings.theme;
            
            modal.classList.remove('hidden');
        }
    }

    closeSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) modal.classList.add('hidden');
    }

    saveSettings() {
        this.settings.sound = document.getElementById('setting-sound').checked;
        this.settings.vibration = document.getElementById('setting-vibration').checked;
        this.settings.autoFocus = document.getElementById('setting-auto-focus').checked;
        this.settings.theme = document.getElementById('theme-select').value;
        
        this.saveSettingsToStorage();
        this.applyTheme();
        this.closeSettings();
        this.showNotification('Ustawienia zapisane', 'success');
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('inventory_settings');
            if (stored) {
                this.settings = { ...this.settings, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        this.applyTheme();
    }

    saveSettingsToStorage() {
        try {
            localStorage.setItem('inventory_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    applyTheme() {
        document.body.setAttribute('data-color-scheme', this.settings.theme);
    }
}

// Global functions for onclick handlers
window.closeNotification = function() {
    if (window.app) {
        window.app.closeNotification();
    }
};

window.closeEditModal = function() {
    if (window.app) {
        window.app.closeEditModal();
    }
};

window.openSettings = function() {
    if (window.app) {
        window.app.openSettings();
    }
};

window.closeSettings = function() {
    if (window.app) {
        window.app.closeSettings();
    }
};

window.saveSettings = function() {
    if (window.app) {
        window.app.saveSettings();
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new InventoryApp();
});

// Handle back button and navigation
window.addEventListener('popstate', (event) => {
    if (window.app && event.state && event.state.tab) {
        window.app.showTab(event.state.tab);
    }
});