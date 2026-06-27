import './index.css'
import {Input} from "./components/ui/input.tsx";
import {Check, X, Plus} from "lucide-react";
import {useEffect, useState} from "react";
import type {Note} from "./interfaces/NoteInterfaces.ts";
import {createNote, deleteNote, getNotes, updateNote} from "./services/NoteServices.ts";

function App() {

    return (
        <div className="flex flex-col w-full h-screen items-center justify-center bg-[#070a12]">
            <NoteDashboard/>
        </div>
    );
}

function NoteDashboard() {

    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    const loadNotes = async () => {
        try {
            const data = await getNotes();
            setNotes(data);
        }
        catch (error) {
            console.log("Backend not ready yet.", error);
            setTimeout(loadNotes, 2000);
        }
    }

    useEffect(() => {
        loadNotes();
    }, []);

    return (
        <div className="flex w-225 h-150 rounded-2xl divide-x-2 bg-[#111622] border-2 border-[#1d263b] divide-[#1d263b]">
            <SideBar notes={notes} selectedNote={selectedNote} setSelectedNote={setSelectedNote}/>
            <NoteView notes={notes} setNotes={setNotes} selectedNote={selectedNote} setSelectedNote={setSelectedNote}/>
        </div>
    );
}

function SideBar({notes, selectedNote, setSelectedNote}: {notes:Note[], selectedNote: Note | null, setSelectedNote: (note:Note | null) => void}) {
    return (
        <div className="flex flex-col h-full w-1/4 p-2">
            <div className="flex flex-col h-1/8 p-2">
                <button onClick={() => setSelectedNote(null)} className="flex justify-start items-center p-2 rounded-lg bg-[#171e2c] border-2 border-[#1d263b] text-white mb-5 hover:bg-[#2D3748] hover:border-[#4A5568] transition-colors duration-300"><Plus className="mr-3"/> New Note</button>
            </div>
            <div className="flex flex-col h-7/8 overflow-y-auto p-2 gap-2">
                {notes.map((note) => <SideButton key={note.id} note={note} selectedNote={selectedNote} setSelectedNote={setSelectedNote}/>)}
            </div>
        </div>
    );
}

function SideButton({note, selectedNote, setSelectedNote}: {note:Note, selectedNote: Note | null, setSelectedNote: (note:Note | null) => void}) {
    const isSelected = note.id === selectedNote?.id;
    const selectedClass = "bg-[#0b1a26] border-[#005b66] text-[#00a2b1] hover:bg-[#102636] hover:border-[#007380] hover:text-[#00c2d6]";
    const defaultClass = "bg-[#171e2c] text-white border-[#1d263b] hover:bg-[#2D3748] hover:border-[#4A5568]";

    return (
        <button onClick={() => setSelectedNote(note)} className={`flex min-w-0 flex-col justify-center items-start p-4 gap-1 w-full rounded-lg border-2 transition-colors duration-300 ${isSelected ? selectedClass : defaultClass}`}>
            <h1 className="truncate max-w-full">&gt; {note.title}</h1>
            <h1 className="text-xs truncate max-w-full">{note.createdAt}</h1>
        </button>
    );
}

function NoteView({notes, setNotes, selectedNote, setSelectedNote}: {notes: Note[], setNotes: (notes: Note[]) => void, selectedNote: Note | null, setSelectedNote: (note: Note) => void}) {

    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");

    const setStates = async () => {

        setTitle(selectedNote != null ? selectedNote.title : "");
        setContent(selectedNote != null ? selectedNote.content : "")

    }

    useEffect(() => {
        setStates();
    }, [selectedNote]);

    async function handleSave() {
        try {
            if (selectedNote == null) {
                const note = await createNote({title, content});
                setNotes([...notes, note]);
                setSelectedNote(note)
            } else {
                const note = await updateNote(selectedNote.id, {title, content});
                setNotes(notes.map(n => n.id === selectedNote!.id ? note : n));
            }
        }
        catch (error) {
            console.warn(error);
        }
    }

    async function handleDelete() {
        try {
            if (selectedNote == null) return;
            await deleteNote(selectedNote.id);
            setNotes(notes.filter(n => n.id !== selectedNote!.id))
            setSelectedNote(notes[0])
        }
        catch (error) {
            console.warn(error);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-3/4 h-full p-4">
            <div className="flex flex-col items-center p-4 gap-4 w-full h-full bg-[#171e2c] rounded-xl border-2 border-[#202a3d]">
                <Input value={title} onChange={e => setTitle(e.target.value)} className="w-full h-1/12 rounded-lg border-2 text-white border-[#202a3d] hover:border-[#2d3b54] focus:border-[#00d4ec]! focus-visible:ring-0! outline-none bg-[#0a0e17] transition-colors duration-300"/>
                <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full h-10/12 p-4 resize-none text-white border-2 border-[#202a3d] bg-[#0a0e17] rounded-xl focus-visible:outline-none hover:border-[#2d3b54] focus:border-[#00d4ec] transition-colors duration-300"/>
                <div className="flex w-full h-1/12 justify-end items-center p-4 gap-4">
                    <button onClick={() => handleSave()} className="flex text-sm pl-3 pr-3 pt-1.5 pb-1.5 items-center rounded-lg font-bold bg-[#00d4ec] border-2 border-[#00d4ec] hover:bg-[#00b8cc] active:bg-[#0097a7] transition-colors duration-300"><Check size={16} className="mr-3"/> Save Changes</button>
                    {selectedNote != null ? <button onClick={() => handleDelete()} className="flex text-sm pl-3 pr-3 pt-1.5 pb-1.5 items-center text-red-400 rounded-lg font-bold border-2 border-red-400 hover:bg-[#1e2738] transition-colors duration-300"><X size={16} className="mr-3"/>Delete</button> : ""}
                </div>
            </div>
        </div>
    );
}

export default App
