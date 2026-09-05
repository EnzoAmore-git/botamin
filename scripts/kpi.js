/**
 * KPI Module - renders Key Performance Indicator cards
 * Implements Task 7-8 from specs
 */

/**
 * Агрегирует данные звонков и рассчитывает KPI метрики
 * @param {Array} calls - Массив валидных записей звонков
 * @returns {Object} - Объект с рассчитанными KPI
 */
function calculateKPI(calls) {
    // totalCalls: общее количество звонков
    const totalCalls = calls.length;

    // callsWithDialogue: звонки где result != 'dropped_before_dialogue'
    const callsWithDialogue = calls.filter(c => c.result !== 'dropped_before_dialogue').length;

    // callsWithoutDialogue: звонки где result == 'dropped_before_dialogue'
    const callsWithoutDialogue = calls.filter(c => c.result === 'dropped_before_dialogue').length;

    // botCompletions: звонки где result == 'completed'
    const botCompletions = calls.filter(c => c.result === 'completed').length;

    // conversionToMeeting: процент звонков где result == 'meeting_scheduled'
    const meetingScheduled = calls.filter(c => c.result === 'meeting_scheduled').length;
    const conversionToMeeting = totalCalls > 0
        ? (meetingScheduled / totalCalls * 100).toFixed(1)
        : 0;

    return {
        totalCalls,
        callsWithDialogue,
        callsWithoutDialogue,
        botCompletions,
        conversionToMeeting: parseFloat(conversionToMeeting)
    };
}

/**
 * Рассчитывает тренд, сравнивая первуюHalf данных со второйHalf (по timestamp)
 * Это обходит проблему когда все timestamps в одном диапазоне
 * @param {Array} calls - Массив валидных записей звонков
 * @returns {Object} - Объект с трендами для каждой метрики
 */
function calculateHalfTrends(calls) {
    // Сортируем по timestamp
    const sorted = [...calls].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Разделяем на первую и вторую половину
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);

    // Считаем метрики для каждой половины
    function calcMetrics(data) {
        const total = data.length;
        const withDialogue = data.filter(c => c.result !== 'dropped_before_dialogue').length;
        const withoutDialogue = data.filter(c => c.result === 'dropped_before_dialogue').length;
        const botCompleted = data.filter(c => c.result === 'completed').length;
        const meetings = data.filter(c => c.result === 'meeting_scheduled').length;
        const conversion = total > 0 ? (meetings / total * 100) : 0;

        return { total, withDialogue, withoutDialogue, botCompleted, conversion: parseFloat(conversion) };
    }

    const first = calcMetrics(firstHalf);
    const second = calcMetrics(secondHalf);

    // Рассчитываем тренд
    // Если previous === 0 (второй половины нет), возвращаем 100 если есть данные, иначе 0
    function calcTrend(curr, prev) {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev * 100);
    }

    // Округляем тренд до 1 decimal
    function formatTrend(val) {
        return Math.round(val * 10) / 10; // round to 1 decimal
    }

    return {
        total: {
            first: first.total,
            second: second.total,
            trend: formatTrend(calcTrend(second.total, first.total))
        },
        withDialogue: {
            first: first.withDialogue,
            second: second.withDialogue,
            trend: formatTrend(calcTrend(second.withDialogue, first.withDialogue))
        },
        withoutDialogue: {
            first: first.withoutDialogue,
            second: second.withoutDialogue,
            trend: formatTrend(calcTrend(second.withoutDialogue, first.withoutDialogue))
        },
        botCompleted: {
            first: first.botCompleted,
            second: second.botCompleted,
            trend: formatTrend(calcTrend(second.botCompleted, first.botCompleted))
        },
        conversion: {
            first: first.conversion,
            second: second.conversion,
            trend: formatTrend(calcTrend(second.conversion, first.conversion))
        }
    };
}

/**
 * Форматирует число с разделителями (1 234)
 * @param {number} num - Число для форматирования
 * @returns {string} - Отформатированная строка
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/u, ' ');
}

/**
 * Рассчитывает направление тренда (up/down/neutral)
 * @param {number} trendValue - Числовое значение тренда
 * @returns {string} - Направление тренда
 */
