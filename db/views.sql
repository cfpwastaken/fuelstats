--
-- GENERAL AGGREGATIONS
--
DROP MATERIALIZED VIEW IF EXISTS daily_aggregations CASCADE;

CREATE MATERIALIZED VIEW daily_aggregations AS
WITH station_avg AS (
SELECT date_trunc('day', "timestamp")                       AS day,
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
FROM history h
GROUP BY (date_trunc('day'::text, "timestamp"))
ORDER BY (date_trunc('day'::text, "timestamp"))
)
SELECT
    da.*,
    o.eur_liter AS crude_oil,
FROM station_avg da
LEFT JOIN crude_oil o ON o.date = da.day;

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

DROP MATERIALIZED VIEW IF EXISTS daily_average CASCADE;

CREATE MATERIALIZED VIEW daily_average AS
WITH ordered AS (
	SELECT
		station_uuid,
		"timestamp",
		diesel,
		e5,
		e10,
		lead("timestamp") OVER (
			PARTITION BY station_uuid
			ORDER BY "timestamp"
		) AS next_ts
	FROM history
	WHERE "timestamp" >= now() - interval '7 days'
),
minutes AS (
	SELECT generate_series(
		now() - interval '7 days',
		now(),
		interval '1 minutes'
	) AS ts
)
SELECT
	date_trunc('minute', m.ts)::time AS time,
	avg(o.diesel) AS diesel_avg,
	avg(o.e5) AS e5_avg,
	avg(o.e10) AS e10_avg
FROM minutes m
JOIN ordered o
  ON m.ts >= o."timestamp"
 AND (m.ts < o.next_ts OR o.next_ts IS NULL)
GROUP BY time
ORDER BY time;

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
    SELECT LEAST(100000, 25 * POWER(1.05, repetition));
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION moderate_fee(repetition BIGINT)
RETURNS FLOAT AS $$
    SELECT LEAST(100000, 100 * POWER(1.1, repetition));
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION high_fee(repetition BIGINT)
RETURNS FLOAT AS $$
    SELECT LEAST(100000, 350 * POWER(1.15, repetition));
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
LEFT JOIN LATERAL (
	SELECT *
	FROM brand_map
	WHERE lower(raw_brand) = trim(lower(st.brand))
		OR lower(raw_brand) = trim(lower(st.name))
	ORDER BY
		lower(raw_brand) = trim(lower(st.brand)) DESC,
		lower(raw_brand) = trim(lower(st.name)) DESC
	LIMIT 1
) bm ON true

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
		SUM(CASE WHEN severity = 0 THEN 1 ELSE 0 END) AS violations_low,
	SUM(CASE WHEN severity = 1 THEN 1 ELSE 0 END) AS violations_moderate,
	SUM(CASE WHEN severity = 2 THEN 1 ELSE 0 END) AS violations_high,
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
WHERE DATE (timestamp) >= '2026-04-01'::date
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
		WHERE DATE (timestamp) >= '2026-04-01'::date
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
		WHERE DATE (timestamp) >= '2026-04-01'::date
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

--
-- MORE STATS
--
DROP MATERIALIZED VIEW IF EXISTS no_increase CASCADE;

CREATE MATERIALIZED VIEW no_increase AS
WITH expanded AS (
	SELECT
		date_trunc('day', "timestamp")::date AS day,
		station_uuid,
		'diesel' AS fuel_type,
		diesel AS price
	FROM history
	WHERE "timestamp" >= '2026-04-01'

	UNION ALL
	SELECT
		date_trunc('day', "timestamp")::date,
		station_uuid,
		'e5',
		e5
	FROM history
	WHERE "timestamp" >= '2026-04-01'

	UNION ALL
	SELECT
		date_trunc('day', "timestamp")::date,
		station_uuid,
		'e10',
		e10
	FROM history
	WHERE "timestamp" >= '2026-04-01'
),
with_diffs AS (
	SELECT
		day,
		station_uuid,
		fuel_type,
		price,
		price - lag(price) OVER (
			PARTITION BY station_uuid, fuel_type ORDER BY day, price
		) AS diff
	FROM expanded
)
SELECT
	day,
	station_uuid,
	fuel_type,
	st.name,
	st.brand,
	st.street,
	st.house_number,
	st.post_code,
	st.city
FROM with_diffs
LEFT JOIN normalized_stations st ON st.uuid = station_uuid
GROUP BY day, station_uuid, fuel_type, st.name, st.brand, st.street, st.house_number, st.post_code, st.city
HAVING MAX(diff) <= 0 OR MAX(diff) IS NULL
ORDER BY day, station_uuid, fuel_type;

DROP MATERIALIZED VIEW IF EXISTS city_station_rank CASCADE;

CREATE MATERIALIZED VIEW city_station_rank AS
WITH stats AS (
    SELECT
        st.city,
        st.uuid,
        st.name,
        st.street,
        AVG(h.diesel) AS diesel_avg,
        AVG(h.e5) AS e5_avg,
        AVG(h.e10) AS e10_avg
    FROM normalized_stations st
    JOIN history h ON h.station_uuid = st.uuid
    WHERE h.timestamp >= NOW() - INTERVAL '7 days'
    GROUP BY st.city, st.uuid, st.name, st.street
),
unpivot AS (
    SELECT city, uuid, name, street, 'diesel' AS fuel_type, diesel_avg AS price_avg FROM stats
    UNION ALL
    SELECT city, uuid, name, street, 'e5'     AS fuel_type, e5_avg     AS price_avg FROM stats
    UNION ALL
    SELECT city, uuid, name, street, 'e10'    AS fuel_type, e10_avg    AS price_avg FROM stats
),
ranked AS (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY city, fuel_type
            ORDER BY price_avg ASC
        ) AS rn
    FROM unpivot
)
SELECT *
FROM ranked
WHERE rn <= 10
ORDER BY rn;

DROP MATERIALIZED VIEW IF EXISTS plz_station_rank CASCADE;

CREATE MATERIALIZED VIEW plz_station_rank AS
WITH stats AS (
    SELECT
        st.city,
        st.uuid,
        st.name,
        st.post_code,
        AVG(h.diesel) AS diesel_avg,
        AVG(h.e5) AS e5_avg,
        AVG(h.e10) AS e10_avg
    FROM normalized_stations st
    JOIN history h ON h.station_uuid = st.uuid
    WHERE h.timestamp >= NOW() - INTERVAL '7 days'
    GROUP BY st.city, st.uuid, st.name, st.post_code
),
unpivot AS (
    SELECT city, uuid, name, post_code, 'diesel' AS fuel_type, diesel_avg AS price_avg FROM stats
    UNION ALL
    SELECT city, uuid, name, post_code, 'e5'     AS fuel_type, e5_avg     AS price_avg FROM stats
    UNION ALL
    SELECT city, uuid, name, post_code, 'e10'    AS fuel_type, e10_avg    AS price_avg FROM stats
),
ranked AS (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY city, fuel_type
            ORDER BY price_avg ASC
        ) AS rn
    FROM unpivot
)
SELECT *
FROM ranked
WHERE rn <= 10
ORDER BY rn;
