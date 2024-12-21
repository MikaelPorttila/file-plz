import { statSync } from "fs";
import type { FileGeneratorDetails } from "../types/file-gen-details";
import { getAvgFactorForTargetSize } from "../utilities/sampling";
import { CircleBuffer } from "../utilities/circle-buffer";
import { KB } from "../const/file-sizes";

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

        let height = 100;
        let width = height * 4; 
        let crop = false;
        let tries = 0;
        let sampler = new CircleBuffer<number>(10);
        let img = new Jimp({ height: height, width: width, color: 0xff0000ff });
        let grow = true;

        let maxDelta = 0.0006;
        if (parameters.sizeInBytes >= KB) {
            maxDelta = 0.00008;
        }

        while (true) {
            try {
                // Upscale or crop image
                if (crop) {
                    img.crop({ x: 0, y: 0, w: width, h: height });
                } else {
                    img.resize({ w: width, h: height });
                    // TODO: Opti - instead of resize, change bitmap size, keep old noise and draw new noise on empty areas.
                    applyNoise(img);
                }

                // Store file and get file size.
                await img.write(parameters.fullFilePath as any);
                const stats = statSync(parameters.fullFilePath);
                const fileSizeInBytes = stats.size;
                // TODO: Remove file header bytes during calc

                // Check how long the file size is from the target size.
                const sizeDiffInBytes = Math.abs(fileSizeInBytes - parameters.sizeInBytes);
                const diff = sizeDiffInBytes / parameters.sizeInBytes;
                if (diff <= maxDelta) {
                    if (parameters.debug) {
                        console.log('Completed', { diff, maxDelta, width, height, tries });
                    }
                    resolve();
                    return;
                }

                // Figure out how the canvas must be cropped or enlarged to hit the target file size.
                crop = fileSizeInBytes > parameters.sizeInBytes;
                if (crop) {
                    if (grow) {
                        // Reset sampling
                        grow = false;
                        sampler.reset();
                    } else {
                        sampler.add(fileSizeInBytes);
                    }

                    let pixelsToRemove = 2;
                    if (sampler.isFilled()) {
                        pixelsToRemove = getAvgFactorForTargetSize(sampler.get(), sizeDiffInBytes);
                        if (parameters.debug) {
                            console.log('Shrink', { diff, maxDelta, width, height, tries });
                        }
                    } else {
                        if (parameters.debug) {
                            console.log('Shrink - sampling', { diff, maxDelta, width, height, tries });
                        }
                    }

                    // Crop from the side which impact the least number of pixels to prevent major size jumps.
                    if (width > height) {
                        width -= pixelsToRemove;
                    } else {
                        height -= pixelsToRemove;
                    }
                } else {
                    grow = true;
                    const factor = parameters.sizeInBytes / fileSizeInBytes;
                    const dimensionScaleFactor = Math.sqrt(factor);
                    if (parameters.debug) {
                        console.log('Grow', { diff, maxDelta, width, height, tries, dimensionScaleFactor });
                    }

                    width = Math.max(width + 1, Math.floor(width * dimensionScaleFactor));
                    height = Math.max(height + 1, Math.floor(height * dimensionScaleFactor));
                }

                tries++;
            } catch (error) {
                console.error('Error while generating img');
                reject();
                return;
            }
        }
    });
}