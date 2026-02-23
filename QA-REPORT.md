# QA Report - Nimo's Limerick Website

**Date:** 2026-02-21
**Tester:** QA Agent (Automated)
**Frontend:** http://localhost:3001 (served by `serve` from `/opt/nimos-website/`)
**API:** http://localhost:3000 (Node.js Express, `/root/.openclaw-nimos/workspace/nimos-system/`)

---

## VERDICT: CONDITIONAL PASS - 3 CRITICAL issues must be fixed before shipping

---

## 1. Homepage Flow

| Test | Result | Details |
|------|--------|---------|
| Homepage loads (HTTP 200) | **PASS** | Returns valid HTML with proper meta tags, structured data |
| Title correct | **PASS** | "Nimo's Limerick \| Pizza, Burgers & Takeaway Knocklong" |
| Address: "The Cross, Knocklong East, Co. Limerick" | **PASS** | Present in structured data (ld+json), footer (JS bundle), and siteInfo constant |
| Phone: +353 6243300 | **PASS** | Present in structured data, footer, and siteInfo |
| Schema.org structured data | **PASS** | Proper Restaurant + LocalBusiness schema with opening hours, geo, cuisine |
| Favicon loads | **PASS** | HTTP 200 for `/favicon.png` |
| Logo image loads | **PASS** | HTTP 200 for `/images/logo.png` |
| Hero background loads | **PASS** | HTTP 200 for `/images/hero-bg.png` |
| manifest.json valid | **PASS** | Proper PWA manifest with icons, theme color |
| robots.txt present | **PASS** | Properly blocks /api/, /admin/, /kitchen, /checkout, /account |
| sitemap.xml present | **PASS** | Lists all public pages with proper lastmod dates |
| Social media links | **WARNING** | Links point to generic `https://instagram.com`, `https://facebook.com`, `https://tiktok.com` - not the actual business profiles |
| 404 handling | **PASS** | Returns 200 (SPA fallback - React Router handles client-side 404) |

---

## 2. Menu Page

| Test | Result | Details |
|------|--------|---------|
| Menu API loads | **PASS** | `GET /api/menu` returns full menu with 11 categories, 57 items |
| Menu items have prices | **PASS** | All items have valid EUR prices |
| Menu items have descriptions | **PASS** | Most items have descriptions; some kebabs/wraps have empty descriptions (acceptable) |
| Option groups present | **PASS** | Pizzas have "Extra Toppings", burgers have "Extra Toppings" + "Choose Sauce" |
| Category icons | **PASS** | Each category has appropriate emoji icon |
| Popular items flagged | **PASS** | Popular items correctly marked (Pepperoni Pizza, Half Pounder, etc.) |
| Upsell IDs present | **PASS** | Items have upsell suggestions (drinks, sides) |
| Menu item modal (source code) | **PASS** | `MenuItemModal.jsx` handles option selection, quantity, special notes |

---

## 3. Authentication Flow

| Test | Result | Details |
|------|--------|---------|
| Register with valid data | **PASS** | Returns token + user object, user created in DB |
| Register with missing fields | **PASS** | Returns 400: "Name, email, and password required" |
| Register with duplicate email | **PASS** | Returns 409: "Email already registered" |
| Login with valid credentials | **PASS** | Returns token + user (including role) |
| Login with wrong password | **PASS** | Returns 401: "Invalid credentials" (no info leak about email existence) |
| Login with missing fields | **PASS** | Returns 400: "Email and password required" |
| GET /api/auth/me with token | **PASS** | Returns user profile (id, name, email, phone, role) |
| GET /api/auth/me without token | **PASS** | Returns 401: "No token provided" |
| Token validation on mount | **PASS** | `AuthContext.jsx` validates stored token on app load |
| Token cleared on 401 | **PASS** | Both `AuthContext.jsx` and `api.js` clear localStorage on 401 |
| Frontend password strength | **PASS** | `Register.jsx` shows password strength indicator (weak/fair/good/strong/excellent) |
| Frontend password min length | **PASS** | Client-side validation requires 8+ characters |
| Server-side password validation | **FAIL** | **No minimum password length enforced server-side.** Registration succeeds with password "123456" (6 chars). Frontend requires 8 but API does not. |
| Forgot password button | **WARNING** | Button exists but does nothing (no handler, no password reset endpoint) |

