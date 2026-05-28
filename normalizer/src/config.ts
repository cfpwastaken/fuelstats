import config from "../config.json" with { type: "json" }

type Config = {
	postgres: {
		username: string,
		password: string,
		host: string,
		path: string
	}
}

function parseConfig(config: unknown): asserts config is Config {
	if (typeof config != "object" || !config) {
		throw new Error("config must be an object!")
	}

	if (!("postgres" in config) || typeof config.postgres != "object" || config == null) {
		throw new Error("config.postgres is required and must be an object!")
	}

	if (!("username" in config.postgres!) || typeof config.postgres.username != "string") {
		throw new Error("config.postgres.username is required and must be a string!")
	}

	if (!("password" in config.postgres) || typeof config.postgres.password != "string") {
		throw new Error("config.postgres.password is required and must be a string!")
	}

	if (!("host" in config.postgres) || typeof config.postgres.host != "string") {
		throw new Error("config.postgres.host is required and must be a string!")
	}

	if (!("database" in config.postgres) || typeof config.postgres.database != "string") {
		throw new Error("config.postgres.database is required and must be a string!")
	}
}

try {
	parseConfig(config)
} catch (e) {
	if (e instanceof Error) {
		console.error("Error:", e.message)
	} else {
		console.error("Error:", e)
	}
	process.exit(1)
}

export default config

const { username, password, host, database } = config.postgres
export const postgresURI = `postgresql://${username}:${password}@${host}/${database}`