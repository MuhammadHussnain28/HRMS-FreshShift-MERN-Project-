import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProfile, updateMyProfile } from '../../redux/slices/employeesSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { selfProfileSchema } from '../../lib/validators';
import { Button } from '@/components/ui/button';
import StatusBadge from '../../components/shared/StatusBadge';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  BadgeDollarSign, 
  ShieldCheck, 
  Lock, 
  Edit3, 
  Save, 
  X, 
  Loader2 
} from 'lucide-react';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { myProfile } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profile = myProfile || user;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(selfProfileSchema),
    defaultValues: {
      phone: profile?.phone || '',
    },
  });

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      reset({
        phone: profile.phone || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    const action = await dispatch(updateMyProfile(values));
    setIsSubmitting(false);

    if (updateMyProfile.fulfilled.match(action)) {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } else {
      toast.error(action.payload || 'Failed to update profile');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shrink-0 border-2 border-white/20">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'ME'}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{profile?.name}</h1>
                <StatusBadge status={profile?.employmentStatus || 'active'} />
              </div>
              <p className="text-slate-300 font-medium text-sm mt-1">{profile?.designation || 'Employee'} • {profile?.department || 'Department'}</p>
              <p className="text-xs text-sky-400 font-mono mt-0.5">{profile?.email}</p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-end">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 backdrop-blur-xs px-5 py-2.5"
              >
                <Edit3 className="w-4 h-4" /> Edit Contact Info
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setIsEditing(false);
                  reset({ phone: profile?.phone || '' });
                }}
                variant="outline"
                className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 px-5 py-2.5"
              >
                <X className="w-4 h-4" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Form / Readout Grid */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Editable Section: Contact Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal" /> Contact & Communication
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Fields you are permitted to self-update</p>
            </div>
            {isEditing && (
              <span className="text-xs font-semibold text-teal bg-teal/10 px-2.5 py-1 rounded-lg">
                Edit Mode Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Contact Phone Number
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    {...register('phone')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 font-medium mt-1.5">{errors.phone.message}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  {profile?.phone || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Primary Email Address
              </label>
              <div className="relative">
                <p className="text-sm font-semibold text-slate-700 bg-slate-100 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <span>{profile?.email}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                    <Lock className="w-3 h-3" /> Managed by HR
                  </span>
                </p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal hover:bg-teal-600 text-white font-semibold rounded-xl text-sm px-6 py-2.5 shadow-md flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Contact Info
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Read-Only Organizational & Compensation Cards */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="pb-4 border-b border-slate-100 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" /> Organizational Position & Compensation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Managed exclusively by HR Administration (Read-Only)</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              <Lock className="w-3.5 h-3.5" /> Read-Only
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> System Role
              </span>
              <p className="text-sm font-bold text-slate-900 capitalize">{profile?.role?.replace('_', ' ') || 'Employee'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Department
              </span>
              <p className="text-sm font-bold text-slate-900">{profile?.department || 'Unassigned'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Job Designation
              </span>
              <p className="text-sm font-bold text-slate-900">{profile?.designation || 'Unassigned'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date of Joining
              </span>
              <p className="text-sm font-bold text-slate-900">
                {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1 sm:col-span-2 lg:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BadgeDollarSign className="w-3.5 h-3.5 text-slate-400" /> Monthly Base Salary
              </span>
              <p className="text-base font-extrabold text-slate-900">
                {profile?.monthlySalary ? `$${profile.monthlySalary.toLocaleString()} / mo` : 'Confidential'}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
