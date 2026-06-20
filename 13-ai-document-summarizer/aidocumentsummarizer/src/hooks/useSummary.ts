import {useRef, useState} from "react";

export const useSummary = () => {
    const [summary, setSummary] = useState<string>("");
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const abortRef = useRef<AbortController | null>(null);

    const summarize = async (file:File) => {
        setSummary("");
        setIsStreaming(true);
        abortRef.current = new AbortController();

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:5183/api/Summarizer", {
                method: "POST",
                body: formData,
                signal: abortRef.current.signal
            });

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                buffer += decoder.decode(value);
                const lines = buffer.split("\n");
                buffer = lines.pop()!;

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const chunk = JSON.parse(line.slice(6));
                        if (!chunk) continue;
                        setSummary(prev => prev + chunk);
                    }
                }
            }
        }
        catch (error) {
            if (error instanceof DOMException && error.name == "AbortError") {
                console.log("Response aborted");
            }
            else {
                console.error(error);
            }
        }
        finally {
            setIsStreaming(false);
        }
    }
    const stop = () => {
        abortRef.current?.abort();
    }
    return {summary, isStreaming, summarize, stop}
}