export type FileGeneratorDetails = {
    fullFilePath: string;
    directory: string;
    sizeInBytes: number;
    format: string;
}

export type FileGenerator = (parameters: FileGeneratorDetails) => Promise<void>;