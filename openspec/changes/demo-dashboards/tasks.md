## Tasks

### Infrastructure
Task 1: Initialize Vite project for analytics dashboard
Priority: P0 Module: Infrastructure Description: Create new Vite project with HTML, CSS, JS setup
Acceptance Criteria:
- Vite project initialized with `npm create vite@latest`
- index.html created with proper DOCTYPE and viewport meta tag
- project compiles without errors (`npm run dev`)
Dependencies: none

Task 2: Set up project structure and folder layout
Priority: P0 Module: Infrastructure Description: Create folder structure: styles/, scripts/, data/
Acceptance Criteria:
- Folder structure matches design.md specification
- styles/main.css, scripts/main.js created
- data/ directory ready for JSON data
Dependencies: Task 1

Task 3: Add Chart.js and d3.js as dependencies
Priority: P0 Module: Infrastructure Description: Install Chart.js v4.4.0 and d3.js via npm
Acceptance Criteria:
- Chart.js and d3 installed in node_modules
- Imports work: `import { Line } from 'chartjs'`, `import * as d3 from 'd3'`
- Bootstrap 5.3.3 and Font Awesome 6.4.0 added
Dependencies: Task 1

### Data Layer
Task 4: Create JSON data schema validation
Priority: P1 Module: Data Layer Description: Implement JSON schema validation for call data
Acceptance Criteria:
- JSON schema validates required fields: callId, timestamp, duration, stage, result, hour, dayOfWeek
- Invalid data is filtered out without crashing application
- Validation errors logged to console without breaking UI
Dependencies: Task 1

Task 5: Implement data loading from JSON file
Priority: P1 Module: Data Layer Description: Create fetchData function to load calls-sample.json
Acceptance Criteria:
- Function reads data from data/calls-sample.json
- Returns parsed JavaScript array on success
- Handles 404/parse errors gracefully
Dependencies: Task 1

Task 6: Implement localStorage caching for KPI metrics
Priority: P2 Module: Data Layer Description: Save aggregated metrics to localStorage with 24h TTL
Acceptance Criteria:
- Data saved to localStorage under key 'dashboards-cache'
- Cache timestamp checked on load, stale cache ignored if older than 24h
- Fallback to fresh data load when cache expired
Dependencies: Task 4, Task 5

### KPI Module
Task 7: Create KPI render function in kpi.js
Priority: P0 Module: KPI Module Description: Implement renderKPI(data) function to display metric cards
Acceptance Criteria:
- Function accepts aggregated KPI data object
- Renders 5 cards: total calls, calls with dialogue, calls without dialogue, bot completions, conversion to meeting
- Weekly dynamic trend shown on each card
- Cards responsive: desktop shows 5 columns, tablet 3 columns, mobile 1 column
Dependencies: Task 1, Task 5

Task 8: Add KPI initialization and event listeners
Priority: P0 Module: KPI Module Description: Initialize KPI module when dashboard loads
Acceptance Criteria:
- KPI module called on window load
- Data passed from main.js to renderKPI
- No console errors on fresh load
Dependencies: Task 7, Task 5

### Funnel Module
Task 9: Create funnel render function in funnel.js
Priority: P0 Module: Funnel Module Description: Implement renderFunnel(data) visualization
Acceptance Criteria:
- Visualizes 4-stage funnel: Приветствие -> Оффер -> Предложение встречи -> Согласие
- Each stage shows conversion percentage and absolute losses
- Step with highest drop-off highlighted visually
- Analyst can identify highest drop-off step within 10 seconds of viewing
Dependencies: Task 1, Task 5

Task 10: Add funnel data aggregation logic
Priority: P1 Module: Funnel Module Description: Calculate conversion percentages from raw call data
Acceptance Criteria:
- Groups calls by stage in correct order
- Calculates percentage progressing from one stage to next
- Counts absolute losses at each stage (dropped_before_dialogue + dropped_during_dialogue + refusal)
Dependencies: Task 5, Task 9

### Dynamics Module
Task 11: Create dynamics render function in dynamics.js
Priority: P0 Module: Dynamics Module Description: Implement renderDynamics(data) for call distribution charts
Acceptance Criteria:
- Line chart: calls per day of week (0-6, пн-вс)
- Bar chart: calls per hour of day (0-23)
- Histogram: distribution of call durations
- All charts update responsively on window resize
Dependencies: Task 1, Task 5

Task 12: Add duration statistics calculation
Priority: P1 Module: Dynamics Module Description: Calculate min/max/average duration statistics
Acceptance Criteria:
- Statistics computed from call duration field
- Displayed alongside charts (e.g., "Avg: 3 min 45 sec")
- Handles edge case of zero-duration calls
Dependencies: Task 5, Task 11

### Comparison Module
Task 13: Create comparison render function in comparison.js
Priority: P1 Module: Comparison Module Description: Implement period comparison UI and logic
Acceptance Criteria:
- Toggle to switch between current week/previous week or current month/previous month
- Shows KPI metrics side-by-side for both periods
- Calculates and displays percentage differences for each metric
- Defaults to current week vs previous week comparison
Dependencies: Task 1, Task 5

