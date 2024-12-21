import { statSync } from "fs";
import type { FileGeneratorDetails } from "../types/file-gen-details";
import { getAvgFactorForTargetSize } from "../utilities/sampling";
import { CircleBuffer } from "../utilities/circle-buffer";
import { KB, MB } from "../const/file-sizes";

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
        let width = height * 20;
        let crop = false;
        let tries = 0;
        let sampler = new CircleBuffer<number>(5);
        let img = new Jimp({ height: height, width: width, color: 0xff0000ff });
        let grow = true;

        let maxDelta = 0.0006;
        if (parameters.sizeInBytes >= MB) {
            maxDelta = 0.00008;
        } else if (parameters.sizeInBytes > (10 * KB)) {
            maxDelta = 0.00008;
        } else if (parameters.sizeInBytes > KB) {
            maxDelta = 0.0015;
        } else if (parameters.sizeInBytes < KB) {
            maxDelta = 0.0015;
        }

        let overshootCount = 0;
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
                        console.log({ op: `Done (${tries})`, size: `${width}x${height}`, diff, fileSize: `${(fileSizeInBytes / 1024).toFixed(2)} KB` });
                    }
                    resolve();
                    return;
                }

                // Figure out how the canvas must be cropped or enlarged to hit the target file size.
                crop = fileSizeInBytes > parameters.sizeInBytes;
                if (crop) {
                    if (grow) {
                        sampler.reset();
                        grow = false;
                    }

                    sampler.add(fileSizeInBytes);

                    let pixelsToRemove = 1;
                    if (sampler.isFilled()) {
                        let factor = 0.8 - ( overshootCount * 0.1);

                        // Lower the risk overshoot when sub MB
                        if (sizeDiffInBytes < MB) {
                            factor = 0.4;
                        }

                        if (factor < 0.2) {
                            factor = 0.2;
                        }

                        pixelsToRemove = getAvgFactorForTargetSize(sampler.get(), sizeDiffInBytes, factor);
                        if (parameters.debug) {
                            console.log({ op: `Shrink (${tries})`, size: `${width}x${height}`, diff });
                        }
                    } else {
                        if (parameters.debug) {
                            console.log({ op: `Shrink (${tries})`, size: `${width}x${height}`, diff }, '(Sampling)');
                        }
                    }

                    // Crop from the side which impact the least number of pixels to prevent major size jumps.
                    if (width > height) {
                        if (pixelsToRemove < width) {
                            width -= pixelsToRemove;
                        }
                    } else {
                        if (pixelsToRemove < height) {
                            height -= pixelsToRemove;
                        }
                    }
                } else {
                    if (!grow) {
                        grow = true;
                        overshootCount++;
                        if (parameters.debug) {
                            console.log({ op: 'Overshoot', size: `${width}x${height}`, diff, count: overshootCount });
                        }
                    }

                    const factor = parameters.sizeInBytes / fileSizeInBytes;
                    const dimensionScaleFactor = Math.sqrt(factor);
                    if (parameters.debug) {
                        console.log({ op: `Growth (${tries})`, size: `${width}x${height}`, diff });
                    }

                    // Note: We want to add some extra size to feed the sampler and prevent direct overshoot.
                    width = Math.max(width + 1, Math.floor(width * (dimensionScaleFactor * 1.05)));
                    height = Math.max(height + 1, Math.floor(height * dimensionScaleFactor * 1.05));
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