console.log('SCRIPT STARTING');
process.setMaxListeners(11);

const puppeteer = require('puppeteer');
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = new twilio(accountSid, authToken);

const dateRange = [
  ['02', '01'],
  ['05', '04'],
  ['06', '05'],
  ['07', '06'],
  ['08', '07'],
  ['09', '08'],
  ['12', '11'],
  ['13', '12'],
  ['14', '13'],
  ['15', '14'],
  ['16', '15'],
];

async function checkInformation() {
  console.log(new Date());
  const displayResult = await Promise.all(
    dateRange.map(async range => {
      const url = `https://service-location-2-roues.lokki.rent/products?from=2023-06-${range[0]}T15:00:29.000Z&to=2023-09-${range[1]}T21:00:29.000Z&universe=619cb3461bcd8e0072e80865`;

      // const url =
      //   'https://service-location-2-roues.lokki.rent/products?from=2023-10-09T15:00:00.000Z&to=2024-01-08T21:00:00.000Z&universe=619cb3461bcd8e0072e80865';

      const information = 'Ajouter au panier';

      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();

      try {
        await page.goto(url, { waitUntil: 'networkidle2' });
      } catch (error) {
        console.log(`impossible d'atteindre la page du ${range[0]} juin \n ${error}`);
      }

      const bikes = (await page.$$('button.' + 'css-foknrm')) || [];

      let res;

      for (let i = 0; i < bikes.length; i++) {
        const textContent = await bikes[i].getProperty('textContent');
        const text = await textContent.jsonValue();

        if (text === information) {
          res = () => {
            const message = `Un vélo est disponible à la date du ${range[0]} juin. ${url}`;
            client.messages
              .create({
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:+33617825411',
                body: message,
              })
              .then(message => console.log(message.sid));
            console.log(`// VELO DISPO // \n ${message} \n // VELO DISPO //`);
          };

          await browser.close();
          return res;
        } else if (i + 1 === bikes.length) {
          res = () => {
            console.log(`Aucun vélo disponible sur la date du ${range[0]} juin. \n ${url}`);
          };
        }
      }

      if (!res) res = () => console.log(`nothing to display for the ${range[0]} juin`);

      await browser.close();
      return res;
    })
  );
  displayResult.forEach(result => result());

  setInterval(() => {
    console.log('EXEC after 4 hours');
    checkInformation();
  }, 14400000);
}

checkInformation();
