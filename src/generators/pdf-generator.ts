import type { FileGeneratorDetails } from "../types/file-gen-details";
import { generateRandomText } from "../utilities/string";

export async function generatePdfFile(parameters: FileGeneratorDetails): Promise<void> {
    const { PDFDocument, StandardFonts } = await import('pdf-lib');

    return new Promise<void>(async (resolve, reject) => {
        // Note: alternative solution, generate img of specific size and embedd the image in pdf to manage size.
        // PDF header size needs to be detect.
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        let contentLength = Math.floor(parameters.sizeInBytes / 2);
        let pdfBytes;

        while (true) {
            const doc = await PDFDocument.create();
            const page = doc.addPage();
            const text = generateRandomText(contentLength);

            //TODO: page.drawImage(...generated img...)

            page.drawText(text, {
                x: 50,
                y: 700,
                size: 12,
                font: font
            });

            pdfBytes = await doc.save();

            if (pdfBytes.length === parameters.sizeInBytes) {
                break;
            } else if (pdfBytes.length < parameters.sizeInBytes) {
                contentLength += Math.floor((parameters.sizeInBytes - pdfBytes.length) / 2);
            } else {
                contentLength -= Math.floor((pdfBytes.length - parameters.sizeInBytes) / 2);
            }
        }

        resolve();
    });
}