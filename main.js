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
const exec = require('child_process').exec;

let mb = menubar()
let bingUrl = 'https://www.bing.com/HPImageArchive.aspx?format=js&n=1';

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

mb.on('ready', function ready () {
    request(bingUrl, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            let _JSON = JSON.parse(body)
            let image = _JSON.images[0]

            let _local = "./images/" + image.hsh + ".jpg"
            let _remote = "http://www.bing.com" + image.url

            download(_remote, _local, function() {
                exec("sqlite3 ~/Library/Application\\ Support/Dock/desktoppicture.db \"update data set value = '${PWD}/images/8ff34f720b6de1856955ec442fefc149.jpg'\" && killall Dock", function(error, stdout, stderr) {
                    console.log("Background Set:" , stdout)
                });

            })
        } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode)
        }
    })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
