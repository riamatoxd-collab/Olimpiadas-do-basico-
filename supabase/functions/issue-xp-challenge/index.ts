import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !/^Bearer\s+\S+$/i.test(authHeader)) {
    return json(401, { error: "authentication_required" });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceRoleKey) {
    return json(500, { error: "server_configuration_missing" });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "");
  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) return json(401, { error: "invalid_session" });

  const adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await adminClient
    .rpc("issue_xp_challenge", { p_user_id: authData.user.id })
    .single();

  if (error) {
    console.error("issue-xp-challenge failed:", error.message);
    if (error.message.includes("daily_challenge_limit")) {
      return json(429, { error: "daily_challenge_limit" });
    }
    if (error.message.includes("challenge_rate_limited")) {
      return json(429, { error: "challenge_rate_limited" });
    }
    if (error.message.includes("profile_not_found")) {
      return json(409, { error: "profile_not_found" });
    }
    return json(500, { error: "challenge_unavailable" });
  }

  return json(200, {
    challenge_id: data.challenge_id,
    question_id: data.question_id,
    level: data.level,
    question: data.question,
    options: data.options,
    expires_at: data.expires_at,
  });
});
