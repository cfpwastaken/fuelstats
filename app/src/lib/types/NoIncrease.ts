export default interface NoIncrease {
	day: string;
	station_uuid: string;
	fuel_type: "diesel" | "e5" | "e10";
	name: string;
	brand: string;
	street: string;
	house_number: string;
	post_code: string;
	city: string;
}