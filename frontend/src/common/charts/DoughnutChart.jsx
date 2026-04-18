import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({
    values = [],
    labels = [],
    colors = [],
    cutout = "70%",
}) => {
    const data = {
        labels: labels,
        datasets: [
            {
                data: values,
                backgroundColor: colors,
                borderWidth: 0,
                borderRadius: 25,
                spacing: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                position: "bottom",
                align: "start",
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    boxWidth: 10,
                    boxHeight: 10,
                    padding: 15,
                    generateLabels: (chart) => {
                        const data = chart.data;

                        if (data.labels && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const backgroundColor = data.datasets[0].backgroundColor[i];

                                return {
                                    text: `${label} - ${value}`, // 👈 label + value
                                    fillStyle: backgroundColor,
                                    strokeStyle: backgroundColor,
                                    lineWidth: 0,
                                    hidden: !chart.getDataVisibility(i),
                                    index: i,
                                };
                            });
                        }
                        return [];
                    },
                },
            },
            datalabels: {
                display: false,
            },

        },
        cutout: cutout, // controls thickness
    };

    return <div>
        <Doughnut data={data} options={options} />

        {/* Custom Vertical Legend */}
        <div className="flex flex-col gap-3 mt-4">
            {labels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[i] }}
                    />
                    <span className="text-sm">
                        {label} - {values[i]}%
                    </span>
                </div>
            ))}
        </div>
    </div>;
};

export default DoughnutChart;