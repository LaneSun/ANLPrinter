// http.createServer(function(req , res){
//     let imaps = req.url.split("/");
//     let maps = [];
//     imaps.forEach(function(m){
//         if(m){maps.push(m)}
//     });
//
//     switch (maps[0]||"index") {
//         case "upload":
//             break;
//         default:
//             let str = fs.readFileSync("./index.html");
//             res.writeHead(200, {'Content-Type': 'text/html'});
//             res.end(str, "utf-8");
//             break;
//     }
//     //     case "upl":
//     //         let str = fs.readFileSync("./upload.html");
//     //         res.writeHead(200, { 'Content-Type': 'text/html' });
//     //         res.end(str , "utf-8");
//     //         break;
//     //
//     //     case "upload":
//     //         break;
//     //
//     //     default :
//     //         let path = maps.join("/");
//     //         let value = "";
//     //         let filename = maps[maps.length-1];
//     //         let checkReg = /^.+.(gif|png|jpg|css|js)+$/;
//     //
//     //         if(maps[0]==="databox"){
//     //             checkReg = /.*/
//     //         }
//     //
//     //         if(checkReg.test(filename)){
//     //             try{
//     //                 value = fs.readFileSync(path)
//     //             }catch(e){}
//     //         }
//     //
//     //         if(value){
//     //             res.end(value);
//     //         }else {
//     //             res.writeHead(404);
//     //             res.end('');
//     //         }
//     //         break;
//     // }
//
//
//
// }).listen(PORT);

let formidable = require('formidable'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    { exec } = require('child_process');

const PCHTML = fs.readFileSync("client/app.html");
const MOHTML = fs.readFileSync("client/mapp.html");
const UIKIT = fs.readFileSync("client/uikit.css");
const SITE = "localhost";
const PORT = 9000;

let current_id = JSON.parse(fs.readFileSync("current-id.cache"));
console.log(current_id);

http.createServer(function(req, res) {
    if (req.url === '/upload' && req.method.toLowerCase() === 'post') {
        // parse a file upload
        let form = new formidable.IncomingForm();
        form.uploadDir = "uploads";

        form.parse(req, function(err, fields, files) {
            let oldpath = files.upload.path;
            let newpath = path.join(path.dirname(oldpath),current_id.toString()+path.extname(files.upload.name));

            fs.rename(oldpath,newpath,(err)=>{
                if(err) throw err;
                return 0;
                // res.writeHead(200,{"Content-Type":"text/html;charset=UTF8"});
            });
            if (path.extname(files.upload.name).match(/(doc|docx|html|htm|xlsx|xls)/)){
                exec("convert-doc " + newpath + " " + path.join("pdf-caches",current_id.toString()+".pdf") + "&&" + "lp " + path.join("pdf-caches",current_id.toString()+".pdf"));
                current_id++;
            } else if (path.extname(files.upload.name).match(/(pdf)/)) {
                fs.copyFile(newpath,path.join("../pdf-caches",current_id.toString()+".pdf"),()=>{});
                current_id++;

            }
            fs.writeFileSync("current-id.cache",current_id.toString());
            // res.writeHead(200, {'content-type': 'text/plain'});
            // res.write('received upload:\n\n');
            // res.end(util.inspect({fields: fields, files: files}));
        });
    }

    // show a file upload form
    
    switch (req.url) {
        case "/uikit.css":
            res.writeHead(200, {'content-type':  "text/css"});
            res.end(UIKIT);
            break;
        case "/upload":
            res.writeHead(200, {'content-type': 'text/html'});
            res.end("<h1 style='text-align: center'>Success!</h1>");
            break;
        default:
            // console.log(req.headers);
            let deviceAgent = req.headers['user-agent'].toLowerCase();
            let agentID = deviceAgent.match(/(iphone|ipod|android)/);
            if(agentID){
                res.writeHead(200, {'content-type': 'text/html'});
                res.end(MOHTML);
            }else{
                res.writeHead(200, {'content-type': 'text/html'});
                res.end(PCHTML);
            }

            break;
    }

}).listen(PORT);

console.log("Server running at " + SITE + ":" + PORT);