import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { updateEmployee } from '../../redux/slices/employeesSlice';
import { editEmployeeSchema } from '../../lib/validators';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Edit3, X, Loader2, User, Building2, BadgeDollarSign } from 'lucide-react';

export default function EditEmployeeModal({ isOpen, employee, onClose }) {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editEmployeeSchema),
  });

  useEffect(() => {
    if (employee) {
      reset({
        name: employee.name || '',
        email: employee.email || '',
        role: employee.role || 'employee',
        department: employee.department || '',
        designation: employee.designation || '',
        phone: employee.phone || '',
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '',
        monthlySalary: employee.monthlySalary || 0,
        employmentStatus: employee.employmentStatus || 'active',
      });
    }
  }, [employee, reset]);

  const onSubmit = async (values) => {
    if (!employee?._id) return;
    setIsSubmitting(true);
    const action = await dispatch(updateEmployee({ id: employee._id, ...values }));
    setIsSubmitting(false);

    if (updateEmployee.fulfilled.match(action)) {
      toast.success('Employee record updated successfully!');
      onClose();
    } else {
      toast.error(action.payload || 'Failed to update employee');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && employee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 my-8 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-50 border border-sky-100 text-teal rounded-2xl">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Edit Employee Profile</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Updating record for {employee.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
              {/* Personal Identity Group */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/60 p-4 sm:p-5 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal" /> Personal Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm font-medium ${errors.name ? 'border-red-300' : 'border-slate-200'}`}
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm font-medium ${errors.email ? 'border-red-300' : 'border-slate-200'}`}
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      {...register('phone')}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Role & Department Group */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/60 p-4 sm:p-5 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal" /> Role & Organizational Status
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Employment Status *</label>
                    <select
                      {...register('employmentStatus')}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                    <input
                      type="text"
                      {...register('department')}
                      className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm font-medium ${errors.department ? 'border-red-300' : 'border-slate-200'}`}
                    />
                    {errors.department && <p className="text-xs text-red-600 mt-1">{errors.department.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
                    <input
                      type="text"
                      {...register('designation')}
                      className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm font-medium ${errors.designation ? 'border-red-300' : 'border-slate-200'}`}
                    />
                    {errors.designation && <p className="text-xs text-red-600 mt-1">{errors.designation.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date of Joining</label>
                    <input
                      type="date"
                      {...register('joiningDate')}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Compensation Group */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/60 p-4 sm:p-5 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <BadgeDollarSign className="w-4 h-4 text-teal" /> Compensation
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Base Salary ($) *</label>
                  <input
                    type="number"
                    {...register('monthlySalary')}
                    className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm font-medium ${errors.monthlySalary ? 'border-red-300' : 'border-slate-200'}`}
                  />
                  {errors.monthlySalary && <p className="text-xs text-red-600 mt-1">{errors.monthlySalary.message}</p>}
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
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm px-6 py-2.5 shadow-md flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    'Save Record'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
