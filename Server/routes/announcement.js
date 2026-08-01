import express from 'express';
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import verifyToken from '../middlewares/verifyToken.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { announcementSchema } from '../validators/announcementValidators.js';

const router = express.Router();

router.use(verifyToken);

router.route('/')
  .post(authorize('hr_admin'), validate(announcementSchema), createAnnouncement)
  .get(getAnnouncements);

router.route('/:id')
  .put(authorize('hr_admin'), validate(announcementSchema), updateAnnouncement)
  .delete(authorize('hr_admin'), deleteAnnouncement);

export default router;
