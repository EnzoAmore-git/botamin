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

    // Недельная динамика: сравнение с предыдущей неделей по dayOfWeek
    // Анализируем распределение звонков по дням недели
    const dayDistribution = {};
    calls.forEach(call => {
        const day = call.dayOfWeek; // 0-6 (пн-вс)
        dayDistribution[day] = (dayDistribution[day] || 0) + 1;
    });

    // Рассчитываем тренд: сравниваем первую половину недели со второй
    // Пн-Ср (0-2) vs Чт-Пт (3-4) + Сб-Вс (5-6)
    const firstHalf = (dayDistribution[0] || 0) + (dayDistribution[1] || 0) + (dayDistribution[2] || 0);
    const secondHalf = (dayDistribution[3] || 0) + (dayDistribution[4] || 0) +
                       (dayDistribution[5] || 0) + (dayDistribution[6] || 0);

    let weeklyTrend = '0%';
    let trendDirection = 'neutral';

    if (firstHalf > 0 && secondHalf > 0) {
        const change = ((secondHalf - firstHalf) / firstHalf) * 100;
        weeklyTrend = change.toFixed(1) + '%';
        trendDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    } else if (firstHalf > 0) {
        weeklyTrend = '-%';
        trendDirection = 'down';
    }

    return {
        totalCalls,
        callsWithDialogue,
        callsWithoutDialogue,
        botCompletions,
        conversionToMeeting,
        weeklyTrend,
        trendDirection
    };
}

/**
 * Рендерит KPI карточки в HTML контейнер
 * @param {Array} calls - Массив валидных звонков
 * @param {string} containerId - ID HTML контейнера (по умолчанию #kpi-container)
 */
function renderKPI(calls, containerId = '#kpi-container') {
    const kpi = calculateKPI(calls);
    const container = document.querySelector(containerId);

    if (!container) {
        console.error(`KPI container not found: ${containerId}`);
        return;
    }

    const trendClass = kpi.trendDirection === 'up' ? 'trend-up' : kpi.trendDirection === 'down' ? 'trend-down' : 'trend-neutral';
    const trendIcon = kpi.trendDirection === 'up' ? '↑' : kpi.trendDirection === 'down' ? '↓' : '→';

    container.innerHTML = `
        <div class="kpi-grid">
            <!-- Total Calls Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(kpi.totalCalls)}</div>
                <div class="kpi-label">Всего звонков</div>
                <div class="kpi-trend ${trendClass}">${trendIcon} ${kpi.weeklyTrend} за неделю</div>
            </div>

            <!-- Calls with Dialogue Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(kpi.callsWithDialogue)}</div>
                <div class="kpi-label">Звонки с диалогом</div>
                <div class="kpi-trend ${trendClass}">${trendIcon} ${kpi.weeklyTrend} за неделю</div>
            </div>

            <!-- Calls without Dialogue Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(kpi.callsWithoutDialogue)}</div>
                <div class="kpi-label">Звонки без диалога</div>
                <div class="kpi-trend ${trendClass}">${trendIcon} ${kpi.weeklyTrend} за неделю</div>
            </div>

            <!-- Bot Completions Card -->
            <div class="kpi-card">
                <div class="kpi-value">${formatNumber(kpi.botCompletions)}</div>
                <div class="kpi-label">Завершения бота</div>
                <div class="kpi-trend ${trendClass}">${trendIcon} ${kpi.weeklyTrend} за неделю</div>
            </div>

            <!-- Conversion to Meeting Card -->
            <div class="kpi-card">
                <div class="kpi-value">${kpi.conversionToMeeting}%</div>
                <div class="kpi-label">Конверсия во встречу</div>
                <div class="kpi-trend ${trendClass}">${trendIcon} ${kpi.weeklyTrend} за неделю</div>
            </div>
        </div>
    `;
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
 * Экспортирует функции для использования в других модулях
 */
export { calculateKPI, renderKPI, formatNumber };
