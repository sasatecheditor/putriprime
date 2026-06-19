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

// ==========================================
// SASATECH AIRFLOW SIMULATOR (BAB 2)
// ==========================================

function simulateAirflow(level) {
    const stream = document.getElementById('air-stream');
    const statusText = document.getElementById('airflow-status');
    const alertBox = document.getElementById('airflow-alert');
    
    if (!stream || !statusText || !alertBox) return;
    
    // Reset kelas asal
    stream.className = "h-2 rounded-full transition-all duration-500 w-0";
    alertBox.className = "p-3 rounded-xl border text-xs font-mono transition-all duration-300 ";
    
    // Suara simulasi menggunakan Web Audio API
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;
        
        if (level === 'weak') {
            // Tiupan Lemah
            stream.classList.add('w-1/3', 'bg-blue-500', 'animate-pulse');
            statusText.textContent = "AIRFLOW: UNDER_POWERED // PITCH: FLAT";
            alertBox.classList.add('bg-blue-950/30', 'border-blue-900/50', 'text-blue-400');
            alertBox.innerHTML = "⚠️ <strong>SasaTech Analyzer:</strong> Tiupan terlalu lemah. Bunyi tidak akan keluar atau menjadi mendatar (flat). Sokong aliran udara menggunakan diafragma.";
            
            // Bunyi rendah/flat
            osc.frequency.setValueAtTime(250, now);
            gainNode.gain.setValueAtTime(0.02, now);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
            osc.start(now); osc.stop(now + 0.4);
            
        } else if (level === 'stable') {
            // Tiupan Stabil (Betul!)
            stream.classList.add('w-full', 'bg-emerald-500');
            statusText.textContent = "AIRFLOW: OPTIMAL // PITCH: STABLE";
            alertBox.classList.add('bg-emerald-950/30', 'border-emerald-900/50', 'text-emerald-400');
            alertBox.innerHTML = "✅ <strong>SasaTech Analyzer:</strong> Sempurna! Sebutan 'Tu' menghasilkan tekanan udara mampan. Frekuensi akustik berada pada tahap kualiti tertinggi.";
            
            // Bunyi tiupan angin bersih (Whistle sound)
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
            
        } else if (level === 'strong') {
            // Tiupan Terlalu Kuat (Overblowing)
            stream.classList.add('w-full', 'bg-red-500', 'scale-y-150', 'animate-bounce');
            statusText.textContent = "CRITICAL: OVERBLOWING // PITCH: DISTORTED";
            alertBox.classList.add('bg-red-950/30', 'border-red-900/50', 'text-red-400', 'animate-pulse');
            alertBox.innerHTML = "❌ <strong>ANOMALI DIKESAN:</strong> Anda meniup seperti meniup lilin! Udara melampau memecahkan gelombang akustik (*overblowing*) menyebabkan bunyi melengking kasar.";
            
            // Bunyi nyaring pecah
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1200, now);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.6);
            osc.start(now); osc.stop(now + 0.6);
        }
    } catch(e) {
        console.log(e);
    }
}

// ==========================================
// SASATECH INTERACTIVE MELODY PLAYER (FASA 2)
// ==========================================

// Turutan nota untuk lagu "Mary Had a Little Lamb"
const SONG_SEQUENCE = ['B', 'A', 'G', 'A', 'B', 'B', 'B'];
let currentSongIndex = 0;

function playSongNote(note) {
    // 1. Mainkan bunyi nota menggunakan fungsi sedia ada kita
    playRecorderNote(note);
    
    // 2. Semak jika nota yang ditekan betul mengikut turutan lagu
    const expectedNote = SONG_SEQUENCE[currentSongIndex];
    const songTerminal = document.getElementById('song-terminal');
    
    if (note === expectedNote) {
        // Kemas kini visual nota yang berjaya ditekan
        const stepElem = document.getElementById(`step-${currentSongIndex}`);
        if (stepElem) {
            stepElem.className = "bg-emerald-500 text-black font-bold px-3 py-1.5 rounded-lg border border-emerald-400 font-mono shadow-[0_0_10px_rgba(16,185,129,0.3)]";
        }
        
        currentSongIndex++;
        if (songTerminal) songTerminal.textContent = `[MELODY_TRACKER] Match found: Node ${note}. Proceed to next sequence.`;
        
        // Jika lagu selesai sepenuhnya
        if (currentSongIndex === SONG_SEQUENCE.length) {
            if (songTerminal) songTerminal.className = "bg-emerald-950/40 p-2.5 rounded border border-emerald-500 font-mono text-[11px] text-emerald-400 animate-bounce";
            if (songTerminal) songTerminal.textContent = "🎉 SUCCESS: MELODY_DECRYPTED! SasaTech Resonance Matrix Synchronized.";
            
            // KEMAS KINI: Letakkan delay selama 600ms (0.6 saat) supaya nota 'B' selesai dimainkan dahulu
            setTimeout(() => {
                playVictoryChime();
            }, 600);
            
            // Reset selepas 4 saat (ditambah masa sikit untuk muatkan delay di atas)
            setTimeout(resetSongTracker, 4000);
        }
    } else {
        // Jika salah tekan, reset semula progres lagu
        if (songTerminal) songTerminal.textContent = `[CRITICAL_ERR] Sequence broken! Expected ${expectedNote} but received ${note}. Resetting tracker...`;
        resetSongTracker();
    }
}

function resetSongTracker() {
    currentSongIndex = 0;
    const songTerminal = document.getElementById('song-terminal');
    if (songTerminal) songTerminal.className = "bg-black/60 p-2.5 rounded border border-gray-900 font-mono text-[11px] text-fuchsia-400";
    
    // Kemas kini semua kotak langkah lagu balik ke asal
    SONG_SEQUENCE.forEach((_, index) => {
        const stepElem = document.getElementById(`step-${index}`);
        if (stepElem) {
            stepElem.className = "bg-purple-950/10 border border-purple-900/30 text-gray-400 px-3 py-1.5 rounded-lg font-mono text-center";
        }
    });
}

function playVictoryChime() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - C (High)
        notes.forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + (index * 0.15));
            gain.gain.setValueAtTime(0.05, now + (index * 0.15));
            gain.gain.exponentialRampToValueAtTime(0.00001, now + (index * 0.15) + 0.3);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(now + (index * 0.15)); osc.stop(now + (index * 0.15) + 0.3);
        });
    } catch(e) {}
}
