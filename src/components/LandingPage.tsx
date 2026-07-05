import React, { useState } from 'react';
import { Book, User, BOOK_CATEGORIES } from '../types';
import { Search, BookOpen, Clock, CheckCircle2, Bookmark, ArrowRight, Library, Layers, GraduationCap, Award, HelpCircle } from 'lucide-react';

interface LandingPageProps {
  books: Book[];
  currentUser: User | null;
  onNavigateToDashboard: () => void;
  onSearch: (query: string) => void;
  onSelectBook: (book: Book) => void;
  onNavigateToLogin: (role?: 'Mahasiswa' | 'Dosen' | 'Admin') => void;
  onNavigateToCatalog: () => void;
  onNavigateToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  books,
  currentUser,
  onNavigateToDashboard,
  onSearch,
  onSelectBook,
  onNavigateToLogin,
  onNavigateToCatalog,
  onNavigateToRegister
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    onNavigateToCatalog();
  };

  const featuredBooks = books.slice(0, 4);
  const categories = [...BOOK_CATEGORIES, ...Array.from(new Set<string>(books.map(b => b.category))).filter(c => !BOOK_CATEGORIES.includes(c))];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans" id="landing-page-root">
      {/* Top Banner Header / Navbar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur shadow-xs border-b border-border-soft z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="p-2.5 yellow-gradient rounded-xl text-white shadow-md shadow-primary/20">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-primary-dark leading-tight">
                Perpustakaan <span className="text-primary">Digital FST</span>
              </h1>
              <p className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">UIN Syarif Hidayatullah Jakarta</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#hero" className="text-primary-dark hover:text-primary font-semibold text-sm transition-colors">Beranda</a>
            <a href="#katalog" className="text-slate-600 hover:text-primary font-medium text-sm transition-colors">Katalog Koleksi</a>
            <a href="#cara-pinjam" className="text-slate-600 hover:text-primary font-medium text-sm transition-colors">Cara Pinjam</a>
            <a href="#tentang" className="text-slate-600 hover:text-primary font-medium text-sm transition-colors">Tentang Perpustakaan</a>
          </nav>

          <div className="flex items-center space-x-3">
            {currentUser ? (
              <button
                onClick={onNavigateToDashboard}
                className="px-5 py-2.5 bg-primary text-white hover:bg-primary-dark font-semibold text-sm rounded-lg shadow-md shadow-primary/10 hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Ke Dashboard ({currentUser.name})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigateToLogin('Mahasiswa')}
                  className="px-4 py-2 text-primary hover:bg-background-soft font-semibold text-sm rounded-lg transition-all cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  onClick={onNavigateToRegister}
                  className="px-5 py-2.5 bg-primary text-white hover:bg-primary-dark font-semibold text-sm rounded-lg shadow-md shadow-primary/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  Daftar Anggota
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF8E1 0%, #FFFFFF 45%, #F6E3A1 100%)' }}>
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D9A441_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/25 text-primary-dark px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Fakultas Sains dan Teknologi (FST)</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] tracking-tight text-[#0F172A]">
              Akses Perpustakaan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-primary">Digital FST</span> Lebih Cepat dan Nyaman
            </h2>
            <p className="text-[#64748B] text-base sm:text-lg max-w-2xl font-light">
              Layanan modern sirkulasi mandiri peminjaman buku untuk civitas akademika FST. Cari buku, jurnal riset, hingga thesis komputasi terbaik hanya dari genggaman Anda.
            </p>
 
            {/* Direct Search Bar */}
            <form onSubmit={handleSearchSubmit} className="bg-white p-2 rounded-2xl shadow-xl flex items-center max-w-2xl border-2 border-primary/20">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Cari judul buku, penulis, kategori, kode rak, atau tahun..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md shadow-primary/20 transition-colors flex items-center space-x-2 shrink-0"
              >
                <span>Cari</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
 
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 font-medium pt-2">
              <span className="font-bold text-slate-800">Populer:</span>
              <span className="bg-white border border-slate-200/80 hover:bg-slate-50 cursor-pointer px-3 py-1 rounded-full transition" onClick={() => { setSearchQuery('Struktur Data'); onSearch('Struktur Data'); onNavigateToCatalog(); }}>Struktur Data</span>
              <span className="bg-white border border-slate-200/80 hover:bg-slate-50 cursor-pointer px-3 py-1 rounded-full transition" onClick={() => { setSearchQuery('Kecerdasan Buatan'); onSearch('Kecerdasan Buatan'); onNavigateToCatalog(); }}>Kecerdasan Buatan</span>
              <span className="bg-white border border-slate-200/80 hover:bg-slate-50 cursor-pointer px-3 py-1 rounded-full transition" onClick={() => { setSearchQuery('IoT'); onSearch('IoT'); onNavigateToCatalog(); }}>IoT</span>
            </div>
          </div>
 
          {/* Quick Demo Gateways */}
          <div className="lg:col-span-5 bg-white/80 p-6 rounded-2xl border border-border-soft shadow-lg backdrop-blur-md text-[#0F172A]">
            <h3 className="text-lg font-bold font-display mb-4 text-primary-dark flex items-center">
              <Award className="w-5 h-5 mr-2 text-primary" />
              Akses Cepat Pengguna Mandiri
            </h3>
            <div className="space-y-3.5">
              <div
                onClick={() => onNavigateToLogin('Mahasiswa')}
                className="p-3 bg-white hover:bg-background-soft border border-slate-100 hover:border-[#E8D9A8] rounded-xl flex items-center justify-between cursor-pointer transition shadow-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-dark">M</div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Portal Mahasiswa</h4>
                    <p className="text-[10px] text-[#64748B]">Peminjaman, status, dan favorit</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
 
              <div
                onClick={() => onNavigateToLogin('Dosen')}
                className="p-3 bg-white hover:bg-background-soft border border-slate-100 hover:border-[#E8D9A8] rounded-xl flex items-center justify-between cursor-pointer transition shadow-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600">D</div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Portal Dosen</h4>
                    <p className="text-[10px] text-[#64748B]">Koleksi riset & rujukan akademik</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
 
              <div
                onClick={() => onNavigateToLogin('Admin')}
                className="p-3 bg-white hover:bg-background-soft border border-slate-100 hover:border-[#E8D9A8] rounded-xl flex items-center justify-between cursor-pointer transition shadow-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-550 bg-rose-500/10 flex items-center justify-center text-xs font-bold text-rose-600">A</div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Sistem Admin (Pustakawan)</h4>
                    <p className="text-[10px] text-[#64748B]">Persetujuan sirkulasi & kelola buku</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-white relative z-10 -mt-8 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background-soft border border-border-soft p-8 rounded-2xl col-span-1 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 bg-primary rounded-xl text-white flex items-center justify-center mb-6">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-primary-dark mb-2">1. Pencarian Cepat</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cari buku dan manuskrip dengan sistem lookup instan. Anda bisa memfilter berdasarkan subjek rekayasa perangkat lunak, fisika, kimia, atau sains dasar.
            </p>
          </div>

          <div className="bg-background-soft border border-border-soft p-8 rounded-2xl col-span-1 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 bg-primary-dark rounded-xl text-white flex items-center justify-center mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-primary-dark mb-2">2. Cek Ketersediaan Riil</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ketahui sisa eksemplar buku di rak secara realtime. Jika dipinjam, sistem akan menginformasikan estimasi buku tersebut kembali.
            </p>
          </div>

          <div className="bg-background-soft border border-border-soft p-8 rounded-2xl col-span-1 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 bg-primary-dark rounded-xl text-white flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-primary-dark mb-2">3. Peminjaman Mandiri</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ajukan klaim peminjaman secara mandiri melalui web. Cukup tunggu persetujuan tim pustakawan, lalu bawa QR / ID pinjam untuk mengambil buku.
            </p>
          </div>
        </div>
      </section>

      {/* Kategori Populer */}
      <section className="py-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Kategori Utama Akademik FST</h2>
            <p className="text-sm text-slate-500">Koleksi terbitan buku yang diklasifikasikan berdasarkan kategori rumpun ilmu komputer dan sains dasar.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => { setSearchQuery(cat); onSearch(cat); onNavigateToCatalog(); }}
                className="bg-white p-5 rounded-xl border border-slate-200/80 hover:border-primary/40 shadow-xs hover:shadow-md cursor-pointer transition text-center group"
              >
                <div className="w-10 h-10 bg-background-soft text-primary rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 tracking-tight">{cat}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Lihat Koleksi &rarr;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buku Populer */}
      <section id="katalog" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">Rekomendasi Koleksi Buku Populer</h2>
              <p className="text-sm text-slate-500 mt-1">Daftar buku wajib untuk prodi Teknik Informatika, Sistem Informasi, Fisika, Matematika, dan Kimia.</p>
            </div>
            <button
              onClick={onNavigateToCatalog}
              className="group inline-flex items-center space-x-1.5 text-primary font-bold text-sm hover:text-primary-dark"
            >
              <span>Telusuri Semua Katalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="bg-white rounded-xl border border-slate-200 hover:border-primary/30 p-4.5 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
              >
                {/* Physical Book Cover rendering in HTML/CSS */}
                <div className="aspect-3/4 w-full rounded-lg mb-4 flex items-center justify-center relative overflow-hidden text-white book-cover-3d" style={{ background: book.coverUrl }}>
                  <div className="book-cover-spine"></div>
                  <div className="book-cover-page-edges"></div>
                  <div className="p-4 flex flex-col justify-between h-full w-full relative z-10 leading-tight">
                    <div className="text-[10px] font-mono font-medium tracking-widest text-white/70 uppercase">
                      {book.id}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold font-display leading-tight mb-1 text-white line-clamp-3">
                        {book.title}
                      </h4>
                      <p className="text-[10px] text-white/85 truncate">{book.author}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 mt-1 space-y-1.5">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-background-soft text-primary rounded border border-border-soft">
                    {book.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500">Oleh: {book.author}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  {(() => {
                    const total = book.copies ?? book.totalCopies ?? 1;
                    const borrowed = typeof book.borrowedCopies === 'number' ? book.borrowedCopies : (total - book.availableCopies);
                    let displayText = `${book.availableCopies} Tersedia`;
                    let displayClass = 'bg-primary-light/70 text-primary-dark';

                    if (book.availableCopies > 0) {
                      displayText = `${book.availableCopies} Tersedia`;
                      displayClass = 'bg-emerald-100 text-emerald-850';
                    } else if (book.isUnavailableManual || book.status === 'Tidak Tersedia' || (book.availableCopies === 0 && borrowed === 0)) {
                      displayText = 'Tidak Tersedia';
                      displayClass = 'bg-rose-100 text-rose-800';
                    } else {
                      displayText = 'Sedang Dipinjam';
                      displayClass = 'bg-amber-100 text-amber-800';
                    }
                    return (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${displayClass}`}>
                        {displayText}
                      </span>
                    );
                  })()}
                  <span className="text-xs text-primary font-bold group-hover:underline">Detail &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Pinjam Manual */}
      <section id="cara-pinjam" className="py-16 bg-slate-50 border-t border-b border-border-soft/50 text-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary-dark">Bagaimana Cara Kerja Peminjaman?</h2>
            <p className="text-sm text-slate-500">Langkah mudah sirkulasi buku digital dari pemesanan hingga pengembalian mandiri di FST.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/15 border-2 border-primary text-primary-dark font-extrabold flex items-center justify-center text-xl mx-auto shadow-xs">1</div>
              <h4 className="font-bold text-sm tracking-tight text-slate-900">Buat Akun & Login</h4>
              <p className="text-xs text-slate-500 leading-relaxed px-4">Gunakan email FST atau nomor identitas (NIM untuk mahasiswa, NIP untuk dosen).</p>
            </div>
            <div className="relative text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/15 border-2 border-primary text-primary-dark font-extrabold flex items-center justify-center text-xl mx-auto shadow-xs">2</div>
              <h4 className="font-bold text-sm tracking-tight text-slate-900">Ajukan Buku</h4>
              <p className="text-xs text-slate-500 leading-relaxed px-4">Pilih koleksi buku di katalog, klik pinjam, isi formulir pengajuan peminjaman daring.</p>
            </div>
            <div className="relative text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/15 border-2 border-primary text-primary-dark font-extrabold flex items-center justify-center text-xl mx-auto shadow-xs">3</div>
              <h4 className="font-bold text-sm tracking-tight text-slate-900">Verifikasi Pustakawan</h4>
              <p className="text-xs text-slate-500 leading-relaxed px-4">Admin menyetujui pengajuan Anda. Status pengajuan dapat dipantau di halaman notifikasi.</p>
            </div>
            <div className="relative text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/15 border-2 border-primary text-primary-dark font-extrabold flex items-center justify-center text-xl mx-auto shadow-xs">4</div>
              <h4 className="font-bold text-sm tracking-tight text-slate-900">Ambil & Kembalikan</h4>
              <p className="text-xs text-slate-500 leading-relaxed px-4">Bawa kode transaksi ke pustakawan untuk ambil buku fisik. Kembalikan tepat waktu sesuai jatuh tempo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Section */}
      <section id="tentang" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary-dark mx-auto mb-3">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Tentang Perpustakaan FST</h2>
          <p className="text-slate-600 text-sm leading-relaxed sm:text-base">
            Perpustakaan Digital Fakultas Sains dan Teknologi merupakan pusat rujukan ilmiah terintegrasi yang melayani kegiatan pendidikan dan riset di lingkungan kampus. Dengan ribuan koleksi buku digital, manuskrip, jurnal internasional, dan modul pemrograman, kami berkomitmen menghadirkan ekosistem riset yang modern, inklusif, dan tak terbatas oleh dimensi ruang dan waktu.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 max-w-lg mx-auto">
            <div>
              <h5 className="text-2xl font-extrabold font-display text-primary-dark">5,000+</h5>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Koleksi Buku</p>
            </div>
            <div>
              <h5 className="text-2xl font-extrabold font-display text-primary-dark">1,200+</h5>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Siswa & Dosen</p>
            </div>
            <div>
              <h5 className="text-2xl font-extrabold font-display text-primary-dark">100%</h5>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Sirkulasi Online</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 border-t border-slate-800 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary-dark text-white rounded-md flex items-center justify-center font-bold text-xs">F</div>
            <span className="font-bold font-display text-white">Perpustakaan Digital FST</span>
          </div>
          <p>&copy; 2026 Fakultas Sains dan Teknologi. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-primary">Kebijakan Privasi</a>
            <a href="#" className="hover:text-primary">Syarat Ketentuan</a>
            <a href="#" className="hover:text-primary">Kontak Kampus</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
