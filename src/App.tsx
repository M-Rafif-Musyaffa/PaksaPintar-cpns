import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useSoalStore } from "./store/useSoalStore";
import SettingScreen from "./components/SettingScreen";
import QuizScreen from "./components/QuizScreen";
import ReportScreen from "./components/ReportScreen";

function App() {
  const { initSoal, getNextSoal, isSelesai } = useSoalStore();
  const [appMode, setAppMode] = useState<'setting' | 'quiz' | 'rapor'>('setting');

  // Menangkap Sinyal "Tampilkan Rapor" jika di-quit paksa dari Tray
  useEffect(() => {
    const unlisten = listen("tampilkan-rapor", () => {
      setAppMode('rapor');
    });
    return () => { unlisten.then(f => f()); };
  }, []);

  // Memantau jika soal habis (isSelesai berubah jadi true)
  useEffect(() => {
    if (isSelesai) {
      setAppMode('rapor');
      // Paksa layar muncul untuk menunjukkan rapor
      invoke('munculkan_jendela').catch(console.error);
    }
  }, [isSelesai]);

  // Munculkan layar utama saat pertama kali dibuka
  useEffect(() => {
    setTimeout(async () => {
      try {
        await invoke('munculkan_jendela');
      } catch (e) { console.error(e); }
    }, 500);
  }, []);

  const mulaiLatihan = () => {
    initSoal();
    getNextSoal();
    setAppMode('quiz');
  };

  const ulangiLatihan = () => {
    setAppMode('setting'); // Kembalikan ke menu awal untuk atur waktu lagi
  };

  // RENDER BERDASARKAN MODE
  if (appMode === 'setting') return <SettingScreen onMulai={mulaiLatihan} />;
  if (appMode === 'rapor') return <ReportScreen onUlangi={ulangiLatihan} />;
  
  return <QuizScreen />;
}

export default App;