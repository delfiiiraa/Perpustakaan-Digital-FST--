import { Book, User, BorrowRecord, Notification } from '../types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'B001',
    title: 'Struktur Data dan Algoritma',
    author: 'Dr. Eng. Riza Muhammad',
    publisher: 'FST Press',
    year: 2022,
    category: 'Teknologi Informasi',
    shelf: 'RAK-A1',
    copies: 5,
    availableCopies: 3,
    status: 'Tersedia',
    description: 'Buku ini membahas konsep penting struktur data dasar seperti array, linked list, stack, queue, tree, dan graph, serta algoritma analisis kompleksitas, pengurutan (sorting), dan pencarian (searching) yang diimplementasikan secara interaktif.',
    coverUrl: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', // Warm Amber style
    isAcademic: false
  },
  {
    id: 'B002',
    title: 'Basis Data: Teori dan Praktis',
    author: 'Prof. H. Kusnassriyanto',
    publisher: 'Penerbit FST',
    year: 2021,
    category: 'Sistem Informasi',
    shelf: 'RAK-B2',
    copies: 4,
    availableCopies: 2,
    status: 'Tersedia',
    description: 'Panduan lengkap dalam mempelajari perancangan database relasional, dasar SQL query, normalisasi data (1NF, 2NF, 3NF, BCNF), manajemen transaksi database, serta pengenalan dasar-dasar sistem NoSQL.',
    coverUrl: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', // Golden Brown Slate
    isAcademic: false
  },
  {
    id: 'B003',
    title: 'Rekayasa Perangkat Lunak Modern',
    author: 'Rosa A. S. & M. Shalahuddin',
    publisher: 'Informatika Bandung',
    year: 2020,
    category: 'Teknologi Informasi',
    shelf: 'RAK-A3',
    copies: 3,
    availableCopies: 1,
    status: 'Tersedia',
    description: 'Memahami siklus hidup pengembangan perangkat lunak (SDLC) menggunakan paradigma modern seperti Scrum dan Agile. Membahas fungsionalitas analisis kebutuhan sistem, perancangan diagram UML lengkap, dan pengujian program.',
    coverUrl: 'linear-gradient(135deg, #075985 0%, #0369a1 100%)', // Ocean Blue
    isAcademic: false
  },
  {
    id: 'B004',
    title: 'Sistem Operasi Kontemporer',
    author: 'Abraham Silberschatz',
    publisher: 'Erlangga',
    year: 2019,
    category: 'Ilmu Komputer',
    shelf: 'RAK-C1',
    copies: 2,
    availableCopies: 0,
    status: 'Tidak Tersedia',
    description: 'Buku teori dasar sistem operasi komputasi modern. Mengupas tuntas tentang manajemen proses, koordinasi thread, sinkronisasi, penjadwalan CPU, manajemen memori virtual, proteksi & keamanan, serta studi kasus sistem Linux dan Windows.',
    coverUrl: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', // Slate dark style
    isAcademic: false
  },
  {
    id: 'B005',
    title: 'Jaringan Komputer Global',
    author: 'Andrew S. Tanenbaum',
    publisher: 'Pearson Education',
    year: 2021,
    category: 'Jaringan Komputer',
    shelf: 'RAK-D1',
    copies: 6,
    availableCopies: 4,
    status: 'Tersedia',
    description: 'Mengulas arsitektur jaringan komputer modern, model referensi 7-layer OSI dan TCP/IP, protokol routing dinamis, konsep wireless network, transmisi fisik media kabel, serta aspek fundamental keamanan cyber cloud.',
    coverUrl: 'linear-gradient(135deg, #3730a3 0%, #4338ca 100%)', // Indigo Classic
    isAcademic: false
  },
  {
    id: 'B006',
    title: 'Kecerdasan Buatan Terapan',
    author: 'Stuart Russell & Peter Norvig',
    publisher: 'Andi Offset',
    year: 2023,
    category: 'Kecerdasan Buatan',
    shelf: 'RAK-E1',
    copies: 4,
    availableCopies: 3,
    status: 'Tersedia',
    description: 'Memperkenalkan kecerdasan buatan (AI) modern melalui pendekatan rasional agent. Topik yang dibahas mencakup search algorithms, propositional logic, neural networks, machine learning, computer vision, dan natural language processing.',
    coverUrl: 'linear-gradient(135deg, #85144b 0%, #b10dc9 100%)', // Purple Crimson
    isAcademic: false
  },
  {
    id: 'B007',
    title: 'Pemrograman Web Responsif',
    author: 'Budi Raharjo',
    publisher: 'Modula Bandung',
    year: 2022,
    category: 'Teknologi Informasi',
    shelf: 'RAK-A2',
    copies: 5,
    availableCopies: 5,
    status: 'Tersedia',
    description: 'Panduan lengkap rekayasa antarmuka web modern menggunakan standar HTML5, CSS Grid & Flexbox, Tailwind CSS, Javascript Modern ES6, pemrograman asinkronus (fetch API), serta pemanfaatan Node.js di server.',
    coverUrl: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)', // Burnt Orange
    isAcademic: false
  },
  {
    id: 'B008',
    title: 'Analisis dan Perancangan Sistem',
    author: 'Kenneth E. Kendall',
    publisher: 'Prenhallindo',
    year: 2018,
    category: 'Sistem Informasi',
    shelf: 'RAK-B1',
    copies: 3,
    availableCopies: 2,
    status: 'Tersedia',
    description: 'Membahas perancangan serta evaluasi sistem berbasis komputer bagi dunia bisnis. Mengulas pemodelan sistem menggunakan Data Flow Diagram (DFD), kamus data, diagram relasi entitas (ERD), dan teknik iterasi prototyping terarah.',
    coverUrl: 'linear-gradient(135deg, #a16207 0%, #ca8a04 100%)', // Antique Bronze Gold
    isAcademic: false
  },
  {
    id: 'B009',
    title: 'Machine Learning untuk Pemula',
    author: 'Aurelien Geron',
    publisher: "O'Reilly Media",
    year: 2022,
    category: 'Kecerdasan Buatan',
    shelf: 'RAK-E2',
    copies: 2,
    availableCopies: 0,
    status: 'Dipinjam',
    description: 'Konsep praktis dasar machine learning menggunakan pustaka Scikit-Learn dan TensorFlow. Berisi penjelasan model klasifikasi linear, regresi numerik, clustering k-means, neural network, deep learning, serta implementasi pipeline data cerdas.',
    coverUrl: 'linear-gradient(135deg, #9f1239 0%, #be123c 100%)', // Deep Rose
    isAcademic: false
  },
  {
    id: 'B010',
    title: 'Etika Profesi Teknologi Informasi',
    author: 'Ir. Teguh Wahyono',
    publisher: 'Graha Ilmu',
    year: 2021,
    category: 'Umum FST',
    shelf: 'RAK-F1',
    copies: 5,
    availableCopies: 5,
    status: 'Tersedia',
    description: 'Kajian mendalam mengenai urgensi etika profesionalisme demi mewujudkan tata kelola TI yang sehat. Membahas regulasi hak cipta (HAKI), ancaman cybercrime global, UU ITE Indonesia, serta kode etik analis sistem dan developer.',
    coverUrl: 'linear-gradient(135deg, #5b21b6 0%, #6d28d9 100%)', // Purple Violet
    isAcademic: false
  },
  {
    id: 'B011',
    title: 'Pemanfaatan IoT untuk Monitoring Fisika',
    author: 'Tim Laboratorium FST',
    publisher: 'Fakultas Sains dan Teknologi',
    year: 2023,
    category: 'Referensi Akademik',
    shelf: 'RAK-J1',
    copies: 2,
    availableCopies: 2,
    status: 'Tersedia',
    description: 'Jurnal ilmiah berkala yang memuat riset penerapan sensor internet of things (IoT) berbasis mikrokontroler NodeMCU ESP8266 untuk visualisasi data praktikum mekanika dan optika di laboratorium fisika modern FST.',
    coverUrl: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)', // Light Blue Academic
    isAcademic: true
  },
  {
    id: 'B012',
    title: 'Thesis: Klasifikasi Penyakit Kulit Berbasis Deep Learning',
    author: 'Andi Pratama, S.Kom',
    publisher: 'Perpustakaan FST',
    year: 2024,
    category: 'Referensi Akademik',
    shelf: 'RAK-J2',
    copies: 1,
    availableCopies: 1,
    status: 'Tersedia',
    description: 'Koleksi thesis penelitian akhir mahasiswa FST bertema computer vision dan deep learning. Mengimplementasikan arsitektur Convolutional Neural Network (CNN) kustom untuk pemetaan segmentasi lesi kulit berskala klinis.',
    coverUrl: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)', // Cyan Academic
    isAcademic: true
  },
  {
    id: 'B013',
    title: 'Kalkulus Purba & Analisis Geometri',
    author: 'Edwin J. Purcell',
    publisher: 'Erlangga',
    year: 2020,
    category: 'Matematika',
    shelf: 'RAK-M1',
    copies: 3,
    availableCopies: 3,
    status: 'Tersedia',
    description: 'Buku wajib kalkulus yang membahas limit, turunan, integral, geometri analitik, deret tak terhingga, serta pengenalan dasar-dasar kalkulus peubah banyak.',
    coverUrl: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    isAcademic: false
  },
  {
    id: 'B014',
    title: 'Kimia Organik Dasar',
    author: 'John McMurry',
    publisher: 'Penerbit FST',
    year: 2021,
    category: 'Kimia',
    shelf: 'RAK-K1',
    copies: 2,
    availableCopies: 2,
    status: 'Tersedia',
    description: 'Buku rujukan utama kimia organik. Membahas struktur molekul organik, mekanisme reaksi, tata nama senyawa hidrokarbon, stereokimia, dan spektroskopi analitik.',
    coverUrl: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    isAcademic: false
  },
  {
    id: 'B015',
    title: 'Biologi Campbell Edisi 11',
    author: 'Jane B. Reece',
    publisher: 'Pearson Education',
    year: 2019,
    category: 'Biologi',
    shelf: 'RAK-BI1',
    copies: 4,
    availableCopies: 3,
    status: 'Tersedia',
    description: 'Kitab suci biologi umum yang mengulas teori sel, biologi molekuler, genetika mendel, ekologi, keanekaragaman hayati, fisiologi tumbuhan, dan bioteknologi.',
    coverUrl: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
    isAcademic: false
  },
  {
    id: 'B016',
    title: 'Pengantar Manajemen Agribisnis',
    author: 'Dr. Ir. Soekartawi',
    publisher: 'RajaGrafindo Persada',
    year: 2021,
    category: 'Agribisnis',
    shelf: 'RAK-AG1',
    copies: 3,
    availableCopies: 2,
    status: 'Tersedia',
    description: 'Buku komprehensif mengupas manajemen rantai pasok agribisnis, ekonomi pertanian, pemasaran hasil pertanian, kewirausahaan, serta kebijakan pembangunan pedesaan.',
    coverUrl: 'linear-gradient(135deg, #b45309 0%, #ca8a04 100%)',
    isAcademic: false
  },
  {
    id: 'B017',
    title: 'Eksplorasi Mineral & Geologi Pertambangan',
    author: 'Prof. Ir. Totok Herwanto',
    publisher: 'FST Press',
    year: 2022,
    category: 'Teknik Pertambangan',
    shelf: 'RAK-TP1',
    copies: 2,
    availableCopies: 2,
    status: 'Tersedia',
    description: 'Buku pegangan teknik pertambangan yang mengulas geologi fisik, survei eksplorasi mineral, perencanaan tambang terbuka, regulasi keselamatan kerja tambang, serta pengelolaan dampak lingkungan pertambangan.',
    coverUrl: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
    isAcademic: false
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: '123456', // NIM Mahasiswa
    name: 'Budi Santoso',
    email: 'mahasiswa@mhs.uinjkt.ac.id',
    role: 'Mahasiswa',
    status: 'Aktif',
    avatar: '',
    nimNip: '123456',
    fakultas: 'Fakultas Sains dan Teknologi',
    programStudi: 'Teknik Informatika',
    registeredAt: '22 Juni 2026, 09:15 WIB'
  },
  {
    id: '198705', // NIP Dosen
    name: 'Dr. Ahmad Fauzi, M.T.',
    email: 'dosen@uinjkt.ac.id',
    role: 'Dosen',
    status: 'Aktif',
    avatar: '',
    nimNip: '198705',
    fakultas: 'Fakultas Sains dan Teknologi',
    registeredAt: '22 Juni 2026, 09:30 WIB'
  },
  {
    id: 'ADMIN01', // Admin ID
    name: 'Delfira Karnain',
    email: 'admin@fst.ac.id',
    role: 'Admin',
    status: 'Aktif',
    avatar: '',
    nimNip: 'ADMIN01',
    fakultas: 'Fakultas Sains dan Teknologi',
    registeredAt: '24 Juni 2026, 09:00 WIB'
  },
  // Extra users inside list
  {
    id: '2023019',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@mhs.uinjkt.ac.id',
    role: 'Mahasiswa',
    status: 'Aktif',
    avatar: '',
    nimNip: '2023019',
    fakultas: 'Fakultas Sains dan Teknologi',
    programStudi: 'Sistem Informasi',
    registeredAt: '22 Juni 2026, 09:45 WIB'
  }
];

