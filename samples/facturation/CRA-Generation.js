import puppeteer from 'puppeteer';
import {readVariableFile} from '../../init.mjs';

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

    const inputDateMois = "03/2022";
    const arrayJoursAbsences = ["07", 25];
    const arrayJoursFeries = ["10"]; //TODO: Aller recup les jours feries + les jours d'absence du mois. Puis générer le PDF du CRA et l'injecter dans Notion

    // ----- Input au dessus -----

    const
        companyToSet = 'My company',
        nameToSet = 'Rayane BEN-HMIDANE',
        addressToSet = '60 Rue du destin - 75000 Paris',
        emailToSet = 'hellow-my-friend@my-mail.fr',

        clientNameToSet = 'A client :)',
        clientAddressToSet = 'And his address :)';

    const mapMonths = { "01": "0", "02": "1", "03": "2", "04": "3", "05": "4", "06": "5", "07": "6", "08": "7", "09": "8", "10": "9", "11": "10", "12": "11" };

    let mois = mapMonths[inputDateMois.split('/')[0]];
    let annee = inputDateMois.split('/')[1];

    async function setValue(page, selector, valueAToSet) {
        await page.waitForSelector(selector);
        await page.type(selector, valueAToSet);
    }

    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto('https://cra.freelancerepublik.com/');

    await setValue(page, '.Settings > :nth-child(5)', companyToSet);
    await setValue(page, '.Settings > :nth-child(6)', nameToSet);
    await setValue(page, '.Settings > :nth-child(7)', addressToSet);
    await setValue(page, '.Settings > :nth-child(8)', emailToSet);
    await setValue(page, '.Settings > :nth-child(10)', clientNameToSet);
    await setValue(page, '.Settings > :nth-child(11)', clientAddressToSet);

    await page.click('.Settings > :nth-child(12)') // Obligé sinon bug chelou

    const selectElement = await page.$('.Settings > :nth-child(3) > select');
    await selectElement.select(mois);
    await page.click('.Settings > :nth-child(3) > input', {clickCount: 3})
    await setValue(page, '.Settings > :nth-child(3) > input', annee);

    await page.click('.Settings > :nth-child(16)');

    // Selection des jours d'absences

    for (const jourAbsence of arrayJoursAbsences) {
        await page.click('div.content > :nth-child(2)  > :first-child  > :nth-child('+jourAbsence+') > .Day__value > input', {clickCount: 3})
        await setValue(page, 'div.content > :nth-child(2)  > :first-child  > :nth-child('+jourAbsence+') > .Day__value > input', "0");
    }

    for (const jourFerie of arrayJoursFeries) {
        await page.click('div.content > :nth-child(2)  > :first-child  > :nth-child('+jourFerie+') > .Day__value > input', {clickCount: 3})
        await setValue(page, 'div.content > :nth-child(2)  > :first-child  > :nth-child('+jourFerie+') > .Day__value > input', "0");
    }


    /* ---------------------------------------------------- */
    //
    // End of the code to copy to n8n function code node
    //
    /* ---------------------------------------------------- */

    //await browser.close();
})();