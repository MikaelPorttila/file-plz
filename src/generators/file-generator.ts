import { generateArchive } from "./archive-generator";
import { generateTextFile } from "./text-generator";

export type FileGeneratorDetails = {
    fullFilePath: string;
    directory: string;
    sizeInBytes: number;
}

export type FileGenerator = (parameters: FileGeneratorDetails) => Promise<void>;

export function getFileGeneratorByFileType(fileType: string): FileGenerator {
    switch (fileType) {
        case '.txt':
            return generateTextFile;
        case '.rar':
        case '.zip':
            return generateArchive;
        default:
            throw new Error("File type is not supported");
    }
}