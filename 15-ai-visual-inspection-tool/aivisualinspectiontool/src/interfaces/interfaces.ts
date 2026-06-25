export interface IImageInfo {
    name: string,
    path: string
}


export interface AnalysisResult {
    title: string,
    description: string,
    tags: string[],
    confidence: number,
    image: File
}