const {ipcRenderer} = require('electron')
function e() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
    return (e()+e()+e()+e()+e()+e()+e()+e());
}
let createObjectURL=URL.createObjectURL
URL.createObjectURL=function(obj){
    if(obj instanceof MediaSource){
        let addSourceBuffer=obj.addSourceBuffer
        obj.addSourceBuffer=function(mimeType){
            let sb=addSourceBuffer.apply(this,arguments)
            let uid=guid()
            let appendBuffer=sb.appendBuffer
            sb.appendBuffer=function(source){
                ipcRenderer.sendSync('video',uid,source)
                return appendBuffer.apply(this,arguments)
            }
            return sb
        }
    }
    return createObjectURL.apply(this,arguments)
}