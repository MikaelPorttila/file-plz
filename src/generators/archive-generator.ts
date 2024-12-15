import { createWriteStream, unlinkSync } from "fs";
import { getTempFilePath } from "../utilities/file";
import { generateTextFile } from "./text-generator";
import type { FileGeneratorDetails } from "../types/file-gen-details";

export async function generateArchive(parameters: FileGeneratorDetails): Promise<void> {
    const archiver = await import('archiver'); 
    const stream = createWriteStream(parameters.fullFilePath, { flags: 'w' });
    const archive = archiver.default(parameters.format as any, { zlib: { level: 0 } });

    archive.on('error', function(err) {
        console.error('archiver error', err);
        throw err;
    });

    const tempFile = getTempFilePath(parameters.directory, 'txt');
    await generateTextFile({
        directory: parameters.directory,
        fullFilePath: tempFile,
        sizeInBytes: parameters.sizeInBytes - 1024, /* 1 KB of archive header data */
        format: 'txt'
    });
    
    archive.pipe(stream);
    archive.file(tempFile, { name: 'random_content.txt' });
    await archive.finalize();

    unlinkSync(tempFile);
}