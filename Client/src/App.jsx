import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './app/store';
import { checkSession } from './redux/slices/authSlice';
import AppRoutes from '@/routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import freshshiftsLogo from '@/assets/freshshifts-logo.jpg';

function AppContent() {
  const dispatch = useDispatch();
  const { isBootstrapping } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  // Full-screen loading overlay while session bootstrap validates tokens (Section 9)
  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="p-3 bg-white rounded-2xl shadow-xl mb-6 animate-pulse">
          <img src={freshshiftsLogo} alt="FreshShifts" className="h-10 w-auto object-contain rounded" />
        </div>
        <div className="flex items-center gap-3 text-sky-400 font-semibold mb-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Validating Enterprise Session...</span>
        </div>
        <p className="text-xs text-slate-400 font-medium">Securing connection to FreshShifts HRMS</p>
      </div>
    );
  }

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
