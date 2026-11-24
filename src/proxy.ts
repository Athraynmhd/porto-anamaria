import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Only /admin touches Supabase; the public site stays fully cacheable.
export const config = { matcher: ["/admin/:path*"] };
