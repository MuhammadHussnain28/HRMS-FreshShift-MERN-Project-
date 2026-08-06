import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllLeaves, decideLeave } from '../../redux/slices/leaveSlice';
import { motion, AnimatePresence } from 'framer-motion';
import AiRecommendationBadge from '../../components/shared/AiRecommendationBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  User, 
  Building2, 
  Clock, 
  FileText, 
  Loader2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function AdminLeavesPage() {
  const dispatch = useDispatch();
  const { allLeaves, status, error } = useSelector((state) => state.leave);

  const [activeTab, setActiveTab] = useState('pending');
  const [decidingId, setDecidingId] = useState(null);

  useEffect(() => {
    dispatch(getAllLeaves(activeTab));
  }, [dispatch, activeTab]);

  const handleDecision = async (id, decision) => {
    setDecidingId(id);
    const action = await dispatch(decideLeave({ id, decision }));
    setDecidingId(null);

    if (decideLeave.fulfilled.match(action)) {
      toast.success(`Leave request ${decision} successfully!`);
    } else {
      toast.error(action.payload || `Failed to ${decision} leave request`);
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal/10 border border-teal/20 text-teal rounded-2xl">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leave Approvals & AI Insights</h1>
            <p className="text-xs text-slate-500 mt-0.5">Review requests with Smart AI Assistant recommendations</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
          {['pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Tab Content: Cards with Framer Motion Exit Animation */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
              Pending Leave Requests ({allLeaves.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal mb-3" />
              <p className="text-sm font-semibold">Fetching pending leave requests...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 bg-white rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
              <p className="text-base font-bold">Failed to load requests</p>
              <p className="text-xs text-red-500 mt-1">{error}</p>
            </div>
          ) : allLeaves.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
              <p className="text-base font-bold text-slate-800">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">There are no pending leave requests awaiting review.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {allLeaves.map((leave) => {
                const emp = leave.employee || {};
                const isDecidingThis = decidingId === leave._id;

                return (
                  <motion.div
                    key={leave._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                      {/* Left: Employee Info & Dates */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {emp.name ? emp.name.slice(0, 2).toUpperCase() : 'EM'}
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-slate-900 leading-tight">{emp.name || 'Unknown Employee'}</h4>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" /> {emp.department || 'Staff'} • <span className="font-mono text-slate-600">{emp.email}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                          <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-lg uppercase text-[10px] font-bold tracking-wider capitalize">
                            {leave.leaveType} Leave
                          </span>
                          <span>
                            {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                          </span>
                          <span className="text-teal font-extrabold">({leave.numberOfDays} day(s))</span>
                        </div>

                        <div className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                          <strong className="font-bold text-slate-800">Reason:</strong> {leave.reason}
                        </div>
                      </div>

                      {/* Right: AI Recommendation & Decision Buttons */}
                      <div className="w-full lg:w-80 space-y-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex flex-col justify-between">
                        {/* AI Recommendation Badge + Reasoning */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-teal" /> AI Decision Support
                            </span>
                          </div>
                          <AiRecommendationBadge 
                            aiRecommendation={leave.aiRecommendation} 
                            showReasoning={true} 
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => handleDecision(leave._id, 'approved')}
                            disabled={isDecidingThis}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl py-2.5 shadow-sm flex items-center justify-center gap-1.5"
                          >
                            {isDecidingThis ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" /> Approve
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={() => handleDecision(leave._id, 'rejected')}
                            disabled={isDecidingThis}
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-extrabold text-xs rounded-xl py-2.5 flex items-center justify-center gap-1.5"
                          >
                            {isDecidingThis ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" /> Reject
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Approved / Rejected Tabs View (Data Table) */}
      {activeTab !== 'pending' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 capitalize">
              {activeTab} Leave Requests Log
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
              Count: {allLeaves.length}
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal mb-3" />
              <p className="text-sm font-semibold">Loading records...</p>
            </div>
          ) : allLeaves.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
              <CalendarDays className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-base font-bold text-slate-800">No {activeTab} leave requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Employee</th>
                    <th className="py-3.5 px-6">Leave Category</th>
                    <th className="py-3.5 px-6">Dates</th>
                    <th className="py-3.5 px-6">AI Insight</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {allLeaves.map((leave) => {
                    const emp = leave.employee || {};
                    return (
                      <tr key={leave._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {emp.name ? emp.name.slice(0, 2).toUpperCase() : 'EM'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">{emp.name || 'Unknown Employee'}</p>
                              <p className="text-xs text-slate-500 font-mono">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 capitalize">
                          {leave.leaveType}
                        </td>
                        <td className="py-4 px-6 text-slate-700 font-mono text-xs">
                          {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()} ({leave.numberOfDays}d)
                        </td>
                        <td className="py-4 px-6">
                          <AiRecommendationBadge aiRecommendation={leave.aiRecommendation} />
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={leave.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
