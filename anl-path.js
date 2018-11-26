const path = require('path');

exports.getBase = path.basename;
exports.join = path.join;
exports.extname = path.extname;
exports.getReal = (url) => {return url.substring(1);};
