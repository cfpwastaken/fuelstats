CREATE TABLE history (
    timestamp timestamp NOT NULL,
    station_uuid uuid NOT NULL,
    diesel numeric(6, 3) NOT NULL,
    e5 numeric(6, 3) NOT NULL,
    e10 numeric(6, 3) NOT NULL,
    dieselchange numeric(6, 3),
    e5change numeric(6, 3),
    e10change numeric(6, 3),
    timestamp_utc timestamp with time zone generated always as (
        (
            "timestamp" AT TIME ZONE 'UTC'::text
        )
    ) stored
);

CREATE INDEX history_station_uuid_index ON history (station_uuid);

CREATE INDEX history_timestamp_index ON history (timestamp);

CREATE INDEX history_timestamp_station_uuid_index ON history (timestamp, station_uuid);

CREATE TABLE stations (
    uuid uuid,
    name varchar,
    brand varchar,
    street varchar,
    house_number varchar,
    post_code varchar,
    city varchar,
    location geography,
    first_active timestamp
);

CREATE TABLE brand_map (
	raw_brand VARCHAR PRIMARY KEY,
	normalized VARCHAR NOT NULL
);

create table crude_oil
(
    date       date,
    usd_barrel numeric,
    eur_liter  numeric generated always as (((usd_barrel * 0.85) / 158.987)) stored
);
