--
-- GENERAL AGGREGATIONS
--
DROP MATERIALIZED VIEW IF EXISTS daily_aggregations CASCADE;

CREATE MATERIALIZED VIEW daily_aggregations AS
SELECT date_trunc('day', "timestamp")                             AS day,
       avg(NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_avg,
       avg(NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric))     AS e5_avg,
       avg(NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric))    AS e10_avg,
       --PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_median,
       --PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric))     AS e5_median,
       --PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric))    AS e10_median,
       min(NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_min,
       min(NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric))     AS e5_min,
       min(NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric))    AS e10_min,
       max(NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_max,
       max(NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric))     AS e5_max,
       max(NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric))    AS e10_max,
       max(NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) -
       min(NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_range,
       max(NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric)) -
       min(NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric))     AS e5_range,
       max(NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric)) -
       min(NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric))    AS e10_range,
       count(*)                                                   AS price_changes
FROM history
GROUP BY (date_trunc('day', "timestamp"))
ORDER BY (date_trunc('day', "timestamp")) DESC;

DROP MATERIALIZED VIEW IF EXISTS monthly_aggregations;

CREATE MATERIALIZED VIEW monthly_aggregations AS
SELECT date_trunc('month', "timestamp")                           AS month,
       avg(NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_avg,
       avg(NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric))     AS e5_avg,
       avg(NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric))    AS e10_avg,
       min(NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_min,
       min(NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric))     AS e5_min,
       min(NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric))    AS e10_min,
       max(NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_max,
       max(NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric))     AS e5_max,
       max(NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric))    AS e10_max,
       count(*)                                                   AS price_changes
FROM history
GROUP BY (date_trunc('month', "timestamp"))
ORDER BY (date_trunc('month', "timestamp")) DESC;

DROP MATERIALIZED VIEW IF EXISTS yearly_aggregations;

CREATE MATERIALIZED VIEW yearly_aggregations AS
SELECT date_trunc('year', "timestamp")                            AS year,
       avg(NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_avg,
       avg(NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric))     AS e5_avg,
       avg(NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric))    AS e10_avg,
       min(NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_min,
       min(NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric))     AS e5_min,
       min(NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric))    AS e10_min,
       max(NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_max,
       max(NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric))     AS e5_max,
       max(NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric))    AS e10_max,
       count(*)                                                   AS price_changes
FROM history
GROUP BY (date_trunc('year', "timestamp"))
ORDER BY (date_trunc('year', "timestamp")) DESC;

--
-- STATION STATISTICS
--
DROP MATERIALIZED VIEW IF EXISTS station_avgs CASCADE;

CREATE MATERIALIZED VIEW station_avgs AS
SELECT station_uuid,
       date_part('hour', "timestamp")       AS hour,
       avg(diesel)                          AS diesel_avg,
			 PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY NULLIF(NULLIF(diesel, 0::numeric), '-0.001'::numeric)) AS diesel_median,
       avg(e5)                              AS e5_avg,
			 PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY NULLIF(NULLIF(e5, 0::numeric), '-0.001'::numeric)) AS e5_median,
       avg(e10)                             AS e10_avg,
			 PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY NULLIF(NULLIF(e10, 0::numeric), '-0.001'::numeric)) AS e10_median
FROM history
WHERE "timestamp" >= (now() - '7 days'::interval)
GROUP BY station_uuid, (date_part('hour', "timestamp"))
ORDER BY station_uuid, (date_part('hour', "timestamp"));

DROP MATERIALIZED VIEW IF EXISTS station_avgs_week CASCADE;

CREATE MATERIALIZED VIEW station_avgs_week AS
SELECT station_uuid,
       date_part('dow', "timestamp")       AS weekday,
       avg(diesel)                         AS diesel_avg,
       avg(e5)                             AS e5_avg,
       avg(e10)                            AS e10_avg
