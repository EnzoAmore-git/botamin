/**
 * Funnel Module - visualizes call conversion funnel
 * Implements Task 9-10 from specs
 */

import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

// Регистрируем компоненты Chart.js
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

/**
 * Агрегирует данные по этапам воронки конверсии
 * @param {Array} calls - Массив валидных звонков
 * @returns {Object} - Содержит данные для отрисовки воронки
 */
function calculateFunnel(calls) {
    const totalCalls = calls.length;

    // 4 этапа воронки в правильном порядке
    const stages = [
        { key: 'greeting', name: 'Приветствие', color: '#28a745' },
        { key: 'offer', name: 'Оффер', color: '#17a2b8' },
        { key: 'proposal', name: 'Предложение встречи', color: '#ffc107' },
        { key: 'agreement', name: 'Согласие', color: '#dc3545' }
    ];

    // Рассчитываем метрики для каждого этапа
    const stageData = stages.map((stage, stageIndex) => {
        // Количество звонков на текущем этапе
        const stageCalls = calls.filter(c => c.stage === stage.key);

        // Абсолютные потери: dropped_before_dialogue (до диалога) + dropped_during_dialogue (во время диалога)
        // На первых этапах: lost before dialogue
        // На последующих этапах: lost during dialogue (те кто не прошел предыдущие этапы)
        const lostBeforeDialogue = calls.filter(c =>
            c.result === 'dropped_before_dialogue'
        ).length;

        const lostDuringDialogue = calls.filter(c =>
            c.result === 'dropped_during_dialogue'
        ).length;

        // Для первого этапа losses = lost_before_dialogue
        // Для последующих этапов losses = those who dropped at earlier stages + during dialogue
        let absoluteLosses;

        if (stageIndex === 0) {
            // Первый этап: потери - это те кто сбросил без диалога
            absoluteLosses = lostBeforeDialogue;
        } else {
            // Последующие этапы: потери включают и предыдущие, и во время диалога
            // Находим количество звонков, прошедших предыдущие этапы
            let passedPrevious = totalCalls;
            for (let i = 0; i < stageIndex; i++) {
                passedPrevious = calls.filter(c => c.stage === stages[i].key).length;
            }
            absoluteLosses = (totalCalls - passedPrevious) + lostDuringDialogue;
        }

        // Процент конверсии от общего числа (1000)
        const conversionPercentage = totalCalls > 0
            ? ((stageCalls.length / totalCalls) * 100).toFixed(1)
            : 0;

        // Определяем, является ли этот этап "самым большим отвалом"
        // Сравниваем потери на каждом этапе
        const previousPassed = stageIndex > 0
            ? calls.filter(c => {
                // Проверяем, прошел ли звонок все предыдущие этапы
                let passed = true;
                for (let i = 0; i < stageIndex; i++) {
                    if (calls.some(c2 => c2.stage === stages[i].key && c2.result !== 'completed' && c2.result !== 'meeting_scheduled')) {
                        passed = false;
                    }
                }
                return passed && c.stage === stage.key;
            }).length
            : totalCalls;

        const currentRemaining = stageCalls.length;
        const dropRate = previousPassed > 0
            ? ((previousPassed - currentRemaining) / previousPassed * 100).toFixed(1)
            : 0;

        return {
            stage: stage.name,
            key: stage.key,
            color: stage.color,
            calls: stageCalls.length,
            percentage: conversionPercentage,
            absoluteLosses,
            dropRate,
            isBottleneck: stageIndex > 0 && dropRate >= 30 // More than 30% drop-off
        };
    });

    return {
        totalCalls,
        labels: ['Приветствие', 'Оффер', 'Предложение встречи', 'Согласие'],
        stageData,
        conversionFunnel: stageData.map(s => ({
            name: s.name,
            calls: s.calls,
            percentage: s.percentage,
            absoluteLosses: s.absoluteLosses,
            dropRate: s.dropRate,
            isBottleneck: s.isBottleneck
        }))
    };
}

/**
 * Рендерит воронку конверсии в HTML с использованием Chart.js
 * @param {Array} calls - Массив валидных звонков
 * @param {string} containerId - ID HTML контейнера (по умолчанию #funnel-container)
 */
