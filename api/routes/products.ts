import express from "express";
import mysql2 from "mysql2/promise";

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

interface ProductWithID extends Product {
  id: number;
}

// 製品を全て取得
router.get("/", async (req, res) => {
  const connection = await mysql2.createConnection(DB_SETTING);
  await connection.connect();
  const [result, fields] = await connection.query(
    "SELECT * FROM users ORDER BY created_at DESC"
  );
  const users = result as ProductWithID[];
  res.send(users);
  connection.end();
});

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
    const id = await connection.query("SELECT LAST_INSERT_ID()");
    res.status(201).send({ id: id });
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
