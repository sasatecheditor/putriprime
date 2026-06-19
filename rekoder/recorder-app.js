// ==========================================
// SASATECH SONIC RESONANCE ENGINE (REKODER)
// V3.6 - FULL MECHANICAL AUDIO MATRIX (COMPLETE)
// ==========================================

// Cipta satu global AudioContext sahaja untuk mengelakkan memori bertindih
let globalAudioCtx = null;

// Frekuensi (Hz) untuk Skala 1 Oktav Lengkap
const NOTE_FREQUENCIES = {
    'C_LOW':  523.25,
    'D_LOW':  587.33,
    'E_LOW':  659.25,
    'F_BAROK': 698.46,
    'G':      783.99,
    'A':      880.00,
    'B':      987.77,
    'C_HIGH': 1046.50,
    'D_HIGH': 1174.66
};

// Konfigurasi Penjarian SVG (0 = Belakang, 1-7 = Depan)
const FINGER_POSITIONS = {
    'C_LOW':   [0, 1, 2, 3, 4, 5, 6, 7],
    'D_LOW':   [0, 1, 2, 3, 4, 5, 6],
    'E_LOW':   [0, 1, 2, 3, 4, 5],
    'F_BAROK': [0, 1, 2, 3, 4, 6, 7],
    'G':       [0, 1, 2, 3],
    'A':       [0, 1, 2],
    'B':       [0, 1],
    'C_HIGH':  [0, 2],
    'D_HIGH':  [2]
};

// Menyimpan senarai suara oscillator yang sedang aktif
let activeOscillators = {};

// ------------------------------------------
// LOGIK UTAMA: MULA TIUP NOTA
// ------------------------------------------
function startRecorderNote(note) {
    if (!NOTE_FREQUENCIES[note]) return;

    // Aktifkan AudioContext jika belum berjalan (Polisi Browser)
    if (!globalAudioCtx) {
        globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
    }

    // Jika nota sedang berbunyi, hentikan dahulu
    stopRecorderNote(note);

    const freq = NOTE_FREQUENCIES[note];
    const osc = globalAudioCtx.createOscillator();
    const gainNode = globalAudioCtx.createGain();
    
    osc.type = 'triangle'; // Bunyi lembut seakan rekoder
    osc.frequency.setValueAtTime(freq, globalAudioCtx.currentTime);
    
    // Attack: Elakkan bunyi klik mengejut
    gainNode.gain.setValueAtTime(0, globalAudioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, globalAudioCtx.currentTime + 0.03);
    
    osc.connect(gainNode);
    gainNode.connect(globalAudioCtx.destination);
    osc.start();
    
    // Simpan objek untuk dimatikan kemudian
    activeOscillators[note] = { oscillator: osc, gain: gainNode };
    
    // Kemas kini grafik rekoder SVG jika fungsi wujud
    if (typeof updateFingeringChart === 'function') {
        updateFingeringChart(note);
    }
}

// ------------------------------------------
// LOGIK UTAMA: BERHENTI TIUP NOTA
// ------------------------------------------
function stopRecorderNote(note) {
    if (activeOscillators[note]) {
        const oscData = activeOscillators[note];
        const currentTime = globalAudioCtx.currentTime;
        
        // Release: Bunyi pudar keluar secara natural (0.05 saat)
        oscData.gain.gain.setValueAtTime(oscData.gain.gain.value, currentTime);
        oscData.gain.gain.linearRampToValueAtTime(0, currentTime + 0.05);
        
        oscData.oscillator.stop(currentTime + 0.05);
        delete activeOscillators[note];
    }
}

// Fallback untuk butang papan kekunci biasa
function playRecorderNote(note) {
    startRecorderNote(note);
    setTimeout(() => { stopRecorderNote(note); }, 400);
}


// ==========================================
// [BARU & DIKEMAS KINI] LOGIK LAGU: LYRA / MARY (BAB 3)
// ==========================================
const SONG_SEQUENCE_3 = ['B', 'A', 'G', 'A', 'B', 'B', 'B'];
let currentSongIndex3 = 0;

function playSongNote(note) {
    startRecorderNote(note);
    
    const expectedNote = SONG_SEQUENCE_3[currentSongIndex3];
    const songTerminal3 = document.getElementById('song-terminal');
    
    if (note === expectedNote) {
        const stepElem = document.getElementById(`step-${currentSongIndex3}`);
        if (stepElem) {
            stepElem.className = "bg-fuchsia-500 text-black font-bold px-2 py-1 rounded border border-fuchsia-400 font-mono text-center text-[11px] shadow-[0_0_10px_rgba(217,70,239,0.3)]";
        }
        
        currentSongIndex3++;
        if (songTerminal3) songTerminal3.textContent = `[LYRA_TRACKER] Match found: Node ${note}. Holding blow...`;
        
        if (currentSongIndex3 === SONG_SEQUENCE_3.length) {
            if (songTerminal3) {
                songTerminal3.className = "bg-purple-950/40 p-2.5 rounded border border-fuchsia-500 font-mono text-[11px] text-fuchsia-400 text-center font-bold animate-bounce";
                songTerminal3.textContent = "🎉 SUCCESS: LYRA_RESONANCE_COMPLETE! Beginner Matrix Unlocked.";
            }
            setTimeout(resetSongTracker3, 4000);
        }
    } else {
        if (songTerminal3) songTerminal3.textContent = `[RALAT] Rentak terputus! Sepatutnya nota ${expectedNote} tetapi anda menekan ${note}. Mengulang semula...`;
        resetSongTracker3();
    }
}

