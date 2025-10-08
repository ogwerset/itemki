# Changelog

All notable changes to Inwentarz Domowy will be documented in this file.

## [2.0.0] - 2025-10-08

### Added

#### Box Management System
- **New "Pudełka" tab** for managing storage boxes
- Full CRUD operations (Create, Read, Update, Delete) for boxes
- Box properties: code, name, location, item count
- Auto-create boxes when adding/editing items with new box codes
- Safe box deletion with item reassignment to "Bez pudełka"
- Real-time item count tracking per box

#### Enhanced Scanning Workflow
- **Batch Scan Mode** for rapid item entry
  - Quick-add modal overlay on scanner view
  - "Remember last box" feature for consecutive scans
  - Real-time scan counter showing number of items scanned
  - Keyboard shortcuts (Enter to save, Esc to cancel)
  - Auto-focus on name field for fast data entry
  - Continuous scanning without tab switching
  - "Finish Batch" button to complete and review scanned items

- **Single Scan Mode** improvements
  - Enhanced item detection and navigation
  - Auto-highlight found items in inventory view
  - Pre-filled QR codes for new items

#### Data Structure Updates
- Migrated from hardcoded categories to dynamic box-based system
- JSON data format support matching `inwentarz.json` structure
- Separate storage for boxes array
- Auto-generation of categories from existing boxes
- Empty box handling ("Bez pudełka" category)

#### UI/UX Improvements
- Updated table columns: Nazwa | Pudełko | Lokalizacja | Kod (Serial) | Ostatnio widziane
- Card view redesigned for new data structure
- Dynamic category dropdowns populated from boxes
- Batch scan counter display
- Mode-specific UI elements (batch vs single mode)

### Changed
- **Data loading**: Now loads from local `inwentarz.json` instead of external URL
- **Categories**: Changed from static list to dynamic box codes (BOX05, TIDAL, etc.)
- **Export format**: JSON exports now match original `inwentarz.json` structure with items and boxes arrays
- **Item fields**: Replaced value/warranty/purchaseDate with lastSeen/boxChanged timestamps
- **Form labels**: "Kategoria" → "Pudełko", "Kod QR" → "Kod (Serial)"

### Fixed
- Empty box field handling in JSON parsing
- Console logging for debugging data load issues
- Category dropdown population timing
- LocalStorage integration for both inventory and boxes

### Technical
- Added batch scanning state management
- Implemented auto-box creation logic in `addItem()` and `saveEditItem()`
- Created `renderBoxes()` function for box management view
- Enhanced `handleScanResult()` with mode-based workflows
- Added `updateScanModeUI()` for dynamic UI updates
- Implemented `saveQuickAdd()` for batch scanning workflow

## [1.0.0] - Initial Release

### Features
- QR code and barcode scanning
- Item inventory management
- CSV/JSON import and export
- LocalStorage persistence
- Dark theme
- Category-based organization
