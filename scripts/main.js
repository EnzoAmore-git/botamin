/**
 * Voice Bot Analytics Dashboard - Main Entry Point
 */

import '../styles/main.css';
import { renderKPI } from './kpi.js';
import { renderFunnel } from './funnel.js';
import { initDynamics } from './dynamics.js';
import { renderComparison, initDefaultComparison } from './comparison.js';
import { calculateInsights, renderInsights } from './insights.js';

// ==========================================================================
// Task 4: JSON Schema Validation
// ==========================================================================
function isValidCallRecord(call) {
    const requiredFields = ['callId', 'timestamp', 'duration', 'stage', 'result', 'hour', 'dayOfWeek'];
    for (const field of requiredFields) {
        if (call[field] === undefined || call[field] === null || call[field] === '') return false;
    }
    const validStages = ['greeting', 'offer', 'proposal', 'agreement'];
    const validResults = ['dropped_before_dialogue', 'dropped_during_dialogue', 'completed', 'meeting_scheduled'];
    if (!validStages.includes(call.stage) || !validResults.includes(call.result)) return false;
    if (typeof call.duration !== 'number' || call.duration < 0) return false;
    if (call.hour < 0 || call.hour > 23 || call.dayOfWeek < 0 || call.dayOfWeek > 6) return false;
    return true;
}

function filterValidCalls(calls) {
    return calls.filter(call => isValidCallRecord(call));
}

// ==========================================================================
// Task 5: Data Loading
// ==========================================================================
const DataModule = (() => {
    let callsData = [];
    let isError = false;

    async function loadData() {
        showLoadingState();
        try {
            const response = await fetch('./data/calls-sample.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const parsed = await response.json();
            callsData = filterValidCalls(parsed);
            console.info(`✅ Loaded ${callsData.length} valid calls`);
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            isError = true;
            showErrorState(error.message);
        } finally {
            hideLoadingState();
        }
    }

    return { loadData, getData: () => callsData, isError };
})

// ==========================================================================
// UI State Helpers
// ==========================================================================
function showLoadingState() {
    let overlay = document.getElementById('app-loading');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'app-loading';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner"></div><p>Loading data...</p>';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

function hideLoadingState() {
    const overlay = document.getElementById('app-loading');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showErrorState(message) {
    hideLoadingState();
    const container = document.getElementById('kpi-container') || document.body;
    container.innerHTML = `
        <div class="error-message" style="padding: 2rem; text-align: center; color: var(--danger-color);">
            <h3>Error loading data</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">Retry</button>
        </div>
    `;
}

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Dashboard initializing...');
    
    // 1. Загружаем данные
    await DataModule.loadData();

    // 2. Если ошибка, прерываем (она уже показана в showErrorState)
    if (DataModule.isError) return;

    const validData = DataModule.getData();
    if (validData.length === 0) {
        showErrorState('No valid data to display');
        return;
    }

    // 3. Рендерим KPI
    try {
        console.log('📊 Rendering KPI...');
        renderKPI(validData);
        console.log('✅ KPI rendered successfully');
    } catch (error) {
        console.error('❌ Error in renderKPI:', error);
        showErrorState('Error rendering KPI: ' + error.message);
    }

    // 4. Рендерим Фанул
    try {
        console.log('📈 Rendering Funnel...');
        renderFunnel(validData);
        console.log('✅ Funnel rendered successfully');
    } catch (error) {
        console.error('❌ Error in renderFunnel:', error);
        // Не показываем ошибку пользователю, логируем в консоль
    }

    // 5. Инициализируем Dynamics
    try {
        console.log('🤖 Initializing Dynamics...');
        initDynamics(validData);
        console.log('✅ Dynamics initialized successfully');
    } catch (error) {
        console.error('❌ Error in initDynamics:', error);
    }

    // 6. Инициализация модуля сравнения периодов
    try {
        console.log('📊 Initializing Comparison...');
        initDefaultComparison(validData);
        console.log('✅ Comparison initialized successfully');
    } catch (error) {
        console.error('❌ Error in Comparison:', error);
    }

    // 7. Генерируем и отображаем инсайты
    try {
        console.log('📊 Initializing Insights...');
        const insights = calculateInsights(validData);
        renderInsights(insights);
        console.log('✅ Insights rendered successfully');
    } catch (error) {
        console.error('❌ Error in Insights:', error);
    }

    // 8. Сохраняем данные в глобальную переменную
    window.callsData = validData;
    console.info('🎉 Dashboard initialized with', validData.length, 'valid call records');
});