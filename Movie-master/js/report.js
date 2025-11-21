
$(document).ready(function () {
    let chartInstance = null;

    function fetchAndRender(mode = "monthly") {
        $.ajax({
            url: "http://localhost:8000/receipt/cinema_revenue",
            type: "GET",
            success: function (data) {
                let chartData = transformData(data, mode);
                renderChart(chartData.labels, chartData.datasets, mode);
            },
            error: function (err) {
                console.error("Lỗi tải dữ liệu:", err);
            }
        });
    }

    function transformData(data, mode) {
        let revenueByCinema = {};

        data.forEach(item => {
            const label = mode === "monthly" ? `${item.month}/${item.year}` : `${item.year}`;
            if (!revenueByCinema[item.cinema_name]) {
                revenueByCinema[item.cinema_name] = {};
            }
            if (!revenueByCinema[item.cinema_name][label]) {
                revenueByCinema[item.cinema_name][label] = 0;
            }
            revenueByCinema[item.cinema_name][label] += item.total_revenue;
        });

        const allLabels = [...new Set(
            Object.values(revenueByCinema).flatMap(obj => Object.keys(obj))
        )].sort((a, b) => {
            const [am, ay] = a.split('/').map(Number);
            const [bm, by] = b.split('/').map(Number);
            if (mode === "monthly") return ay === by ? am - bm : ay - by;
            return a - b;
        });

        const datasets = Object.entries(revenueByCinema).map(([cinema, values]) => ({
            label: cinema,
            data: allLabels.map(label => values[label] || 0),
            backgroundColor: getRandomColor()
        }));

        return { labels: allLabels, datasets: datasets };
    }

    function renderChart(labels, datasets, mode) {
        if (chartInstance) chartInstance.destroy();

        const ctx = document.getElementById('cinemaRevenueChart').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: mode === "monthly" ? "Doanh thu theo tháng" : "Doanh thu theo năm"
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        stacked: false,
                        title: {
                            display: true,
                            text: mode === "monthly" ? "Tháng/Năm" : "Năm"
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            autoSkip: false
                        }
                    },
                    y: {
                        stacked: false,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Doanh thu (VND)'
                        }
                    }
                }
            }
        });
    }

    function getRandomColor() {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
    }

    // Default view
    fetchAndRender("monthly");

    // Toggle buttons
    $("#view-monthly").click(() => fetchAndRender("monthly"));
    $("#view-yearly").click(() => fetchAndRender("yearly"));
});