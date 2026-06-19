// ==========================================
// SASATECH SONIC RESONANCE ENGINE (REKODER)
// V3.0 - FULL OCTAVE EXTENSION (NEXT LEVEL)
// ==========================================

// Cipta satu global AudioContext sahaja untuk mengelakkan memori bertindih (noise/drop)
let globalAudioCtx = null;

// Frekuensi (Hz) untuk Skala 1 Oktav Lengkap (Soprano)
const NOTE_FREQUENCIES = {
    'C_LOW':  523.25, // Do Rendah
    'D_LOW':  587.33, // Re
    'E_LOW':  659.25, // Mi
    'F_BAROK': 698.46, // Fa (Sistem Barok)
    'G':      783.99, // So
    'A':      880.00, // La
    'B':      987.77, // Ti
    'C_HIGH': 1046.50, // Do Tinggi
    'D_HIGH': 1174.66  // Re Tinggi
};

// Konfigurasi Penjarian Lengkap (0 = Belakang, 1-7 = Lubang Depan dari Atas ke Bawah)
const FINGER_POSITIONS = {
    'C_LOW':   [0, 1, 2, 3, 4, 5, 6, 7], // Semua lubang ditutup
    'D_LOW':   [0, 1, 2, 3, 4, 5, 6],    // Lubang 7 dibuka
    'E_LOW':   [0, 1, 2, 3, 4, 5],       // Lubang 6 & 7 dibuka
    'F_BAROK': [0, 1, 2, 3, 4, 6, 7],    // Lubang 5 dibuka (Sistem Barok standard)
    'G':       [0, 1, 2, 3],
    'A':       [0, 1, 2],
    'B':       [0, 1],
    'C_HIGH':  [0, 2],
    'D_HIGH':  [2]
};

// ... (Bahagian kod fungsi playRecorderNote, updateFingeringChart, dll. di bawah kekal sama)
// Fungsi untuk memastikan AudioContext sedia digunakan
function getAudioContext() {
    if (!globalAudioCtx) {
        globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Jika pelayar meletakkan AudioContext dalam keadaan 'suspended' (sekatan keselamatan pelayar)
    if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
    }
    return globalAudioCtx;
}

function playRecorderNote(note) {
    const frequency = NOTE_FREQUENCIES[note];
    if (!frequency) return;

    try {
        // Guna global context yang disemak
        const audioCtx = getAudioContext();
        
        const oser = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oser.type = 'triangle'; 
        oser.frequency.value = frequency;

        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05); // Serangan tiupan lebih pantas
        gainNode.gain.setValueAtTime(0.15, now + 0.35);           
        gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.5); 

        oser.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oser.start(now);
        oser.stop(now + 0.5);
        
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

    for (let i = 0; i <= 7; i++) {
        const hole = document.getElementById(`hole${i}`);
        if (hole) {
            hole.setAttribute('fill', '#1e293b'); 
            hole.setAttribute('stroke', '#64748b');
        }
    }

    activeHoles.forEach(holeId => {
        const hole = document.getElementById(`hole${holeId}`);
        if (hole) {
            hole.setAttribute('fill', '#d946ef'); 
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
// SASATECH INTERACTIVE MELODY PLAYER 
// ==========================================

const SONG_SEQUENCE = ['B', 'A', 'G', 'A', 'B', 'B', 'B'];
let currentSongIndex = 0;

function playSongNote(note) {
    playRecorderNote(note);
    
    const expectedNote = SONG_SEQUENCE[currentSongIndex];
    const songTerminal = document.getElementById('song-terminal');
    
    if (note === expectedNote) {
        const stepElem = document.getElementById(`step-${currentSongIndex}`);
        if (stepElem) {
            stepElem.className = "bg-emerald-500 text-black font-bold px-3 py-1.5 rounded-lg border border-emerald-400 font-mono shadow-[0_0_10px_rgba(16,185,129,0.3)]";
        }
        
        currentSongIndex++;
        if (songTerminal) songTerminal.textContent = `[MELODY_TRACKER] Match found: Node ${note}. Proceed to next sequence.`;
        
        if (currentSongIndex === SONG_SEQUENCE.length) {
            if (songTerminal) songTerminal.className = "bg-emerald-950/40 p-2.5 rounded border border-emerald-500 font-mono text-[11px] text-emerald-400 animate-bounce";
            if (songTerminal) songTerminal.textContent = "🎉 SUCCESS: MELODY_DECRYPTED! SasaTech Resonance Matrix Synchronized.";
            
            setTimeout(() => {
                playVictoryChime();
            }, 550);
            
            setTimeout(resetSongTracker, 4000);
        }
    } else {
        if (songTerminal) songTerminal.textContent = `[CRITICAL_ERR] Sequence broken! Expected ${expectedNote} but received ${note}. Resetting tracker...`;
        resetSongTracker();
    }
}

function resetSongTracker() {
    currentSongIndex = 0;
    const songTerminal = document.getElementById('song-terminal');
    if (songTerminal) songTerminal.className = "bg-black/60 p-2.5 rounded border border-gray-900 font-mono text-[11px] text-fuchsia-400";
    
    SONG_SEQUENCE.forEach((_, index) => {
        const stepElem = document.getElementById(`step-${index}`);
        if (stepElem) {
            stepElem.className = "bg-purple-950/10 border border-purple-900/30 text-gray-400 px-3 py-1.5 rounded-lg font-mono text-center";
        }
    });
}

function playVictoryChime() {
    try {
        // Guna global context yang sama
        const audioCtx = getAudioContext();
        const now = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; 
        
        notes.forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + (index * 0.12));
            gain.gain.setValueAtTime(0.05, now + (index * 0.12));
            gain.gain.exponentialRampToValueAtTime(0.00001, now + (index * 0.12) + 0.25);
            osc.connect(gain); 
            gain.connect(audioCtx.destination);
            osc.start(now + (index * 0.12)); 
            osc.stop(now + (index * 0.12) + 0.25);
        });
    } catch(e) {}
}

