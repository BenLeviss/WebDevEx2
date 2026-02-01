import initApp from '../app';

describe('app initialization', () => {
  const OLD_DB = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.DATABASE_URL = OLD_DB;
  });

  test('rejects when DATABASE_URL not defined', async () => {
    delete process.env.DATABASE_URL;
    await expect(initApp()).rejects.toEqual('DATABASE_URL is not defined');
  });
});