function stopSongNote(note) {
    stopRecorderNote(note);
}

function resetSongTracker3() {
    currentSongIndex3 = 0;
    const songTerminal3 = document.getElementById('song-terminal');
    if (songTerminal3) {
        songTerminal3.className = "bg-black/60 p-2 rounded border border-gray-900 text-fuchsia-400 mt-4 text-[10px] min-h-[30px] flex items-center";
        songTerminal3.textContent = "[MELODY_TRACKER] Awaiting beginner resonance sequence...";
    }
    
    SONG_SEQUENCE_3.forEach((_, index) => {
        const stepElem = document.getElementById(`step-${index}`);
        if (stepElem) {
            stepElem.className = "bg-purple-950/10 border border-purple-900/30 text-gray-400 py-1 rounded text-center text-[11px]";
        }
    });
}


// ==========================================
// LOGIK LATIHAN LAGU: ULIK MAYANG (BAB 5)
// ==========================================
const SONG_SEQUENCE_5 = ['E', 'E', 'E', 'E', 'E', 'F', 'G', 'F', 'A', 'G', 'F', 'E', 'D', 'D', 'E', 'F', 'D', 'E'];
let currentSongIndex5 = 0;

function playSongNote5(note) {
    let targetNote = note;
    if (note === 'F') targetNote = 'F_BAROK';
    if (note === 'D') targetNote = 'D_LOW';
    if (note === 'E') targetNote = 'E_LOW';

    startRecorderNote(targetNote);
    
    const expectedNote = SONG_SEQUENCE_5[currentSongIndex5];
    const songTerminal = document.getElementById('song-terminal-5');
    
    if (note === expectedNote) {
        const stepElem = document.getElementById(`step5-${currentSongIndex5}`);
        if (stepElem) {
            stepElem.className = "bg-emerald-500 text-black font-bold px-2 py-1 rounded border border-emerald-400 font-mono text-center text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.3)]";
        }
        
        currentSongIndex5++;
        if (songTerminal) songTerminal.textContent = `[ULIK_TRACKER] Match found: Node ${note}. Holding blow...`;
        
        if (currentSongIndex5 === SONG_SEQUENCE_5.length) {
            if (songTerminal) {
                songTerminal.className = "bg-emerald-950/40 p-2.5 rounded border border-emerald-500 font-mono text-[11px] text-emerald-400 text-center font-bold animate-bounce";
                songTerminal.textContent = "🎉 TAHNIAH! MELODI ULIK MAYANG SELESAI DENGAN RENTAK SEMPURNA.";
            }
            setTimeout(resetSongTracker5, 4000);
        }
    } else {
        if (songTerminal) songTerminal.textContent = `[RALAT] Rentak terputus! Sepatutnya nota ${expectedNote} tetapi anda menekan ${note}. Mengulang semula...`;
        resetSongTracker5();
    }
}

function stopSongNote5(note) {
    let targetNote = note;
    if (note === 'F') targetNote = 'F_BAROK';
    if (note === 'D') targetNote = 'D_LOW';
    if (note === 'E') targetNote = 'E_LOW';
    
    stopRecorderNote(targetNote);
}

function resetSongTracker5() {
    currentSongIndex5 = 0;
    const songTerminal = document.getElementById('song-terminal-5');
    if (songTerminal) {
        songTerminal.className = "bg-black/60 p-2.5 rounded border border-gray-900 font-mono text-[11px] text-emerald-400";
        songTerminal.textContent = "[ULIK_TRACKER] Sedia menerima tiupan skala penuh...";
    }
    
    SONG_SEQUENCE_5.forEach((_, index) => {
        const stepElem = document.getElementById(`step5-${index}`);
        if (stepElem) {
            stepElem.className = "bg-emerald-950/10 border border-emerald-900/30 text-gray-500 py-1 rounded font-mono text-center text-[10px]";
        }
    });
}


// ------------------------------------------
// GRAFIK SIMULASI REKODER SVG
// ------------------------------------------
function updateFingeringChart(note) {
    const activeFingers = FINGER_POSITIONS[note] || [];
    const logTerminal = document.getElementById('recorder-terminal');
    
    if (logTerminal) {
        logTerminal.textContent = `[SYS_LOG] Active Node: ${note} (${NOTE_FREQUENCIES[note]} Hz)`;
    }

    for (let i = 0; i <= 7; i++) {
        const hole = document.getElementById(`hole${i}`);
        if (hole) {
            hole.setAttribute('fill', '#1e293b');
            hole.setAttribute('stroke', '#64748b');
        }
    }

    activeFingers.forEach(holeId => {
        const hole = document.getElementById(`hole${holeId}`);
        if (hole) {
            hole.setAttribute('fill', '#d946ef');
            hole.setAttribute('stroke', '#f472b6');
        }
    });
}
