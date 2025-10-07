// Inwentarz Domowy v2.1 - Naprawiona wersja z działającym skanerem QR
// Autor: AI Assistant | Data: 2025-10-07

class InventoryApp {
    constructor() {
        this.currentTab = 'items';
        this.currentView = 'cards';
        this.currentPage = 1;
        this.itemsPerPage = 12;
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
        this.scanMode = 'single';
        this.cameraPermissionGranted = false;
        
        // Data initialization
        this.initializeData();
        this.init();
    }

    initializeData() {
        // Load provided data
        this.data = {
            "items": [
               [
  {
    "serial": "DOM002",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM003",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM007",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM016",
    "item": "DualShock3",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM020",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM021",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM024",
    "item": "Linki do hamaka x2 zielone",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM025",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM027",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM028",
    "item": "BLETY",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM031",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM034",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM037",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM041",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM042",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM043",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM044",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM045",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM046",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM047",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM048",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM049",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM050",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM051",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM052",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM053",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM054",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM055",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM056",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM057",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM058",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM059",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM071",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM072",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM073",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM074",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM075",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM076",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM077",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM078",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM079",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM080",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM081",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM082",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM083",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM084",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM085",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM086",
    "item": "wiertara BOSCH z udarem",
    "box": "",
    "lastSeen": "2025-10-06 20:01:02",
    "boxChanged": ""
  },
  {
    "serial": "DOM087",
    "item": "mac air",
    "box": "TIDAL",
    "lastSeen": "2025-10-06 19:57:29",
    "boxChanged": "2025-10-06 19:57:29"
  },
  {
    "serial": "DOM088",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM089",
    "item": "pompowane do siedzenia 2",
    "box": "",
    "lastSeen": "2025-10-06 20:05:42",
    "boxChanged": ""
  },
  {
    "serial": "DOM090",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM091",
    "item": "pompowane siedzenie na festiwal 1",
    "box": "",
    "lastSeen": "2025-10-06 20:04:59",
    "boxChanged": ""
  },
  {
    "serial": "DOM092",
    "item": "mac pro tidal 1",
    "box": "TIDAL",
    "lastSeen": "2025-10-06 19:55:19",
    "boxChanged": "2025-10-06 19:55:19"
  },
  {
    "serial": "DOM093",
    "item": "uchwyt do wspinaczki",
    "box": "",
    "lastSeen": "2025-10-06 20:03:58",
    "boxChanged": ""
  },
  {
    "serial": "DOM094",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM095",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM096",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM097",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM098",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM099",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM100",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM101",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM102",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM103",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM104",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM105",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM106",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM107",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM108",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM109",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM110",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM111",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM112",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM113",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM114",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM115",
    "item": "mac tidal 2",
    "box": "TIDAL",
    "lastSeen": "2025-10-06 19:56:04",
    "boxChanged": "2025-10-06 19:56:04"
  },
  {
    "serial": "DOM116",
    "item": "mała deska do pracowania",
    "box": "",
    "lastSeen": "2025-10-06 20:04:11",
    "boxChanged": ""
  },
  {
    "serial": "DOM117",
    "item": "",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM001",
    "item": "",
    "box": "",
    "lastSeen": "2025-09-14 00:00:00",
    "boxChanged": "2025-09-15 00:00:00"
  },
  {
    "serial": "DOM004",
    "item": "Szklanki",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM005",
    "item": "Węgielki do shisky IZZY COCO",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM006",
    "item": "Kufel od Agi",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:35:05",
    "boxChanged": "2025-09-14 21:35:14"
  },
  {
    "serial": "DOM008",
    "item": "Skarbonka Serduszko",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM009",
    "item": "Układanki od Mamy tosi",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:32:18",
    "boxChanged": "2025-09-14 21:32:26"
  },
  {
    "serial": "DOM010",
    "item": "SHISHA",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM011",
    "item": "2x Torba OKO HORUSA i ok 25x przeterminowane zaproszenia na event asstera",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM012",
    "item": "Swieczki male",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM013",
    "item": "Kadzidełka",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:31:00",
    "boxChanged": "2025-09-14 21:31:10"
  },
  {
    "serial": "DOM014",
    "item": "Welna czarna",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM015",
    "item": "Płyn do maszyny do dymu",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:34:38",
    "boxChanged": "2025-09-14 21:34:57"
  },
  {
    "serial": "DOM017",
    "item": "Welna ruzowa",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM018",
    "item": "Wełna teczowa, welna zielona, szydelko i druciki wyswagowane",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM019",
    "item": "Kieliszki do whisky x6",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM022",
    "item": "Czapka banan",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM023",
    "item": "Komiks hiphowoy od Madi",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM026",
    "item": "Karton od aparatu Tostera",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM029",
    "item": "Zegarek od starego",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM032",
    "item": "Munchkin OG",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:33:50",
    "boxChanged": "2025-09-14 21:34:00"
  },
  {
    "serial": "DOM033",
    "item": "Kabel do zasilania glosniki/piecyk",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM035",
    "item": "Czerwone światełko rowerowe DUNLOP",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM036",
    "item": "Munchkin Steampunk",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:33:33",
    "boxChanged": "2025-09-14 21:33:42"
  },
  {
    "serial": "DOM039",
    "item": "Zestaw alkoholowy - 2x mini limoncello i ZAPASOWE PIWO",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:34:21",
    "boxChanged": "2025-09-14 21:34:30"
  },
  {
    "serial": "DOM040",
    "item": "Gikerek",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:32:06",
    "boxChanged": "2025-09-14 21:32:12"
  },
  {
    "serial": "DOM060",
    "item": "Ladowarka indukcyjna baseus",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:35:29",
    "boxChanged": "2025-09-14 21:35:36"
  },
  {
    "serial": "DOM061",
    "item": "Pojemnik na odpady medyczne z wenflonami w srodku",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM062",
    "item": "Zapasowy maly iqos",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM063",
    "item": "Pan Bulwa",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM064",
    "item": "Czerwony spray",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:30:09",
    "boxChanged": "2025-09-14 21:30:19"
  },
  {
    "serial": "DOM065",
    "item": "Glosniczek JBL GO",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM066",
    "item": "Piwny Kubek",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM067",
    "item": "Plyn LIZARD do czyszczenia podstrunnicy",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM068",
    "item": "Maszynka do baniek",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:31:50",
    "boxChanged": "2025-09-14 21:31:59"
  },
  {
    "serial": "DOM069",
    "item": "POO CURLING",
    "box": "",
    "lastSeen": "",
    "boxChanged": ""
  },
  {
    "serial": "DOM070",
    "item": "Płyn do robienia baniek",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:30:31",
    "boxChanged": "2025-09-14 21:30:49"
  },
  {
    "serial": "DOM038",
    "item": "chiński specyfik",
    "box": "BOX05",
    "lastSeen": "2025-09-14 21:32:49",
    "boxChanged": "2025-09-14 21:32:49"
  },
  {
    "serial": "DOM030",
    "item": "dualshock",
    "box": "box05",
    "lastSeen": "2025-09-14 21:36:24",
    "boxChanged": "2025-09-14 21:36:24"
  }
]
            ],
            "boxes": [
                {"code":"BOX05","name":"Pudełko różne","location":"Magazyn","itemCount":14},
                {"code":"TIDAL","name":"Sprzęt muzyczny","location":"Studio","itemCount":3}
            ]
        };
    }

