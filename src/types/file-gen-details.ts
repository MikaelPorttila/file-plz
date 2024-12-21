export type FileGeneratorDetails = {
    fullFilePath: string;
    directory: string;
    sizeInBytes: number;
    format: string;
    debug?: boolean;
}

export type FileGenerator = (parameters: FileGeneratorDetails) => Promise<void>;