"use client";

import React, { useRef } from "react";
import { useGlobalContext } from "@/context/global-context";
import { User, Award, Calendar, Building2, ShieldCheck, Clock, Sparkles, Camera } from "lucide-react";

export default function HRMSTopHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { currentUser, hrEmployees, updateCurrentUserAvatar, updateHREmployee } = useGlobalContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find employee matching logged-in user email
  const empMatch = hrEmployees.find(
    (e) => e.email?.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim()
  );

  const name = empMatch?.name || currentUser?.name || "Corporate Executive";
  const designation = empMatch?.designation || (currentUser?.role === "Owner" ? "Business Owner / Executive Director" : `${currentUser?.role || 'Executive'} Administrator`);
  const department = empMatch?.department || (currentUser?.email?.includes("it@") ? "IT & Software Operations" : currentUser?.email?.includes("hr@") ? "Human Resources" : "Executive Board");
  const joiningDateStr = empMatch?.joiningDate || "2024-01-15";
  const avatar = empMatch?.avatar || currentUser?.avatar;

  // Calculate Tenure
  const startDate = new Date(joiningDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays % 30;

  let tenureText = "";
  if (years > 0) tenureText += `${years}y `;
  if (months > 0) tenureText += `${months}m `;
  tenureText += `${days}d (${totalDays} Days Tenure)`;

  const formattedJoining = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 350;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        // Update both session user and employee object
        updateCurrentUserAvatar(dataUrl);
        if (empMatch) {
          updateHREmployee(empMatch.id, { avatar: dataUrl });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#090d16] border-b border-emerald-500/20 p-4 space-y-3">
      {/* Logged-In User Corporate Profile & Tenure Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/60 p-3 rounded-2xl border border-gray-800/80 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          {/* Avatar with Quick Upload Trigger */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
              title="Click to change your profile picture"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 group-hover:border-emerald-400 transition shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-base uppercase group-hover:border-emerald-400 transition shadow-md">
                  {name.slice(0, 2)}
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-[1px]">
                <Camera size={14} className="text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Logged-In Profile</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <strong className="text-sm font-black text-white">{name}</strong>
            </div>
          </div>

          <div className="hidden sm:block h-7 w-[1px] bg-gray-800"></div>

          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Designation / Role</span>
            <span className="text-xs font-extrabold text-emerald-400">{designation}</span>
          </div>

          <div className="hidden sm:block h-7 w-[1px] bg-gray-800"></div>

          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Department</span>
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1">
              <Building2 size={12} className="text-sky-400" /> {department}
            </span>
          </div>

          <div className="hidden md:block h-7 w-[1px] bg-gray-800"></div>

          <div className="hidden md:block">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Joining Date</span>
            <span className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1">
              <Calendar size={12} className="text-amber-400" /> {formattedJoining}
            </span>
          </div>
        </div>

        {/* Tenure Days Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-black shadow-md">
          <Award size={15} className="text-emerald-400 animate-pulse" />
          <span>{tenureText}</span>
        </div>
      </div>

      {title && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
