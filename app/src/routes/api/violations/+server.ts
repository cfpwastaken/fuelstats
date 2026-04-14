import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const query = `
WITH expanded AS (
    SELECT
        h.timestamp,
        h.station_uuid,
        p.fuel,
        p.price,
        LAG(p.price) OVER (
            PARTITION BY h.station_uuid, p.fuel
            ORDER BY h.timestamp
        ) AS prev_price
    FROM history h
    CROSS JOIN LATERAL (
        VALUES
            ('diesel', h.diesel),
            ('e5',     h.e5),
            ('e10',    h.e10)
    ) AS p(fuel, price)
    -- 👇 look back one day so LAG works on April 1
    WHERE h.timestamp >= TIMESTAMP '2026-03-31'
		AND (h.diesel IS NOT NULL OR h.e5 IS NOT NULL OR h.e10 IS NOT NULL)
		AND NOT (h.diesel <= 0 AND h.e5 <= 0 AND h.e10 <= 0)
),
illegal AS (
    SELECT
        DATE(timestamp) AS day,
        station_uuid
    FROM expanded
    WHERE prev_price IS NOT NULL
      AND price IS NOT NULL
      AND price > prev_price
      AND NOT (
            timestamp::time >= TIME '12:00'
        AND timestamp::time <  TIME '12:06'
      )
)
SELECT
    day,
    COUNT(*) AS violations,
    COUNT(DISTINCT station_uuid) AS violators
FROM illegal
-- 👇 only report from April 1 onward
WHERE day >= DATE '2026-04-01'
GROUP BY day
ORDER BY day;
`;

export async function GET() {
	const res = await db?.query("SELECT * FROM violations");
	return json(res?.rows);
}