import fs from "fs";
import process from "process";
import {readdir} from "fs/promises";

interface metaData {
    name: string;
    description: string;
    image: string;
    attributes: any[];
}

async function getFileList(dirName: string) {
    let files: string[] = [];
    const items = await readdir(dirName, {withFileTypes: true});

    for (const item of items) {
        if (item.isDirectory()) {
            files = [...files, ...(await getFileList(`${ dirName }/${ item.name }`))];
        } else {
            files.push(`${ dirName }/${ item.name }`);
        }
    }

    return files;
}

async function readDir(dirName: string) {
    let files: string[] = [];
    const fileList = await getFileList(dirName);

    for (let index = 0; index < fileList.length; index++) {
        const file = fileList[index];
        const relPath = file.replace(dirName + "/", "");
        files.push(relPath);
    }
    return files;
}

function shuffle(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

async function main() {

    const folder = "collection/";
    const winZero = "0.jpg";
    const win100K = "100K.jpg";
    const win200K = "200K.jpg";
    const win600K = "600K.jpg";

    const numZero = 50;
    const num100K = 30;
    const num200K = 15;
    const num600K = 5;

    for (let index = 0; index < numZero; index++) {
        fs.copyFileSync(folder + winZero, folder + 'images/ZERO/' + index.toString() + ".png");
    }
    for (let index = 0; index < num100K; index++) {
        fs.copyFileSync(folder + win100K, folder + 'images/100K/' + index.toString() + ".png");
    }
    for (let index = 0; index < num200K; index++) {
        fs.copyFileSync(folder + win200K, folder + 'images/200K/' + index.toString() + ".png");
    }
    for (let index = 0; index < num600K; index++) {
        fs.copyFileSync(folder + win600K, folder + 'images/600K/' + index.toString() + ".png");
    }

    // const imageList = await readDir(filePath);
    // console.log(imageList);

    // imageList.forEach((file) => {
    //     // Rename the file
    //     fs.renameSync(filePath + '/' + file, filePath + "/flame_" + folder.toLowerCase() + "_" + index + ".png");

    //     index++;
    // });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
