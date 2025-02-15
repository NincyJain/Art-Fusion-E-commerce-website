// public/js/analytics.js
document.addEventListener('DOMContentLoaded', function() {
    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 20,
                    font: {
                        family: "'Arial', sans-serif",
                        size: 12
                    }
                }
            }
        }
    };

    // Views Chart
    const viewsCtx = document.getElementById('monthlyViewsChart').getContext('2d');
    new Chart(viewsCtx, {
        type: 'line',
        data: {
            labels: monthlyViews.map(item => {
                const date = new Date(item.Month + '-01');
                return date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
                label: 'Monthly Views',
                data: monthlyViews.map(item => item.Views),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Sales Chart
    const salesCtx = document.getElementById('monthlySalesChart').getContext('2d');
    new Chart(salesCtx, {
        type: 'bar',
        data: {
            labels: monthlySales.map(item => {
                const date = new Date(item.Month + '-01');
                return date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
                label: 'Monthly Sales (₹)',
                data: monthlySales.map(item => item.TotalSales),
                backgroundColor: '#2196F3',
                borderRadius: 6
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Combined Chart
    const combinedCtx = document.getElementById('combinedChart').getContext('2d');
    new Chart(combinedCtx, {
        type: 'line',
        data: {
            labels: monthlyViews.map(item => {
                const date = new Date(item.Month + '-01');
                return date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
            }),
            datasets: [
                {
                    label: 'Views',
                    data: monthlyViews.map(item => item.Views),
                    borderColor: '#4CAF50',
                    yAxisID: 'y-views',
                    tension: 0.4
                },
                {
                    label: 'Sales (₹)',
                    data: monthlySales.map(item => item.TotalSales),
                    borderColor: '#2196F3',
                    yAxisID: 'y-sales',
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                'y-views': {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Views'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                'y-sales': {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Sales (₹)'
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
});