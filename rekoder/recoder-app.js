// ==========================================
// SASATECH SONIC RESONANCE ENGINE (REKODER)
// ==========================================

// Frekuensi (Hz) untuk Nota Asas Rekoder Soprano
const NOTE_FREQUENCIES = {
    'C': 523.25,
    'D': 587.33,
    'E': 659.25,
    'F': 698.46,
    'G': 783.99,
    'A': 880.00,
    'B': 987.77
};

// Fungsi Utama Penjana Bunyi Tiupan Rekoder
function playRecorderNote(note) {
    const frequency = NOTE_FREQUENCIES[note];
    if (!frequency) return;

    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oser = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // Menggunakan gelombang 'triangle' untuk bunyi yang lebih lembut seakan tiupan angin
        oser.type = 'triangle'; 
        oser.frequency.value = frequency;

        // Simulasi "ADSR Envelope" (Tiupan bermula lembut, stabil, dan pudar)
        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.08); // Tiupan masuk (Attack)
        gainNode.gain.setValueAtTime(0.15, now + 0.4);           // Kekalan bunyi (Sustain)
        gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.6); // Pudar (Release)

        oser.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oser.start(now);
        oser.stop(now + 0.6);
        
        // Kesan Visual: Kemas kini paparan terminal interaktif (jika ada)
        updateTerminalLog(`RESONANCE_ACTIVE: Note ${note} (${frequency} Hz) radiated.`);
    } catch (e) {
        console.error("Audio Context Error:", e);
    }
}

// Fungsi log kosmetik bertema Cyberpunk
function updateTerminalLog(message) {
    const logElem = document.getElementById('recorder-terminal');
    if (logElem) {
        logElem.textContent = `[SYS_LOG] ${message}`;
    }
}
