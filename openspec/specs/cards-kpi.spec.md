## MODIFIED Requirements

### KPI-карточки

#### Scenario: KPI cards display correct metrics on initial load
Given the analytics dashboard is loaded for the first time
When the KPI cards are rendered
Then the cards show total calls, calls with dialogue, calls without dialogue, bot completions, and conversion to meeting
And the weekly dynamic is calculated automatically

#### Scenario: KPI cards update when new call data arrives
Given new call data is received by the bot after the dashboard is loaded
When the dashboard refreshes
Then the KPI cards reflect the updated metrics in real-time