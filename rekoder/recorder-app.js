// ==========================================
// SASATECH SONIC RESONANCE ENGINE (REKODER)
// V3.5 - FULL MECHANICAL AUDIO MATRIX
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

// Fallback untuk butang lama yang masih menggunakan 'playRecorderNote'
function playRecorderNote(note) {
    startRecorderNote(note);
    setTimeout(() => { stopRecorderNote(note); }, 400);
}

// ------------------------------------------
// LOGIK LATIHAN LAGU: ULIK MAYANG (BAB 5)
// ------------------------------------------
const SONG_SEQUENCE_5 = ['E', 'E', 'E', 'E', 'E', 'F', 'G', 'F', 'A', 'G', 'F', 'E', 'D', 'D', 'E', 'F', 'D', 'E'];
let currentSongIndex5 = 0;

function playSongNote5(note) {
    // Tukar kod huruf ringkas kepada kod nota sistem audio
    let targetNote = note;
    if (note === 'F') targetNote = 'F_BAROK';
    if (note === 'D') targetNote = 'D_LOW';
    if (note === 'E') targetNote = 'E_LOW';

    // Mula bunyikan nota
    startRecorderNote(targetNote);
    
    // Semak turutan melodi lagu
    const expectedNote = SONG_SEQUENCE_5[currentSongIndex5];
    const songTerminal = document.getElementById('song-terminal-5');
    
    if (note === expectedNote) {
        // Tukar warna kotak aliran nota menjadi hijau (emerald)
        const stepElem = document.getElementById(`step5-${currentSongIndex5}`);
        if (stepElem) {
            stepElem.className = "bg-emerald-500 text-black font-bold px-2 py-1 rounded border border-emerald-400 font-mono text-center text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.3)]";
        }
        
        currentSongIndex5++;
        if (songTerminal) songTerminal.textContent = `[ULIK_TRACKER] Match found: Node ${note}. Holding blow...`;
        
        // Jika tamat lagu sepenuhnya
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

// Simulasi grafik rekoder SVG (Kekalkan fungsi ini mengikut versi asal anda)
function updateFingeringChart(note) {
    const activeFingers = FINGER_POSITIONS[note] || [];
    const logTerminal = document.getElementById('recorder-terminal');
    
    if (logTerminal) {
        logTerminal.textContent = `[SYS_LOG] Active Node: ${note} (${NOTE_FREQUENCIES[note]} Hz)`;
    }

    // Set semula semua warna lubang kepada kosong (slate)
    for (let i = 0; i <= 7; i++) {
        const hole = document.getElementById(`hole${i}`);
        if (hole) {
            hole.setAttribute('fill', '#1e293b');
            hole.setAttribute('stroke', '#64748b');
        }
    }

    // Warnakan lubang yang ditutup dengan warna neon (fuchsia/purple)
    activeFingers.forEach(holeId => {
        const hole = document.getElementById(`hole${holeId}`);
        if (hole) {
            hole.setAttribute('fill', '#d946ef');
            hole.setAttribute('stroke', '#f472b6');
        }
    });
}
