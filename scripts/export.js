export function generateCSV(calls) {
    const headers = ['callId', 'timestamp', 'duration', 'stage', 'result', 'hour', 'dayOfWeek'];
    const rows = [];

    // Add header row
    rows.push(headers.join(','));

    // Add data rows
    calls.forEach(call => {
        const row = [
            call.callId,
            call.timestamp,
            call.duration,
            call.stage,
            call.result,
            call.hour,
            call.dayOfWeek
        ];
        rows.push(row.join(','));
    });

    return rows.join('\n');
}

export function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportReport(calls) {
    const csvContent = generateCSV(calls);
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const filename = `bot-analytics-report-${year}-${month}-${day}.csv`;

    const metadata = [
        `Export Date: ${year}-${month}-${day}`,
        `Total Calls: ${calls.length}`,
        ``,
        ...generateCSV(calls)
    ];

    downloadCSV(metadata.join('\n'), filename);
}

export function createExportButton(calls) {
    const button = document.createElement('button');
    button.textContent = '📥 Скачать отчёт (CSV)';
    button.className = 'export-button';
    button.addEventListener('click', () => {
        exportReport(calls);
    });
    return button;
}