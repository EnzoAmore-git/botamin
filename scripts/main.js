/**
 * Voice Bot Analytics Dashboard - Main Entry Point
 */

import '../styles/main.css';
import { renderKPI } from './kpi.js';
import { renderFunnel } from './funnel.js';
import { initDynamics } from './dynamics.js';
import { renderComparison, initDefaultComparison } from './comparison.js';
import { calculateInsights, renderInsights } from './insights.js';
import { createExportButton } from './export.js';

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
})();

// ==========================================================================
// UI State Helpers
// ==========================================================================
function showLoadingState() {
    let overlay = document.getElementById('app-loading');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'app-loading';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner"></div><p>Загрузка данных...</p>';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

function hideLoadingState() {
    const overlay = document.getElementById('app-loading');
    if (overlay) overlay.style.display = 'none';
}

function showErrorState(message) {
    hideLoadingState();
    const container = document.getElementById('kpi-container') || document.body;
    container.innerHTML = `
        <div class="error-message" style="padding: 2rem; text-align: center; color: var(--danger-color);">
            <h3>Ошибка загрузки данных</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">Повторить</button>
        </div>
    `;
}

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log(' Dashboard initializing...');
    
    await DataModule.loadData();
    if (DataModule.isError) return;

    const validData = DataModule.getData();
    if (validData.length === 0) {
        showErrorState('Нет валидных данных');
        return;
    }

    // Task 7-8: KPI
    try {
        console.log('📊 Rendering KPI...');
        renderKPI(validData);
        console.log('✅ KPI rendered successfully');
    } catch (error) {
        console.error('❌ Error in renderKPI:', error);
    }

    // Task 9-10: Funnel
    try {
        console.log('📊 Rendering Funnel...');
        renderFunnel(validData);
        console.log('✅ Funnel rendered successfully');
    } catch (error) {
        console.error(' Error in renderFunnel:', error);
    }

    // Task 11-12: Dynamics
    try {
        console.log(' Initializing Dynamics...');
        initDynamics(validData);
        console.log('✅ Dynamics initialized successfully');
    } catch (error) {
        console.error('❌ Error in initDynamics:', error);
    }

    // Task 13-14: Comparison - ВРЕМЕННО ОТКЛЮЧЕН
  
    try {
        console.log('📊 Initializing Comparison...');
        initDefaultComparison(validData);
        console.log('✅ Comparison initialized successfully');
    } catch (error) {
        console.error('❌ Error in Comparison:', error);
    }


    // Task 15-16: Insights
    try {
        console.log('📊 Initializing Insights...');
        const insights = calculateInsights(validData);
        renderInsights(insights);
        console.log('✅ Insights rendered successfully');
    } catch (error) {
        console.error('❌ Error in Insights:', error);
    }

    window.callsData = validData;
    console.info('🎉 Dashboard initialized with', validData.length, 'valid call records');

    // Task 17-18: Export
    try {
        console.log('📊 Initializing Export...');
        const exportContainer = document.getElementById('export-container');
        if (exportContainer && window.callsData) {
            const exportButton = createExportButton(window.callsData);
            exportContainer.appendChild(exportButton);
            console.log('✅ Export initialized successfully');
        }
    } catch (error) {
        console.error('❌ Error in Export:', error);
    }
});