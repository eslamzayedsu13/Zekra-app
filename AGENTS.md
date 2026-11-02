<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# Architecture rules

- Orders are created only via the `place_order(jsonb)` security-definer SQL function — it recomputes prices, stock, shipping and extras with row locks and an idempotency key; never insert orders from the client or trust client totals.
- Fee constants in `src/lib/pricing.ts` mirror `place_order`; change both together — display and server must agree.
- Admin access = `has_role(uid,'admin')` in RLS on every table; client gates (`_authenticated/admin.tsx`) are UX only. Roles live only in `user_roles` (first signup becomes admin via trigger).
- Public catalog reads go through `src/lib/catalog.functions.ts` (publishable server client) so SSR works; signed-in reads use the browser client under RLS.
- All UI copy goes through `src/lib/dict.ts` / `useI18n()`; DB content is bilingual (`*_ar`, `*_en`). Use logical CSS (start/end, ps/pe) so RTL/LTR both work.
- Product `images` store a key from `src/lib/images.ts` library or a full https URL (no public storage buckets on this workspace).
- Payment/shipping providers are not integrated: only `cod` is accepted server-side; add providers as new `payment_method` values validated in `place_order` plus a verified webhook route under `src/routes/api/public/`.
