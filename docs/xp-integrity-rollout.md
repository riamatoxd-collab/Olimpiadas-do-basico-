# Venture XP integrity — staged rollout

## What this branch adds

- A server-side XP profile and XP ledger.
- A server-side question bank seeded from the repository's current public QUESTIONS_DB (197 questions).
- Authenticated Edge Functions to issue a short-lived question and submit one answer.
- Server-side answer checking, a unique idempotency key per challenge, an atomic XP ledger/profile update, daily caps, and a server-controlled multiplier.
- Client roles cannot read the answer key, challenge internals, ledger, reward rules, or settings.

## Important: this is not active in the published site

The existing Venture app still uses its legacy localStorage account system, plaintext passwords in browser state, and public MQTT/ntfy synchronization. This branch deliberately does not replace addXp() or change the deployed app yet. Doing that before an authenticated Supabase project and verified account-migration plan exist could lock players out or split their XP between two systems.

The legacy questions.js also contains correct answers in public JavaScript. The server verifies submitted answers and prevents arbitrary client-supplied XP amounts, but a determined user can still automate answers from the public bank. Hiding answer keys from the browser is a separate frontend/data migration required for stronger anti-cheat protection.

## Before enabling it

1. Create a Supabase project and keep the project URL, anon key, and service-role key out of Git. The service-role key must only be configured as a Supabase Edge Function secret.
2. Review and apply the migrations in order with the Supabase CLI.
3. Deploy both Edge Functions and confirm verify_jwt remains enabled.
4. Test with new, fictional accounts first. Confirm the same challenge can never credit XP twice, expired/wrong answers award zero, two simultaneous submissions do not double-credit, and the daily cap works.
5. Plan a verified migration for existing accounts. Do not import legacy plaintext passwords. Do not set xp_profiles.xp from a client-provided value. Link each legacy account only after verifying its owner, and reconcile legacy XP against private backups before any cutover.
6. Decide how the existing global XP x2 campaign is represented in xp_settings. It defaults to x1; it does not automatically infer the current client-side setting.
7. Only after tests and account mapping, implement the frontend adapter to use Supabase Auth and these endpoints. Do not allow the legacy addXp() path to silently remain authoritative for online accounts.

## Current reward scope

Only quiz_correct is enabled in this first backend slice (25 base XP, up to 40 claims per UTC day). Mission, chest, duel, admin adjustments, and other rewards must each be migrated to their own server-validated event flow before they can safely grant official XP through this backend.

## Rollback

This branch is separate from main. The migrations add new xp_* objects and a profile-creation trigger; they do not update or delete existing app tables or localStorage data. If a Supabase test project is used, rollback by dropping the test project is safer than attempting to merge its data into production.
