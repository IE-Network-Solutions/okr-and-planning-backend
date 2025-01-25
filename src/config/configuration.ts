/**
 * This function exports a configuration object with environment variables for a Node.js application,
 * including app name, description, version, and database credentials.
 */
export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV,
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 3000,
    name: process.env.APP_NAME,
    description: process.env.APP_DESCRIPTION,
    version: process.env.APP_VERSION,
    isProduction: Boolean(process.env.APP_IS_PRODUCTION),
  },

  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    type: process.env.DB_TYPE,
    synchronize: Boolean(process.env.DB_SYNCHRONIZE_ENTITIES),
  },
  apiServer: {
    org_server: process.env.ORG_SERVER,
  },
  firebase: {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.CLIENT_EMAIL,
  },
  externalUrls: {
    orgStructureUrl: process.env.ORG_AND_EMP_URL,
    fileServerUrl: process.env.FILE_SERVER_URL,
  },
});
