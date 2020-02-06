
export const staticConfigurations: any = {
	__version__: "DROP-002-SNAPSHOT"
}

// Type was can be typed by config name (if not, the getConfig return type will be any, thanks to the conditional typing below)
export interface ConfigType {
	__version__: string;
	github: { client_id: string, client_secret: string };
	db: { database: string, user: string, password: string, host: string };
	bigquery: { client_email: string, project_id: string, private_key: string };
	google_oauth: { client_id: string, client_secret: string, redirect_url: string };
}