/*
 TODOS:
 1. Fake Liquidity []
 2. setting base balancing [x]
 3. go through again []
 4. TEST ENGINE ( Latency ) | shift it to RUST or GO if needed.[]
 5. TYPES [x]
 6. Test Cases [x]
*/

import { RedisManager } from "@repo/order-queue";
import { Engine } from "./trade/Engine";
import { Orderbook } from "./trade/Orderbook";

async function main() {
    const engine = new Engine();
    const redis = new RedisManager();
    const redisClient = redis.getClient();
    console.log("connected to redis");

    while (true) {
        const response = await redisClient.rPop("ORDER_QUEUE");
        const parsedRespnse = JSON.parse(response!);
        if (!response) {

        }else {
            const type = parsedRespnse.type;
            const responseMessage = parsedRespnse.data;
            if (responseMessage.side === "buy") {
                responseMessage.side = "yes";
            } else {
                responseMessage.side = "no";
            }
            const message = {
                type: responseMessage.type,
                data: responseMessage,
            };
            engine.processOrders({ message, clientId: type });
        }
    }
}

main();

export { Engine, Orderbook };
