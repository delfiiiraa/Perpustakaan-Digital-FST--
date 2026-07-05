import { Book, User, BorrowRecord } from '../types';
import { INITIAL_BOOKS } from '../data/dummyData';

// Indonesian student and lecturer names to generate a rich, realistic pool of members
const INDONESIAN_MOCK_NAMES = [
  'Ahmad Fauzi', 'Siti Aminah', 'Rudi Hermawan', 'Dewi Lestari', 'Muhammad Yusuf',
  'Larasati Putri', 'Rian Hidayat', 'Novi Indah', 'Andi Pratama', 'Fatimah Azzahra',
  'Bambang Wijaya', 'Sri Wahyuni', 'Dedi Setiawan', 'Eka Putri', 'Hendra Wijaya',
  'Rina Susanti', 'Agus Santoso', 'Mega Utami', 'Joko Susilo', 'Yeni Rahmawati',
  'Aditya Pratama', 'Indah Permatasari', 'Fajar Nugroho', 'Sari Safitri', 'Budi Utomo',
  'Tari Anggraini', 'Denny Cahyono', 'Wulandari Putri', 'Eko Prasetyo', 'Ratih Kumala',
  'Bayu Aji', 'Citra Kirana', 'Hadi Sucipto', 'Amalia Lestari', 'Gita Gutawa',
  'Aris Setiawan', 'Dian Sastrowardoyo', 'Herianto', 'Yulia Ningsih', 'Slamet Riyadi'
];

const PROGRAM_STUDI_LIST = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Matematika',
  'Fisika',
  'Kimia',
  'Biologi',
  'Agribisnis',
  'Teknik Pertambangan'
];

const LECTURER_TITLES = ['Dr.', 'Prof.', 'M.T.', 'M.Kom.', 'M.Si.', 'Ph.D.'];

// Helper to format date as YYYY-MM-DD
export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helper to format timestamp like "22 Juni 2026, 09:15 WIB"
export function formatJakartaTimestamp(date: Date): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
}

// Generate a random date offset
function getOffsetDate(baseDateStr: string, daysOffset: number): string {
  const [year, month, day] = baseDateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + daysOffset);
  return formatDateStr(d);
}

// Simple seedable pseudo-random generator to ensure clean generation
class SeededRandom {
  private seed: number;
  constructor(seedStr: string) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    this.seed = Math.abs(hash) || 1;
  }
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  nextRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  nextElement<T>(arr: T[]): T {
    return arr[this.nextRange(0, arr.length - 1)];
  }
}

export interface PersistentDashboardData {
  borrows: BorrowRecord[];
  users: User[];
  lastGeneratedDateStr: string;
}

