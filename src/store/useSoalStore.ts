import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dataSoalBawaan from '../data/soal.json';

export type Soal = {
  id: number;
  kategori: string;
  pertanyaan: string;
  pilihan: string[];
  jawaban_benar: string;
  pembahasan: string;
};

interface SoalState {
  unseenPool: Soal[];
  seenPool: Soal[];
  currentSoal: Soal | null;
  waktuMuncul: number; 
  kategoriAktif: string;
  
  skorBenar: number;
  skorSalah: number;
  totalDijawab: number;
  isSelesai: boolean;
  
  customSoal: Soal[]; 
  logSalah: Soal[];
  
  setWaktuMuncul: (ms: number) => void;
  setKategoriAktif: (kategori: string) => void;
  initSoal: () => void;
  getNextSoal: () => void;
  clearCache: () => void;
  tambahSkor: (isBenar: boolean, soalObj: Soal) => void;
  importSoalBaru: (soalBaru: Soal[]) => void;
  hapusSoalCustom: (index: number) => void;
  hapusSemuaSoalCustom: () => void;
  hapusSoalCustomByKategori: (kategori: string) => void;
}

const shuffleArray = (array: Soal[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useSoalStore = create<SoalState>()(
  persist(
    (set, get) => ({
      unseenPool: [],
      seenPool: [],
      currentSoal: null,
      waktuMuncul: 3600000, 
      kategoriAktif: "SEMUA",

      skorBenar: 0,
      skorSalah: 0,
      totalDijawab: 0,
      isSelesai: false,
      
      customSoal: [], 
      logSalah: [],

      setWaktuMuncul: (ms: number) => set({ waktuMuncul: ms }),
      setKategoriAktif: (kategori: string) => set({ kategoriAktif: kategori }),

      tambahSkor: (isBenar: boolean, soalObj: Soal) => {
        set((state) => ({
          skorBenar: isBenar ? state.skorBenar + 1 : state.skorBenar,
          skorSalah: !isBenar ? state.skorSalah + 1 : state.skorSalah,
          totalDijawab: state.totalDijawab + 1,
          logSalah: !isBenar ? [...state.logSalah, soalObj] : state.logSalah, 
        }));
      },

      importSoalBaru: (soalBaru: Soal[]) => {
       set((state) => {
          const pertanyaanSudahAda = new Set(
            [...dataSoalBawaan, ...state.customSoal].map(s => 
              s.pertanyaan.trim().toLowerCase() 
            )
          );
          const soalUnik = soalBaru.filter(soal => 
            !pertanyaanSudahAda.has(soal.pertanyaan.trim().toLowerCase())
          );
          return {
            customSoal: [...state.customSoal, ...soalUnik]
          };
        });
      },

      hapusSoalCustom: (index: number) => {
        set((state) => {
          const customBaru = [...state.customSoal];
          customBaru.splice(index, 1); // Hapus 1 item berdasarkan urutannya
          return { customSoal: customBaru };
        });
      },

      hapusSemuaSoalCustom: () => set({ customSoal: [] }),
      
      hapusSoalCustomByKategori: (kategori: string) => {
        set((state) => ({
          // Filter: Simpan soal yang kategorinya TIDAK SAMA dengan kategori yang mau dihapus
          customSoal: state.customSoal.filter(
            s => !s.kategori.toUpperCase().includes(kategori.toUpperCase())
          )
        }));
      },

      initSoal: () => {
        const { kategoriAktif, customSoal } = get();
        let allData = [...dataSoalBawaan, ...customSoal] as Soal[];
        
        if (kategoriAktif !== "SEMUA") {
          allData = allData.filter(s => s.kategori.toUpperCase().includes(kategoriAktif));
        }

        set({
          unseenPool: shuffleArray(allData),
          seenPool: [],
          currentSoal: null,
          skorBenar: 0,
          skorSalah: 0,
          totalDijawab: 0,
          isSelesai: false,
          logSalah: [], 
        });
      },

      getNextSoal: () => {
        const { unseenPool, seenPool } = get();
        if (unseenPool.length === 0) {
          set({ currentSoal: null, isSelesai: true });
          return; 
        }
        const nextSoal = unseenPool[0];
        set({
          currentSoal: nextSoal,
          unseenPool: unseenPool.slice(1),
          seenPool: [...seenPool, nextSoal],
        });
      },

      clearCache: () => {
        set((state) => ({ seenPool: state.seenPool.slice(-5) }));
      }
    }),
    {
      name: 'paksapintar-cpns-storage', 
      partialize: (state) => ({ 
        customSoal: state.customSoal,
        waktuMuncul: state.waktuMuncul,
        kategoriAktif: state.kategoriAktif
      }),
    }
  )
);