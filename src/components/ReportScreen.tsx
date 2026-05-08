import { useSoalStore } from "../store/useSoalStore";
import { invoke } from "@tauri-apps/api/core";

export default function ReportScreen({ onUlangi }: { onUlangi: () => void }) {
  const { totalDijawab, skorBenar, skorSalah, totalSkorTKP, logSalah } = useSoalStore();

  const handleKeluarTotal = async () => {
    try { await invoke('matikan_aplikasi'); } catch (e) { console.error("Gagal keluar:", e); }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-4 border-[8px] border-brutal-black bg-brutal-bg selection:bg-brutal-pink overflow-hidden">
      
      <div className="bg-white border-4 border-brutal-black p-5 shadow-[8px_8px_0_0_#1e1e1e] max-w-md w-full flex flex-col max-h-[95%]">
        
        <div className="text-center shrink-0">
          <h1 className="text-2xl font-black mb-1 uppercase tracking-tighter">Sesi Berakhir!</h1>
          <p className="font-bold mb-4 text-gray-600 text-sm">Rangkuman latihanmu hari ini:</p>
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-center shrink-0 mb-4">
          <div className="bg-gray-200 border-2 border-brutal-black py-2 flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase">Total Soal</span>
            <span className="font-black text-lg">{totalDijawab}</span>
          </div>
          <div className="bg-brutal-blue text-white border-2 border-brutal-black py-2 flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase">TWK/TIU Benar</span>
            <span className="font-black text-lg">{skorBenar}</span>
          </div>
          <div className="bg-brutal-pink text-brutal-black border-2 border-brutal-black py-2 flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase">TWK/TIU Salah</span>
            <span className="font-black text-lg">{skorSalah}</span>
          </div>
          <div className="bg-brutal-yellow text-brutal-black border-2 border-brutal-black py-2 flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase">Poin TKP</span>
            <span className="font-black text-lg">{totalSkorTKP}</span>
          </div>
        </div>

        {logSalah.length > 0 && (
          <div className="flex-1 overflow-y-auto border-t-4 border-b-4 border-dashed border-brutal-black py-3 mb-4 bg-gray-50 px-2 relative">
            <h3 className="font-black text-sm uppercase mb-3 text-brutal-pink sticky top-0 bg-gray-50 p-1 border-2 border-brutal-black text-center z-10 shadow-sm">
              ⚠️ Log Kesalahan (Nilai Belum Maksimal)
            </h3>
            
            <div className="flex flex-col gap-3">
              {logSalah.map((soal, idx) => {
                const isTKP = soal.kategori.toUpperCase().includes('TKP');
                return (
                  <div key={idx} className="bg-white p-3 border-2 border-brutal-black relative">
                    <span className="absolute -top-2 -left-2 bg-brutal-yellow text-brutal-black text-xs font-black px-1 border-2 border-brutal-black shadow-sm">#{idx + 1} | {soal.kategori}</span>
                    <p className="font-bold text-xs mb-2 leading-relaxed mt-2">{soal.pertanyaan}</p>
                    <div className="bg-brutal-blue/10 p-2 border-2 border-brutal-black text-xs">
                      {isTKP ? (
                         <span className="font-bold block mb-1">
                           Jawaban 5 Poin: <span className="font-black text-brutal-blue text-sm">{soal.jawaban_benar}</span>
                         </span>
                      ) : (
                        <>
                          <span className="font-bold text-brutal-blue block mb-1">Jawaban Benar:</span>
                          <span className="font-medium bg-white px-1 border border-gray-300">{soal.jawaban_benar}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {totalDijawab > 0 && logSalah.length === 0 && (
          <div className="flex-1 flex items-center justify-center mb-4">
             <p className="font-black text-brutal-blue text-center uppercase border-4 border-brutal-blue p-4">🎉 Sempurna! Kamu pantas lulus.</p>
          </div>
        )}

        <div className="flex flex-col gap-2 shrink-0">
          <button onClick={onUlangi} className="w-full bg-brutal-yellow text-brutal-black font-black py-3 border-4 border-brutal-black hover:bg-white shadow-[4px_4px_0_0_#1e1e1e] transition-all text-sm uppercase tracking-widest">🔄 Pengaturan Ulang</button>
          <button onClick={handleKeluarTotal} className="w-full bg-brutal-black text-white font-black py-3 border-4 border-brutal-black hover:bg-brutal-pink hover:text-brutal-black shadow-[4px_4px_0_0_#1e1e1e] transition-all text-sm uppercase tracking-widest">MATIKAN APLIKASI 💀</button>
        </div>

      </div>
    </div>
  );
}