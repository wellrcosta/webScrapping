const db = require('./models');

let result = db.Products.findAll()
	.then((products) => console.log(products))
	.catch((err) => {
		console.log('There was an error ', JSON.stringify(err));
	});
