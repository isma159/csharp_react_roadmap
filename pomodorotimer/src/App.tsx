import {useEffect, useRef, useState} from 'react'
import * as signalR from "@microsoft/signalr"
import './index.css'

type State = "WORK" | "LONG-BREAK" | "SHORT-BREAK"

function App() {
    return (
        <div className="flex flex-col justify-center items-center bg-[#070a12] w-full h-screen">
            <PomodoroDashboard/>
        </div>
    );
}

function PomodoroDashboard() {
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [secondsRemaining, setSecondsRemaining] = useState<number>();
    const [phase, setPhase] = useState<State>()

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder().withUrl("http://localhost:5269/timerhub").build();

        connection.on("ReceiveTick", (seconds) => {setSecondsRemaining(seconds)});

        connection.on("SessionCompleted", (phase, seconds) => {
            setPhase(phase);
            setSecondsRemaining(seconds);
        })

        connection.start().then(async () => {
            const state = await connection.invoke("GetState");
            setPhase(state.phase);
            setSecondsRemaining(state.secondsRemaining);
        });
        connectionRef.current = connection;

        return () => {connection.stop();}
    }, [])

    return (
        <div className="flex flex-col justify-center items-center bg-[#111622] w-150 h-125 rounded-lg border-2 border-[#1d263b] gap-8">
            <h1 className="flex justify-center items-center text-white text-2xl font-bold h-25">{phase}</h1>
            <h1 className="flex justify-center text-white text-6xl font-bold h-25">{secondsRemaining}</h1>
            <div className="flex justify-center items-center h-25 w-full gap-4">
                <PomodoroButton onClick={() => connectionRef.current?.invoke("StartTimer", secondsRemaining)} text={"START"}/>
                <PomodoroButton onClick={() => connectionRef.current?.invoke("PauseTimer")} text={"PAUSE"}/>
                <PomodoroButton onClick={() => connectionRef.current?.invoke("StopTimer")} text={"STOP"}/>
            </div>
        </div>
    );
}

function PomodoroButton({text, onClick}: {text:string, onClick: () => void}) {
    return (
        <button onClick={() => onClick()} className="flex justify-center items-center w-25 h-25 bg-[#0b1a26] border-2 border-[#005b66] text-[#00a2b1] rounded-full hover:bg[#102636] hover:border-[#007380] hover:text-[#00c2d6] transition-colors duration-300">{text}</button>
    );
}

export default App