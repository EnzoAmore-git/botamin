## MODIFIED Requirements

### Воронка конверсии по этапам

#### Scenario: Funnel shows conversion percentages at each stage
Given the funnel visualization is displayed on the dashboard
When the stages are shown (Приветствие -> Оффер -> Предложение встречи -> Согласие)
Then each stage displays conversion percentage and absolute losses
And the step with highest drop-off is visually identifiable within 10 seconds

#### Scenario: Funnel data matches source call logs
Given the call logs are the source of truth for calculation
When the funnel is calculated from the data
Then the percentages and losses match the absolute counts in the logs