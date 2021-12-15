import jsdom from 'jsdom';
import got from 'got';
const { JSDOM } = jsdom

export const scrape = async (number: number) => {
    const page = Math.ceil(number/50)
    const baseURL = 'https://osu.ppy.sh/rankings/osu/performance?country=NZ&page=' + page

    const response = await got(baseURL)
    const dom = new JSDOM(response.body)

    const playerNameNodeList = [...dom.window.document.querySelectorAll('.ranking-page-table__user-link-text')];
    const ppNodeList = [...dom.window.document.querySelectorAll('.ranking-page-table__column--focused')]
    const player = playerNameNodeList[(number - 1) % 50].textContent?.trim()
    const pp = ppNodeList[(number - 1) % 50].textContent?.trim()

    return [player, pp]
};