import './index.css'
import {Eye, FileText, Tag, TriangleAlert} from "lucide-react";
import {useMemo, useRef, useState} from "react";
import * as React from "react";
import {AnalyzeImages} from "./services/InspectionService.ts";
import type {AnalysisResult} from "./interfaces/interfaces.ts";

export type actionValue = "description" | "detection" | "read" | "classification";

interface Actions {
    Title: string,
    Subtitle: string,
    Action: actionValue
}

function App() {
    return (
        <div className="flex justify-center items-center bg-[#070a12] w-full h-screen p-8">
            <InspectionDashboard/>
        </div>
    );
}

function InspectionDashboard() {
    const [images, setImages] = useState<File[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedAction, setSelectedAction] = useState<actionValue>("description");
    const [analysisMode, setAnalysisMode] = useState<boolean>(false);
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);


    return (
        <div className="flex bg-[#111622] rounded-2xl border-2 border-[#1d263b] w-full h-full shadow-[0px_0px_15px_#1d263b] divide-x-2 divide-[#1d263b]">
            <SideBar setSelectedResult={setSelectedResult} analysisMode={analysisMode} setAnalysisMode={setAnalysisMode} results={results} setResults={setResults} selectedAction={selectedAction} setSelectedAction={setSelectedAction} selectedImages={selectedImages} setImages={setImages} images={images} setSelectedImages={setSelectedImages}/>
            {analysisMode ? <AnalysisView selectedResult={selectedResult} setSelectedResult={setSelectedResult} results={results}/> : <ImageView images={images} setSelectedImages={setSelectedImages} selectedImages={selectedImages}/>}
        </div>
    );
}

function SideBar({setSelectedResult, analysisMode, setAnalysisMode, results, setResults, selectedAction, setSelectedAction, selectedImages, setImages, images, setSelectedImages}: {setSelectedResult: (selectedResult: AnalysisResult | null) => void, analysisMode: boolean, setAnalysisMode: (analysisMode: boolean) => void, results: AnalysisResult[], setResults: (results: AnalysisResult[]) => void, selectedAction: actionValue, setSelectedAction: (selectedAction: actionValue) => void, selectedImages: File[], setImages: (images: File[]) => void, images: File[], setSelectedImages: (selectedImages: File[]) => void}) {

    const fileChooser = useRef<HTMLInputElement>(null);
    const [processedCount, setProcessedCount] = useState<number>(0);
    const [batchSize, setBatchSize] = useState<number>(0);

    const actions: Actions[] = [];
    actions.push({Title: "Describe Image", Subtitle: "Generate visual caption", Action: "description"});
    actions.push({Title: "Detect Defects", Subtitle: "Find anomalies and flaws", Action: "detection"});
    actions.push({Title: "Extract Text (OCR)", Subtitle: "Read text from image", Action: "read"});
    actions.push({Title: "Classify Objects", Subtitle: "Identify and categorize", Action: "classification"});

    const handleOnRun = () => {

        if (selectedImages.length == 0) return;

        if (!analysisMode) {
            setAnalysisMode(true);
        }
        else {
            return;
        }

        const analysisResults = AnalyzeImages(selectedImages, selectedAction, (processed, size) => {
            setProcessedCount(processed);
            setBatchSize(size);
        })

        analysisResults.then(r => {setResults(r); setSelectedResult(results[0])});

    }

    const handleDirectoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const imageList = []

        const allowedExtensions = ["png", "jpg", "jpeg", "webp", "gif"]

        for (const file of fileList) {
            if (allowedExtensions.includes(file.name.split(".")[1])) {
                imageList.push(file);
            }
        }

        setImages(imageList);
    }

    return (
        <div className="flex flex-col min-w-65 h-full p-4 divide-y-2 divide-[#1d263b]">
            <div className="flex flex-col pt-2 pb-2 gap-4">
                <h1 className="text-[#475569] text-sm">Source folder</h1>
                <button onClick={() => fileChooser.current!.click()} className="text-xs p-2 rounded-md border-2 border-[#475569] text-[#475569] hover:border-[#00d4ec] hover:text-[#00d4ec] transition-colors">Browse folder...</button>
                <p className="text-[13px] text-[#475569]">{images.length} images</p>
            </div>
            <div className="flex flex-col pt-2 pb-2 gap-4">
                {actions.map(a => <ActionButton selectedAction={selectedAction} setSelectedAction={setSelectedAction} key={a.Action} action={a}/>)}
            </div>
            {!analysisMode && <div className="flex flex-col pt-2 pb-2 gap-4">
                <h1 className="text-[#475569] text-sm">Batch</h1>
                <div className="flex gap-2">
                    <button onClick={() => setSelectedImages(images)} className="flex justify-center items-center w-1/2 h-8 rounded-md border-2 border-[#475569] text-[#475569] hover:border-[#00d4ec] hover:text-[#00d4ec] transition-colors">ALL</button>
                    <button onClick={() => setSelectedImages([])} className="flex justify-center items-center w-1/2 h-8 rounded-md border-2 border-[#475569] text-[#475569] hover:border-[#00d4ec] hover:text-[#00d4ec] transition-colors">NONE</button>
                </div>
                <button onClick={() => handleOnRun()} className="flex justify-center items-center h-9 rounded-md bg-[#00d4ec] hover:bg-[#00b8cc] active:bg-[#0097a7] transition-colors">RUN</button>
            </div>}
            <input type="file" ref={fileChooser} webkitdirectory="" className="hidden" onChange={handleDirectoryChange}/>
            {analysisMode && <TaskView processedCount={processedCount} batchSize={batchSize}/>}
        </div>
    );
}

