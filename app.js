// Soundscapes App - Custom Ambient Audio Builder
class SoundscapesApp {
    constructor() {
        this.audioContext = null;
        this.layers = {
            rain: { source: null, gainNode: null, buffer: null, playing: false },
            cafe: { source: null, gainNode: null, buffer: null, playing: false },
            whitenoise: { source: null, gainNode: null, buffer: null, playing: false },
            synth: { source: null, gainNode: null, buffer: null, playing: false }
        };
        this.timer = null;
        this.timerEndTime = null;
        this.settings = this.loadSettings();
        this.presets = this.loadPresets();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMixer();
        this.setupTimer();
        this.setupPresets();
        this.setupShare();
        this.setupAccount();
        this.loadFromURL();
    }

    // Audio Context Initialization
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.generateAudioBuffers();
        }
    }

    // Generate procedural audio buffers
    generateAudioBuffers() {
        const sampleRate = this.audioContext.sampleRate;
        
        // Rain sound (pink noise with filtering)
        this.layers.rain.buffer = this.createRainBuffer(sampleRate);
        
        // Café ambience (brown noise with modulation)
        this.layers.cafe.buffer = this.createCafeBuffer(sampleRate);
        
        // White noise
        this.layers.whitenoise.buffer = this.createWhiteNoiseBuffer(sampleRate);
        
        // Synth pad (low frequency oscillations)
        this.layers.synth.buffer = this.createSynthPadBuffer(sampleRate);
    }

    createRainBuffer(sampleRate) {
        const duration = 10; // 10 seconds loop
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            
            for (let i = 0; i < data.length; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }
        }
        return buffer;
    }

    createCafeBuffer(sampleRate) {
        const duration = 10;
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            let b0 = 0;
            
            for (let i = 0; i < data.length; i++) {
                const white = Math.random() * 2 - 1;
                b0 = (b0 + (0.02 * white)) / 1.02;
                const modulation = Math.sin(i / sampleRate * 2 * Math.PI * 0.5) * 0.3;
                data[i] = (b0 * 3.5 + modulation) * 0.3;
            }
        }
        return buffer;
    }

    createWhiteNoiseBuffer(sampleRate) {
        const duration = 10;
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        }
        return buffer;
    }

    createSynthPadBuffer(sampleRate) {
        const duration = 10;
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            const freq1 = 110; // A2
            const freq2 = 146.83; // D3
            const freq3 = 164.81; // E3
            
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                const envelope = Math.sin(t * Math.PI / duration) * 0.5;
                const osc1 = Math.sin(2 * Math.PI * freq1 * t);
                const osc2 = Math.sin(2 * Math.PI * freq2 * t);
                const osc3 = Math.sin(2 * Math.PI * freq3 * t);
                data[i] = (osc1 + osc2 + osc3) / 3 * envelope * 0.3;
            }
        }
        return buffer;
    }

    // Layer Control
    toggleLayer(layerName) {
        this.initAudioContext();
        
        if (this.layers[layerName].playing) {
            this.stopLayer(layerName);
        } else {
            this.playLayer(layerName);
        }
    }

    playLayer(layerName) {
        const layer = this.layers[layerName];
        
        if (!layer.buffer) return;
        
        // Create source
        layer.source = this.audioContext.createBufferSource();
        layer.source.buffer = layer.buffer;
        layer.source.loop = this.settings.autoLoop;
        
        // Create gain node
        layer.gainNode = this.audioContext.createGain();
        const volume = document.getElementById(`${layerName}-volume`).value / 100;
        layer.gainNode.gain.value = volume;
        
        // Connect: source -> gain -> destination
        layer.source.connect(layer.gainNode);
        layer.gainNode.connect(this.audioContext.destination);
        
        // Start playback
        layer.source.start(0);
        layer.playing = true;
        
        // Update UI
        this.updateLayerUI(layerName, true);
    }

    stopLayer(layerName) {
        const layer = this.layers[layerName];
        
        if (layer.source) {
            layer.source.stop();
            layer.source = null;
        }
        
        layer.playing = false;
        this.updateLayerUI(layerName, false);
    }

    updateLayerUI(layerName, playing) {
        const layerElement = document.querySelector(`.layer[data-layer="${layerName}"]`);
        const toggleButton = layerElement.querySelector('.layer-toggle');
        
        if (playing) {
            layerElement.classList.add('playing');
            toggleButton.classList.add('playing');
        } else {
            layerElement.classList.remove('playing');
            toggleButton.classList.remove('playing');
        }
    }

    setLayerVolume(layerName, volume) {
        const layer = this.layers[layerName];
        
        if (layer.gainNode) {
            const crossfadeDuration = parseFloat(this.settings.crossfadeDuration);
            const currentTime = this.audioContext.currentTime;
            
            layer.gainNode.gain.cancelScheduledValues(currentTime);
            layer.gainNode.gain.setValueAtTime(layer.gainNode.gain.value, currentTime);
            layer.gainNode.gain.linearRampToValueAtTime(volume / 100, currentTime + crossfadeDuration);
        }
        
        // Update UI
        const volumeDisplay = document.querySelector(`#${layerName}-volume`).nextElementSibling;
        volumeDisplay.textContent = `${volume}%`;
    }

    playAll() {
        this.initAudioContext();
        
        Object.keys(this.layers).forEach(layerName => {
            const volume = document.getElementById(`${layerName}-volume`).value;
            if (volume > 0 && !this.layers[layerName].playing) {
                this.playLayer(layerName);
            }
        });
    }

    stopAll() {
        Object.keys(this.layers).forEach(layerName => {
            if (this.layers[layerName].playing) {
                this.stopLayer(layerName);
            }
        });
    }

    // Navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show corresponding page
                const pageName = link.dataset.page;
                this.showPage(pageName);
            });
        });
    }

    showPage(pageName) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    // Mixer Setup
    setupMixer() {
        // Play/Stop all buttons
        document.getElementById('play-all').addEventListener('click', () => this.playAll());
        document.getElementById('stop-all').addEventListener('click', () => this.stopAll());
        
        // Layer toggles
        document.querySelectorAll('.layer-toggle').forEach(button => {
            button.addEventListener('click', () => {
                const layerName = button.dataset.layer;
                this.toggleLayer(layerName);
            });
        });
        
        // Volume sliders
        document.querySelectorAll('.volume-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const layerName = slider.dataset.layer;
                const volume = e.target.value;
                this.setLayerVolume(layerName, volume);
                this.updateShareLink();
            });
        });
        
        // Save preset
        document.getElementById('save-preset').addEventListener('click', () => this.savePreset());
    }

    // Timer Setup
    setupTimer() {
        document.querySelectorAll('.timer-btn').forEach(button => {
            button.addEventListener('click', () => {
                const minutes = parseInt(button.dataset.minutes);
                this.setTimer(minutes);
                
                // Update active state
                document.querySelectorAll('.timer-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    setTimer(minutes) {
        // Clear existing timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        const display = document.getElementById('timer-display');
        
        if (minutes === 0) {
            display.textContent = 'No timer set';
            this.timerEndTime = null;
            return;
        }
        
        this.timerEndTime = Date.now() + (minutes * 60 * 1000);
        
        const updateTimer = () => {
            const remaining = this.timerEndTime - Date.now();
            
            if (remaining <= 0) {
                this.stopAll();
                display.textContent = 'Timer ended - Stopped';
                clearInterval(this.timer);
                this.timer = null;
                return;
            }
            
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            display.textContent = `${mins}:${secs.toString().padStart(2, '0')} remaining`;
        };
        
        updateTimer();
        this.timer = setInterval(updateTimer, 1000);
    }

    // Presets
    savePreset() {
        const nameInput = document.getElementById('preset-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Please enter a preset name');
            return;
        }
        
        const preset = {
            name: name,
            timestamp: Date.now(),
            layers: {}
        };
        
        Object.keys(this.layers).forEach(layerName => {
            preset.layers[layerName] = document.getElementById(`${layerName}-volume`).value;
        });
        
        this.presets.push(preset);
        this.savePresets();
        this.renderPresets();
        
        nameInput.value = '';
        alert(`Preset "${name}" saved!`);
    }

    loadPreset(preset) {
        Object.keys(preset.layers).forEach(layerName => {
            const volume = preset.layers[layerName];
            const slider = document.getElementById(`${layerName}-volume`);
            slider.value = volume;
            this.setLayerVolume(layerName, volume);
        });
        
        this.updateShareLink();
        
        // Switch to mixer page
        this.showPage('mixer');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('.nav-link[data-page="mixer"]').classList.add('active');
    }

    deletePreset(index) {
        if (confirm('Delete this preset?')) {
            this.presets.splice(index, 1);
            this.savePresets();
            this.renderPresets();
        }
    }

    renderPresets() {
        const container = document.getElementById('presets-list');
        
        if (this.presets.length === 0) {
            container.innerHTML = '<p class="empty-state">No presets saved yet. Create one in the Mixer!</p>';
            return;
        }
        
        container.innerHTML = this.presets.map((preset, index) => {
            const layersList = Object.entries(preset.layers)
                .filter(([_, volume]) => volume > 0)
                .map(([layer, volume]) => `${layer}: ${volume}%`)
                .join(', ');
            
            return `
                <div class="preset-card">
                    <div class="preset-header">
                        <div class="preset-name">${preset.name}</div>
                        <div class="preset-actions">
                            <button class="preset-btn" onclick="app.loadPreset(app.presets[${index}])">▶ Load</button>
                            <button class="preset-btn" onclick="app.deletePreset(${index})">🗑️</button>
                        </div>
                    </div>
                    <div class="preset-layers">${layersList || 'No active layers'}</div>
                </div>
            `;
        }).join('');
    }

    setupPresets() {
        this.renderPresets();
    }

    // Share
    setupShare() {
        document.getElementById('copy-link').addEventListener('click', () => this.copyShareLink());
        this.updateShareLink();
    }

    updateShareLink() {
        const volumes = {};
        Object.keys(this.layers).forEach(layerName => {
            volumes[layerName] = document.getElementById(`${layerName}-volume`).value;
        });
        
        const hasActiveLayer = Object.values(volumes).some(v => v > 0);
        
        if (!hasActiveLayer) {
            document.getElementById('share-link').value = '';
            document.getElementById('copy-link').disabled = true;
            return;
        }
        
        const params = new URLSearchParams(volumes);
        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        
        document.getElementById('share-link').value = url;
        document.getElementById('copy-link').disabled = false;
    }

    copyShareLink() {
        const input = document.getElementById('share-link');
        input.select();
        document.execCommand('copy');
        
        const status = document.getElementById('share-status');
        status.textContent = 'Link copied to clipboard!';
        status.className = 'share-status success';
        
        setTimeout(() => {
            status.textContent = '';
            status.className = 'share-status';
        }, 3000);
    }

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        let hasParams = false;
        Object.keys(this.layers).forEach(layerName => {
            if (params.has(layerName)) {
                hasParams = true;
                const volume = params.get(layerName);
                const slider = document.getElementById(`${layerName}-volume`);
                slider.value = volume;
                this.setLayerVolume(layerName, volume);
            }
        });
        
        if (hasParams) {
            this.updateShareLink();
        }
    }

    // Account
    setupAccount() {
        // Crossfade duration
        const crossfadeSelect = document.getElementById('crossfade-duration');
        crossfadeSelect.value = this.settings.crossfadeDuration;
        crossfadeSelect.addEventListener('change', (e) => {
            this.settings.crossfadeDuration = e.target.value;
            this.saveSettings();
        });
        
        // Auto loop
        const autoLoopCheckbox = document.getElementById('auto-loop');
        autoLoopCheckbox.checked = this.settings.autoLoop;
        autoLoopCheckbox.addEventListener('change', (e) => {
            this.settings.autoLoop = e.target.checked;
            this.saveSettings();
        });
        
        // Export presets
        document.getElementById('export-presets').addEventListener('click', () => this.exportPresets());
        
        // Clear all data
        document.getElementById('clear-all-data').addEventListener('click', () => this.clearAllData());
    }

    exportPresets() {
        const data = JSON.stringify(this.presets, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `soundscapes-presets-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    clearAllData() {
        if (confirm('This will delete all your presets and settings. Are you sure?')) {
            localStorage.clear();
            this.presets = [];
            this.settings = { crossfadeDuration: 1, autoLoop: true };
            this.renderPresets();
            alert('All data cleared!');
        }
    }

    // Storage
    loadSettings() {
        const saved = localStorage.getItem('soundscapes-settings');
        return saved ? JSON.parse(saved) : { crossfadeDuration: 1, autoLoop: true };
    }

    saveSettings() {
        localStorage.setItem('soundscapes-settings', JSON.stringify(this.settings));
    }

    loadPresets() {
        const saved = localStorage.getItem('soundscapes-presets');
        return saved ? JSON.parse(saved) : [];
    }

    savePresets() {
        localStorage.setItem('soundscapes-presets', JSON.stringify(this.presets));
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SoundscapesApp();
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}
