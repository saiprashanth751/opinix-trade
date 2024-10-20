/*
 TODOS:
 1. Fake Liquidity 
 2. setting base balancing 
 3. Login go through again
 4. TEST ENGINE ( Latency ) | shift it to RUST or GO if needed.
 5. TYPES
 6. Test Cases
*/

import { createClient } from "@repo/order-queue";
import { Engine } from "./trade/Engine";


async function main() {
    const engine = new Engine(); 
    const redisClient = createClient();
    await redisClient.connect();
    console.log("connected to redis");

    while (true) {
        const response = await redisClient.rPop("messages" as string)
        if (!response) {

        }  else {
            engine.processOrders(JSON.parse(response));
        }        
    }

}

main();