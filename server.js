const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Search Route: /api/baiscope/search?q=movie-name
app.get('/api/baiscope/search', async (req, res) => {
    try {
        const q = req.query.q;
        if (!q) return res.json({ results: [] });

        const searchUrl = `https://www.baiscopelk.com/?s=${encodeURIComponent(q)}`;
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);
        const results = [];

        $('.post-title').each((i, el) => {
            const title = $(el).text().trim();
            const link = $(el).find('a').attr('href');
            if (title && link) {
                results.push({ id: encodeURIComponent(link), title });
            }
        });

        res.json({ results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Details Route: /api/baiscope/details?id=movie-link
app.get('/api/baiscope/details', async (req, res) => {
    try {
        const link = decodeURIComponent(req.query.id);
        const { data } = await axios.get(link);
        const $ = cheerio.load(data);

        const title = $('h1.post-title').first().text().trim();
        const thumbnail = $('img.aligncenter').first().attr('src') || '';
        const downloadLink = $('a[href*="pixeldrain"], a[href*="gofile.io"], a[href*="mega.nz"]').first().attr('href');
        const yearMatch = title.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? yearMatch[0] : 'Unknown';

        res.json({
            title,
            year,
            thumbnail,
            downloadLink,
            size: 'Unknown' // optional — unless you want to extract this too
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Details fetch failed' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Baiscope API running on port ${PORT}`);
});
                              
