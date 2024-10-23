import { ConfigModule, registerAs } from '@nestjs/config';

export default registerAs('dowJonesApi', async () => {
  await ConfigModule.envVariablesLoaded;
  const config = {
    ...JSON.parse(process.env.DOW_JONES_CONFIG || ''),
  };
  return config;
});
