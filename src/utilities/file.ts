import { createWriteStream } from 'fs';

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

export function generateTextFile(filePath: string, sizeInBytes: number): void {
    const chunkSize = 64 * 1024;
    const chunk = 'A'.repeat(chunkSize);
    const stream = createWriteStream(filePath, { flags: 'w' });

    let bytesWritten = 0;

    const writeChunks = () => {
        while (bytesWritten < sizeInBytes) {
            const remaining = sizeInBytes - bytesWritten;
            const sizeToWrite = Math.min(remaining, chunkSize);
            const canContinue = stream.write(chunk.slice(0, sizeToWrite));
            bytesWritten += sizeToWrite;

            if (!canContinue) {
                stream.once('drain', writeChunks);
                return;
            }
        }

        stream.end();
    }

    writeChunks();
}

export type FileGenerator = (path: string, sizeInBytes: number) => void;
export function getFileGeneratorByFileType(fileType: string): FileGenerator {
    let generator: FileGenerator;

    switch (fileType) {
        case '.txt':
            generator = generateTextFile;
            break;
        default:
            throw new Error("File type is not supported");
    }

    return generator;
}