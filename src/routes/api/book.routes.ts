import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import bookController from '../../controllers/api/book.controller';

const router = Router();

router.get('/books', asyncHandler(bookController.getBooks));
router.get('/books/:bookId', asyncHandler(bookController.getBook));
router.get('/books/:bookId/*', asyncHandler(bookController.getBookFile));

export default router;
