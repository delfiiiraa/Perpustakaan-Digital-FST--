import React, { useState } from 'react';
import { ArrowLeft, Library, User, Mail, Key, AlertCircle, CheckCircle, ChevronDown, FileText } from 'lucide-react';
import { getJakartaTimestamp } from '../types';

interface RegisterPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateHome, onNavigateLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [nimNip, setNimNip] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'Mahasiswa' | 'Dosen' | 'Admin'>('Mahasiswa');
  const [fakultas, setFakultas] = useState('Fakultas Sains dan Teknologi');
  const [programStudi, setProgramStudi] = useState('Teknik Informatika');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field sanitizations & validations
    const nameTrimmed = fullName.trim();
    const emailTrimmed = email.trim();
    const nimNipTrimmed = nimNip.trim();
    
    if (!nameTrimmed) {
      setError('Nama Lengkap harus diisi.');
      return;
    }
    if (!emailTrimmed) {
      setError('Email harus diisi.');
      return;
    }
    if (!nimNipTrimmed) {
      setError('NIM / NIP harus diisi.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Kata Sandi minimal 4 karakter.');
      return;
    }

    if (status === 'Mahasiswa' && !programStudi) {
      setError('Program Studi harus dipilih untuk Mahasiswa.');
      return;
    }

    // Email domain validation based on status
    if (status === 'Mahasiswa') {
      if (!emailTrimmed.endsWith('@mhs.uinjkt.ac.id')) {
        setError('Email mahasiswa harus menggunakan domain @mhs.uinjkt.ac.id');
        return;
      }
    } else if (status === 'Dosen') {
      if (!emailTrimmed.endsWith('@uinjkt.ac.id')) {
        setError('Email dosen harus menggunakan domain @uinjkt.ac.id');
        return;
      }
    } else {
      // Admin
      if (!emailTrimmed.endsWith('@fst.ac.id')) {
        setError('Email admin harus menggunakan domain @fst.ac.id');
        return;
      }
    }

    // Load current pending members
    let pendingList: any[] = [];
    try {
      const pendingJson = localStorage.getItem('pendingMembers');
      if (pendingJson && pendingJson !== 'undefined' && pendingJson !== 'null') {
        const parsed = JSON.parse(pendingJson);
        if (Array.isArray(parsed)) {
          pendingList = parsed;
        }
      }
    } catch (e) {
      console.error('Error parsing pendingMembers:', e);
    }

    // Check if email already exists in pending approval status or approved active members
    const emailExistsInPending = pendingList.some((m: any) => 
      m && m.email && m.email.toLowerCase() === emailTrimmed.toLowerCase() && m.approvalStatus === 'Menunggu Persetujuan'
    );
    
    // Check if email exists in active members from FST_USERS
    let activeUsersList: any[] = [];
    try {
      const activeUsersJson = localStorage.getItem('FST_USERS');
      if (activeUsersJson && activeUsersJson !== 'undefined' && activeUsersJson !== 'null') {
        const parsed = JSON.parse(activeUsersJson);
        if (Array.isArray(parsed)) {
          activeUsersList = parsed;
        }
      }
    } catch (e) {
      console.error('Error parsing FST_USERS:', e);
    }
    const emailExistsInActive = activeUsersList.some((u: any) => u && u.email && u.email.toLowerCase() === emailTrimmed.toLowerCase());

    if (emailExistsInPending || emailExistsInActive) {
      setError('Email ini sudah terdaftar di sistem.');
      return;
    }

    // Filter out any old rejected or approved registration entries for this email to prevent conflict/clutter
    const cleanedPendingList = pendingList.filter((m: any) => m && m.email && m.email.toLowerCase() !== emailTrimmed.toLowerCase());

    // Create a new registration entry
    const newRequest = {
      id: 'REG' + Date.now() + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      fullName: nameTrimmed,
      email: emailTrimmed,
      nimNip: nimNipTrimmed,
      password: password,
      role: status,
      fakultas: 'Fakultas Sains dan Teknologi',
      programStudi: status === 'Mahasiswa' ? programStudi : '',
      approvalStatus: 'Menunggu Persetujuan',
      createdAt: getJakartaTimestamp()
    };

    // Save and commit
    cleanedPendingList.push(newRequest);
    localStorage.setItem('pendingMembers', JSON.stringify(cleanedPendingList));

    // Create Admin Notification for Member Registration
    try {
      const storedNotifs = localStorage.getItem('adminNotifications');
      const adminNotifs = storedNotifs ? JSON.parse(storedNotifs) : [];
      const eventKey = `member-registered-${newRequest.id}`;
      const isExist = adminNotifs.some((n: any) => n.eventKey === eventKey);
      if (!isExist) {
        const newAdminNotif = {
          id: 'AN' + Date.now() + '_' + Math.floor(Math.random() * 100000),
          title: 'Pengajuan Anggota Baru',
          message: `${nameTrimmed} mengajukan registrasi sebagai ${status}.`,
          type: 'anggota',
          relatedUserId: newRequest.id,
          relatedUserName: nameTrimmed,
          isRead: false,
          createdAt: getJakartaTimestamp(),
          eventKey: eventKey
        };
        adminNotifs.unshift(newAdminNotif);
        localStorage.setItem('adminNotifications', JSON.stringify(adminNotifs));
      }
    } catch (e) {
      console.error('Error adding admin notification on register page:', e);
    }

    // Show success dialog/view
    setSuccess(true);
    setFullName('');
    setEmail('');
    setNimNip('');
    setPassword('');
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="absolute top-6 left-6 flex space-x-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-primary-dark font-semibold text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 yellow-gradient rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-primary/20">
          <Library className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Registrasi Anggota Perpustakaan
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Silakan isi data diri untuk mengajukan akun Perpustakaan Digital FST.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-100 rounded-2xl border border-slate-100">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-950 font-display">Mengajukan Pendaftaran</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Registrasi berhasil diajukan. Silakan menunggu persetujuan admin.
                </p>
              </div>
              <div className="pt-4 flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-md shadow-primary/10 transition-colors text-sm cursor-pointer"
                >
                  Masuk ke Akun
                </button>
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="w-full py-2 px-4 text-slate-600 hover:text-slate-850 text-xs font-semibold hover:underline"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              {error && (
                <div id="error-message" className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start space-x-2 text-rose-700">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase mb-1">
                  Nama Lengkap
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary-dark transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase mb-1">
                  Status Anggota
                </label>
                <div className="relative rounded-lg">
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as any);
                      setError('');
                    }}
                    className="appearance-none block w-full pl-4 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary-dark transition-all font-semibold text-slate-800"
                  >
                    <option value="Mahasiswa">Mahasiswa (@mhs.uinjkt.ac.id)</option>
                    <option value="Dosen">Dosen (@uinjkt.ac.id)</option>
                    <option value="Admin">Admin / Pustakawan (@fst.ac.id)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase mb-1">
                  Email Akademik
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={status === 'Mahasiswa' ? 'example@mhs.uinjkt.ac.id' : status === 'Dosen' ? 'example@uinjkt.ac.id' : 'example@fst.ac.id'}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary-dark transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase mb-1">
                  NIM / NIP
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nimNip}
                    onChange={(e) => setNimNip(e.target.value)}
                    placeholder="Contoh: 12409011012345"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary-dark transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase mb-1">
                  Kata Sandi
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary-dark transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase mb-1">
                  Fakultas
                </label>
                <div className="relative rounded-lg">
                  <select
                    value={fakultas}
                    onChange={(e) => setFakultas(e.target.value)}
                    disabled
                    className="appearance-none block w-full pl-4 pr-10 py-2.5 bg-slate-100 text-sm border border-slate-200 rounded-lg focus:outline-hidden font-semibold text-slate-500 cursor-not-allowed"
                  >
                    <option value="Fakultas Sains dan Teknologi">Fakultas Sains dan Teknologi</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {status === 'Mahasiswa' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase mb-1">
                    Program Studi
                  </label>
                  <div className="relative rounded-lg">
                    <select
                      value={programStudi}
                      onChange={(e) => setProgramStudi(e.target.value)}
                      className="appearance-none block w-full pl-4 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary-dark transition-all font-semibold text-slate-800"
                    >
                      <option value="Teknik Informatika">Teknik Informatika</option>
                      <option value="Sistem Informasi">Sistem Informasi</option>
                      <option value="Matematika">Matematika</option>
                      <option value="Fisika">Fisika</option>
                      <option value="Kimia">Kimia</option>
                      <option value="Biologi">Biologi</option>
                      <option value="Agribisnis">Agribisnis</option>
                      <option value="Teknik Pertambangan">Teknik Pertambangan</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="mt-6 w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-md shadow-primary/10 hover:shadow-lg transition-all focus:outline-hidden text-sm cursor-pointer"
              >
                Registrasi
              </button>

              <div className="mt-4 text-center">
                <span className="text-xs text-slate-500">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={onNavigateLogin}
                    className="text-primary-dark font-bold hover:underline"
                  >
                    Masuk di sini
                  </button>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
