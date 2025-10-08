// Inventory App v2.0 - Main Application Logic

class InventoryApp {
    constructor() {
        this.inventory = [];
        this.boxes = []; // Store boxes separately
        this.currentTab = 'scanner';
        this.currentView = 'table';
        this.isScanning = false;
        this.scanMode = 'single';
        this.currentCamera = 'environment'; // back camera
        this.stream = null;
        this.animationFrame = null;

        // Batch scanning state
        this.batchScanCount = 0;
        this.lastScannedBox = '';
        this.rememberBox = true;

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

        // Categories list - will be populated from data
        this.categories = ['BOX05', 'TIDAL', 'Bez pudełka'];

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
            // Try to load from local JSON file first
            console.log('Attempting to load inwentarz.json...');
            const response = await fetch('./inwentarz.json');
            if (response.ok) {
                const jsonData = await response.json();
                console.log('JSON loaded successfully:', jsonData);
                this.boxes = jsonData.boxes || [];
                this.inventory = this.parseInventoryJSON(jsonData);
                console.log('Parsed inventory items:', this.inventory.length);
                this.updateCategoriesFromData();
                this.showNotification(`Załadowano ${this.inventory.length} przedmiotów z pliku inwentarz.json`, 'success');
            } else {
                throw new Error('Could not load local JSON file');
            }
        } catch (error) {
            console.log('Loading from JSON file failed, checking localStorage:', error);

            // Try to load from localStorage
            const storedInventory = localStorage.getItem('inventory_data');
            const storedBoxes = localStorage.getItem('boxes_data');

            if (storedInventory) {
                try {
                    const parsedData = JSON.parse(storedInventory);
                    if (Array.isArray(parsedData) && parsedData.length > 0) {
                        this.inventory = parsedData;
                        this.boxes = storedBoxes ? JSON.parse(storedBoxes) : [];
                        this.updateCategoriesFromData();
                        this.showNotification('Dane załadowane z pamięci lokalnej', 'success');
                    }
                } catch (e) {
                    console.error('Error parsing stored data:', e);
                    this.inventory = [];
                    this.boxes = [];
                }
            } else {
                this.inventory = [];
                this.boxes = [];
            }
        }

