import './App.css'
import {useState} from "react";

const steps: number[] = [1, 5, 10, 25]

function App() {
    const [value, setValue] = useState(0)
    const [step, setStep] = useState(1)

  return (
    <div className="flex flex-1 items-center justify-center w-full h-screen bg-[#121212]">
        <div className="relative flex flex-col items-center justify-center bg-[#1E1E1E] w-[400px] h-[500px] rounded-lg">
            <div className="flex flex-1 items-center justify-center gap-12">
                <ValueButton onClick={() => setValue(value + step)} icon={"+"}/>
                <h1 className={`text-6xl w-[100px] text-center transition-colors ${value > 0 ? "text-[#4ade80]" : value < 0 ? "text-[#f87171]" : "text-[#FFFFFF]"}`}>
                    {value}
                </h1>
                <ValueButton onClick={() => setValue(value - step)} icon={"-"}/>
            </div>
            <div className="absolute flex justify-center items-center bottom-15 w-full h-25 gap-4">
                {steps.map((e) => (
                    <StepButton key={e} selected={step === e} value={e} onClick={() => setStep(e)}/>
                ))}
            </div>
            <div className="absolute flex justify-center items-center bottom-4 w-full h-10 gap-4">
                {value != 0 && <ResetButton onClick={() => setValue(0)}/>}
            </div>
        </div>
    </div>
  )
}

function ValueButton({icon, onClick}: {icon: string, onClick: () => void}) {

    return (
        <button onClick={onClick} className="flex justify-center items-center text-5xl text-[#8E8E93] bg-[#1A2323] border-2 border-[#2D4A4A] rounded-4xl p-8 w-14 h-14 shadow-[0px_0px_15px_#1A2323] hover:bg-[#1E3A3A] hover:border-[#5CE1E6] hover:text-[#FFFFFF] hover:shadow-[0px_0px_15px_#5CE1E6] active:scale-90 transition-all duration-300 ">{icon}</button>
    );
}

function StepButton({value, onClick, selected}: {value:number, onClick: () => void, selected: boolean}) {
    return (
        <button onClick={onClick} className={`flex justify-center items-center text-2xl border-2 rounded-lg p-8 w-14 h-14 active:scale-90 transition-all duration-300
    ${selected
            ? "bg-[#1E3A3A] border-[#5CE1E6] text-[#5CE1E6] shadow-[0px_0px_15px_#5CE1E6]"
            : "bg-[#1A2323] border-[#2D4A4A] text-[#8E8E93] shadow-[0px_0px_15px_#1A2323] hover:bg-[#1E3A3A] hover:border-[#5CE1E6] hover:text-[#FFFFFF] hover:shadow-[0px_0px_15px_#5CE1E6]"
        }`}>{value}</button>
    );
}

function ResetButton({onClick}: {onClick: () => void}) {
    return (
        <button onClick={onClick} className="flex justify-center items-center text-lg text-[#8E8E93] bg-[#1A2323] border-2 border-[#2D4A4A] rounded-lg p-5 w-80 h-1 shadow-[0px_0px_15px_#1A2323] hover:bg-[#1E3A3A] hover:border-[#5CE1E6] hover:text-[#FFFFFF] hover:shadow-[0px_0px_15px_#5CE1E6] active:scale-90 transition-all duration-300 ">Reset</button>
    );
}

export default App
