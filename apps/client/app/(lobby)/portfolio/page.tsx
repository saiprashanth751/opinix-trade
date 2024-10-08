"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { getTrades } from "@/actions/Trade/getTrades";
import Portfolio from "../../../components/landing/Portfolio";
import { getEventDetails } from "@/actions/Event/getEventDetails";
import axios from "axios";
export interface Trade {
  id: string;
  createdAt: Date;
  portfolioId: string;
  eventId: string;
  price: number;
  quantity: number;
  side: "YES" | "NO";
  title?: string;
  gainloss: number | null;
  status : "ACTIVE"|"PAST"
}
export interface Portfolio {
  id: string;
  userId: string;
  currentBalances: number;
  createdAt: Date;
  updatedAt: Date;
  trades: Trade[];
}
const Page = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [portfolioData, setPortfolioData] = useState<Portfolio | null>(null);
  const [tradesWithTitles, setTradesWithTitles] = useState<Trade[]>([]);
  const { data } = useSession();
  console.log(data?.user);

  useEffect(() => {
    if (!data?.user) {
      redirect("/api/auth/signin");
    }
  }, [data?.user]);
  const userId = data?.user.id;

  useEffect(() => {
    if (userId) {
      getPortfolioDetails(userId);
    }
  }, [userId]);

  async function getPortfolioDetails(userId: string) {
    setLoading(true);
    try {
      const portfolio = await getTrades(userId);
      console.log(portfolio);

      setPortfolioData(portfolio);
      if (!portfolio) {
        return;
      }
      const updatedTrades = await fetchTitles(portfolio.trades);
      setTradesWithTitles(updatedTrades);
    } catch (e) {
      console.log("Error fetching portfolio", e);
    } finally {
      setLoading(false);
    }
  }
  async function fetchTitles(trades: Trade[]) {
    const titles = await Promise.all(
      trades.map(async (trade) => {
        const event = await getEventDetails(trade.eventId);
        return {
          ...trade,
          title: event.title,
        };
      })
    );
    return titles;
  }
  const handleExit = async (tradeId: string) => {
    if (window.confirm("Are you sure you want to sell your order")) {
      try {
        const tradeToSell = tradesWithTitles.find(
          (trade) => trade.id == tradeId
        );
        if (tradeToSell) {
          const response = await axios.post(
            "http://localhost:3001/v1/order/sell-order",
            {
              tradeId: tradeToSell.id,
              eventId: tradeToSell.eventId,
              price: tradeToSell.price,
              quantity: tradeToSell.quantity,
              side: tradeToSell.side == "YES" ? "yes" : "no",
            }
          );
          window.alert(response.data.message || "Order sold successfully!");
        } else {
          window.alert("Trade not found.");
        }
      } catch (error) {
        console.error("Error selling order", error);
        window.alert("Failed to sell order.");
      }
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!portfolioData) {
    return <div>No portfolio found.</div>;
  }
  const { currentBalances } = portfolioData;

  return (
    <div className="w-full h-screen">
      <Portfolio
        currentReturns={currentBalances}
        onExit={handleExit}
        trades={tradesWithTitles.map((trade) => ({
          id: trade.id,
          title: trade.title || "Unknown Title",
          price: trade.price,
          quantity: trade.quantity,
          type: trade.side,
          gainloss : trade.gainloss,
          status :trade.status
        }))}
      />
    </div>
  );
};

export default Page;
