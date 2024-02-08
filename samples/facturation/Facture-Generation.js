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

    //TODO: DOESN'T WORK -> FIX All the type() calls (see comments below)
    // Reste à faire
    //  - Remplir les derniers champs de la facture
    //  - Télécharger la facture (et réussir à la récupérer de browserless)
    //  - Télécharger le CRA
    //  - Intégrer le tout dans n8n / Notion et envoyer un mail

    // -- Arguments --

    const nbJoursTravailles = 20; //TODO: A remplir

    // -- Constantes --

    const login = "XXX";
    const password = "XXX";
    const client = "XXX"

    const NB_JOURS_POUR_PAIEMENT = 45;
    const CLIENT_OPTION_NUMBER = 1;
    const INTITULE_MISSION = "XXX";
    const TJM = 10;

    // -- Fonctions --

    async function rejectCookiesConsentement(page) {
        await page.click('#axeptio_btn_dismiss', { timeout: 10000 }).catch(() => console.log("No cookies consentement to reject"));
    }

    function getLimitDateForPaiement() {
        let date = new Date();
        date.setDate(date.getDate() + NB_JOURS_POUR_PAIEMENT);
        return date;
    }

    async function loginToSite(login, password, page) {
        await page.goto("https://apps.tiime.fr/signin")
        await pause(10)
        await rejectCookiesConsentement(page)
        await pause(1)

        await page.type('input[id="email"]', login)
        await page.type('input[id="password"]', password)
        await page.click('button[type="submit"]')

        await pause(10)
    }

    async function goToFacturationPage(page) {
        await page.goto("https://apps.tiime.fr/companies/125707/invoice/invoices/new")
        await pause(10)
    }

    async function fillFactureFields(page, client) {

        // Select the bill options
        await page.click('mat-checkbox[formcontrolname="sirenOrSiretEnabled"] input')
        await page.click('mat-radio-group[formcontrolname="template"] input[value="advanced"]')
        await page.click('mat-checkbox[formcontrolname="bankDetailEnabled"] input')

        // Select the client data
        await page.click('div.invoicing-client-container input[formcontrolname="name"]')
        await page.click('#mat-option-' + CLIENT_OPTION_NUMBER)
        await pause(1)

        // Fill the limit date
        await page.click('app-invoice-due-date tiime-select div.dropdown-toggle')
        await pause(1)
        // -----

        // await page.waitForSelector('div[data-cy="dropdown__option"]')
        var options = await page.$$('div[data-cy="dropdown__option"]')
        await options[4].click()


        // -----
        // await page.$$('div[data-cy="dropdown__option"]')[4].click() //TODO: Plus tard -> scraper exactement l'insertion d'une date précise de limite de paiement
        await pause(1)

        // Fill the mission details
        await page.type('app-advanced-line textarea', INTITULE_MISSION) //TODO: DOESN'T WORK -> FIX All the type() calls
        await page.type('app-advanced-line input[formcontrolname="quantity"]', nbJoursTravailles.toString())
        await page.click('app-advanced-line tiime-select[formcontrolname="id"] > div')
        await pause(1)
        await page.$$('div[id*=mat-select-]').filter((element) => element.textContent.trim() === "jour")[0].click()
        await pause(1)
        await page.type('app-advanced-line input[formcontrolname="unitAmount"]', TJM.toString())

        await page.type('input[name="client"]', client)
        await page.keyboard.press('Enter')
        await pause(1)
    }

    async function downloadFacture(page) {
        await page.click('button[type="submit"]')
        await pause(3)
        await page.click('a[href$=".pdf"]')
    }

    async function pause(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    // -- Main code --

    let itemsResult = []

    await loginToSite(login, password, page)
    await goToFacturationPage(page)
    await fillFactureFields(page, client)
    // await downloadFacture(page)

    let data = {
        items : itemsResult
    }

    console.log("End of processing. Result below\n\n-----------------\n\n" + JSON.stringify(data, null, 2))
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