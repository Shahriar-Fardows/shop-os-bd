# 🏪 ShopOS BD — বাংলাদেশের কম্পিউটার শপের ডিজিটাল অপারেটিং সিস্টেম

> **"আপনার দোকানের প্রতিটি কাজ এখন হবে আরও স্মার্ট"**

**ShopOS BD** হলো বাংলাদেশের কম্পিউটার শপ, প্রিন্ট শপ ও ছোট ব্যবসায়ীদের জন্য তৈরি একটি **All-in-One SaaS Platform**। এই প্ল্যাটফর্ম ব্যবহার করে একজন দোকানদার তাঁর প্রতিদিনের সকল কাজ — ক্যাশ মেমো তৈরি থেকে শুরু করে বাকি খাতা, SMS রিমাইন্ডার, ইমেজ এডিটিং পর্যন্ত — একটি জায়গা থেকেই করতে পারবেন।

---

## 🧩 প্ল্যাটফর্মের পরিচয়

| বিষয় | বিবরণ |
|---|---|
| **টার্গেট ইউজার** | বাংলাদেশের কম্পিউটার শপ, প্রিন্ট শপ, ফ্রিল্যান্সার ও ছোট ব্যবসায়ী |
| **মডেল** | SaaS (Subscription-based) |
| **ফ্রি প্ল্যান** | আজীবন ফ্রি (সীমিত ফিচার সহ) |
| **পেইড প্ল্যান** | মাসিক সাবস্ক্রিপশন (Starter, Pro, Business) |
| **টেকনোলজি** | Next.js · Node.js · Express · MongoDB · Cloudflare R2 |

---

## ✨ মূল ফিচারসমূহ

### 🧾 ১. Cash Memo Maker (ক্যাশ মেমো মেকার)
- নিজের শপের **লোগো সহ** প্রফেশনাল ক্যাশ মেমো তৈরি করুন
- প্রিন্ট-রেডি ফরম্যাটে এক ক্লিকে প্রিন্ট করুন
- কাস্টম আইটেম, পরিমাণ, ছাড় ও মোট হিসাব করুন

### 📒 ২. Digital Khata (ডিজিটাল হিসাব খাতা)
- বাকি গ্রাহকদের তালিকা ও হিসাব রাখুন
- **অটো SMS রিমাইন্ডার** পাঠান বাকি পরিশোধের জন্য
- আয়-ব্যয়ের রিপোর্ট দেখুন ড্যাশবোর্ড থেকে

### 📱 ৩. SMS System (এসএমএস সিস্টেম)
- নিজের SMS প্যাকেজ কিনুন প্ল্যাটফর্ম থেকেই
- বাকি গ্রাহকদের স্বয়ংক্রিয়ভাবে SMS পাঠান
- SMS ডেলিভারি ট্র্যাক করুন

### 🖼️ ৪. Image Hub (ইমেজ হাব)
- **Cloudflare R2**-তে ছবি আপলোড ও সংরক্ষণ করুন
- মাসিক আপলোড লিমিট সাবস্ক্রিপশন প্ল্যান অনুযায়ী
- শেয়ারযোগ্য লিংক তৈরি করুন

### ✂️ ৫. Image Editor — BG Remover (ব্যাকগ্রাউন্ড রিমুভার)
- এআই দিয়ে ছবির ব্যাকগ্রাউন্ড সরান সহজে
- প্রোডাক্ট ফটো এডিট করুন

### 📄 ৬. CV / Bio-Data Maker (সিভি মেকার)
- প্রফেশনাল বাংলা ও ইংরেজি সিভি তৈরি করুন
- প্রিন্ট-রেডি PDF ফরম্যাটে ডাউনলোড করুন

### 📝 ৭. Application Letter (দরখাস্ত লেখক)
- বাংলায় চাকরির দরখাস্ত তৈরি করুন
- রেডিমেড টেমপ্লেট থেকে কাস্টমাইজ করুন

### 🔳 ৮. QR Code Maker (কিউআর কোড মেকার)
- যেকোনো লিংক বা তথ্যের QR কোড তৈরি করুন
- ডাউনলোড করুন ও প্রিন্ট করুন

