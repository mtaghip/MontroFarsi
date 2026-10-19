# Montro — Jewellery & Luxury Watch Shop Manager (web + mobile app)

Your own web app that works in any phone browser and installs to the home screen
like a native app (PWA). Logins for partners and staff, photos, and the full
system from the spreadsheet: inventory, sales, partner ledger, expenses,
building costs, stock movement, stock-take, suppliers, customers, staff, returns,
an automatic audit log, and a live dashboard.

Stack: **Next.js** (app) · **Supabase** (database, logins, photo storage) · **Vercel** (hosting).

---

## Go live in ~30 minutes (no coding)

You create two free accounts; everything else is already built.

### 1. Create the database (Supabase)
1. Go to **supabase.com** → sign up → **New project**. Pick a name and a strong
   database password, choose the London region, click **Create**.
2. Wait ~2 minutes for it to finish setting up.
3. Left menu → **SQL Editor** → **New query**. Open the file
   [`supabase/schema.sql`](supabase/schema.sql) from this folder, copy **all** of
   it, paste it in, and click **Run**. This creates every table, the logins,
   the photo storage and the automatic audit log.
4. Left menu → **Project Settings → API**. Copy two values — you'll need them:
   - **Project URL**
   - **anon public** key

### 2. Create your first login
1. Supabase left menu → **Authentication → Users → Add user** → enter your email
   and a password → **Create user**.
2. Make yourself a **partner** (so you can delete, not just add): go to
   **SQL Editor**, run (change the email to yours):
   ```sql
   update public.profiles set role = 'partner'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
   Add staff later the same way (leave their role as `staff`).

### 3. Deploy the app (Vercel)
1. Go to **vercel.com** → sign up **with GitHub** → **Add New… → Project**.
2. Import the repository **mtaghip/MontroFarsi**.
3. **Important:** set **Root Directory** to `montro-app`.
4. Expand **Environment Variables** and add these two (from step 1.4):
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon public key
5. Click **Deploy**. After a minute you'll get a web address like
   `https://montro.vercel.app`.

### 4. Put it on your phone
- Open that address on your phone and sign in.
- **iPhone (Safari):** Share → *Add to Home Screen*.
- **Android (Chrome):** menu ⋮ → *Install app* / *Add to Home screen*.
- It now opens full-screen with its own icon, like any app.

---

## Running it on a computer for development

```bash
cd montro-app
cp .env.local.example .env.local      # fill in your Supabase URL + anon key
npm install
npm run dev                            # open http://localhost:3000
```

---

## Who can do what
- **Everyone signed in** can view everything and add/edit day-to-day records.
- **Only partners** can delete records (enforced in the database).
- Every add/edit/delete to stock, sales, partner and expense records is written
  to the **Audit Log** automatically, with the user's email and the time.

## Notes
- Currency is per item: choose GBP/USD/AED… and type the price — no conversion,
  matching the spreadsheet.
- Photos are taken with the phone camera or chosen from the gallery and stored in
  Supabase. 
- This is **Version 1** of the app. Modules can be extended (editable sales,
  month-end report, charts per employee, barcode scanning) in future updates.
