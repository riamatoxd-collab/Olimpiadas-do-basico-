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

  let body: { challenge_id?: unknown; option_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  if (typeof body.challenge_id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.challenge_id) ||
      typeof body.option_id !== "string" ||
      !["a", "b", "c", "d"].includes(body.option_id)) {
    return json(400, { error: "invalid_answer_payload" });
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
  const { data, error } = await adminClient.rpc("submit_xp_answer", {
    p_user_id: authData.user.id,
    p_challenge_id: body.challenge_id,
    p_option_id: body.option_id,
  });

  if (error) {
    console.error("submit-xp-answer failed:", error.message);
    if (error.message.includes("challenge_not_found")) {
      return json(404, { error: "challenge_not_found" });
    }
    if (error.message.includes("profile_not_found")) {
      return json(409, { error: "profile_not_found" });
    }
    if (error.message.includes("invalid_option")) {
      return json(400, { error: "invalid_option" });
    }
    return json(500, { error: "answer_submission_failed" });
  }

  return json(200, data as Record<string, unknown>);
});
