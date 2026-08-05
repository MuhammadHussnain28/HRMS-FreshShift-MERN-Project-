import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import { loginSchema } from '../../lib/validators';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Lock, Mail, ArrowLeft } from 'lucide-react';
import freshshiftsLogo from '@/assets/freshshifts-logo.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error: serverError } = useSelector((state) => state.auth);
  const [authError, setAuthError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setAuthError(null);
    const resultAction = await dispatch(login(values));
    if (login.fulfilled.match(resultAction)) {
      navigate('/dashboard', { replace: true });
    } else {
      setAuthError(resultAction.payload || 'Invalid email or password');
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden bg-grid-dots">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-200/20 blur-3xl rounded-full pointer-events-none" />

      {/* Back to Home Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal transition-colors bg-white/80 backdrop-blur px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> 
          <span className='hidden sm:inline'>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* FreshShifts Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 rounded-2xl shadow-sm mb-4">
            <img src={freshshiftsLogo} alt="FreshShifts" className="h-10 w-auto object-contain rounded" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Authentication</h1>
          <p className="text-sm text-slate-500 mt-1">Enter your credentials to access FreshShifts HRMS</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-8">
          {/* Inline Error Alert */}
          {(authError || serverError) && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-xs text-red-600 mt-0.5">{authError || serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@freshshifts.com"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all ${
                    errors.email ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 font-medium mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all ${
                    errors.password ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials Reminder */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium mb-1">Demo Credentials:</p>
            <p className="text-xs font-mono text-slate-600 bg-slate-100 p-2 rounded-lg">
              admin@freshshifts.com • AdminPass123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
