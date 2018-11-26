//const socket = require("./socket-server.js");
const http = require("./http-server.js");

const SITE = "localhost";
const HTTP_PORT = 9000;
const SOCKET_PORT = 3000;

http.init(HTTP_PORT,SITE);
//socket.init(SOCKET_PORT,SITE);
