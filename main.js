const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const request = require('request')
const menubar = require('menubar')

const http = require('http');
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mb = menubar()
let bingUrl = 'https://www.bing.com/HPImageArchive.aspx?format=js&n=1';

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

mb.on('ready', function ready () {
    console.log('app is ready')

    request(bingUrl, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            let _JSON = JSON.parse(body)
            let image = _JSON.images[0]

            console.log("Got Image: ", image.url)

            let _local = "./images/" + image.hsh + ".jpg"
            let _remote = "http://www.bing.com" + image.url

            console.log("Local Image: ", _local)
            console.log("Remote Image: ", _remote)

            download(_remote, _local, function() {
                var exec = require('child_process').exec;

                exec("sqlite3 ~/Library/Application\\ Support/Dock/desktoppicture.db \"update data set value = '${PWD}/images/8ff34f720b6de1856955ec442fefc149.jpg'\" && killall Dock", function(error, stdout, stderr) {
                    console.log("Background Set:" , stdout)
                });

            })
        } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode)
        }
    })
})

app.on('ready', function () {

})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
