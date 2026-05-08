import { useRef, useState, useEffect } from "react";
import { useSoalStore } from "../store/useSoalStore";
import { invoke } from "@tauri-apps/api/core";
import dataSoalBawaan from "../data/soal.json";

export default function SettingScreen({ onMulai }: { onMulai: () => void }) {
  const { 
    waktuMuncul, setWaktuMuncul, 
    kategoriAktif, setKategoriAktif, 
    importSoalBaru, customSoal,
    hapusSoalCustom, hapusSemuaSoalCustom, hapusSoalCustomByKategori 
  } = useSoalStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customMenit, setCustomMenit] = useState(15); 
  const [showKelola, setShowKelola] = useState(false);

  const allSoal = [...dataSoalBawaan, ...customSoal];
  const countTWK = allSoal.filter(s => s.kategori.toUpperCase().includes('TWK')).length;
  const countTIU = allSoal.filter(s => s.kategori.toUpperCase().includes('TIU')).length;
  const countTKP = allSoal.filter(s => s.kategori.toUpperCase().includes('TKP')).length;

  useEffect(() => {
    const presetValues = [10000, 60000, 3600000, 18000000];
    if (!presetValues.includes(waktuMuncul)) {
      setIsCustomMode(true);
      setCustomMenit(Math.max(1, Math.floor(waktuMuncul / 60000))); 
    }
  }, [waktuMuncul]);

  const handleMulai = async () => {
    if (waktuMuncul < 1000) {
      alert("💀 Waktu terlalu singkat! Minimal 1 detik.");
      return;
    }
    onMulai(); 
    try {
      await invoke('sembunyikan_jendela');
      setTimeout(async () => {
        await invoke('munculkan_jendela');
      }, waktuMuncul);
    } catch (err) { console.error(err); }
  };

  // FUNGSI UNTUK MEMATIKAN APLIKASI SEPENUHNYA
  const handleKeluar = async () => {
    try {
      await invoke('matikan_aplikasi');
    } catch (err) { 
      console.error(err); 
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonTeks = event.target?.result as string;
        const dataBaru = JSON.parse(jsonTeks);
        
        if (Array.isArray(dataBaru) && dataBaru.length > 0 && dataBaru[0].pertanyaan) {       
          importSoalBaru(dataBaru);
          setTimeout(() => {
            alert(`✅ PROSES SELESAI!\nSistem memfilter soal duplikat secara otomatis. Cek jumlah total soalmu sekarang.`);
          }, 100);
        } else {
          alert("💀 GAGAL! Format JSON salah.");
        }
      } catch (err) { alert("💀 ERROR! File JSON rusak."); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePilihWaktu = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomMode(true);
      setWaktuMuncul(customMenit * 60 * 1000); 
    } else {
      setIsCustomMode(false);
      setWaktuMuncul(Number(val));
    }
  };

  const handleUbahCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (val < 1) val = 1; 
    setCustomMenit(val);
    setWaktuMuncul(val * 60 * 1000); 
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-4 border-[8px] border-brutal-black bg-brutal-bg selection:bg-brutal-pink">
      
      <div className="bg-white border-4 border-brutal-black p-6 shadow-[8px_8px_0_0_#1e1e1e] max-w-md w-full flex flex-col gap-6">
        
        <div className="bg-brutal-yellow p-3 border-4 border-brutal-black text-center relative shadow-sm">
          <h1 className="text-3xl font-black uppercase tracking-tight">PAKSAPINTAR Cpns</h1>
        </div>

        <div className="border-4 border-brutal-black bg-gray-50 p-3 flex flex-col gap-3">
          <h3 className="font-black text-xs text-center uppercase border-b-2 border-brutal-black pb-2 tracking-widest text-gray-700">📊 Statistik Bank Soal</h3>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-brutal-pink border-2 border-brutal-black py-1.5 flex flex-col">
              <span className="text-[10px] font-bold uppercase">TWK</span>
              <span className="font-black text-lg">{countTWK}</span>
            </div>
            <div className="bg-brutal-blue text-white border-2 border-brutal-black py-1.5 flex flex-col">
              <span className="text-[10px] font-bold uppercase">TIU</span>
              <span className="font-black text-lg">{countTIU}</span>
            </div>
            <div className="bg-brutal-yellow border-2 border-brutal-black py-1.5 flex flex-col">
              <span className="text-[10px] font-bold uppercase">TKP</span>
              <span className="font-black text-lg">{countTKP}</span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-1">
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-brutal-black text-white text-xs font-black uppercase py-2 border-2 border-transparent hover:bg-brutal-pink hover:text-brutal-black transition-colors shadow-sm active:translate-y-0.5">
              + Import JSON
            </button>
            <button onClick={() => setShowKelola(true)} className="flex-1 bg-white text-brutal-black text-xs font-black uppercase py-2 border-2 border-brutal-black hover:bg-gray-200 transition-colors shadow-[2px_2px_0_0_#1e1e1e] active:translate-y-0.5 active:shadow-none">
              ⚙️ Kelola ({customSoal.length})
            </button>
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-bold block mb-1 text-xs uppercase tracking-wider">⏱️ Interval Muncul:</label>
            <select 
              className="w-full border-4 border-brutal-black p-2 bg-brutal-bg font-bold cursor-pointer hover:bg-brutal-pink transition-colors focus:outline-none focus:ring-4 focus:ring-brutal-black text-sm" 
              value={isCustomMode ? 'custom' : waktuMuncul} 
              onChange={handlePilihWaktu}
            >
              <option value={10000}>10 Detik</option>
              <option value={30000}>30 Detik</option>
              <option value={60000}>1 Menit</option>
              <option value={3600000}>1 Jam</option>
              <option value={18000000}>5 Jam</option>
              <option value="custom">⚙️ Custom...</option>
            </select>
          </div>

          <div>
            <label className="font-bold block mb-1 text-xs uppercase tracking-wider">🎯 Kategori:</label>
            <select 
              className="w-full border-4 border-brutal-black p-2 bg-brutal-bg font-bold cursor-pointer hover:bg-brutal-blue hover:text-white transition-colors focus:outline-none focus:ring-4 focus:ring-brutal-black text-sm" 
              value={kategoriAktif} 
              onChange={(e) => setKategoriAktif(e.target.value)}
            >
              <option value="SEMUA">Acak (Semua)</option>
              <option value="TIU">Hanya TIU</option>
              <option value="TWK">Hanya TWK</option>
              <option value="TKP">Hanya TKP</option>
            </select>
          </div>
        </div>

        {isCustomMode && (
          <div className="flex items-stretch gap-2 animate-[slideDown_0.2s_ease-out]">
            <input 
              type="number" 
              min="1"
              value={customMenit}
              onChange={handleUbahCustom}
              className="w-full border-4 border-brutal-black p-2 text-xl text-center font-black focus:outline-none focus:ring-4 focus:ring-brutal-pink selection:bg-brutal-pink"
              placeholder="15"
            />
            <div className="bg-brutal-black text-white font-black px-4 flex items-center justify-center border-4 border-brutal-black tracking-widest uppercase text-xs">
              Menit
            </div>
          </div>
        )}
        
        {/* AREA TOMBOL BAWAH */}
        <div className="flex gap-3 mt-2">
          {/* Tombol Keluar*/}
          <button 
            onClick={handleKeluar}
            className="bg-brutal-pink text-brutal-black font-black px-5 py-4 border-4 border-brutal-black hover:bg-white shadow-[4px_4px_0_0_#1e1e1e] transition-all hover:translate-x-1 hover:-translate-y-1 text-xl"
            title="Keluar dari Aplikasi"
          >
            ❌
          </button>
          
          {/* Tombol Mulai */}
          <button 
            onClick={handleMulai} 
            className="flex-1 bg-brutal-black text-white font-black py-4 border-4 border-brutal-black hover:bg-brutal-yellow hover:text-brutal-black hover:translate-x-1 hover:-translate-y-1 shadow-[4px_4px_0_0_#1e1e1e] transition-all tracking-widest text-lg uppercase"
          >
            🔥 Mulai Standby
          </button>
        </div>

      </div>
      {/* MODAL KELOLA SOAL*/}
      {showKelola && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white border-[6px] border-brutal-black w-full max-w-lg h-[85vh] flex flex-col shadow-[8px_8px_0_0_#1e1e1e]">
            
            <div className="bg-brutal-yellow border-b-4 border-brutal-black p-4 flex justify-between items-center shrink-0">
              <h2 className="font-black text-lg uppercase tracking-tighter">⚙️ Kelola Soal Import</h2>
              <button onClick={() => setShowKelola(false)} className="font-black text-2xl hover:text-brutal-pink transition-colors">❌</button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 bg-gray-50">
              
              {/* TOMBOL HAPUS BERDASARKAN KATEGORI */}
              {customSoal.length > 0 && (
                <div className="mb-2 border-b-4 border-dashed border-gray-300 pb-4">
                  <p className="font-bold text-xs mb-2 uppercase text-gray-500 tracking-widest">Aksi Cepat (Hapus Kategori):</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button onClick={() => window.confirm('Hapus SEMUA soal custom TWK?') && hapusSoalCustomByKategori('TWK')} className="bg-brutal-pink text-brutal-black text-xs font-black px-3 py-2 border-2 border-brutal-black shadow-[2px_2px_0_0_#1e1e1e] active:shadow-none active:translate-y-0.5 whitespace-nowrap">🗑️ Hapus TWK</button>
                    <button onClick={() => window.confirm('Hapus SEMUA soal custom TIU?') && hapusSoalCustomByKategori('TIU')} className="bg-brutal-blue text-white text-xs font-black px-3 py-2 border-2 border-brutal-black shadow-[2px_2px_0_0_#1e1e1e] active:shadow-none active:translate-y-0.5 whitespace-nowrap">🗑️ Hapus TIU</button>
                    <button onClick={() => window.confirm('Hapus SEMUA soal custom TKP?') && hapusSoalCustomByKategori('TKP')} className="bg-brutal-yellow text-brutal-black text-xs font-black px-3 py-2 border-2 border-brutal-black shadow-[2px_2px_0_0_#1e1e1e] active:shadow-none active:translate-y-0.5 whitespace-nowrap">🗑️ Hapus TKP</button>
                  </div>
                </div>
              )}

              {customSoal.length === 0 ? (
                <div className="text-center font-bold text-gray-500 py-10 border-4 border-dashed border-gray-300">Belum ada soal tambahan yang di-import.</div>
              ) : (
                customSoal.map((soal, idx) => (
                  <div key={idx} className="bg-white border-4 border-brutal-black p-3 relative group">
                    <span className="absolute -top-3 -left-3 bg-brutal-blue text-white text-xs font-black px-2 py-1 border-2 border-brutal-black shadow-sm">#{idx + 1} | {soal.kategori}</span>
                    <p className="font-bold text-sm mt-3 line-clamp-3 text-gray-800">{soal.pertanyaan}</p>
                    
                    <div className="mt-3 text-right border-t-2 border-dashed border-gray-300 pt-2">
                      <button onClick={() => window.confirm('Hapus soal ini?') && hapusSoalCustom(idx)} className="bg-brutal-pink text-brutal-black font-black text-xs px-3 py-1.5 border-2 border-brutal-black shadow-[2px_2px_0_0_#1e1e1e] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all">
                        🗑️ Hapus Satuan
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* HAPUS SEMUANYA */}
            {customSoal.length > 0 && (
              <div className="p-4 border-t-4 border-brutal-black bg-white shrink-0">
                <button onClick={() => window.confirm('⚠️ PERINGATAN: Yakin ingin menghapus SEMUA soal import secara total?') && hapusSemuaSoalCustom()} className="w-full bg-brutal-black text-white font-black py-3 border-4 border-brutal-black hover:bg-brutal-pink hover:text-brutal-black transition-colors uppercase tracking-widest text-sm">
                  ⚠️ Hapus Semua Soal
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
