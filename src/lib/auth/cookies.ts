import "server-only";
import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOptions,
  type AuthCookies,
} from "./handlers";
export async function authCookies(): Promise<AuthCookies> {
  const store = await cookies();
  const options = cookieOptions(process.env.NODE_ENV === "production");
  return {
    read() {
      const access_token = store.get(ACCESS_COOKIE)?.value,
        refresh_token = store.get(REFRESH_COOKIE)?.value;
      if (
        !access_token ||
        access_token.length > 4096 ||
        !refresh_token ||
        refresh_token.length > 4096
      )
        return;
      return { access_token, refresh_token };
    },
    save(tokens) {
      store.set(ACCESS_COOKIE, tokens.access_token, options);
      store.set(REFRESH_COOKIE, tokens.refresh_token, options);
    },
    clear() {
      store.set(ACCESS_COOKIE, "", { ...options, maxAge: 0 });
      store.set(REFRESH_COOKIE, "", { ...options, maxAge: 0 });
    },
  };
}
