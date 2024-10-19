/**
 *
 */

import { AsyncWrapper } from "../../utils/asynCatch";
import { TEvent } from "@opinix/types";
import { Request, Response } from "express";
import { slugify, eventCodeGenerator } from "../../utils/utils";
import prisma from "@repo/db/client";
import {
  SuccessResponse,
  SuccessResponseType,
} from "../../utils/wrappers/success.res";
import { ErrorHandler } from "../../utils/wrappers/error.res";
export const createEventHandler = AsyncWrapper(
  async (req: Request<{}, {}, Omit<TEvent, "slug">>, res) => {
    const {
      title,
      description,
      start_date,
      end_date,
      min_bet,
      max_bet,
      sot,
      quantity,
    } = req.body;
    let slug = slugify(title);

    let eventCode = eventCodeGenerator();
    // check if event already exists using the slug name
    const isEventExists = await prisma.event.findFirst({
      where: {
        slug: slug,
      },
    });
    if (isEventExists) {
      throw new ErrorHandler("Event already exists", "BAD_REQUEST");
    }
    // creating the event and sending back the response to the client with the event code
    await prisma.event.create({
      data: {
        eventId: eventCode,
        title,
        slug,
        description,
        start_date,
        end_date,
        min_bet,
        max_bet,
        sot,
        expiresAt: end_date,
        quantity,
      },
    });

    let response = new SuccessResponse("Event created successfully", eventCode);
    return res.status(201).json(response);
  }
);

/**
 * @description
 */
/**
 * url -  https://prod.api.probo.in/api/v3/product/events/tradeSummary?eventId=3169798&page=1&pageSize=5
 * @description - Get trade summary for an event
 */

type TTradeSummary = {
  order_book_details: {
    orderbook_config: {
      socket_events: {
        subscribe_msg_name: string;
        unsubscribe_msg_name: string;
        listener_msg_name: string;
        subscription_data: string;
      };
    };
  };
};
export const getTradeSummaryHandler = AsyncWrapper(
  async (req, res: Response<SuccessResponseType<TTradeSummary>>) => {
    const { eventId } = req.query;

    const event = await prisma.event.findUnique({
      where: {
        eventId: parseInt(eventId as unknown as string),
      },
    });
    if (!event) {
      throw new ErrorHandler("Event not found", "NOT_FOUND");
    }
    let response = new SuccessResponse(
      "Trade summary fetched successfully",
      200,
      {
        order_book_details: {
          orderbook_config: {
            socket_events: {
              subscribe_msg_name: "subscribe_orderbook",
              unsubscribe_msg_name: "unsubscribe_orderbook",
              listener_msg_name: `event_orderbook_${eventId}`,
              subscription_data: `${eventId}`,
            },
          },
        },
      }
    );
    return res.status(200).json(response.serialize());
  }
);