function renderFunnel(calls, containerId = '#funnel-container') {
    const funnelData = calculateFunnel(calls);
    const container = document.querySelector(containerId);

    if (!container) {
        console.error(`Funnel container not found: ${containerId}`);
        return;
    }

    // Отладочная информация
    // Определяем этап с наибольшим отвалом (bottleneck)
    const bottleneck = funnelData.stageData.find(s => s.isBottleneck);
    const bottleneckColor = bottleneck ? bottleneck.color : '#6c757d';

    // Строка HTML для воронки без Chart.js (упрощенная версия)
    // Используем Chart.js если доступен, иначе fallback-версию
    let html = '';

    if (typeof Chart !== 'undefined') {
        // Chart.js версия
        // Сначала уничтожаем существующий chart если есть
        const existingChart = container.querySelector('canvas');
        if (existingChart) {
            existingChart.remove();
        }

        const ctx = document.createElement('canvas');
        ctx.width = container.clientWidth;
        ctx.height = 400;  // Явно задаем высоту
        ctx.style.height = '400px';  // И стиль
        ctx.style.width = '100%';

        // Находим максимальный процент для масштаба
        const maxPercentage = Math.max(...funnelData.stageData.map(s => s.percentage)) || 100;

        const chart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            indexAxis: 'y',
            data: {
                labels: funnelData.labels,
                datasets: [{
                    label: 'Звонки',
                    data: funnelData.stageData.map(s => s.calls),
                    backgroundColor: funnelData.stageData.map(s =>
                        s.isBottleneck ? '#dc3545' :
                        s === bottleneck ? bottleneckColor :
                            '#4e73df'
                    ),
                    hoverBackgroundColor: funnelData.stageData.map(s =>
                        s.isBottleneck ? '#a71a1a' :
                        s === bottleneck ? '#852020' :
                            '#2e59d9'
                    )
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const dataIndex = context.dataIndex;
                                const stageData = funnelData.stageData[dataIndex];
                                if (!stageData) return '';
                                return `${stageData.name}: ${stageData.calls} звонков (${stageData.percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value);
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: maxPercentage + 10
                    }
                }
            }
        });

        container.appendChild(ctx);  // Добавляем canvas элемент, а не Chart instance
        html = '<div class="funnel-chart"><canvas></canvas></div>';
    } else {
        // Fallback version без Chart.js - просто отображаем таблицу/графики
        html = `
            <div class="funnel-fallback">
                <div class="funnel-header">
                    <h6>Воронка конверсии</h6>
                    <small>Из ${funnelData.totalCalls} звонков</h6>
                </div>
                <div class="funnel-stages">
        `;

        funnelData.stageData.forEach((stage, idx) => {
            const isBottleneck = stage.isBottleneck;
            html += `
                <div class="funnel-stage ${isBottleneck ? 'bottleneck' : ''}">
                    <span style="color: ${isBottleneck ? '#dc3545' : '#495059'}">
                        ${stage.name}
                    </span>
                    <span style="font-weight: bold; color: ${isBottleneck ? '#dc3545' : '#495059'}">
                        ${stage.calls} звонков (${stage.percentage}%)
                    </span>
                    <span style="color: ${isBottleneck ? '#dc3545' : '#495059'}">
                        Потеряно: ${stage.absoluteLosses} (${stage.dropRate}% отсева)
                    </span>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;
    }

    // Добавляем информацию о bottleneckе
    const infoHtml = bottleneck
        ? `<div style="margin-top: 1rem; padding: 0.5rem; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
            <strong>⚠️ Точка отвала:</strong> ${bottleneck.name} — ${bottleneck.dropRate}% клиентов сбрасывают на этом этапе
        </div>`
        : '';

    if (!Chart || typeof Chart === 'undefined') {
        container.innerHTML = html + infoHtml;
    }
}

/**
 * Форматирует число с разделителями
 * @param {number} num - Число для форматирования
 * @returns {string} - Отформатированная строка
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/u, ' ');
}

/**
 * Экспортирует функции для использования в других модулях
 */
export { calculateFunnel, renderFunnel };