function getTrendDirection(trendValue) {
    if (trendValue > 0) return 'up';
    if (trendValue < 0) return 'down';
    return 'neutral';
}

/**
 * Рендерит KPI карточки в HTML контейнер
 * @param {Array} calls - Массив валидных звонков
 * @param {string} containerId - ID HTML контейнера (по умолчанию #kpi-container)
 */
function renderKPI(calls, containerId = '#kpi-container') {
    const trends = calculateHalfTrends(calls);
    const container = document.querySelector(containerId);

    if (!container) {
        console.error(`KPI container not found: ${containerId}`);
        return;
    }

    container.innerHTML = `
        <div class="kpi-grid">
            <!-- Total Calls Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(trends.total.first)}</div>
                <div class="kpi-label">Всего звонков</div>
                <div class="kpi-trend ${getTrendDirection(trends.total.trend) ? getTrendDirection(trends.total.trend) === 'up' ? 'trend-up' : 'trend-down' : 'trend-neutral'}">
                    ${trends.total.trend > 0 ? '↑' : trends.total.trend < 0 ? '↓' : '→'} ${trends.total.trend > 0 ? '+' : ''}${trends.total.trend}% за период
                </div>
            </div>

            <!-- Calls with Dialogue Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(trends.withDialogue.first)}</div>
                <div class="kpi-label">Звонки с диалогом</div>
                <div class="kpi-trend ${getTrendDirection(trends.withDialogue.trend) === 'up' ? 'trend-up' : getTrendDirection(trends.withDialogue.trend) === 'down' ? 'trend-down' : 'trend-neutral'}">
                    ${trends.withDialogue.trend > 0 ? '↑' : trends.withDialogue.trend < 0 ? '↓' : '→'} ${trends.withDialogue.trend > 0 ? '+' : ''}${trends.withDialogue.trend}% за период
                </div>
            </div>

            <!-- Calls without Dialogue Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(trends.withoutDialogue.first)}</div>
                <div class="kpi-label">Звонки без диалога</div>
                <div class="kpi-trend ${getTrendDirection(trends.withoutDialogue.trend) === 'up' ? 'trend-up' : getTrendDirection(trends.withoutDialogue.trend) === 'down' ? 'trend-down' : 'trend-neutral'}">
                    ${trends.withoutDialogue.trend > 0 ? '↑' : trends.withoutDialogue.trend < 0 ? '↓' : '→'} ${trends.withoutDialogue.trend > 0 ? '+' : ''}${trends.withoutDialogue.trend}% за период
                </div>
            </div>

            <!-- Bot Completions Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(trends.botCompleted.first)}</div>
                <div class="kpi-label">Завершения бота</div>
                <div class="kpi-trend ${getTrendDirection(trends.botCompleted.trend) === 'up' ? 'trend-up' : getTrendDirection(trends.botCompleted.trend) === 'down' ? 'trend-down' : 'trend-neutral'}">
                    ${trends.botCompleted.trend > 0 ? '↑' : trends.botCompleted.trend < 0 ? '↓' : '→'} ${trends.botCompleted.trend > 0 ? '+' : ''}${trends.botCompleted.trend}% за период
                </div>
            </div>

            <!-- Conversion to Meeting Card -->
            <div class="kpi-card">
                <div class="kpi-value">${trends.conversion.first.toFixed(1)}%</div>
                <div class="kpi-label">Конверсия во встречу</div>
                <div class="kpi-trend ${getTrendDirection(trends.conversion.trend) === 'up' ? 'trend-up' : getTrendDirection(trends.conversion.trend) === 'down' ? 'trend-down' : 'trend-neutral'}">
                    ${trends.conversion.trend > 0 ? '↑' : trends.conversion.trend < 0 ? '↓' : '→'} ${trends.conversion.trend > 0 ? '+' : ''}${trends.conversion.trend}% за период
                </div>
            </div>
        </div>
    `;
}

/**
 * Экспортирует функции для использования в других модулях
 */
export { calculateKPI, renderKPI, formatNumber, getTrendDirection };