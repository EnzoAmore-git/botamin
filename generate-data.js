import fs from 'fs';

const stages = ['greeting', 'offer', 'proposal', 'agreement'];
const results = [
  'dropped_before_dialogue',
  'dropped_during_dialogue',
  'completed',
  'meeting_scheduled'
];

const calls = [];
const totalCalls = 1000;

for (let i = 1; i <= totalCalls; i++) {
  const stageIndex = Math.floor(Math.random() * stages.length);
  const stage = stages[stageIndex];
  
  let result;
  const rand = Math.random();
  if (stageIndex === 0) {
    result = rand < 0.4 ? 'dropped_before_dialogue' : 'dropped_during_dialogue';
  } else if (stageIndex === 1) {
    result = rand < 0.3 ? 'dropped_during_dialogue' : 'completed';
  } else if (stageIndex === 2) {
    result = rand < 0.2 ? 'dropped_during_dialogue' : 'meeting_scheduled';
  } else {
    result = 'meeting_scheduled';
  }

  const day = 1 + Math.floor(Math.random() * 30);
  const hour = Math.floor(Math.random() * 24);
  const dayOfWeek = Math.floor(Math.random() * 7);
  const duration = Math.floor(Math.random() * 300) + 30;

  calls.push({
    callId: `G${i.toString().padStart(4, '0')}`,
    timestamp: `2026-09-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:00:00`,
    duration: duration,
    stage: stage,
    result: result,
    hour: hour,
    dayOfWeek: dayOfWeek
  });
}

fs.writeFileSync('data/calls-sample.json', JSON.stringify(calls, null, 2));
console.log(`✅ Создано ${calls.length} записей звонков`);

// Статистика
const byResult = calls.reduce((acc, call) => {
  acc[call.result] = (acc[call.result] || 0) + 1;
  return acc;
}, {});

console.log('\n📊 Распределение по result:');
Object.entries(byResult).forEach(([key, count]) => {
  console.log(`  ${key}: ${count} (${((count/calls.length)*100).toFixed(1)}%)`);
});

const byStage = calls.reduce((acc, call) => {
  acc[call.stage] = (acc[call.stage] || 0) + 1;
  return acc;
}, {});

console.log('\n Распределение по stage:');
Object.entries(byStage).forEach(([key, count]) => {
  console.log(`  ${key}: ${count} (${((count/calls.length)*100).toFixed(1)}%)`);
});