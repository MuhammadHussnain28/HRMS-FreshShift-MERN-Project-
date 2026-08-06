import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} from '../../redux/slices/announcementsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { announcementSchema } from '../../lib/validators';
import useAuth from '../../hooks/useAuth';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Megaphone, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  Calendar, 
  User, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import boardroomImg from '@/assets/boardroom-teamwork.jpg';

export default function AnnouncementsPage() {
  const dispatch = useDispatch();
  const { list: announcements, status, error } = useSelector((state) => state.announcements);
  const { isAdmin } = useAuth();

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      message: '',
    },
  });

  useEffect(() => {
    dispatch(getAnnouncements());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    reset({ title: '', message: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setValue('title', announcement.title);
    setValue('message', announcement.message);
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    let action;
    if (editingAnnouncement) {
      action = await dispatch(updateAnnouncement({ id: editingAnnouncement._id, ...values }));
    } else {
      action = await dispatch(createAnnouncement(values));
    }
    setIsSubmitting(false);

    if (createAnnouncement.fulfilled.match(action) || updateAnnouncement.fulfilled.match(action)) {
      toast.success(editingAnnouncement ? 'Announcement updated!' : 'Announcement posted successfully!');
      setIsModalOpen(false);
      reset();
    } else {
      toast.error(action.payload || 'Failed to save announcement');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const action = await dispatch(deleteAnnouncement(deletingId));
    setIsDeleting(false);

    if (deleteAnnouncement.fulfilled.match(action)) {
      toast.success('Announcement deleted');
      setDeletingId(null);
    } else {
      toast.error(action.payload || 'Failed to delete announcement');
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Executive Newsroom Hero Artwork Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-xl text-white">
        <div className="absolute inset-0 opacity-25">
          <img src={boardroomImg} alt="Corporate Executive Teamwork" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/20 border border-teal/40 text-sky-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Corporate Newsroom
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Company Announcements</h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Stay connected with official company broadcasts, policy updates, and executive announcements from FreshShifts leadership.
            </p>
          </div>

          {isAdmin && (
            <Button
              onClick={handleOpenAdd}
              className="bg-teal hover:bg-teal-600 text-white font-extrabold rounded-2xl px-6 py-6 text-sm shadow-lg flex items-center justify-center gap-2 border border-sky-400/30 shrink-0"
            >
              <Plus className="w-5 h-5" /> Post New Announcement
            </Button>
          )}
        </div>
      </div>

      {/* Announcements Feed (Framer Motion Soft Fade-In Animation) */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal mb-3" />
            <p className="text-sm font-semibold">Loading company announcements...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 bg-white rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
            <p className="text-base font-bold">Failed to load announcements</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center">
            <Megaphone className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-800">No announcements posted yet</p>
            <p className="text-xs text-slate-400 mt-1">Check back later for company updates and news broadcasts.</p>
          </div>
        ) : (
          <AnimatePresence>
            {announcements.map((item) => (
              <motion.article
                key={item._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 bg-slate-900 text-white rounded-2xl shrink-0 shadow-xs">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{item.title}</h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600 font-bold">
                          <User className="w-3.5 h-3.5 text-teal" /> FreshShifts Leadership
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* HR Admin Action Controls with aria-labels (Section 17 Accessibility) */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        aria-label="Edit announcement"
                        title="Edit announcement"
                        className="p-2 rounded-xl text-slate-600 hover:text-teal hover:bg-slate-100 transition-colors border border-slate-200/80"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(item._id)}
                        aria-label="Delete announcement"
                        title="Delete announcement"
                        className="p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors border border-slate-200/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                  {item.message}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add / Edit Announcement Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 className="text-lg font-extrabold text-slate-900">
                  {editingAnnouncement ? 'Edit Announcement' : 'Post New Announcement'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Announcement Headline *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Town Hall & Strategy Update"
                    {...register('title')}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium ${errors.title ? 'border-red-300' : 'border-slate-200'}`}
                  />
                  {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Announcement Message Body *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Write the full announcement details..."
                    {...register('message')}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium ${errors.message ? 'border-red-300' : 'border-slate-200'}`}
                  />
                  {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="border-slate-200 text-slate-700 rounded-xl text-sm font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm px-6"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Publish Announcement'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Announcement?"
        description="Are you sure you want to delete this company announcement? This broadcast will be removed for all employees."
        confirmLabel="Delete Announcement"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
