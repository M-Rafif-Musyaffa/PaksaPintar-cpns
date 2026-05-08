import { useEffect, useState } from "react";
import { useSoalStore } from "../store/useSoalStore";
import { invoke } from "@tauri-apps/api/core";

export default function QuizScreen() {
  const { currentSoal, unseenPool, waktuMuncul, getNextSoal, clearCache, tambahSkor } = useSoalStore();
  
  const [jawabanTerpilih, setJawabanTerpilih] = useState<string | null>(null);
  const [waktuTutup, setWaktuTutup] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (waktuTutup !== null && waktuTutup > 0) timer = setTimeout(() => setWaktuTutup(waktuTutup - 1), 1000);
    else if (waktuTutup === 0) handleSembunyikan(); 
    return () => clearTimeout(timer);
  }, [waktuTutup]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleJawab = (opsi: string) => {
    if (!currentSoal) return;
    
    const hurufJawaban = opsi.charAt(0);
    const isTKP = currentSoal.kategori.toUpperCase().includes('TKP');
    
    tambahSkor(hurufJawaban, currentSoal); 
    setJawabanTerpilih(hurufJawaban);
    
    let isMaxScore = false;
    
    if (isTKP) {
      const skor = currentSoal.skor_tkp ? (currentSoal.skor_tkp[hurufJawaban] || 1) : (hurufJawaban === currentSoal.jawaban_benar ? 5 : 0);
      isMaxScore = skor === 5;
    } else {
      isMaxScore = hurufJawaban === currentSoal.jawaban_benar;
    }
    
    if (isMaxScore) {
      setWaktuTutup(5); 
      setCooldown(0);   
    } else {
      setWaktuTutup(15); 
      setCooldown(15);   
    }
  };

  const handleSembunyikan = async () => {
    if (cooldown > 0) return; 

    setWaktuTutup(null); 
    try {
      await invoke('sembunyikan_jendela');
      setTimeout(() => {
        setJawabanTerpilih(null);
        getNextSoal(); 
        clearCache(); 
      }, 300); 
      
      setTimeout(async () => { await invoke('munculkan_jendela'); }, waktuMuncul);
    } catch (err) { console.error(err); }
  };

  // FITUR BARU: JEDA DARURAT 1 JAM
  const handleJedaDarurat = async () => {
    // Tombol tidak berfungsi jika sedang dihukum
    if (jawabanTerpilih !== null) return;

    try {
      await invoke('sembunyikan_jendela');
      // Kita TIDAK memanggil getNextSoal() agar soal yang sama muncul lagi nanti
      
      const SATU_JAM_MS = 3600000; // 1 Jam dalam milidetik
      setTimeout(async () => { 
        await invoke('munculkan_jendela'); 
      }, SATU_JAM_MS);

    } catch (err) { console.error(err); }
  };

  if (!currentSoal) return <div className="p-10 font-bold bg-brutal-bg h-screen w-screen flex items-center justify-center">Memuat soal...</div>;

  const isTKP = currentSoal.kategori.toUpperCase().includes('TKP');

  let judulFeedback = "";
  let poinDidapat = 0;
  if (jawabanTerpilih) {
    if (isTKP) {
      poinDidapat = currentSoal.skor_tkp ? (currentSoal.skor_tkp[jawabanTerpilih] || 1) : (jawabanTerpilih === currentSoal.jawaban_benar ? 5 : 0);
      judulFeedback = poinDidapat === 5 ? `✅ TERBAIK! (+5 Poin)` : `⚠️ KURANG TEPAT (+${poinDidapat} Poin)`;
    } else {
      judulFeedback = jawabanTerpilih === currentSoal.jawaban_benar ? '✅ TEPAT!' : '💀 SALAH!';
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col p-4 md:p-6 border-[8px] border-brutal-black bg-brutal-bg selection:bg-brutal-pink overflow-hidden relative">
      
      <div className="shrink-0 w-full flex justify-between items-center font-bold border-4 border-brutal-black bg-brutal-yellow p-3 mb-4 shadow-[4px_4px_0_0_#1e1e1e]">
        <span className="uppercase tracking-widest text-sm flex items-center gap-2">
          🔥 {currentSoal.kategori}
          {isTKP && <span className="bg-brutal-black text-white text-[10px] px-2 py-0.5">SKALA 1-5</span>}
        </span>
        
        <div className="flex gap-3 items-center">
          {/* TOMBOL JEDA DARURAT */}
          <button 
            onClick={handleJedaDarurat}
            disabled={jawabanTerpilih !== null}
            title="Sembunyikan seketika selama 1 Jam jika sedang presentasi/rapat!"
            className={`text-[10px] uppercase font-black px-2 py-1 border-2 border-brutal-black transition-all shadow-[2px_2px_0_0_#1e1e1e]
              ${jawabanTerpilih !== null 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none translate-y-[2px] translate-x-[2px]' 
                : 'bg-white text-brutal-black hover:bg-brutal-pink active:translate-y-[2px] active:translate-x-[2px] active:shadow-none'
              }
            `}
          >
            💤 Mode Senyap
          </button>

          <span className="uppercase tracking-widest text-sm">Sisa: {unseenPool.length}</span>
        </div>
      </div>

      <div className="flex-1 bg-white border-4 border-brutal-black p-5 shadow-[8px_8px_0_0_#1e1e1e] flex flex-col relative overflow-y-auto">
        <h2 className="text-xl font-black mb-3 uppercase tracking-tight">Soal Muncul!</h2>
        <p className="text-lg font-medium mb-6 leading-relaxed break-words whitespace-pre-wrap">
          {currentSoal.pertanyaan}
        </p>
        
        <div className="flex flex-col gap-3 pb-36">
          {currentSoal.pilihan.map((opsi, i) => {
            const hurufOpsi = opsi.charAt(0);
            const isTerpilih = jawabanTerpilih === hurufOpsi;
            
            let bgClass = "bg-brutal-bg";
            let labelPoin = "";

            if (jawabanTerpilih) {
              if (isTKP) {
                const poinOpsiIni = currentSoal.skor_tkp ? (currentSoal.skor_tkp[hurufOpsi] || 1) : (hurufOpsi === currentSoal.jawaban_benar ? 5 : 0);
                labelPoin = `[${poinOpsiIni} Poin] `;
                
                if (poinOpsiIni === 5) bgClass = "bg-brutal-blue text-white"; 
                else if (isTerpilih && poinOpsiIni < 5) bgClass = "bg-brutal-pink text-brutal-black border-dashed"; 
                else bgClass = "bg-gray-100 text-gray-500 opacity-60"; 
              } else {
                if (hurufOpsi === currentSoal.jawaban_benar) bgClass = "bg-brutal-blue text-white"; 
                else if (isTerpilih && hurufOpsi !== currentSoal.jawaban_benar) bgClass = "bg-brutal-pink text-brutal-black";
                else bgClass = "bg-gray-100 text-gray-500 opacity-60";
              }
            }

            return (
              <button 
                key={i}
                disabled={jawabanTerpilih !== null}
                onClick={() => handleJawab(opsi)}
                className={`text-left text-base font-bold border-4 border-brutal-black px-4 py-3 transition-all break-words relative
                  ${jawabanTerpilih === null ? 'hover:bg-brutal-yellow hover:-translate-y-1 shadow-[4px_4px_0_0_#1e1e1e] active:translate-y-0 active:shadow-none' : ''} 
                  ${bgClass}
                `}
              >
                {jawabanTerpilih && isTKP && (
                  <span className="font-black bg-white text-brutal-black border-2 border-brutal-black px-2 mr-2 text-xs">
                    {labelPoin}
                  </span>
                )}
                {opsi}
              </button>
            )
          })}
        </div>

        {jawabanTerpilih && (
          <div className="absolute inset-x-4 bottom-4 border-4 border-brutal-black bg-brutal-bg p-4 shadow-[8px_8px_0_0_#1e1e1e] z-30 animate-[slideUp_0.3s_ease-out]">
            <h3 className="font-black text-lg mb-2 flex items-center justify-between uppercase tracking-widest">
              <span>{judulFeedback}</span>
              <span className="text-brutal-pink bg-brutal-black px-2 py-1 text-xs">Otomatis Tutup: {waktuTutup}s</span>
            </h3>
            
            <div className="max-h-24 overflow-y-auto mb-3 pr-2 border-l-4 border-brutal-black pl-2">
              {cooldown > 0 && <p className="text-brutal-pink font-black text-xs mb-1 uppercase tracking-widest">HUKUMAN: BACA PEMBAHASAN INI!</p>}
              <p className="text-sm font-medium">{currentSoal.pembahasan}</p>
            </div>
            
            <button 
              onClick={handleSembunyikan}
              disabled={cooldown > 0} 
              className={`w-full text-white text-base tracking-widest font-black py-2 border-4 border-brutal-black transition-colors 
                ${cooldown > 0 ? 'bg-gray-400 cursor-not-allowed opacity-90' : 'bg-brutal-black hover:bg-brutal-yellow hover:text-brutal-black'}
              `}
            >
              {cooldown > 0 ? `Terkunci... BACA! (${cooldown}s)` : 'TUTUP SEKARANG'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}