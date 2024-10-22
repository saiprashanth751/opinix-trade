/*
 TODOS:
 1. Fake Liquidity 
 2. setting base balancing 
 3. Login go through again
 4. TEST ENGINE ( Latency ) | shift it to RUST or GO if needed.
 5. TYPES
 6. Test Cases
*/

import { RedisManager } from "@repo/order-queue";
import { Engine } from "./trade/Engine";
import {Orderbook} from "./trade/Orderbook"


async function main() {
    const engine = new Engine(); 
    const redis = new RedisManager();
    const redisClient = redis.getClient();
    console.log("connected to redis");

    while (true) {
        const response = await redisClient.lPop("ORDER_QUEUE")
        if (!response) {

        }  else {
            engine.processOrders(JSON.parse(response));
        }        
    }

}

main();


export {Engine, Orderbook};