#!/usr/bin/env node

import type { FileGenerator } from "./types/file-gen-details";
import { getFileGeneratorByFormat } from "./gen/file-gen";
import { getArguments } from "./utilities/cmd";
import { getParsedFileSizeInBytes, getTempFilePath, normalizeFormat } from "./utilities/file";
import { copyFile } from "fs/promises";

(async () => {
    const args = await getArguments();
    const mainTimer = `${args.number > 1 ? args.number + ' files' : '1 file'} was created in`;
    console.time(mainTimer);
    const workingDirectory = process.cwd();
    const fileSizeInBytes = getParsedFileSizeInBytes(args.size);
    const format = normalizeFormat(args.type);

    const generateFile: FileGenerator = getFileGeneratorByFormat(format);
    const filePath = getTempFilePath(workingDirectory, format);
    await generateFile({
        sizeInBytes: fileSizeInBytes,
        directory: workingDirectory,
        fullFilePath: filePath,
        format: format,
        debug: args.debug
    });

    for (let i = 1; i < args.number; i++) { 
        await copyFile(filePath, getTempFilePath(workingDirectory, format));
    }

    console.timeEnd(mainTimer);
})();