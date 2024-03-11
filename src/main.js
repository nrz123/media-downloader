const { app, ipcMain, BrowserWindow,session } = require('electron')
const fs = require('fs');
const isDev = false
let appPath = app.getAppPath()
let videoMap = {}
ipcMain.on('video', async (event, uid, buffer) => {
    if (!videoMap[event.sender]) {
        let webContents = event.sender
        let fstreams = videoMap[webContents] = {}
        webContents.on('destroyed', () => {
            for (let uid in fstreams) {
                fstreams[uid].end()
                delete fstreams[uid]
            }
            delete videoMap[webContents]
        })
    }
    let fstreams = videoMap[event.sender]
    if (!fstreams[uid]) {
        fs.existsSync("media")||fs.mkdirSync('media')
        fstreams[uid] = fs.createWriteStream('media/'+uid + '.mp4')
    }
    let fBuffer = Buffer.from(buffer)
    fstreams[uid].write(fBuffer)
    event.returnValue = true
})
ipcMain.on('web', (event, url) => {
    let win = new BrowserWindow({
        width: 1600,
        height: 1000,
        webPreferences: {
            contextIsolation: false,
            preload: appPath + '/src/preload.js'
        }
    })
    win.webContents.setWindowOpenHandler(detail => {
        let { url } = detail
        view.webContents.executeJavaScript('window.runApi.LoadOptions()').then(loadOptions => {
            view.webContents.loadURL(url, loadOptions ? {
                postData: [{
                    type: "rawData",
                    bytes: Buffer.from(encode(loadOptions.data, loadOptions.charset).replace(/%3D/g, "=").replace(/%26/g, "&"))
                }],
                extraHeaders: "Content-Type:" + loadOptions.enctype
            } : {})
        })
        return { action: 'deny' }
    })
    let init = w => {
        w.webContents.on('did-create-window', newWin => {
            init(newWin)
        })
        w.webContents.setWindowOpenHandler(data => {
            return {
                action: "allow", overrideBrowserWindowOptions: {
                    width: 1600,
                    height: 1000,
                    webPreferences: {
                        contextIsolation: false,
                        preload: appPath + '/src/preload.js'
                    }
                }
            }
        })
    }
    init(win)
    win.webContents.loadURL(url)
})
const createWindow = () => {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['User-Agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        callback({ requestHeaders: details.requestHeaders })
    })
    new BrowserWindow({
        width: 1600,
        height: 1000,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    }).webContents.loadURL(isDev ? 'http://127.0.0.1:3005/' : 'file:///' + appPath + '/build/index.html')
}
app.whenReady().then(createWindow)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) init()
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})