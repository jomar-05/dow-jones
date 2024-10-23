import { ConfigModule, registerAs } from '@nestjs/config';

export default registerAs('watchlistDatabase', async () => {
  await ConfigModule.envVariablesLoaded;
  const config = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_DATABASE,
  };
  return config;
});
