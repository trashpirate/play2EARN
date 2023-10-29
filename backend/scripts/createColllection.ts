import fs from "fs";
import process from "process";

async function main() {

    const folder = "collection/";
    const winZero = "0.jpg";
    const win100K = "100K.jpg";
    const win200K = "200K.jpg";
    const win600K = "600K.jpg";

    const numZero = 5000;
    const num100K = 3000;
    const num200K = 1500;
    const num600K = 500;

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

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
