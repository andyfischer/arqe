
import Playwright from 'playwright'
import Graph from './fd/Graph'
import Path from 'path'

const graph = new Graph();

async function main() {
    const browserType = 'chromium';
    const browser = await Playwright[browserType].launch({
        headless: false,
        userDataDir: Path.join(__dirname, 'user-data')
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://twitch.tv/');
    await browser.close();
}

main()
.catch(console.error)
