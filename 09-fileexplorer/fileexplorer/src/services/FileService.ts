import type {IFileInfo, IRenameInfo} from "../interfaces/FileInterfaces.ts";

export async function getFiles(path: string) : Promise<IFileInfo[]> {
    const encodedPath = encodeURIComponent(path);
    const response = await fetch(`http://localhost:5152/api/Files?path=${encodedPath}`);
    if (!response.ok) {return [];}

    try {
        const data = await response.json();
        return data as IFileInfo[];
    }
    catch (error) {
        console.error("API returned invalid JSON", error);
        return [];
    }
}

export async function getShortcuts() : Promise<IFileInfo[]> {

    const response = await fetch("http://localhost:5152/api/Files/shortcuts")
    if (!response.ok) {return []}

    try {
        const data = await response.json();
        return data as IFileInfo[];
    }
    catch (error) {
        console.error("API returned invalid JSON", error);
        return [];
    }
}

export async function createFile(file: IFileInfo) : Promise<void> {

    const response = await fetch("http://localhost:5152/api/Files/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(file)
    });

    if (!response.ok) {throw new Error("Failed to create file")}

}

export async function createDirectory(node: IFileInfo) : Promise<void> {

    const response = await fetch("http://localhost:5152/api/Files/directory", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(node)
    });

    if (!response.ok) {throw new Error("Failed to create directory")}

}

export async function renameNode(request: IRenameInfo): Promise<void> {

    const response = await fetch("http://localhost:5152/api/Files/rename", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(request)
    });

    if (!response.ok) {throw new Error("Failed to rename node")}

}

export async function deleteNode(path: string, isDirectory: boolean): Promise<void> {

    const encodedPath = encodeURIComponent(path);

    const response = await fetch(`http://localhost:5152/api/Files?path=${encodedPath}&isDirectory=${isDirectory}`, {
        method: "DELETE"
    })

    if (!response.ok) {throw new Error("Failed to delete node")}

}