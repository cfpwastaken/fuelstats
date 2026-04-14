# Fuel Stats

Statistics about the current fuel prices in Germany.

## Data

The data is collected from [Tankerkönig](https://creativecommons.tankerkoenig.de/) and is licensed under [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Tankerkönig themselves receive the data from the [Markttransparenzstelle für Kraftstoffe (MTS-K)](https://www.bundeskartellamt.de/DE/Aufgaben/MarkttransparenzstelleFuerKraftstoffe/MTS-K_Infotext/mts-k_node.html) (Bundeskartellamt). All fuel stations in Germany are required by law to report their prices there.

## Stats

Currently tracked statistics include:

- Average, minimum and maximum prices for each fuel type (E5, E10, Diesel)
	- Difference to the previous day
- Average price trend over time
- Price changes over time
	- Difference to the previous day
- [Illegal price changes](#illegal-price-changes)
- Hourly average price for individual fuel stations
- Historical price data for individual fuel stations

## Illegal price changes

Since 2026-04-01, fuel stations may only change their prices once per day at 12:00. Violations of this rule can result in fines of up to 100.000€.

The following statistics are tracked:

- Illegal price changes per day
	- Difference to the previous day
- Count of fuel stations with illegal price changes per day
	- Difference to the previous day
- Estimated fines
	- Difference to the previous day
- Top 10 ranking of brands with the most illegal price changes, for every day
- Top 5 ranking of fuel stations with the most illegal price changes, for every day

Violations are categorized by severity, depending on the time:
- 11:55 - 11:59 -> Low
- 12:06 - 12:10 -> Low
- 12:11 - 12:59 -> Medium
- Every other time -> High
