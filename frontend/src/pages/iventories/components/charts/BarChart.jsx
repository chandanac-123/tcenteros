import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarChart = ({ title, datasets }) => {
    const data = {
        labels: datasets.map((ds) => ds.label),
        datasets: [
            {
                data: datasets.map((ds) => ds.data[0]),
                backgroundColor: datasets.map((ds) => ds.backgroundColor),
                borderRadius: 6,
                barThickness: 40,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, // we already show labels on X-axis
        },
        scales: {
            x: {
                grid: { display: false },
            },
            y: {
                beginAtZero: true,
                grid: { color: "#e5e7eb" },
            },
        },
    };

    return (
        <div className="shadow-lg rounded-xl p-5 w-full max-w-md">
            {/* Header */}
          

            {/* Chart */}
            <div className="h-64">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default BarChart;