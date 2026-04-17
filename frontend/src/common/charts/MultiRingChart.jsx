import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const MultiRingChart = ({ dataConfig, size = 260, display = true }) => {
  const baseCutout = 40; // center hole
  const step = 3; // distance between rings

  const datasets = dataConfig.map((item, index) => {
    return {
      label: item.label,
      data: [item.value, 100 - item.value],
      backgroundColor: [item.color, "#E6E6E6"],
      borderWidth: 3,
      borderRadius: 8, // smooth rounded ends
      cutout: `${baseCutout - index * step}%`, //  KEY FIX
    };
  });

  const data = { datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 360,
    plugins: {
      datalabels: { display: false },
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: size, height: size }}>
        <Doughnut data={data} options={options} />
      </div>

      {/* Legend */}
      {/* Legend */}
      {display && (
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 mt-6">
          {dataConfig.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">
                {item.label} – {item.value}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiRingChart;
