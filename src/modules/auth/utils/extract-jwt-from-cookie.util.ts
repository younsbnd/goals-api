import { Request } from 'express';

interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

export const extractJwtFromCookie = (cookieName: string) => {
  return (request: RequestWithCookies): string | null => {
    return request?.cookies?.[cookieName] ?? null;
  };
};
