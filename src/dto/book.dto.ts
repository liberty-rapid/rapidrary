import { Chapter } from "../books/model";

export interface GetBookFileRequest {
    userId: string;
    bookId: string;
    file: string;
}

export interface GetBookResponse {
    id: string;
    title: string;
    description: string;
    tags: string[];
    language: string;
    coverImage?: string;
    price: number;
    currency: string;
    index: (string | Chapter)[];
    hidden?: boolean;
    pinned?: boolean;
}
