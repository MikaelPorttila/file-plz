#!/usr/bin/env node

import type { FileGenerator, FileGeneratorDetails } from "./types/file-gen-details";
import { getFileGeneratorByFormat } from "./generators/file-generator";
import { getArguments } from "./utilities/cmd";
import { getParsedFileSizeInBytes, getTempFilePath, normalizeFormat } from "./utilities/file";
import { copyFile } from "fs/promises";

(async () => {
    const mainTimer = 'main timer';
    console.time(mainTimer);
    const args = await getArguments();
    const workingDirectory = process.cwd();
    const fileSizeInBytes = getParsedFileSizeInBytes(args.size);
    const format = normalizeFormat(args.type);

    const generateFile: FileGenerator = getFileGeneratorByFormat(format);
    const filePath = getTempFilePath(workingDirectory, format);
    await generateFile({
        sizeInBytes: fileSizeInBytes,
        directory: workingDirectory,
        fullFilePath: filePath,
        format: format
    });

    for (let i = 1; i < args.number; i++) { 
        await copyFile(filePath, getTempFilePath(workingDirectory, format));
    }

    console.timeEnd(mainTimer);
    console.log(`${args.number > 1 ? args.number + ' files' : '1 file'} was created`);
})();