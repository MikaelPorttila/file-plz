import { statSync } from "fs";
import type { FileGeneratorDetails } from "../types/file-gen-details";

export async function generateImageFile(parameters: FileGeneratorDetails): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const { Jimp, rgbaToInt } = await import('jimp');
        const applyNoise = (image: any): void => {
            const width = image.bitmap.width;
            const height = image.bitmap.height;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const noiseIntensity = Math.random() * 100;
                    const r = Math.floor(Math.random() * noiseIntensity);
                    const g = Math.floor(Math.random() * noiseIntensity);
                    const b = Math.floor(Math.random() * noiseIntensity);

                    const color = rgbaToInt(r, g, b, 255);
                    image.setPixelColor(color, x, y);
                }
            }
        }

        let width = 100;
        let height = 100;

        let mb = 1024 * 1024;

        // Skips: 100MB, 10MB, 1MB 
        if (parameters.sizeInBytes >= (mb * 100)) {
            width = 5640;
            height = 5640;
        }
        else if (parameters.sizeInBytes >= (mb * 10)) {
            width = 1800;
            height = 1800;
        }
        else if (parameters.sizeInBytes >= mb) {
            width = 864;
            height = 864;
        } 

        let img = null;
        const maxDelta = 0.2;

        while (true) {
            try {
                if (!img) {
                    img = new Jimp({ height, width, color: 0xff0000ff });
                } else {
                    img.resize({ w: width, h: height });
                }

                applyNoise(img);
                
                await img.write(parameters.fullFilePath as any);
                const stats = statSync(parameters.fullFilePath);
                const fileSizeInBytes = stats.size;

                const diff = Math.abs(fileSizeInBytes - parameters.sizeInBytes) / parameters.sizeInBytes;
                if (diff <= maxDelta) {
                    resolve();
                    return;
                }

                if (fileSizeInBytes > parameters.sizeInBytes) {
                    const modifier = 0.9;
                    width = Math.floor(width * modifier);
                    height = Math.floor(height * modifier);
                } else {
                    const modifier = 1.1;
                    width = Math.floor(width * modifier);
                    height = Math.floor(height * modifier);
                }
            } catch (error) {
                console.error('Error while generating bitmap');
                reject();
                return;
            }
        }
    });
}