export const INITIAL_BORROWS: BorrowRecord[] = [
  {
    id: 'TX001',
    userId: '123456',
    userName: 'Budi Santoso',
    userRole: 'Mahasiswa',
    bookId: 'B004',
    bookTitle: 'Sistem Operasi Kontemporer',
    bookCover: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    requestDate: '2026-06-15',
    borrowDate: '2026-06-16',
    dueDate: '2026-06-23', // Jatuh tempo hari ini!
    returnDate: '',
    status: 'Dipinjam',
    notes: 'Dipinjam untuk bahan tugas bab 3.'
  },
  {
    id: 'TX002',
    userId: '123456',
    userName: 'Budi Santoso',
    userRole: 'Mahasiswa',
    bookId: 'B009',
    bookTitle: 'Machine Learning untuk Pemula',
    bookCover: 'linear-gradient(135deg, #9f1239 0%, #be123c 100%)',
    requestDate: '2026-06-12',
    borrowDate: '2026-06-13',
    dueDate: '2026-06-20',
    returnDate: '',
    status: 'Terlambat', // Terlambat 3 hari!
    notes: 'Digunakan oleh kelompok lab fisika komputer.'
  },
  {
    id: 'TX003',
    userId: '123456',
    userName: 'Budi Santoso',
    userRole: 'Mahasiswa',
    bookId: 'B001',
    bookTitle: 'Struktur Data dan Algoritma',
    bookCover: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    requestDate: '2026-06-01',
    borrowDate: '2026-06-02',
    dueDate: '2026-06-09',
    returnDate: '2026-06-08',
    status: 'Dikembalikan',
    notes: 'Selesai tugas mandiri.'
  },
  {
    id: 'TX004',
    userId: '198705',
    userName: 'Dr. Ahmad Fauzi, M.T.',
    userRole: 'Dosen',
    bookId: 'B011',
    bookTitle: 'Pemanfaatan IoT untuk Monitoring Fisika',
    bookCover: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
    requestDate: '2026-06-21',
    borrowDate: '',
    dueDate: '',
    returnDate: '',
    status: 'Menunggu',
    notes: 'Rujukan pembuatan modul kuliah fisika instrumentasi.'
  },
  {
    id: 'TX005',
    userId: '2023019',
    userName: 'Dewi Lestari',
    userRole: 'Mahasiswa',
    bookId: 'B002',
    bookTitle: 'Basis Data: Teori dan Praktis',
    bookCover: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
    requestDate: '2026-06-22',
    borrowDate: '',
    dueDate: '',
    returnDate: '',
    status: 'Menunggu',
    notes: 'Bahan mempersiapkan UTS Basis Data lanjut.'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'N001',
    userId: '123456',
    title: 'Pengembalian Buku Berhasil',
    message: 'Buku "Struktur Data dan Algoritma" telah sukses dikembalikan ke pustakawan. Terima kasih telah tepat waktu!',
    date: '2026-06-08',
    isRead: true,
    type: 'Pengembalian'
  },
  {
    id: 'N002',
    userId: '123456',
    title: 'Peringatan Jatuh Tempo!',
    message: 'Buku "Sistem Operasi Kontemporer" yang Anda pinjam jatuh tempo hari ini (23 Juni 2026). Harap segera lakukan pengembalian.',
    date: '2026-06-23',
    isRead: false,
    type: 'JatuhTempo'
  },
  {
    id: 'N003',
    userId: '123456',
    title: 'Peringatan Keterlambatan!',
    message: 'Anda terlambat mengembalikan buku "Machine Learning untuk Pemula" selama 3 hari. Harap kembalikan segera dan selesaikan denda administrasi di perpustakaan.',
    date: '2026-06-21',
    isRead: false,
    type: 'JatuhTempo'
  },
  {
    id: 'N004',
    userId: '198705',
    title: 'Pengajuan Peminjaman Terkirim',
    message: 'Dokumen pengajuan peminjaman Jurnal Akademik IoT Anda telah sukses diserahkan ke pustakawan dan sedang diproses.',
    date: '2026-06-21',
    isRead: false,
    type: 'Persetujuan'
  }
];