FROM history
WHERE "timestamp" >= (now() - '30 days'::interval)
GROUP BY station_uuid, (date_part('dow', "timestamp"))
ORDER BY station_uuid, (date_part('dow', "timestamp"));

--
-- VIOLATION STATISTICS
--

CREATE OR REPLACE FUNCTION low_fee(repetition BIGINT)
RETURNS FLOAT AS $$
	SELECT LEAST(100000, 45 * POWER(1.2, repetition));
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION moderate_fee(repetition BIGINT)
RETURNS FLOAT AS $$
	SELECT LEAST(100000, 150 * POWER(1.25, repetition));
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION high_fee(repetition BIGINT)
RETURNS FLOAT AS $$
	SELECT LEAST(100000, 500 * POWER(1.25, repetition));
$$ LANGUAGE SQL;

DROP MATERIALIZED VIEW IF EXISTS normalized_stations CASCADE;

CREATE MATERIALIZED VIEW normalized_stations AS
SELECT
    uuid,
    name,
		COALESCE(bm.normalized, st.brand) AS brand,
    street,
    house_number,
    post_code,
    city,
    location,
    first_active
FROM stations st
LEFT JOIN brand_map bm ON TRIM(LOWER(bm.raw_brand)) = TRIM(LOWER(st.brand)) OR TRIM(LOWER(bm.raw_brand)) = TRIM(LOWER(st.name));

DROP MATERIALIZED VIEW IF EXISTS brand_totals CASCADE;

CREATE MATERIALIZED VIEW brand_totals AS
SELECT brand, COUNT(*) AS total_stations
FROM normalized_stations
GROUP BY
    1;

DROP MATERIALIZED VIEW IF EXISTS illegal_changes CASCADE;

CREATE MATERIALIZED VIEW illegal_changes AS
WITH
    expanded AS (
        SELECT h."timestamp", h.station_uuid, st.*, p.fuel, p.price, lag(p.price) OVER (
                PARTITION BY
                    h.station_uuid, p.fuel
                ORDER BY h."timestamp"
            ) AS prev_price
        FROM
            history h
            LEFT JOIN normalized_stations st ON st.uuid = h.station_uuid
            CROSS JOIN LATERAL (
                VALUES ('diesel'::text, h.diesel),
                    ('e5'::text, h.e5),
                    ('e10'::text, h.e10)
            ) p (fuel, price)
        WHERE
            h."timestamp" >= '2026-03-31 00:00:00'::timestamp without time zone
            AND (
                h.diesel IS NOT NULL
                OR h.e5 IS NOT NULL
                OR h.e10 IS NOT NULL
            )
            AND NOT (
                h.diesel <= 0::numeric
                AND h.e5 <= 0::numeric
                AND h.e10 <= 0::numeric
            )
    ),
    illegal AS (
        SELECT *
        FROM expanded
        WHERE
            expanded.prev_price IS NOT NULL
            AND expanded.price IS NOT NULL
            AND expanded.price > expanded.prev_price
            AND NOT (
                expanded."timestamp"::time without time zone >= '12:00:00'::time without time zone
                AND expanded."timestamp"::time without time zone < '12:06:00'::time without time zone
            )
    ),
    severity AS (
        SELECT
            *,
            CASE
                WHEN timestamp::time >= '12:06:00'::time
                AND timestamp::time <= '12:10:00'::time THEN 0
                WHEN timestamp::time >= '11:55:00'::time
                AND timestamp::time <= '11:59:00'::time THEN 0
                WHEN timestamp::time >= '12:11:00'::time
                AND timestamp::time <= '12:59:00'::time THEN 1
                ELSE 2
            END AS severity,
            -- repetition count
            ROW_NUMBER() OVER (
                PARTITION BY
                    station_uuid,
                    fuel
                ORDER BY timestamp
            ) - 1 AS repetition_count
        FROM illegal
    )
