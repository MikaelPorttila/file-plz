import { randomUUID } from "crypto";
import { join } from "path";
import { B, GB, KB, MB } from "../const/file-sizes";

export function getParsedFileSizeInBytes(sizeStr: string): number {
    const units: Record<string, number> = {
        'B': B,
        'KB': KB,
        'MB': MB,
        'GB': GB
    };

    const match = sizeStr.match(/^(\d+)([KMGT]?B)?$/i);
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
