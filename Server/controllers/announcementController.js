import Announcement from '../models/Announcement.js';
import AuditLog from '../models/AuditLog.js';
import { sendSuccess, sendError } from '../utils/response.js';

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (HR Admin)
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user.id,
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'ANNOUNCEMENT_CREATED',
      targetType: 'Announcement',
      targetId: announcement._id,
      details: { title: announcement.title },
    });

    return sendSuccess(res, announcement, 'Announcement created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (Authenticated)
export const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email department')
      .sort({ createdAt: -1 });
    return sendSuccess(res, announcements, 'Announcements retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (HR Admin)
export const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, message } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return sendError(res, 'Announcement not found', null, 404);
    }

    const previousData = { title: announcement.title, message: announcement.message };

    if (title) announcement.title = title;
    if (message) announcement.message = message;

    await announcement.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'ANNOUNCEMENT_UPDATED',
      targetType: 'Announcement',
      targetId: announcement._id,
      details: { from: previousData, to: { title, message } },
    });

    return sendSuccess(res, announcement, 'Announcement updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR Admin)
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return sendError(res, 'Announcement not found', null, 404);
    }

    await announcement.deleteOne();

    await AuditLog.create({
      user: req.user.id,
      action: 'ANNOUNCEMENT_DELETED',
      targetType: 'Announcement',
      targetId: announcement._id,
      details: { title: announcement.title },
    });

    return sendSuccess(res, null, 'Announcement deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};
