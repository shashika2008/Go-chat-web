# GoChat — GitHub + Supabase starter

This repository is a production-oriented starter for a social connection platform.

## 1. Install

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never put a Supabase `service_role` key or email provider secret in the frontend.

## 2. Create Supabase project

Create a project in Supabase, then:

1. Open SQL Editor.
2. Run `supabase/schema.sql`.
3. Open Authentication → Providers.
4. Enable Email.
5. Configure the email provider/SMTP for production email delivery.
6. If you want Google login, enable Google and configure its OAuth credentials.
7. In Authentication → URL Configuration, add your local URL and GitHub Pages URL.

## 3. Local run

```bash
npm run dev
```

Open the URL shown by Vite.

## 4. GitHub Pages

Push this repository to GitHub.

Repository Settings → Pages → Source: GitHub Actions.

Add repository Actions secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TURNSTILE_SITE_KEY` (optional)

The included workflow builds and deploys automatically.

### Important for project repositories

If your site URL is:

`https://USERNAME.github.io/GoChat/`

change `base` in `vite.config.js` to:

```js
base: "/GoChat/"
```

If using a custom domain or a user/organization Pages site, `/` is usually correct.

## 5. Real email / OTP

The frontend uses Supabase Auth. For real production emails, configure an SMTP/email provider in Supabase Authentication settings. Do not put an SMTP/API secret into `.env.local`.

## 6. Production security checklist

Before public launch:

- Configure custom SMTP.
- Configure Google OAuth if desired.
- Add Turnstile to signup/login forms.
- Configure Cloudflare for your domain.
- Add rate limits and abuse controls.
- Add content moderation.
- Add admin roles using trusted server-side controls.
- Review every RLS policy.
- Set storage limits and media processing.
- Configure backups.
- Add a privacy policy, terms, community rules and report flow.
- Test account deletion and data export.

## 7. Current scope

Included:

- Email/password auth UI
- Email OTP UI
- Google OAuth hook
- Supabase profile database
- Posts
- Private conversation/message schema
- Storage upload helper
- Followers schema
- Notifications schema
- Reports and blocks
- RLS starter policies
- Realtime publication
- Multilingual foundation (English/Sinhala)
- Responsive neon/glass UI
- GitHub Pages deployment workflow

Still required before a public launch:

- Full chat UI
- Conversation creation/search
- Online presence implementation
- Likes/comments UI
- Discovery queries and filters
- Stories/Reels/Live infrastructure
- Admin application
- Creator analytics
- Automated moderation
- Turnstile integration
- Production privacy/terms pages
