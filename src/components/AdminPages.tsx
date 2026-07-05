import React, { useState, useEffect } from 'react';
import { Book, User, BorrowRecord, Notification, DEFAULT_AVATAR, getJakartaTimestamp, BOOK_CATEGORIES } from '../types';
import { getOrGenerateDashboardData } from '../utils/dashboardDataEngine';
import {
  BookOpen, Users, Clock, AlertTriangle, CheckCircle, XCircle, Search, Edit2, Trash2, 
  Plus, Check, X, FileText, ChevronRight, BarChart2, Calendar, Download, RefreshCw, Layers, Bell
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';

interface AdminPagesProps {
  books: Book[];
  users: User[];
  borrows: BorrowRecord[];
  pendingMembers: any[];
  setPendingMembers: React.Dispatch<React.SetStateAction<any[]>>;
  onAddBook: (book: Book) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onApproveBorrow: (borrowId: string) => void;
  onRejectBorrow: (borrowId: string, reason: string) => void;
  onReturnBook: (borrowId: string) => void;
  onApproveMember: (newUser: User) => void;
  onDeleteMember: (id: string) => void;
  currentUser: User;
  onUpdateCurrentUser: (user: User) => void;
  adminNotifications: any[];
  setAdminNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  onChangeSubView: (tab: string) => void;
}

const getMemberRegistrationDate = (user: any) => {
  if (!user) return '';
  if (!user.registeredAt || user.registeredAt === '2024') {
    if (user.id === '123456') return '22 Juni 2026, 09:15 WIB';
    if (user.id === '198705') return '22 Juni 2026, 09:30 WIB';
    if (user.id === 'ADMIN01') return '24 Juni 2026, 09:00 WIB';
    if (user.id === '2023019') return '22 Juni 2026, 09:45 WIB';
    return '22 Juni 2026, 09:00 WIB';
  }
  if (user.id === 'ADMIN01') {
    return '24 Juni 2026, 09:00 WIB';
  }
  return user.registeredAt;
};

export const AdminPages: React.FC<AdminPagesProps & { currentSubView: string }> = ({
  books,
  users,
  borrows,
  pendingMembers,
  setPendingMembers,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onApproveBorrow,
  onRejectBorrow,
  onReturnBook,
  onApproveMember,
  onDeleteMember,
  currentSubView,
  currentUser,
  onUpdateCurrentUser,
  adminNotifications,
  setAdminNotifications,
  onChangeSubView
}) => {
  // Local admin states
  const [bookSearch, setBookSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [dummyData, setDummyData] = useState<{ borrows: BorrowRecord[]; users: User[] }>(() => {
    return getOrGenerateDashboardData();
  });
  const [memberIdToDelete, setMemberIdToDelete] = useState<string | null>(null);
  const [copyErrors, setCopyErrors] = useState<Record<string, string>>({});

  // Report date filter states (default: current month July 2026)
  const [filterStartDate, setFilterStartDate] = useState('2026-07-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-07-31');
  const [inputStartDate, setInputStartDate] = useState('2026-07-01');
  const [inputEndDate, setInputEndDate] = useState('2026-07-31');
  const [dateError, setDateError] = useState<string | null>(null);

  const validateDateRange = (start: string, end: string): string | null => {
    if (!start && !end) {
      return null; // Both empty (Reset Filter state / Default)
    }
    if (!start || !end) {
      return 'Please select a valid date range.';
    }
    if (start > end) {
      return 'The Start Date cannot be later than the End Date.';
    }
    return null;
  };

  useEffect(() => {
    const err = validateDateRange(inputStartDate, inputEndDate);
    setDateError(err);
  }, [inputStartDate, inputEndDate]);

  // Admin profile upload states
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showDeletePhotoConfirm, setShowDeletePhotoConfirm] = useState(false);
  const [profileAlertMsg, setProfileAlertMsg] = useState<string | null>(null);

  const triggerProfileAlert = (msg: string) => {
    setProfileAlertMsg(msg);
    setTimeout(() => {
      setProfileAlertMsg(null);
    }, 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file extension/mime type (JPG, JPEG, PNG, WEBP)
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

      if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        triggerProfileAlert('Gagal: Format file tidak didukung. Silakan pilih gambar dengan format JPG, JPEG, PNG, atau WEBP.');
        return;
      }

      // Validate file size (Maximum 500 KB)
      const MAX_SIZE_BYTES = 500 * 1024; // 500 KB
      if (file.size > MAX_SIZE_BYTES) {
        triggerProfileAlert(`Gagal: Ukuran gambar (${(file.size / 1024).toFixed(1)} KB) melebihi batas maksimum 500 KB. Silakan pilih file yang lebih kecil.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          setPreviewImage(reader.result as string);
        } catch (err: any) {
          triggerProfileAlert('Gagal memuat gambar: ' + (err.message || 'Error tidak dikenal.'));
        }
      };
      reader.onerror = () => {
        triggerProfileAlert('Gagal membaca file gambar.');
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
        triggerProfileAlert('Foto profil berhasil diperbarui.');
      }
    } catch (err: any) {
      console.error(err);
      triggerProfileAlert('Gagal menyimpan foto profil: Kapasitas penyimpanan penuh atau error tidak dikenal.');
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
    triggerProfileAlert('Foto profil berhasil dihapus.');
  };

  const handleApprove = (req: any) => {
    const nextMembers = pendingMembers.map(m => {
      if (m.id === req.id) {
        return { ...m, approvalStatus: 'Disetujui' };
      }
      return m;
    });
    setPendingMembers(nextMembers);
    localStorage.setItem('pendingMembers', JSON.stringify(nextMembers));
    
    // Create new approved User
    const newUser: User = {
      id: req.id,
      name: req.fullName,
      email: req.email,
      role: req.role,
      status: 'Aktif',
      avatar: '',
      registeredAt: req.createdAt || getJakartaTimestamp(),
      nimNip: req.nimNip,
      fakultas: req.fakultas || 'Fakultas Sains dan Teknologi',
      programStudi: req.role === 'Mahasiswa' ? (req.programStudi || 'Teknik Informatika') : ''
    };
    
    onApproveMember(newUser);
    alert('Anggota berhasil disetujui.');
  };

  const handleReject = (reqId: string) => {
    const nextMembers = pendingMembers.map(m => {
      if (m.id === reqId) {
        return { ...m, approvalStatus: 'Ditolak' };
      }
      return m;
    });
    setPendingMembers(nextMembers);
    localStorage.setItem('pendingMembers', JSON.stringify(nextMembers));
    alert('Pengajuan anggota ditolak.');
  };
  
  // State of the detail modal
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const showMemberDetail = (memberId: string) => {
    setSelectedMemberId(memberId);
  };

  const closeMemberDetail = () => {
    setSelectedMemberId(null);
  };

  const deleteMembership = (memberId: string) => {
    if (!memberId) return;
    const member = users.find(u => u.id === memberId);
    if (!member) return;
    if (member.role === 'Admin') {
      showToast('Akun admin tidak dapat dihapus dari halaman ini.');
      return;
    }
    if (memberId === 'DEMO_MHS_2026') {
      showToast('Akun demo Mahasiswa tidak dapat dihapus.');
      return;
    }
    if (memberId === 'DEMO_DSN_2026') {
      showToast('Akun demo Dosen tidak dapat dihapus.');
      return;
    }
    setMemberIdToDelete(memberId);
  };

  const confirmDeleteMembership = (memberId: string) => {
    if (!memberId) return;
    const member = users.find(u => u.id === memberId);
    if (!member) return;
    if (member.role === 'Admin') {
      showToast('Akun admin tidak dapat dihapus dari halaman ini.');
      setMemberIdToDelete(null);
      return;
    }
    if (memberId === 'DEMO_MHS_2026') {
      showToast('Akun demo Mahasiswa tidak dapat dihapus.');
      setMemberIdToDelete(null);
      return;
    }
    if (memberId === 'DEMO_DSN_2026') {
      showToast('Akun demo Dosen tidak dapat dihapus.');
      setMemberIdToDelete(null);
      return;
    }

    // 1. Remove from local active members
    const nextMembersList = users.filter(m => m.id !== memberId);
    localStorage.setItem("FST_USERS", JSON.stringify(nextMembersList));
    localStorage.setItem("libraryMembers", JSON.stringify(nextMembersList));
    localStorage.setItem("members", JSON.stringify(nextMembersList));

    // 2. Remove related registration requests / approved data (by email) to allow re-registration
    const updatedPendingList = pendingMembers.filter(m => m.email.toLowerCase() !== member.email.toLowerCase());
    setPendingMembers(updatedPendingList);
    localStorage.setItem('pendingMembers', JSON.stringify(updatedPendingList));

    // 3. Trigger parent delete action
    onDeleteMember(memberId);

    // 4. Reset modals and state
    closeMemberDetail();
    setMemberIdToDelete(null);
    
    // 5. Display success toast message
    showToast("Keanggotaan berhasil dihapus. Email dapat digunakan untuk registrasi ulang.");
  };

  const renderMembers = () => {
    console.log('Rendering members dynamically in React interface.');
  };

  // Bind required programmatic javascript hook methods and global click listener to window and document
  React.useEffect(() => {
    (window as any).showMemberDetail = showMemberDetail;
    (window as any).closeMemberDetail = closeMemberDetail;
    (window as any).deleteMembership = deleteMembership;
    (window as any).renderMembers = renderMembers;
    (window as any).currentDetailMemberId = selectedMemberId;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains("delete-membership-btn")) {
        const memberId = target.dataset.memberId || (window as any).currentDetailMemberId;
        if (memberId) {
          deleteMembership(memberId);
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);

    return () => {
      (window as any).showMemberDetail = undefined;
      (window as any).closeMemberDetail = undefined;
      (window as any).deleteMembership = undefined;
      (window as any).renderMembers = undefined;
      (window as any).currentDetailMemberId = undefined;
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [users, onDeleteMember, selectedMemberId]);

  const selectedMember = users.find(u => u.id === selectedMemberId);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState(2022);
  const [category, setCategory] = useState('Teknologi Informasi');
  const [shelf, setShelf] = useState('');
  const [copies, setCopies] = useState(3);
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('linear-gradient(135deg, #115e59 0%, #0f766e 100%)');
  
  // Reject overlay
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Toast status
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculations for stats
  const totalBooks = books.length;
  // Total Anggota should only include Mahasiswa and Dosen (real + dummy)
  const totalUsers = users.filter(u => u.role === 'Mahasiswa' || u.role === 'Dosen').length +
                     dummyData.users.filter(u => u.role === 'Mahasiswa' || u.role === 'Dosen').length;
  const pendingRequests = [
    ...borrows.filter(b => b.status === 'Menunggu'),
    ...dummyData.borrows.filter(b => b.status === 'Menunggu')
  ];
  const activeBorrows = [
    ...borrows.filter(b => b.status === 'Dipinjam'),
    ...dummyData.borrows.filter(b => b.status === 'Dipinjam')
  ];
  const overdueBorrows = [
    ...borrows.filter(b => b.status === 'Terlambat'),
    ...dummyData.borrows.filter(b => b.status === 'Terlambat')
  ];

  // Keaktifan Anggota = total approved active members with role Mahasiswa or Dosen and status 'Aktif' (real + dummy)
  const activeMembersCount = users.filter(u => 
    (u.role === 'Mahasiswa' || u.role === 'Dosen') && u.status === 'Aktif'
  ).length + dummyData.users.filter(u => 
    (u.role === 'Mahasiswa' || u.role === 'Dosen') && u.status === 'Aktif'
  ).length;

  // Persentase Ketersediaan: availableCopies / totalCopies across all books
  const totalCopiesSum = books.reduce((sum, b) => sum + (b.totalCopies || b.copies || 0), 0);
  const availableCopiesSum = books.reduce((sum, b) => sum + (b.availableCopies !== undefined ? b.availableCopies : 0), 0);
  const availabilityPercentage = totalCopiesSum > 0 ? Math.round((availableCopiesSum / totalCopiesSum) * 100) : 0;

  const isWithinRange = (dateStr: string) => {
    if (!dateStr) return false;
    return dateStr >= filterStartDate && dateStr <= filterEndDate;
  };

  // Simple stable deterministic hash based on a string
  const getDeterministicHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const getDeterministicRandom = (str: string, min: number, max: number, salt: string) => {
    const hash = getDeterministicHash(str + salt);
    return min + (hash % (max - min + 1));
  };

  const getOffsetDateStr = (dateStr: string, offsetDays: number): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const parseDateStrLocal = (str: string) => {
    if (!str) return new Date();
    const [year, month, day] = str.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getGeneratedSampleBorrows = (startStr: string, endStr: string): BorrowRecord[] => {
    return dummyData.borrows.filter(b => {
      const txDate = b.borrowDate || b.requestDate;
      return txDate >= startStr && txDate <= endStr;
    });
  };

  const realFilteredBorrows = borrows.filter(b => {
    const txDate = b.borrowDate || b.requestDate;
    return isWithinRange(txDate);
  });

  const sampleBorrows = getGeneratedSampleBorrows(filterStartDate, filterEndDate);
  const filteredBorrows = [...sampleBorrows, ...realFilteredBorrows];

  const reportTotalTransactions = filteredBorrows.length;
  const reportSuccessfullyReturned = filteredBorrows.filter(b => b.status === 'Dikembalikan').length;
  const reportLateReturns = filteredBorrows.filter(b => b.status === 'Terlambat' || (b.returnDate && b.dueDate && b.returnDate > b.dueDate)).length;

  const activeBorrowsInRange = filteredBorrows.filter(b => b.status === 'Dipinjam' || b.status === 'Terlambat').length;
  const simulatedTotalCopies = Math.max(totalCopiesSum * 5 + 150, activeBorrowsInRange + 20);
  const availableCopiesInRange = Math.max(10, simulatedTotalCopies - activeBorrowsInRange);
  const reportAvailabilityPercentage = simulatedTotalCopies > 0 ? Math.round((availableCopiesInRange / simulatedTotalCopies) * 100) : 0;

  const parseDateStr = (str: string) => {
    if (!str) return new Date();
    const [year, month, day] = str.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getReportItems = () => {
    const start = parseDateStr(filterStartDate);
    const end = parseDateStr(filterEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays <= 7) {
      // Daily Grouping
      const items = [];
      for (let i = 0; i < diffDays; i++) {
        const currentDay = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const dayStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
        const label = currentDay.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        
        items.push({
          key: dayStr,
          label: label,
          borrowed: 0,
          returned: 0,
          totalTransactions: 0,
          lateCount: 0,
          activeUsers: new Set<string>()
        });
      }

      filteredBorrows.forEach(b => {
        const dateStr = b.borrowDate || b.requestDate;
        const item = items.find(it => it.key === dateStr);
        if (item) {
          item.totalTransactions++;
          if (['Dipinjam', 'Terlambat', 'Dikembalikan', 'Disetujui'].includes(b.status)) {
            item.borrowed++;
          }
          if (b.status === 'Dikembalikan') {
            item.returned++;
          }
          const isLate = b.status === 'Terlambat' || (b.returnDate && b.dueDate && b.returnDate > b.dueDate);
          if (isLate) {
            item.lateCount++;
          }
          item.activeUsers.add(b.userId);
        }
      });

      return items.map(it => ({
        key: it.key,
        label: it.label,
        borrowed: it.borrowed,
        returned: it.returned,
        latePercent: it.borrowed > 0 ? Math.round((it.lateCount / it.borrowed) * 100) : 0,
        activeMembers: it.activeUsers.size
      }));
    } else if (diffDays <= 31) {
      // Weekly Grouping
      const items = [
        { key: 'W1', label: 'Week 1', borrowed: 0, returned: 0, totalTransactions: 0, lateCount: 0, activeUsers: new Set<string>() },
        { key: 'W2', label: 'Week 2', borrowed: 0, returned: 0, totalTransactions: 0, lateCount: 0, activeUsers: new Set<string>() },
        { key: 'W3', label: 'Week 3', borrowed: 0, returned: 0, totalTransactions: 0, lateCount: 0, activeUsers: new Set<string>() },
        { key: 'W4', label: 'Week 4', borrowed: 0, returned: 0, totalTransactions: 0, lateCount: 0, activeUsers: new Set<string>() }
      ];

      filteredBorrows.forEach(b => {
        const dateStr = b.borrowDate || b.requestDate;
        if (!dateStr) return;
        const bDate = parseDateStr(dateStr);
        const dayDiff = Math.floor((bDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        let weekIndex = Math.floor(dayDiff / 7);
        if (weekIndex < 0) weekIndex = 0;
        if (weekIndex > 3) weekIndex = 3;
        
        const item = items[weekIndex];
        item.totalTransactions++;
        if (['Dipinjam', 'Terlambat', 'Dikembalikan', 'Disetujui'].includes(b.status)) {
          item.borrowed++;
        }
        if (b.status === 'Dikembalikan') {
          item.returned++;
        }
        const isLate = b.status === 'Terlambat' || (b.returnDate && b.dueDate && b.returnDate > b.dueDate);
        if (isLate) {
          item.lateCount++;
        }
        item.activeUsers.add(b.userId);
      });

      return items.map(it => ({
        key: it.key,
        label: it.label,
        borrowed: it.borrowed,
        returned: it.returned,
        latePercent: it.borrowed > 0 ? Math.round((it.lateCount / it.borrowed) * 100) : 0,
        activeMembers: it.activeUsers.size
      }));
    } else {
      // Monthly Grouping
      const items: any[] = [];
      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= endMonth) {
        const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        const label = current.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        
        items.push({
          key: monthKey,
          label: label,
          borrowed: 0,
          returned: 0,
          totalTransactions: 0,
          lateCount: 0,
          activeUsers: new Set<string>()
        });
        
        current.setMonth(current.getMonth() + 1);
      }

      filteredBorrows.forEach(b => {
        const dateStr = b.borrowDate || b.requestDate;
        if (!dateStr) return;
        const [yr, mo] = dateStr.split('-');
        const monthKey = `${yr}-${mo}`;
        
        const item = items.find(it => it.key === monthKey);
        if (item) {
          item.totalTransactions++;
          if (['Dipinjam', 'Terlambat', 'Dikembalikan', 'Disetujui'].includes(b.status)) {
            item.borrowed++;
          }
          if (b.status === 'Dikembalikan') {
            item.returned++;
          }
          const isLate = b.status === 'Terlambat' || (b.returnDate && b.dueDate && b.returnDate > b.dueDate);
          if (isLate) {
            item.lateCount++;
          }
          item.activeUsers.add(b.userId);
        }
      });

      return items.map(it => ({
        key: it.key,
        label: it.label,
        borrowed: it.borrowed,
        returned: it.returned,
        latePercent: it.borrowed > 0 ? Math.round((it.lateCount / it.borrowed) * 100) : 0,
        activeMembers: it.activeUsers.size
      }));
    }
  };

  const reportItems = getReportItems();

  const handleShowReport = () => {
    const err = validateDateRange(inputStartDate, inputEndDate);
    if (err) {
      setDateError(err);
      showToast(err);
      return;
    }
    setDateError(null);
    setFilterStartDate(inputStartDate);
    setFilterEndDate(inputEndDate);
    showToast('Laporan sirkulasi berhasil diperbarui berdasarkan rentang tanggal.');
  };

  const handleResetFilter = () => {
    setInputStartDate('');
    setInputEndDate('');
    setFilterStartDate('2026-07-01');
    setFilterEndDate('2026-07-31');
    setDateError(null);
    showToast('Filter tanggal berhasil direset ke bulan berjalan.');
  };

  const handleExport = () => {
    try {
      const err = validateDateRange(inputStartDate, inputEndDate);
      if (err) {
        setDateError(err);
        showToast(err);
        return;
      }
      const reportData = getReportItems();
      const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';
      
      let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
      html += `<head><meta charset="utf-8">`;
      html += `<style>`;
      html += `  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #1e293b; }`;
      html += `  h1 { color: #0f172a; font-size: 18px; margin-bottom: 5px; }`;
      html += `  .meta-info { font-size: 11px; color: #64748b; margin-bottom: 20px; }`;
      html += `  table { border-collapse: collapse; width: 100%; margin-bottom: 25px; }`;
      html += `  th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 11px; }`;
      html += `  th { background-color: #f1f5f9; font-weight: bold; color: #334155; }`;
      html += `  .section-title { font-size: 13px; font-weight: bold; margin-top: 25px; margin-bottom: 10px; color: #1e3a8a; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; }`;
      html += `  .stat-card-table { width: auto; margin-bottom: 20px; }`;
      html += `  .stat-card-table td { padding: 12px 20px; background-color: #f8fafc; font-weight: bold; border-radius: 8px; border: 1px solid #cbd5e1; }`;
      html += `  .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px; }`;
      html += `  .stat-value { font-size: 18px; color: #0f172a; font-weight: 800; }`;
      html += `</style>`;
      html += `</head><body>`;
      
      // Title Block
      html += `<h1>SISTEM PERPUSTAKAAN DIGITAL FST</h1>`;
      html += `<h2>Laporan Sirkulasi & Statistik Laporan</h2>`;
      html += `<div class="meta-info">`;
      html += `  <strong>Rentang Tanggal:</strong> ${filterStartDate} s/d ${filterEndDate}<br/>`;
      html += `  <strong>Waktu Ekspor:</strong> ${timestamp}`;
      html += `</div>`;
      
      // 1. Summary Statistics
      html += `<div class="section-title">Ringkasan Statistik</div>`;
      html += `<table class="stat-card-table"><tr>`;
      html += `  <td><span class="stat-label">Total Transaksi</span><span class="stat-value">${reportTotalTransactions}</span></td>`;
      html += `  <td><span class="stat-label">Sukses Dikembalikan</span><span class="stat-value">${reportSuccessfullyReturned}</span></td>`;
      html += `  <td><span class="stat-label">Sanksi & Keterlambatan</span><span class="stat-value">${reportLateReturns}</span></td>`;
      html += `  <td><span class="stat-label">Persentase Ketersediaan</span><span class="stat-value">${reportAvailabilityPercentage}%</span></td>`;
      html += `</tr></table>`;
      
      // 2. Report Table
      html += `<div class="section-title">Tabel Ikhtisar Sirkulasi</div>`;
      html += `<table>`;
      html += `  <thead>`;
      html += `    <tr>`;
      html += `      <th>Periode</th>`;
      html += `      <th style="text-align: center;">Buku Dipinjam</th>`;
      html += `      <th style="text-align: center;">Buku Dikembalikan</th>`;
      html += `      <th style="text-align: center;">Tingkat Keterlambatan</th>`;
      html += `      <th style="text-align: right;">Keaktifan Anggota</th>`;
      html += `    </tr>`;
      html += `  </thead>`;
      html += `  <tbody>`;
      
      reportData.forEach(row => {
        html += `    <tr>`;
        html += `      <td>${row.label}</td>`;
        html += `      <td style="text-align: center; font-weight: bold;">${row.borrowed} Buku</td>`;
        html += `      <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${row.returned} Buku</td>`;
        html += `      <td style="text-align: center; font-weight: bold; color: #dc2626;">${row.latePercent}%</td>`;
        html += `      <td style="text-align: right; font-weight: bold;">${row.activeMembers} Anggota</td>`;
        html += `    </tr>`;
      });
      html += `  </tbody>`;
      html += `</table>`;
      
      // 3. Raw Filtered Transactions
      html += `<div class="section-title">Detail Transaksi Terfilter</div>`;
      html += `<table>`;
      html += `  <thead>`;
      html += `    <tr>`;
      html += `      <th>ID Transaksi</th>`;
      html += `      <th>ID Peminjam</th>`;
      html += `      <th>Nama Peminjam</th>`;
      html += `      <th>Peran</th>`;
      html += `      <th>Judul Buku</th>`;
      html += `      <th>Tgl Pinjam</th>`;
      html += `      <th>Batas Kembali</th>`;
      html += `      <th>Tgl Kembali</th>`;
      html += `      <th>Status</th>`;
      html += `    </tr>`;
      html += `  </thead>`;
      html += `  <tbody>`;
      
      if (filteredBorrows.length === 0) {
        html += `    <tr><td colspan="9" style="text-align: center; color: #94a3b8;">Tidak ada data sirkulasi dalam rentang tanggal ini.</td></tr>`;
      } else {
        filteredBorrows.forEach(tx => {
          html += `    <tr>`;
          html += `      <td>${tx.id}</td>`;
          html += `      <td>${tx.userId}</td>`;
          html += `      <td>${tx.userName}</td>`;
          html += `      <td>${tx.userRole}</td>`;
          html += `      <td>${tx.bookTitle}</td>`;
          html += `      <td>${tx.borrowDate || tx.requestDate}</td>`;
          html += `      <td>${tx.dueDate || '-'}</td>`;
          html += `      <td>${tx.returnDate || '-'}</td>`;
          html += `      <td>${tx.status}</td>`;
          html += `    </tr>`;
        });
      }
      html += `  </tbody>`;
      html += `</table>`;
      
      html += `</body></html>`;
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_Sirkulasi_FST_${filterStartDate}_to_${filterEndDate}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Laporan sirkulasi berhasil diunduh sebagai berkas XLS.');
    } catch (error) {
      console.error('Error exporting report:', error);
      showToast('Gagal mengekspor laporan sirkulasi.');
    }
  };

  const programStudiList = [
    'Teknik Informatika',
    'Sistem Informasi',
    'Matematika',
    'Fisika',
    'Kimia',
    'Biologi',
    'Agribisnis',
    'Teknik Pertambangan'
  ];

  const chartData = programStudiList.map(prodi => {
    let pinjamCount = 0;
    let kembaliCount = 0;

    const mergedBorrows = [...borrows, ...dummyData.borrows];
    const mergedUsers = [...users, ...dummyData.users];

    mergedBorrows.forEach(b => {
      const borrower = mergedUsers.find(u => u.id === b.userId || u.email.toLowerCase() === b.userEmail?.toLowerCase());
      const role = borrower?.role || b.userRole;
      const prodiName = borrower?.programStudi || b.programStudi;

      if (role === 'Mahasiswa' && prodiName === prodi) {
        if (['Disetujui', 'Dipinjam', 'Dikembalikan', 'Terlambat'].includes(b.status)) {
          pinjamCount += 1;
        }
        if (b.status === 'Dikembalikan') {
          kembaliCount += 1;
        }
      }
    });

    return {
      name: prodi,
      pinjam: pinjamCount,
      kembali: kembaliCount
    };
  });

  let highestProdi = 'Teknik Informatika';
  let maxPinjam = -1;

  chartData.forEach(item => {
    if (item.pinjam > maxPinjam) {
      maxPinjam = item.pinjam;
      highestProdi = item.name;
    }
  });

  const systemSuggestion = `Saran Sistem: Program Studi ${highestProdi} memiliki aktivitas peminjaman tertinggi. Pertimbangkan penambahan koleksi buku yang relevan dengan kebutuhan program studi tersebut.`;

  const openAddBookModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setPublisher('');
    setYear(2024);
    setCategory('Teknologi Informasi');
    setShelf('RAK-A' + (Math.floor(Math.random() * 5) + 1));
    setCopies(3);
    setDescription('');
    // Generate a random pleasant color gradient for dynamic book cover
    const gradients = [
      'linear-gradient(135deg, #115e59 0%, #0f766e 100%)', // Teal
      'linear-gradient(135deg, #065f46 0%, #047857 100%)', // Emerald
      'linear-gradient(135deg, #075985 0%, #0369a1 100%)', // Ocean
      'linear-gradient(135deg, #1e293b 0%, #334155 100%)', // Slate
      'linear-gradient(135deg, #3730a3 0%, #4338ca 100%)', // Indigo
      'linear-gradient(135deg, #85144b 0%, #b10dc9 100%)', // Purple
      'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)'  // Orange
    ];
    setCoverUrl(gradients[Math.floor(Math.random() * gradients.length)]);
    setIsBookModalOpen(true);
  };

  const openEditBookModal = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setPublisher(book.publisher);
    setYear(book.year);
    setCategory(book.category);
    setShelf(book.shelf);
    setCopies(book.copies);
    setDescription(book.description);
    setCoverUrl(book.coverUrl);
    setIsBookModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      alert('Judul dan Penulis wajib diisi!');
      return;
    }

    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
      alert(`Tahun terbit tidak boleh melebihi tahun sekarang (${currentYear})!`);
      showToast(`Gagal: Tahun terbit tidak boleh diatas tahun ${currentYear}`);
      return;
    }

    if (editingBook) {
      // Edit
      const borrowedCount = Math.max(0, editingBook.copies - editingBook.availableCopies);
      const nextAvailable = Math.min(copies, Math.max(0, copies - borrowedCount));
      const updated: Book = {
        ...editingBook,
        title,
        author,
        publisher,
        year,
        category,
        shelf,
        copies,
        totalCopies: copies,
        availableCopies: nextAvailable,
        borrowedCopies: Math.max(0, copies - nextAvailable),
        description
      };
      onUpdateBook(updated);
      showToast(`Sukses memperbarui buku: ${title}`);
    } else {
      // Create
      const newBook: Book = {
        id: 'B' + String(books.length + 1).padStart(3, '0'),
        title,
        author,
        publisher,
        year,
        category,
        shelf,
        copies,
        totalCopies: copies,
        availableCopies: copies,
        borrowedCopies: 0,
        status: 'Tersedia',
        description,
        coverUrl
      };
      onAddBook(newBook);
      showToast(`Sukses menambah buku baru: ${title}`);
    }
    setIsBookModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus buku "${name}"?`)) {
      onDeleteBook(id);
      showToast(`Sukes menghapus: ${name}`);
    }
  };

  return (
    <div className="space-y-6" id="admin-pages-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl border border-slate-700/50 flex items-center space-x-2.5 animate-bounce">
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></span>
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}

      {/* RENDER VIEW 1: BERANDA/ADMIN DASHBOARD */}
      {currentSubView === 'beranda' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold font-display text-primary-dark">Dashboard Tim Pustakawan FST</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ringkasan aktivitas sirkulasi dan pelaporan perpustakaan hari ini</p>
            </div>
            <span className="text-xs bg-background-soft text-primary-dark border border-border-soft font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Status Petugas: Aktif</span>
            </span>
          </div>

          {/* KPI Widget Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center space-x-4">
              <div className="w-11 h-11 bg-background-soft rounded-xl flex items-center justify-center text-primary-dark shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Buku</span>
                <h3 className="text-xl font-black font-display text-slate-900 leading-tight">{totalBooks}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center space-x-4">
              <div className="w-11 h-11 bg-primary-light rounded-xl flex items-center justify-center text-primary-dark shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Anggota</span>
                <h3 className="text-xl font-black font-display text-slate-900 leading-tight">{totalUsers}</h3>
              </div>
            </div>

            <div className="bg-background-soft border border-border-soft p-5 rounded-2xl shadow-xs flex items-center space-x-4">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-primary/10">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-primary-dark">Persetujuan</span>
                <h3 className="text-xl font-black font-display text-primary-dark leading-tight">{pendingRequests.length}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center space-x-4">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Buku Dipinjam</span>
                <h3 className="text-xl font-black font-display text-slate-900 leading-tight">{activeBorrows.length}</h3>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl shadow-xs flex items-center space-x-4 col-span-2 lg:col-span-1">
              <div className="w-11 h-11 bg-rose-100 rounded-xl flex items-center justify-center text-rose-700 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-700">Terlambat</span>
                <h3 className="text-xl font-black font-display text-rose-950 leading-tight">{overdueBorrows.length}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recharts Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-7 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">Statistik Peminjaman dan Pengembalian per Program Studi</h3>
                <p className="text-xs text-slate-400">Data sirkulasi buku berdasarkan program studi mahasiswa</p>
              </div>

              {/* Chart container */}
              <div className="h-[380px] w-full mt-4 text-xs font-medium">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 15, right: 10, left: -15, bottom: 65 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      type="category"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      angle={-40}
                      textAnchor="end"
                    />
                    <YAxis
                      type="number"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFF8E1',
                        border: '1px solid #E8D9A8',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        color: '#0F172A',
                        fontWeight: 'bold'
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={36}
                      iconType="rect"
                      iconSize={10}
                      wrapperStyle={{ fontSize: '11px', color: '#64748b', top: -10 }}
                    />
                    <Bar dataKey="pinjam" name="Pinjam" fill="#B8860B" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="pinjam" position="top" style={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} offset={4} />
                    </Bar>
                    <Bar dataKey="kembali" name="Kembali" fill="#E8D9A8" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="kembali" position="top" style={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} offset={4} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mt-4 text-[11px] text-slate-600 leading-relaxed font-semibold">
                🚀 {systemSuggestion}
              </div>
            </div>

            {/* Recent Activities Feed */}
            {(() => {
              const sortedReal = [...borrows].sort((a, b) => {
                const dateA = a.borrowDate || a.requestDate || '';
                const dateB = b.borrowDate || b.requestDate || '';
                if (dateA !== dateB) return dateB.localeCompare(dateA);
                return b.id.localeCompare(a.id);
              });

              const sortedDummy = [...dummyData.borrows].sort((a, b) => {
                const dateA = a.borrowDate || a.requestDate || '';
                const dateB = b.borrowDate || b.requestDate || '';
                if (dateA !== dateB) return dateB.localeCompare(dateA);
                return b.id.localeCompare(a.id);
              });

              const recentActivitiesLog = [...sortedReal, ...sortedDummy];
              const getShortId = (id: string) => {
                if (id.startsWith('seed-')) {
                  const parts = id.split('-');
                  const last = parts[parts.length - 1];
                  return `S${last}`;
                }
                return id.replace('TX', '');
              };

              return (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-5">
                  <h3 className="text-base font-bold font-display text-slate-900 mb-4 flex items-center space-x-1.5">
                    <BarChart2 className="w-5 h-5 text-primary-dark" />
                    <span>Log Transaksi Sirkulasi Terbaru</span>
                  </h3>

                  <div className="flow-root">
                    <ul className="-mb-8">
                      {recentActivitiesLog.slice(0, 4).map((record, index) => (
                        <li key={record.id}>
                          <div className="relative pb-8">
                            {index !== 3 ? <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" /> : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ring-6 ring-white ${
                                  record.status === 'Menunggu' ? 'bg-amber-100 text-amber-800' :
                                  record.status === 'Dipinjam' ? 'bg-blue-100 text-blue-800' :
                                  record.status === 'Terlambat' ? 'bg-rose-100 text-rose-800' : 'bg-background-soft text-primary-dark'
                                }`}>
                                  {getShortId(record.id)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 pt-1.5">
                                <p className="text-xs text-slate-800">
                                  <strong>{record.userName}</strong> ({record.userRole}){' '}
                                  <span className="text-slate-500">mengajukan pinjam</span>{' '}
                                  <strong>{record.bookTitle}</strong>
                                </p>
                                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                                  <span>Tgl: {record.requestDate}</span>
                                  <span className={`font-semibold uppercase tracking-wider ${
                                    record.status === 'Menunggu' ? 'text-amber-600' :
                                    record.status === 'Dipinjam' ? 'text-blue-600' :
                                    record.status === 'Terlambat' ? 'text-rose-600' : 'text-primary-dark'
                                  }`}>{record.status}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* RENDER VIEW 2: MANAJEMEN BUKU (CRUD) */}
      {currentSubView === 'manajemen-buku' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display text-primary-dark">Kelola Inventaris Buku</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tambah, perbarui, edit rak, dan jumlah eksemplar buku perpustakaan</p>
            </div>
            <button
               onClick={openAddBookModal}
               className="inline-flex items-center space-x-2 px-4.5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-md shadow-primary/10 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Buku Baru</span>
            </button>
          </div>

          {/* Table Toolbar Search */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="relative max-w-md w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Cari berdasarkan judul, penulis, rak..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-primary font-medium text-slate-800"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">Total: {books.length} Koleksi terdaftar</span>
          </div>

          {/* Book Catalog Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/70">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Buku</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasi Rak</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Eksemplar (Tersedia)</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tahun</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {books.filter(b => b.title.toLowerCase().includes(bookSearch.toLowerCase()) || b.author.toLowerCase().includes(bookSearch.toLowerCase()) || b.category.toLowerCase().includes(bookSearch.toLowerCase())).map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-12 rounded-xs flex-shrink-0 relative overflow-hidden" style={{ background: book.coverUrl }}></div>
                          <div>
                            <p className="font-bold text-slate-900">{book.title}</p>
                            <p className="text-[10px] text-slate-500">{book.author}</p>
                            <p className="text-[9px] font-mono text-slate-400 uppercase">{book.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700 text-xs">{book.shelf}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-bold">
                        <span className={`${book.availableCopies === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {book.copies}
                        </span>
                        <span className="text-slate-400 font-normal"> ({book.availableCopies} tersedia)</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{book.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                        <button
                          onClick={() => openEditBookModal(book)}
                          className="p-1 px-2.5 py-1 text-slate-600 hover:text-primary border border-slate-200 hover:border-border-soft rounded hover:bg-background-soft font-bold transition inline-flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(book.id, book.title)}
                          className="p-1 px-2.5 py-1 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-350 rounded hover:bg-rose-50 font-bold transition inline-flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW 3: MANAJEMEN ANGGOTA */}
      {currentSubView === 'manajemen-anggota' && (
        <div className="space-y-6 animate-fade-in">
          {/* Section: Pengajuan Anggota Baru */}
          <div className="space-y-3 bg-[#FFF8E1]/20 p-5 rounded-2xl border border-[#E8D9A8]/45">
            <h3 className="text-base font-bold font-display text-primary-dark flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441] animate-pulse"></span>
              <span>Pengajuan Anggota Baru</span>
            </h3>
            <p className="text-xs text-slate-500">
              Daftar pengajuan registrasi anggota perpustakaan baru yang menunggu persetujuan admin.
            </p>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              {pendingMembers.filter(m => m.approvalStatus === 'Menunggu Persetujuan').length === 0 ? (
                <div className="p-8 text-center text-slate-450 text-slate-400 space-y-1">
                  <CheckCircle className="w-7 h-7 text-primary/80 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-xs">Antrean Pengajuan Kosong</h4>
                  <p className="text-[11px]">Semua pendaftaran telah diproses.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                    <thead className="bg-[#FFF8E1]/50">
                      <tr>
                        <th scope="col" className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider">Nama</th>
                        <th scope="col" className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider">Status / Role</th>
                        <th scope="col" className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider">Tanggal Pengajuan</th>
                        <th scope="col" className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider">Persetujuan</th>
                        <th scope="col" className="px-5 py-3 text-center font-bold text-slate-600 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {pendingMembers
                        .filter(m => m.approvalStatus === 'Menunggu Persetujuan')
                        .map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-900 font-bold">
                              <div>{req.fullName}</div>
                              {req.nimNip && <div className="text-[10px] text-slate-400 font-mono font-medium">NIM/NIP: {req.nimNip}</div>}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">{req.email}</td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.role === 'Admin' ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                                req.role === 'Dosen' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                                'bg-blue-50 text-blue-800 border border-blue-100'
                              }`}>
                                {req.role}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">{req.createdAt || '2026-06-23'}</td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 bg-[#D9A441] rounded-full mr-1.5 animate-pulse"></span>
                                {req.approvalStatus}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-center space-x-2">
                              <button
                                onClick={() => handleApprove(req)}
                                className="px-3 py-1.5 bg-[#D9A441] hover:bg-[#B8860B] text-white text-[10px] font-bold rounded-lg shadow-xs transition-all cursor-pointer inline-flex items-center space-x-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 text-[10px] font-bold rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1"
                              >
                                <X className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-200/80 my-4" />

          <div>
            <h2 className="text-2xl font-bold font-display text-primary-dark">Daftar Anggota Perpustakaan</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manajemen civitas akademika (Mahasiswa & Dosen) yang memiliki akun sirkulasi aktif</p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Cari anggota..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-primary font-medium text-slate-800"
              />
            </div>
            <span className="text-xs font-bold text-primary-dark bg-background-soft px-2.5 py-1 rounded">
              {users.length} Akun Terdaftar
            </span>
          </div>

          {/* Member Card Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50/70">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider">Nama Anggota</th>
                  <th scope="col" className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider">Peran (Role)</th>
                  <th scope="col" className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider">Status Akun</th>
                  <th scope="col" className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()) || u.id.includes(memberSearch) || u.role.toLowerCase().includes(memberSearch.toLowerCase()) || (u.nimNip && u.nimNip.toLowerCase().includes(memberSearch.toLowerCase()))).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-450 text-slate-400 font-bold">
                      Belum ada data anggota.
                    </td>
                  </tr>
                ) : (
                  users.filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()) || u.id.includes(memberSearch) || u.role.toLowerCase().includes(memberSearch.toLowerCase()) || (u.nimNip && u.nimNip.toLowerCase().includes(memberSearch.toLowerCase()))).map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img src={user.avatarImage || user.avatar || DEFAULT_AVATAR} referrerPolicy="no-referrer" alt={user.name} className="w-8 h-8 rounded-full border object-cover" />
                          <div>
                            <p className="font-bold text-slate-900">{user.name}</p>
                            <p className="text-[10px] text-slate-400">Terdaftar Sejak {getMemberRegistrationDate(user)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          user.role === 'Admin' ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                          user.role === 'Dosen' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                          'bg-blue-50 text-blue-800 border border-blue-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-background-soft text-primary-dark border border-border-soft">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1.5"></span>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => showMemberDetail(user.id)}
                          className="px-2.5 py-1 font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-350 rounded bg-slate-50 hover:bg-slate-100/60 transition cursor-pointer"
                        >
                          Detail Kartu
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* DETAIL CARD MODAL */}
          {selectedMember && (
            <div 
              className="modal-overlay fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" 
              id="member-detail-modal"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeMemberDetail();
                }
              }}
              style={{ zIndex: 9998 }}
            >
              <div 
                className="member-detail-modal modal-card bg-white p-7 rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl relative space-y-6"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                style={{ zIndex: 9999, pointerEvents: 'auto' }}
              >
                
                {/* Header Close button */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-base text-primary-dark font-display">Detail Kartu Anggota</h3>
                  <button
                    onClick={closeMemberDetail}
                    className="p-1 px-2 text-slate-450 hover:text-slate-750 hover:bg-slate-50 transition rounded-lg font-bold cursor-pointer"
                  >
                    X
                  </button>
                </div>

                {/* Profile top section */}
                <div className="flex flex-col items-center space-y-3.5 text-center">
                  <img
                    src={selectedMember.avatarImage || selectedMember.avatar || DEFAULT_AVATAR}
                    referrerPolicy="no-referrer"
                    alt={selectedMember.name}
                    className="w-24 h-24 rounded-full border-4 border-background-soft shadow-md object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-black text-slate-900 font-display leading-tight">{selectedMember.name}</h4>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-background-soft border border-border-soft text-primary-dark text-xs font-extrabold rounded-md">
                      {selectedMember.role}
                    </span>
                  </div>
                </div>

                {/* Member Details */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 space-y-2.5 text-xs text-slate-650 font-bold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email</span>
                    <span className="text-slate-850 break-all pl-4 text-right">{selectedMember.email}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/40 pt-2 shadow-inner-white">
                    <span className="text-slate-400">ID Anggota</span>
                    <span className="text-slate-850 font-mono">{selectedMember.id}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/40 pt-2 shadow-inner-white">
                    <span className="text-slate-400">NIM / NIP</span>
                    <span className="text-slate-850 font-mono">{selectedMember.nimNip || '-'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/40 pt-2">
                    <span className="text-slate-400">Fakultas</span>
                    <span className="text-slate-850">{selectedMember.fakultas || 'Fakultas Sains dan Teknologi'}</span>
                  </div>
                  {selectedMember.role === 'Mahasiswa' && (
                    <div className="flex justify-between border-t border-slate-200/40 pt-2">
                      <span className="text-slate-400">Program Studi</span>
                      <span className="text-slate-850">{selectedMember.programStudi || 'Teknik Informatika'}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200/40 pt-2">
                    <span className="text-slate-400">Status Akun</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedMember.status === 'Aktif' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
                      {selectedMember.status}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/40 pt-2">
                    <span className="text-slate-400">Terdaftar Sejak</span>
                    <span className="text-slate-850">{getMemberRegistrationDate(selectedMember)}</span>
                  </div>
                </div>

                {/* Account deletion buttons with safeguards for Admin accounts */}
                <div className="pt-2">
                  {selectedMember.role === 'Admin' || selectedMember.id === 'DEMO_MHS_2026' || selectedMember.id === 'DEMO_DSN_2026' ? (
                    <div className="space-y-2">
                      <button
                        disabled
                        className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 font-bold rounded-lg text-sm cursor-not-allowed border-slate-200 border"
                      >
                        Hapus Keanggotaan
                      </button>
                      <p className="text-center text-[10px] text-rose-600 font-bold bg-rose-50/70 p-2 rounded-lg border border-rose-150">
                        {selectedMember.id === 'DEMO_MHS_2026' ? 'Akun demo Mahasiswa tidak dapat dihapus.' : 
                         selectedMember.id === 'DEMO_DSN_2026' ? 'Akun demo Dosen tidak dapat dihapus.' : 
                         'Akun admin tidak dapat dihapus dari halaman ini.'}
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      data-member-id={selectedMember.id}
                      onClick={() => deleteMembership(selectedMember.id)}
                      className="delete-membership-btn w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg shadow-sm hover:shadow-md transition text-sm cursor-pointer text-center"
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                    >
                      Hapus Keanggotaan
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CUSTOM CONFIRMATION DIALOG FOR MEMBERSHIP DELETION */}
          {memberIdToDelete && (
            <div 
              className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
              style={{ zIndex: 10000 }}
              onClick={() => setMemberIdToDelete(null)}
            >
              <div 
                className="bg-white p-7 rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-3 text-amber-600">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <h3 className="text-base font-bold text-slate-900 font-display">Konfirmasi Hapus</h3>
                </div>
                <p className="text-sm text-slate-650 font-medium">Yakin ingin menghapus keanggotaan ini?</p>
                <div className="flex space-x-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setMemberIdToDelete(null)}
                    className="flex-1 py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-sm transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDeleteMembership(memberIdToDelete)}
                    className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm transition cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW 4: PERSETUJUAN PEMINJAMAN (Approval Queue) */}
      {currentSubView === 'persetujuan' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display text-primary-dark">Antrean Verifikasi Peminjaman</h2>
            <p className="text-xs text-slate-500 mt-0.5">Setujui atau tolak pengajuan peminjaman buku dari mahasiswa dan dosen</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {pendingRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <CheckCircle className="w-10 h-10 text-primary mx-auto" />
                <h4 className="font-bold text-slate-700">Semua Berkas Terverifikasi!</h4>
                <p className="text-xs">Tidak ada pengajuan peminjaman yang menunggu persetujuan pustakawan saat ini.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                <thead className="bg-slate-50/70">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pemohon</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Buku yang Diajukan</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Pengajuan</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan Alasan</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Verifikasi Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {pendingRequests.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-bold text-slate-900">{record.userName}</p>
                          <p className="text-[10px] text-slate-400">{record.userRole} &bull; {record.userId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-8 rounded-xs" style={{ background: record.bookCover }}></div>
                          <div>
                            <span className="font-bold text-slate-900">{record.bookTitle}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">ID: {record.bookId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{record.requestDate}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-[11px] text-slate-600">{record.notes || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2.5">
                        <button
                          onClick={() => {
                            onApproveBorrow(record.id);
                            showToast(`Pengajuan ${record.userName} disetujui!`);
                          }}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-xs transition cursor-pointer inline-flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={() => {
                            setRejectId(record.id);
                            setRejectReason('Buku sedang direstorasi / Batas peminjaman maksimal Anda tercapai.');
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition cursor-pointer inline-flex items-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Model Penolakan */}
          {rejectId && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white p-6 rounded-2xl max-w-md w-full border border-slate-100 space-y-4">
                <h3 className="font-bold text-base text-slate-900">Alasan Penolakan Pengajuan</h3>
                <p className="text-xs text-slate-500">Tulis alasan penolakan agar pemohon mendapatkan ulasan di panel notifikasi mereka.</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-rose-500 focus:bg-white text-slate-800"
                  placeholder="Contoh: Eksemplar buku di gudang sedang rusak atau dibatasi..."
                ></textarea>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => { setRejectId(null); }}
                    className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-lg transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      onRejectBorrow(rejectId, rejectReason);
                      setRejectId(null);
                      showToast('Pengajuan pinjam telah ditolak.');
                    }}
                    className="px-4.5 py-2 bg-rose-600 hover:bg-rose-750 text-white font-bold text-xs rounded-lg transition"
                  >
                    Kirim Penolakan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW 5: PENGEMBALIAN BUKU */}
      {currentSubView === 'pengembalian-buku' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display text-primary-dark">Catat Pengembalian Buku</h2>
            <p className="text-xs text-slate-500 mt-0.5">Konfirmasi pengembalian buku fisik yang saat ini berstatus sedang dipinjam</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {borrows.filter(b => b.status === 'Dipinjam' || b.status === 'Terlambat').length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <CheckCircle className="w-10 h-10 text-primary mx-auto" />
                <h4 className="font-bold text-slate-700">Tidak Ada Pinjaman Aktif</h4>
                <p className="text-xs">Saat ini tidak ada buku sirkulasi fisik yang berada di tangan peminjam.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                <thead className="bg-slate-50/70">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID / Peminjam</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Buku</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tgl Pinjam</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Batas Kembali (Due)</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Status</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi Pustakawan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {borrows.filter(b => b.status === 'Dipinjam' || b.status === 'Terlambat').map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-bold text-slate-900">{record.userName}</p>
                          <p className="text-[10px] text-slate-400">{record.userId} &bull; {record.userRole}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold">{record.bookTitle}</span>
                        <span className="block text-[10px] text-slate-400">Kode Buku: {record.bookId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{record.borrowDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-600">{record.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.status === 'Terlambat'
                            ? 'bg-rose-50 text-rose-800 border border-rose-100'
                            : 'bg-blue-50 text-blue-800 border border-blue-100'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            onReturnBook(record.id);
                            showToast(`Buku ${record.bookTitle} dikonfirmasi kembali!`);
                          }}
                          className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition shadow-xs text-xs cursor-pointer inline-flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Proses Pengembalian</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* RENDER VIEW 6: KETERSEDIAAN BUKU */}
      {currentSubView === 'ketersediaan' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display text-primary-dark">Update Ketersediaan Buku di Rak</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ubah status ketersediaan secara manual jika terdapat rujukan buku rusak atau cadangan internal</p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {books.map((book) => {
              const total = book.copies;
              const borrowed = total - book.availableCopies;
              return (
                <div key={book.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex space-x-3.5">
                    <div className="w-11 h-15 rounded-sm relative overflow-hidden shrink-0" style={{ background: book.coverUrl }}></div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">{book.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Rak: {book.shelf}</p>
                      <p className="text-[10px] font-bold text-slate-500">{book.availableCopies} dari {total} eksemplar tersedia</p>
                      <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        book.status === 'Tersedia' ? 'bg-emerald-100 text-emerald-800' :
                        book.status === 'Dipinjam' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {book.status}
                      </span>
                    </div>
                  </div>
 
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Rak:</span>
                      <select
                        value={book.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as 'Tersedia' | 'Dipinjam' | 'Tidak Tersedia';
                          let nextAvailable = book.availableCopies;
                          let isManualUnav = book.isUnavailableManual;
 
                          if (newStatus === 'Tidak Tersedia') {
                            nextAvailable = 0;
                            isManualUnav = true;
                          } else if (newStatus === 'Tersedia') {
                            isManualUnav = false;
                            if (nextAvailable === 0) {
                              nextAvailable = total;
                            }
                          } else if (newStatus === 'Dipinjam') {
                            isManualUnav = false;
                            nextAvailable = 0;
                          }
 
                          // Clear any error for this book
                          setCopyErrors(prev => {
                            const updated = { ...prev };
                            delete updated[book.id];
                            return updated;
                          });
 
                          const updated: Book = {
                            ...book,
                            status: newStatus,
                            availableCopies: nextAvailable,
                            totalCopies: total,
                            borrowedCopies: Math.max(0, total - nextAvailable),
                            isUnavailableManual: isManualUnav
                          };
                          onUpdateBook(updated);
                          showToast(`Ubah status ketersediaan "${book.title}" menjadi ${newStatus}`);
                        }}
                        className="p-1 px-2.5 text-xs text-slate-800 font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded outline-hidden"
                      >
                        <option value="Tersedia">Tersedia</option>
                        <option value="Dipinjam">Dipinjam</option>
                        <option value="Tidak Tersedia">Tidak Tersedia</option>
                      </select>
                    </div>
 
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Tersedia:</span>
                      <div className="flex flex-col items-end">
                        <input
                          type="number"
                          min="0"
                          max={total}
                          disabled={book.status !== 'Tersedia'}
                          value={book.status === 'Tersedia' ? book.availableCopies : 0}
                          onChange={(e) => {
                            const valStr = e.target.value;
                            if (valStr === '') return;
                            const val = parseInt(valStr, 10);
                            
                            if (isNaN(val)) return;
 
                            if (val > total) {
                              setCopyErrors(prev => ({
                                ...prev,
                                [book.id]: 'Jumlah tersedia tidak boleh melebihi total eksemplar.'
                              }));
                              showToast('Jumlah tersedia tidak boleh melebihi total eksemplar.');
                              return;
                            }
 
                            // Valid value, clear errors
                            setCopyErrors(prev => {
                              const updated = { ...prev };
                              delete updated[book.id];
                              return updated;
                            });
 
                            let nextStatus: 'Tersedia' | 'Dipinjam' | 'Tidak Tersedia' = 'Tersedia';
                            let isManualUnav = book.isUnavailableManual;
                            if (val === 0) {
                              // If available is 0, check if active borrowed copies or manual
                              const activeBorrowed = Math.max(0, total - val);
                              nextStatus = activeBorrowed > 0 ? 'Dipinjam' : 'Tidak Tersedia';
                              if (nextStatus === 'Tidak Tersedia') {
                                isManualUnav = true;
                              }
                            }
 
                            const updated: Book = {
                              ...book,
                              availableCopies: val,
                              totalCopies: total,
                              borrowedCopies: Math.max(0, total - val),
                              status: nextStatus,
                              isUnavailableManual: isManualUnav
                            };
                            onUpdateBook(updated);
                          }}
                          className="w-16 p-1 px-2 text-xs text-right text-slate-800 font-semibold bg-slate-50 border border-slate-200 rounded outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>
                    </div>
                    {copyErrors[book.id] && (
                      <p className="text-rose-500 text-[10px] font-bold text-right mt-1">
                        {copyErrors[book.id]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER VIEW 7: LAPORAN PERPUSTAKAAN */}
      {currentSubView === 'laporan' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold font-display text-primary-dark">Laporan Sirkulasi & Statistik Laporan</h2>
              <p className="text-xs text-slate-500 mt-0.5">Analisis tren sirkulasi buku, kepatuhan batas waktu, dan keaktifan anggota perpustakaan</p>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Laporan (XLS)</span>
            </button>
          </div>

          {/* Date Range Filter Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tanggal Mulai (Start Date)</label>
                  <input
                    type="date"
                    value={inputStartDate}
                    onChange={(e) => setInputStartDate(e.target.value)}
                    max={inputEndDate || undefined}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 hover:bg-white rounded-lg text-xs font-semibold focus:outline-hidden focus:bg-white text-slate-800 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tanggal Selesai (End Date)</label>
                  <input
                    type="date"
                    value={inputEndDate}
                    onChange={(e) => setInputEndDate(e.target.value)}
                    min={inputStartDate || undefined}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 hover:bg-white rounded-lg text-xs font-semibold focus:outline-hidden focus:bg-white text-slate-800 transition"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={handleShowReport}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tampilkan Laporan</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-900 font-bold text-xs rounded-lg transition cursor-pointer flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              </div>
            </div>

            {dateError && (
              <div className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-center space-x-2 animate-fade-in animate-duration-200" id="date-range-error-msg">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{dateError}</span>
              </div>
            )}
            
            <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              <Calendar className="w-3.5 h-3.5 text-primary-dark shrink-0" />
              <span>
                Menampilkan data sirkulasi real-time dari <strong>{filterStartDate}</strong> hingga <strong>{filterEndDate}</strong>.
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Transaksi</span>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{reportTotalTransactions}</h4>
              <p className="text-[10px] text-primary-dark mt-2 font-semibold">Aktif Semester Ini &uarr;</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sukses Dikembalikan</span>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{reportSuccessfullyReturned}</h4>
              <p className="text-[10px] text-slate-500 mt-2 font-semibold">Tercatat di Sistem</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sanksi & Denda Terlambat</span>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{reportLateReturns}</h4>
              <p className="text-[10px] text-rose-600 mt-2 font-semibold">Memerlukan Tindakan</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Persentase Ketersediaan</span>
              <h4 className="text-2xl font-black text-primary-dark mt-1">{reportAvailabilityPercentage}%</h4>
              <p className="text-[10px] text-slate-500 mt-2 font-semibold">Ready di Rak</p>
            </div>
          </div>

          {/* Vertical Bar Chart Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">Statistik Peminjaman dan Pengembalian Buku</h3>
              <p className="text-xs text-slate-400">Analisis perbandingan buku yang dipinjam dan yang berhasil dikembalikan</p>
            </div>

            {/* Chart container */}
            <div className="h-[380px] w-full mt-4 text-xs font-medium">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportItems}
                  margin={{ top: 20, right: 10, left: -15, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF8E1',
                      border: '1px solid #E8D9A8',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#0F172A',
                      fontWeight: 'bold'
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    iconType="rect"
                    iconSize={10}
                    wrapperStyle={{ fontSize: '11px', color: '#64748b', top: -10 }}
                  />
                  <Bar dataKey="borrowed" name="Buku Dipinjam" fill="#B8860B" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="borrowed" position="top" style={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} offset={4} />
                  </Bar>
                  <Bar dataKey="returned" name="Buku Dikembalikan" fill="#E8D9A8" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="returned" position="top" style={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} offset={4} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Report Grouped Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 font-display flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-primary-dark" />
              <span>Tabel Ikhtisar Sirkulasi & Keaktifan Anggota</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs font-medium text-slate-500">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-400 uppercase tracking-wider">Periode</th>
                    <th className="px-6 py-3.5 text-center font-bold text-slate-400 uppercase tracking-wider">Buku Dipinjam</th>
                    <th className="px-6 py-3.5 text-center font-bold text-slate-400 uppercase tracking-wider">Buku Dikembalikan</th>
                    <th className="px-6 py-3.5 text-center font-bold text-slate-400 uppercase tracking-wider">Tingkat Keterlambatan</th>
                    <th className="px-6 py-3.5 text-right font-bold text-slate-400 uppercase tracking-wider">Keaktifan Anggota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium bg-slate-50/40 rounded-b-xl">
                        Tidak ada aktivitas sirkulasi dalam rentang tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    reportItems.map((row) => (
                      <tr key={row.key} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-semibold text-slate-800">{row.label}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-700">{row.borrowed} Buku</td>
                        <td className="px-6 py-4 text-center font-bold text-primary-dark">{row.returned} Buku</td>
                        <td className={`px-6 py-4 text-center font-bold ${row.latePercent > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {row.latePercent}%
                        </td>
                        <td className="px-6 py-4 text-right text-slate-800 font-semibold">{row.activeMembers} Anggota</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {currentSubView === 'profil-admin' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display text-primary-dark">Profil Admin Perpustakaan</h2>
            <p className="text-xs text-slate-500 mt-1">Informasi akun administrator Perpustakaan Digital FST</p>
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
                  id="admin-profile-img-selector"
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

                {profileAlertMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-100 w-full animate-fade-in">
                    {profileAlertMsg}
                  </div>
                )}
              </div>

              {/* CARD DETAILS */}
              <div className="border-t border-slate-100 pt-5 space-y-3.5 text-xs font-medium">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Email Terdaftar</span>
                  <span className="text-slate-800 font-bold">{currentUser.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100/60 pt-3">
                  <span className="text-slate-400">ID Admin</span>
                  <span className="text-slate-800 font-mono font-bold">{currentUser.id}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100/60 pt-3">
                  <span className="text-slate-400">Status Akun</span>
                  <span className="text-emerald-600 font-black flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 inline-block"></span>
                    Aktif
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100/60 pt-3">
                  <span className="text-slate-400">Fakultas</span>
                  <span className="text-slate-800 font-bold font-sans">Fakultas Sains dan Teknologi</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100/60 pt-3">
                  <span className="text-slate-400">Jabatan</span>
                  <span className="text-slate-800 font-bold">Administrator Perpustakaan</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100/60 pt-3">
                  <span className="text-slate-400">Terdaftar Sejak</span>
                  <span className="text-slate-850 font-bold">{getMemberRegistrationDate(currentUser)}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: HAK AKSES & DYNAMIC STATS */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ringkasan Aktivitas Admin Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5 text-primary-dark" />
                  <h3 className="font-extrabold text-sm text-slate-900 font-display">Ringkasan Aktivitas Admin</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Buku</span>
                    <h4 className="text-xl font-black text-slate-800 mt-1">{books.length}</h4>
                    <p className="text-[9px] text-slate-400 mt-1">Koleksi terdaftar</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Anggota</span>
                    <h4 className="text-xl font-black text-slate-800 mt-1">{users.length}</h4>
                    <p className="text-[9px] text-slate-400 mt-1">Anggota aktif</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pengajuan Menunggu</span>
                    <h4 className="text-xl font-black text-rose-600 mt-1">
                      {borrows.filter(b => b.status === 'Menunggu').length}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">Butuh verifikasi</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sedang Dipinjam</span>
                    <h4 className="text-xl font-black text-primary-dark mt-1">
                      {borrows.filter(b => b.status === 'Dipinjam' || b.status === 'Terlambat').length}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">Sirkulasi berjalan</p>
                  </div>
                </div>
              </div>

              {/* Hak Akses Admin Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary-dark" />
                  <h3 className="font-extrabold text-sm text-slate-900 font-display">Hak Akses Admin</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
                  <div className="flex items-start space-x-3 p-3 bg-background-soft/40 border border-border-soft rounded-xl">
                    <span className="p-2 bg-white rounded-lg border border-slate-200/60 text-primary-dark shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850">Manajemen Buku</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Menambah, mengedit, dan merawat data sirkulasi buku digital di rak.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-background-soft/40 border border-border-soft rounded-xl">
                    <span className="p-2 bg-white rounded-lg border border-slate-200/60 text-primary-dark shrink-0">
                      <Users className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850">Manajemen Anggota</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Memvalidasi pendaftaran anggota baru, melihat detail kartu, dan menonaktifkan.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-background-soft/40 border border-border-soft rounded-xl">
                    <span className="p-2 bg-white rounded-lg border border-slate-200/60 text-primary-dark shrink-0">
                      <Clock className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850">Persetujuan Peminjaman</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Meninjau permohonan sirkulasi mahasiswa dan dosen secara tepat.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-background-soft/40 border border-border-soft rounded-xl">
                    <span className="p-2 bg-white rounded-lg border border-slate-200/60 text-primary-dark shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850">Pengembalian Buku</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Mencatat pengembalian buku fisik, kalkulasi keterlambatan, dan denda.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-background-soft/40 border border-border-soft rounded-xl">
                    <span className="p-2 bg-white rounded-lg border border-slate-200/60 text-primary-dark shrink-0">
                      <Layers className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850">Ketersediaan Buku</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-medium">Memantau ketersediaan slot sirkulasi buku real-time di rak perpustakaan.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-background-soft/40 border border-border-soft rounded-xl">
                    <span className="p-2 bg-white rounded-lg border border-slate-200/60 text-primary-dark shrink-0">
                      <BarChart2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850">Laporan Perpustakaan</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Meninjau performa mingguan sirkulasi, data keterlambatan, dan statistik anggota.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOM CONFIRMATION DIALOG FOR PHOTO DELETION */}
          {showDeletePhotoConfirm && (
            <div 
              className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4"
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
        </div>
      )}

      {currentSubView === 'notifikasi' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display text-primary-dark">Notifikasi Admin</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Daftar aktivitas terbaru yang membutuhkan perhatian admin.</p>
            </div>
            {adminNotifications.length > 0 && (
              <button
                onClick={() => {
                  const updated = adminNotifications.map((n: any) => ({ ...n, isRead: true }));
                  setAdminNotifications(updated);
                  localStorage.setItem('adminNotifications', JSON.stringify(updated));
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary-dark font-bold text-xs rounded-lg transition border border-primary/20 cursor-pointer shadow-2xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>

          {adminNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto mt-6">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 text-amber-600">
                <Bell className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-slate-850 text-base font-display">Belum ada notifikasi admin.</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Notifikasi akan muncul ketika ada pengajuan peminjaman, pengembalian buku, atau pengajuan anggota baru.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-w-4xl">
              {adminNotifications.map((notif: any) => {
                const getIcon = () => {
                  switch (notif.type) {
                    case 'peminjaman':
                      return <Clock className="w-4 h-4 text-emerald-600" />;
                    case 'pengembalian':
                      return <RefreshCw className="w-4 h-4 text-blue-600" />;
                    case 'anggota':
                      return <Users className="w-4 h-4 text-amber-600" />;
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

                const getActionButton = () => {
                  if (notif.type === 'peminjaman') {
                    return (
                      <button
                        onClick={() => onChangeSubView('persetujuan')}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md transition cursor-pointer"
                      >
                        <span>Lihat Pengajuan</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    );
                  }
                  if (notif.type === 'pengembalian') {
                    return (
                      <button
                        onClick={() => onChangeSubView('pengembalian-buku')}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md transition cursor-pointer"
                      >
                        <span>Lihat Pengembalian</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    );
                  }
                  if (notif.type === 'anggota') {
                    return (
                      <button
                        onClick={() => onChangeSubView('manajemen-anggota')}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md transition cursor-pointer"
                      >
                        <span>Lihat Pengajuan</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    );
                  }
                  return null;
                };

                return (
                  <div key={notif.id} className={`p-4 rounded-xl transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${getBgClass()}`}>
                    <div className="flex items-start space-x-3.5">
                      <div className={`p-2.5 rounded-lg shrink-0 ${
                        notif.type === 'peminjaman' ? 'bg-emerald-50' : 
                        notif.type === 'pengembalian' ? 'bg-blue-50' : 
                        notif.type === 'anggota' ? 'bg-amber-50' : 'bg-slate-100'
                      }`}>
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
                        <p className="text-[10px] text-slate-400 font-mono">{notif.createdAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 sm:self-center self-end pt-2 sm:pt-0">
                      {getActionButton()}
                      {!notif.isRead && (
                        <button
                          onClick={() => {
                            const updated = adminNotifications.map((n: any) => n.id === notif.id ? { ...n, isRead: true } : n);
                            setAdminNotifications(updated);
                            localStorage.setItem('adminNotifications', JSON.stringify(updated));
                          }}
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

      {/* CREATE & EDIT BOOK FLOATING DIALOG */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-primary px-6 py-4.5 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-base font-display">
                {editingBook ? 'Edit Data Buku' : 'Tambah Buku ke Koleksi Perpustakaan'}
              </h3>
              <button onClick={() => setIsBookModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Judul Buku *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Pemrograman Web dengan React & TypeScript"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold focus:outline-hidden focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Penulis *</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Contoh: Budi Raharjo"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold focus:outline-hidden focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Penerbit</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Contoh: FST Press"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold focus:outline-hidden focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori Rumpun</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold focus:outline-hidden focus:bg-white text-slate-800"
                  >
                    {BOOK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tahun Terbit</label>
                  <input
                    type="number"
                    value={year}
                    max={new Date().getFullYear()}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold focus:outline-hidden focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lokasi Kode Rak</label>
                  <input
                    type="text"
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    placeholder="Contoh: RAK-A3"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold focus:outline-hidden focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jumlah Eksemplar Buku</label>
                  <input
                    type="number"
                    value={copies}
                    onChange={(e) => setCopies(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold focus:outline-hidden focus:bg-white text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Deskripsi & Sinopsis Buku</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Tulis ringkasan singkat isi buku..."
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold focus:outline-hidden focus:bg-white text-slate-800"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4.5 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-lg shadow-md transition cursor-pointer"
                >
                  Simpan Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