function TaskView({processedCount, batchSize}: {processedCount: number, batchSize: number}) {

    const percentage: number = (processedCount / batchSize) * 100;

    return (
        <div className="flex flex-col w-full h-50 pt-2 pb-2 gap-1">
            <h1 className="text-[#475569] text-sm">Progress</h1>
            <br/>
            <p className="text-[#475569] text-xs">{`${processedCount} / ${batchSize}`}</p>
            <div className="flex justify-start items-center w-full h-4 border-4 border-[#202a3d] rounded-md bg-[#0a0e17]">
                <div className={`flex justify-start items-center h-1 rounded-md bg-[#00d4ec]`} style={{ width: `${percentage}%` }}/>
            </div>
        </div>
    );
}

function ImageView({images, setSelectedImages, selectedImages}: {images: File[], setSelectedImages: (selectedImages: File[]) => void, selectedImages: File[]}){

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex items-center w-full rounded-tr-2xl min-h-10 bg-[#0a0e17] border-b-2 border-[#1d263b]">
                <h1 className="text-[#E2E8F0] text-xs ml-5">{selectedImages.length} selected</h1>
            </div>
            <div className="flex justify-center w-full h-full flex-wrap grid-cols-5 p-4 gap-4 overflow-y-auto">
                {images.map(i => <ImageItem key={i.webkitRelativePath} image={i} setSelectedImages={setSelectedImages} selectedImages={selectedImages}/>)}
            </div>
        </div>
    );
}

const ImageItem = React.memo(function ImageItem({image, setSelectedImages, selectedImages}: {image: File, setSelectedImages: (selectedImages: File[]) => void, selectedImages: File[]}) {
    const imageURL = useMemo(() => URL.createObjectURL(image), [image])

    const handleImageSelection = () => {
        if (selectedImages.includes(image)) {
            setSelectedImages(selectedImages.filter(i => i.webkitRelativePath != image.webkitRelativePath));
        }
        else {
            setSelectedImages([...selectedImages, image]);
        }
    }

    const selectedStyle = "border-[#007380] hover:border-[#00d4ec]";
    const normalStyle = "border-[#1d263b] hover:border-[#2D3748]";

    return (
        <button onClick={handleImageSelection} className={`flex justify-center items-center w-50 h-50 border-2 rounded-lg ${selectedImages.includes(image) ? selectedStyle : normalStyle} transition-colors`}>
            <img src={imageURL}/>
        </button>
    );
});

function AnalysisView({results, selectedResult, setSelectedResult}: {results: AnalysisResult[], selectedResult: AnalysisResult | null, setSelectedResult: (selectedResult: AnalysisResult | null) => void}) {

    return (
        <div className="flex flex-col w-full h-full min-w-0">
            <div className="flex items-center w-full rounded-tr-2xl min-h-10 bg-[#0a0e17] border-b-2 border-[#1d263b]">

            </div>
            <div className="flex w-full h-0 grow divide-x-2 divide-[#1d263b]">
                <div className="flex flex-col w-full h-full p-4 gap-4 min-w-0 max-h- overflow-y-auto">
                    {results.map(r => <AnalysisItem key={r.title} result={r} selectedResult={selectedResult} setSelectedResult={setSelectedResult}/>)}
                </div>
                {selectedResult && <DetailsView selectedResult={selectedResult}/>}
            </div>
        </div>
    );
}

