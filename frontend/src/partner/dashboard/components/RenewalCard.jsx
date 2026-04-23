import { Calendar } from "lucide-react";
import React from "react";

const renewalColorClasses = {
  partner_red: {
    card: "border-partner_red bg-partner_red/10",
    text: "text-partner_red",
  },
  yellow: {
    card: "border-yellow bg-yellow/10",
    text: "text-yellow",
  },
  onboard_primary: {
    card: "border-onboard_primary bg-onboard_primary/10",
    text: "text-onboard_primary",
  },
};

const RenewalCard = () => {
  const renewalData = [
    {
      id: 1,
      title: "Pulse Pro Gym",
      amount: "₹ 5,00,000",
      day_left: "0 days Left",
      date: "12 Mar 26",
      color: "partner_red",
    },
    {
      id: 2,
      title: "Zenith Yoga Studio",
      amount: "₹ 80,000",
      day_left: "5 days Left",
      date: "15 Mar 26",
      color: "yellow",
    },
    {
      id: 3,
      title: "Fit Fury  Fitness",
      amount: "₹ 1,20,000",
      day_left: "10 days Left",
      date: "20 Mar 26",
      color: "onboard_primary",
    },
  ];
  return (
    <div className="flex flex-col gap-3">
      {renewalData?.map((renewal) => {
        const colorClass =
          renewalColorClasses[renewal.color] ||
          renewalColorClasses.onboard_primary;

        return (
          <div
            key={renewal.id}
            className={`flex flex-col rounded-lg border p-3 gap-4 ${colorClass.card}`}
          >
            <div className="flex justify-between">
              <div>{renewal.title}</div>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-2">
                <span className={`text-xs items-center gap-1 flex`}>
                  <Calendar size={12} />
                  {renewal.date}
                </span>
                <span
                  className={`text-xs items-center gap-1 flex ${colorClass.text}`}
                >
                  {renewal.day_left}
                </span>
              </div>
              <div className="text-partner_green font-semibold">
                {renewal.amount}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RenewalCard;
