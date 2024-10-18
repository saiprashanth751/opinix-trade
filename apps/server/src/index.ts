import express from "express";
import {ORDERBOOK} from "@repo/engine"
const app = express();
console.log(ORDERBOOK);

app.listen(3001, () =>{
  console.log(`server is runnning on http://localhost:3001`)
})