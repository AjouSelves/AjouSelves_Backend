const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const DB = require("../database/maria"); // DB 정보 가져오기
require("dotenv").config(); // jwt secret key 가져오기
DB.connect();

//body-parser
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get("/test", (req, res) => {
  const base = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: process.env.client_id,
    redirect_uri: process.env.redirect_uri,
    response_type: "code",
  };
  const full = new URLSearchParams(config).toString();
  const result = `${base}?${full}`;
  console.log(result);
  res.redirect(result);
});

router.get("/auth", (req, res) => {
  console.log(req.query.code);
  res.json(req.query.code);
});

router.get("/url", (req, res) => {
  res.redirect(`https://kauth.kakao.com/oauth/authorize?`);
});

https: module.exports = router;
