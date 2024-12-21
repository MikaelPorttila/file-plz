import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export function getArguments() {
    const argv = yargs(hideBin(process.argv))
        .usage('Usage: file-plz <command> [options]')
        .option('type', {
            alias: 't',
            type: 'string',
            describe: 'Type of file to generate',
            demandOption: true
        })
        .option('size', {
            alias: 's',
            type: 'string',
            describe: 'Size of the file (e.g., 10KB, 5MB)',
            demandOption: true,
        })
        .option('number', {
            alias: 'n',
            type: 'number',
            describe: 'Number of files to generate',
            default: 1
        })
        .option('filename', {
            alias: 'f',
            type: 'string',
            describe: 'Custom filename (optional)'
        })
        .option('debug', {
            alias: 'd',
            type: 'boolean',
            describe: 'Output debug info (optional)',
            default: false,
            boolean: true
        })
        .help('h')
        .alias('h', 'help')
        .argv;

    return argv;
}

