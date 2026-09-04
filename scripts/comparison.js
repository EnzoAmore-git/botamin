/**
 * Comparison Module - visualizes period-to-period comparisons
 * Implements Task 13-14 from specs
 */

/**
 * Парсит дату в формат ISO и возвращает день недели (0=Вс, 1=Пн, ..., 6=Сб)
 * @param {string|Date} date - Дата в формате ISO строки или объект Date
 * @returns {number} - День недели
 */
function getDayOfWeek(date) {
    if (!date) return null;
    if (date instanceof Date) return date.getDay();
    return new Date(date).getDay();
}

/**
 * Нормализует день недели для удобства расчетов: Пн=1, Вт=2, ..., Вс=7
 * @param {number} dow - День от Date.getDay() (0=Вс, 1=Пн, ..., 6=Сб)
 * @returns {number} - Нормализованный день (1=Пн, ..., 7=Вс)
 */
function normalizeDayOfWeek(dow) {
    return dow === 0 ? 7 : dow;
}

/**
 * Проверяет, попадает ли дата в период
 * @param {string|Date} date - Дата звонка
 * @param {Object} period - {start: ISO-date-string, end: ISO-date-string}
 * @returns {boolean} - Попадает ли дата в период
 */
function isInPeriod(date, period) {
    if (!period || !period.start || !period.end) return false;
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj >= new Date(period.start) && dateObj <= new Date(period.end);
}

function isPeriod(call, period) {
    if (!period || !period.start || !period.end) return false;
    return isInPeriod(call.timestamp, period);
}

/**
 * Сравнивает два периода и возвращает метрики для каждого
 * @param {Array} calls - Массив валидных звонков
 * @param {Object} period1 - {start: ISO-date-string, end: ISO-date-string}
 * @param {Object} period2 - {start: ISO-date-string, end: ISO-date-string}
 * @returns {Object} - Результат сравнения со всеми метриками
 */
function comparePeriods(calls, period1, period2) {
    // Фильтруем вызовы для каждого периода
    const period1Calls = calls.filter(call => isInPeriod(call.timestamp, period1));
    const period2Calls = calls.filter(call => isInPeriod(call.timestamp, period2));

    // Рассчитываем метрики для периода
    function calculateMetrics(calls) {
        const totalCalls = calls.length;

        // Конверсия: процент звонков с result === 'meeting_scheduled'
        const meetingScheduled = calls.filter(c => c.result === 'meeting_scheduled').length;
        const conversionRate = totalCalls > 0 ? (meetingScheduled / totalCalls * 100).toFixed(1) : 0;

        // Средняя длительность звонка
        const durations = calls.map(c => c.duration).filter(d => d > 0);
        const avgDuration = durations.length > 0
            ? (durations.reduce((sum, d) => sum + d, 0) / durations.length).toFixed(1)
            : 0;

        // Процент отвалов: звонки с result !== 'meeting_scheduled' и !== 'completed'
        const dropped = calls.filter(c => c.result !== 'meeting_scheduled' && c.result !== 'completed').length;
        const dropRate = totalCalls > 0 ? (dropped / totalCalls * 100).toFixed(1) : 0;

        return {
            totalCalls,
            conversionRate: parseFloat(conversionRate),
            avgDuration,
            dropRate: parseFloat(dropRate)
        };
    }

    const metrics1 = calculateMetrics(period1Calls);
    const metrics2 = calculateMetrics(period2Calls);

    // Рассчитываем изменение (прирост или убыток в процентах)
    function calcChange(prev, current) {
        if (prev === 0 && current === 0) return 0;
        if (prev === 0) return current > 0 ? 100 : 0;
        return ((current - prev) / prev * 100).toFixed(1);
    }

    const changeTotalCalls = calcChange(metrics1.totalCalls, metrics2.totalCalls);
    const changeConversion = calcChange(metrics1.conversionRate, metrics2.conversionRate);
    const changeDropRate = calcChange(metrics1.dropRate, metrics2.dropRate);

    // Определяем направление изменения (стрелка)
    function getArrow(change) {
        const num = parseFloat(change);
        if (num > 0) return '↑';
        if (num < 0) return '↓';
        return '→';
    }

    return {
        period1: { start: period1.start, end: period1.end, metrics: metrics1 },
        period2: { start: period2.start, end: period2.end, metrics: metrics2 },
        changes: {
            totalCalls: { value: metrics2.totalCalls - metrics1.totalCalls, arrow: getArrow(changeTotalCalls), percent: changeTotalCalls },
            conversionRate: { value: (metrics2.conversionRate - metrics1.conversionRate).toFixed(1), arrow: getArrow(changeConversion), percent: changeConversion },
            dropRate: { value: (metrics2.dropRate - metrics1.dropRate).toFixed(1), arrow: getArrow(changeDropRate), percent: changeDropRate }
        }
    };
}

/**
 * Рендерит сравнение периодов в HTML с bar chart Chart.js и таблицей метрик
 * @param {Array} calls - Массив валидных звонков
 * @param {Object} period1 - {start: ISO-date, end: ISO-date}
 * @param {Object} period2 - {start: ISO-date, end: ISO-date}
 * @param {string} containerId - ID контейнера (по умолчанию #comparison-container)
 */