---

## 4. Cart & Order Flow

| Test | Result | Details |
|------|--------|---------|
| Place order (pickup, valid data) | **PASS** | Order created with correct items, prices, estimated_ready time |
| Place order with empty items | **PASS** | Returns 400: "Items required" |
| Place order with invalid item ID | **PASS** | Returns 400: "Item 99999 not found" |
| Place order without auth | **PASS** | Returns 401: "No token provided" |
| Delivery order without address | **PASS** | Returns 400: "Delivery address required" |
| Delivery order under minimum | **PASS** | Returns 400: "Minimum order for delivery is 15.00" |
| Server recalculates totals | **PASS** | Backend ignores client-sent subtotal/total, recalculates from DB prices |
| Order tracking (GET /api/orders/:id) | **PASS** | Returns full order with items, status, timestamps |
| Order not found | **PASS** | Returns 404 for non-existent order |
| My orders list | **PASS** | Returns all user orders, newest first, with items and reviews |
| Promo code validation | **PASS** | WELCOME10 returns valid=true with 10% discount |
| Invalid promo code | **PASS** | Returns 400: "Invalid promo code" |
| Loyalty points earned | **PASS** | Order earns points (1 point per EUR spent) |
| Cart persistence | **PASS** | `CartContext.jsx` saves/loads cart from localStorage |
| Checkout form validation | **PASS** | Validates name, phone (regex), address (min 10 chars for delivery) |
| Options field name mismatch | **WARNING** | Frontend sends `selected_options` but backend reads `options`. Options may not be applied to orders placed via the React frontend. See details below. |

**Options Mismatch Detail:**
- `Checkout.jsx` line 121: sends `selected_options: item.selectedOptions`
- `orders.js` line 40: reads `item.options || []`
- This means customizations (extra toppings, sauce choices) selected in the React app may NOT be applied to the order. The backend will process the order but ignore the options, resulting in incorrect pricing and missing customizations.

---

## 5. Admin API

| Test | Result | Details |
|------|--------|---------|
| GET /api/admin/dashboard (admin token) | **PASS** | Returns today's stats, pending orders, popular items, hourly data |
| GET /api/admin/dashboard (no auth) | **PASS** | Returns 401: "No token provided" |
| GET /api/admin/dashboard (customer token) | **PASS** | Returns 403: "Admin access required" |
| GET /api/admin/orders (admin token) | **PASS** | Returns all orders with customer info, items, platform data |
| GET /api/admin/settings (no auth) | **PASS** | Returns 401 |
| GET /api/admin/settings (customer token) | **PASS** | Returns 403: "Admin only" |
| GET /api/admin/settings (admin token) | **PASS** | Returns all settings including business config |
| Order status update | **PASS** | Valid statuses enforced: pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled |
| SSE order stream (admin) | **PASS** | Supports query token param for EventSource (which cannot set headers) |
| Kitchen role access | **PASS** | Kitchen role can access admin dashboard and orders (but not settings) |

---

## 6. Contact Form

| Test | Result | Details |
|------|--------|---------|
| Valid submission | **PASS** | Returns success message |
| Missing name | **PASS** | Returns 400: "Name and message required" |
| Missing message | **PASS** | Returns 400: "Name and message required" |
| Input too long (10000 chars) | **PASS** | Returns 400: "Input too long" (limits: name 200, email 200, phone 30, message 5000) |

---

## 7. Edge Cases & Security

