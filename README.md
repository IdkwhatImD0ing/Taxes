# Receipt Split

A simple app to split receipts with friends and share public links for them to see what they owe.

## Setup

### 1. Environment Variables

Create a `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SECRET_KEY=your_supabase_secret_key

# Auth
AUTH_PASSWORD=your_secure_password
AUTH_SECRET=your_jwt_secret_at_least_32_characters_long
```

### 2. Supabase Database

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor to create the tables.

### 3. Supabase Storage

1. Go to Supabase Dashboard → Storage
2. Create a new bucket called `receipts`
3. Set it to **Public** (so images can be viewed on public bill pages)

### 4. Run the App

```bash
npm install
npm run dev
```

## Usage

1. Go to `/login` and enter your password
2. Click "Create New Receipt" to upload a receipt image
3. Add people and the amounts they owe
4. Generate a public link to share with friends
5. Friends can view the bill at `/bill/[id]` without needing to log in
