import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { createEmployee } from '../../redux/slices/employeesSlice';
import { addEmployeeSchema } from '../../lib/validators';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  UserPlus, 
  X, 
  Key, 
  Copy, 
  Check, 
  Sparkles, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  BadgeDollarSign, 
  Lock 
} from 'lucide-react';

export default function AddEmployeeModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: 'Engineering',
      designation: 'Software Engineer',
      phone: '',
      joiningDate: new Date().toISOString().split('T')[0],
      monthlySalary: 5000,
    },
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('password', pwd, { shouldValidate: true });
    toast.info('Secure password generated!');
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    const action = await dispatch(createEmployee(values));
    setIsSubmitting(false);

    if (createEmployee.fulfilled.match(action)) {
      toast.success('Employee account onboarded successfully!');
      setCreatedCredentials({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      reset();
    } else {
      toast.error(action.payload || 'Failed to onboard employee');
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `FreshShifts Onboarding Credentials:\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nRole: ${createdCredentials.role}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseAll = () => {
    setCreatedCredentials(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={createdCredentials ? handleCloseAll : onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 my-8 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal/10 border border-teal/20 text-teal rounded-2xl">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Onboard New Employee</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Decision #4 Grouped Onboarding Flow</p>
                </div>
              </div>
              <button
                onClick={createdCredentials ? handleCloseAll : onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Follow-up Confirmation Dialog for Generated Credentials */}
            {createdCredentials ? (
              <div className="space-y-6 py-2">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-start gap-4">
                  <Sparkles className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-extrabold text-base">Account Created Successfully!</h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      Share these single-use credentials with <strong className="font-bold">{createdCredentials.name}</strong> so they can log in to FreshShifts.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 space-y-3 font-mono text-sm border border-slate-800 shadow-inner">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs text-slate-400 uppercase font-bold">Email:</span>
                    <span className="text-sky-300 font-bold">{createdCredentials.email}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs text-slate-400 uppercase font-bold">Password:</span>
                    <span className="text-emerald-400 font-bold bg-slate-800 px-2 py-1 rounded">{createdCredentials.password}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 uppercase font-bold">Role:</span>
                    <span className="text-amber-300 font-bold capitalize">{createdCredentials.role}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyCredentials}
                    className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-semibold flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied to Clipboard' : 'Copy Credentials'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCloseAll}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm px-6"
                  >
                    Done & Close
                  </Button>
                </div>
              </div>
            ) : (
              /* Grouped Form Fields (Decision #4) */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
                {/* Group 1: Personal Identity */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-200/60 p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <User className="w-4 h-4 text-teal" /> 1. Personal Identity
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        {...register('name')}
                        className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm font-medium ${errors.name ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email *</label>
                      <input
                        type="email"
                        placeholder="johndoe@freshshifts.com"
                        {...register('email')}
                        className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm font-medium ${errors.email ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+1 (555) 123-4567"
                        {...register('phone')}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Group 2: Role & Department */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-200/60 p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal" /> 2. Role & Department Assignment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">System Role *</label>
                      <select
                        {...register('role')}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                      >
                        <option value="employee">Employee</option>
                        <option value="hr_admin">HR Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                      <input
                        type="text"
                        placeholder="Engineering, HR, Marketing..."
                        {...register('department')}
                        className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm font-medium ${errors.department ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {errors.department && <p className="text-xs text-red-600 mt-1">{errors.department.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation *</label>
                      <input
                        type="text"
                        placeholder="Senior Software Engineer"
                        {...register('designation')}
                        className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm font-medium ${errors.designation ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {errors.designation && <p className="text-xs text-red-600 mt-1">{errors.designation.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Date of Joining</label>
                      <input
                        type="date"
                        {...register('joiningDate')}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Group 3: Compensation & Initial Password */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-200/60 p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <BadgeDollarSign className="w-4 h-4 text-teal" /> 3. Compensation & Credentials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Base Salary ($) *</label>
                      <input
                        type="number"
                        placeholder="5000"
                        {...register('monthlySalary')}
                        className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm font-medium ${errors.monthlySalary ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {errors.monthlySalary && <p className="text-xs text-red-600 mt-1">{errors.monthlySalary.message}</p>}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">Initial Password *</label>
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="text-[11px] font-bold text-teal hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="••••••••"
                        {...register('password')}
                        className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm font-mono font-medium ${errors.password ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="border-slate-200 text-slate-700 rounded-xl text-sm font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-teal hover:bg-teal-600 text-white font-semibold rounded-xl text-sm px-6 py-2.5 shadow-md flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                      </>
                    ) : (
                      'Confirm Onboarding'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
