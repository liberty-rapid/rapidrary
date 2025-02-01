import path from 'path';

import prisma from '../clients/prisma';

import config from '../config';

import { ServiceError } from '../error/service-error';
import { errorConstants } from '../error/error-constants';
import { fileExists, isPathInside } from '../utils/file-utils';
import { getContentByFile } from '../utils/book-helper';
import { Book } from '../books/model';
import { readBooks } from '../books/books-repository';

import { GetBookFileRequest, GetBookResponse } from '../dto/book.dto';

class BookService {
    public getBooks = async (): Promise<GetBookResponse[]> => {
        const books = await readBooks();

        return books.map(book => {
            const { contentDir, ...dto } = book;
            return dto as GetBookResponse;
        });
    }

    private getBookInternal = async (bookId: string): Promise<Book> => {
        const books = await readBooks();

        const filteredBooks = books.filter(book => book.id === bookId);

        if (filteredBooks.length === 0) {
            throw new ServiceError(errorConstants.BOOK_NOT_FOUND);
        }

        return filteredBooks[0];
    }    

    public getBook = async (bookId: string): Promise<GetBookResponse> => {
        const book = await this.getBookInternal(bookId);

        const { contentDir, ...dto } = book;
        return dto as GetBookResponse;
    }

    public getBookFile = async (request: GetBookFileRequest): Promise<string> => {
        const { userId, bookId, file } = request;

        const book = await this.getBookInternal(bookId);

        const contentPath = path.resolve(config.books.directory, bookId, book.contentDir);
        const filePath = path.join(contentPath, file);

        if (!isPathInside(filePath, contentPath)) {
            throw new ServiceError(errorConstants.BOOK_FILE_NOT_FOUND);
        }

        if (path.basename(filePath).startsWith('.')) {
            throw new ServiceError(errorConstants.BOOK_FILE_NOT_FOUND);
        }

        const content = getContentByFile(book, file);
    
        if (!(await fileExists(filePath))) {
            throw new ServiceError(errorConstants.BOOK_FILE_NOT_FOUND);
        }

        const isPrivateFile = content && !content.isPreview;

        if (book.price !== 0 && isPrivateFile) {
            const user = await prisma.user.findFirst({
                where: {
                    id: userId
                },
                include: {
                    books: true
                }
            });

            if (user === null || !user.books.some(b => b.bookId === bookId)) {
                throw new ServiceError(errorConstants.COMMON_FORBIDDEN);
            }
        }

        return filePath;
    }
}

const bookService = new BookService();

export default bookService;
