const { app, BrowserWindow, dialog } = require("electron");

const createWindow = () => {
    // Create the browser window.
    let mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    // For custom menu use -> Menu.setApplicationMenu(appMenu);
    // and load the index.html of the app.
    mainWindow.loadFile("index.html");
};

const getFileFromUser = () => {
    return dialog.showOpenDialog({
        title: "Open JSON file",
        filters: [{
            name: "json",
            extensions: ["json"]
        }],
        properties: ["openFile"]
    });
};

const showSaveDialog = () => {
    return dialog.showSaveDialog({
        title: "Save file",
        defaultPath: app.getPath("desktop"),
        filters: [
            { name: "JSON Files", extensions: ["json"] }
        ]
    });
};

app
    .whenReady()
    .then(createWindow);
/*
    send an event
    const openFile = (file) => {
        const content = fs.readFileSync(file).toString();
        // Add to recent documents
        app.addRecentDocument(file);
        mainWindow.webContents.send('file-opened', file, content);
    }
*/
module.exports = {
    getFileFromUser,
    showSaveDialog
};
