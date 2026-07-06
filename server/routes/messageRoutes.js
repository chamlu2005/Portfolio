import express from 'express';
import { submitMessage, getMessages, toggleBookmark, updateRating, deleteMessage } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', submitMessage);
router.get('/', verifyToken, getMessages);
router.put('/:id/bookmark', verifyToken, toggleBookmark);
router.put('/:id/rating', verifyToken, updateRating);
router.delete('/:id', verifyToken, deleteMessage);

export default router;
