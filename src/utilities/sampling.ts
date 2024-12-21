export function getAvgUnitCost(byteSizeSamples: number[]): number {
    let totalBytes = 0;

    for (let index = 1; index < byteSizeSamples.length; index++) {
        const cost = byteSizeSamples[index - 1] - byteSizeSamples[index];
        totalBytes += cost;
    }

    const avgUnitCost = totalBytes / byteSizeSamples.length; 
    return avgUnitCost;
}

export function getAvgFactorForTargetSize(byteSizeSamples: number[], targetSize: number, factor: number = 0.6): number {
    const avgUnitCost = getAvgUnitCost(byteSizeSamples);
    const targetFactor = avgUnitCost > 0 ? Math.floor((targetSize / avgUnitCost) * factor) : 1;
    return targetFactor;
}