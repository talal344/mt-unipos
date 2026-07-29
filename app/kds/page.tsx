"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { Clock, CheckCircle2, ChefHat, Play, Check } from "lucide-react";

export default function KDSPage() {
  const { kitchenTickets, completeKitchenTicket } = useGlobalContext();
  const [activeTab, setActiveTab] = useState("All");
  const [cookingIds, setCookingIds] = useState<string[]>([]);

  // Time tracking to show "time elapsed"
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const tabs = ["All", "Main Kitchen", "BBQ Section", "Pizza Section", "Drinks"];

  const filteredTickets = useMemo(() => {
    return kitchenTickets.filter((t) => {
      // Hide ready tickets to keep KDS clean
      if (t.status === "Ready") return false;
      
      if (activeTab === "All") return true;
      return t.section === activeTab;
    });
  }, [kitchenTickets, activeTab]);

  const handleStartCooking = (id: string) => {
    if (!cookingIds.includes(id)) {
      setCookingIds((prev) => [...prev, id]);
    }
  };

  const handleMarkReady = (id: string) => {
    completeKitchenTicket(id);
    setCookingIds((prev) => prev.filter((cid) => cid !== id));
  };

  const getElapsedTime = (orderTime: string) => {
    const diff = now.getTime() - new Date(orderTime).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 0) return "0m";
    return `${minutes}m`;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <ClientSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <ChefHat className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-white tracking-wide">Kitchen Display System</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-400 bg-slate-800/50 px-4 py-2 rounded-full">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="font-medium">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <ChefHat className="h-16 w-16 opacity-20" />
              <p className="text-xl font-medium">No active tickets for this section</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max items-start">
              {filteredTickets.map((ticket) => {
                const isCooking = cookingIds.includes(ticket.id) || ticket.status === "Cooking";
                const elapsed = getElapsedTime(ticket.orderTime);
                const isUrgent = parseInt(elapsed) > 15; // > 15 mins is urgent

                return (
                  <div
                    key={ticket.id}
                    className={`flex flex-col rounded-xl overflow-hidden border shadow-lg transition-all duration-300 ${
                      isUrgent
                        ? "border-red-500/50 bg-red-950/20 shadow-red-500/10"
                        : isCooking
                        ? "border-amber-500/50 bg-amber-950/20 shadow-amber-500/10"
                        : "border-slate-800 bg-slate-900"
                    }`}
                  >
                    {/* Ticket Header */}
                    <div
                      className={`px-5 py-4 border-b flex justify-between items-center ${
                        isUrgent
                          ? "bg-red-500/20 border-red-500/30"
                          : isCooking
                          ? "bg-amber-500/20 border-amber-500/30"
                          : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-white leading-tight">
                          {ticket.tableNumber}
                        </span>
                        <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                          Ticket #{ticket.id.split("-")[1] || ticket.id}
                        </span>
                      </div>
                      <div
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-bold text-sm ${
                          isUrgent
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-slate-950/50 text-slate-300"
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        <span>{elapsed}</span>
                      </div>
                    </div>

                    {/* Ticket Items */}
                    <div className="p-5 flex-1 space-y-4">
                      {ticket.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <span className="flex items-center justify-center bg-slate-800 text-slate-300 font-bold h-7 w-7 rounded-md text-sm shrink-0 border border-slate-700">
                                {item.qty}
                              </span>
                              <span className="text-base font-semibold text-white leading-snug">
                                {item.name}
                              </span>
                            </div>
                          </div>

                          {/* Item Modifiers */}
                          {(item.variant || (item.addons && item.addons.length > 0) || item.notes) && (
                            <div className="ml-10 mt-2 space-y-1.5 border-l-2 border-slate-700 pl-3 py-0.5">
                              {item.variant && (
                                <p className="text-sm text-amber-400 flex items-center space-x-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                  <span>{item.variant}</span>
                                </p>
                              )}
                              {item.addons && item.addons.map((addon, aIdx) => (
                                <p key={aIdx} className="text-sm text-blue-400 flex items-center space-x-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                  <span>+ {addon}</span>
                                </p>
                              ))}
                              {item.notes && (
                                <p className="text-sm text-red-400 italic flex items-start space-x-2 bg-red-500/10 px-2 py-1 rounded">
                                  <span className="font-bold shrink-0 mt-0.5">Note:</span>
                                  <span>{item.notes}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Ticket Footer / Actions */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800 grid grid-cols-2 gap-3 mt-auto">
                      {!isCooking ? (
                        <button
                          onClick={() => handleStartCooking(ticket.id)}
                          className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 font-bold py-3 rounded-lg transition-colors col-span-2"
                        >
                          <Play className="h-5 w-5" />
                          <span>Start Cooking</span>
                        </button>
                      ) : (
                        <>
                          <div className="flex items-center justify-center space-x-2 bg-amber-500/20 text-amber-500 font-bold py-3 rounded-lg border border-amber-500/30 cursor-default">
                            <ChefHat className="h-5 w-5 animate-bounce" />
                            <span>Cooking...</span>
                          </div>
                          <button
                            onClick={() => handleMarkReady(ticket.id)}
                            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-green-600/20"
                          >
                            <Check className="h-5 w-5" />
                            <span>Mark Ready</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
