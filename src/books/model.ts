export interface Content {
    title: string;
    file: string;
    isPreview?: boolean;
    isNumbered?: boolean;
}

export interface Chapter extends Content {
    sections?: Content[]
}

export interface BookMeta {
    title: string;
    contentDir: string;
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

export interface Book extends BookMeta {
    id: string;
}
