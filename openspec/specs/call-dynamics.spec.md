## MODIFIED Requirements

### Распределение звонков

#### Scenario: Call dynamics graphs display correct data by day and hour
Given the dynamics charts are rendered on the dashboard
When displaying calls by day of week and hours of day
Then the charts show accurate distributions without errors
And duration distribution is visualized correctly

#### Scenario: Charts update when new call events arrive
Given new call events arrive after the dashboard is loaded
When the dashboard refreshes
Then all dynamic graphs update without errors