| Test | Result | Details |
|------|--------|---------|
| XSS in registration name | **CRITICAL** | `<script>alert(document.cookie)</script>` stored as user name and returned in API responses. See CRITICAL-1 below. |
| XSS in contact form | **PASS** | Contact form only logs to console, no stored XSS risk (though the data is unsanitized in logs) |
| SQL injection in login | **PASS** | Parameterized queries via better-sqlite3 prevent injection |
| SQL injection in contact form | **PASS** | Contact form only logs, no DB queries with user input |
| SQL injection in admin filters | **PASS** | Admin order filters use parameterized queries |
| Rate limiting (API) | **PASS** | 500 requests per 15 min for general API |
| Rate limiting (auth) | **PASS** | 20 requests per 15 min for login/register |
| Rate limit response format | **WARNING** | Rate limiter returns generic HTML "Bad Request" instead of JSON `{"error":"..."}`. This breaks JSON-expecting clients. |
| CORS configuration | **PASS** | Properly restricts to allowed origins (localhost, nimoslimerick.ie). Evil origins get no Access-Control-Allow-Origin header. |
| Helmet security headers | **PASS** | HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy all present |
| JSON body limit | **PASS** | `express.json({ limit: '1mb' })` prevents oversized payloads |
| Customer order SSE (no auth) | **CRITICAL** | `/api/orders/:id/stream` requires NO authentication. Any user can connect to any order's real-time stream. See CRITICAL-2 below. |
| JWT secret hardcoded | **CRITICAL** | Secret is `'nimos-secret-key-change-in-production'` and only overridden by env var. See CRITICAL-3 below. |
| Google Maps API key exposed | **WARNING** | API key `AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8` hardcoded in `Checkout.jsx`. Should be restricted via Google Console or use env var. |
| Default admin credentials | **WARNING** | Seed data creates admin with `admin@nimos.ie` / `admin123`. Must be changed in production. |
| Default kitchen credentials | **WARNING** | Seed data creates kitchen user with `kitchen@nimos.ie` / `kitchen123`. |
| Stripe keys in settings | **PASS** | Currently empty strings (not configured yet). Settings endpoint requires admin-only auth. |
| Platform API keys in settings | **WARNING** | JustEat, Deliveroo, OrderYoYo config stored in settings table. Protected by admin-only middleware, but keys would be accessible to any admin user. |
| Password not hashed check | **PASS** | bcrypt with salt rounds 10. Password hash never returned in login/register responses. |
| Login response includes password_hash | **PASS** | `auth.js` line 32 destructures out `password_hash` before returning user. |
| Order ownership check | **PASS** | `GET /api/orders/:id` checks `user_id = req.user.id` - users cannot view other users' orders via REST API. |

---

## 8. Source Code Audit

### `/root/nimos-website/src/context/AuthContext.jsx`
- **PASS**: Token stored in localStorage (standard for SPAs)
- **PASS**: 401 responses clear auth state
- **PASS**: Token validated on mount via `/auth/me`
- **PASS**: All auth methods properly handle errors

### `/root/nimos-website/src/utils/api.js`
- **PASS**: Centralised request helper with proper error handling
- **PASS**: Custom `ApiError` class with status codes
- **PASS**: Request timeout (15 seconds) via AbortController
- **PASS**: 401 auto-clears token
- **PASS**: Human-readable error messages for common HTTP statuses
- **PASS**: URL parameters properly encoded with `encodeURIComponent`
- **PASS**: FormData handling strips Content-Type (lets browser set boundary)
- **WARNING**: SSE stream passes token as query parameter (`?token=...`). While necessary for EventSource, tokens in URLs may appear in server logs and browser history.

### `/root/nimos-website/src/context/CartContext.jsx`
- **PASS**: Cart persisted to localStorage
- **PASS**: Delivery minimum enforced client-side (15 EUR)
- **PASS**: Promo validation makes server call
- **PASS**: Proper cleanup on clear cart

