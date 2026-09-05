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
 * Рассчитывает недельную динамику для каждой метрики
 * @param {Array} calls - Массив валидных записей звонков
 * @returns {Object} - Объект с трендами для каждой метрики
 */
function calculateWeeklyTrends(calls) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Разделяем данные на текущую и прошлую неделю
    const currentWeek = calls.filter(c => new Date(c.timestamp) >= weekAgo);
    const previousWeek = calls.filter(c => {
        const d = new Date(c.timestamp);
        return d >= new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && d < weekAgo;
    });

    // Считаем метрики для каждой недели
    function calcMetrics(data) {
        const total = data.length;
        const withDialogue = data.filter(c => c.result !== 'dropped_before_dialogue').length;
        const withoutDialogue = data.filter(c => c.result === 'dropped_before_dialogue').length;
        const botCompleted = data.filter(c => c.result === 'completed').length;
        const meetingScheduled = data.filter(c => c.result === 'meeting_scheduled').length;
        const conversion = total > 0 ? (meetingScheduled / total * 100).toFixed(1) : 0;

        return { total, withDialogue, withoutDialogue, botCompleted, conversion: parseFloat(conversion) };
    }

    const current = calcMetrics(currentWeek);
    const previous = calcMetrics(previousWeek);

    // Рассчитываем тренд для каждой метрики
    function calcTrend(curr, prev) {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev * 100).toFixed(1);
    }

    return {
        total: {
            current: current.total,
            previous: previous.total,
            trend: calcTrend(current.total, previous.total)
        },
        withDialogue: {
            current: current.withDialogue,
            previous: previous.withDialogue,
            trend: calcTrend(current.withDialogue, previous.withDialogue)
        },
        withoutDialogue: {
            current: current.withoutDialogue,
            previous: previous.withoutDialogue,
            trend: calcTrend(current.withoutDialogue, previous.withoutDialogue)
        },
        botCompleted: {
            current: current.botCompleted,
            previous: previous.botCompleted,
            trend: calcTrend(current.botCompleted, previous.botCompleted)
        },
        conversion: {
            current: current.conversion,
            previous: previous.conversion,
            trend: calcTrend(current.conversion, previous.conversion)
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
 * Рендерит KPI карточки в HTML контейнер
 * @param {Array} calls - Массив валидных звонков
 * @param {string} containerId - ID HTML контейнера (по умолчанию #kpi-container)
 */
function renderKPI(calls, containerId = '#kpi-container') {
    const trends = calculateWeeklyTrends(calls);
    const container = document.querySelector(containerId);

    if (!container) {
        console.error(`KPI container not found: ${containerId}`);
        return;
    }

    function getTrendHtml(metricTrend, trendDirection) {
        const icon = trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '→';
        const className = trendDirection === 'up' ? 'trend-up' : trendDirection === 'down' ? 'trend-down' : 'trend-neutral';
        return `${icon} ${metricTrend}%`;
    }

    function getTrendClass(trendDirection) {
        return trendDirection === 'up' ? 'trend-up' : trendDirection === 'down' ? 'trend-down' : 'trend-neutral';
    }

    // Получаем направление тренда для каждой метрики
    function getTrendDirection(trendValue) {
        if (trendValue > 0) return 'up';
        if (trendValue < 0) return 'down';
        return 'neutral';
    }

    container.innerHTML = `
        <div class="kpi-grid">
            <!-- Total Calls Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(trends.total.current)}</div>
                <div class="kpi-label">Всего звонков</div>
                <div class="kpi-trend ${getTrendClass(getTrendDirection(trends.total.trend))}">${getTrendHtml(trends.total.trend, getTrendDirection(trends.total.trend))} за неделю</div>
            </div>

            <!-- Calls with Dialogue Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(trends.withDialogue.current)}</div>
                <div class="kpi-label">Звонки с диалогом</div>
                <div class="kpi-trend ${getTrendClass(getTrendDirection(trends.withDialogue.trend))}">${getTrendHtml(trends.withDialogue.trend, getTrendDirection(trends.withDialogue.trend))} за неделю</div>
            </div>

            <!-- Calls without Dialogue Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(trends.withoutDialogue.current)}</div>
                <div class="kpi-label">Звонки без диалога</div>
                <div class="kpi-trend ${getTrendClass(getTrendDirection(trends.withoutDialogue.trend))}">${getTrendHtml(trends.withoutDialogue.trend, getTrendDirection(trends.withoutDialogue.trend))} за неделю</div>
            </div>

            <!-- Bot Completions Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(trends.botCompleted.current)}</div>
                <div class="kpi-label">Завершения бота</div>
                <div class="kpi-trend ${getTrendClass(getTrendDirection(trends.botCompleted.trend))}">${getTrendHtml(trends.botCompleted.trend, getTrendDirection(trends.botCompleted.trend))} за неделю</div>
            </div>

            <!-- Conversion to Meeting Card -->
            <div class="kpi-card">
                <div class="kpi-value">${trends.conversion.current.toFixed(1)}%</div>
                <div class="kpi-label">Конверсия во встречу</div>
                <div class="kpi-trend ${getTrendClass(getTrendDirection(trends.conversion.trend))}">${getTrendHtml(trends.conversion.trend, getTrendDirection(trends.conversion.trend))} за неделю</div>
            </div>
        </div>
    `;
}

/**
 * Экспортирует функции для использования в других модулях
 */
export { calculateKPI, renderKPI, formatNumber };