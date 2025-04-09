const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// Pornhub Search API Route
app.get("/api/pornhub/search", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const searchUrl = `https://www.pornhub.com/video/search?search=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $(".pcVideoListItem").each((i, el) => {
      const title = $(el).find(".title a").text().trim();
      const videoUrl = "https://www.pornhub.com" + $(el).find(".title a").attr("href");
      const thumb = $(el).find("img").attr("data-src") || $(el).find("img").attr("src");

      if (title && videoUrl && thumb) {
        results.push({ title, videoUrl, thumb });
      }
    });

    // Pretty printed JSON output
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ results }, null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
