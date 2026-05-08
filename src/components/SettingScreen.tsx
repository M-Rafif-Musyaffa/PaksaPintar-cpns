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
    if (waktuMuncul < 1000) { alert("💀 Waktu terlalu singkat!"); return; }
    onMulai(); 
    try {
      await invoke('sembunyikan_jendela');
      setTimeout(async () => { await invoke('munculkan_jendela'); }, waktuMuncul);
    } catch (err) { console.error(err); }
  };

  const handleKeluar = async () => {
    try { await invoke('matikan_aplikasi'); } catch (err) { console.error(err); }
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
          setTimeout(() => alert(`✅ BERHASIL!\nSoal ditambahkan (duplikat diabaikan otomatis).`), 100);
        } else { alert("💀 GAGAL! Format JSON salah."); }
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
    <div className="h-screen w-screen flex flex-col items-center justify-center p-3 bg-brutal-bg selection:bg-brutal-pink overflow-hidden">
      
      {/* KOTAK UTAMA (Diperkecil max-w-md, padding dikurangi) */}
      <div className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_0_#1e1e1e] max-w-md w-full flex flex-col relative z-10 animate-[fadeIn_0.3s_ease-out] max-h-full overflow-y-auto">
        
        {/* 1. HEADER (Lebih ringkas) */}
        <div className="bg-brutal-yellow p-3 border-b-4 border-brutal-black text-center relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>
          <h1 className="text-3xl font-black uppercase tracking-tighter drop-shadow-sm relative z-10">PAKSAPINTAR 💀</h1>
          <p className="font-black text-[10px] tracking-[0.1em] uppercase text-brutal-black relative z-10">Teror Belajar CPNS Desktop</p>
        </div>

        <div className="p-4 flex flex-col gap-4">
          
          {/* 2. BLOK DATABASE SOAL (Dibuat Compact) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end mb-1">
              <h2 className="font-black text-xs uppercase tracking-widest text-gray-800">🗃️ Bank Soal Aktif</h2>
              <span className="font-black text-[9px] bg-brutal-black text-white px-2 py-1 uppercase tracking-widest">Total: {allSoal.length}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-brutal-pink border-2 border-brutal-black py-1.5 shadow-[2px_2px_0_0_#1e1e1e] hover:-translate-y-0.5 transition-transform">
                <span className="text-[9px] font-black uppercase block text-gray-800">TWK</span>
                <span className="font-black text-lg">{countTWK}</span>
              </div>
              <div className="bg-white border-2 border-brutal-black py-1.5 shadow-[2px_2px_0_0_#1e1e1e] hover:-translate-y-0.5 transition-transform">
                <span className="text-[9px] font-black uppercase block text-brutal-blue">TIU</span>
                <span className="font-black text-lg text-brutal-blue">{countTIU}</span>
              </div>
              <div className="bg-brutal-yellow border-2 border-brutal-black py-1.5 shadow-[2px_2px_0_0_#1e1e1e] hover:-translate-y-0.5 transition-transform">
                <span className="text-[9px] font-black uppercase block text-gray-800">TKP</span>
                <span className="font-black text-lg">{countTKP}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-1">
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-brutal-black text-white text-[11px] font-black uppercase py-2 border-2 border-brutal-black hover:bg-brutal-pink hover:text-brutal-black transition-colors shadow-[2px_2px_0_0_#1e1e1e] active:translate-y-0.5 active:shadow-none">
                + Import JSON
              </button>
              <button onClick={() => setShowKelola(true)} className="flex-1 bg-white text-brutal-black text-[11px] font-black uppercase py-2 border-2 border-brutal-black hover:bg-gray-200 transition-colors shadow-[2px_2px_0_0_#1e1e1e] active:translate-y-0.5 active:shadow-none">
                ⚙️ Kelola ({customSoal.length})
              </button>
              <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            </div>
          </div>

          {/* 3. BLOK KONFIGURASI TEROR */}
          <div className="bg-brutal-blue text-white p-3 border-4 border-brutal-black shadow-[4px_4px_0_0_#1e1e1e] flex flex-col gap-3 relative">
            <h2 className="font-black text-xs uppercase tracking-widest border-b-2 border-brutal-black pb-1 mb-1 text-brutal-yellow">⚙️ Konfigurasi Teror</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-black block mb-1 text-[9px] uppercase tracking-widest">⏱️ Interval Muncul:</label>
                <select className="w-full border-2 border-brutal-black p-1.5 bg-white text-brutal-black font-black cursor-pointer hover:bg-gray-200 focus:outline-none text-xs" value={isCustomMode ? 'custom' : waktuMuncul} onChange={handlePilihWaktu}>
                  <option value={10000}>10 Detik</option>
                  <option value={30000}>30 Detik</option>
                  <option value={60000}>1 Menit</option>
                  <option value={3600000}>1 Jam</option>
                  <option value={18000000}>5 Jam</option>
                  <option value="custom">⚙️ Custom...</option>
                </select>
              </div>
              <div>
                <label className="font-black block mb-1 text-[9px] uppercase tracking-widest">🎯 Target Kategori:</label>
                <select className="w-full border-2 border-brutal-black p-1.5 bg-white text-brutal-black font-black cursor-pointer hover:bg-gray-200 focus:outline-none text-xs" value={kategoriAktif} onChange={(e) => setKategoriAktif(e.target.value)}>
                  <option value="SEMUA">🔥 Acak (Semua)</option>
                  <option value="TIU">Hanya TIU</option>
                  <option value="TWK">Hanya TWK</option>
                  <option value="TKP">Hanya TKP</option>
                </select>
              </div>
            </div>

            {isCustomMode && (
              <div className="flex items-stretch gap-0 mt-1 animate-[slideDown_0.2s_ease-out]">
                <input type="number" min="1" value={customMenit} onChange={handleUbahCustom} className="w-full border-2 border-r-0 border-brutal-black p-1 text-base text-center font-black text-brutal-black bg-white focus:outline-none focus:bg-brutal-yellow" />
                <div className="bg-brutal-black text-white font-black px-3 flex items-center border-2 border-brutal-black tracking-widest text-[10px]">MENIT</div>
              </div>
            )}
          </div>
          
          {/* 4. TOMBOL AKSI */}
          <div className="flex gap-2 mt-1">
            <button onClick={handleKeluar} className="bg-white text-brutal-black font-black px-4 py-3 border-4 border-brutal-black hover:bg-brutal-pink shadow-[4px_4px_0_0_#1e1e1e] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none text-lg flex items-center justify-center" title="Matikan Aplikasi">
              ❌
            </button>
            <button onClick={handleMulai} className="flex-1 bg-brutal-yellow text-brutal-black font-black py-3 border-4 border-brutal-black hover:bg-white shadow-[4px_4px_0_0_#1e1e1e] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none text-base uppercase tracking-widest flex items-center justify-center">
              🔥 MULAI STANDBY
            </button>
          </div>

        </div>

        {/* 5. FOOTER COPYRIGHT (Sekarang ada di dalam kotak agar menghemat ruang) */}
        <div className="bg-gray-100 border-t-4 border-brutal-black p-2 text-center shrink-0">
          <p className="font-black text-[9px] uppercase tracking-widest text-gray-500">
            © 2026 <span className="mx-1">|</span> M. Rafif Musyaffa
          </p>
        </div>

      </div>

      {/* MODAL KELOLA SOAL (Ukuran disesuaikan) */}
      {showKelola && (
        <div className="fixed inset-0 bg-brutal-black/90 z-50 flex items-center justify-center p-3 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white border-4 border-brutal-black w-full max-w-lg h-[85vh] max-h-[600px] flex flex-col shadow-[8px_8px_0_0_#brutal-pink]">
            
            <div className="bg-brutal-pink border-b-4 border-brutal-black p-3 flex justify-between items-center shrink-0">
              <h2 className="font-black text-sm uppercase tracking-widest">⚙️ Kelola Soal Import</h2>
              <button onClick={() => setShowKelola(false)} className="font-black text-lg hover:text-white transition-colors">❌</button>
            </div>
            
            <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50">
              
              {/* AKSI CEPAT HAPUS KATEGORI */}
              {customSoal.length > 0 && (
                <div className="bg-white border-2 border-brutal-black p-2 shadow-sm mb-1">
                  <p className="font-black text-[9px] mb-2 uppercase text-gray-500 tracking-widest border-b border-gray-300 pb-1">Aksi Cepat Hapus:</p>
                  <div className="flex gap-2 overflow-x-auto">
                    <button onClick={() => window.confirm('Hapus SEMUA custom TWK?') && hapusSoalCustomByKategori('TWK')} className="bg-brutal-pink text-brutal-black text-[10px] font-black px-3 py-1.5 border-2 border-brutal-black hover:bg-white transition-colors flex-1 whitespace-nowrap">🗑️ TWK</button>
                    <button onClick={() => window.confirm('Hapus SEMUA custom TIU?') && hapusSoalCustomByKategori('TIU')} className="bg-brutal-blue text-white text-[10px] font-black px-3 py-1.5 border-2 border-brutal-black hover:bg-white hover:text-brutal-black transition-colors flex-1 whitespace-nowrap">🗑️ TIU</button>
                    <button onClick={() => window.confirm('Hapus SEMUA custom TKP?') && hapusSoalCustomByKategori('TKP')} className="bg-brutal-yellow text-brutal-black text-[10px] font-black px-3 py-1.5 border-2 border-brutal-black hover:bg-white transition-colors flex-1 whitespace-nowrap">🗑️ TKP</button>
                  </div>
                </div>
              )}

              {/* DAFTAR SOAL */}
              {customSoal.length === 0 ? (
                <div className="text-center font-black text-gray-400 py-12 border-2 border-dashed border-gray-300 bg-white text-xs">
                  KOSONG.<br/>BELUM ADA SOAL IMPORT.
                </div>
              ) : (
                customSoal.map((soal, idx) => (
                  <div key={idx} className="bg-white border-2 border-brutal-black p-3 relative group">
                    <span className="absolute -top-2 -left-2 bg-brutal-black text-white text-[9px] font-black px-2 py-0.5 border-2 border-brutal-black uppercase tracking-widest">
                      #{idx + 1} | {soal.kategori}
                    </span>
                    <p className="font-bold text-xs mt-2 line-clamp-3 text-gray-800 bg-gray-100 p-2 border-l-2 border-brutal-black leading-relaxed">{soal.pertanyaan}</p>
                    
                    <div className="mt-2 text-right">
                      <button onClick={() => window.confirm('Hapus soal ini?') && hapusSoalCustom(idx)} className="bg-brutal-pink text-brutal-black font-black text-[10px] px-3 py-1.5 border-2 border-brutal-black shadow-sm hover:bg-white transition-colors uppercase tracking-widest">
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* HAPUS SEMUA */}
            {customSoal.length > 0 && (
              <div className="p-3 border-t-4 border-brutal-black bg-white shrink-0">
                <button onClick={() => window.confirm('⚠️ PERINGATAN: Yakin ingin menghapus SEMUA soal import secara total?') && hapusSemuaSoalCustom()} className="w-full bg-brutal-black text-white font-black py-3 border-2 border-brutal-black hover:bg-brutal-pink hover:text-brutal-black transition-colors uppercase tracking-widest text-xs">
                  ⚠️ HANCURKAN SEMUA SOAL IMPORT
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}