import express from "express";
import fetch from "node-fetch";
import { json } from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const requestUrl = `https://api.api-ninjas.com/v1/quotes?category=success`;

    const responce = await fetch(requestUrl, {
      headers: {
        "X-Api-Key": process.env.API_NINJAS_API_KEY,
      },
    });

    const data = await responce.json();

    console.log(data);

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
