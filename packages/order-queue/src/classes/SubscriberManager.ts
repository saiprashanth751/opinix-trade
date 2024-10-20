import { RedisClientType, createClient } from "redis";
import { DbMessage, MessageToApi, WsMessage } from "@opinix/types";

export class SubscriberManager {
  private client: RedisClientType;
  private static instance: SubscriberManager;

  constructor() {
    this.client = createClient();
    this.client.connect();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SubscriberManager();
    }
    return this.instance;
  }

  public subscribeToChannel(
    channel: string,
    callback: (event: string, message: string) => void
  ) {
    this.client.subscribe(channel, (message: string, channel: string) => {
      callback(channel, message);
    });
  }

  public unsubscribeFromChannel(channel: string) {
    this.client.unsubscribe(channel);
  }
}
