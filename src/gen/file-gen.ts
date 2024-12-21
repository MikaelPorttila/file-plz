import type { FileGenerator } from "../types/file-gen-details";
import { generateArchive } from "./archive-gen";
import { generateImageFile } from "./img-gen";
/* import { generatePdfFile } from "./pdf-generator"; */
import { generateTextFile } from "./text-gen";

export function getFileGeneratorByFormat(format: string): FileGenerator {
    switch (format) {
        case 'txt':
            return generateTextFile;
        /* case 'pdf':
            return generatePdfFile; */
        case 'tar':
        case 'zip':
            return generateArchive;
        case 'png':
        case 'jpeg':
        case 'jpg':
        case 'bmp':
            return generateImageFile;
        default:
            throw new Error(`Format "${format}" is not supported`);
    }
}