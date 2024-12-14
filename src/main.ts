#!/usr/bin/env node

import { FileGenerator, FileGeneratorDetails, getFileGeneratorByFileType } from "./generators/file-generator";
import { getArguments } from "./utilities/cmd";
import { getParsedFileSizeInBytes, getTempFilePath, normalizeFileType } from "./utilities/file";

(async () => {
    const args = await getArguments();
    const workingDirectory = process.cwd();
    const fileSizeInBytes = getParsedFileSizeInBytes(args.size);
    const fileType = normalizeFileType(args.type);

    const generateFile: FileGenerator = getFileGeneratorByFileType(fileType);
    for (let i = 0; i < args.number; i++) {
        const parameter: FileGeneratorDetails = {
            sizeInBytes: fileSizeInBytes,
            directory: workingDirectory,
            fullFilePath: getTempFilePath(workingDirectory, fileType)
        };

        await generateFile(parameter);
    }

    console.log(`${args.number > 1 ? args.number + ' files' : '1 file'} was created`);
})();