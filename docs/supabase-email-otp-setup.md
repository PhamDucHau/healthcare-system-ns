# OTP 6 số qua supabase-js

## Luồng gửi OTP

```ts
// src/lib/signup-api.ts — sau khi edge signup-send-otp validate
await supabase.auth.signInWithOtp({
  email,
  options: { shouldCreateUser: true },
});
```

## Luồng xác minh

```ts
await supabase.auth.verifyOtp({
  email,
  token: otp,
  type: "email",
});
```

## Supabase Dashboard

1. **Authentication → Providers → Email** — bật Email + **Email OTP**
2. **Tắt Confirm email** (tránh email link "Confirm your signup")
3. Template OTP có mã 6 chữ số (`{{ .Token }}`)

## Config local / remote

```toml
[auth.email]
enable_confirmations = false
otp_length = 6
otp_expiry = 300
```

```bash
supabase config push --yes
npm run supabase:deploy-functions
```
