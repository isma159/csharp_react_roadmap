import type {Note} from "../interfaces/NoteInterfaces.ts";

const BASE_URL: string = "http://localhost:5093/"

export async function getNotes(): Promise<Note[]> {
    const response = await fetch(BASE_URL + "api/Notes");
    if (response.status == 404) {return []}
    return await response.json();
}

export async function createNote({title, content}: {title: string, content: string}): Promise<Note> {
    const response = await fetch(BASE_URL + "api/Notes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"title": title, "content": content})
    });
    if (!response.ok) {throw new Error("Failed to create note")}
    return await response.json();
}

export async function updateNote(id: number, {title, content}: {title: string, content: string}): Promise<Note> {
    const response = await fetch(BASE_URL + `api/Notes/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"title": title, "content": content})
    });
    if (!response.ok) {throw new Error("Failed to update note")}
    return await response.json();
}

export async function deleteNote(id: number): Promise<void> {
    const response = await fetch(BASE_URL + `api/Notes/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {throw new Error("Failed to update note")}
}