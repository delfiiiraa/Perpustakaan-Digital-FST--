import React, { useState } from 'react';
import { Book, User, BorrowRecord, Notification, Favorite, DEFAULT_AVATAR, getJakartaTimestamp, getDeviceString, BOOK_CATEGORIES } from '../types';
import {
  BookOpen, Clock, CheckCircle, AlertTriangle, Search, Heart, Bell, LogOut, Download,
  Bookmark, User as UserIcon, Calendar, Filter, ArrowLeft, Layers, MapPin, ShieldAlert, Check,
  BarChart2, FileText, ChevronRight, XCircle, RefreshCw, Shield, Laptop, Lock, Eye, EyeOff
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  onUpdateCurrentUser: (user: User) => void;
  books: Book[];
  borrows: BorrowRecord[];
  favorites: Favorite[];
  notifications: Notification[];
  onAddFavorite: (bookId: string) => void;
  onRemoveFavorite: (bookId: string) => void;
  onRequestBorrow: (bookId: string, notes: string) => void;
  onClearNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  onLogout: () => void;
  currentSubView: string;
  onChangeSubView: (view: string) => void;
  subViewTrigger?: number;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  onUpdateCurrentUser,
  books,
  borrows,
  favorites,
  notifications,
  onAddFavorite,
  onRemoveFavorite,
  onRequestBorrow,
  onClearNotification,
  onClearAllNotifications,
  onLogout,
  currentSubView,
  onChangeSubView,
  subViewTrigger = 0
}) => {
  // Local catalog states
  const [catSearch, setCatSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  
  // Profile photo uploading states
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showDeletePhotoConfirm, setShowDeletePhotoConfirm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file extension/mime type (JPG, JPEG, PNG, WEBP)
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

      if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        triggerAlert('Gagal: Format file tidak didukung. Silakan pilih gambar dengan format JPG, JPEG, PNG, atau WEBP.');
        return;
      }

      // Validate file size (Maximum 500 KB)
      const MAX_SIZE_BYTES = 500 * 1024; // 500 KB
      if (file.size > MAX_SIZE_BYTES) {
        triggerAlert(`Gagal: Ukuran gambar (${(file.size / 1024).toFixed(1)} KB) melebihi batas maksimum 500 KB. Silakan pilih file yang lebih kecil.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          setPreviewImage(reader.result as string);
        } catch (err: any) {
          triggerAlert('Gagal memuat gambar: ' + (err.message || 'Error tidak dikenal.'));
        }
      };
      reader.onerror = () => {
        triggerAlert('Gagal membaca file gambar.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    try {
      if (previewImage) {
        onUpdateCurrentUser({
          ...currentUser,
          avatar: previewImage,
          avatarImage: previewImage
        });
        setPreviewImage(null);
        triggerAlert('Foto profil berhasil diperbarui.');
      }
    } catch (err: any) {
      console.error(err);
      triggerAlert('Gagal menyimpan foto profil: Kapasitas penyimpanan penuh atau error tidak dikenal.');
    }
  };

  const handleRemovePhoto = () => {
    setShowDeletePhotoConfirm(true);
  };

  const confirmRemovePhoto = () => {
    onUpdateCurrentUser({
      ...currentUser,
      avatar: '',
      avatarImage: ''
    });
    setPreviewImage(null);
    setShowDeletePhotoConfirm(false);
    triggerAlert('Foto profil berhasil dihapus.');
  };
  
  // Detail Book state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Checkout process state
  const [checkoutBook, setCheckoutBook] = useState<Book | null>(null);
  const [borrowNotes, setBorrowNotes] = useState('');

  // Handle sidebar navigation reset & state clearing
  const lastSubView = React.useRef(currentSubView);
  const lastTrigger = React.useRef(subViewTrigger);

  React.useEffect(() => {
    if (currentSubView !== lastSubView.current || subViewTrigger !== lastTrigger.current) {
      setSelectedBook(null);
      setCheckoutBook(null);
      lastSubView.current = currentSubView;
      lastTrigger.current = subViewTrigger;
    }
  }, [currentSubView, subViewTrigger]);

  // Handle Browser Back and Forward Navigation (Popstate)
  const isHandlingPopstate = React.useRef(false);

  React.useEffect(() => {
    // Initialize/Replace state so the first entry in history has full state representation
    const initialState = {
      source: 'user-portal',
      subView: currentSubView,
      selectedBookId: selectedBook ? selectedBook.id : null,
      checkoutBookId: checkoutBook ? checkoutBook.id : null
    };
    if (!window.history.state) {
      window.history.replaceState(initialState, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.source === 'user-portal') {
        isHandlingPopstate.current = true;
        
        if (state.subView && state.subView !== currentSubView) {
          onChangeSubView(state.subView);
        }
        
        const targetBook = state.selectedBookId ? books.find(b => b.id === state.selectedBookId) : null;
        setSelectedBook(targetBook || null);
        
        const targetCheckout = state.checkoutBookId ? books.find(b => b.id === state.checkoutBookId) : null;
        setCheckoutBook(targetCheckout || null);
        
        setTimeout(() => {
          isHandlingPopstate.current = false;
        }, 50);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentSubView, books, onChangeSubView]);

  React.useEffect(() => {
    if (isHandlingPopstate.current) return;

    const state = {
      source: 'user-portal',
      subView: currentSubView,
      selectedBookId: selectedBook ? selectedBook.id : null,
      checkoutBookId: checkoutBook ? checkoutBook.id : null
    };

    const currentState = window.history.state;
    if (currentState && 
        currentState.source === 'user-portal' &&
        currentState.subView === currentSubView &&
        currentState.selectedBookId === (selectedBook ? selectedBook.id : null) &&
        currentState.checkoutBookId === (checkoutBook ? checkoutBook.id : null)) {
      return;
    }

    window.history.pushState(state, '');
  }, [currentSubView, selectedBook, checkoutBook]);

  // History status filter state
  const [historyFilter, setHistoryFilter] = useState<'Semua' | 'Selesai' | 'Terlambat' | 'Ditolak'>('Semua');

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const getUserPassword = () => {
    // 1. Check if currentUser has password
    if ((currentUser as any).password) {
      return (currentUser as any).password;
    }
    
    // 2. Check in FST_USERS list or pendingMembers in localStorage
    try {
      const fstUsersStr = localStorage.getItem('FST_USERS');
      if (fstUsersStr) {
        const parsedUsers = JSON.parse(fstUsersStr);
        const foundUser = parsedUsers.find((u: any) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (foundUser && foundUser.password) {
          return foundUser.password;
        }
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const pendingStr = localStorage.getItem('pendingMembers');
      if (pendingStr) {
        const parsedPending = JSON.parse(pendingStr);
        const foundPending = parsedPending.find((m: any) => m && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase());
        if (foundPending && foundPending.password) {
          return foundPending.password;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // 3. Default fallback
    return '123456';
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      return;
    }

    const currentPassword = getUserPassword();

    // Verify old password
    if (oldPassword !== currentPassword) {
      setPasswordError("Kata sandi lama tidak sesuai.");
      return;
    }

    // Verify new password is not the same as old
    if (newPassword === oldPassword) {
      setPasswordError("Kata sandi baru harus berbeda dari kata sandi lama.");
      return;
    }

    // Verify confirm password matches new password
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    // Validation passed! Save the new password
    const updatedUser = {
      ...currentUser,
      password: newPassword
    };

    onUpdateCurrentUser(updatedUser);

    // Update in pendingMembers if they exist there
    try {
      const pendingStr = localStorage.getItem('pendingMembers');
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        const updatedPending = pending.map((m: any) => {
          if (m && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase()) {
            return { ...m, password: newPassword };
          }
          return m;
        });
        localStorage.setItem('pendingMembers', JSON.stringify(updatedPending));
      }
    } catch (e) {
      console.error(e);
    }

    // Close the modal and reset states
    setShowPasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordError(null);

    // Show success notification
    triggerAlert("Kata sandi berhasil diperbarui.");
  };

  // Interactive feedback
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // User-specific statistics
  const userBorrows = borrows.filter(b => b.userId === currentUser.id);
  const activeBorrows = userBorrows.filter(b => b.status === 'Dipinjam');
  const pendingBorrows = userBorrows.filter(b => b.status === 'Menunggu');
  const completedBorrows = userBorrows.filter(b => b.status === 'Dikembalikan');
  const overdueBorrows = userBorrows.filter(b => b.status === 'Terlambat');

  const maxBorrowLimit = currentUser.role === 'Dosen' ? 5 : 3;
  const activeCount = activeBorrows.length + overdueBorrows.length;
  const remainingQuota = Math.max(0, maxBorrowLimit - activeCount);
  const accountAccreditation = currentUser.status === 'Nonaktif'
    ? 'Nonaktif'
    : (overdueBorrows.length > 0 || currentUser.accreditationStatus === 'Suspended')
      ? 'Suspended'
      : (currentUser.accreditationStatus || 'Accredited');

  const getProgramStudiKeywords = (prodi: string): string[] => {
    switch (prodi) {
      case 'Teknik Informatika':
        return ['programming', 'program', 'algorithm', 'algoritma', 'data structure', 'struktur data', 'artificial intelligence', 'kecerdasan buatan', 'web', 'database', 'basis data', 'software engineering', 'rekayasa perangkat lunak', 'computer networks', 'jaringan komputer', 'machine learning', 'operating system', 'sistem operasi', 'linux', 'windows', 'code', 'javascript', 'python', 'java'];
      case 'Sistem Informasi':
        return ['information system', 'sistem informasi', 'business process', 'proses bisnis', 'database system', 'sistem basis data', 'basis data', 'system analysis', 'analisis sistem', 'enterprise', 'project management', 'manajemen proyek', 'digital transformation', 'transformasi digital'];
      case 'Matematika':
        return ['calculus', 'kalkulus', 'linear algebra', 'aljabar linear', 'statistics', 'statistika', 'statistik', 'discrete mathematics', 'matematika diskrit', 'numerical methods', 'metode numerik', 'mathematical modeling', 'pemodelan matematika', 'matematika'];
      case 'Fisika':
        return ['basic physics', 'fisika dasar', 'modern physics', 'fisika modern', 'mechanics', 'mekanika', 'electricity', 'kelistrikan', 'magnetism', 'kemagnetan', 'thermodynamics', 'termodinamika', 'computational physics', 'fisika komputasi', 'fisika', 'optika', 'sensor', 'iot'];
      case 'Kimia':
        return ['general chemistry', 'kimia umum', 'organic chemistry', 'kimia organik', 'inorganic chemistry', 'kimia anorganik', 'analytical chemistry', 'kimia analitik', 'physical chemistry', 'kimia fisik', 'laboratory methods', 'metode laboratorium', 'kimia', 'unsur', 'molekul'];
      case 'Biologi':
        return ['general biology', 'biologi umum', 'microbiology', 'mikrobiologi', 'genetics', 'genetika', 'ecology', 'ekologi', 'biotechnology', 'bioteknologi', 'molecular biology', 'biologi molekuler', 'biologi', 'sel', 'tanaman', 'hewan', 'mikroba'];
      case 'Agribisnis':
        return ['agribusiness management', 'manajemen agribisnis', 'agricultural economics', 'ekonomi pertanian', 'entrepreneurship', 'kewirausahaan', 'marketing', 'pemasaran', 'supply chain', 'rantai pasok', 'rural development', 'pembangunan pedesaan', 'pertanian', 'agribisnis'];
      case 'Teknik Pertambangan':
        return ['mining engineering', 'teknik pertambangan', 'geology', 'geologi', 'mineral exploration', 'eksplorasi mineral', 'mining safety', 'keselamatan pertambangan', 'mine planning', 'perencanaan tambang', 'environmental mining management', 'manajemen lingkungan pertambangan', 'tambang', 'batuan', 'mineral'];
      default:
        return [];
    }
  };

  const prodiKeywords = currentUser.programStudi ? getProgramStudiKeywords(currentUser.programStudi) : [];
  const prodiRecommendedBooks = books.filter(book => {
    if (!currentUser.programStudi) return false;
    const title = book.title.toLowerCase();
    const description = (book.description || '').toLowerCase();
    const category = (book.category || '').toLowerCase();
    
    return prodiKeywords.some(keyword => 
      title.includes(keyword) || 
      description.includes(keyword) || 
      category.includes(keyword)
    );
  });

  const categories = ['Semua', ...BOOK_CATEGORIES, ...Array.from(new Set<string>(books.map(b => b.category))).filter(c => !BOOK_CATEGORIES.includes(c))];

  const handleApplyBorrow = () => {
    if (!checkoutBook) return;

    // Validation for Mahasiswa (Student)
    if (currentUser.role === 'Mahasiswa') {
      const activeStatuses = ['Menunggu', 'Disetujui', 'Dipinjam', 'Terlambat'];
      const activeUserBorrows = userBorrows.filter(b => activeStatuses.includes(b.status));

      const isAlreadyActivelyBorrowed = activeUserBorrows.some(b => b.bookId === checkoutBook.id);
      if (isAlreadyActivelyBorrowed) {
        triggerAlert("Anda masih memiliki peminjaman aktif untuk buku ini. Silakan kembalikan buku terlebih dahulu sebelum meminjam lagi.");
        return;
      }

      if (activeUserBorrows.length >= 3) {
        triggerAlert("Anda sudah mencapai batas maksimal peminjaman 3 buku. Silakan kembalikan buku terlebih dahulu sebelum meminjam buku lain.");
        return;
      }
    }

    if (checkoutBook.availableCopies <= 0) {
      triggerAlert("Buku tidak tersedia untuk dipinjam.");
      return;
    }

    onRequestBorrow(checkoutBook.id, borrowNotes);
    setBorrowNotes('');
    setCheckoutBook(null);
    setSelectedBook(null);
    onChangeSubView('peminjaman');
    triggerAlert('Berhasil mengajukan peminjaman buku! Silakan tunggu persetujuan pustakawan.');
  };

  const isFavorited = (bookId: string) => {
    return favorites.some(f => f.userId === currentUser.id && f.bookId === bookId);
  };

  const today = '2026-06-23';
  const returnDueDate = '2026-06-30'; // 7 days from now

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(catSearch.toLowerCase()) || 
                          book.author.toLowerCase().includes(catSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || book.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Semua' || 
                          (selectedStatus === 'Tersedia' && book.availableCopies > 0) ||
                          (selectedStatus === 'Dipinjam' && book.availableCopies === 0);
    // Academic filter: Mahasiswa can see everything but Dosen can also filter academic resource
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6" id="user-dashboard-container">
      {/* Dynamic Feedback Alert */}
      {alertMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-primary-dark border border-primary/20 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
          <span>{alertMsg}</span>
        </div>
      )}

      {/* RENDER SUBVIEW 1: BERANDA / HOME ACCESSIBILITY */}
      {currentSubView === 'beranda' && !selectedBook && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold font-display text-primary-dark">Selamat Datang, {currentUser.name}!</h2>
              <p className="text-xs text-slate-500">Aktivitas akademik Anda terafiliasi sebagai <strong className="text-primary-dark">{currentUser.role} FST</strong></p>
            </div>
            <p className="text-xs text-slate-400 font-mono">ID: {currentUser.id} &bull; Semester Genap 2026</p>
          </div>

          {/* User Metrics overview info cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center space-x-4">
              <div className="w-11 h-11 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sedang Dipinjam</span>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{activeBorrows.length} Buku</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center space-x-4">
              <div className="w-11 h-11 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menunggu Verifikasi</span>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{pendingBorrows.length} Berkas</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center space-x-4">
              <div className="w-11 h-11 bg-background-soft text-primary rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Riwayat Peminjaman</span>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{completedBorrows.length} Selesai</h3>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex items-center space-x-4 ${
              overdueBorrows.length > 0
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-white border-slate-200/60'
            }`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                overdueBorrows.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-50 text-slate-500'
              }`}>
                <AlertTriangle className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Denda Overdue</span>
                <h3 className="text-xl font-bold leading-tight">
                  {overdueBorrows.length > 0 ? `Rp ${overdueBorrows.length * 10000}` : 'Rp 0'}
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick search gate to catalog */}
            <div className="bg-gradient-to-br from-primary-dark to-slate-900 text-white p-6 rounded-2xl lg:col-span-2 space-y-4 shadow-md shadow-primary/10 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold font-display text-primary-light">Butuh Bahan Rujukan atau Riset Mata Kuliah?</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">Sistem katalog Perpustakaan FST menyediakan akses lancar ke buku wajib pemrograman, database oracle, sains komputasi fisika, skripsi alumni, dan jurnal ilmiah terbitan lab.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <button
                  onClick={() => onChangeSubView('katalog')}
                  className="px-4 py-2.5 bg-white text-primary-dark font-bold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Buka Katalog Digital
                </button>
                <button
                  onClick={() => onChangeSubView('favorit')}
                  className="px-4 py-2.5 bg-primary-dark hover:bg-primary border border-border-soft/50 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Lihat Buku Favorit
                </button>
              </div>
            </div>

            {/* Quick alerts/notifications panel list */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                  <span>Notifikasi Akademik</span>
                  <Bell className="w-4 h-4 text-primary" />
                </h3>
                <div className="space-y-3">
                  {notifications.slice(0, 2).map((notif, index) => (
                    <div key={`${notif.id}-${index}`} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex space-x-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span>
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-800">{notif.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <span
                onClick={() => onChangeSubView('notifikasi')}
                className="text-[11px] text-primary font-bold text-center block pt-3 cursor-pointer hover:underline"
              >
                Lihat Semua Notifikasi &rarr;
              </span>
            </div>
          </div>

          {/* Book Recommended Row based on Program Studi */}
          {currentUser.role === 'Mahasiswa' && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h3 className="font-extrabold text-base font-display text-slate-900">
                  Rekomendasi Buku Sesuai Program Studi
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-light text-primary-dark self-start sm:self-auto">
                  Program Studi: {currentUser.programStudi || 'Teknik Informatika'}
                </span>
              </div>
              
              {prodiRecommendedBooks.length === 0 ? (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 text-center text-slate-500 text-xs font-medium">
                  Belum ada rekomendasi buku untuk program studi Anda.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {prodiRecommendedBooks.slice(0, 4).map((book) => (
                    <div
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-3/4 bg-slate-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden text-white" style={{ background: book.coverUrl }}>
                          <div className="absolute top-2 right-2 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                isFavorited(book.id) ? onRemoveFavorite(book.id) : onAddFavorite(book.id);
                              }}
                              className="p-1.5 bg-white/10 hover:bg-white/25 rounded-md backdrop-blur-xs text-white transition cursor-pointer"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isFavorited(book.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                            </button>
                          </div>
                          <div className="p-3 leading-tight w-full flex flex-col justify-end h-full">
                            <h4 className="font-bold text-xs line-clamp-2">{book.title}</h4>
                            <p className="text-[9px] text-white/80 mt-1 truncate">{book.author}</p>
                          </div>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1 leading-snug">{book.title}</h4>
                        <p className="text-[10px] text-slate-550 mt-0.5 truncate">Oleh {book.author}</p>
                      </div>
                      
                      <div className="pt-2.5 border-t border-slate-50 mt-2.5 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-450 font-bold truncate max-w-[75px]">{book.category}</span>
                          {(() => {
                            const total = book.copies ?? book.totalCopies ?? 1;
                            const borrowed = typeof book.borrowedCopies === 'number' ? book.borrowedCopies : (total - book.availableCopies);
                            let statusText = 'Tersedia';
                            let statusColor = 'bg-emerald-50 text-emerald-650';
                            
                            if (book.availableCopies > 0) {
                              statusText = 'Tersedia';
                              statusColor = 'bg-emerald-50 text-emerald-650';
                            } else if (book.isUnavailableManual || book.status === 'Tidak Tersedia' || (book.availableCopies === 0 && borrowed === 0)) {
                              statusText = 'Tidak Tersedia';
                              statusColor = 'bg-rose-50 text-rose-650';
                            } else {
                              statusText = 'Dipinjam';
                              statusColor = 'bg-amber-50 text-amber-650';
                            }
                            return (
                              <span className={`font-black px-1.5 py-0.5 rounded text-[8px] tracking-wide uppercase ${statusColor}`}>
                                {statusText}
                              </span>
                            );
                          })()}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBook(book);
                          }}
                          className="w-full py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary-dark font-extrabold text-[10px] rounded-lg transition"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentUser.role !== 'Mahasiswa' && (
            <div className="space-y-3">
              <h3 className="font-bold text-base font-display text-slate-900">Rekomendasi Rujukan Populer Prodi</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {books.slice(4, 8).map((book) => (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="aspect-3/4 bg-slate-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden text-white" style={{ background: book.coverUrl }}>
                      <div className="absolute top-2 right-2 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            isFavorited(book.id) ? onRemoveFavorite(book.id) : onAddFavorite(book.id);
                          }}
                          className="p-1.5 bg-white/10 hover:bg-white/25 rounded-md backdrop-blur-xs text-white transition cursor-pointer"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFavorited(book.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                        </button>
                      </div>
                      <div className="p-3 leading-tight w-full flex flex-col justify-end h-full">
                        <h4 className="font-bold text-xs line-clamp-2">{book.title}</h4>
                        <p className="text-[9px] text-white/80 mt-1 truncate">{book.author}</p>
                      </div>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{book.title}</h4>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-50 mt-2">
                      <span>{book.category}</span>
                      <span className="font-bold text-primary">Detail &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER SUBVIEW 2: KATALOG GRID VIEW */}
      {currentSubView === 'katalog' && !selectedBook && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display text-primary-dark">Katalog Digital FST</h2>
            <p className="text-xs text-slate-500 mt-0.5">Cari rujukan, cek status ketersediaan, dan ajukan peminjaman buku</p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari buku berdasarkan judul, penulis, penerbit..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:outline-hidden focus:bg-white rounded-lg font-medium text-slate-800"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 outline-hidden"
                >
                  <option value="Semua">Kategori: Semua</option>
                  {categories.filter(c => c !== 'Semua').map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 outline-hidden"
                >
                  <option value="Semua">Status: Semua</option>
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dipinjam">Sedang Dipinjam</option>
                </select>
              </div>
            </div>
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredBooks.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                <Search className="w-8 h-8 mx-auto text-slate-350 bg-slate-100 p-2 rounded-full mb-3" />
                <p className="text-sm font-bold">Buku Tidak Ditemukan</p>
                <p className="text-xs">Ubah filter kata kunci atau kategori untuk memperluas pencarian Anda.</p>
              </div>
            ) : (
              filteredBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between h-full group"
                >
                  <div className="aspect-3/4 w-full rounded-lg mb-4 flex items-center justify-center relative overflow-hidden text-white" style={{ background: book.coverUrl }}>
                    <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => isFavorited(book.id) ? onRemoveFavorite(book.id) : onAddFavorite(book.id)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md backdrop-blur-xs text-white"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorited(book.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                    {/* Book spine decoration */}
                    <div className="absolute top-0 left-0 w-3.5 h-full bg-black/20"></div>
                    <div className="p-3 flex flex-col justify-between h-full w-full relative z-10 leading-tight">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-white/60">{book.id}</span>
                      <h4 className="text-xs font-bold font-display line-clamp-3">{book.title}</h4>
                    </div>
                  </div>

                  <div className="space-y-1 mt-1">
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-700 rounded">
                      {book.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug group-hover:text-primary transition">
                      {book.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate">Penulis: {book.author}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                    {(() => {
                      const total = book.copies ?? book.totalCopies ?? 1;
                      const borrowed = typeof book.borrowedCopies === 'number' ? book.borrowedCopies : (total - book.availableCopies);
                      let displayText = `${book.availableCopies} Tersedia`;
                      let displayColor = 'text-primary';
                      
                      if (book.availableCopies > 0) {
                        displayText = `${book.availableCopies} dari ${total} eksemplar tersedia`;
                        displayColor = 'text-primary-dark';
                      } else if (book.isUnavailableManual || book.status === 'Tidak Tersedia' || (book.availableCopies === 0 && borrowed === 0)) {
                        displayText = 'Tidak Tersedia';
                        displayColor = 'text-rose-600';
                      } else {
                        displayText = 'Semua Dipinjam';
                        displayColor = 'text-amber-600';
                      }
                      return (
                        <span className={displayColor}>
                          {displayText}
                        </span>
                      );
                    })()}
                    <span className="text-primary">Detail &rarr;</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RENDER SUBVIEW: DETAIL BUKU PAGE */}
      {selectedBook && !checkoutBook && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs animate-fade-in">
          <button
            onClick={() => setSelectedBook(null)}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog / Beranda</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 flex justify-center">
              {/* Fancy rendered 3D physical book cover */}
              <div className="aspect-3/4 max-w-[210px] w-full rounded-xl flex items-center justify-center relative text-white book-cover-3d" style={{ background: selectedBook.coverUrl }}>
                <div className="book-cover-spine"></div>
                <div className="book-cover-page-edges"></div>
                <div className="p-5 flex flex-col justify-between h-full w-full relative z-10 leading-snug">
                  <span className="text-xs font-mono font-bold text-white/50">{selectedBook.id}</span>
                  <div>
                    <h4 className="text-sm font-extrabold font-display mb-1 text-white line-clamp-4">
                      {selectedBook.title}
                    </h4>
                    <p className="text-[10px] text-white/80">{selectedBook.author}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 space-y-6">
              <div className="space-y-2">
                <span className="px-3.5 py-1 text-xs font-bold bg-background-soft text-primary-dark rounded-md border border-border-soft">
                  {selectedBook.category}
                </span>
                <h2 className="text-2xl font-extrabold font-display text-slate-900 mt-2">{selectedBook.title}</h2>
                <p className="text-xs text-slate-500">Penulis: <strong className="text-slate-800 font-bold">{selectedBook.author}</strong> &bull; Penerbit: <strong className="text-slate-800">{selectedBook.publisher}</strong></p>
              </div>

              {/* Specs parameters table metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Kode Rak Buku</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-primary mr-1" />
                    {selectedBook.shelf}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Tahun Terbit</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedBook.year}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Eksemplar</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedBook.copies} Unit</p>
                </div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Status Stok</span>
                  {(() => {
                    const total = selectedBook.copies ?? selectedBook.totalCopies ?? 1;
                    const borrowed = typeof selectedBook.borrowedCopies === 'number' ? selectedBook.borrowedCopies : (total - selectedBook.availableCopies);
                    let displayText = `${selectedBook.availableCopies} Tersedia`;
                    let displayColor = 'text-primary-dark';
                    
                    if (selectedBook.availableCopies > 0) {
                      displayText = `${selectedBook.availableCopies} dari ${total} eksemplar tersedia`;
                      displayColor = 'text-emerald-700';
                    } else if (selectedBook.isUnavailableManual || selectedBook.status === 'Tidak Tersedia' || (selectedBook.availableCopies === 0 && borrowed === 0)) {
                      displayText = 'Tidak Tersedia';
                      displayColor = 'text-rose-600';
                    } else {
                      displayText = 'Semua Dipinjam';
                      displayColor = 'text-amber-600';
                    }
                    return (
                      <p className={`text-xs font-bold mt-0.5 ${displayColor}`}>
                        {displayText}
                      </p>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-950">Sinopsis / Ringkasan Buku:</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedBook.description}</p>
              </div>

              {(() => {
                const activeStatuses = ['Menunggu', 'Disetujui', 'Dipinjam', 'Terlambat'];
                const activeUserBorrows = userBorrows.filter(b => activeStatuses.includes(b.status));

                const isAlreadyActivelyBorrowed = currentUser.role === 'Mahasiswa' && 
                  activeUserBorrows.some(b => b.bookId === selectedBook.id);

                const hasReachedActiveLimit = currentUser.role === 'Mahasiswa' && 
                  activeUserBorrows.length >= 3;

                const isBookOutOfStock = selectedBook.availableCopies === 0;

                let buttonDisabled = isBookOutOfStock || isAlreadyActivelyBorrowed || hasReachedActiveLimit;
                let buttonText = 'Ajukan Peminjaman Buku';
                let helperText = '';

                if (isBookOutOfStock) {
                  buttonText = 'Stok Kosong (Dipinjam)';
                } else if (isAlreadyActivelyBorrowed) {
                  buttonText = 'Sedang Dipinjam';
                  helperText = 'Buku ini sedang dalam peminjaman aktif Anda.';
                } else if (hasReachedActiveLimit) {
                  buttonText = 'Batas Maksimal Tercapai';
                  helperText = 'Batas maksimal peminjaman 3 buku telah tercapai.';
                }

                return (
                  <div className="space-y-3 w-full">
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 items-center">
                      <button
                        disabled={buttonDisabled}
                        onClick={() => setCheckoutBook(selectedBook)}
                        className={`px-6 py-3 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 ${
                          buttonDisabled
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-primary hover:bg-primary-dark text-white shadow-primary/10 cursor-pointer'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>{buttonText}</span>
                      </button>

                      <button
                        onClick={() => {
                          isFavorited(selectedBook.id) ? onRemoveFavorite(selectedBook.id) : onAddFavorite(selectedBook.id);
                          triggerAlert(isFavorited(selectedBook.id) ? 'Buku dihapus dari daftar favorit.' : 'Buku berhasil disimpan ke daftar favorit.');
                        }}
                        className="px-5 py-3 border border-slate-200 hover:border-primary border-soft rounded-xl hover:bg-background-soft text-slate-700 font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 ${isFavorited(selectedBook.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                        <span>{isFavorited(selectedBook.id) ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}</span>
                      </button>
                    </div>
                    {helperText && (
                      <p className="text-xs font-bold text-rose-600 flex items-center mt-2">
                        <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600 shrink-0" />
                        {helperText}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

       {/* RENDER CONFIG: CONFIRMATION PROCESS / CHECKOUT SCREEN */}
      {checkoutBook && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display text-primary-dark">Konfirmasi Pengajuan Peminjaman</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tinjau saksama syarat dan tenggat pengembalian s sirkulasi s sebelum mensubmit</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
            {/* Book specs */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 border-b pb-2">Informasi Buku Rujukan</h3>
              <div className="flex space-x-3.5">
                <div className="w-10 h-14 rounded-xs shrink-0" style={{ background: checkoutBook.coverUrl }}></div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-900">{checkoutBook.title}</h4>
                  <p className="text-slate-500">Penulis: {checkoutBook.author}</p>
                  <p className="text-[10px] text-primary font-semibold uppercase">{checkoutBook.category} &bull; {checkoutBook.shelf}</p>
                </div>
              </div>
            </div>

            {/* User specs */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 border-b pb-2 font-display">Data Peminjam Akademik</h3>
              <div className="grid grid-cols-2 gap-3 font-semibold text-slate-500">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Nama Lengkap</span>
                  <p className="text-slate-900">{currentUser.name}</p>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">NIM / NIP</span>
                  <p className="text-slate-900 font-mono">{currentUser.id}</p>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Tanggal Pengajuan</span>
                  <p className="text-slate-900">{today}</p>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Estimasi Tenggat Pengembalian</span>
                  <p className="text-primary-dark font-extrabold">{returnDueDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sanksi rules */}
          <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-orange-900 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5 shrink-0" />
              Aturan Sirkulasi & Sanksi Keterlambatan Perpustakaan FST:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 font-semibold leading-normal">
              <li>Maksimal waktu peminjaman buku sirkulasi fisik adalah 7 hari kalender.</li>
              <li>Dosen dapat meminta kelonggaran perpanjangan waktu peminjaman hingga 14 hari melalui desk khusus.</li>
              <li>Keterlambatan pengembalian buku dikenakan denda administrasi sebesar <strong>Rp 1.000 / hari per buku</strong>.</li>
              <li>Buku yang hilang wajib diganti dengan judul dan edisi yang sama atau ganti rugi senilai harga pasar buku saat ini.</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catatan Alasan Pinjam (Keperluan Tugas, Skripsi, Riset, dll)</label>
            <textarea
              value={borrowNotes}
              onChange={(e) => setBorrowNotes(e.target.value)}
              rows={2}
              placeholder="Contoh: Keperluan rujukan penulisan bab 3 tugas mandiri rekayasa mesin..."
              className="w-full text-xs font-semibold p-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              onClick={() => setCheckoutBook(null)}
              className="px-4.5 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-lg transition"
            >
              Batal
            </button>
            <button
              onClick={handleApplyBorrow}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-lg shadow-md transition cursor-pointer"
            >
              Konfirmasi Peminjaman
            </button>
          </div>
        </div>
      )}

      {/* RENDER SUBVIEW 3: PEMINJAMAN SAYA PAGE */}
       {currentSubView === 'peminjaman' && !selectedBook && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display text-primary-dark">Transaksi Pinjaman Saya</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pantau status pengajuan buku dan tenggat waktu pengembalian buku yang Anda bawa</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {userBorrows.filter(b => b.status === 'Dipinjam' || b.status === 'Menunggu' || b.status === 'Terlambat').length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <BookOpen className="w-10 h-10 text-slate-350 mx-auto" />
                <h4 className="font-bold text-slate-700">Tidak Ada Pinjaman Aktif</h4>
                <p className="text-xs">Silakan telusuri katalog digital untuk menemukan rujukan sains dan teknologi.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                <thead className="bg-slate-50/70">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Buku</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tgl Diajukan</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tgl Pinjam</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Batas Kembali</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Transaksi</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {userBorrows.filter(b => b.status === 'Dipinjam' || b.status === 'Menunggu' || b.status === 'Terlambat').map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-10 rounded-xs shrink-0" style={{ background: record.bookCover }}></div>
                          <div>
                            <span className="font-bold text-slate-900">{record.bookTitle}</span>
                            <span className="block text-[10px] text-slate-450 font-mono text-slate-400 uppercase">T-ID: {record.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{record.requestDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{record.borrowDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-primary-dark">{record.dueDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          record.status === 'Menunggu' ? 'bg-amber-100 text-amber-800' :
                          record.status === 'Dipinjam' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'Terlambat' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {record.status === 'Menunggu' ? (
                          <span className="text-xs text-slate-400">Menunggu Admin</span>
                        ) : record.status === 'Terlambat' ? (
                          <span className="text-rose-600 font-extrabold text-[11px] uppercase">Harap Kembalikan</span>
                        ) : (
                          <span className="text-blue-500 text-[11px] font-semibold">Tangan Anggota</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* RENDER SUBVIEW 4: RIWAYAT PEMINJAMAN ALL PAGE */}
      {currentSubView === 'riwayat' && !selectedBook && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display text-primary-dark">Riwayat Seluruh Transaksi</h2>
            <p className="text-xs text-slate-500 mt-0.5">Arsip seluruh pengajuan peminjaman buku, baik yang berhasil diselesaikan maupun ditolak</p>
          </div>

          {/* Quick toggle filters */}
          <div className="flex flex-wrap gap-2">
            {(['Semua', 'Selesai', 'Terlambat', 'Ditolak'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setHistoryFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  historyFilter === status
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {status === 'Selesai' ? 'Kembali (Selesai)' : status}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {userBorrows.filter(b => {
              if (historyFilter === 'Semua') return true;
              if (historyFilter === 'Selesai') return b.status === 'Dikembalikan';
              if (historyFilter === 'Terlambat') return b.status === 'Terlambat';
              return b.status === 'Ditolak';
            }).length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-xs font-bold">Tidak ada catatan riwayat dengan kriteria filter tersebut.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                <thead className="bg-slate-50/70 font-display">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-slate-500 uppercase tracking-wider">Judul Koleksi</th>
                    <th scope="col" className="px-6 py-4 text-slate-500 uppercase tracking-wider">Tgl Pinjam</th>
                    <th scope="col" className="px-6 py-4 text-slate-500 uppercase tracking-wider">Tgl Kembali</th>
                    <th scope="col" className="px-6 py-4 text-slate-500 uppercase tracking-wider">Status Arsip</th>
                    <th scope="col" className="px-6 py-4 text-slate-500 uppercase tracking-wider">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {userBorrows.filter(b => {
                    if (historyFilter === 'Semua') return true;
                    if (historyFilter === 'Selesai') return b.status === 'Dikembalikan';
                    if (historyFilter === 'Terlambat') return b.status === 'Terlambat';
                    return b.status === 'Ditolak';
                  }).map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-10 rounded-xs shrink-0" style={{ background: record.bookCover }}></div>
                          <div>
                            <span className="font-bold text-slate-900">{record.bookTitle}</span>
                            <span className="block text-[9px] text-slate-400 uppercase font-mono">T-ID: {record.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{record.borrowDate || record.requestDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{record.returnDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.status === 'Dikembalikan' ? 'bg-slate-100 text-slate-800' :
                          record.status === 'Ditolak' ? 'bg-rose-100 text-rose-800 border-none' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {record.status === 'Dikembalikan' ? 'Dikembalikan' : record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-500 text-[10px]" title={record.notes}>
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* RENDER SUBVIEW 5: DAFTAR FAVORIT */}
      {currentSubView === 'favorit' && !selectedBook && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display text-primary-dark">Daftar Buku Favorit Saya</h2>
            <p className="text-xs text-slate-500 mt-0.5">Koleksi rujukan yang Anda tandai untuk dipelajari atau dipinjam nanti</p>
          </div>

          {favorites.filter(f => f.userId === currentUser.id).length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
              <Heart className="w-8 h-8 text-rose-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">Belum Ada Buku Favorit</p>
              <p className="text-[11px]">Tambahkan buku dari detail buku dengan menekan tanda berbentuk hati.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.filter(f => f.userId === currentUser.id).map((fav) => {
                const book = books.find(b => b.id === fav.bookId);
                if (!book) return null;
                return (
                  <div key={fav.id} className="bg-white p-4.5 rounded-xl border border-slate-200/80 flex items-center space-x-4 shadow-xs">
                    <div className="w-14 h-20 rounded-lg shadow-sm shrink-0" style={{ background: book.coverUrl }}></div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-[10px] font-bold text-primary-dark uppercase bg-background-soft px-2 py-0.5 rounded border border-border-soft w-max">{book.category}</p>
                      <h4 className="font-bold text-slate-900 text-sm truncate">{book.title}</h4>
                      <p className="text-xs text-slate-500 truncate">Oleh: {book.author}</p>
                      
                      <div className="flex space-x-3 pt-1 text-[11px] font-bold">
                        <span onClick={() => setSelectedBook(book)} className="text-primary hover:underline cursor-pointer">
                          Lihat Detail
                        </span>
                        <span onClick={() => { onRemoveFavorite(book.id); triggerAlert('Sukses menghapus buku dari favorit.'); }} className="text-rose-500 hover:underline cursor-pointer">
                          Hapus
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER SUBVIEW 6: NOTIFIKASI ALL LIST */}
      {currentSubView === 'notifikasi' && !selectedBook && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display text-primary-dark">Kotak Masuk Notifikasi</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Keterangan sirkulasi terbaru mengenai persetujuan, pengembalian, maupun jatuh tempo peminjaman Anda.</p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={onClearAllNotifications}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary-dark font-bold text-xs rounded-lg transition border border-primary/20 cursor-pointer shadow-2xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto mt-6">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 text-amber-600">
                <Bell className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-slate-850 text-base font-display">Belum ada notifikasi layanan.</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Notifikasi akan muncul ketika ada persetujuan peminjaman, pengembalian buku, atau informasi jatuh tempo.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-w-4xl">
              {notifications.map((notif, index) => {
                const getIcon = () => {
                  switch (notif.type) {
                    case 'Persetujuan':
                      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
                    case 'Penolakan':
                      return <XCircle className="w-4 h-4 text-rose-600" />;
                    case 'JatuhTempo':
                      return <Clock className="w-4 h-4 text-amber-600" />;
                    case 'Pengembalian':
                      return <RefreshCw className="w-4 h-4 text-blue-600" />;
                    default:
                      return <Bell className="w-4 h-4 text-slate-600" />;
                  }
                };

                const getBgClass = () => {
                  if (!notif.isRead) {
                    return 'bg-white border-l-4 border-l-primary border-y border-r border-slate-200/85 shadow-xs';
                  }
                  return 'bg-slate-50/60 border border-slate-200/50 opacity-85';
                };

                const getIconBgClass = () => {
                  switch (notif.type) {
                    case 'Persetujuan':
                      return 'bg-emerald-50';
                    case 'Penolakan':
                      return 'bg-rose-50';
                    case 'JatuhTempo':
                      return 'bg-amber-50';
                    case 'Pengembalian':
                      return 'bg-blue-50';
                    default:
                      return 'bg-slate-100';
                  }
                };

                const getActionDetails = () => {
                  const title = notif.title.toLowerCase();
                  const type = notif.type;
                  
                  if (type === 'Persetujuan' || title.includes('setuj')) {
                    return { label: 'Lihat Peminjaman', tab: 'peminjaman' };
                  }
                  if (type === 'Penolakan' || title.includes('tolak')) {
                    return { label: 'Lihat Riwayat', tab: 'riwayat' };
                  }
                  if (type === 'Pengembalian' || title.includes('kembali')) {
                    return { label: 'Lihat Riwayat', tab: 'riwayat' };
                  }
                  if (type === 'JatuhTempo' || title.includes('tempo') || title.includes('lambat')) {
                    return { label: 'Lihat Peminjaman', tab: 'peminjaman' };
                  }
                  return { label: 'Lihat Peminjaman', tab: 'peminjaman' };
                };

                const actionDetails = getActionDetails();

                return (
                  <div key={`${notif.id}-${index}`} className={`p-4 rounded-xl transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${getBgClass()}`}>
                    <div className="flex items-start space-x-3.5">
                      <div className={`p-2.5 rounded-lg shrink-0 ${getIconBgClass()}`}>
                        {getIcon()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-850 leading-snug">{notif.title}</h4>
                          {!notif.isRead && (
                            <span className="px-2 py-0.5 text-[8px] font-black uppercase bg-primary-dark/10 text-primary-dark rounded-full border border-primary-dark/25 tracking-wider animate-pulse">
                              Baru
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-650 leading-relaxed font-medium">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{notif.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 sm:self-center self-end pt-2 sm:pt-0">
                      <button
                        onClick={() => onChangeSubView(actionDetails.tab)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md transition cursor-pointer"
                      >
                        <span>{actionDetails.label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {!notif.isRead && (
                        <button
                          onClick={() => onClearNotification(notif.id)}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-md transition cursor-pointer"
                        >
                          Tandai Dibaca
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER SUBVIEW 7: PROFIL ANGGOTA */}
      {currentSubView === 'profil' && !selectedBook && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display text-primary-dark">Profil Anggota Perpustakaan</h2>
            <p className="text-xs text-slate-500 mt-1">Informasi kartu anggota digital terintegrasi Perpustakaan Digital FST</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: PROFILE CARD AND AVATAR ACTIONS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <img
                    src={previewImage || currentUser.avatarImage || currentUser.avatar || DEFAULT_AVATAR}
                    referrerPolicy="no-referrer"
                    alt={currentUser.name}
                    className="w-28 h-28 rounded-full border-4 border-background-soft shadow-md object-cover bg-slate-50"
                  />
                  {previewImage && (
                    <span className="absolute bottom-0 right-0 bg-primary text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                      Preview
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-slate-900 font-display leading-tight">{currentUser.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-background-soft text-primary-dark border border-border-soft">
                    {currentUser.role}
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="user-profile-img-selector"
                />

                <div className="flex flex-wrap gap-2 justify-center w-full">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-w-[120px] px-3 py-2 text-[11px] font-bold text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition rounded-lg cursor-pointer"
                  >
                    Upload Foto Profil
                  </button>

                  {previewImage && (
                    <button
                      type="button"
                      onClick={handleSavePhoto}
                      className="flex-1 min-w-[120px] px-3 py-2 text-[11px] font-bold text-white bg-primary hover:bg-primary-dark transition rounded-lg shadow-xs cursor-pointer"
                    >
                      Simpan Foto
                    </button>
                  )}

                  {(currentUser.avatar || previewImage) && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex-1 min-w-[120px] px-3 py-2 text-[11px] font-bold text-rose-650 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 rounded-lg transition cursor-pointer"
                    >
                      Hapus Foto Profil
                    </button>
                  )}
                </div>
              </div>

              {/* CARD DETAILS */}
              <div className="border-t border-slate-100 pt-5 space-y-3.5 text-xs font-medium">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Email Terdaftar</span>
                  <span className="text-slate-800 font-bold">{currentUser.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100/60 pt-3">
                  <span className="text-slate-400">ID Registrasi</span>
                  <span className="text-slate-800 font-mono font-bold">{currentUser.id}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100/60 pt-3">
                  <span className="text-slate-400">NIM / NIP</span>
                  <span className="text-slate-800 font-bold">{currentUser.nimNip || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100/60 pt-3">
                  <span className="text-slate-400">Fakultas</span>
                  <span className="text-slate-800 font-bold font-sans">{currentUser.fakultas || 'Fakultas Sains dan Teknologi'}</span>
                </div>
                {currentUser.role === 'Mahasiswa' && (
                  <div className="flex justify-between items-center py-1 border-t border-slate-100/60 pt-3">
                    <span className="text-slate-400">Program Studi</span>
                    <span className="text-slate-800 font-bold">{currentUser.programStudi || 'Teknik Informatika'}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1 border-t border-slate-100/60 pt-3">
                  <span className="text-slate-400">Status Akun</span>
                  <span className="text-emerald-600 font-black flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 inline-block"></span>
                    Aktif
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100/60 pt-3">
                  <span className="text-slate-400">Terdaftar Sejak</span>
                  <span className="text-slate-850 font-bold">{currentUser.registeredAt || '24 Juni 2026'}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACTIVITY SUMMARY & LIMIT INFORMATION */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ringkasan Aktivitas Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5 text-primary-dark" />
                  <h3 className="font-extrabold text-sm text-slate-900 font-display">Ringkasan Aktivitas</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Buku Dipinjam</span>
                    <h4 className="text-xl font-black text-slate-800 mt-1">
                      {userBorrows.filter(b => b.status === 'Dipinjam' || b.status === 'Terlambat').length}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">Sirkulasi berjalan</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Menunggu Persetujuan</span>
                    <h4 className="text-xl font-black text-amber-600 mt-1">
                      {pendingBorrows.length}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">Pengajuan pinjaman</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Riwayat Peminjaman</span>
                    <h4 className="text-xl font-black text-slate-800 mt-1">
                      {userBorrows.length}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">Total sirkulasi</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {currentUser.role === 'Mahasiswa' ? 'Buku Favorit' : 'Referensi Disimpan'}
                    </span>
                    <h4 className="text-xl font-black text-primary-dark mt-1">
                      {favorites.filter(f => f.userId === currentUser.id).length}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">
                      {currentUser.role === 'Mahasiswa' ? 'Koleksi disukai' : 'Referensi akademik'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Information Cards */}
              <div className="space-y-4.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                  {/* Card 1: Batas Peminjaman */}
                  <div className="flex items-start space-x-3.5 p-4.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <span className="p-2.5 bg-background-soft rounded-xl border border-border-soft text-primary-dark shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <div className="space-y-3.5 flex-1 min-w-0">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900 font-display uppercase tracking-wide">Batas Peminjaman</h4>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          {currentUser.role === 'Mahasiswa' ? (
                            'Keanggotaan Anda dibatasi maksimal meminjam 3 buku sekaligus.'
                          ) : (
                            <>
                              Sebagai Dosen, Anda tidak memiliki batas maksimal peminjaman buku.
                              <br /><br />
                              Hak peminjaman dapat digunakan untuk mendukung kegiatan akademik, penelitian, dan pengabdian kepada masyarakat.
                            </>
                          )}
                        </p>
                      </div>
                      
                      {currentUser.role === 'Mahasiswa' && (
                        <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium">Sisa Peminjaman</span>
                          <span className="text-slate-800 font-bold">{remainingQuota} dari {maxBorrowLimit} Buku</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Akreditasi Akun */}
                  <div className="flex items-start space-x-3.5 p-4.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <span className="p-2.5 bg-background-soft rounded-xl border border-border-soft text-primary-dark shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </span>
                    <div className="space-y-3.5 flex-1 min-w-0">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900 font-display uppercase tracking-wide">Akreditasi Akun</h4>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          {accountAccreditation === 'Suspended' ? (
                            'Akun Anda sedang ditangguhkan karena masih memiliki kewajiban yang belum diselesaikan, seperti buku yang terlambat dikembalikan atau denda administrasi. Silakan selesaikan kewajiban tersebut agar status akun kembali aktif.'
                          ) : accountAccreditation === 'Nonaktif' ? (
                            'Akun Anda saat ini dinonaktifkan. Silakan hubungi bagian administrasi perpustakaan untuk mengaktifkan kembali akun Anda.'
                          ) : accountAccreditation === 'Pending Verification' ? (
                            'Akun Anda sedang dalam proses verifikasi oleh pustakawan. Beberapa fitur peminjaman mungkin dibatasi sementara.'
                          ) : (
                            'Akun Anda dalam kondisi aktif dan tidak memiliki sanksi administrasi maupun penangguhan. Anda dapat menggunakan seluruh layanan perpustakaan secara normal.'
                          )}
                        </p>
                      </div>
                      
                      <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Status Akun</span>
                        <span className={`font-bold ${
                          accountAccreditation === 'Accredited' ? 'text-emerald-600' :
                          accountAccreditation === 'Pending Verification' ? 'text-amber-600' :
                          'text-rose-600'
                        }`}>{
                          accountAccreditation === 'Accredited' ? 'Aktif' :
                          accountAccreditation === 'Pending Verification' ? 'Menunggu Verifikasi' :
                          accountAccreditation === 'Nonaktif' ? 'Nonaktif' :
                          'Ditangguhkan'
                        }</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Keamanan Akun */}
                <div className="flex items-start space-x-3.5 p-4.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                  <span className="p-2.5 bg-background-soft rounded-xl border border-border-soft text-primary-dark shrink-0">
                    <Shield className="w-5 h-5" />
                  </span>
                  <div className="space-y-3.5 flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900 font-display uppercase tracking-wide">Keamanan Akun</h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Kelola keamanan akun Anda.
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="text-[11px] font-bold text-primary-dark hover:text-primary transition duration-150 flex items-center space-x-1 cursor-pointer hover:underline"
                      >
                        <span>Ubah Kata Sandi →</span>
                      </button>
                    </div>
                    
                    <div className="pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4.5 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 font-medium block">Login Terakhir</span>
                        <span className="text-slate-800 font-bold block">{currentUser.lastLogin || getJakartaTimestamp()}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 font-medium block">Perangkat Terakhir</span>
                        <span className="text-slate-800 font-bold block">{currentUser.lastDevice || getDeviceString()}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 font-medium block">Lokasi Terakhir</span>
                        <span className="text-slate-800 font-bold block">{currentUser.lastLocation || 'Jakarta, Indonesia'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOM CONFIRMATION DIALOG FOR PHOTO DELETION */}
          {showDeletePhotoConfirm && (
            <div 
              className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
              style={{ zIndex: 10000 }}
              onClick={() => setShowDeletePhotoConfirm(false)}
            >
              <div 
                className="bg-white p-7 rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-3 text-amber-600">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <h3 className="text-base font-bold text-slate-900 font-display">Konfirmasi Hapus</h3>
                </div>
                <p className="text-sm text-slate-650 font-medium">Yakin ingin menghapus foto profil?</p>
                <div className="flex space-x-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDeletePhotoConfirm(false)}
                    className="flex-1 py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-sm transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={confirmRemovePhoto}
                    className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm transition cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECURE PASSWORD CHANGE MODAL */}
          {showPasswordModal && (
            <div 
              className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
              style={{ zIndex: 10000 }}
              onClick={() => {
                setShowPasswordModal(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowOldPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
                setPasswordError(null);
              }}
            >
              <div 
                className="bg-white rounded-2xl max-w-md w-full border border-slate-150 shadow-2xl overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-primary-dark">
                    <Lock className="w-5 h-5" />
                    <h3 className="text-base font-bold text-slate-900 font-display">Ubah Kata Sandi</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setShowOldPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                      setPasswordError(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handlePasswordChangeSubmit} className="p-6 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pastikan kata sandi baru Anda aman dan sulit ditebak oleh orang lain.
                  </p>

                  {passwordError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2 text-rose-700 animate-shake">
                      <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-500" />
                      <span className="text-xs font-semibold">{passwordError}</span>
                    </div>
                  )}

                  {/* Kata Sandi Lama */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-700 tracking-wide uppercase">
                      Kata Sandi Lama <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative rounded-lg">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type={showOldPassword ? "text" : "password"}
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary-dark transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Kata Sandi Baru */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-700 tracking-wide uppercase">
                      Kata Sandi Baru <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative rounded-lg">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary-dark transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Kata Sandi Baru */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-700 tracking-wide uppercase">
                      Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative rounded-lg">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary-dark transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="flex space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setShowOldPassword(false);
                        setShowNewPassword(false);
                        setShowConfirmPassword(false);
                        setPasswordError(null);
                      }}
                      className="flex-1 py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-sm transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!oldPassword || !newPassword || !confirmPassword}
                      className={`flex-1 py-2 px-4 text-white font-bold rounded-lg text-sm transition cursor-pointer ${
                        (!oldPassword || !newPassword || !confirmPassword)
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed border-transparent"
                          : "bg-primary-dark hover:bg-primary-dark/90 text-white shadow-sm"
                      }`}
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
