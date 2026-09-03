export function calculateInsights(calls) {
  // Найти bottleneck этап (с наибольшим количеством звонков)
  const stages = ['greeting', 'offer', 'proposal', 'agreement'];
  const stageCounts = {};
  calls.forEach(c => {
    stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
  });

  // Этап с наибольшим количеством звонков = bottleneck
  const bottleneck = stages.reduce((a, b) =>
    stageCounts[a] > stageCounts[b] ? a : b
  );

  // Найти лучший час (с наибольшим количеством звонков)
  const hourCounts = {};
  calls.forEach(c => {
    hourCounts[c.hour] = (hourCounts[c.hour] || 0) + 1;
  });
  const topHour = Object.keys(hourCounts).reduce((a, b) =>
    hourCounts[a] > hourCounts[b] ? a : b
  );

  // Вычислить среднюю длительность
  const durations = calls.map(c => c.duration).filter(d => d > 0);
  const avgDuration = durations.length > 0
    ? (durations.reduce((sum, d) => sum + d, 0) / durations.length).toFixed(0) + ' сек'
    : '0 сек';

  // Вычислить лучший день (с наибольшим количеством звонков)
  const dayCounts = {};
  calls.forEach(c => {
    if (c.dayOfWeek >= 0 && c.dayOfWeek <= 6) {
      dayCounts[c.dayOfWeek] = (dayCounts[c.dayOfWeek] || 0) + 1;
    }
  });
  let bestDay = 1;
  let bestDayCount = 0;
  Object.keys(dayCounts).forEach(dayStr => {
    const dayNum = parseInt(dayStr);
    if (dayCounts[dayStr] > bestDayCount) {
      bestDayCount = dayCounts[dayStr];
      bestDay = dayNum;
    }
  });

  return {
    bottleneck,
    topHour: parseInt(topHour),
    bestDay,
    avgDuration,
    recommendation: `Улучшить этап "${bottleneck}"`
  };
}

// Функция рендеринга инсайтов в HTML
export function renderInsights(insights) {
  console.log('📊 Rendering insights:', insights);
  const container = document.getElementById('insights-container');
  console.log('Container:', container);

  if (!container) {
    console.error(' insights-container not found!');
    return;
  }

  container.innerHTML = `
    <div class="insight-card bottleneck-alert">
      <h3>🔴 Точка оттока: ${insights.bottleneck}</h3>
      <p>Рекомендация: ${insights.recommendation}</p>
    </div>
    <div class="insight-card">
      <p>Лучший час: ${insights.topHour}:00</p>
      <p>Наилучший день: День ${insights.bestDay}</p>
      <p>Средняя длительность: ${insights.avgDuration}</p>
    </div>
  `;
  console.log('✅ Insights HTML rendered');
}