import type { FileGenerator } from "../types/file-gen-details";
import { generateArchive } from "./archive-generator";
/* import { generatePdfFile } from "./pdf-generator"; */
import { generateTextFile } from "./text-generator";

export function getFileGeneratorByFormat(format: string): FileGenerator {
    switch (format) {
        case 'txt':
            return generateTextFile;
        /* case 'pdf':
            return generatePdfFile; */
        case 'tar':
        case 'zip':
            return generateArchive;
        default:
            throw new Error(`Format "${format}" is not supported`);
    }
}