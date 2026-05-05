import { Calendar } from "lucide-react";
import React from "react";

const statusColorClasses = {
  expired: {
    card: "border-partner_red bg-partner_red/10",
    text: "text-partner_red",
  },
  upcoming: {
    card: "border-partner_yellow bg-partner_yellow/10",
    text: "text-partner_yellow",
  },
  active: {
    card: "border-onboard_primary bg-onboard_primary/10",
    text: "text-onboard_primary",
  },
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

const RenewalCard = ({ data = [] }) => {
  return (
    <div className="flex flex-col gap-3">
      {data?.renewals?.map((renewal) => {
        const colorClass =
          statusColorClasses[renewal?.status] || statusColorClasses?.upcoming;

        const daysText =
          renewal.days_until < 0
            ? `${Math.abs(renewal?.days_until)} days overdue`
            : `${renewal?.days_until} days left`;

        return (
          <div
            key={renewal?.lead_id}
            className={`flex flex-col rounded-lg border p-3 gap-4 ${colorClass.card}`}
          >
            {/* TITLE */}
            <div className="flex justify-between">
              <div className="text-textblack font-medium">
                {renewal?.lead_name}
              </div>
            </div>

            {/* DETAILS */}
            <div className="flex justify-between items-center">
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1 text-gray-600">
                  <Calendar size={12} />
                  {formatDate(renewal?.renewal_date)}
                </span>

                <span className={`flex items-center ${colorClass?.text}`}>
                  {daysText}
                </span>
              </div>

              {/* STATUS BADGE */}
              <div
                className={`text-xs font-medium capitalize ${colorClass?.text}`}
              >
                {renewal?.status}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RenewalCard;
