# Presentation

This project is a helper project to create puppeteer scripts destined to be used in n8n browserless node as function calls to a browserless instance.

Links:
  - [N8N](https://n8n.io/)
  - [N8N browserless node ](https://github.com/minhlucvan/n8n-nodes-browserless)
  - [Browserless](https://www.browserless.io/)
  - [Puppeteer](https://pptr.dev/)

# Installation

1. npm i puppeteer

# Use

1. Some examples are in the "samples" folder.
2. The sandbox-scraping.js file is the script that should be injected in the "code" section of the browserless node in n8n (function node type). The code to import to n8n is delimited by 2 comment section explicitly written in the file.

## Tips

- Start the browser in a windows mode (not headless) while developing to see what is happening. This is useful to debug the script.
  - const browser = await puppeteer.launch({headless: false}); // will be running in a window mode by default in the future
  - Use a line like this to call the browserless instance in n8n: const browser = await puppeteer.connect({browserWSEndpoint: 'ws://localhost:3000?token=your_token'});
    - Add the token in an unversioned file called "UnversionedToken.txt" if you want to use it without risking to commit it in the repository.
  - You can comment the following code to avoid the browser to close after the script execution. This is useful to see what is happening in the browser.
    - //await browser.close();

### Problems

- If a timeout occurs (in case of a too long function call), then you should increase the timeout in the browserless server (default time should be 60). => https://github.com/browserless/browserless/issues/228#issuecomment-986059700