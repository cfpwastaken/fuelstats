export interface StationAverage {
	station_uuid: string;
	hour: number;
	diesel_avg: number;
	diesel_median: number;
	e5_avg: number;
	e5_median: number;
	e10_avg: number;
	e10_median: number;
}