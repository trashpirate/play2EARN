import fs from "fs";
import process from "process";
import {readdir} from "fs/promises";

const url = "ipfs://bafybeigpd4tpmhgmkxwrm6hzlzgfpvuldnt27e5hayxkdhhxpfg42ipdcu/";

interface metaData {
  name: string;
  description: string;
  image: string;
  attributes: any[];
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

async function main() {


  let index = 0;

  const imageList = await readDir("collection/images");

  // randomize remaining images and write metadata
  const randomizedList = shuffle(imageList);

  // write logs
  fs.writeFile('./collection/logs.txt', "", function (err) {});

  randomizedList.forEach((file) => {
    const [win, name] = file.split("/");

    // write logs
    fs.appendFile('./collection/logs.txt', index + ", " + file + "\n", function (err) {});

    // write metadata file
    let json: metaData;
    json = {
      name: "Card #" + (index).toString(),
      description: win == 'ZERO' ? 'Too bad - no win!' : `Congrats, you won! You can claim ${ win } EARN tokens!`,
      image:
        url +
        win + '/' + name.toString(),
      attributes: [
        {
          trait_type: "WIN",
          value: win,
        },
      ],
    };

    fs.writeFileSync(
      "./collection/metadata/" + index,
      JSON.stringify(json)
    );

    index++;
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
