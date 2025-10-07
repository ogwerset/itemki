// app.js v2.2 - Kompletna wersja z edycją, poprawionymi kartami oraz stabilnym skanerem

class InventoryApp {
    constructor() {
        this.data = null;
        this.currentTab = 'scanner';
        this.html5QrCode = null;
        this.isScanning = false;
        this.cameraId = null;
        this.qrContainer = document.getElementById('qr-scanner');
        this.currentView = 'cards';
        this.items = [];
        this.boxes = [];
        this.selectedItem = null;
        this.selectedBox = null;
        this.init();
        this.loadData();
    }

    init() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const t = e.target.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                document.getElementById(`${t}-tab`).classList.add('active');
                document.querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active'));
                btn.classList.add('active');
                this.currentTab = t;
                if (t === 'items') this.renderItems();
                if (t === 'boxes') this.renderBoxes();
            });
        });
        document.getElementById('start-scan').onclick = () => this.startScan();
        document.getElementById('stop-scan').onclick = () => this.stopScan();
        document.getElementById('toggle-camera').onclick = () => this.toggleCamera();
        document.getElementById('add-item').onclick = () => this.openItemModal();
        document.getElementById('add-box').onclick = () => this.openBoxModal();
        document.getElementById('close-item-modal').onclick = () => this.closeItemModal();
        document.getElementById('save-item').onclick = () => this.saveItemModal();
        document.getElementById('delete-item').onclick = () => this.deleteItemModal();
        document.getElementById('close-box-modal').onclick = () => this.closeBoxModal();
        document.getElementById('save-box').onclick = () => this.saveBoxModal();
        document.getElementById('delete-box').onclick = () => this.deleteBoxModal();
    }

    async loadData() {
        try {
            const resp = await fetch('data.json');
            const parsed = await resp.json();
            this.data = parsed;
            this.items = parsed.items || [];
            this.boxes = parsed.boxes || [];
            this.renderItems();
            this.renderBoxes();
        } catch (e) {
            this.showNotification('Błąd ładowania danych', 'error');
        }
    }

    // SKANER --------------------------------------------------
    async startScan() {
        if(this.isScanning) return;
        if(!window.Html5Qrcode) return this.showNotification('Brak biblioteki skanera', 'error');
        try{
            this.html5QrCode = new Html5Qrcode('qr-scanner');
            const cams = await Html5Qrcode.getCameras();
            this.cameraId = cams[0]?.id;
            await this.html5QrCode.start(
                this.cameraId,
                {fps: 10, qrbox: {width:270,height:270}},
                (text) => this.onScan(text),
                () => {}
            );
            this.isScanning = true;
            this.setStatus('Skanowanie aktywne');
        }catch(e){
            this.showNotification('Nie mogę uruchomić kamery', 'error');
        }
    }

    async stopScan() {
        try {
            if (this.html5QrCode && this.isScanning) {
                await this.html5QrCode.stop();
                this.isScanning = false;
                this.setStatus('Skaner zatrzymany');
            }
        } catch (error) {
            this.setStatus('Stop error');
        }
    }

    async toggleCamera() {
        if (!window.Html5Qrcode) return;
        try {
            const cams = await Html5Qrcode.getCameras();
            if (cams.length > 1) {
                this.cameraId = this.cameraId === cams[0].id ? cams[1].id : cams[0].id;
                if (this.isScanning) {
                    await this.stopScan();
                    setTimeout(()=>this.startScan(),200);
                }
            } else {
                this.showNotification('Brak drugiej kamery', 'info');
            }
        } catch (e) {
            this.showNotification('Błąd kamer', 'error');
        }
    }

    onScan(text) {
        this.playSuccessSound();
        navigator.vibrate?.([100, 50, 100]);
        this.showNotification('Kod zeskanowany: ' + text, 'success', 1800);
        this.setStatus('Ostatni kod: ' + text);
        // TODO: handle inventory logic
    }
    setStatus(msg){document.getElementById('scanner-status').innerText=msg;}
    playSuccessSound() {
        try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const osc=ctx.createOscillator();const g=ctx.createGain();osc.connect(g);g.connect(ctx.destination);osc.frequency.setValueAtTime(1000,ctx.currentTime);g.gain.value=0.19;osc.start();osc.stop(ctx.currentTime+.19);}catch(e){}
    }
    showNotification(msg,type='info',duration=3000){
        let root = document.getElementById('notification-root');
        root.innerHTML = `<div class='notification-overlay'><div class='notification notification--${type}'>${msg}<span class='notification-close'>&times;</span></div></div>`;
        root.querySelector('.notification-close').onclick = ()=> root.innerHTML = '';
        setTimeout(()=>{if(root.innerHTML)root.innerHTML='';},duration);
    }

    // PRZEDMIOTY ------------------------------------
    renderItems(){
        let cards = this.items.map(i=>`<div class='card item-card'><div class='card__body'><div class='item-serial'>${i.serial}</div><div class='item-name'>${i.item}</div><div class='item-meta'>${i.box?'<span class="status--success">'+i.box+'</span>':'<span class="status--warning">Brak pudełka</span>'}</div><div><button class='btn btn--sm btn--outline edit-item' data-serial='${i.serial}'>Edytuj</button></div></div></div>`).join('');
        document.getElementById('cards-view').innerHTML = cards || '<p style="color:#999;text-align:center;">Brak przedmiotów</p>';
        document.querySelectorAll('.edit-item').forEach(btn=>btn.onclick=()=>this.openItemModal(btn.dataset.serial));
        let rows = this.items.map(i=>`<tr><td>${i.serial}</td><td>${i.item}</td><td>${i.box}</td><td><button class='btn btn--sm btn--outline edit-item' data-serial='${i.serial}'>Edytuj</button></td></tr>`).join('');
        document.getElementById('table-view').innerHTML = `<table class='items-table'><thead><tr><th>Serial</th><th>Nazwa</th><th>Pudełko</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
        document.querySelectorAll('.edit-item').forEach(btn=>btn.onclick=()=>this.openItemModal(btn.dataset.serial));
    }
    openItemModal(serial=null){
        this.selectedItem = serial ? this.items.find(i=>i.serial===serial):null;
        document.getElementById('edit-item-modal').classList.add('active');
        document.getElementById('edit-item-serial').value = this.selectedItem?.serial || '';
        document.getElementById('edit-item-name').value = this.selectedItem?.item || '';
        document.getElementById('edit-item-box').value = this.selectedItem?.box || '';
        document.getElementById('edit-item-title').innerText = serial?'Edycja Przedmiotu':'Nowy Przedmiot';
    }
    closeItemModal(){document.getElementById('edit-item-modal').classList.remove('active');}
    saveItemModal(){
        const s = document.getElementById('edit-item-serial').value;
        const n = document.getElementById('edit-item-name').value;
        const b = document.getElementById('edit-item-box').value;
        if(s && n){
            if(this.selectedItem){
                this.selectedItem.item=n;this.selectedItem.box=b;
                this.showNotification('Zaktualizowano','success');
            }else{
                this.items.push({serial:s,item:n,box:b});
                this.showNotification('Dodano nowy','success');
            }
            this.closeItemModal();
            this.renderItems();
        }else{
            this.showNotification('Uzupełnij pola','error');
        }
    }
    deleteItemModal(){
        if(this.selectedItem){
            this.items = this.items.filter(i=>i.serial!==this.selectedItem.serial);
            this.closeItemModal();
            this.renderItems();
            this.showNotification('Usunięto','success');
        }
    }

    // PUDEŁKA -----------------------------
    renderBoxes(){
        let cards = this.boxes.map(b=>`<div class='card box-card'><div class='card__body'><div class='item-name'>${b.name}</div><div class='item-serial'>${b.code}</div><div class='item-meta'>${b.location}</div><div><button class='btn btn--sm btn--outline edit-box' data-code='${b.code}'>Edytuj</button></div></div></div>`).join('');
        document.getElementById('boxes-view').innerHTML = cards || '<p style="color:#999;text-align:center;">Brak pudełek</p>';
        document.querySelectorAll('.edit-box').forEach(btn=>btn.onclick=()=>this.openBoxModal(btn.dataset.code));
    }
    openBoxModal(code=null){
        this.selectedBox = code ? this.boxes.find(b=>b.code===code):null;
        document.getElementById('edit-box-modal').classList.add('active');
        document.getElementById('edit-box-code').value = this.selectedBox?.code || '';
        document.getElementById('edit-box-name').value = this.selectedBox?.name || '';
        document.getElementById('edit-box-location').value = this.selectedBox?.location || '';
        document.getElementById('edit-box-title').innerText = code?'Edycja Pudełka':'Nowe Pudełko';
    }
    closeBoxModal(){document.getElementById('edit-box-modal').classList.remove('active');}
    saveBoxModal(){
        const c = document.getElementById('edit-box-code').value;
        const n = document.getElementById('edit-box-name').value;
        const l = document.getElementById('edit-box-location').value;
        if(c && n){
            if(this.selectedBox){
                this.selectedBox.code=c;this.selectedBox.name=n;this.selectedBox.location=l;
                this.showNotification('Zaktualizowano','success');
            }else{
                this.boxes.push({code:c,name:n,location:l});
                this.showNotification('Dodano nowe','success');
            }
            this.closeBoxModal();
            this.renderBoxes();
        }else{
            this.showNotification('Uzupełnij pola','error');
        }
    }
    deleteBoxModal(){
        if(this.selectedBox){
            this.boxes = this.boxes.filter(b=>b.code!==this.selectedBox.code);
            this.closeBoxModal();
            this.renderBoxes();
            this.showNotification('Usunięto','success');
        }
    }
}
window.app = new InventoryApp();