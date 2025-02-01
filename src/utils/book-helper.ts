import { Book, Content } from "../books/model";
import { GetBookResponse } from "../dto/book.dto";

export function getNextContent(book: Book | GetBookResponse, currentFile?: string, previewOnly?: boolean): Content | null {
    let available = currentFile ? false : true;

    for (const content of book.index) {
        if (typeof content === 'string') {
            continue;
        }

        if (currentFile === content.file) {
            available = true;
        } else if (available && (!previewOnly || content.isPreview)) {
            return content;
        }

        if (content.sections) {
            for (const section of content.sections) {
                if (currentFile === section.file) {
                    available = true;
                } else if (available && (!previewOnly || section.isPreview)) {
                    return section;
                }
            }
        }
    }

    return null;
}

export function getContentByFile(book: Book | GetBookResponse, file: string): Content | null {
    for (const content of book.index) {
        if (typeof content === 'string') {
            continue;
        }

        if (content.file === file) {
            return content;
        }

        if (content.sections) {
            for (const section of content.sections) {
                if (section.file === file) {
                    return section;
                }
            }
        }
    }

    return null;
}
