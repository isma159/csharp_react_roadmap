import './index.css'

function App() {
    return (
        <div className="flex justify-center items-center w-full h-screen bg-[#070a12]">
            <LoginView/>
        </div>
    );
}

function LoginView() {
    return (
        <div className="flex flex-col items-center justify-center w-150 h-100 bg-[#111622] border-2 border-[#1d263b] rounded-2xl">
            <h1 className="flex w-full justify-center items-center text-white font-bold text-2xl">Log In</h1>

        </div>
    );
}

export default App
