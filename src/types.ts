export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  category: string;
  shelf: string;
  copies: number;
  totalCopies?: number;
  availableCopies: number;
  borrowedCopies?: number;
  status: 'Tersedia' | 'Dipinjam' | 'Tidak Tersedia';
  description: string;
  coverUrl: string;
  isAcademic?: boolean;
  isUnavailableManual?: boolean;
}

export interface User {
  id: string; // NIM or NIP or admin email
  name: string;
  email: string;
  role: 'Mahasiswa' | 'Dosen' | 'Admin';
  status: 'Aktif' | 'Nonaktif';
  avatar: string;
  avatarImage?: string;
  registeredAt?: string;
  nimNip?: string;
  fakultas?: string;
  programStudi?: string;
  accreditationStatus?: 'Accredited' | 'Pending Verification' | 'Suspended';
  lastLogin?: string;
  lastDevice?: string;
  lastLocation?: string;
}

export const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239CA3AF" style="background-color:%23E5E7EB;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

export interface BorrowRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: 'Mahasiswa' | 'Dosen' | 'Admin';
  bookId: string;
  bookTitle: string;
  bookCover: string;
  requestDate: string; // YYYY-MM-DD
  borrowDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  status: 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Dipinjam' | 'Dikembalikan' | 'Terlambat';
  notes?: string;
  programStudi?: string;
  userEmail?: string;
}

export interface Notification {
  id: string;
  userId: string; // Recipient ID or 'All'
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'Persetujuan' | 'Penolakan' | 'JatuhTempo' | 'Pengembalian' | 'Sistem';
  eventKey?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
}

export function getJakartaTimestamp(): string {
  try {
    const now = new Date();
    const datePart = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(now);

    const timePart = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now).replace('.', ':');

    return `${datePart}, ${timePart} WIB`;
  } catch (error) {
    return "24 Juni 2026, 19:10 WIB";
  }
}

export function getDeviceString(): string {
  try {
    const ua = navigator.userAgent;
    let browser = "Chrome";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    let os = "Windows";
    if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    return `${browser} pada ${os}`;
  } catch (e) {
    return "Chrome pada Windows";
  }
}

export const BOOK_CATEGORIES = [
  'Teknologi Informasi',
  'Sistem Informasi',
  'Ilmu Komputer',
  'Jaringan Komputer',
  'Kecerdasan Buatan',
  'Umum FST',
  'Referensi Akademik',
  'Matematika',
  'Kimia',
  'Agribisnis',
  'Biologi',
  'Teknik Pertambangan'
];

export function safeLocalStorageSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage for key "${key}":`, error);
    return false;
  }
}


