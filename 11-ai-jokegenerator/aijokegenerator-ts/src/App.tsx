import './index.css'
import {useState} from "react";

function App() {
    return (
        <div className="flex justify-center items-center bg-[#070a12] w-full h-screen">
            <JokeDashboard/>
        </div>
    );
}

function JokeDashboard() {

    const [joke, setJoke] = useState<string>("-- INSERT JOKE HERE --");

    const loadJoke = async  () => {
        const response = await fetch("http://localhost:5273/api/Jokes");
        if (!response.ok) {return "Joke could not be generated";}
        setJoke(await response.text());
    }


    return (
        <div className="flex flex-col justify-center items-center bg-[#111622] w-150 h-125 rounded-2xl border-2 border-[#1d263b] gap-15">
            <h1 className="text-white text-xl drop-shadow-[0px_0px_15px_#FFFFFF]">JOKE GENERATOR</h1>
            <div className="flex justify-center items-center w-75">
                <h1 className="text-white text-xl flex-wrap wrap-break-word">{joke}</h1>
            </div>
            <button onClick={loadJoke} className="flex justify-center items-center bg-[#00d4ec] p-1 w-60 rounded-lg hover:bg-[#00b8cc] active:bg-[#0097a7]">GENERATE JOKE</button>
        </div>
    );
}

export default App
