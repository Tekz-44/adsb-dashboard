import { DsqlSigner } from "@aws-sdk/dsql-signer";
import { Pool } from "pg";

const endpoint = process.env.DSQL_ENDPOINT!;
const region = process.env.DSQL_REGION!;

export async function getDb() {
  const signer = new DsqlSigner({
    hostname: endpoint,
    region,
    credentials: {
      accessKeyId: process.env.DSQL_ACCESS_KEY_ID!,
      secretAccessKey: process.env.DSQL_SECRET_ACCESS_KEY!,
    },
  });

  const token = await signer.getDbConnectAdminAuthToken();

  const pool = new Pool({
    host: endpoint,
    port: 5432,
    database: "postgres",
    user: "admin",
    password: token,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10000,
  });

  return pool;
}
