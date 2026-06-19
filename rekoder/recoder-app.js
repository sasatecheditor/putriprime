// ==========================================
// SASATECH SONIC RESONANCE ENGINE (REKODER)
// ==========================================

// Frekuensi (Hz) untuk Nota Asas Rekoder Soprano
const NOTE_FREQUENCIES = {
    'G': 783.99,
    'A': 880.00,
    'B': 987.77
};

// Konfigurasi Penjarian (Lubang mana yang perlu ditutup / warna hitam)
// Lubang 0 adalah lubang belakang. Lubang 1-3 adalah tangan kiri (atas).
const FINGER_POSITIONS = {
    'G': [0, 1, 2, 3],       // Lubang belakang + 3 lubang atas ditutup
    'A': [0, 1, 2],          // Lubang belakang + 2 lubang atas ditutup
    'B': [0, 1]              // Lubang belakang + 1 lubang atas ditutup
};

function playRecorderNote(note) {
    const frequency = NOTE_FREQUENCIES[note];
    if (!frequency) return;

    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oser = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oser.type = 'triangle'; 
        oser.frequency.value = frequency;

        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.08); 
        gainNode.gain.setValueAtTime(0.15, now + 0.4);           
        gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.6); 

        oser.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oser.start(now);
        oser.stop(now + 0.6);
        
        // Kemas kini Paparan Grafik SVG & Terminal
        updateFingeringChart(note);
        updateTerminalLog(`RESONANCE_ACTIVE: Note ${note} (${frequency} Hz) radiated.`);
    } catch (e) {
        console.error("Audio Context Error:", e);
    }
}

// Fungsi Mengubah Warna Lubang SVG Dinamik
function updateFingeringChart(note) {
    const activeHoles = FINGER_POSITIONS[note] || [];

    // Reset semua lubang kepada keadaan asal (tidak ditutup / kosong)
    for (let i = 0; i <= 7; i++) {
        const hole = document.getElementById(`hole${i}`);
        if (hole) {
            hole.setAttribute('fill', '#1e293b'); // Warna kelabu gelap (kosong)
            hole.setAttribute('stroke', '#64748b');
        }
    }

    // Set lubang yang terlibat kepada warna aktif (menyala/fuchsia untuk tema cyberpunk SasaTech)
    activeHoles.forEach(holeId => {
        const hole = document.getElementById(`hole${holeId}`);
        if (hole) {
            hole.setAttribute('fill', '#d946ef'); // Fuchsia menyala (ditutup)
            hole.setAttribute('stroke', '#f472b6');
        }
    });
}

function updateTerminalLog(message) {
    const logElem = document.getElementById('recorder-terminal');
    if (logElem) {
        logElem.textContent = `[SYS_LOG] ${message}`;
    }
}
