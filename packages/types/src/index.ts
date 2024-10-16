export enum EOrderStatus {
  PENDING = "PENDING",
  PLACED = "PLACED",
}

export enum sides {
  YES = "yes",
  NO = "no",
}

import { OrderStatus } from "@prisma/client";
export type TOrder = {
  id: string;
  orderBookId: string;
  price: number;
  quantity: number;
  status: OrderStatus;
  createdAt: Date;
};

export type TOrderbookForOrders = {
  id: string;
  eventId: string;
  topYesPrice: number;
  topNoPrice: number;
  yes: TOrder[];
  no: TOrder[];
};
