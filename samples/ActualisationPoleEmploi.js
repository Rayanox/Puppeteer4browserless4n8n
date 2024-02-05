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


    const poleEmploiLogin = "TO_SET_PLEASE_WITH_YOUR_VALUE";
    const poleEmploiPassword = "TO_SET_PLEASE_WITH_YOUR_VALUE";
    const timeoutSecondsAtEachPage = 8; // TODO: Passer à 15
    const enableReset = true;

    // ----- Input au dessus -----


    async function setValue(page, selector, valueAToSet) {
        await page.waitForSelector(selector);
        await page.type(selector, valueAToSet);
    }

    async function click(page, selector, timeout = 10000) {
        await page.waitForSelector(selector, { timeout: timeout });
        await page.click(selector);
    }

    async function clickHack(page, selector, timeout = 30000) {
        await page.evaluate((selectorForClick) => {
            document.querySelector(selectorForClick).click();
        } , selector);
    }

    async function removeConsentement(page) {
        await page.waitForSelector('pe-cookies');
        await page.evaluate(() => {
            document.querySelector('pe-cookies').remove();
        });
    }

    async function removeConsentementHack(page) {
        await page.evaluate(() => {
            document.querySelector('pe-cookies').remove();
            document.querySelector('pe-cookies').remove();
        });
    }

    async function pause(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    // --- end of functions, start of the main code ---

    let reset = false;

    do {

        try {
            // Navigate the page to a URL
            await page.goto('https://www.pole-emploi.fr/accueil/');

            await removeConsentement(page);
            await click(page, 'button.know_button.primaryButton.know_button-has-background');
            await click(page, 'button.btn.btn-header.btn-account.dropdown-toggle');
            await click(page, 'a.btn.btn-header.menu-link-candidat');


            await pause(timeoutSecondsAtEachPage);
            await removeConsentement(page);
            await setValue(page, '#identifiant', poleEmploiLogin);
            await click(page, '#submit');
            await setValue(page, '#password', poleEmploiPassword);
            await click(page, '#submit');

            await pause(timeoutSecondsAtEachPage);
            await removeConsentement(page);
            await click(page, 'situation-utilisateur #step2 > li:nth-of-type(1) > a');

            try {
                await pause(timeoutSecondsAtEachPage);
                await removeConsentementHack(page);
                await click(page, '#btn-declare-actu');
            } catch (e) {
                console.error(e);
                console.log("\nL'erreur est peut-etre liée à une reprise d'actualisation déjà commencée");
            }

            await pause(timeoutSecondsAtEachPage);
            await clickHack(page, '#action-activite-non');
            await click(page, '#submit-activites');

            await pause(timeoutSecondsAtEachPage);
            await clickHack(page, '#question-formation-non');
            await clickHack(page, '#question-pam-non');
            await clickHack(page, '#question-pension-non');
            await click(page, '#submit-situation-particuliere');

            await pause(timeoutSecondsAtEachPage);
            await clickHack(page, '#question-maintienInscription-oui');
            //await click(page, '#btn-valider-actu'); // TODO: le dernier a décommenter

            await pause(timeoutSecondsAtEachPage);
            await page.goto('https://candidat.pole-emploi.fr/espacepersonnel/');
            await pause(timeoutSecondsAtEachPage);

            await removeConsentement(page);
            let selectorCheckSituation = 'situation-utilisateur #step2 > li:nth-of-type(1) > a[href="https://actualisationenrichie.pole-emploi.fr"]';
            if (await page.$(selectorCheckSituation) !== null) {
                console.log("\nL'actualisation a échoué");
                //TODO : Retourner un code d'echec
            }
            else {
                console.log("\nL'actualisation a réussi");
                //TODO : Retourner un code de succès
            }


            reset = false;
        } catch (e) {
            console.error(e);
            reset = !reset;
        }

        if(reset && enableReset) {
            console.log("\n\nResetting the page...\n\n");
        }

    } while (reset && enableReset);

    /* ---------------------------------------------------- */
    //
    // End of the code to copy to n8n function code node
    //
    /* ---------------------------------------------------- */

    if (!keepBrowserOpen) {
        await browser.close();
    }
})();