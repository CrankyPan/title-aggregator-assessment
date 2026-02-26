const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.theverge.com');
    const $ = cheerio.load(data);
    
    let articles = [];
    let seenLinks = new Set(); 

    $('a').each((index, element) => {
      let title = $(element).text().trim();
      let link = $(element).attr('href');

      if (!link || !title) return;

      if (link.startsWith('/')) {
        link = `https://www.theverge.com${link}`;
      }

      if (
        link.startsWith('https://www.theverge.com') && 
        title.split(' ').length > 4 &&
        !link.includes('#comments')
      ) {
        if (!seenLinks.has(link)) {
          seenLinks.add(link);
          articles.push({ title, link });
        }
      }
    });

    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Title Aggregator</title>
        <style>
          body { background-color: #000; color: #fff; font-family: monospace; padding: 2rem; }
          a { color: #fff; display: block; margin-bottom: 1rem; text-decoration: none; font-size: 1.2rem; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>The Verge Headlines (January 2022 Onwards)</h1>
    `;

    articles.forEach(article => {
      html += `<a href="${article.link}" target="_blank">${article.title}</a>`;
    });

    html += `
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).send('Error aggregating titles.');
  }
});

//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;