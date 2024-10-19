import { OrderStatus } from "@prisma/client";
export enum EOrderStatus {
  PENDING = "PENDING",
  PLACED = "PLACED",
}

export enum sides {
  YES = "yes",
  NO = "no",
}

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

export type TEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  start_date: Date;
  end_date: Date;
  createdAt: Date;
  min_bet: number;
  max_bet: number;
  sot: string;
  traders: number;
  quantity: number;
};
