import './index.css'
import filePdf from "./assets/file-pdf.svg"
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {X, Download, ArrowLeft, CircleX} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {useSummary} from "./hooks/useSummary.ts";

function App() {
    const [showSummary, setShowSummary] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    return (
        <div className="flex justify-center items-center w-full h-screen bg-[#070a12]">
            {showSummary ? <SummarizerDashboard setShowSummary={setShowSummary} selectedFile={selectedFile} setSelectedFile={setSelectedFile}/> : <UploadDashboard setShowSummary={setShowSummary} selectedFile={selectedFile} setSelectedFile={setSelectedFile}/>}
        </div>
    );
}

function UploadDashboard({setShowSummary, selectedFile, setSelectedFile}: {setShowSummary: (show: boolean) => void, selectedFile: File | null, setSelectedFile: (selectedFile: File | null) => void}) {

    const fileChooser = useRef<HTMLInputElement | null>(null);

    const handleOnDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (selectedFile != null) return;
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    }

    return (
        <div onDragOver={(e) => e.preventDefault()} onDrop={handleOnDrop} className="relative flex flex-col justify-center items-center w-200 h-150 bg-[#111622] rounded-2xl border-2 border-[#1d263b]">
            <input ref={fileChooser} type="file" accept=".pdf" className="hidden" onChange={handleFileChange}/>
            {!selectedFile && <div className="relative flex flex-col justify-center items-center w-full h-1/2">
                <img src={filePdf} className="scale-30 invert opacity-10"/>
                <h1 className="absolute flex justify-center items-center bottom-2 font-bold text-2xl invert opacity-10 w-full">Drag and drop, or select a PDF document.</h1>
            </div>}
            {selectedFile && <div className="flex justify-center items-center w-2/3 h-25 p-4 bg-[#111622] border-2 border-[#1d263b] rounded-xl shadow-[0px_0px_50px_#1d263b]">
                <div className="flex flex-col justify-center gap-2 w-1/2 h-full">
                    <h1 className="text-white text-xs truncate max-w-full">Name: {selectedFile.name}</h1>
                    <h1 className="text-white text-xs truncate max-w-full">File Size: {selectedFile.size / 1000} KB</h1>
                </div>
                <div className="flex justify-end items-center gap-4 w-1/2 h-full">
                    <button onClick={() => setShowSummary(true)} className="flex justify-center items-center w-30 h-9 bg-[#00d4ec] p-2 rounded-lg hover:bg-[#00b8cc] active:bg-[#0097a7] transition-colors duration-300">SUMMARIZE</button>
                    <button onClick={() => setSelectedFile(null)} className="flex justify-center items-center w-9 h-9 border-2 border-[#f87171] text-[#f87171] hover:bg-[#1e2738] p-2 rounded-lg transition-colors duration-300"><X size={24} strokeWidth={3}/></button>
                </div>
            </div>}
            <button onClick={() => fileChooser.current?.click()} className="absolute bottom-5 flex justify-center items-center w-50 h-10 bg-[#00d4ec] p-1 rounded-lg hover:bg-[#00b8cc] active:bg-[#0097a7] transition-colors duration-300">SELECT DOCUMENT</button>
        </div>
    );
}

function SummarizerDashboard({setShowSummary, selectedFile, setSelectedFile}: {setShowSummary: (show: boolean) => void, selectedFile: File | null, setSelectedFile: (selectedFile: File | null) => void}) {
    const summarizer = useSummary();
    const hasSummarizedRef = useRef<boolean>(false);
    useEffect(() => {

        if (selectedFile && !hasSummarizedRef.current) {
            hasSummarizedRef.current = true;
            summarizer.summarize(selectedFile);
        }

    }, [])

    const exportMarkdown = () => {
        const blob = new Blob([summarizer.summary], {type: "text/markdown"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "summary.md";
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="flex flex-col items-center w-200 h-150 bg-[#111622] rounded-2xl border-2 border-[#1d263b]">
            <div className="flex flex-col items-center w-full h-7/8 overflow-y-auto">
                <div className="flex flex-col w-2/3 h-full p-4 prose prose-invert prose-sm">
                    <ReactMarkdown remarkPlugins={[remarkBreaks, remarkGfm]}>{summarizer.summary}</ReactMarkdown>
                </div>
            </div>
            <div className="flex justify-center items-center w-full h-1/8 p-2 gap-4">
                {summarizer.isStreaming && <button onClick={() => summarizer.stop()} className="flex justify-center items-center w-9 h-9 p-2 rounded-lg border-2 border-[#f87171] text-[#f87171] hover:bg-[#f87171] hover:text-[#111622] hover:border-[#111622] transition-colors duration-300"><CircleX size={32} strokeWidth={2}/></button>}
                {!summarizer.isStreaming && <button onClick={() => exportMarkdown()} className="flex justify-center items-center w-50 h-9 bg-[#00d4ec] p-2 rounded-lg hover:bg-[#00b8cc] active:bg-[#0097a7] transition-colors duration-300"><Download className="mr-3" strokeWidth={2}/> Export to .md</button>}
                {!summarizer.isStreaming && <button onClick={() => {setShowSummary(false); setSelectedFile(null)}} className="flex justify-center items-center w-9 h-9 p-2 rounded-lg border-2 border-[#00d4ec] text-[#00d4ec] hover:bg-[#00d4ec] hover:border-[#111622] hover:text-[#111622] active:bg-[#0097a7] transition-colors duration-300"><ArrowLeft strokeWidth={2}/></button>}
            </div>
        </div>
    );
}

export default App
