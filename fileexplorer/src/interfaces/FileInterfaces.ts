
export interface IFileInfo {
    name: string,
    path: string,
    isDirectory: boolean,
    size: number | null,
    lastModified: string
}

export interface IRenameInfo {
    oldName: string,
    newName: string,
    path: string,
    isDirectory: boolean
}