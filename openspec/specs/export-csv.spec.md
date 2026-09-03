## MODIFIED Requirements

### Экспорт данных

#### Scenario: KPI data can be exported to CSV format
Given the analytics dashboard is displaying KPI metrics
When the user clicks the export CSV button
Then the data is downloaded in CSV format with all KPI columns
And the exported file contains correct values matching the dashboard display