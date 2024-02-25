import puppeteer from 'puppeteer';
import {readVariableFile} from '../init.mjs';

const remoteBrowserlessToken = await readVariableFile("UnversionedToken.txt");
const remoteBrowserlessHost = await readVariableFile("UnversionedRemoteBrowserlessHost.txt");

console.log("Token: " + remoteBrowserlessToken);
console.log("Host: " + remoteBrowserlessHost);

const keepBrowserOpen = true;

(async () => {
    const browser = await puppeteer.launch({headless: false});
    //const browser = await puppeteer.connect({browserWSEndpoint: 'ws://'+remoteBrowserlessHost+':3000?token=' +remoteBrowserlessToken});

    console.log("\n\nConnected to browser. Starting to scrap...\n\n");

    const page = await browser.newPage();

    /* ---------------------------------------------------- */
    //
    // Start of the code to copy to n8n function code node
    //
    /* ---------------------------------------------------- */


    async function pause(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    // --- end of functions, start of the main code ---

    await page.goto("https://fr.egamersworld.com/rocketleague/team/team-vitality-4yBZVk36F")
    await pause(5)

    let xpathFuturMatches = "//h2[text()=\"Matchs à venir Vitality\"]/following-sibling::a[following::h2[text()=\"Matchs récents Vitality\"]]"
    // let xpathFuturMatches = "//h2[text()=\"Matchs à venir Vitality\" or text()=\"Matchs récents Vitality\"]"
    let result = await page.$x(xpathFuturMatches)

    let data = {
        result : []
    }

    for (const element of result) {
        let innerHTML = await page.evaluate(result => result.innerHTML, element);
        // console.log(innerHTML)
        // console.log("\n-----\n")
        data.result.push(innerHTML)
    }

    console.log("Fin, résultat:\n\n" + JSON.stringify(data, null, 2))



    /* ---------------------------------------------------- */
    //
    // End of the code to copy to n8n function code node
    //
    /* ---------------------------------------------------- */

    if (!keepBrowserOpen) {
        await browser.close();
    }
})();