import { createWriteStream } from "fs";
import { FileGeneratorDetails } from "./file-generator";

export async function generateTextFile(parameters: FileGeneratorDetails): Promise<void> {
    return new Promise((resolve, reject) => {
        const chunkSize = 64 * 1024;
        const chunk = 'A'.repeat(chunkSize);
        const stream = createWriteStream(parameters.fullFilePath, { flags: 'w' });

        let bytesWritten = 0;

        const writeChunks = () => {
            while (bytesWritten < parameters.sizeInBytes) {
                const remaining = parameters.sizeInBytes - bytesWritten;
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

        stream.on("close", () => resolve());
    });
}