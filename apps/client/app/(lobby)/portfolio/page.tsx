"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { getTrades } from "@/actions/Trade/getTrades";
import Portfolio from "../../../components/landing/Portfolio";
import { getEventDetails } from "@/actions/Event/getEventDetails";

export interface Trade {
  id: string;
  createdAt: Date;
  portfolioId: string;
  eventId: string;
  price: number;
  quantity: number;
  side: "YES" | "NO";
  title?: string;
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
  const userId = "cm1r277l500178uzhh6kiewxa"; //data.user.id;

  useEffect(() => {
    if (userId && !portfolioData) {
      getPortfolioDetails(userId);
    }
  }, [userId])

  async function getPortfolioDetails(userId: string) {
    setLoading(true);
    try {
      const portfolio = await getTrades(userId);
      if(portfolio.success){
        setPortfolioData(portfolio.trades!);

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
  const handleExit = () => {
    window.alert("exited");
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
        }))}
      />
    </div>
  );
};

export default Page;
