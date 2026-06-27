import {useEffect, useRef, useState} from 'react'
import './index.css'
import {Input} from "./components/ui/input.tsx";
import type {IFileInfo} from "./interfaces/FileInterfaces.ts";
import {createDirectory, createFile, deleteNode, getFiles, getShortcuts, renameNode} from "./services/FileService.ts";

type Variants = "File" | "Directory";

const refreshCurrentDirectory = async (path: string, setFiles: (files: IFileInfo[]) => void) => {
    try {
        const data = await getFiles(path);
        setFiles(data);
    }
    catch (error) {
        console.error(error);
    }
}

function App() {
  return (
      <div className="flex justify-center items-center bg-[#070a12] w-full h-screen">
          <FileExplorerDashboard/>
      </div>
  );
}

function FileExplorerDashboard() {
    const [shortcuts, setShortcuts] = useState<IFileInfo[]>([]);
    const [path, setPath] = useState<string>("/")

    return (
        <div className="flex w-200 h-150 bg-[#111622] rounded-2xl border-2 border-[#1d263b] divide-x-2 divide-[#1d263b]">
            <SideBar setPath={setPath} shortcuts={shortcuts} setShortcuts={setShortcuts}/>
            <NavigationView path={path} setPath={setPath}/>
        </div>
    );
}

function SideBar({setPath, shortcuts, setShortcuts}: {setPath: (path: string) => void, shortcuts: IFileInfo[], setShortcuts: (shortcuts: IFileInfo[]) => void}) {

    useEffect(() => {
        const data = getShortcuts();

        data.then(s => {
            setShortcuts(s);
            setPath(s[0].path);
        });

    }, [])


    return (
        <div className="flex flex-col items-center w-1/4 h-full p-4">
            {shortcuts?.map(s => <SideBarButton key={s.name} file={s} setPath={setPath}/>)}

        </div>
    );
}

function SideBarButton({file, setPath}: {file: IFileInfo, setPath: (path: string) => void}) {
    return (
        <button onClick={() => setPath(file.path)} className="flex w-full h-7 items-center justify-start gap-2 text-white">
            <img className="w-7 h-7 invert" src={`./${file.name.toLowerCase()}.svg`}/>
            <h1>{file.name}</h1>
        </button>
    );
}

