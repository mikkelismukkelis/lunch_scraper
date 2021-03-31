const axios = require('axios')
const cheerio = require('cheerio')
const dayjs = require('dayjs')
const puppeteer = require('puppeteer')

const menus = []

// For making strings forst letter uppercase
const capitalize = (s) => {
  return s && s[0].toUpperCase() + s.slice(1)
}

const getSello = async () => {
  try {
    const url = 'https://www.sello.fi/lounas-espoo'

    const dateString = dayjs().format('YYYYMMDD')

    console.log('UUUUUUUUUUUUUUUUUUUUUUUUUUU')

    const axiosResponse = await axios.get(url)

    const $ = cheerio.load(axiosResponse.data)

    // Loop trough menu containers
    $(`.date-container.date-${dateString} > .menu-container`).each(
      (index, element) => {
        const menurows = []
        // Get restaurant name
        const restaurantWithSlashes = $(element)
          .children('a')
          .first()
          .attr('href')
        const n = restaurantWithSlashes.lastIndexOf('/')
        const restaurant = capitalize(
          restaurantWithSlashes.substring(n + 1).replace('-', ' ')
        )

        $(element).each((i, e) => {
          const rows = $(e)
            .children('.date-table')
            .children('.row')
            .children('.description')

          $(rows).each((k, el) => {
            menurows[k] = $(el).text()
          })
        })

        menus[index] = { restaurant, menurows }
      }
    )
  } catch (error) {
    console.log('Sello errori ', error)
  }
}

const getDylan = async () => {
  try {
    // const dylanMenu = []
    const menurows = []
    const url =
      'https://www-dylan-fi.filesusr.com/html/a260f7_d4558c6a9c49efac5516a6d4f45e968d.html'

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(url)
    await page.waitForSelector('.lounastaja--lunch-title-wrapper')
    const titles = await page.$$('.lounastaja--lunch-title-wrapper')
    for (const title of titles) {
      const menurow = await title.$eval('span', (span) => span.innerText)
      // console.log('menurow ', menurow)
      menurows.push(menurow)
    }

    await browser.close()
    menus.push({ restaurant: 'Dylan lepuski', menurows })
    console.log('menus ', menus)
  } catch (error) {
    console.log('Dylan errori ', error)
  }
}
getSello()
getDylan()

// console.log('menus ', menus)
