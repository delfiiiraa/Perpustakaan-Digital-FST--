import React, { useState, useEffect } from 'react';
import { Book, User, BorrowRecord, Notification, Favorite, DEFAULT_AVATAR, getJakartaTimestamp, getDeviceString, safeLocalStorageSetItem } from './types';
import { INITIAL_BOOKS, INITIAL_USERS, INITIAL_BORROWS, INITIAL_NOTIFICATIONS } from './data/dummyData';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AdminPages } from './components/AdminPages';
import { UserDashboard } from './components/UserDashboard';
import {
  Library, BookOpen, Users, Clock, CheckCircle2, AlertTriangle, Layers, MapPin, Search,
  Bell, LogOut, ChevronRight, Menu, X, UserCheck, ShieldAlert, LayoutDashboard, Bookmark, Heart, FileText
} from 'lucide-react';

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDueDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function migrateUserObj(user: any): any {
  if (!user || typeof user !== 'object') return user;
  let email = user.email || '';
  if (user.role === 'Mahasiswa') {
    if (email.endsWith('@mhs.ac.id')) {
      email = email.replace('@mhs.ac.id', '@mhs.uinjkt.ac.id');
    } else if (email.endsWith('@fst.ac.id')) {
      email = email.replace('@fst.ac.id', '@mhs.uinjkt.ac.id');
    }
  } else if (user.role === 'Dosen') {
    if (email.endsWith('@fst.ac.id')) {
      email = email.replace('@fst.ac.id', '@uinjkt.ac.id');
    }
  }

  if (user.id === 'ADMIN01') {
    return {
      ...user,
      name: 'Delfira Karnain',
      email: 'admin@fst.ac.id',
      registeredAt: '24 Juni 2026, 09:00 WIB',
      accreditationStatus: user.accreditationStatus || 'Accredited',
      lastLogin: user.lastLogin || '24 Juni 2026, 09:00 WIB',
      lastDevice: user.lastDevice || 'Chrome pada Windows',
      lastLocation: user.lastLocation || 'Jakarta, Indonesia'
    };
  }
  if (user.id === '123456') {
    return {
      ...user,
      email: 'mahasiswa@mhs.uinjkt.ac.id',
      registeredAt: '22 Juni 2026, 09:15 WIB',
      accreditationStatus: user.accreditationStatus || 'Accredited',
      lastLogin: user.lastLogin || '24 Juni 2026, 10:24 WIB',
      lastDevice: user.lastDevice || 'Chrome pada Windows',
      lastLocation: user.lastLocation || 'Jakarta, Indonesia'
    };
  }
  if (user.id === '198705') {
    return {
      ...user,
      email: 'dosen@uinjkt.ac.id',
      registeredAt: '22 Juni 2026, 09:30 WIB',
      accreditationStatus: user.accreditationStatus || 'Accredited',
      lastLogin: user.lastLogin || '24 Juni 2026, 11:15 WIB',
      lastDevice: user.lastDevice || 'Chrome pada macOS',
      lastLocation: user.lastLocation || 'Tangerang, Indonesia'
    };
  }
  if (user.id === '2023019') {
    return {
      ...user,
      email: 'dewi.lestari@mhs.uinjkt.ac.id',
      registeredAt: '22 Juni 2026, 09:45 WIB',
      accreditationStatus: user.accreditationStatus || 'Pending Verification',
      lastLogin: user.lastLogin || '23 Juni 2026, 14:20 WIB',
      lastDevice: user.lastDevice || 'Safari pada iPhone',
      lastLocation: user.lastLocation || 'Jakarta, Indonesia'
    };
  }
  return { ...user, email };
}

function safeParse<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    if (!value || value === 'undefined' || value === 'null') {
      if (Array.isArray(fallback)) {
        return (fallback as any).map(migrateUserObj) as unknown as T;
      }
      if (fallback && typeof fallback === 'object' && (fallback as any).id) {
        return migrateUserObj(fallback) as unknown as T;
      }
      return fallback;
    }
    let parsed = JSON.parse(value);
    
    // If fallback is an array, ensure parsed is also an array and filter out nulls/invalid elements
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) {
        return (fallback as any).map(migrateUserObj) as unknown as T;
      }
      // Filter out null/undefined or corrupted elements
      parsed = parsed.filter((item: any) => {
        if (!item || typeof item !== 'object') return false;
        if (key === 'FST_BOOKS' && (!item.id || !item.title)) return false;
        if ((key === 'FST_USERS' || key === 'libraryMembers' || key === 'members') && (!item.id || !item.role)) return false;
        if (key === 'FST_BORROWS' && (!item.id || !item.userId || !item.bookId)) return false;
        return true;
      });
      // Migrate users
      if (key === 'FST_USERS' || key === 'libraryMembers' || key === 'members') {
        parsed = parsed.map(migrateUserObj);
      }
    }
    
    // If fallback is an object (not null), ensure parsed is also an object (not null)
    if (fallback !== null && typeof fallback === 'object' && !Array.isArray(fallback) && (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))) {
      if ((fallback as any).id) {
        return migrateUserObj(fallback) as unknown as T;
      }
      return fallback;
    }

    // Specific validation for FST_CURRENT_USER key to avoid corrupt object crashes
    if (key === 'FST_CURRENT_USER' && parsed !== null) {
      if (typeof parsed !== 'object' || Array.isArray(parsed) || !parsed.id || !parsed.role) {
        return migrateUserObj(fallback) as unknown as T;
      }
      parsed = migrateUserObj(parsed);
    }
    
    return parsed as T;
  } catch (e) {
    console.error(`Error parsing key "${key}" from localStorage`, e);
    if (Array.isArray(fallback)) {
      return (fallback as any).map(migrateUserObj) as unknown as T;
    }
    if (fallback && typeof fallback === 'object' && (fallback as any).id) {
      return migrateUserObj(fallback) as unknown as T;
    }
    return fallback;
  }
}

