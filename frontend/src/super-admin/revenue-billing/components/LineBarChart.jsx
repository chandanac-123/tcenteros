import { FileBadge, Handshake, Network, Split, RefreshCw } from "lucide-react";
import React from "react";

const LineBarChart = ({ data = [], colors = [] }) => {
  const icons = [FileBadge, RefreshCw, Handshake, Split, Network];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        {data.map((item, i) => {
          const Icon = icons[i % icons.length];
          const barColor = colors[i % colors.length] || "#344BFD";

          return (
            <div
              key={i}
              className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm px-6 py-2"
            >
              {/* Top Section */}
              <div className="flex items-start justify-between gap-4">
                {/* Left Side */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-full bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-[#1452D4]" />
                  </div>

                  {/* Label + Progress */}
                  <div className="flex-1">
                    {/* Label */}
                    <p className="text-[16px] font-medium text-[#1F2937] mb-4">
                      {item?.label}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item?.percentage || 0}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end gap-3 min-w-[120px]">
                  {/* Percentage + Dot */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#111827]">
                      {item?.percentage || 0} %
                    </span>
                    <span
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: barColor }}
                    />
                  </div>

                  {/* Value */}
                  <p className="text-lg font-semibold text-[#111827] leading-none">
                    ₹{Number(item?.value || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LineBarChart;
