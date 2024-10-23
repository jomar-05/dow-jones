import { ConfigModule, registerAs } from '@nestjs/config';

export default registerAs('secomDatabase', async () => {
  await ConfigModule.envVariablesLoaded;
  const config = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_DATABASE,
  };
  return config;
});
