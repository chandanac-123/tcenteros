import React, { useRef, useState, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import CustomDatePicker from "@common/CustomeDatepicker";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const LineChart = ({ title, datasets, onYearChange }) => {
    const chartRef = useRef(null);
    const [selectedYear, setSelectedYear] = useState(new Date());
    console.log("SelectedYear", selectedYear);


    // 🔥 When year changes → inform parent
    useEffect(() => {
        onYearChange?.(selectedYear.getFullYear());
    }, [selectedYear]);

    const defaultLabels = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const data = {
        labels: defaultLabels,
        datasets: datasets.map(ds => ({
            ...ds,
            tension: 0,
            borderWidth: 2,
            pointRadius: 0,
        })),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            datalabels: {
                display: false   // ✅ hides values on line
            }
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                grid: { display: false },
                ticks: {
                    callback: v => v / 1000 + "k",
                },
            },
        },
    };

    return (
        <div className="w-full flex flex-col bg-white rounded-2xl p-4 shadow-lg">

            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                    {title}
                </h2>

                <div className="w-32">
                    <CustomDatePicker
                        pickerType="year"
                        value={selectedYear}
                        onChange={setSelectedYear}
                    />
                </div>
            </div>

            {/* Chart */}
            <div className="h-64 w-full">
                <Line ref={chartRef} data={data} options={options} />
            </div>
        </div>
    );
};

export default LineChart;