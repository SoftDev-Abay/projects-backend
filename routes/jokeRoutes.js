import express from "express";
import fetch from "node-fetch";
import { json } from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const requestUrl = `https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw&type=twopart`;

    const responce = await fetch(requestUrl);

    const data = await responce.json();

    console.log(data);

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
