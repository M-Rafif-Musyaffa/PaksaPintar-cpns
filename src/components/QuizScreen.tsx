import { useEffect, useState } from "react";
import { useSoalStore } from "../store/useSoalStore";
import { invoke } from "@tauri-apps/api/core";

export default function QuizScreen() {
  const { currentSoal, unseenPool, waktuMuncul, getNextSoal, clearCache, tambahSkor } = useSoalStore();
  
  const [jawabanTerpilih, setJawabanTerpilih] = useState<string | null>(null);
  const [waktuTutup, setWaktuTutup] = useState<number | null>(null);
  
  // Cooldown Hukuman Tombol Tutup
  const [cooldown, setCooldown] = useState<number>(0);

  // Timer auto-close secara keseluruhan
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (waktuTutup !== null && waktuTutup > 0) {
      timer = setTimeout(() => setWaktuTutup(waktuTutup - 1), 1000);
    } else if (waktuTutup === 0) {
      handleSembunyikan(); 
    }
    return () => clearTimeout(timer);
  }, [waktuTutup]);

  // Timer khusus untuk hukuman tombol Tutup 
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleJawab = (opsi: string) => {
    if (!currentSoal) return;
    
    const hurufJawaban = opsi.charAt(0);
    const isBenar = hurufJawaban === currentSoal.jawaban_benar;
    
    setJawabanTerpilih(hurufJawaban);
    tambahSkor(isBenar, currentSoal); 
    
    // PENERAPAN HUKUMAN BRUTAL!
    if (isBenar) {
      setWaktuTutup(5);
      setCooldown(0);  
    } else {
      setWaktuTutup(10);
      setCooldown(10); 
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
      
      setTimeout(async () => {
        await invoke('munculkan_jendela');
      }, waktuMuncul);
    } catch (err) { console.error(err); }
  };

  if (!currentSoal) return <div className="p-10 font-bold bg-brutal-bg h-screen w-screen flex items-center justify-center">Memuat soal...</div>;
  const isBenar = jawabanTerpilih === currentSoal.jawaban_benar;

  return (
    <div className="h-screen w-screen flex flex-col p-4 md:p-6 border-[8px] border-brutal-black bg-brutal-bg selection:bg-brutal-pink overflow-hidden">
      <div className="shrink-0 w-full flex justify-between font-bold border-4 border-brutal-black bg-brutal-yellow p-3 mb-4 shadow-brutal-sm">
        <span className="uppercase tracking-widest text-sm">🔥 {currentSoal.kategori}</span>
        <span className="uppercase tracking-widest text-sm">Sisa: {unseenPool.length}</span>
      </div>

      <div className="flex-1 bg-white border-4 border-brutal-black p-5 shadow-brutal flex flex-col relative overflow-y-auto">
        <h2 className="text-xl font-black mb-3 uppercase tracking-tight">Soal Muncul!</h2>
        <p className="text-lg font-medium mb-6 leading-relaxed break-words whitespace-pre-wrap">
          {currentSoal.pertanyaan}
        </p>
        
        <div className="flex flex-col gap-3 pb-32">
          {currentSoal.pilihan.map((opsi, i) => {
            const hurufOpsi = opsi.charAt(0);
            const isTerpilih = jawabanTerpilih === hurufOpsi;
            let bgClass = "bg-brutal-bg";
            if (jawabanTerpilih) {
              if (hurufOpsi === currentSoal.jawaban_benar) bgClass = "bg-brutal-blue text-white"; 
              else if (isTerpilih && !isBenar) bgClass = "bg-brutal-pink text-brutal-black";
            }
            return (
              <button 
                key={i}
                disabled={jawabanTerpilih !== null}
                onClick={() => handleJawab(opsi)}
                className={`text-left text-base font-bold border-4 border-brutal-black px-4 py-3 transition-all break-words ${jawabanTerpilih === null ? 'hover:bg-brutal-yellow hover:-translate-y-1 hover:shadow-brutal' : 'opacity-90'} ${bgClass}`}
              >
                {opsi}
              </button>
            )
          })}
        </div>

        {jawabanTerpilih && (
          <div className="fixed inset-x-4 md:inset-x-6 bottom-4 md:bottom-6 border-4 border-brutal-black bg-brutal-bg p-4 shadow-brutal z-30 animate-[slideUp_0.3s_ease-out]">
            <h3 className="font-black text-lg mb-2 flex items-center justify-between uppercase tracking-widest">
              <span>{isBenar ? '✅ TEPAT!' : '💀 SALAH!'}</span>
              <span className="text-brutal-pink bg-brutal-black px-2 py-1 text-xs">Otomatis Tutup: {waktuTutup}s</span>
            </h3>
            
            <div className="max-h-24 overflow-y-auto mb-3 pr-2 border-l-4 border-brutal-black pl-2">
              {/* Tampilkan teks hukuman jika salah */}
              {!isBenar && <p className="text-brutal-pink font-black text-xs mb-1 uppercase tracking-widest">HUKUMAN: BACA PEMBAHASAN INI!</p>}
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