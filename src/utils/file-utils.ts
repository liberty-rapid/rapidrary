import path from 'path';
import fs from 'fs/promises';

export async function fileExists(filePath: string): Promise<boolean> {
    try {
        const stat = await fs.stat(filePath);
        return stat.isFile();
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return false;
        } else {
            throw error;
        }
    }
}

export function isPathInside(childPath: string, parentPath: string): boolean {
    const resolvedChild = path.resolve(childPath);
    const resolvedParent = path.resolve(parentPath);
  
    const relative = path.relative(resolvedParent, resolvedChild);
  
    return !relative.startsWith('..') && !path.isAbsolute(relative);
}