// ==========================================
// SASATECH AIRFLOW SIMULATOR (BAB 2)
// ==========================================

function simulateAirflow(level) {
    const stream = document.getElementById('air-stream');
    const statusText = document.getElementById('airflow-status');
    const alertBox = document.getElementById('airflow-alert');
    
    if (!stream || !statusText || !alertBox) return;
    
    stream.className = "h-2 rounded-full transition-all duration-500 w-0";
    alertBox.className = "p-3 rounded-xl border text-xs font-mono transition-all duration-300 ";
    
    try {
        const audioCtx = getAudioContext();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;
        
        if (level === 'weak') {
            stream.classList.add('w-1/3', 'bg-blue-500', 'animate-pulse');
            statusText.textContent = "AIRFLOW: UNDER_POWERED // PITCH: FLAT";
            alertBox.classList.add('bg-blue-950/30', 'border-blue-900/50', 'text-blue-400');
            alertBox.innerHTML = "⚠️ <strong>SasaTech Analyzer:</strong> Tiupan terlalu lemah. Bunyi tidak akan keluar atau menjadi mendatar (flat). Sokong aliran udara menggunakan diafragma.";
            
            osc.frequency.setValueAtTime(250, now);
            gainNode.gain.setValueAtTime(0.02, now);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
            
        } else if (level === 'stable') {
            stream.classList.add('w-full', 'bg-emerald-500');
            statusText.textContent = "AIRFLOW: OPTIMAL // PITCH: STABLE";
            alertBox.classList.add('bg-emerald-950/30', 'border-emerald-900/50', 'text-emerald-400');
            alertBox.innerHTML = "✅ <strong>SasaTech Analyzer:</strong> Sempurna! Sebutan 'Tu' menghasilkan tekanan udara mampan. Frekuensi akustik berada pada tahap kualiti tertinggi.";
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
            osc.start(now); osc.stop(now + 0.4);
            
        } else if (level === 'strong') {
            stream.classList.add('w-full', 'bg-red-500', 'scale-y-150', 'animate-bounce');
            statusText.textContent = "CRITICAL: OVERBLOWING // PITCH: DISTORTED";
            alertBox.classList.add('bg-red-950/30', 'border-red-900/50', 'text-red-400', 'animate-pulse');
            alertBox.innerHTML = "❌ <strong>ANOMALI DIKESAN:</strong> Anda meniup seperti meniup lilin! Udara melampau memecahkan gelombang akustik (*overblowing*) menyebabkan bunyi melengking kasar.";
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1200, now);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
            osc.start(now); osc.stop(now + 0.4);
        }
    } catch(e) {
        console.log(e);
    }
}
