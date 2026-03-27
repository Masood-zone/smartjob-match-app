import { auth } from "./auth";

export type RequestSessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
};

export async function getRequestSessionUser(request: Request) {
  const session = await (auth as any).api?.getSession?.({
    headers: request.headers,
  });

  return (session?.user ??
    session?.data?.user ??
    null) as RequestSessionUser | null;
}