export function generateDashboardDummyData(): PersistentDashboardData {
  const startDate = new Date(2026, 5, 1); // 1 Juni 2026
  const today = new Date(); // Current date (will be July 4, 2026 or later)
  
  // Safety check: if system time is somehow in the past relative to June 2026, fallback to July 4, 2026
  const endDate = today < startDate ? new Date(2026, 6, 4) : today;

  const borrows: BorrowRecord[] = [];
  const users: User[] = [];

  // 1. Generate active dummy users pool historically
  // We want about 120-150 users registered over the course of June & July
  const random = new SeededRandom('fst_library_seed_v1');
  
  // Pre-generate a list of unique student IDs and emails
  const userPool: User[] = [];
  for (let i = 0; i < 140; i++) {
    const isLecturer = random.next() < 0.15; // 15% lecturers
    const name = random.nextElement(INDONESIAN_MOCK_NAMES) + ' ' + (isLecturer ? '' : random.nextElement(['Putra', 'Pratama', 'Hidayat', 'Kurniawan', 'Wibowo', 'Sari', 'Indah', 'Lestari', 'Ningsih']));
    const role = isLecturer ? 'Dosen' : 'Mahasiswa';
    const id = isLecturer 
      ? `198${random.nextRange(70, 95)}${String(random.nextRange(1, 12)).padStart(2, '0')}`
      : `202${random.nextRange(2, 5)}019${String(i).padStart(3, '0')}`;
    
    const emailPrefix = name.toLowerCase().replace(/\s+/g, '.');
    const email = isLecturer ? `${emailPrefix}@uinjkt.ac.id` : `${emailPrefix}@mhs.uinjkt.ac.id`;
    const prodi = isLecturer ? undefined : random.nextElement(PROGRAM_STUDI_LIST);
    
    userPool.push({
      id,
      name,
      email,
      role,
      status: 'Aktif',
      avatar: '',
      nimNip: id,
      fakultas: 'Fakultas Sains dan Teknologi',
      programStudi: prodi,
      registeredAt: '' // populated during day loop
    });
  }

  // 2. Daily Loop to generate registrations and transactions
  const currentDay = new Date(startDate);
  let userPoolIndex = 0;

  while (currentDay <= endDate) {
    const dayStr = formatDateStr(currentDay);
    const dayRand = new SeededRandom(`day_seed_${dayStr}`);

    // Generate member registrations for this day (0 to 3 new members)
    const registrationsCount = dayRand.nextRange(0, 3);
    for (let r = 0; r < registrationsCount; r++) {
      if (userPoolIndex < userPool.length) {
        const user = userPool[userPoolIndex];
        const regHour = dayRand.nextRange(8, 16);
        const regMin = dayRand.nextRange(0, 59);
        const regDate = new Date(currentDay);
        regDate.setHours(regHour, regMin);
        
        user.registeredAt = formatJakartaTimestamp(regDate);
        users.push(user);
        userPoolIndex++;
      }
    }

    // Only generate transactions if we have at least 5 users registered
    if (users.length >= 5) {
      // Borrowings per day: fluctuates naturally between 2 and 7
      const borrowingsCount = dayRand.nextRange(2, 7);
      
      for (let tx = 0; tx < borrowingsCount; tx++) {
        const txRand = new SeededRandom(`tx_seed_${dayStr}_${tx}`);
        const borrower = txRand.nextElement(users);
        const book = txRand.nextElement(INITIAL_BOOKS);
        
        const reqHour = txRand.nextRange(8, 16);
        const reqMin = txRand.nextRange(0, 59);
        const reqDate = new Date(currentDay);
        reqDate.setHours(reqHour, reqMin);

        const statusRoll = txRand.next(); // 0.0 to 1.0
        
        // Structure of a dynamic transaction
        const recordId = `seed-TX-${dayStr.replace(/-/g, '')}-${tx}`;
        
        if (statusRoll < 0.10) {
          // 10% Ditolak (Rejected)
          borrows.push({
            id: recordId,
            userId: borrower.id,
            userName: borrower.name,
            userRole: borrower.role,
            bookId: book.id,
            bookTitle: book.title,
            bookCover: book.coverUrl,
            requestDate: dayStr,
            borrowDate: '',
            dueDate: '',
            returnDate: '',
            status: 'Ditolak',
            programStudi: borrower.programStudi,
            userEmail: borrower.email,
            notes: 'Pengajuan ditolak: Koleksi eksemplar sedang dibatasi / dalam perawatan.'
          });
        } else if (statusRoll < 0.15 && dayStr >= getOffsetDate(formatDateStr(endDate), -2)) {
          // 5% Menunggu (Pending approvals - only valid for last 2 days)
          borrows.push({
            id: recordId,
            userId: borrower.id,
            userName: borrower.name,
            userRole: borrower.role,
            bookId: book.id,
            bookTitle: book.title,
            bookCover: book.coverUrl,
            requestDate: dayStr,
            borrowDate: '',
            dueDate: '',
            returnDate: '',
            status: 'Menunggu',
            programStudi: borrower.programStudi,
            userEmail: borrower.email,
            notes: 'Mengajukan peminjaman buku untuk referensi tugas pemrograman.'
          });
        } else {
          // 85% approved borrowings (might be returned or outstanding or overdue)
          const borrowDate = dayStr;
          const dueDate = getOffsetDate(borrowDate, 7); // Due in 7 days
          
          const isPastDueDate = dueDate < formatDateStr(endDate);
          
          if (isPastDueDate) {
            // If the due date is in the past, 92% are successfully returned, 8% are overdue (Terlambat)
            const isOverdueOutstanding = txRand.next() < 0.08;
            
            if (isOverdueOutstanding) {
              borrows.push({
                id: recordId,
                userId: borrower.id,
                userName: borrower.name,
                userRole: borrower.role,
                bookId: book.id,
                bookTitle: book.title,
                bookCover: book.coverUrl,
                requestDate: borrowDate,
                borrowDate: borrowDate,
                dueDate: dueDate,
                returnDate: '',
                status: 'Terlambat',
                programStudi: borrower.programStudi,
                userEmail: borrower.email,
                notes: 'Keterlambatan sirkulasi pengerjaan riset akhir.'
              });
            } else {
              // Successfully returned (some might have returned late but resolved)
              const returnOffset = txRand.nextRange(2, 9); // returned within 2 to 9 days
              const returnDate = getOffsetDate(borrowDate, returnOffset);
              const returnedStatus = returnOffset > 7 ? 'Dikembalikan' : 'Dikembalikan'; // status is 'Dikembalikan' anyway

              borrows.push({
                id: recordId,
                userId: borrower.id,
                userName: borrower.name,
                userRole: borrower.role,
                bookId: book.id,
                bookTitle: book.title,
                bookCover: book.coverUrl,
                requestDate: borrowDate,
                borrowDate: borrowDate,
                dueDate: dueDate,
                returnDate: returnDate,
                status: 'Dikembalikan',
                programStudi: borrower.programStudi,
                userEmail: borrower.email,
                notes: 'Buku dikembalikan dalam keadaan rapi dan terawat.'
              });
            }
          } else {
            // Due date is in the future or today
            // 60% chance still outstanding, 40% chance already returned early
            const isAlreadyReturned = txRand.next() < 0.40;
            
            if (isAlreadyReturned) {
              const returnOffset = txRand.nextRange(1, Math.max(1, Math.floor((endDate.getTime() - currentDay.getTime()) / (1000 * 30 * 60 * 24))));
              const returnDate = getOffsetDate(borrowDate, returnOffset);
              borrows.push({
                id: recordId,
                userId: borrower.id,
                userName: borrower.name,
                userRole: borrower.role,
                bookId: book.id,
                bookTitle: book.title,
                bookCover: book.coverUrl,
                requestDate: borrowDate,
                borrowDate: borrowDate,
                dueDate: dueDate,
                returnDate: returnDate,
                status: 'Dikembalikan',
                programStudi: borrower.programStudi,
                userEmail: borrower.email,
                notes: 'Selesai membaca bab referensi utama.'
              });
            } else {
              borrows.push({
                id: recordId,
                userId: borrower.id,
                userName: borrower.name,
                userRole: borrower.role,
                bookId: book.id,
                bookTitle: book.title,
                bookCover: book.coverUrl,
                requestDate: borrowDate,
                borrowDate: borrowDate,
                dueDate: dueDate,
                returnDate: '',
                status: 'Dipinjam',
                programStudi: borrower.programStudi,
                userEmail: borrower.email,
                notes: 'Peminjaman aktif untuk pengerjaan proyek mandiri.'
              });
            }
          }
        }
      }
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  return {
    borrows,
    users,
    lastGeneratedDateStr: formatDateStr(endDate)
  };
}

export function getOrGenerateDashboardData(): { borrows: BorrowRecord[]; users: User[] } {
  const localStorageKey = 'FST_DASHBOARD_DUMMY_DATA';
  const cachedStr = localStorage.getItem(localStorageKey);
  const todayStr = formatDateStr(new Date());

  if (cachedStr) {
    try {
      const data = JSON.parse(cachedStr) as PersistentDashboardData;
      // If we have cached data, check if we need to generate missing days up to today
      if (data.lastGeneratedDateStr < todayStr) {
        // Generate additional missing days
        const lastGen = new Date(data.lastGeneratedDateStr);
        lastGen.setDate(lastGen.getDate() + 1);
        const today = new Date();
        
        // Loop and append missing days
        const missingBorrows: BorrowRecord[] = [];
        const missingUsers: User[] = [];
        const current = new Date(lastGen);

        // Load existing users pool to select from for borrowings
        const existingUsers = data.users || [];
        const random = new SeededRandom(`append_seed_${todayStr}`);

        while (current <= today) {
          const dayStr = formatDateStr(current);
          const dayRand = new SeededRandom(`append_day_seed_${dayStr}`);

          // Register occasional user (0 to 1 new users)
          if (existingUsers.length < 140 && dayRand.next() < 0.3) {
            const isLecturer = dayRand.next() < 0.15;
            const name = dayRand.nextElement(INDONESIAN_MOCK_NAMES) + ' ' + (isLecturer ? '' : dayRand.nextElement(['Putra', 'Pratama', 'Hidayat', 'Kurniawan', 'Wibowo']));
            const role = isLecturer ? 'Dosen' : 'Mahasiswa';
            const id = isLecturer 
              ? `198${dayRand.nextRange(70, 95)}${String(dayRand.nextRange(1, 12)).padStart(2, '0')}`
              : `202${dayRand.nextRange(2, 5)}019${String(existingUsers.length + 50).padStart(3, '0')}`;
            
            const emailPrefix = name.toLowerCase().replace(/\s+/g, '.');
            const email = isLecturer ? `${emailPrefix}@uinjkt.ac.id` : `${emailPrefix}@mhs.uinjkt.ac.id`;
            const prodi = isLecturer ? undefined : dayRand.nextElement(PROGRAM_STUDI_LIST);
            
            const newUser: User = {
              id,
              name,
              email,
              role,
              status: 'Aktif',
              avatar: '',
              nimNip: id,
              fakultas: 'Fakultas Sains dan Teknologi',
              programStudi: prodi,
              registeredAt: formatJakartaTimestamp(current)
            };
            existingUsers.push(newUser);
            missingUsers.push(newUser);
          }

          // Generate borrowings
          if (existingUsers.length >= 5) {
            const borrowingsCount = dayRand.nextRange(1, 4);
            for (let tx = 0; tx < borrowingsCount; tx++) {
              const txRand = new SeededRandom(`append_tx_seed_${dayStr}_${tx}`);
              const borrower = txRand.nextElement(existingUsers);
              const book = txRand.nextElement(INITIAL_BOOKS);
              const borrowDate = dayStr;
              const dueDate = getOffsetDate(borrowDate, 7);
              
              missingBorrows.push({
                id: `seed-TX-${dayStr.replace(/-/g, '')}-${tx}`,
                userId: borrower.id,
                userName: borrower.name,
                userRole: borrower.role,
                bookId: book.id,
                bookTitle: book.title,
                bookCover: book.coverUrl,
                requestDate: borrowDate,
                borrowDate: borrowDate,
                dueDate: dueDate,
                returnDate: '',
                status: 'Dipinjam', // newly generated active days are currently borrowed
                programStudi: borrower.programStudi,
                userEmail: borrower.email,
                notes: 'Peminjaman sirkulasi buku mata kuliah FST.'
              });
            }
          }

          current.setDate(current.getDate() + 1);
        }

        const updatedData: PersistentDashboardData = {
          borrows: [...data.borrows, ...missingBorrows],
          users: [...data.users, ...missingUsers],
          lastGeneratedDateStr: todayStr
        };

        localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
        return {
          borrows: updatedData.borrows,
          users: updatedData.users
        };
      }

      return {
        borrows: data.borrows,
        users: data.users
      };
    } catch (e) {
      console.error('Error parsing dashboard dummy data, regenerating...', e);
    }
  }

  // Generate completely fresh historical dummy data
  const newData = generateDashboardDummyData();
  localStorage.setItem(localStorageKey, JSON.stringify(newData));
  return {
    borrows: newData.borrows,
    users: newData.users
  };
}
