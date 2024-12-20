import { statSync } from "fs";
import type { FileGeneratorDetails } from "../types/file-gen-details";

export async function generateImageFile(parameters: FileGeneratorDetails): Promise<void> {
    const sampleSize = 10;
    const maxDelta = 0.0006;

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

        let width = 10;
        let height = 10;
        let reuseBuffer = false;
        let tries = 0;
        let samples = [];    
        let img = new Jimp({ height: height, width: width, color: 0xff0000ff });
        let modifier = 0;
        let alter = false;

        let grow = true;
       
        while (true) {
            try {
                // upscale or crop image
                if (!reuseBuffer) {
                    img.resize({ w: width, h: height });
                    applyNoise(img);
                } else {
                    img.crop({x: 0, y: 0, w: width, h: height});
                }
                
                // Store file and grab metadata 
                await img.write(parameters.fullFilePath as any);
                const stats = statSync(parameters.fullFilePath);
                const fileSizeInBytes = stats.size;

                // Control diffs
                const sizeDiffInBytes = Math.abs(fileSizeInBytes - parameters.sizeInBytes);
                const diff = sizeDiffInBytes / parameters.sizeInBytes;
                if (diff <= maxDelta) {
                    resolve();
                    return;
                }

                // Modify image size
                const isLargerThanTargetSize = fileSizeInBytes > parameters.sizeInBytes;
                reuseBuffer = isLargerThanTargetSize;

                if (isLargerThanTargetSize) {
                    samples.push(fileSizeInBytes);
                }
                
                if (isLargerThanTargetSize) {

                    if (grow) {
                        grow = false;
                        samples = []; // reset sampling
                    }

                    // default: remove two pixels
                    let pixelsOfWidthToRemove = 2;

                    const latestSamples = samples.slice(-(sampleSize));
                    if (latestSamples.length === sampleSize) {
                        let zeroCostPixels = 0;
                        let totalBytes = 0;
                        for (let index = 1; index < latestSamples.length; index++) {
                            const cost = latestSamples[index - 1] - latestSamples[index];
                            if (cost === 0) {
                                zeroCostPixels++;
                            }
                            totalBytes += cost;
                        }

                        // Note: Should samplesSize by - 1 during the calc?
                        const avgBytesPerPixel = totalBytes / sampleSize; 
                        const numberOfPixelsNeededToBeRemoved = avgBytesPerPixel > 0 ? Math.floor((sizeDiffInBytes / avgBytesPerPixel) * 0.6) : 1;
                        pixelsOfWidthToRemove = numberOfPixelsNeededToBeRemoved;
                        console.log('Shrink', { diff, width, height, tries });
                    } else {
                        console.log('Shrink - sampling');
                    }
                    
                    if (alter) {
                        width -= pixelsOfWidthToRemove;
                    } else {
                        height -= pixelsOfWidthToRemove;
                    }
                    alter = !alter;
                } else {
                    grow = true;
                    console.log('Grow', { diff, width, height, tries });
                    modifier = isLargerThanTargetSize ? 0.9 : 1.2;
                    width = Math.floor(width * modifier);   
                    height = Math.floor(height * modifier);
                }

                tries++;
            } catch (error) {
                console.error('Error while generating bitmap');
                reject();
                return;
            }
        }
    });
}