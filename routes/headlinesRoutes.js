import express from "express";

import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, country, page } = req.query;

    //  with page number
    // const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&page=${page}&apiKey=${process.env.NEWS_API_KEY}`;

    // without page number
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${process.env.NEWS_API_KEY}`;

    console.log(url);

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