function NavigationView({path, setPath}: {path: string, setPath: (path: string) => void}) {
    const [files, setFiles] = useState<IFileInfo[]>();
    const [input, setInput] = useState<string>("");

    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<IFileInfo | null>(null);
    const [variant, setVariant] = useState<Variants>("File")

    useEffect(() => {

        const data = getFiles(path);

        data.then(e => {
            setFiles(e);
            setInput(path);
        });

    }, [path])


    return (
        <div className="flex flex-col items-center w-3/4 h-full divide-y-2 divide-[#1d263b]">
            <div className="group flex justify-center items-center w-full h-1/12 p-4 gap-4">
                <form onSubmit={(e) => {setPath(input); e.preventDefault()}} className="flex justify-center items-center w-full h-full">
                    <Input value={input} onChange={e => setInput(e.target.value)} className="text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none rounded-lg border-2 border-[#202a3d] hover:border-[#2d3b54] focus:border-[#00d4ec]"/>
                </form>
                <details className="relative z-30">
                    <summary className="flex justify-center items-center list-none cursor-pointer w-8 h-8 bg-[#0b1a26] border-2 rounded-lg border-[#005b66] text-[#00a2b1] select-none">
                        +
                    </summary>
                    <div className="absolute right-0 top-full mb-1 bg-[#111827] border border-gray-800 rounded-lg shadow-2xl py-1 w-36 flex flex-col">
                        <button onClick={() => {setShowModal(true); setVariant("File")}} className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[#102636]">
                            Create File
                        </button>
                        <button onClick={() => {setShowModal(true); setVariant("Directory")}} className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[#102636] border-t border-gray-800/50">
                            Create Directory
                        </button>
                    </div>
                </details>
            </div>
            <div className="flex flex-wrap content-start w-full h-11/12 p-4 gap-4 overflow-y-auto" onContextMenu={(e) => {e.preventDefault();}}>
                {files?.map(f =>
                    <NavigationButton key={f.name} file={f} setPath={setPath} setSelectedFile={setSelectedFile} setShowModal={setShowModal} path={path} setFiles={setFiles}/>
                )}
            </div>
            {showModal && <DialogModal path={path} selectedFile={selectedFile} setSelectedFile={setSelectedFile} setShowModal={setShowModal} variant={variant} setFiles={setFiles}/>}
        </div>
    );
}

function NavigationButton({file, setPath, setSelectedFile, setShowModal, path, setFiles}: {file: IFileInfo, setPath: (path: string) => void, setSelectedFile: (file: IFileInfo) => void, setShowModal: (show: boolean) => void, path: string, setFiles: (files: IFileInfo[]) => void}) {

    const detailsRef = useRef<HTMLDetailsElement>(null);

    function handleOnLeave() {
        if (detailsRef.current) {detailsRef.current.removeAttribute('open');}
    }

    async function handleDelete() {
        try {
            await deleteNode(file.path, file.isDirectory)
            refreshCurrentDirectory(path, setFiles);
        }
        catch (error) {
            console.warn(error);
        }
    }

    return (
        <div onMouseLeave={() => handleOnLeave()} onClick={() => file.isDirectory && setPath(file.path)} className="group relative flex flex-col items-center justify-center p-4 text-white rounded-xl w-30 h-30 min-w-0">
            <img className="absolute inset-0 w-full h-full invert opacity-10" src={file.isDirectory ? "./folder.svg" : "./file.svg"}/>
            <h1 className="absolute w-full h-5 truncate text-white text-sm bottom-2">{file.name}</h1>
            <details ref={detailsRef} className="hidden group-hover:block absolute bottom-2 right-2 z-30">
                <summary onClick={(e) => {e.stopPropagation()}} className="list-none cursor-pointer p-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-gray-400 hover:text-white select-none">
                    ...
                </summary>
                <div className="absolute right-0 bottom-full mb-1 bg-[#111827] border border-gray-800 rounded-lg shadow-2xl py-1 w-36 flex flex-col">
                    <button onClick={(e) => {e.stopPropagation(); setSelectedFile(file); setShowModal(true)}} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#102636]">
                        Rename
                    </button>
                    <button onClick={(e) => {e.stopPropagation(); handleDelete(); handleOnLeave()}} className="w-full text-left px-3 py-1.5 text-xs text-red-400 border-t border-gray-800/50">
                        Delete
                    </button>
                </div>
            </details>
        </div>
    );
}

function DialogModal({path, selectedFile, setSelectedFile, setShowModal, variant, setFiles}: {path: string, selectedFile: IFileInfo | null, setSelectedFile: (file: IFileInfo | null) => void, setShowModal: (show: boolean) => void, variant:Variants, setFiles: (files: IFileInfo[]) => void}) {

    const [input, setInput] = useState<string>(() => {
        return selectedFile ? selectedFile.name : "";
    });

    async function handleSave() {
        if (selectedFile === null) {
            if (variant === "File") {
                try {
                    await createFile({
                        name: input,
                        path: path,
                        isDirectory: false,
                        size: 0,
                        lastModified: new Date().toISOString()
                    });
                }
                catch (error) {
                    console.error(error);
                }
            }
            else if (variant == "Directory") {
                try {
                    await createDirectory({
                        name: input,
                        path: path,
                        isDirectory: true,
                        size: 0,
                        lastModified: new Date().toISOString()
                    });
                }
                catch (error) {
                    console.error(error);
                }
            }
        }
        else {
            try {
                await renameNode({
                    oldName: selectedFile.name,
                    newName: input,
                    path: path,
                    isDirectory: selectedFile.isDirectory
                });
                setSelectedFile(null);
            }
            catch (error) {
                console.error(error);
            }
        }
        refreshCurrentDirectory(path, setFiles)
    }

    return (
        <div onClick={() => {setShowModal(false); setSelectedFile(null)}} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="flex flex-col w-100 bg-[#111622] rounded-xl border-2 border-[#1d263b] p-4 gap-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-white">File/Directory name:</h2>
                <Input value={input} onChange={e => setInput(e.target.value)} className="rounded-md border-2 border-[#202a3d] text-white hover:border-[#2d3b54] focus:border-[#00d4ec]"/>
                <button onClick={() => {handleSave(); setShowModal(false)}} className="rounded-md bg-[#00d4ec] p-1 hover:bg-[#00b8cc] active:bg-[#0097a7] transition-colors duration-300">Save Changes</button>
            </div>
        </div>
    );
}
export default App
