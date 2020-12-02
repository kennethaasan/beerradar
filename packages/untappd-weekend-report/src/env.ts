export function getEnvVar(key: string): string {
  const envVar = process.env[key];

  if (!envVar || typeof envVar !== 'string') {
    throw new Error(`enviroment variable ${key} is required`);
  }

  return envVar;
}
