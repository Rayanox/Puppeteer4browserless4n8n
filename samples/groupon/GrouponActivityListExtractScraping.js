import puppeteer from 'puppeteer';
import {readVariableFile} from '../../init.mjs';

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

    let PROBABLY_BROKEN_SCRAPPING_NUM_ITERATION_PAGE = 15;

    async function extractDataFromPage(page, itemsResult) {
        await page.waitForSelector('#pull-deal-feed > figure', { timeout: 10000 });
        let domItems = await page.$$('#pull-deal-feed > figure');
        for (const item of domItems) {
            //await page.evaluate(item => console.log(item.innerHTML + "\n"), item);

            let title = await item.$eval('div.cui-udc-title', element => element.textContent);

            itemsResult.push({
                title : await item.$eval('div.cui-udc-title', element => element.textContent),
                price : await item.$eval('div.cui-price-discount', element => element.textContent).catch(() => ""),
                priceBefore : await item.$eval('div.cui-price-original', element => element.textContent).catch(() => ""),
                priceWithCodePromo : await item.$eval('div.cui-purple-price', element => element.textContent).catch(() => ""),
                reduction : await item.$eval('div.cui-detail-badge', element => element.textContent).catch(() => ""),
                imageUrl : await item.$eval('img.cui-image', element => element.src).catch(() => ""),
                link : await item.$eval('a', element => element.href).catch(() => "")
            })
        }
    }

    async function goNextPage(page) {
        let nextButton = await page.$('a[rel="next"]').catch(() => false)
        if (nextButton) {
            // await page.goto(nextButton)
            await nextButton.click()
            return true
        } else {
            console.log("Fin de la pagination")
            return false
        }
    }

    async function pause(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    // --- end of functions, start of the main code ---

    await page.goto("https://www.groupon.fr/bon-plan/loisirs-et-sorties")

    // -- Init operations --

    await page.waitForSelector('#icon-x', { timeout: 5000 }).catch(() => console.log("No popup to wait"));
    await page.click('#icon-x').catch(() => console.log("No popup to close"));
    await page.evaluate(() => {
        document.getElementById("gdpr-bottom-banner").remove()
    }).catch(() => console.log("No banner to remove"));

    // -- Main code

    const itemsResult = []

    let numPage = 1, repeatTime = 0
    do {
        await pause(10)
        do {
            try {
                await extractDataFromPage(page, itemsResult)
                console.log("Page scraped = " + numPage++)
                repeatTime = 0

                /*
                if(numPage === 15) {
                    await page.screenshot({path: 'screenshot-test-R.png'})
                    console.log("Screenshot taken")
                }*/

                if(numPage >= PROBABLY_BROKEN_SCRAPPING_NUM_ITERATION_PAGE) {
                    console.log("Throwing exception because limit iterations is reached. Limit =  " + PROBABLY_BROKEN_SCRAPPING_NUM_ITERATION_PAGE)
                    var exceptionText = "Probably broken scrapping"
                }
            } catch (e) {
                console.log("Error on Groupon site.")
                repeatTime++
            }

            if(exceptionText) {
                throw new Error(exceptionText)
            }

            if (repeatTime > 3) {
                console.log("Too many errors. Stopping the process.")
                break
            }
            if (repeatTime > 0) {
                console.log("Reloading the page n°" + numPage)
            }
        } while (repeatTime > 0)

        if (repeatTime !== 0) {
            break
        }

        if(numPage > 60) {
            throw new Error("Ultimate limit reached (60 pages)")
        }
    }while (await goNextPage(page))

    let data = {
        items : itemsResult
    }

    console.log("End of processing. Result below\n\n-----------------\n\n" + JSON.stringify(data))
    // console.log("End of processing. Returning result...")


    /* ---------------------------------------------------- */
    //
    // End of the code to copy to n8n function code node
    //
    /* ---------------------------------------------------- */

    if (!keepBrowserOpen) {
        await browser.close();
    }
})();