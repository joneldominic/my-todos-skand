import * as jose from 'jose';

const secret = new TextEncoder().encode('very very very very very long and safe secret phrase');

export const sign = async (payload: any) => {
  const jwt = new jose.SignJWT(payload);
  jwt.setProtectedHeader({ alg: 'HS256' });
  return jwt.sign(secret);
};

export const verify = async (token: string) => {
  const { payload } = await jose.jwtVerify(token, secret);
  return payload;
};
