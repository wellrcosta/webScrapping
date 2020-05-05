const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const db = require('./models');

(async () => {
	try {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.setViewport({
			width: 1920,
			height: 1080,
		});
		await page.goto('https://www.paodeacucar.com/busca?qt=200&p=1&gt=list');
		await page.waitFor(999999);

		const body = await page.evaluate(() => {
			return document.querySelector('body').innerHTML;
		});

		// Load the web page in Cheerio
		const $ = cheerio.load(body);

		// Select all the products
		const products = $('.thumbnail');

		// Now make a loop to find all products, one by one
		for (let i = 0; i < products.length; i++) {
			let price = 0;
			let title = '';

			// Now we find a Product description
			const productDescription = $(products[i]).find('p.product-description');
			const discountPrice = $(products[i]).find('p.discount-price');
			const normalPrice = $(products[i]).find('p.normal-price');

			// We proceed, only if the element exists
			if (productDescription) {
				// Verify if not empty
				if (productDescription.text().trim() === '') break;
				// We wrap the span in `$` to create another cheerio instance of only the span
				// and use the `text` method to get only the text (ignoring the HTML)
				// of the span element
				title = $(productDescription).text().trim();
			}

			if (discountPrice) {
				if (discountPrice.text().trim() === '') break;
				price = discountPrice;
			}
			if (normalPrice) {
				if (normalPrice.text().trim() === '') break;
				price = normalPrice;
			}

			db.products.create({ title, price }).catch((err) => {
				console.log(
					'*** There was an error creating a product',
					JSON.stringify(products)
				);
			});
		}

		await browser.close();
	} catch (err) {
		console.log(err);
	}
})();
