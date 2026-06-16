
const {app, BrowserWindow, Tray, Menu} = require("electron");
const path = require("node:path");
const {spawn} = require("child_process");

let backend;
let mainWindow;
let tray = null;
let isQuitting = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadURL("http://localhost:5173");

    mainWindow.on("close", (event) => {

        if (!isQuitting) {

            event.preventDefault();
            mainWindow.hide();

        }
    })

    const icon_path = path.join(__dirname, "copy.png");
    tray = new Tray(icon_path);

    const menu = new Menu.buildFromTemplate([
        {
            label: "Show App",
            click: () => mainWindow.show()
        },
        {
            label: "Quit",
            click: () => app.quit()
        }
    ]);

    tray.setToolTip("My Notes App");
    tray.setContextMenu(menu);

    tray.on("click", (event) => {
        if (!mainWindow.isVisible()) {
            mainWindow.show();
        }
    })
}

function startBackend() {
    backend = spawn("dotnet", ["run", "--project", "./NotesApp/NotesApp"], {
        stdio: "pipe"
    })

    backend.stdout.on("data", (data) => {
        console.log(`Backend: ${data}`);
    })

    backend.stderr.on("data", (data) => {
        console.error(`Backend error: ${data}`)
    })
}

app.whenReady().then(() => {
    startBackend();
    createWindow();
});

app.on("before-quit", () => {
    isQuitting = true;
    if (backend) backend.kill();
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
})