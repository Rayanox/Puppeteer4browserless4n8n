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


    page.goto("https://www.groupon.fr/bon-plan/loisirs-et-sorties")

    await pause(5)
    await page.click('#icon-x').catch(() => console.log("No popup to close"));
    await pause(5)

    await page.keyboard.press('Tab')
    await pause(1)
    await page.keyboard.press('Tab')
    await pause(1)
    await page.keyboard.press('Tab')
    await pause(1)
    await page.keyboard.press('Tab')
    await pause(1)
    await page.keyboard.press('Enter')

    console.log("End of process.")



    /* ---------------------------------------------------- */
    //
    // End of the code to copy to n8n function code node
    //
    /* ---------------------------------------------------- */

    if (!keepBrowserOpen) {
        await browser.close();
    }
})();