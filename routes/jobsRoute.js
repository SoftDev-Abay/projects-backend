import express from "express";
import fetch from "node-fetch";
import { json } from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { geo, industry } = req.query;

    const requestUrl = `https://jobicy.com/api/v2/remote-jobs?count=12${
      geo && geo.length > 0 ? "&geo=" + geo : ""
    }${industry && industry.length > 0 ? "&industry=" + industry : ""}`;

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
