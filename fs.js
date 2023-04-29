const fs = require("fs");
const path = require("path");

const getAllFiles = function(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join(__dirname, dirPath, file))
        }
    });

    return arrayOfFiles;
}


const getTotalSize = (directoryPath) => {
    const arrayOfFiles = getAllFiles(directoryPath);
    let totalSize = 0;
    arrayOfFiles.forEach((filePath) => { totalSize += fs.statSync(filePath).size });
    return totalSize;
}


module.exports = {
    getAllFiles: getAllFiles,
    getTotalSize: getTotalSize
}