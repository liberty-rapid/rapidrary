import { Request, Response } from "express";

import bookService from '../../services/book.service';

export class BookController {
    public getBooks = async (req: Request, res: Response): Promise<void> => {
        const books = await bookService.getBooks();

        res.json(books);
    }

    public getBook = async (req: Request, res: Response): Promise<void> => {
        const { bookId } = req.params;

        const book = await bookService.getBook(bookId);

        res.json(book);
    }

    public getBookFile = async (req: any, res: Response): Promise<void> => {
        const userId = req.session.userId;
        const bookId = req.params.bookId;
        const file = req.params[0];

        const filePath = await bookService.getBookFile({
            userId: userId ?? -1,
            bookId,
            file
        });

        res.sendFile(filePath);        
    }
}

const bookController = new BookController();

export default bookController;
