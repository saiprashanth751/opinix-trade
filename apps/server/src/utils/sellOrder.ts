interface Order {
  id: string;
  quantity: number;
  price: number;
  createdAt: Date;
  status: "PENDING" | "PLACED";
}

interface OrderBook {
  yes: Order[];
  no: Order[];
}
export async function sellOrder(
  tradeId: string,
  eventId: string,
  side: "yes" | "no",
  quantity: number,
  price: number,
  orderbook: OrderBook
) {}
