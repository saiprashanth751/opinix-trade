/*
 TODOS:
 1. Fake Liquidity []
 2. setting base balancing [x]
 3. go through again 
 4. TEST ENGINE ( Latency ) | shift it to RUST or GO if needed.
 5. TYPES
 6. Test Cases
*/

import { RedisManager } from "@repo/order-queue";
import { Engine } from "./trade/Engine";
import { Orderbook } from "./trade/Orderbook"


async function main() {
    const engine = new Engine();
    const redis = new RedisManager();
    const redisClient = redis.getClient();
    console.log("connected to redis");

    while (true) {
        const response = await redisClient.rPop("ORDER_QUEUE")
        const res = JSON.parse(response!)
        if (!response) {
        } else {
            const t = res.type;
            const mess = res.data;
            if (mess.side === "buy") {
                mess.side = "yes";
            } else {
                mess.side = "no";
            }
            const message = {
                type: mess.type,
                data: mess
            }
            engine.processOrders({ message, clientId: t });
        }
    }

}

main();


export { Engine, Orderbook };