import path from 'path';
import yaml from 'js-yaml';
import fs from 'fs/promises';

import config from '../config';
import { fileExists } from '../utils/file-utils';
import { Book, BookMeta } from './model';
import { validateBookMeta } from './validate';

export async function readBooks(): Promise<Book[]> {
    const entries = await fs.readdir(config.books.directory, { withFileTypes: true });

    const bookDirectories = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

    const books: Book[] = [];

    for (const bookId of bookDirectories) {
        const bookMetaPath = path.join(config.books.directory, bookId, 'book.yml');
        const bookMetaExists = await fileExists(bookMetaPath);

        if (!bookMetaExists) {
            continue;
        }

        const bookMetaYml = (await fs.readFile(bookMetaPath, 'utf-8')).toString();

        try {
            const bookMeta = yaml.load(bookMetaYml);

            const result = validateBookMeta(bookMeta)

            if (result.error) {
                continue;
            }

            books.push({
                id: bookId,
                ...result.value as BookMeta
            });
        } catch (e) {
            continue;
        }
    }

    return books;
}
