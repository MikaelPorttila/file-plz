import { randomUUID } from "crypto";
import { join } from "path";

export function getParsedFileSizeInBytes(sizeStr: string): number {
    const units: Record<string, number> = {
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024
    };

    const match = sizeStr.match(/^(\d+)([KMGT]B)?$/i);
    if (!match) {
        throw new Error('Invalid size format. Use format like 10KB, 5MB');
    }

    const value = parseFloat(match[1]);
    const unit = (match[2] || 'B').toLocaleUpperCase();
    return value * (units[unit] || 1);
};

export function normalizeFileType(fileType: string): string {
    if (fileType.startsWith('.')) {
        return fileType.toLocaleLowerCase();
    }

    return '.' + fileType.toLocaleLowerCase();
}

export function getTempFileName(fileType: string): string {
    const fileName = `${randomUUID().replaceAll('-', '')}${fileType}`;
    return fileName;
}

export function getTempFilePath(dir: string, fileType: string): string {
    const filePath = join(dir, getTempFileName(fileType));
    return filePath;
}