SELECT
    *,
    CASE
        WHEN severity = 0 THEN low_fee (repetition_count)
        WHEN severity = 1 THEN moderate_fee (repetition_count)
        ELSE high_fee (repetition_count)
    END AS fee
FROM severity;

DROP MATERIALIZED VIEW IF EXISTS violations;

CREATE MATERIALIZED VIEW violations AS
SELECT
    DATE (timestamp) AS day,
    count(*) AS violations,
    count(DISTINCT station_uuid) AS violators,
		SUM(fee) AS total_fees
FROM illegal_changes
WHERE
    DATE (timestamp) >= '2026-04-01'::date
GROUP BY
    day
ORDER BY day;

DROP MATERIALIZED VIEW IF EXISTS violators;

CREATE MATERIALIZED VIEW violators AS
WITH
    violations AS (
        SELECT
            DATE (c.timestamp) AS day,
            brand,
            BOOL_AND(c.brand = c.name) AS is_single,
            COUNT(*) FILTER (
                WHERE
                    severity = 0
            ) AS violations_low,
            COUNT(*) FILTER (
                WHERE
                    severity = 1
            ) AS violations_moderate,
            COUNT(*) FILTER (
                WHERE
                    severity = 2
            ) AS violations_high,
            COUNT(DISTINCT station_uuid) AS violating_station_count,
						SUM(fee) AS total_fees
        FROM illegal_changes c
        WHERE
            DATE (c.timestamp) >= DATE '2026-04-01'
        GROUP BY
            1,
            2
    )
SELECT
    v.day,
    v.brand,
    v.is_single,
    v.violations_low,
    v.violations_moderate,
    v.violations_high,
    v.violating_station_count,
    bt.total_stations,
    ROUND(
        (
            v.violating_station_count::numeric / bt.total_stations
        ) * 100,
        2
    ) AS violating_percentage,
		v.total_fees
FROM violations v
    LEFT JOIN brand_totals bt USING (brand)
ORDER BY v.violations_high DESC;

DROP MATERIALIZED VIEW IF EXISTS violator_stations;

CREATE MATERIALIZED VIEW violator_stations AS
SELECT
    DATE (timestamp) AS day,
    station_uuid,
    brand,
    name,
    street,
    house_number,
    post_code,
    city,
    severity,
    COUNT(*) AS violations,
		SUM(fee) AS total_fees
FROM illegal_changes
GROUP BY
    day,
    station_uuid,
    brand,
    name,
    street,
    house_number,
    post_code,
    city,
    severity
ORDER BY severity DESC, violations DESC;

--
-- BRANDS AND STATIONS
--

DROP MATERIALIZED VIEW IF EXISTS brand_violations CASCADE;

CREATE MATERIALIZED VIEW brand_violations AS
WITH stations AS (
    SELECT brand, COUNT(*) AS station_count
    FROM normalized_stations
    WHERE brand IS NOT NULL
    GROUP BY brand
),
violations AS (
    SELECT brand, COUNT(*) AS violation_count, SUM(fee) AS total_fees
    FROM illegal_changes
    GROUP BY brand
)
SELECT
    st.brand,
    st.station_count,
    vi.violation_count,
    vi.total_fees
FROM stations st
LEFT JOIN violations vi ON vi.brand = st.brand
ORDER BY station_count DESC;

DROP MATERIALIZED VIEW IF EXISTS station_violations CASCADE;

CREATE MATERIALIZED VIEW station_violations AS
WITH violations AS (
    SELECT station_uuid, COUNT(*) AS violation_count, SUM(fee) AS total_fees
    FROM illegal_changes
    GROUP BY station_uuid
)
SELECT
    st.uuid,
    st.name,
    st.brand,
    st.street,
    st.house_number,
    st.post_code,
    st.city,
    st.location,
    st.first_active,
    vi.violation_count,
    vi.total_fees
FROM normalized_stations st
LEFT JOIN violations vi ON vi.station_uuid = st.uuid
ORDER BY total_fees DESC;
