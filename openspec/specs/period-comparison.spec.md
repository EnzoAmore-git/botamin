## MODIFIED Requirements

### Сравнение периодов

#### Scenario: Period comparison shows metric differences between periods
Given the comparison module is active on the dashboard
When comparing current period with previous period (week/month)
Then all KPI and conversion metrics are shown for both periods
And differences are calculated and displayed correctly

#### Scenario: Period comparison handles missing data gracefully
Given missing data for one of the compared periods
When comparing periods with incomplete data
Then the module handles missing data gracefully without errors