function AnalysisItem({result, selectedResult, setSelectedResult}: {result: AnalysisResult, selectedResult: AnalysisResult | null, setSelectedResult: (selectedResult: AnalysisResult | null) => void}) {

    const imageURL = useMemo(() => URL.createObjectURL(result.image), []);

    const focusStyle = "bg-[#0b1a26] border-[#005b66] text-[#00a2b1]";
    const normalStyle = "bg-[#171e2c] border-[#202a3d] text-[#E2E8F0]"

    return (
        <button onClick={() => setSelectedResult(result)} className={`flex items-center w-full h-20 p-2 gap-2 border-2 rounded-lg min-w-0 hover:bg-[#102636] hover:border-[#007380] hover:text-[#00c2d6] transition-colors ${selectedResult === result ? focusStyle : normalStyle}`}>
            <div className="min-h-15 min-w-15 h-15 w-15 bg-[#475569] rounded-md overflow-hidden shrink-0">
                <img src={imageURL} alt="Preview" className="w-full h-full object-cover"/>
            </div>
            <div className="flex flex-col justify-center w-full h-full min-w-0">
                <h1 className="text-sm truncate text-left w-full">{result.title}</h1>
                <h1 className="text-sm truncate text-left w-full">{result.description}</h1>
            </div>
        </button>
    );
}

function DetailsView({selectedResult}: {selectedResult: AnalysisResult | null}) {
    const imageURL = useMemo(() => URL.createObjectURL(selectedResult!.image), [selectedResult]);

    return (
        <div className="flex flex-col h-full min-w-1/3 w-1/3 p-4">
            <div className="min-w-full min-h-75 w-full h-75 bg-[#475569] rounded-xl overflow-hidden shrink-0">
                <img src={imageURL} alt="Preview" className="w-full h-full object-cover"/>
            </div>
            <br/>
            <h1 className="text-sm text-white">TAGS:</h1>
            <div className="flex flex-wrap w-full min-w-0">

            </div>
            <br/>
            <h1 className="text-sm text-white">TITLE: {selectedResult?.title}</h1>
            <br/>
            <h1 className="text-sm text-white">DESCRIPTION:</h1>
            <div className="flex w-full h-full overflow-y-auto">
                <p className="text-white text-sm">{selectedResult?.description}</p>
            </div>
            <h1 className="text-sm text-white">CONFIDENCE: {selectedResult?.confidence}%</h1>
            <br/>
            <div className="flex justify-start items-center w-full h-4 border-4 border-[#202a3d] rounded-md bg-[#0a0e17]">
                <div className={`flex justify-start items-center h-1 rounded-md ${selectedResult?.confidence >= 50 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${selectedResult?.confidence}%` }}/>
            </div>
        </div>
    );
}

function ActionButton({action, selectedAction, setSelectedAction}: {action: Actions, selectedAction: actionValue, setSelectedAction: (selectedAction: actionValue) => void}) {

    const focusStyle = "bg-[#0b1a26] border-[#005b66] text-[#00a2b1]";
    const normalStyle = "bg-transparent border-transparent text-[#475569]"

    return (
        <button onClick={() => {setSelectedAction(action.Action)}} className={`flex items-center border-2 rounded-md h-15 gap-2 p-4 ${selectedAction === action.Action ? focusStyle : normalStyle} hover:bg-[#102636] hover:border-[#007380] hover:text-[#00c2d6] transition-colors`}>
            <div className="flex justify-center items-center h-full">
                {action.Action === "description" && <Eye/>}
                {action.Action === "detection" && <TriangleAlert/>}
                {action.Action === "read" && <FileText/>}
                {action.Action === "classification" && <Tag/>}
            </div>
            <div className="flex flex-col">
                <h1 className="flex items-center text-[14px]">{action.Title}</h1>
                <h1 className="flex items-center text-[10px]">{action.Subtitle}</h1>
            </div>
        </button>
    );
}

export default App
