import express from "express";
import mysql2 from "mysql2/promise";
import { JSDOM } from "jsdom";
import axios from "axios";

const router = express.Router();

const DB_SETTING = {
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
};

interface Product {
  name: string;
  type: string;
  url_com: string;
  url_kakaku: string;
}

interface ExProduct extends Product {
  id: number;
  price_com: string;
  price_kakaku: string;
}

// 製品を全て取得
router.get("/", async (req, res) => {
  const connection = await mysql2.createConnection(DB_SETTING);
  try {
    await connection.connect();
    const [result, fields] = await connection.query("SELECT * FROM products");
    const products = result as ExProduct[];
    res.send(
      await Promise.all(
        products.map(async (product) => {
          product.price_com = await getAmazonPrice(product.url_com);
          product.price_kakaku = await getKakakuPrice(product.url_kakaku);
          return product;
        })
      )
    );
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
  connection.end();
});

//Aamazon.comの商品URLから価格を取得します $12.34 形式
async function getAmazonPrice(url: string) {
  try {
    const url_object = new URL(url);
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
      },
    });

    const document = new JSDOM(res.data).window.document;
    const priceblock_ourprice = document.getElementById("priceblock_ourprice");
    if (!priceblock_ourprice) return "ERROR";
    const ourprice_shippingmessage = document.getElementById(
      "ourprice_shippingmessage"
    );
    if (!ourprice_shippingmessage) return "ERROR";
    //[Shipping & Import Fees Deposit, Price, AmazonGlobal Shipping, Estimated Import Fees Deposit, Total]
    const pricesWith$ = ourprice_shippingmessage.textContent?.match(
      /\$[\d\.]*/g
    );
    // console.log(priceblock_ourprice.textContent, pricesWith$);
    if (!pricesWith$) return "ERROR";
    const prices = pricesWith$.map((price) => {
      return parseFloat(price.slice(1));
    });
    return `$${prices[1] + prices[2]}`;
  } catch (error) {
    return "ERROR";
  }
}

//価格.comの商品URLから価格を取得します ￥10,000 形式
async function getKakakuPrice(url: string) {
  try {
    const url_object = new URL(url);
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
      },
    });
    const document = new JSDOM(res.data).window.document;
    const price = document.getElementsByClassName("priceTxt");
    if (price.length === 0) return "ERROR";
    return price[0].textContent ?? "ERROR";
  } catch (error) {
    return "ERROR";
  }
}

// 商品を登録
router.post("/", async (req, res) => {
  // const id = req.params.id;
  const product = req.body as Product;
  const connection = await mysql2.createConnection(DB_SETTING);
  try {
    await connection.connect();
    await connection.execute(
      "INSERT IGNORE products VALUES (NULL, ?, ?, ?, ?)",
      [product.name, product.type, product.url_com, product.url_kakaku]
    );
    //自動採番を取得
    const [result, fields] = await connection.query(
      "SELECT LAST_INSERT_ID() AS LAST_INSERT_ID"
    );
    const id = result as { LAST_INSERT_ID: number }[];
    res.status(201).send({ id: id[0].LAST_INSERT_ID });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
  connection.end();
});

// 商品を更新
router.put("/:id", async (req, res) => {
  const product = req.body as Product;
  const connection = await mysql2.createConnection(DB_SETTING);
  try {
    await connection.connect();
    await connection.execute(
      "UPDATE products SET name=?, type=?, url_com=?, url_kakaku=? WHERE id=?",
      [
        product.name,
        product.type,
        product.url_com,
        product.url_kakaku,
        req.params.id,
      ]
    );
    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
  connection.end();
});

// 商品を削除
router.delete("/:id", async (req, res) => {
  const connection = await mysql2.createConnection(DB_SETTING);
  try {
    await connection.connect();
    await connection.execute("DELETE FROM products WHERE id=?", [
      req.params.id,
    ]);
    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
  connection.end();
});

export default router;
