# NAPS Invite-Based User Management Setup

The GitHub code is ready. One Supabase Edge Function must be deployed before `👥 User Management` can send invitations.

## Option A — Supabase Dashboard (easiest)

1. Open your Supabase project.
2. Go to **Edge Functions**.
3. Click **Deploy a new function** → **Via Editor**.
4. Function name: `manage-admin-users`
5. Open this GitHub file:
   `supabase/functions/manage-admin-users/index.ts`
6. Copy the full code into the Supabase function editor.
7. Deploy the function.

The hosted Supabase function already has access to project environment variables such as `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never copy the service-role key into frontend JavaScript or GitHub public files.

## Supabase Auth URL configuration

In Supabase Dashboard go to **Authentication → URL Configuration**.

For the current GitHub Pages site, add this Redirect URL:

`https://pavelsarwar.github.io/naps-malaysia/accept-invite.html`

Also keep your Admin URL available:

`https://pavelsarwar.github.io/naps-malaysia/admin.html`

If NAPS later uses a custom domain, add the equivalent `accept-invite.html` URL for that domain too.

## How to use

1. Log in to `admin.html` as Super Admin.
2. Open **👥 User Management**.
3. Click **+ Invite User**.
4. Enter Full Name, Email, and Role.
5. Click **Send Invitation**.
6. The new user opens the email invitation.
7. The user is redirected to `accept-invite.html`.
8. The user creates their own password.
9. The user can then sign in at `admin.html`.

## Roles

- **Super Admin** — user management + all site administration. The existing Super Admin is not editable through the normal role dropdown.
- **Admin** — site data/content administration.
- **Editor** — content/offers role.
- **Merchant** — reserved for merchant-specific workflows.

The Edge Function verifies that the caller is a `super_admin` before it lists users, sends invitations, or changes roles.