### 🪪 ৯. NID Printer (এনআইডি প্রিন্টার)
- NID কার্ড প্রিন্ট করার জন্য সঠিক ফরম্যাট
- ফটো সাইজ ও লেআউট অটোমেটিক সেট হয়

### 🔗 ১০. Public Link Directory (পাবলিক লিংক ডিরেক্টরি)
- সরকারি ও বেসরকারি গুরুত্বপূর্ণ লিংকের তালিকা
- প্রতিদিনের কাজে দরকারী ওয়েবসাইটগুলো এক জায়গায়

---

## 🏗️ প্রজেক্ট স্ট্রাকচার

```
Shop_OS_Bd/
├── shoposbd/           # Client Portal (Next.js) — shoposbd.com
│   ├── app/
│   │   ├── dashboard/  # User Dashboard (Cash Memo, Khata, SMS, Image Hub, etc.)
│   │   ├── register/   # Registration
│   │   ├── login/      # Login
│   │   └── page.jsx    # Landing / Homepage
│   └── components/     # Reusable UI Components
│
├── admin-panel/        # Admin Panel (React/Next.js) — Admin Only
│   └── src/
│       └── app/
│           └── dashboard/
│               ├── clients/        # ক্লায়েন্ট ম্যানেজমেন্ট
│               ├── packages/       # সাবস্ক্রিপশন প্যাকেজ
│               ├── payments/       # পেমেন্ট ট্র্যাকিং
│               ├── sms-orders/     # এসএমএস অর্ডার
│               ├── referrals/      # রেফারেল সিস্টেম
│               ├── platform-config/# প্ল্যাটফর্ম কনফিগ
│               └── links/          # পাবলিক লিংক ম্যানেজ
│
└── server/             # Backend API (Node.js + Express + TypeScript)
    └── src/app/modules/
        ├── auth/           # অথেনটিকেশন
        ├── client/         # ক্লায়েন্ট মডিউল
        ├── package/        # সাবস্ক্রিপশন প্যাকেজ
        ├── payment/        # পেমেন্ট
        ├── sms/            # এসএমএস সার্ভিস
        ├── sms-order/      # এসএমএস অর্ডার
        ├── image-hub/      # ইমেজ স্টোরেজ (R2)
        ├── accounting/     # হিসাব খাতা
        ├── link/           # পাবলিক লিংক
        ├── referral/       # রেফারেল
        ├── support/        # সাপোর্ট টিকেট
        └── platform-config/# সাইট কনফিগ
```

---

## 🔑 সাবস্ক্রিপশন প্ল্যান

| প্ল্যান | মূল্য | Image Upload/মাস | SMS |
|---|---|---|---|
| **Starter** | ফ্রি | সীমিত | নেই |
| **Basic** | মাসিক | আরও বেশি | অ্যাড-অন |
| **Pro** | মাসিক | আনলিমিটেড | অন্তর্ভুক্ত |

> 🌏 **South Asia Pricing** ও **Global Pricing** আলাদা — লোকেশন অনুযায়ী স্বয়ংক্রিয়ভাবে দেখায়।

---

## 🚀 লোকাল সেটআপ

### Client Portal (shoposbd)

```bash
cd shoposbd
npm install
npm run dev
# http://localhost:3000
```

### Admin Panel

```bash
cd admin-panel
npm install
npm run dev
# http://localhost:3001
```

### Backend Server

```bash
cd server
npm install
npm run dev
# http://localhost:5000
```

### `.env.local` (Client Portal)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

---

## 🛠️ টেকনোলজি স্ট্যাক

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB (Mongoose) |
| **Storage** | Cloudflare R2 (S3-compatible) |
| **SMS** | Teletalk / Custom SMS Gateway |
| **Auth** | JWT Token-based |
| **Deployment** | Vercel (Client) · Custom Server (API) |

---

## 📌 গুরুত্বপূর্ণ লিংক

- 🌐 **ওয়েবসাইট:** [shoposbd.com](https://shoposbd.com)
- 💬 **Facebook:** ShopOS BD

---

## 📄 লাইসেন্স

© ২০২৬ ShopOS BD · Made with ❤️ for Bangladesh 🇧🇩  
All rights reserved. Unauthorized use or distribution is prohibited.
