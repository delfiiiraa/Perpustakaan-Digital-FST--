import React, { useState } from 'react';
import { UserCheck, Shield, BookOpen, Key, AlertCircle, ArrowLeft, Library, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateHome: () => void;
  onNavigateRegister: () => void;
  initialTab?: 'Mahasiswa' | 'Dosen' | 'Admin';
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSuccess, 
  onNavigateHome, 
  onNavigateRegister,
  initialTab = 'Mahasiswa'
}) => {
  const [activeTab, setActiveTab] = useState<'Mahasiswa' | 'Dosen' | 'Admin'>(initialTab);
  const [username, setUsername] = useState(initialTab === 'Admin' ? 'admin@fst.ac.id' : '');
  const [password, setPassword] = useState(initialTab === 'Admin' ? '123456' : '');
  const [error, setError] = useState('');

  React.useEffect(() => {
    setActiveTab(initialTab);
    setError('');
    if (initialTab === 'Admin') {
      setUsername('admin@fst.ac.id');
      setPassword('123456');
    } else {
      setUsername('');
      setPassword('');
    }
  }, [initialTab]);

  const handleTabChange = (tab: 'Mahasiswa' | 'Dosen' | 'Admin') => {
    setActiveTab(tab);
    setError('');
    if (tab === 'Admin') {
      setUsername('admin@fst.ac.id');
      setPassword('123456');
    } else {
      setUsername('');
      setPassword('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Domain validation
    const isEmail = username.includes('@');
    if (activeTab === 'Mahasiswa') {
      if (isEmail && !username.endsWith('@mhs.uinjkt.ac.id')) {
        setError('Email mahasiswa harus menggunakan domain @mhs.uinjkt.ac.id');
        return;
      }
    } else if (activeTab === 'Dosen') {
      if (isEmail && !username.endsWith('@uinjkt.ac.id')) {
        setError('Email dosen harus menggunakan domain @uinjkt.ac.id');
        return;
      }
    } else if (activeTab === 'Admin') {
      if (isEmail && !username.endsWith('@fst.ac.id')) {
        setError('Email admin harus menggunakan domain @fst.ac.id');
        return;
      }
    }

    // Load registrations from localStorage to check for pending / rejected / approved accounts
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
    
    // Search by email or id/nimNip matching the typed username and selected role tab
    const matchedRequest = pendingList.find((m: any) => 
      m && m.email && (m.email.toLowerCase() === username.trim().toLowerCase() || m.id === username.trim() || (m.nimNip && m.nimNip === username.trim())) && m.role === activeTab
    );

    // Pre-determine if the account exists anywhere in pendingList, fallback users, or FST_USERS
    const isDefaultFallbackUser = (activeTab === 'Mahasiswa' && username === 'mahasiswa@mhs.uinjkt.ac.id') ||
                                  (activeTab === 'Mahasiswa' && username.trim().toLowerCase() === 'delfira.karnain@mhs.uinjkt.ac.id') ||
                                  (activeTab === 'Dosen' && username === 'dosen@uinjkt.ac.id') ||
                                  (activeTab === 'Dosen' && username.trim().toLowerCase() === 'hendra.bayu@uinjkt.ac.id') ||
                                  (activeTab === 'Admin' && username === 'admin@fst.ac.id');
    
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
    
    const matchedActive = activeUsersList.find((u: any) => 
      u && u.email && (u.email.toLowerCase() === username.trim().toLowerCase() || u.id === username.trim() || (u.nimNip && u.nimNip === username.trim())) && u.role === activeTab
    );

    if (!isDefaultFallbackUser && !matchedRequest && !matchedActive) {
      setError('Akun tidak ditemukan. Silakan registrasi ulang.');
      return;
    }

    if (matchedRequest) {
      if (matchedRequest.approvalStatus === 'Menunggu Persetujuan') {
        setError('Akun Anda masih menunggu persetujuan admin.');
        return;
      }
      if (matchedRequest.approvalStatus === 'Ditolak') {
        setError('Akun Anda belum disetujui oleh admin.');
        return;
      }
      // If approved, check password
      if (matchedRequest.approvalStatus === 'Disetujui') {
        if (matchedRequest.password === password) {
          onLoginSuccess({
            id: matchedRequest.id,
            name: matchedRequest.fullName,
            email: matchedRequest.email,
            role: matchedRequest.role,
            status: 'Aktif',
            avatar: matchedRequest.avatar || '',
            nimNip: matchedRequest.nimNip,
            fakultas: matchedRequest.fakultas || 'Fakultas Sains dan Teknologi',
            programStudi: matchedRequest.programStudi
          });
          return;
        } else {
          setError('Kombinasi Email/NIP/NIM dan Password tidak valid.');
          return;
        }
      }
    }

    // Helper to merge existing profile photo and data from FST_USERS if available
    const findSavedUserAndMerge = (defaultUser: any) => {
      const saved = activeUsersList.find((u: any) => u && u.email && u.email.toLowerCase() === defaultUser.email.toLowerCase());
      if (saved) {
        return {
          ...defaultUser,
          ...saved,
          avatar: saved.avatar || defaultUser.avatar || '',
          avatarImage: saved.avatarImage || defaultUser.avatarImage || ''
        };
      }
      return defaultUser;
    };

    // Fallback default checks for traditional/dummy profiles
    if (activeTab === 'Mahasiswa' && username === 'mahasiswa@mhs.uinjkt.ac.id' && password === '123456') {
      onLoginSuccess(findSavedUserAndMerge({
        id: '123456',
        name: 'Budi Santoso',
        email: 'mahasiswa@mhs.uinjkt.ac.id',
        role: 'Mahasiswa',
        status: 'Aktif',
        avatar: '',
        nimNip: '123456',
        fakultas: 'Fakultas Sains dan Teknologi',
        programStudi: 'Teknik Informatika'
      }));
    } else if (activeTab === 'Mahasiswa' && username.trim().toLowerCase() === 'delfira.karnain@mhs.uinjkt.ac.id' && password === '123456') {
      onLoginSuccess(findSavedUserAndMerge({
        id: 'DEMO_MHS_2026',
        name: 'Delfira Karnain',
        email: 'delfira.karnain@mhs.uinjkt.ac.id',
        role: 'Mahasiswa',
        status: 'Aktif',
        avatar: '',
        nimNip: '2023019011',
        fakultas: 'Fakultas Sains dan Teknologi',
        programStudi: 'Teknik Informatika'
      }));
    } else if (activeTab === 'Dosen' && username === 'dosen@uinjkt.ac.id' && password === '123456') {
      onLoginSuccess(findSavedUserAndMerge({
        id: '198705',
        name: 'Dr. Ahmad Fauzi, M.T.',
        email: 'dosen@uinjkt.ac.id',
        role: 'Dosen',
        status: 'Aktif',
        avatar: '',
        nimNip: '198705',
        fakultas: 'Fakultas Sains dan Teknologi'
      }));
    } else if (activeTab === 'Dosen' && username.trim().toLowerCase() === 'hendra.bayu@uinjkt.ac.id' && password === '123456') {
      onLoginSuccess(findSavedUserAndMerge({
        id: 'DEMO_DSN_2026',
        name: 'Hendra Bayu',
        email: 'hendra.bayu@uinjkt.ac.id',
        role: 'Dosen',
        status: 'Aktif',
        avatar: '',
        nimNip: '198812312020011001',
        fakultas: 'Fakultas Sains dan Teknologi',
        programStudi: '-'
      }));
    } else if (activeTab === 'Admin' && username === 'admin@fst.ac.id' && password === '123456') {
      onLoginSuccess(findSavedUserAndMerge({
        id: 'ADMIN01',
        name: 'Delfira Karnain',
        email: 'admin@fst.ac.id',
        role: 'Admin',
        status: 'Aktif',
        avatar: '',
        nimNip: 'ADMIN01',
        fakultas: 'Fakultas Sains dan Teknologi',
        registeredAt: '24 Juni 2026, 09:00 WIB'
      }));
    } else {
      if (matchedActive && password === '123456') {
        onLoginSuccess({
          id: matchedActive.id,
          name: matchedActive.name,
          email: matchedActive.email,
          role: matchedActive.role,
          status: 'Aktif',
          avatar: matchedActive.avatar || '',
          avatarImage: matchedActive.avatarImage || '',
          nimNip: matchedActive.nimNip,
          fakultas: matchedActive.fakultas || 'Fakultas Sains dan Teknologi',
          programStudi: matchedActive.programStudi
        });
      } else {
        setError('Kombinasi Email/NIP/NIM dan Password tidak valid.');
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="absolute top-6 left-6">
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
          Masuk ke Akun Anda
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Gunakan portal otentikasi sirkulasi Perpustakaan Digital FST
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-100 rounded-2xl border border-slate-100">
          
          {/* Custom tab view for roles */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => handleTabChange('Mahasiswa')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'Mahasiswa'
                  ? 'bg-white text-primary-dark shadow-xs border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mahasiswa</span>
            </button>
            <button
              onClick={() => handleTabChange('Dosen')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'Dosen'
                  ? 'bg-white text-primary-dark shadow-xs border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Dosen</span>
            </button>
            <button
              onClick={() => handleTabChange('Admin')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'Admin'
                  ? 'bg-white text-primary-dark shadow-xs border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start space-x-2 text-rose-700">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span className="text-xs font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase mb-1">
                {activeTab === 'Mahasiswa' ? 'Email / NIM' : activeTab === 'Dosen' ? 'Email / NIP' : 'Email Admin'}
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    activeTab === 'Mahasiswa'
                      ? 'example@mhs.uinjkt.ac.id'
                      : activeTab === 'Dosen'
                      ? 'example@uinjkt.ac.id'
                      : 'admin@fst.ac.id'
                  }
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
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary-dark transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-md shadow-primary/10 hover:shadow-lg transition-all focus:outline-hidden text-sm cursor-pointer"
            >
              Masuk Sebagai {activeTab}
            </button>

            {activeTab === 'Admin' && (
              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs space-y-1">
                <div className="font-bold text-slate-800">Demo Admin Account</div>
                <div>Email: <span className="font-mono text-slate-700">admin@fst.ac.id</span></div>
                <div>Password: <span className="font-mono text-slate-700">••••••</span></div>
                <div className="text-[10px] text-slate-400 italic mt-1 leading-normal">
                  This note is only for demonstration purposes.
                </div>
              </div>
            )}

            {activeTab === 'Mahasiswa' && (
              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs space-y-1">
                <div className="font-bold text-slate-800">Demo Mahasiswa Account</div>
                <div>Email: <span className="font-mono text-slate-700">delfira.karnain@mhs.uinjkt.ac.id</span></div>
                <div>Password: <span className="font-mono text-slate-700">123456</span></div>
                <div className="text-[10px] text-slate-400 italic mt-1 leading-normal">
                  This account is available only for demonstration purposes.
                </div>
              </div>
            )}

            {activeTab === 'Dosen' && (
              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs space-y-1">
                <div className="font-bold text-slate-800">Demo Dosen Account</div>
                <div>Email: <span className="font-mono text-slate-700">hendra.bayu@uinjkt.ac.id</span></div>
                <div>Password: <span className="font-mono text-slate-700">123456</span></div>
                <div className="text-[10px] text-slate-400 italic mt-1 leading-normal">
                  This account is available only for demonstration purposes.
                </div>
              </div>
            )}
          </form>

          <div className="mt-5 text-center">
            <span className="text-xs text-slate-500">
              Belum terdaftar?{' '}
              <button
                type="button"
                onClick={onNavigateRegister}
                className="text-primary-dark font-bold hover:underline cursor-pointer"
              >
                Silakan daftar anggota perpustakaan di sini.
              </button>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
