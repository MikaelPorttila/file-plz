#!/usr/bin/env node

import type { FileGenerator, FileGeneratorDetails } from "./types/file-gen-details";
import { getFileGeneratorByFormat } from "./generators/file-generator";
import { getArguments } from "./utilities/cmd";
import { getParsedFileSizeInBytes, getTempFilePath, normalizeFormat } from "./utilities/file";

(async () => {
    const args = await getArguments();
    const workingDirectory = process.cwd();
    const fileSizeInBytes = getParsedFileSizeInBytes(args.size);
    const format = normalizeFormat(args.type);

    const generateFile: FileGenerator = getFileGeneratorByFormat(format);
    for (let i = 0; i < args.number; i++) {
        const parameter: FileGeneratorDetails = {
            sizeInBytes: fileSizeInBytes,
            directory: workingDirectory,
            fullFilePath: getTempFilePath(workingDirectory, format),
            format: format
        };

        await generateFile(parameter);
    }

    console.log(`${args.number > 1 ? args.number + ' files' : '1 file'} was created`);
})();