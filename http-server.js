const formidable = require('formidable'),
  http = require('http'),
  fs = require('fs'),
  path = require("./anl-path");

const UPLOAD_DIR = "upload";
const ALLOW_TYPE = /(pdf|doc|docx|xls|xlsx)/;
const MAIN_TYPE = /(pdf)/;
let INDEX = 0;
let CACHE = new Map();
exports.server = undefined;
exports.init = (port, host) => {
    INDEX = JSON.parse(fs.readFileSync("cache/current-id.cache"));
    exports.server = http.createServer(requestHandle).listen(port, host, ()=>{});
};
let requestHandle = (req, res) => {
    let url = path.getReal(req.url);
    switch (url) {
      case "/upload-file":
        uploadHandle(req, res);
        break;
      default:
        getHandle(req, res);
        break;
    }
};
let uploadHandle = (req, res) => {
    if (req.method.toLowerCase() === "post") {
        let form = new formidable.IncomingForm();
        form.uploadDir = UPLOAD_DIR;
        form.parse(req, function(err, fields, files) {
            let oldpath = files.upload.path;
            let newpath = getNewPath(oldpath,INDEX);
            let extname = path.extname(files.upload.name);
            if (extname.match(ALLOW_TYPE)){
                renameFile(oldpath, newpath, (err) => {   
                    if (!extname.match(MAIN_TYPE)) {
                        convertFile(newpath);
                    }
                    updateIndex();
                });
            }
            res.writeHead(200, {'content-type': 'text/plain'});
            res.end('received');
        });
    }
};
let getCache = (path) => {
    try {
        if (CACHE.has(path)) {
            return CACHE.get(path);
        } else {
            CACHE.set(path,fs.readFileSync(path));
            return CACHE.get(path);
        }
    } catch (err) {
        console.error("Cannot found file: " + path);
        return "Cannot found file: " + path;
    }
};
let updateIndex = () => {
    INDEX++;
    fs.writeFileSync("cache/current-id.cache",INDEX.toString());
    
};
let getNewPath = (oldpath,id) => {
    return path.join(path.dirname(oldpath), INDEX + path.extname(oldpath));
};
let renameFile = (oldpath,newpath,handle) => {
    fs.rename(oldpath,newpath,handle);
};
let getHandle = (req, res) => {
    let url = path.getReal(req.url);
    let file = undefined;
    console.log("Get File: " + url);
    if (path.getBase(url) === "") {
        file = getCache("client/app.html");
        req.url = "client/app.html";
    } else if (url) {
        file = getCache(url);
    } else {
        file = getCache("client/app.html");
        req.url = "client/app.html";
    }
    res.writeHead(200, req.url);
    res.end(file); 
};
let getHead = (url) => {
    let extname = path.extname(url);
    switch (extname) {
      case "html":
        return {'content-type': 'text/html'};
        break;
      case "css":
        return {'content-type': 'text/css'};
        break;
      case "js":
        return {'content-type': 'text/javascript'};
        break;
      default:
        return {'content-type': 'text/plain'};
        break;
    }
};
