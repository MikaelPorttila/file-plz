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

export function normalizeFormat(format: string): string {
    return format.startsWith('.')
        ? format.substring(1).toLocaleLowerCase()
        : format.toLocaleLowerCase();
}

export function getTempFileName(format: string): string {
    const fileName = `${randomUUID().replaceAll('-', '')}.${format}`;
    return fileName;
}

export function getTempFilePath(dir: string, format: string): string {
    const filePath = join(dir, getTempFileName(format));
    return filePath;
}
