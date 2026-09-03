/**
 * Dynamics Module - visualizes call distribution and dynamics
 * Implements Task 11-12 from specs
 */

import { Chart, BarController, LineController, BarElement, LineElement, 
    CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Регистрируем компоненты Chart.js
Chart.register(BarController, LineController, BarElement, LineElement,
    CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

/**
 * Рассчитывает статистику длительности звонков
 * @param {Array} calls - Массив валидных звонков
 * @returns {Object} - Содержит min, max, average, total
 */
function calculateDurationStats(calls) {
    const durations = calls.map(c => c.duration).filter(d => d > 0);

    if (durations.length === 0) {
        return {
            min: 0,
            max: 0,
            average: '0 сек',
            total: calls.length
        };
    }

    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const average = (durations.reduce((sum, d) => sum + d, 0) / durations.length).toFixed(0);

    // Форматирование среднего времени в "мин сек"
    const avgMinutes = Math.floor(parseFloat(average) / 60);
    const avgSeconds = Math.round(parseFloat(average) % 60);
    const avgFormatted = avgMinutes > 0 ? `${avgMinutes} мин ${avgSeconds} сек` : `${avgSeconds} сек`;

    return {
        min,
        max,
        average: avgFormatted,
        total: calls.length
    };
}

/**
 * Определяет интервал длительности для гистограммы
 * @param {number} duration - Длительность в секундах
 * @returns {string} - Название интервала
 */
function getDurationInterval(duration) {
    if (duration <= 30) return '0-30 сек';
    if (duration <= 60) return '30-60 сек';
    if (duration <= 120) return '1-2 мин';
    if (duration <= 180) return '2-3 мин';
    if (duration <= 300) return '3-5 мин';
    return '5+ мин';
}

/**
 * Агрегирует данные для линейного графика (распределение по дням недели)
 * @param {Array} calls - Массив валидных звонков
 * @returns {Object} - Данные для Chart.js
 */
function calculateLineData(calls) {
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const data = {};

    // Инициализируем все дни нулями
    dayNames.forEach(day => data[day] = 0);

    // Считаем звонки по дням
    calls.forEach(call => {
        if (call.dayOfWeek >= 0 && call.dayOfWeek <= 6) {
            const dayName = dayNames[call.dayOfWeek];
            data[dayName] = (data[dayName] || 0) + 1;
        }
    });

    return {
        labels: dayNames,
        data: dayNames.map(day => data[day] || 0)
    };
}

/**
 * Агрегирует данные для столбчатого графика (распределение по часам)
 * @param {Array} calls - Массив валидных звонков
 * @returns {Object} - Данные для Chart.js
 */
function calculateBarData(calls) {
    const data = {};

    // Инициализируем все часы нулями
    for (let i = 0; i <= 23; i++) {
        data[i] = 0;
    }

    // Считаем звонки по часам
    calls.forEach(call => {
        if (call.hour >= 0 && call.hour <= 23) {
            data[call.hour] = (data[call.hour] || 0) + 1;
        }
    });

    return {
        labels: Array.from({ length: 24 }, (_, i) => i),
        data: Array.from({ length: 24 }, (_, i) => data[i] || 0)
    };
}

/**
 * Агрегирует данные для гистограммы (распределение длительности)
 * @param {Array} calls - Массив валидных звонков
 * @returns {Object} - Данные для Chart.js
 */
function calculateHistogramData(calls) {
    const intervals = ['0-30 сек', '30-60 сек', '1-2 мин', '2-3 мин', '3-5 мин', '5+ мин'];
    const data = {};

    // Инициализируем все интервалы нулями
    intervals.forEach(interval => data[interval] = 0);

    // Считаем звонки в каждый интервал
    calls.forEach(call => {
        const interval = getDurationInterval(call.duration);
        data[interval] = (data[interval] || 0) + 1;
    });

    return {
        labels: intervals,
        data: intervals.map(interval => data[interval] || 0)
    };
}

/**
 * Рендерит линейный график распределения по дням недели
 * @param {Array} calls - Массив валидных звонков
 * @param {string} containerId - ID HTML контейнера
 */
function renderLineChart(calls, containerId = '#line-chart') {
    const data = calculateLineData(calls);
    const container = document.querySelector(containerId);

    if (!container) {
        console.error(`Line chart container not found: ${containerId}`);
        return;
    }

    // Удаляем существующий canvas если есть
    const existing = container.querySelector('canvas');
    if (existing) existing.remove();

    const ctx = document.createElement('canvas');
    ctx.width = container.clientWidth;
    ctx.height = 300;
    ctx.style.width = '100%';
    ctx.style.height = '300px';

    const chart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Звонки по дням недели',
                data: data.data,
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78, 115, 223, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `День: ${context.label}, Звонков: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    container.appendChild(ctx);
}

/**
 * Рендерит столбчатый график распределения по часам суток
 * @param {Array} calls - Массив валидных звонков
 * @param {string} containerId - ID HTML контейнера
 */
function renderBarChart(calls, containerId = '#bar-chart') {
    const data = calculateBarData(calls);
    const container = document.querySelector(containerId);

    if (!container) {
        console.error(`Bar chart container not found: ${containerId}`);
        return;
    }

    // Удаляем существующий canvas если есть
    const existing = container.querySelector('canvas');
    if (existing) existing.remove();

    const ctx = document.createElement('canvas');
    ctx.width = container.clientWidth;
    ctx.height = 300;
    ctx.style.width = '100%';
    ctx.style.height = '300px';

    const chart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Звонки по часам',
                data: data.data,
                backgroundColor: '#28a745',
                hoverBackgroundColor: '#1e7e34'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Час: ${context.label}:00, Звонков: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value % 6 === 0 ? value : ''; // Показываем только целыеMultiples of 6
                        }
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    container.appendChild(ctx);
}

/**
 * Рендерит гистограмму распределения длительности звонков
 * @param {Array} calls - Массив валидных звонков
 * @param {string} containerId - ID HTML контейнера
 */
function renderHistogram(calls, containerId = '#histogram') {
    const data = calculateHistogramData(calls);
    const container = document.querySelector(containerId);

    if (!container) {
        console.error(`Histogram container not found: ${containerId}`);
        return;
    }

    // Удаляем существующий canvas если есть
    const existing = container.querySelector('canvas');
    if (existing) existing.remove();

    const ctx = document.createElement('canvas');
    ctx.width = container.clientWidth;
    ctx.height = 250;
    ctx.style.width = '100%';
    ctx.style.height = '250px';

    const chart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Распределение длительности',
                data: data.data,
                backgroundColor: '#ffc107',
                hoverBackgroundColor: '#d39e00'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Интервал: ${context.label}, Звонков: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    container.appendChild(ctx);
}

/**
 * Рендерит панель статистики длительности
 * @param {Array} calls - Массив валидных звонков
 * @param {string} containerId - ID HTML контейнера
 */
function renderDurationStats(calls, containerId = '#duration-stats') {
    const stats = calculateDurationStats(calls);
    const container = document.querySelector(containerId);

    if (!container) {
        console.error(`Duration stats container not found: ${containerId}`);
        return;
    }

    container.innerHTML = `
        <div class="duration-stats">
            <span>Всего звонков: ${stats.total}</span>
            <span>Минимальная длительность: ${stats.min} сек</span>
            <span>Максимальная длительность: ${stats.max} сек</span>
            <span>Средняя длительность: ${stats.average}</span>
        </div>
    `;
}

/**
 * Инициализирует все графики динамики
 * @param {Array} calls - Массив валидных звонков
 */
function initDynamics(calls) {
    renderLineChart(calls);
    renderBarChart(calls);
    renderHistogram(calls);
    renderDurationStats(calls);
}

/**
 * Экспортирует функции для использования в других модулях
 */
export {
    calculateDurationStats,
    calculateLineData,
    calculateBarData,
    calculateHistogramData,
    getDurationInterval,
    renderLineChart,
    renderBarChart,
    renderHistogram,
    renderDurationStats,
    initDynamics
};