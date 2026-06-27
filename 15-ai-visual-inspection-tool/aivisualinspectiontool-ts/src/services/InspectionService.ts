import type {actionValue} from "../App.tsx";
import type {AnalysisResult} from "../interfaces/interfaces.ts";

export type BiConsumer<T, U> = (t: T, u: U) => void;

export async function AnalyzeImages(images: File[], action: actionValue, progress: BiConsumer<number, number>) {

    const resultArray: AnalysisResult[] = [];
    let processedCount: number = 0;

    for (const image of images) {

        progress(processedCount, images.length);

        const formData = new FormData();
        formData.append("image", image);

        const response = await fetch(`http://localhost:5156/api/Inspection/${action}`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {throw new Error("Invalid file format sent")}

        const result: AnalysisResult = await response.json() as AnalysisResult;

        result.image = image;

        resultArray.push(result);

        processedCount++;

        progress(processedCount, images.length);
    }

    return resultArray;
}