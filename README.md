# Ghar Sathi - Full Stack Application

Ghar Sathi is a hyperlocal service and workforce marketplace, similar to Urban Company and Uber. This repository contains the web-based landing page, the admin panel, and a simulated mobile app experience.

## Architecture

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js + Express (Server-side API)
- **Database & Auth**: Supabase (PostgreSQL)
- **Deployment**: AI Studio / Cloud Run (or Vercel for frontend)

## Setup Guide

### 1. Environment Variables
Create a `.env` file in the root directory and add the following variables:

```env
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Supabase Schema (Tables & Relations)

Execute the following SQL in your Supabase SQL Editor to set up the database:

```sql
-- Profiles Table (Users & Workers)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('customer', 'worker', 'admin')),
  full_name TEXT,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Worker Details Table
CREATE TABLE worker_details (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  service_category TEXT,
  hourly_rate NUMERIC,
  is_online BOOLEAN DEFAULT false,
  current_location GEOGRAPHY(POINT),
  rating NUMERIC DEFAULT 5.0,
  total_jobs INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'pending'
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id),
  worker_id UUID REFERENCES profiles(id),
  service_type TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  amount NUMERIC,
  location GEOGRAPHY(POINT),
  address TEXT,
  scheduled_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B2B Jobs Table
CREATE TABLE b2b_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT,
  title TEXT,
  workers_needed INTEGER,
  location TEXT,
  duration TEXT,
  budget NUMERIC,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime Setup
ALTER PUBLICATION supabase_realtime ADD TABLE worker_details;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- ⚠️ IMPORTANT: For testing purposes, you may want to disable RLS (Row Level Security) 
-- on these tables if you are getting "Failed to save" or "Permission denied" errors.
-- Run these commands in your Supabase SQL Editor to allow all access during development:
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE worker_details DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE b2b_jobs DISABLE ROW LEVEL SECURITY;
```

---

## Razorpay Integration Steps

1. **Create Razorpay Account**: Sign up at Razorpay and get your `Key ID` and `Key Secret`.
2. **Backend Order Creation**:
   In `server.ts`, add an endpoint to create an order:
   ```javascript
   const Razorpay = require('razorpay');
   const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

   app.post('/api/create-order', async (req, res) => {
     const options = { amount: req.body.amount * 100, currency: "INR", receipt: "receipt_order_74394" };
     const order = await razorpay.orders.create(options);
     res.json(order);
   });
   ```
3. **Frontend Checkout**:
   In the React app, load the Razorpay script and open the checkout modal:
   ```javascript
   const options = {
     key: import.meta.env.VITE_RAZORPAY_KEY_ID,
     amount: order.amount,
     currency: "INR",
     name: "Ghar Sathi",
     description: "Service Booking",
     order_id: order.id,
     handler: function (response) {
       // Verify payment signature on backend
       verifyPayment(response);
     },
   };
   const rzp = new window.Razorpay(options);
   rzp.open();
   ```

---

## AI Integration Explanation

The application integrates AI in several key areas:

1. **Smart Worker Recommendation**: Uses embeddings to match customer requirements with worker skills and historical performance.
2. **Dynamic Pricing**: Analyzes real-time demand, weather, and worker availability to suggest optimal pricing for services.
3. **Admin Insights**: The dashboard uses AI to predict demand surges (e.g., AC repairs during heatwaves) and suggests actionable steps like push notifications.
4. **Chat Summarization**: For B2B worker groups, AI summarizes long chat threads to extract key action items and schedules.
