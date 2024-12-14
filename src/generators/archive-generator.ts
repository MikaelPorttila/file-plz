import { createWriteStream, unlinkSync } from "fs";
import archiver from 'archiver';
import { FileGeneratorDetails } from "./file-generator";
import { getTempFilePath } from "../utilities/file";
import { generateTextFile } from "./text-generator";

export async function generateArchive(parameters: FileGeneratorDetails): Promise<void> {
    const stream = createWriteStream(parameters.fullFilePath, { flags: 'w' });
    const archive = archiver('zip', { zlib: { level: 0 } });

    archive.on('error', function(err) {
        console.error('archiver error', err);
        throw err;
    });

    const tempFile = getTempFilePath(parameters.directory, '.txt');
    await generateTextFile({
        directory: parameters.directory,
        fullFilePath: tempFile,
        sizeInBytes: parameters.sizeInBytes - (1024 * 10)
    });
    
    archive.pipe(stream);
    archive.file(tempFile, { name: 'random_content.txt' });
    await archive.finalize();

    unlinkSync(tempFile);
}