# Supabase Master Setup Guide: From Zero to Production

This manual provides a comprehensive, step-by-step walkthrough for setting up a secure and scalable Supabase backend. Follow these instructions linearly to initialize your project, configure your database, and connect your application.

---

## 1. Project Initialization & Core Setup

### Creating Your Project
1.  Log in to the [Supabase Dashboard](https://app.supabase.com/).
2.  Click **New Project** and select an organization.
3.  **Project Details:**
    *   **Name:** Enter your project name (e.g., `My Awesome App`).
    *   **Database Password:** Generate a strong password and **save it immediately**. You will need this for CLI operations.
    *   **Region:** Choose the region closest to your users.
4.  Click **Create New Project**. It will take a few minutes to provision.

### Locating API Credentials
Once your project is ready, navigate to **Project Settings > API**:
*   **Project URL:** Your API endpoint (e.g., `https://xyz.supabase.co`).
*   **`anon` public key:** Safe to use in your frontend code.
*   **`service_role` secret key:** **CRITICAL WARNING: NEVER expose this key in client-side code.** It bypasses all Row Level Security (RLS) and should only be used in secure server-side environments or Edge Functions.

### Setting Up the Supabase CLI
1.  **Install the CLI** (requires Node.js/NPM):
    ```bash
    npm install supabase --save-dev
    ```
2.  **Login to your account**:
    ```bash
    npx supabase login
    ```
3.  **Initialize your local environment**:
    ```bash
    npx supabase init
    ```

---

## 2. Database Schema & Table Creation (SQL-First)

Copy and paste the following script into the **Supabase SQL Editor** to create your core tables.

```sql
-- CLEAN START: Drop existing tables if they exist
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. POSTS TABLE
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMENTS TABLE
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
```

---

## 3. Row Level Security (RLS) Policies

Execute this script in the **SQL Editor** to secure your data.

```sql
-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- POSTS POLICIES
CREATE POLICY "Posts are viewable by everyone." ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts." ON public.posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own posts." ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts." ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS POLICIES
CREATE POLICY "Comments are viewable by everyone." ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post comments." ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- AUTOMATIC PROFILE CREATION ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 4. Database Management & Operations

### Using the SQL Editor
*   **Open a Tab:** Click the **SQL Editor** icon in the sidebar and click **New Query**.
*   **Run Scripts:** Paste the provided SQL blocks and click **Run**. Look for "Success" in the output window.
*   **Verification:** Navigate to the **Table Editor** to see your new tables listed.

### Using the Table Editor
*   **Viewing Structure:** Click on a table name to see its columns and data types.
*   **Manual Insertion:** Click **Insert row** to add test data manually.
*   **Filtering:** Use the **Filter** button at the top to search for specific records.

### Database Functions
1.  Navigate to **Database > Functions**.
2.  Click **Create a new function**.
3.  **Example Function (Get Post Count):**
    *   **Name:** `get_user_post_count`
    *   **Arguments:** `user_id uuid`
    *   **Return type:** `integer`
    *   **Definition:** 
        ```sql
        BEGIN
          RETURN (SELECT count(*) FROM public.posts WHERE posts.user_id = $1);
        END;
        ```

---

## 5. Client-Side Integration Example (React/JS)

Install the library: `npm install @supabase/supabase-js`

```javascript
import { createClient } from '@supabase/supabase-js'

// 1. Initialize Client
const supabaseUrl = 'https://your-project-url.supabase.co'
const supabaseAnonKey = 'your-anon-key'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. Fetch All Posts
export const fetchPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
  
  if (error) console.error('Error:', error)
  return data
}

// 3. Authenticated Insert
export const createPost = async (title, content) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Must be logged in")

  const { data, error } = await supabase
    .from('posts')
    .insert([{ 
      title, 
      content, 
      user_id: user.id 
    }])
  
  return { data, error }
}
```

---

## 6. Final Checklist & Next Steps

### Setup Verification
- [ ] Project created in Supabase Dashboard.
- [ ] Schema SQL script executed successfully.
- [ ] RLS Policies SQL script executed successfully.
- [ ] Profile trigger tested (sign up a test user to see if profile appears).
- [ ] `anon` key added to your frontend environment variables.

### Recommended Next Steps
*   **Enable Auth Providers:** Go to **Authentication > Providers** to enable Google, GitHub, or Phone login.
*   **Configure Storage:** Create buckets in **Storage** for user uploads (e.g., `avatars`).
*   **Real-time:** Enable Real-time for your `posts` or `comments` tables to build live feeds.
*   **Backups:** Ensure you have a strategy for database backups (Supabase handles daily backups automatically on Pro plans).
