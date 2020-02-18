const puppeteer = require('puppeteer');
const fs = require('fs');

let firstPageNum = null;
let lastPageNum = null;

let scrape = async () => {
	const allData = [];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();			
    await page.goto('https://pycoder.ru/tags/?tag=python&page=1');

    const result = await page.evaluate(() => {
        const firstPageLink = parseInt(document.querySelector('.page-link:first-child').getAttribute('href').slice(-1), 10);
        const lastPageLink = parseInt(document.querySelectorAll('.page-link')[2].getAttribute('href').slice(-1), 10);
        return {
        	firstPageLink,
        	lastPageLink,
        }
    });

    firstPageNum = result.firstPageLink;
    lastPageNum = result.lastPageLink;
    browser.close();

    for(let pageNum = firstPageNum; pageNum <= lastPageNum; pageNum++) {
	    const browser = await puppeteer.launch();
	    const page = await browser.newPage();			
	    await page.goto('https://pycoder.ru/tags/?tag=python&page=' + pageNum);

	    const result = await page.evaluate(() => {
	        let data = [];
	        let elements = document.querySelectorAll('.post');

	        elements.forEach(element => {
	            let title = element.querySelector('h2').innerHTML;
	            let linkDetails = element.querySelector('.post_link_next').getAttribute('href');
	            data.push({title, linkDetails});        	
	        });

	        return data;
	    });

	    allData.push(...result);
	    browser.close();
    }

	return allData;
};

scrape().then((results) => {
    console.log(results);
	fs.writeFile('./results.json', JSON.stringify(results), err => err ? console.log(err): null);    
});