export const DEMO_MAHASISWA_USER: User = {
  id: 'DEMO_MHS_2026',
  name: 'Delfira Karnain',
  email: 'delfira.karnain@mhs.uinjkt.ac.id',
  role: 'Mahasiswa',
  status: 'Aktif',
  avatar: '',
  nimNip: '2023019011',
  fakultas: 'Fakultas Sains dan Teknologi',
  programStudi: 'Teknik Informatika',
  registeredAt: '24 Juni 2026, 09:00 WIB',
  accreditationStatus: 'Accredited'
};

export const DEMO_DOSEN_USER: User = {
  id: 'DEMO_DSN_2026',
  name: 'Hendra Bayu',
  email: 'hendra.bayu@uinjkt.ac.id',
  role: 'Dosen',
  status: 'Aktif',
  avatar: '',
  nimNip: '198812312020011001',
  fakultas: 'Fakultas Sains dan Teknologi',
  programStudi: '-',
  registeredAt: '24 Juni 2026, 09:00 WIB',
  accreditationStatus: 'Accredited',
  lastLogin: '24 Juni 2026, 09:00 WIB',
  lastDevice: 'Chrome pada Windows',
  lastLocation: 'Jakarta, Indonesia'
};

export default function App() {
  // Database States (Loads from localStorage with fallback to Dummy Data)
  const [books, setBooks] = useState<Book[]>(() => {
    const rawBooks = safeParse('FST_BOOKS', INITIAL_BOOKS);
    return rawBooks.map((b: any) => {
      const copiesVal = typeof b.copies === 'number' ? b.copies : (typeof b.totalCopies === 'number' ? b.totalCopies : 1);
      const availableVal = typeof b.availableCopies === 'number' ? b.availableCopies : copiesVal;
      return {
        ...b,
        copies: copiesVal,
        totalCopies: copiesVal,
        availableCopies: availableVal,
        borrowedCopies: Math.max(0, copiesVal - availableVal)
      };
    });
  });

  const [users, setUsers] = useState<User[]>(() => {
    let loadedUsers: User[] = [];
    const fstUsersStr = localStorage.getItem('FST_USERS');
    if (fstUsersStr && fstUsersStr !== 'undefined' && fstUsersStr !== 'null') {
      loadedUsers = safeParse('FST_USERS', INITIAL_USERS);
    } else {
      const libraryMembersStr = localStorage.getItem('libraryMembers');
      if (libraryMembersStr && libraryMembersStr !== 'undefined' && libraryMembersStr !== 'null') {
        loadedUsers = safeParse('libraryMembers', INITIAL_USERS);
      } else {
        const membersStr = localStorage.getItem('members');
        if (membersStr && membersStr !== 'undefined' && membersStr !== 'null') {
          loadedUsers = safeParse('members', INITIAL_USERS);
        } else {
          loadedUsers = INITIAL_USERS;
        }
      }
    }
    if (!loadedUsers.some(u => u.id === 'DEMO_MHS_2026')) {
      loadedUsers = [...loadedUsers, DEMO_MAHASISWA_USER];
    }
    if (!loadedUsers.some(u => u.id === 'DEMO_DSN_2026')) {
      loadedUsers = [...loadedUsers, DEMO_DOSEN_USER];
    }
    return loadedUsers;
  });

  const [borrows, setBorrows] = useState<BorrowRecord[]>(() => {
    return safeParse('FST_BORROWS', INITIAL_BORROWS);
  });

  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    return safeParse('FST_FAVORITES', [] as Favorite[]);
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const rawNotifs = safeParse('FST_NOTIFICATIONS', INITIAL_NOTIFICATIONS);
    const seen = new Set<string>();
    return rawNotifs.filter(notif => {
      if (!notif.id) return false;
      if (seen.has(notif.id)) return false;
      seen.add(notif.id);
      return true;
    });
  });

  const [adminNotifications, setAdminNotifications] = useState<any[]>(() => {
    return safeParse('adminNotifications', [] as any[]);
  });

  const [pendingMembers, setPendingMembers] = useState<any[]>(() => {
    return safeParse('pendingMembers', [] as any[]);
  });

  // Authentication & Session States
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return safeParse('FST_CURRENT_USER', null as User | null);
  });

  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard' | 'register'>('landing');
  const [loginInitialTab, setLoginInitialTab] = useState<'Mahasiswa' | 'Dosen' | 'Admin'>('Mahasiswa');

  // Navigation Panel sub-views
  const [currentSubView, setCurrentSubView] = useState<'beranda' | string>('beranda');
  const [subViewTrigger, setSubViewTrigger] = useState<number>(0);

  const handleUserSubViewChange = (view: string) => {
    setCurrentSubView(view);
    setSubViewTrigger(prev => prev + 1);
  };
  
  // Mobile UI Sidebar open/close
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global search keywords fed down to sub-controllers
  const [globalSearch, setGlobalSearch] = useState('');

  // Persist databases in localStorage whenever changed
  useEffect(() => {
    safeLocalStorageSetItem('FST_BOOKS', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    const usersToStore = users.filter(u => u.id !== 'DEMO_MHS_2026' && u.id !== 'DEMO_DSN_2026');
    safeLocalStorageSetItem('FST_USERS', JSON.stringify(usersToStore));
    safeLocalStorageSetItem('libraryMembers', JSON.stringify(usersToStore));
    safeLocalStorageSetItem('members', JSON.stringify(usersToStore));
  }, [users]);

  useEffect(() => {
    safeLocalStorageSetItem('FST_BORROWS', JSON.stringify(borrows));
  }, [borrows]);

  useEffect(() => {
    safeLocalStorageSetItem('FST_FAVORITES', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    safeLocalStorageSetItem('FST_NOTIFICATIONS', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    safeLocalStorageSetItem('adminNotifications', JSON.stringify(adminNotifications));
  }, [adminNotifications]);

  useEffect(() => {
    safeLocalStorageSetItem('pendingMembers', JSON.stringify(pendingMembers));
  }, [pendingMembers]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('adminNotifications');
      if (stored) {
        setAdminNotifications(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
    try {
      const storedPending = localStorage.getItem('pendingMembers');
      if (storedPending) {
        setPendingMembers(JSON.parse(storedPending));
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentSubView]);

  useEffect(() => {
    if (currentUser) {
      safeLocalStorageSetItem('FST_CURRENT_USER', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('FST_CURRENT_USER');
    }
  }, [currentUser]);

  // Migration for local storage cached domains and cleanup duplicate notifications
  useEffect(() => {
    const migratedUsers = users.map(u => migrateUserObj(u));
    setUsers(migratedUsers);

    if (currentUser) {
      setCurrentUser(migrateUserObj(currentUser));
    }

    // Deduplicate user notifications
    setNotifications(prev => {
      const seen = new Set<string>();
      const cleaned = prev.filter(n => {
        if (!n) return false;
        // Build unique key based on same title, message, type, user, book, and eventKey
        const key = `${n.userId || ''}|${n.title || ''}|${n.message || ''}|${n.type || ''}|${n.eventKey || ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      safeLocalStorageSetItem('FST_NOTIFICATIONS', JSON.stringify(cleaned));
      return cleaned;
    });

    // Deduplicate admin notifications
    setAdminNotifications(prev => {
      const seen = new Set<string>();
      const cleaned = prev.filter(n => {
        if (!n) return false;
        const key = `${n.title || ''}|${n.message || ''}|${n.type || ''}|${n.eventKey || ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      safeLocalStorageSetItem('adminNotifications', JSON.stringify(cleaned));
      return cleaned;
    });
  }, []);

  // Access control guard for Admin Profile
  useEffect(() => {
    if (currentSubView === 'profil-admin') {
      if (!currentUser) {
        setCurrentSubView('beranda');
      } else if (currentUser.role !== 'Admin') {
        alert('Anda tidak memiliki akses ke halaman profil admin.');
        setCurrentSubView('beranda');
      }
    }
  }, [currentSubView, currentUser]);

  // Business Action 1: Add a book (Admin)
  const handleAddBook = (newBook: Book) => {
    const processedBook: Book = {
      ...newBook,
      totalCopies: newBook.copies,
      borrowedCopies: Math.max(0, newBook.copies - newBook.availableCopies)
    };
    setBooks(prev => [processedBook, ...prev]);
  };

  // Business Action 2: Update a book specs / availability (Admin, Status edit)
  const handleUpdateBook = (updatedBook: Book) => {
    const processedBook: Book = {
      ...updatedBook,
      totalCopies: updatedBook.copies,
      borrowedCopies: Math.max(0, updatedBook.copies - updatedBook.availableCopies)
    };
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? processedBook : b));
  };

  // Business Action 3: Delete a book from libraries (Admin)
  const handleDeleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  // Business Action 4: Submit borrow request (Mahasiswa / Dosen)
  const handleRequestBorrow = (bookId: string, notes: string) => {
    if (!currentUser) return;
    const targetBook = books.find(b => b.id === bookId);
    if (!targetBook) return;

    // Validation for Mahasiswa (Student)
    if (currentUser.role === 'Mahasiswa') {
      const activeStatuses = ['Menunggu', 'Disetujui', 'Dipinjam', 'Terlambat'];
      const activeUserBorrows = borrows.filter(b => b.userId === currentUser.id && activeStatuses.includes(b.status));

      const isAlreadyActivelyBorrowed = activeUserBorrows.some(b => b.bookId === bookId);
      if (isAlreadyActivelyBorrowed) {
        alert("Anda masih memiliki peminjaman aktif untuk buku ini. Silakan kembalikan buku terlebih dahulu sebelum meminjam lagi.");
        return;
      }

      if (activeUserBorrows.length >= 3) {
        alert("Anda sudah mencapai batas maksimal peminjaman 3 buku. Silakan kembalikan buku terlebih dahulu sebelum meminjam buku lain.");
        return;
      }
    }

    if (targetBook.availableCopies <= 0) {
      alert("Buku tidak tersedia untuk dipinjam.");
      return;
    }

    // Standardize request ID to avoid multiple submissions for the same session
    const borrowId = 'TX' + String(borrows.length + 1).padStart(3, '0');

    const newRequest: BorrowRecord = {
      id: borrowId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      bookCover: targetBook.coverUrl,
      requestDate: getTodayString(),
      borrowDate: '',
      dueDate: '',
      returnDate: '',
      status: 'Menunggu',
      notes: notes || 'Peminjaman online Perpustakaan FST.'
    };

    setBorrows(prev => [newRequest, ...prev]);

    // Create Admin Notification for Peminjaman (Admin gets a notification in adminNotifications)
    const eventKey = `borrowing-submitted-${borrowId}`;
    setAdminNotifications(prev => {
      if (prev.some(n => n.eventKey === eventKey)) {
        return prev;
      }
      const newAdminNotifObj = {
        id: 'AN' + Date.now() + '_' + Math.floor(Math.random() * 100000),
        title: 'Pengajuan Peminjaman Baru',
        message: `${currentUser.name} mengajukan peminjaman buku ${targetBook.title}.`,
        type: 'peminjaman',
        relatedUserId: currentUser.id,
        relatedUserName: currentUser.name,
        relatedBookId: targetBook.id,
        relatedBookTitle: targetBook.title,
        isRead: false,
        createdAt: getJakartaTimestamp(),
        eventKey: eventKey
      };
      return [newAdminNotifObj, ...prev];
    });
  };

  // Business Action 4.5: Approve Member Registration (Admin)
  const handleApproveMember = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  // Business Action 5: Approve Borrow Request (Admin)
  const handleApproveBorrow = (borrowId: string) => {
    const record = borrows.find(r => r.id === borrowId);
    if (!record || record.status === 'Dipinjam' || record.status === 'Disetujui') {
      return;
    }

    // Check if the book is available
    const book = books.find(b => b.id === record.bookId);
    if (!book || book.availableCopies <= 0) {
      alert("Buku tidak tersedia untuk dipinjam.");
      return;
    }

    // Change related book stock quantity
    setBooks(currBooks => currBooks.map(b => {
      if (b.id === record.bookId) {
        const nextCopies = Math.max(0, b.availableCopies - 1);
        const total = b.copies;
        const nextBorrowed = Math.max(0, total - nextCopies);
        let nextStatus: 'Tersedia' | 'Dipinjam' | 'Tidak Tersedia' = b.status;
        if (nextCopies > 0) {
          nextStatus = 'Tersedia';
        } else {
          // If available is 0, status is Dipinjam if there are borrowed copies, else Tidak Tersedia
          nextStatus = nextBorrowed > 0 ? 'Dipinjam' : 'Tidak Tersedia';
        }
        return {
          ...b,
          availableCopies: nextCopies,
          totalCopies: total,
          borrowedCopies: nextBorrowed,
          status: nextStatus
        };
      }
      return b;
    }));

    setBorrows(prev => prev.map(rec => {
      if (rec.id === borrowId) {
        // Push targeted user notification with event key check
        const eventKey = `borrowing-approved-${borrowId}`;
        setNotifications(prevNotifs => {
          if (prevNotifs.some(n => n.eventKey === eventKey)) {
            return prevNotifs;
          }
          const userNotif: Notification = {
            id: 'N' + String(Date.now()) + '_' + Math.floor(Math.random() * 100000),
            userId: rec.userId,
            title: 'Pengajuan Pinjam Disetujui!',
            message: `Pengajuan buku "${rec.bookTitle}" disetujui. Silakan ambil buku fisik di loket pustakawan.`,
            date: getTodayString(),
            isRead: false,
            type: 'Persetujuan',
            eventKey: eventKey
          };
          return [userNotif, ...prevNotifs];
        });

        return {
          ...rec,
          status: 'Dipinjam',
          borrowDate: getTodayString(),
          dueDate: getDueDateString() // 7 days limits
        };
      }
      return rec;
    }));
  };

  // Business Action 6: Reject Borrow Request (Admin)
  const handleRejectBorrow = (borrowId: string, reason: string) => {
    const record = borrows.find(r => r.id === borrowId);
    if (!record || record.status === 'Ditolak') {
      return;
    }

    setBorrows(prev => prev.map(rec => {
      if (rec.id === borrowId) {
        const eventKey = `borrowing-rejected-${borrowId}`;
        setNotifications(prevNotifs => {
          if (prevNotifs.some(n => n.eventKey === eventKey)) {
            return prevNotifs;
          }
          const userNotif: Notification = {
            id: 'N' + String(Date.now()) + '_' + Math.floor(Math.random() * 100000),
            userId: rec.userId,
            title: 'Pengajuan Pinjam Ditolak',
            message: `Pengajuan buku "${rec.bookTitle}" ditolak dengan alasan: ${reason}`,
            date: getTodayString(),
            isRead: false,
            type: 'Penolakan',
            eventKey: eventKey
          };
          return [userNotif, ...prevNotifs];
        });

        return {
          ...rec,
          status: 'Ditolak',
          notes: `Ditolak: ${reason}`
        };
      }
      return rec;
    }));
  };

  // Business Action 7: Return Borrowed Book (Admin)
  const handleReturnBook = (borrowId: string) => {
    const record = borrows.find(r => r.id === borrowId);
    if (!record || record.status === 'Dikembalikan') {
      return;
    }

    // Return stock quantity
    setBooks(currBooks => currBooks.map(b => {
      if (b.id === record.bookId) {
        const nextCopies = Math.min(b.copies, b.availableCopies + 1);
        const total = b.copies;
        const nextBorrowed = Math.max(0, total - nextCopies);
        let nextStatus: 'Tersedia' | 'Dipinjam' | 'Tidak Tersedia' = 'Tersedia';
        if (nextCopies === 0) {
          nextStatus = nextBorrowed > 0 ? 'Dipinjam' : 'Tidak Tersedia';
        }
        return {
          ...b,
          availableCopies: nextCopies,
          totalCopies: total,
          borrowedCopies: nextBorrowed,
          status: nextStatus
        };
      }
      return b;
    }));

    setBorrows(prev => prev.map(rec => {
      if (rec.id === borrowId) {
        // Push student/lecturer notification with event key check
        const eventKey = `book-returned-${borrowId}`;
        setNotifications(prevNotifs => {
          if (prevNotifs.some(n => n.eventKey === eventKey)) {
            return prevNotifs;
          }
          const userNotif: Notification = {
            id: 'N' + String(Date.now()) + '_' + Math.floor(Math.random() * 100000),
            userId: rec.userId,
            title: 'Sukses Mengembalikan Buku',
            message: `Terima kasih! Buku "${rec.bookTitle}" telah kami terima dengan subjek utuh di rak.`,
            date: getTodayString(),
            isRead: false,
            type: 'Pengembalian',
            eventKey: eventKey
          };
          return [userNotif, ...prevNotifs];
        });

        // Create Admin Notification for Book Return
        setAdminNotifications(prevAdminNotifs => {
          if (prevAdminNotifs.some(n => n.eventKey === eventKey)) {
            return prevAdminNotifs;
          }
          const newAdminNotif = {
            id: 'AN' + Date.now() + '_' + Math.floor(Math.random() * 100000),
            title: 'Pengembalian Buku',
            message: `Buku ${rec.bookTitle} telah dikembalikan oleh ${rec.userName}.`,
            type: 'pengembalian',
            relatedUserId: rec.userId,
            relatedUserName: rec.userName,
            relatedBookId: rec.bookId,
            relatedBookTitle: rec.bookTitle,
            isRead: false,
            createdAt: getJakartaTimestamp(),
            eventKey: eventKey
          };
          return [newAdminNotif, ...prevAdminNotifs];
        });

        return {
          ...rec,
          status: 'Dikembalikan',
          returnDate: getTodayString()
        };
      }
      return rec;
    }));
  };

  // Business Action 8: Save Favorite (Member)
  const handleAddFavorite = (bookId: string) => {
    if (!currentUser) return;
    const isExist = favorites.some(f => f.userId === currentUser.id && f.bookId === bookId);
    if (!isExist) {
      const newFav: Favorite = {
        id: 'FAV' + Date.now() + '_' + Math.floor(Math.random() * 100000),
        userId: currentUser.id,
        bookId
      };
      setFavorites(prev => [...prev, newFav]);
    }
  };

  // Business Action 9: Remove Favorite (Member)
  const handleRemoveFavorite = (bookId: string) => {
    if (!currentUser) return;
    setFavorites(prev => prev.filter(f => !(f.userId === currentUser.id && f.bookId === bookId)));
  };

  // Business Action 10: Set notification read (Common)
  const handleClearNotification = (id: string) => {
    setNotifications(prev => {
      const target = prev.find(n => n.id === id);
      if (!target) return prev;
      return prev.map(n => {
        if (n.id === id || (target.eventKey && n.eventKey === target.eventKey)) {
          return { ...n, isRead: true };
        }
        return n;
      });
    });
  };

  const handleClearAllNotifications = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => {
      const isUserNotif = (n.userId === currentUser.id || n.userId === 'All') &&
        n.userId !== 'ADMIN01' &&
        n.title !== 'Permintaan Pinjam Baru' &&
        n.title !== 'Pengajuan Peminjaman Baru' &&
        n.type !== 'Sistem';
      if (isUserNotif) {
        return { ...n, isRead: true };
      }
      return n;
    }));
  };

  const initializeDemoUserData = () => {
    if (localStorage.getItem('FST_DEMO_MHS_INITIALIZED') === 'true') {
      return;
    }

    // Define initial borrows for DEMO_MHS_2026
    const demoBorrows: BorrowRecord[] = [
      {
        id: 'TX_DEMO_001',
        userId: 'DEMO_MHS_2026',
        userName: 'Delfira Karnain',
        userRole: 'Mahasiswa',
        bookId: 'B003', // Rekayasa Perangkat Lunak Modern
        bookTitle: 'Rekayasa Perangkat Lunak Modern',
        bookCover: 'linear-gradient(135deg, #075985 0%, #0369a1 100%)',
        requestDate: '2026-06-25',
        borrowDate: '2026-06-26',
        dueDate: '2026-07-03',
        returnDate: '',
        status: 'Dipinjam',
        notes: 'Dipinjam untuk referensi skripsi bab 2.'
      },
      {
        id: 'TX_DEMO_002',
        userId: 'DEMO_MHS_2026',
        userName: 'Delfira Karnain',
        userRole: 'Mahasiswa',
        bookId: 'B005', // Jaringan Komputer Global
        bookTitle: 'Jaringan Komputer Global',
        bookCover: 'linear-gradient(135deg, #3730a3 0%, #4338ca 100%)',
        requestDate: '2026-06-18',
        borrowDate: '2026-06-19',
        dueDate: '2026-06-26',
        returnDate: '',
        status: 'Terlambat',
        notes: 'Digunakan untuk praktikum jaringan komputer.'
      },
      {
        id: 'TX_DEMO_003',
        userId: 'DEMO_MHS_2026',
        userName: 'Delfira Karnain',
        userRole: 'Mahasiswa',
        bookId: 'B001', // Struktur Data dan Algoritma
        bookTitle: 'Struktur Data dan Algoritma',
        bookCover: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        requestDate: '2026-06-01',
        borrowDate: '2026-06-02',
        dueDate: '2026-06-09',
        returnDate: '2026-06-08',
        status: 'Dikembalikan',
        notes: 'Selesai belajar mandiri UTS.'
      },
      {
        id: 'TX_DEMO_004',
        userId: 'DEMO_MHS_2026',
        userName: 'Delfira Karnain',
        userRole: 'Mahasiswa',
        bookId: 'B007', // Pemrograman Web Responsif
        bookTitle: 'Pemrograman Web Responsif',
        bookCover: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)',
        requestDate: '2026-06-10',
        borrowDate: '2026-06-11',
        dueDate: '2026-06-18',
        returnDate: '2026-06-16',
        status: 'Dikembalikan',
        notes: 'Tugas besar pemrograman web.'
      },
      {
        id: 'TX_DEMO_005',
        userId: 'DEMO_MHS_2026',
        userName: 'Delfira Karnain',
        userRole: 'Mahasiswa',
        bookId: 'B006', // Kecerdasan Buatan Terapan
        bookTitle: 'Kecerdasan Buatan Terapan',
        bookCover: 'linear-gradient(135deg, #85144b 0%, #b10dc9 100%)',
        requestDate: '2026-07-03',
        borrowDate: '',
        dueDate: '',
        returnDate: '',
        status: 'Menunggu',
        notes: 'Bahan skripsi bab 1.'
      }
    ];

    // Define initial favorites for DEMO_MHS_2026
    const demoFavorites: Favorite[] = [
      { id: 'FAV_DEMO_001', userId: 'DEMO_MHS_2026', bookId: 'B001' },
      { id: 'FAV_DEMO_002', userId: 'DEMO_MHS_2026', bookId: 'B006' },
      { id: 'FAV_DEMO_003', userId: 'DEMO_MHS_2026', bookId: 'B007' }
    ];

    // Define initial notifications for DEMO_MHS_2026
    const demoNotifications: Notification[] = [
      {
        id: 'N_DEMO_001',
        userId: 'DEMO_MHS_2026',
        title: 'Registrasi Berhasil',
        message: 'Selamat datang di Perpustakaan FST Digital, Delfira Karnain! Akun Anda telah aktif.',
        date: '2026-06-24',
        isRead: true,
        type: 'Sistem'
      },
      {
        id: 'N_DEMO_002',
        userId: 'DEMO_MHS_2026',
        title: 'Peminjaman Disetujui',
        message: 'Peminjaman buku "Rekayasa Perangkat Lunak Modern" telah disetujui oleh pustakawan.',
        date: '2026-06-26',
        isRead: true,
        type: 'Persetujuan'
      },
      {
        id: 'N_DEMO_003',
        userId: 'DEMO_MHS_2026',
        title: 'Peringatan Jatuh Tempo!',
        message: 'Buku "Jaringan Komputer Global" yang Anda pinjam telah melebihi batas tanggal pengembalian (26 Juni 2026). Harap segera kembalikan.',
        date: '2026-07-01',
        isRead: false,
        type: 'JatuhTempo'
      }
    ];

    // Merge records with existing states
    setBorrows(prev => {
      const filtered = prev.filter(b => b.userId !== 'DEMO_MHS_2026');
      const updated = [...filtered, ...demoBorrows];
      safeLocalStorageSetItem('FST_BORROWS', JSON.stringify(updated));
      return updated;
    });

    setFavorites(prev => {
      const filtered = prev.filter(f => f.userId !== 'DEMO_MHS_2026');
      const updated = [...filtered, ...demoFavorites];
      safeLocalStorageSetItem('FST_FAVORITES', JSON.stringify(updated));
      return updated;
    });

    setNotifications(prev => {
      const filtered = prev.filter(n => n.userId !== 'DEMO_MHS_2026');
      const updated = [...filtered, ...demoNotifications];
      safeLocalStorageSetItem('FST_NOTIFICATIONS', JSON.stringify(updated));
      return updated;
    });

    // Update book copies
    setBooks(prev => {
      const updated = prev.map(b => {
        if (b.id === 'B003') {
          const available = Math.max(0, b.availableCopies - 1);
          return { ...b, availableCopies: available, borrowedCopies: b.copies - available };
        }
        if (b.id === 'B005') {
          const available = Math.max(0, b.availableCopies - 1);
          return { ...b, availableCopies: available, borrowedCopies: b.copies - available };
        }
        return b;
      });
      safeLocalStorageSetItem('FST_BOOKS', JSON.stringify(updated));
      return updated;
    });

    localStorage.setItem('FST_DEMO_MHS_INITIALIZED', 'true');
  };

  // Session Manager: Login routing
  const handleLoginSuccess = (user: User) => {
    if (user.id === 'DEMO_MHS_2026') {
      initializeDemoUserData();
    }
    const enrichedUser: User = {
      ...user,
      lastLogin: getJakartaTimestamp(),
      lastDevice: getDeviceString(),
      lastLocation: 'Jakarta, Indonesia'
    };
    setCurrentUser(enrichedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...enrichedUser } : u));
    setCurrentView('dashboard');
    setCurrentSubView('beranda');
  };

  // Session Manager: Sign out sirkulasi
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setGlobalSearch('');
  };

  const handleDeleteMember = (userId: string) => {
    if (userId === 'DEMO_MHS_2026' || userId === 'DEMO_DSN_2026') return;
    // Find the member to be deleted to know their email for cleanup
    const member = users.find(u => u.id === userId);
    
    // Remove from users list
    setUsers(prev => {
      const updatedList = prev.filter(u => u.id !== userId);
      safeLocalStorageSetItem("FST_USERS", JSON.stringify(updatedList));
      safeLocalStorageSetItem("libraryMembers", JSON.stringify(updatedList));
      safeLocalStorageSetItem("members", JSON.stringify(updatedList));
      return updatedList;
    });

    if (member) {
      // Remove from pendingMembers state (any approved, pending, or rejected registrations)
      setPendingMembers(prev => prev.filter((m: any) => m && m.email && m.email.toLowerCase() !== member.email.toLowerCase()));
    }

    // If the deleted member is currently logged in, log them out completely
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
      setCurrentView('landing');
      localStorage.removeItem('FST_CURRENT_USER');
    }
  };

  const handleUpdateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(currUsers => currUsers.map(u => (u.id === updatedUser.id || u.email.toLowerCase() === updatedUser.email.toLowerCase()) ? updatedUser : u));
  };

  // Keep currentUser and users list avatar synchronised
  useEffect(() => {
    if (currentUser) {
      const matchingUser = users.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase() || u.id === currentUser.id);
      if (matchingUser) {
        const canonicalAvatarImage = matchingUser.avatarImage || currentUser.avatarImage || '';
        const canonicalAvatar = matchingUser.avatar || currentUser.avatar || '';
        
        const hasUserUpdate = currentUser.avatarImage !== canonicalAvatarImage || currentUser.avatar !== canonicalAvatar;
        const hasListUpdate = matchingUser.avatarImage !== canonicalAvatarImage || matchingUser.avatar !== canonicalAvatar;
        
        if (hasUserUpdate) {
          setCurrentUser(prev => prev ? {
            ...prev,
            avatarImage: canonicalAvatarImage,
            avatar: canonicalAvatar
          } : null);
        }
        if (hasListUpdate) {
          setUsers(prevUsers => prevUsers.map(u => 
            (u.email.toLowerCase() === currentUser.email.toLowerCase() || u.id === currentUser.id)
              ? { ...u, avatarImage: canonicalAvatarImage, avatar: canonicalAvatar }
              : u
          ));
        }
      }
    }
  }, [currentUser, users]);

  // Safe navigation selector
  const activeUnreadNotifications = notifications.filter(n => 
    currentUser && 
    (n.userId === currentUser.id || (currentUser.role !== 'Admin' && n.userId === 'All')) && 
    n.userId !== 'ADMIN01' && 
    n.type !== 'Sistem' &&
    n.title !== 'Permintaan Pinjam Baru' &&
    n.title !== 'Pengajuan Peminjaman Baru' &&
    !n.isRead
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans flex flex-col justify-between" id="applet-viewport">
      
      {/* SECTION A: LANDING PAGE VIEW */}
      {currentView === 'landing' && (
        <LandingPage
          books={books}
          currentUser={currentUser}
          onNavigateToDashboard={() => {
            setCurrentView('dashboard');
          }}
          onSearch={(q) => { setGlobalSearch(q); }}
          onSelectBook={(book) => {
            if (currentUser) {
              setCurrentSubView('katalog');
              setCurrentView('dashboard');
            } else {
              // Direct to login so the user can borrow
              setCurrentSubView('katalog');
              setLoginInitialTab('Mahasiswa');
              setCurrentView('login');
            }
          }}
          onNavigateToLogin={(role) => {
            if (role) {
              setLoginInitialTab(role);
            }
            if (currentUser) {
              setCurrentView('dashboard');
            } else {
              setCurrentView('login');
            }
          }}
          onNavigateToCatalog={() => {
            if (currentUser) {
              setCurrentSubView('katalog');
              setCurrentView('dashboard');
            } else {
              setLoginInitialTab('Mahasiswa');
              setCurrentView('login');
            }
          }}
          onNavigateToRegister={() => {
            if (currentUser) {
              setCurrentView('dashboard');
            } else {
              setCurrentView('register');
            }
          }}
        />
      )}

      {/* SECTION B: LOGIN PAGE VIEW */}
      {currentView === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateHome={() => setCurrentView('landing')}
          onNavigateRegister={() => setCurrentView('register')}
          initialTab={loginInitialTab}
        />
      )}

      {/* SECTION B2: REGISTER PAGE VIEW */}
      {currentView === 'register' && (
        <RegisterPage
          onNavigateHome={() => setCurrentView('landing')}
          onNavigateLogin={() => setCurrentView('login')}
        />
      )}

      {/* SECTION C & D: INTERACTIVE ROLES DASHBOARD OVERVIEW */}
      {currentView === 'dashboard' && currentUser && (
        <div className="min-h-screen flex flex-col md:flex-row relative">
          
          {/* Mobile top navigation helper */}
          <div className="md:hidden sticky top-0 left-0 right-0 bg-primary-dark text-white p-4.5 flex justify-between items-center z-45 shadow-md">
            <div className="flex items-center space-x-2">
              <Library className="w-5.5 h-5.5 text-primary-light" />
              <span className="font-extrabold font-display leading-tight text-sm tracking-tight">Perpustakaan Digital FST</span>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 cursor-pointer">
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* LEFT SIDEBAR NAVIGATION BAR */}
          <aside className={`w-[260px] bg-white border-r border-slate-200/80 text-slate-700 flex flex-col justify-between shrink-0 h-screen sticky top-0 py-6 z-40 transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 bg-white border-r border-slate-200 shadow-2xl' : '-translate-x-full md:translate-x-0 hidden md:flex'
          }`}>
            <div className="space-y-8 px-5">
              
              {/* Header logo */}
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 yellow-gradient rounded-lg flex items-center justify-center text-white shrink-0">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold font-display tracking-tight text-sm text-primary-dark">Perpustakaan FST</h2>
                  <p className="text-[10px] text-primary-dark tracking-wider font-bold uppercase">UIN JKT PORTAL</p>
                </div>
              </div>

              {/* Navigation lists corresponding to Role */}
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Menu Utama</span>
                
                {/* ROLE IS ADMIN */}
                {currentUser.role === 'Admin' ? (
                  <>
                    <button
                      onClick={() => { setCurrentSubView('beranda'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'beranda' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span>Beranda Panel Admin</span>
                    </button>

                    <button
                      onClick={() => { setCurrentSubView('manajemen-buku'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'manajemen-buku' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <span>Manajemen Data Buku</span>
                    </button>

                    <button
                      onClick={() => { setCurrentSubView('manajemen-anggota'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        currentSubView === 'manajemen-anggota' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 shrink-0" />
                        <span>Manajemen Anggota</span>
                      </div>
                      {pendingMembers.filter((m: any) => m && m.approvalStatus === 'Menunggu Persetujuan').length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                          {pendingMembers.filter((m: any) => m && m.approvalStatus === 'Menunggu Persetujuan').length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => { setCurrentSubView('persetujuan'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 justify-between cursor-pointer ${
                        currentSubView === 'persetujuan' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Persetujuan Pinjam</span>
                      </div>
                      {borrows.filter(b => b.status === 'Menunggu').length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                          {borrows.filter(b => b.status === 'Menunggu').length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => { setCurrentSubView('pengembalian-buku'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'pengembalian-buku' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Pengembalian Buku</span>
                    </button>

                    <button
                      onClick={() => { setCurrentSubView('ketersediaan'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'ketersediaan' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-4 h-4 shrink-0" />
                      <span>Ketersediaan Buku Rak</span>
                    </button>

                    <button
                      onClick={() => { setCurrentSubView('laporan'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'laporan' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>Laporan Perpustakaan</span>
                    </button>

                    <button
                      onClick={() => { setCurrentSubView('notifikasi'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        currentSubView === 'notifikasi' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Bell className="w-4 h-4 shrink-0" />
                        <span>Notifikasi</span>
                      </div>
                      {adminNotifications.filter((n: any) => !n.isRead).length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                          {adminNotifications.filter((n: any) => !n.isRead).length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => { setCurrentSubView('profil-admin'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'profil-admin' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <span>Profil Admin</span>
                    </button>
                  </>
                ) : (
                  
                  /* ROLE IS MAHASISWA OR DOSEN */
                  <>
                    <button
                      onClick={() => { handleUserSubViewChange('beranda'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'beranda' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span>Beranda Portal</span>
                    </button>

                    <button
                      onClick={() => { handleUserSubViewChange('katalog'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'katalog' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <span>Katalog Buku Digital</span>
                    </button>

                    <button
                      onClick={() => { handleUserSubViewChange('peminjaman'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'peminjaman' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Peminjaman Saya</span>
                    </button>

                    <button
                      onClick={() => { handleUserSubViewChange('riwayat'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'riwayat' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>Riwayat Peminjaman</span>
                    </button>

                    <button
                      onClick={() => { handleUserSubViewChange('favorit'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'favorit' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Heart className="w-4 h-4 shrink-0" />
                      <span>Daftar Favorit</span>
                    </button>

                    <button
                      onClick={() => { handleUserSubViewChange('notifikasi'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 justify-between cursor-pointer ${
                        currentSubView === 'notifikasi' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Bell className="w-4 h-4 shrink-0" />
                        <span>Notifikasi Layanan</span>
                      </div>
                      {activeUnreadNotifications.length > 0 && (
                        <span className="w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                          {activeUnreadNotifications.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => { handleUserSubViewChange('profil'); setIsSidebarOpen(false); }}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        currentSubView === 'profil' ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <span>Profil Anggota</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bottom logout section */}
            <div className="px-5">
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl mb-4 text-xs">
                <span className="text-[10px] block uppercase font-bold text-primary-dark">
                  {currentUser.role === 'Admin' ? 'PETUGAS:' : 'ANGGOTA:'}
                </span>
                <p className="font-bold text-slate-800 truncate mt-0.5">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 transition flex items-center justify-center space-x-2.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </aside>

          {/* MAIN PAGE CONTAINER WITH HEADER TOPBAR */}
          <main className="flex-1 min-w-0 bg-slate-50 flex flex-col justify-between min-h-screen">
            <div>
              {/* Topbar Header */}
              <header className="bg-white border-b border-slate-200/60 h-16 px-6 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center space-x-4">
                  <h3 className="hidden md:block font-bold text-slate-800 text-sm tracking-tight capitalize font-display">
                    {currentUser.role === 'Admin' ? `Admin Panel: ${currentSubView.replace('_', ' ')}` : `Portal Akademik: ${currentSubView}`}
                  </h3>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Notification simple bell icon summary */}
                  <div className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-full transition" onClick={() => currentUser.role === 'Admin' ? setCurrentSubView('notifikasi') : handleUserSubViewChange('notifikasi')}>
                    <Bell className="w-5 h-5 text-slate-500" />
                    {currentUser.role === 'Admin' ? (
                      adminNotifications.filter(n => !n.isRead).length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 block animate-pulse"></span>
                      )
                    ) : (
                      activeUnreadNotifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 block animate-pulse"></span>
                      )
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{currentUser.role}</p>
                    </div>
                    <img src={currentUser.avatarImage || currentUser.avatar || DEFAULT_AVATAR} referrerPolicy="no-referrer" alt={currentUser.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                  </div>
                </div>
              </header>

              {/* DYNAMIC PAGE CONTENT ROUTER MODULE */}
              <div className="p-6">
                
                {/* ADMIN ROLE ACCORDION */}
                {currentUser.role === 'Admin' ? (
                  <AdminPages
                    books={books}
                    users={users}
                    borrows={borrows}
                    pendingMembers={pendingMembers}
                    setPendingMembers={setPendingMembers}
                    onAddBook={handleAddBook}
                    onUpdateBook={handleUpdateBook}
                    onDeleteBook={handleDeleteBook}
                    onApproveBorrow={handleApproveBorrow}
                    onRejectBorrow={handleRejectBorrow}
                    onReturnBook={handleReturnBook}
                    onApproveMember={handleApproveMember}
                    onDeleteMember={handleDeleteMember}
                    currentSubView={currentSubView}
                    currentUser={currentUser}
                    onUpdateCurrentUser={handleUpdateCurrentUser}
                    adminNotifications={adminNotifications}
                    setAdminNotifications={setAdminNotifications}
                    onChangeSubView={(tab) => setCurrentSubView(tab)}
                  />
                ) : (
                  
                  /* MAHASISWA & DOSEN USER MODULE */
                  <UserDashboard
                    currentUser={currentUser}
                    onUpdateCurrentUser={handleUpdateCurrentUser}
                    books={books}
                    borrows={borrows}
                    favorites={favorites}
                    notifications={notifications.filter(notif => 
                      currentUser &&
                      (notif.userId === currentUser.id || notif.userId === 'All') &&
                      notif.userId !== 'ADMIN01' &&
                      notif.title !== 'Permintaan Pinjam Baru' &&
                      notif.title !== 'Pengajuan Peminjaman Baru' &&
                      notif.type !== 'Sistem'
                    )}
                    onAddFavorite={handleAddFavorite}
                    onRemoveFavorite={handleRemoveFavorite}
                    onRequestBorrow={handleRequestBorrow}
                    onClearNotification={handleClearNotification}
                    onClearAllNotifications={handleClearAllNotifications}
                    onLogout={handleLogout}
                    currentSubView={currentSubView}
                    onChangeSubView={handleUserSubViewChange}
                    subViewTrigger={subViewTrigger}
                  />
                )}
              </div>
            </div>

            {/* Humble mini credits bar */}
            <footer className="py-4 border-t border-slate-200/40 bg-white text-center text-[10px] text-slate-400 font-medium">
              &copy; 2026 Perpustakaan Digital FST UIN Syarif Hidayatullah Jakarta &bull; Sistem Sirkulasi Mandiri
            </footer>
          </main>
        </div>
      )}
    </div>
  );
}
