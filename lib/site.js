const hostDeploy = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const urlKonfigurasi = process.env.SITE_URL || (hostDeploy ? `https://${hostDeploy}` : "http://localhost:3000");

export const siteUrl = urlKonfigurasi.replace(/\/+$/, "");