        this.saveToStorage();
    }

    parseInventoryJSON(jsonData) {
        // Parse the JSON structure with items and boxes
        const items = jsonData.items || [];
        const boxes = jsonData.boxes || [];

        // Create a map of box codes to box details
        const boxMap = {};
        boxes.forEach(box => {
            boxMap[box.code] = box;
        });

        console.log('Box map:', boxMap);

        // Transform items to app format
        return items.map(item => {
            const boxCode = item.box && item.box.trim() !== '' ? item.box : 'Bez pudełka';
            const box = boxMap[item.box] || null;

            console.log(`Item: ${item.item}, Box: ${item.box}, Mapped to: ${boxCode}`);

            return {
                id: item.serial,
                name: item.item,
                category: boxCode,
                location: box ? box.location : '',
                qrCode: item.serial,
                value: 0, // Not in source data
                purchaseDate: '',
                warranty: '',
                description: item.lastSeen || item.boxChanged ?
                    `Ostatnio widziane: ${item.lastSeen || 'nigdy'}\nPudełko zmienione: ${item.boxChanged || 'nigdy'}` : '',
                lastSeen: item.lastSeen || '',
                boxChanged: item.boxChanged || '',
                boxName: box ? box.name : (boxCode !== 'Bez pudełka' ? boxCode : '')
            };
        });
    }

    updateCategoriesFromData() {
        // Extract unique box names from inventory
        const uniqueBoxes = [...new Set(this.inventory.map(item => item.category))].filter(Boolean).sort();

        // Add 'Bez pudełka' if not present
        if (!uniqueBoxes.includes('Bez pudełka')) {
            uniqueBoxes.push('Bez pudełka');
        }

        this.categories = uniqueBoxes;
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
            localStorage.setItem('boxes_data', JSON.stringify(this.boxes));
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
        const finishBatchBtn = document.getElementById('finish-batch');
        const toggleCamera = document.getElementById('toggle-camera');
        const toggleTorch = document.getElementById('toggle-torch');
        const scanMode = document.getElementById('scan-mode');

        if (startBtn) startBtn.addEventListener('click', () => this.startScanner());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stopScanner());
        if (finishBatchBtn) finishBatchBtn.addEventListener('click', () => this.finishBatchScan());
        if (toggleCamera) toggleCamera.addEventListener('click', () => this.toggleCamera());
        if (toggleTorch) toggleTorch.addEventListener('click', () => this.toggleTorch());
        if (scanMode) scanMode.addEventListener('change', (e) => {
            this.scanMode = e.target.value;
            this.updateScanModeUI();
        });

        // Quick add form
        const quickAddForm = document.getElementById('quick-add-form');
        if (quickAddForm) {
            quickAddForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveQuickAdd();
            });
        }

        // Quick add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            const quickAddModal = document.getElementById('quick-add-modal');
            if (quickAddModal && !quickAddModal.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.cancelQuickAdd();
                }
            }
        });

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

        // Boxes
        const addBoxBtn = document.getElementById('add-box-btn');
        const boxForm = document.getElementById('box-form');

        if (addBoxBtn) addBoxBtn.addEventListener('click', () => this.openAddBoxModal());
        if (boxForm) boxForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBox();
        });

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
        } else if (tabName === 'boxes') {
            this.renderBoxes();
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

        if (this.scanMode === 'batch') {
            // Batch mode: Quick add workflow
            if (existingItem) {
                this.showNotification(`Przedmiot już istnieje: ${existingItem.name}`, 'warning');
                // Continue scanning
            } else {
                // Show quick add modal
                this.openQuickAddModal(data);
            }
        } else {
            // Single mode: Traditional workflow
            if (existingItem) {
                this.showNotification(`Znaleziono: ${existingItem.name}`, 'success');
                // Switch to inventory tab to show the item
                setTimeout(() => {
                    this.showTab('inventory');
                    this.highlightItem(existingItem.id);
                }, 1000);
                this.stopScanner();
            } else {
                this.showNotification(`Zeskanowano kod: ${data}`, 'success');
                // Pre-fill add form with QR code
                setTimeout(() => {
                    this.showTab('add');
                    const qrInput = document.getElementById('item-qr-code');
                    if (qrInput) qrInput.value = data;
                }, 1000);
                this.stopScanner();
            }
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

        const lastSeenInput = document.getElementById('item-last-seen').value;
        const lastSeen = lastSeenInput ? new Date(lastSeenInput).toISOString().replace('T', ' ').substring(0, 19) : '';

        const selectedBox = document.getElementById('item-category').value;
        const location = document.getElementById('item-location').value.trim();

        const item = {
            id: document.getElementById('item-qr-code').value.trim() || `DOM${Date.now()}`,
            name: document.getElementById('item-name').value.trim(),
            category: selectedBox,
            location: location,
            qrCode: document.getElementById('item-qr-code').value.trim() || `DOM${Date.now()}`,
            lastSeen: lastSeen,
            boxChanged: '',
            description: document.getElementById('item-description').value.trim(),
            value: 0,
            purchaseDate: '',
            warranty: ''
        };

        if (!item.name || !item.category || !item.qrCode) {
            this.showNotification('Wypełnij wszystkie wymagane pola', 'error');
            return;
        }

        // Auto-create box if it doesn't exist
        if (selectedBox && selectedBox !== 'Bez pudełka') {
            const boxExists = this.boxes.find(b => b.code === selectedBox);
            if (!boxExists) {
                const newBox = {
                    code: selectedBox,
                    name: `Pudełko ${selectedBox}`,
                    location: location || 'Nieznana lokalizacja',
                    itemCount: 0
                };
                this.boxes.push(newBox);
                this.showNotification(`Automatycznie utworzono pudełko: ${selectedBox}`, 'info');
            }
        }

        this.inventory.push(item);
        this.updateCategoriesFromData();
        this.ensureCategoryDropdowns();
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
        document.getElementById('edit-item-location').value = item.location || '';
        document.getElementById('edit-item-qr-code').value = item.qrCode;

        // Convert lastSeen and boxChanged to datetime-local format
        const lastSeenInput = document.getElementById('edit-item-last-seen');
        if (item.lastSeen) {
            lastSeenInput.value = item.lastSeen.replace(' ', 'T').substring(0, 16);
        } else {
            lastSeenInput.value = '';
        }

        const boxChangedInput = document.getElementById('edit-item-box-changed');
        if (item.boxChanged) {
            boxChangedInput.value = item.boxChanged.replace(' ', 'T').substring(0, 16);
        } else {
            boxChangedInput.value = '';
        }

        document.getElementById('edit-item-description').value = item.description || '';

        // Show modal
        document.getElementById('edit-modal').classList.remove('hidden');
    }

    saveEditItem() {
        const id = document.getElementById('edit-item-id').value;
        const item = this.inventory.find(item => item.id === id);

        if (!item) return;

        const lastSeenInput = document.getElementById('edit-item-last-seen').value;
        const boxChangedInput = document.getElementById('edit-item-box-changed').value;
        const selectedBox = document.getElementById('edit-item-category').value;
        const location = document.getElementById('edit-item-location').value.trim();

        // Auto-create box if it doesn't exist
        if (selectedBox && selectedBox !== 'Bez pudełka') {
            const boxExists = this.boxes.find(b => b.code === selectedBox);
            if (!boxExists) {
                const newBox = {
                    code: selectedBox,
                    name: `Pudełko ${selectedBox}`,
                    location: location || 'Nieznana lokalizacja',
                    itemCount: 0
                };
                this.boxes.push(newBox);
                this.showNotification(`Automatycznie utworzono pudełko: ${selectedBox}`, 'info');
            }
        }

        item.name = document.getElementById('edit-item-name').value.trim();
        item.category = selectedBox;
        item.location = location;
        item.qrCode = document.getElementById('edit-item-qr-code').value.trim();
        item.lastSeen = lastSeenInput ? new Date(lastSeenInput).toISOString().replace('T', ' ').substring(0, 19) : '';
        item.boxChanged = boxChangedInput ? new Date(boxChangedInput).toISOString().replace('T', ' ').substring(0, 19) : '';
        item.description = document.getElementById('edit-item-description').value.trim();

        if (!item.name || !item.category || !item.qrCode) {
            this.showNotification('Wypełnij wszystkie wymagane pola', 'error');
            return;
        }

        this.updateCategoriesFromData();
        this.ensureCategoryDropdowns();
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
                    <td>${item.location || '-'}</td>
                    <td>${item.qrCode || '-'}</td>
                    <td>${item.lastSeen || '-'}</td>
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
                        ${item.location ? `<span>${item.location}</span>` : ''}
                    </div>
                </div>
                <div class="item-card-body">
                    ${item.qrCode ? `
                        <div class="item-card-field">
                            <span class="label">Kod (Serial):</span>
                            <span class="value">${item.qrCode}</span>
                        </div>
                    ` : ''}
                    ${item.lastSeen ? `
                        <div class="item-card-field">
                            <span class="label">Ostatnio widziane:</span>
                            <span class="value">${item.lastSeen}</span>
                        </div>
                    ` : ''}
                    ${item.boxChanged ? `
                        <div class="item-card-field">
                            <span class="label">Pudełko zmienione:</span>
                            <span class="value">${item.boxChanged}</span>
                        </div>
                    ` : ''}
                    ${item.description ? `
                        <div class="item-card-field">
                            <span class="label">Notatki:</span>
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
        const categories = [...new Set(this.inventory.map(item => item.category))].filter(Boolean).sort();
        const locations = [...new Set(this.inventory.map(item => item.location))].filter(Boolean).sort();

        const categoryFilter = document.getElementById('category-filter');
        const locationFilter = document.getElementById('location-filter');

        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">Wszystkie pudełka</option>' +
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
                // Export in the same format as inwentarz.json
                data = JSON.stringify({
                    items: this.inventory.map(item => ({
                        serial: item.qrCode,
                        item: item.name,
                        box: item.category !== 'Bez pudełka' ? item.category : '',
                        lastSeen: item.lastSeen || '',
                        boxChanged: item.boxChanged || ''
                    })),
                    boxes: this.boxes
                }, null, 2);
                filename = `inwentarz_${new Date().toISOString().split('T')[0]}.json`;
                type = 'application/json';
                break;
            case 'backup':
                data = JSON.stringify({
                    inventory: this.inventory,
                    boxes: this.boxes,
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

    // Box Management Functions
    renderBoxes() {
        const tbody = document.getElementById('boxes-tbody');
        if (!tbody) return;

        if (this.boxes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Brak pudełek. Dodaj nowe pudełko.</td></tr>';
            return;
        }

        // Calculate item counts for each box
        const boxCounts = {};
        this.inventory.forEach(item => {
            const boxCode = item.category;
            boxCounts[boxCode] = (boxCounts[boxCode] || 0) + 1;
        });

        tbody.innerHTML = this.boxes.map(box => `
            <tr data-box-code="${box.code}">
                <td><strong>${box.code}</strong></td>
                <td>${box.name}</td>
                <td>${box.location}</td>
                <td>${boxCounts[box.code] || 0}</td>
                <td>
                    <div class="item-actions">
                        <button class="btn btn--sm btn--secondary" onclick="app.editBox('${box.code}')">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="btn btn--sm status--error" onclick="app.deleteBox('${box.code}')">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    openAddBoxModal() {
        document.getElementById('box-modal-title').textContent = 'Dodaj pudełko';
        document.getElementById('box-original-code').value = '';
        document.getElementById('box-code').value = '';
        document.getElementById('box-name').value = '';
        document.getElementById('box-location').value = '';
        document.getElementById('box-code').disabled = false;
        document.getElementById('box-modal').classList.remove('hidden');
    }

    editBox(code) {
        const box = this.boxes.find(b => b.code === code);
        if (!box) return;

        document.getElementById('box-modal-title').textContent = 'Edytuj pudełko';
        document.getElementById('box-original-code').value = box.code;
        document.getElementById('box-code').value = box.code;
        document.getElementById('box-name').value = box.name;
        document.getElementById('box-location').value = box.location;
        document.getElementById('box-code').disabled = true; // Don't allow changing code when editing
        document.getElementById('box-modal').classList.remove('hidden');
    }

    saveBox() {
        const originalCode = document.getElementById('box-original-code').value;
        const code = document.getElementById('box-code').value.trim();
        const name = document.getElementById('box-name').value.trim();
        const location = document.getElementById('box-location').value.trim();

        if (!code || !name || !location) {
            this.showNotification('Wypełnij wszystkie pola', 'error');
            return;
        }

        if (originalCode) {
            // Editing existing box
            const box = this.boxes.find(b => b.code === originalCode);
            if (box) {
                box.name = name;
                box.location = location;

                // Update all items that use this box
                this.inventory.forEach(item => {
                    if (item.category === originalCode) {
                        item.location = location;
                        item.boxName = name;
                    }
                });

                this.showNotification(`Zaktualizowano pudełko: ${code}`, 'success');
            }
        } else {
            // Adding new box
            if (this.boxes.find(b => b.code === code)) {
                this.showNotification('Pudełko o tym kodzie już istnieje', 'error');
                return;
            }

            this.boxes.push({
                code: code,
                name: name,
                location: location,
                itemCount: 0
            });

            this.showNotification(`Dodano pudełko: ${code}`, 'success');
        }

        this.updateCategoriesFromData();
        this.ensureCategoryDropdowns();
        this.saveToStorage();
        this.renderBoxes();
        this.closeBoxModal();
    }

    deleteBox(code) {
        const itemsInBox = this.inventory.filter(item => item.category === code).length;

        if (itemsInBox > 0) {
            const confirmed = confirm(`Pudełko ${code} zawiera ${itemsInBox} przedmiotów. Czy na pewno chcesz je usunąć? Przedmioty zostaną przeniesione do "Bez pudełka".`);
            if (!confirmed) return;

            // Move items to "Bez pudełka"
            this.inventory.forEach(item => {
                if (item.category === code) {
                    item.category = 'Bez pudełka';
                    item.location = '';
                    item.boxName = '';
                }
            });
        } else {
            if (!confirm(`Czy na pewno chcesz usunąć pudełko ${code}?`)) return;
        }

        const index = this.boxes.findIndex(b => b.code === code);
        if (index !== -1) {
            this.boxes.splice(index, 1);
            this.updateCategoriesFromData();
            this.ensureCategoryDropdowns();
            this.saveToStorage();
            this.renderBoxes();
            this.renderInventory();
            this.showNotification(`Usunięto pudełko: ${code}`, 'success');
        }
    }

    closeBoxModal() {
        document.getElementById('box-modal').classList.add('hidden');
    }

    // Quick Add and Batch Scanning Functions
    updateScanModeUI() {
        const batchCounter = document.getElementById('batch-scan-counter');
        const finishBatchBtn = document.getElementById('finish-batch');
        const stopBtn = document.getElementById('stop-scanner');

        if (this.scanMode === 'batch') {
            if (batchCounter) batchCounter.classList.remove('hidden');
            if (finishBatchBtn) finishBatchBtn.classList.remove('hidden');
            if (stopBtn) stopBtn.classList.add('hidden');
        } else {
            if (batchCounter) batchCounter.classList.add('hidden');
            if (finishBatchBtn) finishBatchBtn.classList.add('hidden');
            if (stopBtn) stopBtn.classList.remove('hidden');
            this.batchScanCount = 0;
            this.updateBatchCount();
        }
    }

    updateBatchCount() {
        const countElement = document.getElementById('batch-count');
        if (countElement) {
            countElement.textContent = this.batchScanCount;
        }
    }

    openQuickAddModal(qrCode) {
        // Populate categories in quick-add dropdown
        const quickAddBox = document.getElementById('quick-add-box');
        if (quickAddBox) {
            quickAddBox.innerHTML = '<option value="">Wybierz pudełko</option>' +
                this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

            // Pre-select last used box if remember is checked
            if (this.rememberBox && this.lastScannedBox) {
                quickAddBox.value = this.lastScannedBox;
            }
        }

        // Set QR code
        document.getElementById('quick-add-qr-code').value = qrCode;
        document.getElementById('quick-add-qr-display').textContent = qrCode;

        // Clear name field
        document.getElementById('quick-add-name').value = '';

        // Show modal and focus name field
        document.getElementById('quick-add-modal').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('quick-add-name').focus();
        }, 100);
    }

    saveQuickAdd() {
        const qrCode = document.getElementById('quick-add-qr-code').value;
        const name = document.getElementById('quick-add-name').value.trim();
        const selectedBox = document.getElementById('quick-add-box').value;
        const rememberBox = document.getElementById('remember-box').checked;

        if (!name || !selectedBox) {
            this.showNotification('Wypełnij wszystkie pola', 'error');
            return;
        }

        // Auto-create box if it doesn't exist
        let boxLocation = '';
        if (selectedBox && selectedBox !== 'Bez pudełka') {
            const boxExists = this.boxes.find(b => b.code === selectedBox);
            if (!boxExists) {
                const newBox = {
                    code: selectedBox,
                    name: `Pudełko ${selectedBox}`,
                    location: 'Nieznana lokalizacja',
                    itemCount: 0
                };
                this.boxes.push(newBox);
                boxLocation = newBox.location;
            } else {
                boxLocation = boxExists.location;
            }
        }

        // Create item
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const item = {
            id: qrCode,
            name: name,
            category: selectedBox,
            location: boxLocation,
            qrCode: qrCode,
            lastSeen: now,
            boxChanged: now,
            description: '',
            value: 0,
            purchaseDate: '',
            warranty: ''
        };

        this.inventory.push(item);
        this.batchScanCount++;
        this.updateBatchCount();

        // Remember box if checked
        this.rememberBox = rememberBox;
        if (rememberBox) {
            this.lastScannedBox = selectedBox;
        }

        this.updateCategoriesFromData();
        this.ensureCategoryDropdowns();
        this.saveToStorage();

        // Close modal and resume scanning
        document.getElementById('quick-add-modal').classList.add('hidden');
        this.showNotification(`Dodano: ${name}`, 'success');

        // Resume scanning after brief delay
        setTimeout(() => {
            if (this.scanMode === 'batch' && this.isScanning) {
                // Scanner is already running, just continue
            }
        }, 500);
    }

    cancelQuickAdd() {
        document.getElementById('quick-add-modal').classList.add('hidden');
        // Continue scanning
    }

    finishBatchScan() {
        this.stopScanner();
        this.showNotification(`Zakończono skanowanie. Dodano ${this.batchScanCount} przedmiotów.`, 'success');
        this.batchScanCount = 0;
        this.updateBatchCount();

        // Switch to inventory to show added items
        setTimeout(() => {
            this.showTab('inventory');
            this.renderInventory();
            this.updateStats();
        }, 1000);
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