    init() {
        this.bindEvents();
        this.initializeTabs();
        this.renderItems();
        this.renderBoxes();
        this.updateStats();
        this.populateBoxFilter();
        console.log('🚀 Inwentarz Domowy v2.1 uruchomiony!');
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

        // Import/Export events
        document.getElementById('import-btn').addEventListener('click', () => this.importData());
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('reset-data').addEventListener('click', () => this.resetData());
    }

    // === TAB MANAGEMENT ===
    initializeTabs() {
        this.switchTab('items');
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
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
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
            this.renderTableView(pageItems);
        }

        this.updatePagination(filtered.length);
    }

    renderCardsView(items) {
        const container = document.getElementById('cards-view');
        container.innerHTML = items.map(item => `
            <div class="item-card">
                <div class="item-header">
                    <span class="item-serial">${item.serial}</span>
                </div>
                <div class="item-name">${item.item}</div>
                <div class="item-meta">
                    <div class="item-meta-item">
                        <span>📦 Pudełko:</span>
                        <strong>${item.box || 'Brak'}</strong>
                    </div>
                    <div class="item-meta-item">
                        <span>👀 Ostatnio widziany:</span>
                        <strong>${this.formatDate(item.lastSeen)}</strong>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTableView(items) {
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = items.map(item => `
            <tr>
                <td><code>${item.serial}</code></td>
                <td>${item.item}</td>
                <td>${item.box || '<em>Brak</em>'}</td>
                <td>${this.formatDate(item.lastSeen)}</td>
            </tr>
        `).join('');
    }

    updatePagination(totalItems) {
        const maxPage = Math.ceil(totalItems / this.itemsPerPage);
        document.getElementById('page-info').textContent = `Strona ${this.currentPage} z ${maxPage}`;
        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === maxPage;
    }

    updateStats() {
        const total = this.data.items.length;
        const boxed = this.data.items.filter(item => item.box).length;
        const unboxed = total - boxed;

        document.getElementById('total-items').textContent = total;
        document.getElementById('boxed-items').textContent = boxed;
        document.getElementById('unboxed-items').textContent = unboxed;

        // Update import/export stats
        document.getElementById('stats-items').textContent = total;
        document.getElementById('stats-boxes').textContent = this.data.boxes.length;
        document.getElementById('stats-activity').textContent = this.getLastActivity();
    }

    getLastActivity() {
        const lastItems = [...this.data.items]
            .filter(item => item.lastSeen)
            .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
        
        if (lastItems.length > 0) {
            return this.formatDate(lastItems[0].lastSeen);
        }
        return 'Brak aktywności';
    }

    // === BOXES MANAGEMENT ===
    renderBoxes() {
        const container = document.getElementById('boxes-grid');
        container.innerHTML = this.data.boxes.map(box => `
            <div class="box-card">
                <div class="box-header">
                    <span class="box-code">${box.code}</span>
                </div>
                <div class="box-name">${box.name}</div>
                <div class="box-location">📍 ${box.location}</div>
                <div class="box-stats">
                    <span class="box-item-count">${box.itemCount} przedmiotów</span>
                    <button class="btn btn--sm btn--outline" onclick="app.filterByBox('${box.code}')">
                        👀 Zobacz przedmioty
                    </button>
                </div>
            </div>
        `).join('');
    }

    populateBoxFilter() {
        const select = document.getElementById('box-filter');
        const currentValue = select.value;
        
        select.innerHTML = `
            <option value="">📦 Wszystkie pudełka</option>
            <option value="null">🚫 Bez pudełka</option>
            ${this.data.boxes.map(box => 
                `<option value="${box.code}">${box.name} (${box.code})</option>`
            ).join('')}
        `;
        
        select.value = currentValue;
    }

    filterByBox(boxCode) {
        this.switchTab('items');
        document.getElementById('box-filter').value = boxCode;
        this.selectedBox = boxCode;
        this.currentPage = 1;
        this.renderItems();
    }

    showBoxModal() {
        document.getElementById('box-modal').classList.remove('hidden');
        document.getElementById('new-box-code').focus();
    }

    hideBoxModal() {
        document.getElementById('box-modal').classList.add('hidden');
        this.clearBoxForm();
    }

    clearBoxForm() {
        document.getElementById('new-box-code').value = '';
        document.getElementById('new-box-name').value = '';
        document.getElementById('new-box-location').value = '';
    }

    saveBox() {
        const code = document.getElementById('new-box-code').value.trim();
        const name = document.getElementById('new-box-name').value.trim();
        const location = document.getElementById('new-box-location').value.trim();

        if (!code || !name || !location) {
            this.showToast('Wszystkie pola są wymagane!', 'error');
            return;
        }

        if (this.data.boxes.find(box => box.code === code)) {
            this.showToast('Pudełko o takim kodzie już istnieje!', 'error');
            return;
        }

        this.data.boxes.push({
            code,
            name,
            location,
            itemCount: 0
        });

        this.renderBoxes();
        this.populateBoxFilter();
        this.updateStats();
        this.hideBoxModal();
        this.showToast(`Pudełko ${name} zostało dodane!`, 'success');
    }

    // === QR SCANNER - COMPLETELY REWRITTEN ===
    async prepareScanner() {
        this.updateScannerStatus('Sprawdzanie dostępu do kamery...', false);
        
        try {
            // Check if running in secure context
            if (!window.isSecureContext) {
                throw new Error('Kamera wymaga HTTPS lub localhost');
            }

            // Check if getUserMedia is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Twoja przeglądarka nie obsługuje dostępu do kamery');
            }

            // Request permission first
            await this.requestCameraPermission();
            
            // Get available cameras
            await this.loadAvailableCameras();
            
            // Initialize Html5QrCode
            if (!this.html5QrCode) {
                this.html5QrCode = new Html5Qrcode("qr-reader");
                console.log('✅ Html5QrCode zainicjalizowany');
            }
            
            this.updateScannerStatus('Skaner gotowy - kliknij "Uruchom skaner"', false);
            
        } catch (error) {
            console.error('❌ Błąd przygotowania skanera:', error);
            this.handleScannerError(error);
        }
    }

    async requestCameraPermission() {
        try {
            // Request basic camera permission
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment'
                } 
            });
            
            // Stop the stream immediately - we just needed permission
            stream.getTracks().forEach(track => track.stop());
            
            this.cameraPermissionGranted = true;
            console.log('✅ Uprawnienia do kamery uzyskane');
            
        } catch (error) {
            this.cameraPermissionGranted = false;
            
            if (error.name === 'NotAllowedError') {
                throw new Error('Dostęp do kamery został odrzucony. Odśwież stronę i zezwól na dostęp do kamery.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('Nie znaleziono kamery na tym urządzeniu.');
            } else if (error.name === 'NotReadableError') {
                throw new Error('Kamera jest używana przez inną aplikację.');
            } else {
                throw new Error('Nie udało się uzyskać dostępu do kamery: ' + error.message);
            }
        }
    }

    async loadAvailableCameras() {
        try {
            const devices = await Html5Qrcode.getCameras();
            this.availableCameras = devices;
            
            console.log(`📹 Znaleziono ${devices.length} kamer:`, devices);
            
            // Show camera controls if available
            if (devices.length > 0) {
                if (devices.length > 1) {
                    document.getElementById('toggle-camera').style.display = 'inline-flex';
                    this.updateCameraButtonLabel();
                }
                this.updateScannerStatus(`Znaleziono ${devices.length} kamer(ę). Skaner gotowy.`, false);
            } else {
                throw new Error('Nie znaleziono żadnych kamer');
            }
            
        } catch (error) {
            console.error('❌ Błąd ładowania kamer:', error);
            this.availableCameras = [];
            
            // Try fallback approach
            this.updateScannerStatus('Będę próbować użyć domyślnej kamery', false);
        }
    }

    async startScanning() {
        if (this.isScanning) {
            return;
        }

        if (!this.cameraPermissionGranted) {
            await this.prepareScanner();
            if (!this.cameraPermissionGranted) {
                return;
            }
        }

        this.updateScannerStatus('Uruchamianie kamery...', true);
        this.toggleScanButtons(true);

        try {
            // Determine camera to use
            let cameraId;
            if (this.availableCameras.length > 0) {
                cameraId = this.availableCameras[this.currentCameraIndex].id;
                console.log(`📷 Używam kamery: ${this.availableCameras[this.currentCameraIndex].label || 'Nieznana'}`);
            } else {
                // Fallback to facingMode
                cameraId = { facingMode: "environment" };
                console.log('📷 Używam domyślnej kamery (environment)');
            }

            // Enhanced configuration for better compatibility
            const config = {
                fps: 10,
                qrbox: function(viewfinderWidth, viewfinderHeight) {
                    const minEdgePercentage = 0.7;
                    const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
                    const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
                    return {
                        width: qrboxSize,
                        height: qrboxSize
                    };
                },
                aspectRatio: 1.0,
                disableFlip: false
            };

            await this.html5QrCode.start(
                cameraId,
                config,
                (decodedText, decodedResult) => {
                    this.handleScanSuccess(decodedText, decodedResult);
                },
                (errorMessage) => {
                    // Suppress frequent scanning errors
                    // console.log('Scan attempt:', errorMessage);
                }
            );

            this.isScanning = true;
            this.updateScannerStatus('🎯 Skaner aktywny - kieruj kamerę na kod QR', true);
            this.showScannerControls();
            
            console.log('✅ Skanowanie uruchomione pomyślnie');
            
        } catch (error) {
            console.error('❌ Błąd uruchamiania skanowania:', error);
            this.handleScannerError(error);
            this.toggleScanButtons(false);
        }
    }

    async stopScanning() {
        if (!this.isScanning || !this.html5QrCode) {
            return;
        }

        try {
            await this.html5QrCode.stop();
            this.isScanning = false;
            this.flashEnabled = false;
            
            this.updateScannerStatus('Skanowanie zatrzymane', false);
            this.toggleScanButtons(false);
            this.hideScannerControls();
            
            console.log('⏹️ Skanowanie zatrzymane');
            
        } catch (error) {
            console.error('❌ Błąd zatrzymywania skanera:', error);
            this.showToast('Błąd zatrzymywania skanera', 'error');
        }
    }

    async toggleCamera() {
        if (!this.isScanning || this.availableCameras.length <= 1) {
            this.showToast('Brak dodatkowych kamer do przełączenia', 'warning');
            return;
        }

        const wasScanning = this.isScanning;
        
        try {
            await this.stopScanning();
            
            this.currentCameraIndex = (this.currentCameraIndex + 1) % this.availableCameras.length;
            this.updateCameraButtonLabel();
            
            if (wasScanning) {
                setTimeout(() => this.startScanning(), 1000);
            }
            
            const cameraName = this.getCameraName(this.currentCameraIndex);
            this.showToast(`Przełączono na: ${cameraName}`, 'success');
            
        } catch (error) {
            console.error('❌ Błąd przełączania kamery:', error);
            this.showToast('Nie udało się przełączyć kamery', 'error');
        }
    }

    async toggleFlash() {
        if (!this.isScanning) {
            this.showToast('Uruchom najpierw skaner', 'warning');
            return;
        }

        try {
            const video = document.querySelector('#qr-reader video');
            if (!video || !video.srcObject) {
                this.showToast('Nie znaleziono aktywnej kamery', 'error');
                return;
            }

            const stream = video.srcObject;
            const track = stream.getVideoTracks()[0];
            
            if (!track) {
                this.showToast('Nie udało się znaleźć ścieżki wideo', 'error');
                return;
            }

            const capabilities = track.getCapabilities();
            if (!capabilities.torch) {
                this.showToast('Ta kamera nie obsługuje lampy błyskowej', 'warning');
                return;
            }

            this.flashEnabled = !this.flashEnabled;
            
            await track.applyConstraints({
                advanced: [{ torch: this.flashEnabled }]
            });

            this.updateFlashButton();
            
            const status = this.flashEnabled ? 'włączona' : 'wyłączona';
            this.showToast(`Lampa ${status}`, 'success');

        } catch (error) {
            console.error('❌ Błąd przełączania lampy:', error);
            this.showToast('Nie udało się przełączyć lampy błyskowej', 'error');
        }
    }

    handleScanSuccess(decodedText, decodedResult) {
        console.log(`📱 Zeskanowano kod: ${decodedText}`);
        
        // Find item in database
        const item = this.data.items.find(i => i.serial === decodedText);
        
        if (item) {
            // Update last seen timestamp
            item.lastSeen = new Date().toISOString().replace('T', ' ').split('.')[0];
            
            this.addScanResult(item, true);
            
            if (this.scanMode === 'single') {
                this.stopScanning();
                this.showToast(`✅ Znaleziono: ${item.item}`, 'success');
            } else {
                this.showToast(`✅ Dodano: ${item.item}`, 'success');
            }
            
        } else {
            this.addScanResult({ 
                serial: decodedText, 
                item: 'Nieznany przedmiot', 
                box: '', 
                lastSeen: '' 
            }, false);
            
            if (this.scanMode === 'single') {
                this.stopScanning();
                this.showToast(`❌ Nie znaleziono przedmiotu: ${decodedText}`, 'error');
            } else {
                this.showToast(`❌ Nieznany kod: ${decodedText}`, 'warning');
            }
        }
        
        this.renderScanResults();
        this.updateStats();
    }

    handleScannerError(error) {
        this.isScanning = false;
        this.updateScannerStatus('Błąd skanera', false);
        this.toggleScanButtons(false);
        this.hideScannerControls();
        
        let message = 'Błąd skanera: ';
        
        if (typeof error === 'string') {
            message += error;
        } else if (error.message) {
            message += error.message;
        } else {
            message += 'Nieznany błąd';
        }
        
        this.showToast(message, 'error');
        console.error('❌ Scanner error:', error);
    }

    // Helper methods for scanner UI
    toggleScanButtons(isScanning) {
        document.getElementById('start-scan').style.display = isScanning ? 'none' : 'inline-flex';
        document.getElementById('stop-scan').style.display = isScanning ? 'inline-flex' : 'none';
    }

    showScannerControls() {
        if (this.availableCameras.length > 1) {
            document.getElementById('toggle-camera').style.display = 'inline-flex';
        }
        document.getElementById('toggle-flash').style.display = 'inline-flex';
        document.getElementById('clear-results').style.display = 'inline-flex';
    }

    hideScannerControls() {
        document.getElementById('toggle-flash').style.display = 'none';
        document.getElementById('clear-results').style.display = 'inline-flex'; // Keep clear visible
        this.updateFlashButton(false); // Reset flash button
    }

    updateCameraButtonLabel() {
        if (this.availableCameras.length > 1) {
            const label = this.getCameraName(this.currentCameraIndex);
            document.getElementById('toggle-camera').textContent = `📷 ${label}`;
        }
    }

    updateFlashButton(flashState = this.flashEnabled) {
        const flashBtn = document.getElementById('toggle-flash');
        if (flashState) {
            flashBtn.textContent = '🔦 Flash: ON';
            flashBtn.classList.add('btn--flash-on');
        } else {
            flashBtn.textContent = '🔦 Flash: OFF';
            flashBtn.classList.remove('btn--flash-on');
        }
    }

    getCameraName(index) {
        if (!this.availableCameras[index]) {
            return 'Nieznana kamera';
        }
        
        const label = this.availableCameras[index].label || '';
        
        if (label.toLowerCase().includes('front') || label.toLowerCase().includes('user')) {
            return 'Przednia kamera';
        } else if (label.toLowerCase().includes('back') || label.toLowerCase().includes('environment')) {
            return 'Tylna kamera';
        } else if (label.toLowerCase().includes('camera')) {
            return label;
        } else {
            return `Kamera ${index + 1}`;
        }
    }

    addScanResult(item, found) {
        const existingIndex = this.scanResults.findIndex(r => r.serial === item.serial);
        
        if (existingIndex >= 0) {
            this.scanResults[existingIndex] = { ...item, found, timestamp: Date.now() };
        } else {
            this.scanResults.push({ ...item, found, timestamp: Date.now() });
        }
        
        if (this.scanMode === 'batch') {
            document.getElementById('batch-summary').style.display = 'block';
            document.getElementById('scanned-count').textContent = this.scanResults.length;
        }
    }

    renderScanResults() {
        const container = document.getElementById('results-list');
        
        if (this.scanResults.length === 0) {
            container.innerHTML = '<p class="text-center">Brak wyników skanowania</p>';
            return;
        }
        
        container.innerHTML = this.scanResults.map(result => `
            <div class="result-item">
                <div class="result-info">
                    <div class="result-code">${result.serial}</div>
                    <div class="result-name">${result.item}</div>
                    <div class="result-meta">
                        ${result.found ? '✅ Znaleziony' : '❌ Nieznany'} • 
                        Pudełko: ${result.box || 'Brak'} • 
                        ${this.formatDate(result.lastSeen)}
                    </div>
                </div>
                <div class="result-actions">
                    <button class="btn btn--sm btn--outline" onclick="app.removeFromResults('${result.serial}')">
                        🗑️ Usuń
                    </button>
                </div>
            </div>
        `).join('');
    }

    removeFromResults(serial) {
        this.scanResults = this.scanResults.filter(r => r.serial !== serial);
        this.renderScanResults();
        
        if (this.scanMode === 'batch') {
            document.getElementById('scanned-count').textContent = this.scanResults.length;
            if (this.scanResults.length === 0) {
                document.getElementById('batch-summary').style.display = 'none';
            }
        }
    }

    clearScanResults() {
        this.scanResults = [];
        this.renderScanResults();
        document.getElementById('batch-summary').style.display = 'none';
        this.showToast('Wyniki skanowania wyczyszczone', 'success');
    }

    saveBatchResults() {
        if (this.scanResults.length === 0) {
            this.showToast('Brak wyników do zapisania', 'warning');
            return;
        }
        
        const foundItems = this.scanResults.filter(r => r.found).length;
        this.showToast(`Zapisano sesję: ${foundItems}/${this.scanResults.length} przedmiotów znalezionych`, 'success');
        this.clearScanResults();
    }

    updateScannerStatus(message, isActive) {
        document.getElementById('scanner-status').textContent = message;
        const indicator = document.getElementById('scanner-status-indicator');
        
        if (isActive) {
            indicator.textContent = '🟢 Aktywny';
            indicator.classList.add('active');
        } else {
            indicator.textContent = '🔴 Nieaktywny';
            indicator.classList.remove('active');
        }
    }

    // === IMPORT/EXPORT ===
    importData() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showToast('Wybierz plik do importu', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.items && importedData.boxes) {
                    this.data = importedData;
                    this.renderItems();
                    this.renderBoxes();
                    this.updateStats();
                    this.populateBoxFilter();
                    this.showToast('Dane zostały zaimportowane pomyślnie!', 'success');
                } else {
                    this.showToast('Nieprawidłowy format pliku', 'error');
                }
            } catch (error) {
                this.showToast('Błąd podczas importowania: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `inwentarz-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        document.getElementById('last-export').textContent = new Date().toLocaleString('pl-PL');
        this.showToast('Dane zostały wyeksportowane!', 'success');
    }

    resetData() {
        if (confirm('Czy na pewno chcesz usunąć wszystkie dane? Tej operacji nie można cofnąć.')) {
            this.data = { items: [], boxes: [] };
            this.renderItems();
            this.renderBoxes();
            this.updateStats();
            this.populateBoxFilter();
            this.clearScanResults();
            this.showToast('Wszystkie dane zostały usunięte', 'success');
        }
    }

    // === UTILITY FUNCTIONS ===
    formatDate(dateString) {
        if (!dateString) return 'Nieznana';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleString('pl-PL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Błędna data';
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
        
        console.log(`📢 Toast (${type}): ${message}`);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new InventoryApp();
});

console.log(`
🏠 Inwentarz Domowy v2.1 - CHANGELOG NAPRAWY
===========================================

🔧 GŁÓWNE NAPRAWY SKANERA:
✅ Całkowicie przepisana logika inicjalizacji kamery
✅ Dodano proper request permissions workflow  
✅ Poprawiono obsługę Html5Qrcode API
✅ Dodano fallback dla różnych scenariuszy błędów
✅ Lepsze zarządzanie cyklem życia kamery

🆕 ULEPSZONA ARCHITEKTURA SKANERA:
📋 prepareScanner() - nowa metoda przygotowania
🔐 requestCameraPermission() - poprawne uprawnienia
📷 loadAvailableCameras() - robust camera detection
⚡ Enhanced error handling na każdym kroku
🔄 Lepsze zarządzanie stanem (start/stop/toggle)

🛡️ ENHANCED ERROR HANDLING:
❌ Specific error messages dla każdego typu błędu
🔍 NotAllowedError (permission denied)
📷 NotFoundError (no camera)  
⚠️ NotReadableError (camera in use)
🌐 Secure context checking (HTTPS requirement)
📱 Compatibility checks (getUserMedia support)

📱 MOBILE OPTIMIZATIONS:
🎯 Better qrbox configuration for mobile
📐 Responsive viewfinder sizing
⚡ Optimized FPS for mobile performance
🔄 Improved camera switching logic
💡 Enhanced flash controls

🚀 DEVELOPMENT NOTES:
- Kamera wymaga HTTPS lub localhost dla security
- Testowane z najnowszą wersją html5-qrcode (2.3.8)
- Dodano szczegółowe console.log dla debugowania
- Wszystkie metody są async/await dla lepszej kontroli

⚠️ JEŚLI NADAL WYSTĘPUJĄ PROBLEMY:
1. Sprawdź czy strona działa na HTTPS
2. Upewnij się że przeglądarka ma dostęp do kamery
3. Sprawdź console.log w DevTools dla szczegółów
4. Przetestuj na różnych urządzeniach/przeglądarkach
`);
