#!/usr/bin/env node

import { getArguments } from "./utilities/cmd";
import { FileGenerator, getFileGeneratorByFileType, getParsedFileSizeInBytes } from "./utilities/file";
import { randomUUID } from 'crypto';
import { join } from 'path';

(async () => {
    const args = await getArguments();
    const workingDirectory = process.cwd();
    const fileSizeInBytes = getParsedFileSizeInBytes(args.size);
    const fileType = (args.type.startsWith('.') ? args.type : '.' + args.type).toLocaleLowerCase();

    const generator: FileGenerator = getFileGeneratorByFileType(fileType);
    for (let i = 0; i < args.number; i++) {
        const filePath = join(workingDirectory, `${randomUUID().replaceAll('-', '')}${fileType}`);
        generator(filePath, fileSizeInBytes);
    }

    console.log(`${args.number > 1 ? args.number + ' files' : '1 file'} was created`);
})();