### `/root/nimos-website/src/pages/Checkout.jsx`
- **PASS**: Form validation (name, phone, address)
- **PASS**: Phone regex validation
- **WARNING**: Options field name mismatch with backend (see section 4)
- **PASS**: Error display for failed submissions

### `/root/nimos-website/src/pages/Login.jsx`
- **PASS**: Email format validation
- **PASS**: Password show/hide toggle
- **PASS**: Redirect to original page after login
- **WARNING**: "Forgot password?" button is non-functional

### `/root/nimos-website/src/pages/Register.jsx`
- **PASS**: All fields validated client-side
- **PASS**: Password strength indicator
- **PASS**: Confirm password match check
- **PASS**: Terms checkbox required

### `/root/nimos-website/src/components/ProtectedRoute.jsx`
- **PASS**: Role-based access control
- **PASS**: Loading state handled
- **PASS**: Redirect to login with return path

### Backend: `/root/.openclaw-nimos/workspace/nimos-system/middleware/auth.js`
- **PASS**: Three middleware levels: authMiddleware, adminMiddleware, adminOnlyMiddleware
- **PASS**: Kitchen role has admin-level access for orders but not settings
- **CRITICAL**: JWT secret hardcoded (see CRITICAL-3)

### Backend: `/root/.openclaw-nimos/workspace/nimos-system/routes/orders.js`
- **PASS**: All SQL queries use parameterized statements
- **PASS**: Menu item existence and active status checked
- **PASS**: Prices recalculated server-side (not trusted from client)
- **PASS**: Restaurant open/pause status checked before accepting orders
- **PASS**: Promo code validation includes expiry, usage limits, minimum order
- **NOTE**: Line 94 uses template literal for settings key but is safe (ternary only produces 'delivery' or 'pickup')

---

## CRITICAL ISSUES (VETOES - Must fix before shipping)

### CRITICAL-1: Stored XSS via User Name
**File:** `/root/.openclaw-nimos/workspace/nimos-system/routes/auth.js` line 15
**Issue:** User registration accepts and stores arbitrary HTML/JS in the `name` field without sanitization. The name `<script>alert(document.cookie)</script>` is stored in the database and returned in API responses. When this name is rendered in the admin dashboard, order list, or anywhere user names appear, the XSS payload could execute.
**Impact:** An attacker could steal admin session tokens by registering with a malicious name, then placing an order. When an admin views the order, the script executes in their browser context.
**Fix:** Sanitize user input on the server side. Strip HTML tags from `name` field at minimum. Use a library like `xss` or `sanitize-html`. Also consider Content-Security-Policy headers.

### CRITICAL-2: Unauthenticated Order Stream SSE
**File:** `/root/.openclaw-nimos/workspace/nimos-system/server.js` lines 106-111
**Issue:** The endpoint `GET /api/orders/:id/stream` requires NO authentication. Any person can connect to any order's real-time update stream by guessing or iterating order IDs (which are sequential integers).
**Impact:** Attacker can monitor any customer's order status in real time, potentially revealing personal information (delivery address, phone number, order contents) if the stream broadcasts full order data.
**Fix:** Add `authMiddleware` and verify that `req.user.id` matches the order's `user_id`, or implement a unique order tracking token.

### CRITICAL-3: Hardcoded JWT Secret
**File:** `/root/.openclaw-nimos/workspace/nimos-system/middleware/auth.js` line 2
**Issue:** JWT secret is `'nimos-secret-key-change-in-production'` with env var fallback. If the env var `JWT_SECRET` is not set in production (which it currently is not), anyone who reads the source code can forge valid JWT tokens for any user, including admin.
**Impact:** Full authentication bypass. Attacker can generate admin tokens and access all admin functionality, modify orders, change settings, view customer data.
**Fix:** Generate a strong random secret (32+ bytes) and require it via env var. Fail to start if `JWT_SECRET` is not set. Never commit secrets to source code.

---

## WARNINGS (Should fix, not blocking)

