import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployees, deactivateEmployee } from '../../redux/slices/employeesSlice';
import { Button } from '@/components/ui/button';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import AddEmployeeModal from './AddEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import { toast } from 'sonner';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  UserX, 
  Building2, 
  Briefcase, 
  Mail, 
  Loader2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function EmployeesListPage() {
  const dispatch = useDispatch();
  const { list: employees, status, error } = useSelector((state) => state.employees);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    dispatch(getEmployees());
  }, [dispatch]);

  const handleDeactivate = async () => {
    if (!deactivatingEmployee?._id) return;
    setIsDeactivating(true);
    const action = await dispatch(deactivateEmployee(deactivatingEmployee._id));
    setIsDeactivating(false);

    if (deactivateEmployee.fulfilled.match(action)) {
      toast.success(`${deactivatingEmployee.name} has been deactivated.`);
      setDeactivatingEmployee(null);
    } else {
      toast.error(action.payload || 'Failed to deactivate employee');
    }
  };

  // Filtering Logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesQuery = 
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      selectedStatus === 'all' ? true : (emp.employmentStatus || 'active').toLowerCase() === selectedStatus;

    return matchesQuery && matchesStatus;
  });

  const isLoading = status === 'loading';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal/10 border border-teal/20 text-teal rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Employee Directory</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage organization accounts, onboarding, and profiles</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm px-5 py-2.5 shadow-md flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Onboard New Employee
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, department, or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto overflow-x-auto">
          {['all', 'active', 'inactive', 'terminated'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                selectedStatus === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal mb-3" />
            <p className="text-sm font-semibold">Loading employee directory...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
            <p className="text-base font-bold">Failed to load directory</p>
            <p className="text-xs text-red-500 mt-1 max-w-md">{error}</p>
            <Button
              onClick={() => dispatch(getEmployees())}
              variant="outline"
              className="mt-4 border-red-200 text-red-700 hover:bg-red-50 rounded-xl text-xs flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
            </Button>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Users className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-800">No employees found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Get started by onboarding your first team member.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Employee Details</th>
                  <th className="py-3.5 px-6">Role & Department</th>
                  <th className="py-3.5 px-6">Compensation</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Name & Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {emp.name ? emp.name.slice(0, 2).toUpperCase() : 'EM'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{emp.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role, Designation & Department */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            emp.role === 'hr_admin' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-sky-50 text-teal border border-sky-200'
                          }`}>
                            {emp.role === 'hr_admin' ? 'HR Admin' : 'Employee'}
                          </span>
                          <span className="text-xs font-semibold text-slate-800">{emp.designation || 'Staff'}</span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" /> {emp.department || 'Unassigned'}
                        </p>
                      </div>
                    </td>

                    {/* Compensation */}
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {emp.monthlySalary ? `$${emp.monthlySalary.toLocaleString()} / mo` : '—'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <StatusBadge status={emp.employmentStatus} />
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEmployee(emp)}
                          className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs px-3 py-1.5 flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </Button>

                        {emp.employmentStatus !== 'terminated' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeactivatingEmployee(emp)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl text-xs px-3 py-1.5 flex items-center gap-1.5"
                          >
                            <UserX className="w-3.5 h-3.5" /> Deactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={!!editingEmployee}
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
      />

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deactivatingEmployee}
        title="Deactivate Employee Account?"
        description={`Are you sure you want to deactivate ${deactivatingEmployee?.name}? They will immediately lose access to the FreshShifts system and will be unable to log in.`}
        confirmLabel="Deactivate Account"
        isDanger={true}
        isLoading={isDeactivating}
        onConfirm={handleDeactivate}
        onClose={() => setDeactivatingEmployee(null)}
      />
    </div>
  );
}