function renderComparison(calls, period1, period2, containerId = '#comparison-container') {
    const container = document.querySelector(containerId);

    if (!container) {
        console.error(`Comparison container not found: ${containerId}`);
        return;
    }

    const comparison = comparePeriods(calls, period1, period2);
    const p1 = comparison.period1;
    const p2 = comparison.period2;
    const changes = comparison.changes;

    // Строим bar chart Chart.js
    if (typeof Chart !== 'undefined') {
        // Удаляем старый canvas если есть
        const existing = container.querySelector('canvas');
        if (existing) existing.remove();

        const ctx = document.createElement('canvas');
        ctx.width = container.clientWidth > 0 ? container.clientWidth : 600;
        ctx.height = 300;
        ctx.style.width = '100%';
        ctx.style.height = '300px';

        const maxY = Math.max(
            p1.metrics.totalCalls, p2.metrics.totalCalls,
            p1.metrics.conversionRate, p2.metrics.conversionRate,
            p1.metrics.avgDuration, p2.metrics.avgDuration,
            p1.metrics.dropRate, p2.metrics.dropRate
        ) * 1.2 || 100;

        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['totalCalls', 'conversion', 'avgDuration', 'dropRate'],
                datasets: [
                    {
                        label: `Период 1 (${p1.start} - ${p1.end})`,
                        data: [p1.metrics.totalCalls, p1.metrics.conversionRate, p1.metrics.avgDuration, p1.metrics.dropRate],
                        backgroundColor: 'rgba(53, 162, 235, 0.7)',
                        borderColor: 'rgba(53, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: `Период 2 (${p2.start} - ${p2.end})`,
                        data: [p2.metrics.totalCalls, p2.metrics.conversionRate, p2.metrics.avgDuration, p2.metrics.dropRate],
                        backgroundColor: 'rgba(251, 188, 9, 0.7)',
                        borderColor: 'rgba(251, 188, 9, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const metric = context.label;
                                const val = context.parsed.y;
                                const datasetIndex = context.datasetIndex + 1;
                                return `${metric}: ${val} (период ${datasetIndex})`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: maxY,
                        ticks: {
                            callback: function(value) {
                                if (typeof value === 'number' && value >= 100) {
                                    return value + '%';
                                }
                                return value;
                            }
                        }
                    }
                }
            }
        });

        container.appendChild(ctx);
    }

    // Определяем стрелочки для отображения
    function getArrow(change) {
        const num = parseFloat(change);
        if (num > 0) return '↑';
        if (num < 0) return '↓';
        return '→';
    }

    const arrowTotal = getArrow(changes.totalCalls.percent);
    const arrowConversion = getArrow(changes.conversionRate.percent);
    const arrowDrop = getArrow(changes.dropRate.percent);

    // Формируем HTML с метриками
    const metricRows = [
        {
            name: 'Всего звонков',
            p1Val: p1.metrics.totalCalls,
            p2Val: p2.metrics.totalCalls,
            change: changes.totalCalls.percent,
            arrow: arrowTotal
        },
        {
            name: 'Конверсия',
            p1Val: `${p1.metrics.conversionRate}%`,
            p2Val: `${p2.metrics.conversionRate}%`,
            change: changes.conversionRate.percent,
            arrow: arrowConversion
        },
        {
            name: 'Средняя длительность',
            p1Val: `${p1.metrics.avgDuration} сек`,
            p2Val: `${p2.metrics.avgDuration} сек`,
            change: `${changes.dropRate.percent > 0 ? '+' : ''}${changes.dropRate.percent}%`,
            arrow: '→'
        },
        {
            name: 'Потери (отвал)',
            p1Val: `${p1.metrics.dropRate}%`,
            p2Val: `${p2.metrics.dropRate}%`,
            change: changes.dropRate.percent,
            arrow: arrowDrop
        }
    ];

    const metricHTML = metricRows.map(metric => {
        const arrowClass = metric.arrow === '↑' ? 'arrow-up' : metric.arrow === '↓' ? 'arrow-down' : 'arrow-neutral';
        return `
            <div class="comparison-metric">
                <span class="metric-name">${metric.name}</span>
                <div class="metric-values">
                    <span class="p1-value">${metric.p1Val}</span>
                    <span class="p2-value">${metric.p2Val}</span>
                </div>
                <span class="change ${arrowClass}" title="${metric.arrow} ${metric.change}"></span>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="comparison-container">
            <div class="comparison-chart">${typeof Chart !== 'undefined' ? '<canvas></canvas>' : 'Chart.js not loaded'}</div>
            <div class="comparison-metrics">${metricHTML}</div>
        </div>
    `;
}

/**
 * Инициализирует сравнение с периодами по умолчанию (первая половина недели vs вторая)
 * @param {Array} calls - Массив валидных звонков
 * @param {string} containerId - ID контейнера
 */
function initDefaultComparison(calls, containerId = '#comparison-container') {
    // Пример периодов: Пн-Ср vs Чт-Пт
    const defaultPeriod1 = { start: '2026-01-01', end: '2026-01-03' }; // Пн-Ср
    const defaultPeriod2 = { start: '2026-01-04', end: '2026-01-06' }; // Чт-Сб

    renderComparison(calls, defaultPeriod1, defaultPeriod2, containerId);
}

/**
 * Экспортирует функции для использования в других модулях (ES module syntax)
 */
export {
    comparePeriods,
    renderComparison,
    initDefaultComparison,
    getDayOfWeek,
    normalizeDayOfWeek,
    isInPeriod
};