### WARNING-1: Options Field Name Mismatch (Frontend/Backend)
**Frontend:** `Checkout.jsx` sends `selected_options` per order item
**Backend:** `orders.js` reads `item.options`
**Impact:** Pizza toppings, burger sauces, and other customizations selected by customers via the React app are silently dropped. Orders will be placed without customizations and with incorrect pricing.
**Severity:** HIGH - This is a functional bug that directly affects customer experience and order accuracy. While not a security issue, it should be treated as near-critical for a food ordering business.

### WARNING-2: No Server-Side Password Length Validation
**Backend:** `auth.js` does not enforce minimum password length
**Frontend:** Requires 8 characters
**Impact:** API can be used directly to create accounts with weak passwords (e.g., "1")

### WARNING-3: Default Admin Credentials in Seed Data
**File:** `db/init.js` lines 189-191
**Impact:** `admin@nimos.ie` / `admin123`, `kitchen@nimos.ie` / `kitchen123` - trivially guessable

### WARNING-4: Non-Functional Forgot Password
**File:** `Login.jsx` line 176
**Impact:** Button renders but has no click handler. Users with forgotten passwords have no recovery path.

### WARNING-5: Social Media Links Point to Generic URLs
**Impact:** Footer links go to `instagram.com`, `facebook.com`, `tiktok.com` root - not the business profiles.

### WARNING-6: Google Maps API Key Hardcoded
**File:** `Checkout.jsx` line 299
**Impact:** API key `AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8` is in the source code. Should be restricted via Google Cloud Console.

### WARNING-7: Rate Limiter Returns HTML Instead of JSON
**Impact:** When rate limit is hit, the response is HTML `<pre>Bad Request</pre>` instead of JSON. This breaks frontend error handling that expects JSON responses.

### WARNING-8: SSE Admin Token in URL
**File:** `api.js` line 256
**Impact:** Admin token passed as `?token=` query parameter for EventSource. Tokens may appear in server access logs.

---

## SUGGESTIONS (Nice to have)

1. **Add CSRF protection** for state-changing operations (POST/PUT/DELETE)
2. **Add request logging** with a structured logger (winston/pino) instead of `console.log`
3. **Add password reset flow** (email-based token reset)
4. **Add email verification** on registration
5. **Add order history pagination** - currently returns all orders with no limit for customers
6. **Add input sanitization middleware** globally (express-validator or similar)
7. **Add database connection pooling** - currently opens/closes DB connection per request
8. **Add health check for frontend** - verify React bundle loads and renders
9. **Consider HttpOnly cookies** instead of localStorage for token storage (prevents XSS token theft)
10. **Add Content-Security-Policy** header with proper directives (currently disabled: `contentSecurityPolicy: false`)
11. **Add Terms of Service and Privacy Policy pages** - buttons exist but link to nothing
12. **Move Google Maps API key to environment variable** and restrict it in Google Cloud Console
13. **Add order confirmation email/SMS** - notification service exists but may not be configured

---

## Test Summary

| Category | Pass | Fail | Warning |
|----------|------|------|---------|
| Homepage | 12 | 0 | 1 |
| Menu | 7 | 0 | 0 |
| Authentication | 11 | 1 | 1 |
| Cart & Orders | 14 | 0 | 1 |
| Admin API | 10 | 0 | 0 |
| Contact Form | 4 | 0 | 0 |
| Security | 12 | 3 | 5 |
| Source Code | 22 | 0 | 3 |
| **TOTAL** | **92** | **4** | **11** |

**Overall: 92 PASS, 4 FAIL (3 CRITICAL + 1 HIGH), 11 WARNINGS**

The 3 CRITICAL issues (stored XSS, unauthenticated SSE, hardcoded JWT secret) are **vetoes** and must be resolved before production deployment. The options field name mismatch (WARNING-1) should also be treated as a priority fix since it breaks core ordering functionality.
