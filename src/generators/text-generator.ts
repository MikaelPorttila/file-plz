import { createWriteStream } from "fs";
import type { FileGeneratorDetails } from "../types/file-gen-details";

export async function generateTextFile(parameters: FileGeneratorDetails): Promise<void> {
    return new Promise((resolve, reject) => {
        const chunkSize = 64 * 1024;
        const chunk = Buffer.alloc(chunkSize, 'A');
        const stream = createWriteStream(parameters.fullFilePath, { flags: 'w' });
        stream.on('error', () => reject());
        stream.on("close", () => resolve());

        let bytesWritten = 0;

        const writeChunks = () => {
            while (bytesWritten < parameters.sizeInBytes) {
                const remaining = parameters.sizeInBytes - bytesWritten;
                const sizeToWrite = Math.min(remaining, chunkSize);
                const canContinue = stream.write(chunk.subarray(0, sizeToWrite));
                bytesWritten += sizeToWrite;

                if (!canContinue) {
                    stream.once('drain', writeChunks);
                    return;
                }
            }

            stream.end();
        }

        writeChunks();
    });
}