import fs from 'fs';

export function readVariableFile(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, inputD) => {
            if (err) {
                console.log("The file "+fileName+" was not found -> no retrieval of the unversioned token was performed (refer to the README.md for more information).");
                //reject(err); // En cas d'erreur, rejeter la promesse avec l'erreur
                resolve('?');
            } else {
                const result = inputD.toString();
                resolve(result); // En cas de succès, résoudre la promesse avec le résultat
            }
        });
    });
}
