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


function getDirs(path) {
    return fs.readdirSync(path,  { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
}


function getFiles(path) {
    return fs.readdirSync(path,  { withFileTypes: true }).filter(d => d.isFile()).map(d => d.name);
}


function printDirs(dirs) {
    for (let index = 0; index < dirs.length; index++) console.log(`${index + 1}. ${dirs[index]}`);
}


function getFileSize(path, lower) {
    return sizeBytes(fs.statSync(path).size, lower);
}


function sizeBytes(bytes, lower) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return `${parseFloat((bytes / Math.pow(1000, index)).toFixed(2))}${lower ? sizes[index].toLowerCase() : sizes[index]}`;
}


/**
 * Converts the octal representation of permissions to the alphabet signature format.
 * @param {string} permissions - The permissions in octal representation.
 * @returns {string} - The permissions in alphabet signature format.
 */
function convertToAlphabetSignature(permissions) {
    let alphabetSignature = "";

    // Parse the octal permissions
    const userPermissions = permissions.slice(-3);
    const groupPermissions = permissions.slice(-6, -3);
    const otherPermissions = permissions.slice(-9);

    // Convert each permission set to the corresponding alphabet signature format
    alphabetSignature += userPermissions[0] === "0" ? "-" : "r";
    alphabetSignature += userPermissions[1] === "0" ? "-" : "w";
    alphabetSignature += userPermissions[2] === "0" ? "-" : "x";
    alphabetSignature += groupPermissions[0] === "0" ? "-" : "r";
    alphabetSignature += groupPermissions[1] === "0" ? "-" : "w";
    alphabetSignature += groupPermissions[2] === "0" ? "-" : "x";
    alphabetSignature += otherPermissions[0] === "0" ? "-" : "r";
    alphabetSignature += otherPermissions[1] === "0" ? "-" : "w";
    alphabetSignature += otherPermissions[2] === "0" ? "-" : "x";

    return alphabetSignature;
}


// Function to get file or directory permissions
function getFilePermissions(path) {
    try {
      const stats = fs.statSync(path);
      const mode = stats.mode;
  
      // Convert mode to octal representation
      const permissions = mode.toString(8);
  
      return convertToAlphabetSignature(permissions);
    } catch (error) {
      console.error(`Error getting permissions for ${path}: ${error}`);
      return null;
    }
}


// Function to get file or directory creation and modification dates
function getFileDates(path) {
    try {
      const stats = fs.statSync(path);
      const createdAt = stats.birthtime;
      const modifiedAt = stats.mtime;
  
      return {
        created: createdAt,
        modified: modifiedAt,
      };
    } catch (error) {
      console.error(`Error getting dates for ${path}: ${error}`);
      return null;
    }
}


module.exports = {
    getAllFiles: getAllFiles,
    getTotalSize: getTotalSize,
    getDirs: getDirs,
    getFiles: getFiles,
    printDirs: printDirs,
    getFileSize: getFileSize,
    sizeBytes: sizeBytes,
    getFilePermissions: getFilePermissions,
    getFileDates: getFileDates
}