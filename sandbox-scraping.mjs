import puppeteer from 'puppeteer';
import {readVariableFile} from './init.mjs';

const remoteBrowserlessToken = await readVariableFile("UnversionedToken.txt");
const remoteBrowserlessHost = await readVariableFile("UnversionedRemoteBrowserlessHost.txt");

console.log("Token: " + remoteBrowserlessToken);
console.log("Host: " + remoteBrowserlessHost);

(async () => {
    const browser = await puppeteer.launch({headless: false});
    //const browser = await puppeteer.connect({browserWSEndpoint: 'ws://'+remoteBrowserlessHost+':3000?token=' +remoteBrowserlessToken});

    console.log("\n\nConnected to browser. Starting to scrap...\n\n");

    /* ---------------------------------------------------- */
    //
    // Start of the code to copy to n8n function code node
    //
    /* ---------------------------------------------------- */


    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto('https://developer.chrome.com/');

    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    // Type into search box
    await page.type('.devsite-search-field', 'automate beyond recorder');

    // Wait and click on first result
    const searchResultSelector = '.devsite-result-item-link';
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);

    // Locate the full title with a unique string
    const textSelector = await page.waitForSelector(
        'text/Customize and automate'
    );
    const fullTitle = await textSelector?.evaluate(el => el.textContent);

    // Print the full title
    console.log('The title of this blog post is "%s".', fullTitle);



    /* ---------------------------------------------------- */
    //
    // End of the code to copy to n8n function code node
    //
    /* ---------------------------------------------------- */

    await browser.close();
})();