Task 14: Add comparison data aggregation
Priority: P2 Module: Comparison Module Description: Split data into current and previous period arrays
Acceptance Criteria:
- Data filtered by timestamp week number
- Previous period = same range of previous week
- Both periods contain equal number of data points for fair comparison
Dependencies: Task 5, Task 13

### Insights Module
Task 15: Create insights render function in insights.js
Priority: P1 Module: Insights Module Description: Implement automatic business insights generation
Acceptance Criteria:
- Analyzes call data to find main drop-off stage
- Identifies optimal hours for calling (highest conversion rate)
- Generates 2-3 practical recommendations for bot scenario optimization
- Displayed in dedicated section below main charts
Dependencies: Task 1, Task 5, Task 9

Task 16: Add insights pattern detection logic
Priority: P2 Module: Insights Module Description: Implement pattern analysis for drop-off patterns
Acceptance Criteria:
- Detects if most drops happen at specific stage or time
- Identifies if drops occur more before or during dialogue
- Recommends scenario adjustments based on patterns
Dependencies: Task 5, Task 15, Task 9

### Export Module
Task 17: Create export function in export.js
Priority: P0 Module: Export Module Description: Implement export to CSV functionality
Acceptance Criteria:
- Button added to dashboard UI
- Click triggers CSV download with headers: callId, timestamp, duration, stage, result, hour, dayOfWeek
- Exported file contains correct values matching dashboard display
- Works when data loaded from JSON or localStorage cache
Dependencies: Task 1, Task 5

Task 18: Add export data formatting
Priority: P1 Module: Export Module Description: Format data rows for CSV output
Acceptance Criteria:
- Each call becomes one CSV row
- Categorical fields (stage, result) written as text labels
- Numeric fields (duration, hour, dayOfWeek) as numbers
- UTF-8 encoding for proper Russian text display
Dependencies: Task 5, Task 17

### Integration
Task 19: Wire all modules together in main.js
Priority: P0 Module: Integration Description: Initialize all modules in correct order
Acceptance Criteria:
- main.js loads data first, then calls all module initializers
- Order: data load -> KPI -> Funnel -> Dynamics -> Comparison -> Insights -> Export
- No module depends on another's internal state (only shared data)
- Dashboard displays correctly on first load at 1920x1080 resolution
Dependencies: Task 1, Task 4, Task 7, Task 9, Task 11, Task 13, Task 17

Task 20: Add responsive breakpoints and mobile support
Priority: P1 Module: Integration Description: Implement CSS media queries for tablet/mobile views
Acceptance Criteria:
- Dashboard works at 768x1024 (tablet) - funnel scales, KPI shows 3 columns
- Dashboard works at 375x667 (mobile) - KPI shows 1 column, funnel shows stacked bars
- Charts maintain readability on small screens
- Bootstrap grid used for layout consistency
Dependencies: Task 1, Task 7, Task 9, Task 11

### Testing
Task 21: Write unit tests for KPI calculations
Priority: P1 Module: Testing Description: Jest tests for KPI aggregation functions
Acceptance Criteria:
- Test file created: tests/unit/kpi.test.js
- Tests verify: total calls count, conversion percentage calculation, weekly dynamic trend
- All tests pass (`npm test`)
- 100% branch coverage for KPI module functions
Dependencies: Task 7

Task 22: Write E2E tests for critical scenarios
Priority: P1 Module: Testing Description: Playwright tests for key user flows
Acceptance Criteria:
- Test file: tests/e2e/dashboard.test.spec.js
- Tests cover: data loading, KPI display, funnel accuracy, CSV export
- Tests pass on Chrome headless mode
- Screenshot comparison for visual regression
Dependencies: Task 19, Task 21

Task 23: Add linting and code quality checks
Priority: P2 Module: Testing Description: ESLint configuration for project
Acceptance Criteria:
- ESLint configured with recommended rules
- `npm run lint` passes without errors
- Prettier configured for code formatting
Dependencies: Task 1

Task 24: Create sample data for testing
Priority: P1 Module: Data Layer Description: Generate calls-sample.json with realistic test data
Acceptance Criteria:
- JSON файл содержит минимум 1000 звонков
- Данные покрывают все этапы воронки (greeting, offer, proposal, agreement)
- Данные покрывают все результаты (dropped_before_dialogue, dropped_during_dialogue, completed, meeting_scheduled)
- Распределение по часам (0-23) и дням недели (0-6)
- Есть edge cases: zero-duration calls, incomplete records
Dependencies: Task 4, Task 5

Task 25: Add error boundary and loading states
Priority: P1 Module: Integration Description: Implement UI states for loading, error, empty data
Acceptance Criteria:
- Показ spinner/loader во время загрузки данных
- Показ error message если JSON не загрузился
- Показ "No data" если данные пустые после фильтрации
- Кнопка retry для повторной загрузки
Dependencies: Task 19