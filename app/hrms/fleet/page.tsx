"use client";

import React, { useState, useEffect, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext } from "@/context/global-context";
import {
  Car,
  Bike,
  Truck,
  Plus,
  Search,
  Fuel,
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Gauge,
  X,
  Sparkles,
  UserCheck
} from "lucide-react";

interface FleetVehicle {
  id: string;
  plateNumber: string;
  type: "Delivery Bike" | "Van / Pickup" | "Executive Car";
  model: string;
  year: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  odometerKm: number;
  fuelType: "Petrol" | "Diesel" | "Electric" | "Hybrid";
  tokenTaxExpiry: string;
  insuranceExpiry: string;
  lastOilChangeKm: number;
  status: "Active & On Road" | "In Maintenance" | "Parked / Idle";
  fuelLogs: {
    id: string;
    date: string;
    liters: number;
    cost: number;
    kmReading: number;
    station: string;
  }[];
}

export default function FleetPage() {
  const { currentUser, hrEmployees, currencySymbol } = useGlobalContext();
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (currentUser?.tenantId) {
      const key = `hr_fleet_vehicles_${currentUser.tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed: FleetVehicle[] = JSON.parse(saved);
          const filtered = parsed.filter(v => v.id !== "VEH-1" && v.id !== "VEH-2" && v.plateNumber !== "LEA-2024-4412" && v.plateNumber !== "KHI-2023-9901");
          setVehicles(filtered);
          if (filtered.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch {
          setVehicles([]);
        }
      } else {
        setVehicles([]);
      }
    }
  }, [currentUser?.tenantId]);

  const saveVehicles = (data: FleetVehicle[]) => {
    setVehicles(data);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_fleet_vehicles_${currentUser.tenantId}`, JSON.stringify(data));
    }
  };

  const [form, setForm] = useState({
    plateNumber: "",
    type: "Delivery Bike" as FleetVehicle["type"],
    model: "",
    year: 2024,
    assignedDriverId: "",
    odometerKm: 1000,
    fuelType: "Petrol" as FleetVehicle["fuelType"],
    tokenTaxExpiry: "2026-06-30",
    insuranceExpiry: "2025-12-31"
  });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const driver = hrEmployees.find((e) => e.id === form.assignedDriverId);
    const newVeh: FleetVehicle = {
      id: `VEH-${Date.now()}`,
      plateNumber: form.plateNumber.toUpperCase(),
      type: form.type,
      model: form.model,
      year: Number(form.year) || 2024,
      assignedDriverId: driver?.id,
      assignedDriverName: driver?.name,
      odometerKm: Number(form.odometerKm) || 0,
      fuelType: form.fuelType,
      tokenTaxExpiry: form.tokenTaxExpiry,
      insuranceExpiry: form.insuranceExpiry,
      lastOilChangeKm: Number(form.odometerKm) || 0,
      status: "Active & On Road",
      fuelLogs: []
    };

    saveVehicles([newVeh, ...vehicles]);
    setShowAddModal(false);
    setForm({
      plateNumber: "",
      type: "Delivery Bike",
      model: "",
      year: 2024,
      assignedDriverId: "",
      odometerKm: 1000,
      fuelType: "Petrol",
      tokenTaxExpiry: "2026-06-30",
      insuranceExpiry: "2025-12-31"
    });
    triggerToast("✅ Vehicle registered to company fleet!");
  };

  const [fuelForm, setFuelForm] = useState({
    liters: 10,
    cost: 25,
    kmReading: 0,
    station: "Shell Station",
    date: new Date().toISOString().split("T")[0]
  });

  const handleAddFuelLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const newLog = {
      id: `FL-${Date.now()}`,
      date: fuelForm.date,
      liters: Number(fuelForm.liters) || 0,
      cost: Number(fuelForm.cost) || 0,
      kmReading: Number(fuelForm.kmReading) || selectedVehicle.odometerKm,
      station: fuelForm.station
    };

    const updated = vehicles.map((v) => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          odometerKm: Math.max(v.odometerKm, Number(fuelForm.kmReading) || v.odometerKm),
          fuelLogs: [newLog, ...v.fuelLogs]
        };
      }
      return v;
    });

    saveVehicles(updated);
    setShowFuelModal(false);
    triggerToast(`⛽ Fuel refill logged for ${selectedVehicle.plateNumber}!`);
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = searchQuery.toLowerCase();
      return (
        q === "" ||
        v.plateNumber.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(q))
      );
    });
  }, [vehicles, searchQuery]);

  const totalFleetCount = vehicles.length;
  const totalMonthlyFuelCost = vehicles.reduce((acc, v) => {
    return acc + v.fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  }, 0);

  return (
    <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow overflow-y-auto h-full relative">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400/50">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        <HRMSTopHeader
          title="🚗 Company Vehicle &amp; Fleet Fuel Log Manager"
          subtitle="Fleet inventory tracking, delivery bike/car assignments, mileage odometer readings, and fuel refill logs."
        />

        <div className="p-6 space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Active Fleet Vehicles</p>
              <p className="text-2xl font-black text-white">{totalFleetCount} Vehicles</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Bikes &amp; Delivery Cargo</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Fuel Expense Logged</p>
              <p className="text-2xl font-black text-emerald-400">
                {currencySymbol || "$"}{totalMonthlyFuelCost.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-500/80 mt-0.5">Refill Outflow YTD</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Service &amp; Oil Health</p>
              <p className="text-2xl font-black text-sky-400">100% OK</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Preventive Maintenance</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Register Vehicle</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-1 flex items-center gap-1.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-3.5 py-2 rounded-xl transition shadow cursor-pointer"
                >
                  <Plus size={14} /> Add Vehicle
                </button>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Car className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl flex items-center">
            <div className="relative w-full max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by plate number, model, or driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVehicles.map((veh) => {
              const kmSinceOil = veh.odometerKm - veh.lastOilChangeKm;
              const isOilDue = kmSinceOil >= 1500;

              return (
                <div
                  key={veh.id}
                  className="bg-[#0b0f17] border border-gray-800 hover:border-emerald-500/40 rounded-2xl p-5 space-y-4 transition group shadow-xl"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-mono tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                          {veh.plateNumber}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                          {veh.type}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-white mt-1.5">{veh.model} ({veh.year})</h3>
                    </div>

                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {veh.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-black/40 border border-gray-800/80 p-3 rounded-xl">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Assigned Driver:</span>
                      <span className="text-white font-bold">{veh.assignedDriverName || "Unassigned"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Odometer Reading:</span>
                      <span className="text-emerald-400 font-bold">{veh.odometerKm.toLocaleString()} KM</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Token Tax Expiry:</span>
                      <span className="text-gray-300">{veh.tokenTaxExpiry}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Oil Change Status:</span>
                      <span className={isOilDue ? "text-amber-400 font-bold" : "text-gray-300"}>
                        {kmSinceOil} km since change
                      </span>
                    </div>
                  </div>

                  {/* Refill Log Summary & Actions */}
                  <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-mono">
                      {veh.fuelLogs.length} Refill Entries Logged
                    </span>

                    <button
                      onClick={() => {
                        setSelectedVehicle(veh);
                        setFuelForm({ ...fuelForm, kmReading: veh.odometerKm });
                        setShowFuelModal(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-3.5 py-1.5 rounded-lg transition cursor-pointer shadow"
                    >
                      <Fuel size={13} /> Log Fuel Refill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Log Fuel Refill Modal */}
      {showFuelModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-emerald-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-emerald-500/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Fuel size={16} className="text-emerald-400" />
                Log Fuel Refill &bull; {selectedVehicle.plateNumber}
              </h2>
              <button onClick={() => setShowFuelModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFuelLog} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Fuel Liters</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={fuelForm.liters}
                    onChange={(e) => setFuelForm({ ...fuelForm, liters: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Cost ({currencySymbol || "$"})</label>
                  <input
                    required
                    type="number"
                    value={fuelForm.cost}
                    onChange={(e) => setFuelForm({ ...fuelForm, cost: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Current Odometer (KM)</label>
                  <input
                    required
                    type="number"
                    value={fuelForm.kmReading}
                    onChange={(e) => setFuelForm({ ...fuelForm, kmReading: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Refill Date</label>
                  <input
                    required
                    type="date"
                    value={fuelForm.date}
                    onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Fuel Station / Vendor</label>
                <input
                  type="text"
                  value={fuelForm.station}
                  onChange={(e) => setFuelForm({ ...fuelForm, station: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  Save Fuel Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-emerald-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-emerald-500/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Car size={16} className="text-emerald-400" />
                Register Vehicle in Fleet
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Plate Number</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. LEA-2024-1122"
                    value={form.plateNumber}
                    onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Vehicle Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Delivery Bike">Delivery Bike</option>
                    <option value="Van / Pickup">Van / Pickup</option>
                    <option value="Executive Car">Executive Car</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Make &amp; Model</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Honda CG 125, Suzuki Bolan"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Driver Assigned</label>
                  <select
                    value={form.assignedDriverId}
                    onChange={(e) => setForm({ ...form, assignedDriverId: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">None (Pool Vehicle)</option>
                    {hrEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} &bull; {emp.department}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Current Odometer (KM)</label>
                  <input
                    type="number"
                    value={form.odometerKm}
                    onChange={(e) => setForm({ ...form, odometerKm: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
