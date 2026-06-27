import './index.css'
import {Input} from "./components/ui/input.tsx";
import {useState} from "react";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkEmoji from "remark-emoji";

import angleUp from "./assets/angle-up.svg";
import angleDown from "./assets/angle-down.svg";

import ReactMarkdown from "react-markdown";

interface Message {
    id: string,
    role: "user" | "assistant",
    content: string,
    thinkingProcess: string
}

interface MessageResponse {
    content: string,
    isThinking: boolean
}

function App() {
    return (
        <div className="flex justify-center items-center w-full h-screen bg-[#070a12]">
            <ChatDashboard/>
        </div>
    );
}

function ChatDashboard() {

    const [input, setInput] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([]);

    const sendMessage = async (contents: string) => {

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: contents,
            thinkingProcess: ""
        }

        setMessages(prev => [...prev, userMessage]);

        const response = await fetch("http://localhost:5034/api/Chat", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({Content: contents, IsThinking: false})
        });

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        let aiMessage = "";
        let aiThinking = "";

        const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: aiMessage,
            thinkingProcess: aiThinking
        }

        setMessages(prev => [...prev, assistantMessage]);

        let buffer = "";

        while (true) {
            const {done, value} = await reader.read();
            if (done) {break;}

            buffer += decoder.decode(value);
            const lines = buffer.split("\n");
            buffer = lines.pop()!;

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const rawJsonChunk = line.slice(6);

                    if (!rawJsonChunk) continue;

                    try {

                        const chunk = JSON.parse(rawJsonChunk) as MessageResponse;

                        if (chunk.isThinking) {
                            aiThinking += chunk.content;
                        }
                        else {
                            aiMessage += chunk.content;
                        }

                        setMessages(prev => prev.map((msg) => msg.id === assistantMessage.id ? {
                            ...msg,
                            content: aiMessage, thinkingProcess: aiThinking
                        } : msg));
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            }
        }
    }

    return (
        <div className="flex flex-col w-150 h-200 bg-[#111622] rounded-2xl border-2 border-[#1d263b] divide-y-2 divide-[#1d263b] p-4">
            <div className="flex flex-col w-full h-9/10 gap-4 overflow-y-auto">
                {messages.map(msg => <ChatBubble key={msg.id} message={msg}/>)}
            </div>
            <form onSubmit={e => {e.preventDefault(); sendMessage(input); setInput("");}} className="flex flex-col w-full h-1/10">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write message..." className="border-none h-full text-white placeholder:text-[#475569] placeholder:text-sm"/>
            </form>
        </div>
    );
}

function ChatBubble({message}: {message: Message}) {

    const userStyle = "ml-auto max-w-50 rounded-l-lg rounded-t-lg bg-[#0b1a26] border-2 border-[#005b66]";
    const assistantStyle = "mr-auto w-125 rounded-r-lg rounded-t-lg bg-[#171e2c] border-2 border-[#1d263b]";

    const [hidden, setHidden] = useState<boolean>(true);

    return (
        <div className="relative flex items-center w-full">
            <div className={`flex flex-col gap-2  p-3 ${message.role === "user" ? userStyle : assistantStyle} transition-all`}>
                {message.role === "assistant" && <div className="flex flex-col p-4 justify-center bg-[#0f172a] w-full border-2 border-[#334155] rounded-md text-gray-400 text-sm divide-y-2 divide-[#334155]">
                    <div className="relative flex items-center h-7">
                        <h1>Thinking...</h1>
                        <button className="absolute right-1 w-5 h-5" onClick={() => setHidden(!hidden)}>
                            <img src={hidden ? angleDown : angleUp} className="scale-200 invert opacity-50 hover:opacity-100"/>
                        </button>
                    </div>
                    {!hidden && <div className="prose prose-invert prose-sm max-w-100">
                        <ReactMarkdown remarkPlugins={[remarkBreaks, remarkGfm, remarkEmoji]}>{message.thinkingProcess}</ReactMarkdown>
                    </div>}
                </div>}
                <div className="prose prose-invert prose-sm">
                    <ReactMarkdown remarkPlugins={[remarkBreaks, remarkGfm, remarkEmoji]}>{message.content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );

}

export default App
