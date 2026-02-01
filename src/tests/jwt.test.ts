import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

describe('jwt utils', () => {
  const payload = { userId: '1', username: 'u', email: 'e' };

  test('generate and verify access token', () => {
    const token = generateAccessToken(payload as any);
    const decoded = verifyAccessToken(token as string);
    expect(decoded).toMatchObject(payload);
  });

  test('generate and verify refresh token', () => {
    const token = generateRefreshToken(payload as any);
    const decoded = verifyRefreshToken(token as string);
    expect(decoded).toMatchObject(payload);
  });

  test('verifyAccessToken returns null for invalid token', () => {
    expect(verifyAccessToken('not-a-token')).toBeNull();
  });

  test('verifyRefreshToken returns null for invalid token', () => {
    expect(verifyRefreshToken('not-a-token')).toBeNull();
  });
});
