import { useRef, useState, useEffect } from "react";
import { useSoalStore } from "../store/useSoalStore";
import { invoke } from "@tauri-apps/api/core";
import dataSoalBawaan from "../data/soal.json";

export default function SettingScreen({ onMulai }: { onMulai: () => void }) {
  const { 
    waktuMuncul, setWaktuMuncul, 
    kategoriAktif, setKategoriAktif, 
    importSoalBaru, customSoal 
  } = useSoalStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customMenit, setCustomMenit] = useState(15); 

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
          alert(`✅ BERHASIL! ${dataBaru.length} soal baru ditambahkan.`);
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
        
        <div className="bg-brutal-yellow p-3 border-4 border-brutal-black text-center relative">
          <h1 className="text-3xl font-black uppercase tracking-tight">PaksaPintar CPNS</h1>
        </div>

        <div className="flex items-center justify-between bg-gray-100 border-4 border-brutal-black p-2">
          <div className="flex gap-2 text-xs font-black uppercase">
            <span className="bg-brutal-pink border-2 border-brutal-black px-2 py-1" title="TWK">T:{countTWK}</span>
            <span className="bg-brutal-blue text-white border-2 border-brutal-black px-2 py-1" title="TIU">I:{countTIU}</span>
            <span className="bg-brutal-yellow border-2 border-brutal-black px-2 py-1" title="TKP">K:{countTKP}</span>
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-brutal-black text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 border-2 border-transparent hover:bg-white hover:text-brutal-black hover:border-brutal-black transition-colors"
          >
            + Import JSON
          </button>
          <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
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
          {/* Tombol Keluar (Baru) */}
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
    </div>
  );
}
