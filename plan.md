# Selvo Web Application - Complete Analysis & Implementation Plan

## Context
This document contains a full analysis of the Selvo mobile app (Flutter) and a detailed implementation plan to build its web counterpart using Next.js + React. The web app will share the same Firebase data, so users see the same data on both platforms.

### Decisions
- **Stack**: Next.js 15 (App Router) + React 19 + TypeScript
- **Target**: Desktop-first responsive (adapts to tablet/mobile)
- **Data**: Shared with mobile app (same Firestore collections)
- **Repo**: Separate repository (`selvo-web`)
- **Deployment**: Vercel or Firebase Hosting

---

# PART 1: MOBILE APP ANALYSIS

---

## 1. App Architecture

### Dual-Firebase Architecture
- **Main Firebase** (`selvo-bdd45`): Auth (email/password + Google), user profiles, Splitwise API key storage, project ownership registry
- **User Firebase** (user's own project): ALL financial data - transactions, budgets, categories, recurring rules
- Each user connects their own Firebase project for data privacy/ownership

### Auth Flow
```
Login (email/pwd or Google)
  -> Email verification (Google skips)
  -> Load saved Firebase config (SharedPreferences -> Firestore fallback)
  -> If no config: Welcome Screen -> Firebase Setup Screen
  -> Seed default categories
  -> Process pending recurring transactions
  -> Main App (ShellScreen with bottom nav)
```

### State Management
- No state management library - uses StatefulWidgets
- Singleton services: `UserFirebaseManager.instance`, `StreamCache.instance`
- Firestore streams deduplicated via `StreamCache` (replays last value to late subscribers)
- SQLite (`sqflite`) for offline caching

---

## 2. Complete Data Models

### 2.1 Transaction
**Firestore path**: `users/{uid}/transactions/{docId}`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| type | string | Yes | "income" \| "expense" |
| amount | double | Yes | |
| category | string | Yes | Category name |
| name | string | Yes | Description |
| date | Timestamp | Yes | Transaction date |
| note | string | No | Optional note |
| paymentMode | string | No | "Cash" \| "Card" \| "UPI" \| "" |
| splitwiseId | string | No | If imported from Splitwise |
| createdAt | Timestamp | Yes | Server timestamp |
| recurringSourceId | string | No | If auto-generated from recurring |
| recurringOccurrenceAt | Timestamp | No | If auto-generated from recurring |

### 2.2 Category
**Firestore path**: `users/{uid}/categories/{docId}`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | Unique per type |
| type | string | Yes | "expense" \| "income" |
| iconCode | int | Yes | Material Icon codePoint |
| colorValue | int | Yes | ARGB32 color integer |
| createdAt | Timestamp | Yes | Server timestamp |

**Built-in Expense Categories (11)**:
| # | Name | Icon | Color |
|---|------|------|-------|
| 1 | Food & Dining | restaurant | #E74C3C |
| 2 | Groceries | local_grocery_store | #FF7043 |
| 3 | Transport | directions_bus | #3498DB |
| 4 | Shopping | shopping_bag | #9B59B6 |
| 5 | Bills | receipt | #F39C12 |
| 6 | Home | home | #8D6E63 |
| 7 | Entertainment | movie | #E91E63 |
| 8 | Travel | flight | #26A69A |
| 9 | Health | local_hospital | #2ECC71 |
| 10 | Education | school | #00BCD4 |
| 11 | Other | more_horiz | #95A5A6 |

**Built-in Income Categories (6)**:
| # | Name | Icon | Color |
|---|------|------|-------|
| 1 | Salary | account_balance | #2ECC71 |
| 2 | Freelance | laptop | #3498DB |
| 3 | Business | storefront | #F39C12 |
| 4 | Investment | trending_up | #9B59B6 |
| 5 | Gift | card_giftcard | #E91E63 |
| 6 | Other | more_horiz | #95A5A6 |

### 2.3 Budget
**Firestore path**: `users/{uid}/budgets_{YYYY-MM}/{docId}`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| category | string | Yes | Category being budgeted |
| amount | double | Yes | Budget limit |
| name | string | No | Optional custom name |

- One subcollection per month (e.g., `budgets_2026-03`)
- Parent doc `users/{uid}` has `budgetMonthKeys` array tracking active months

### 2.4 Recurring Transaction
**Firestore path**: `users/{uid}/recurring/{docId}`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| type | string | Yes | "income" \| "expense" |
| amount | double | Yes | |
| category | string | Yes | |
| name | string | Yes | |
| frequency | string | Yes | "daily" \| "weekly" \| "monthly" |
| nextDate | Timestamp | Yes | Next occurrence |
| paymentMode | string | No | For expenses |
| note | string | No | |
| isActive | bool | Yes | Enable/disable toggle |
| createdAt | Timestamp | Yes | Server timestamp |

### 2.5 User Profile
**Firestore path (Main Firebase)**: `users/{uid}`

| Field | Type | Notes |
|-------|------|-------|
| name | string | Display name |
| email | string | |
| updatedAt | Timestamp | |
| splitwiseApiKey | string | Optional |
| firebaseConfig | Map | User's secondary Firebase config |
| configSetAt | Timestamp | When config was set |
| budgetMonthKeys | array | Active budget months |

### 2.6 Project Ownership
**Firestore path (Main Firebase)**: `firebase_projects/{projectId}`

| Field | Type | Notes |
|-------|------|-------|
| uid | string | Owner's UID |
| connectedAt | Timestamp | When connected |

### 2.7 UserFirebaseConfig
| Field | Type |
|-------|------|
| apiKey | string |
| projectId | string |
| appId | string |
| storageBucket | string |
| messagingSenderId | string |

---

## 3. All Services & Business Logic

### 3.1 AuthService
| Method | Description |
|--------|-------------|
| `signInWithEmail(email, pwd)` | Email/pwd login, enforces email verification |
| `registerWithEmail(email, pwd, name)` | Create account + send verification email + save profile |
| `resendVerificationEmail()` | Resend verification |
| `isEmailVerified()` | Reload + check |
| `signInWithGoogle()` | Google popup (web) / GoogleSignIn package (mobile) |
| `sendPasswordReset(email)` | Password reset email |
| `signOut()` | Clear local DB + Splitwise token + sign out |
| `deleteAccount()` | Delete Firestore data -> clear cache -> delete auth |

### 3.2 UserFirebaseManager (Singleton)
| Method | Description |
|--------|-------------|
| `loadSavedConfig(uid)` | Load from cache then Firestore fallback |
| `validateConfig(cfg, uid?)` | Test write/read on `_connection_test` collection |
| `connectWithConfig(uid, cfg)` | Save to Firestore + cache + register ownership |
| `isProjectUsedByOther(projectId, uid)` | Check duplicate registration, returns `String?` (null = OK) |
| `disconnect(clearOwnership)` | Teardown secondary app + clear cache |
| **Getters**: `userFirestore`, `config`, `isConnected` | |

### 3.3 FirestoreService

**Transactions**:
- `addTransaction()` - Create expense/income with optional Splitwise ID
- `transactionsStream()` - Emits cached first, then live Firestore
- `updateTransaction(docId, data)` - Update specific fields
- `deleteTransaction(docId)` - Delete
- `reAddTransaction(data)` - Undo support
- `getImportedSplitwiseIds()` - Set of already-imported Splitwise IDs

**Categories**:
- `seedDefaultCategories()` - Batch add only missing defaults on startup
- `addCategory()` - Validates uniqueness (normalized: lowercase, trimmed)
- `categoriesStream()` - Filters out built-ins for display
- `deleteCategory(docId)`

**Budgets**:
- `setBudget(category, amount, monthKey)` - Create/update
- `deleteBudget()` - Auto-removes month index if empty
- `budgetsStream(monthKey)` - Cached + live

**Recurring**:
- `addRecurring()`, `updateRecurring()`, `toggleRecurring(docId, isActive)`, `recurringStream()`

**Splitwise Key** (Main Firebase only):
- `saveSplitWiseApiKey()`, `getSplitWiseApiKey()`, `clearSplitWiseApiKey()`

**User Profile** (Main Firebase):
- `saveUserProfile()`, `getUserProfile()` (cache-first)

**Data Deletion**:
- `deleteAllUserData()` - Deletes everything from both Firebases + clears SQLite

### 3.4 StreamCache (Singleton)
- Deduplicates Firestore stream subscriptions
- Replays last value instantly to new listeners (for lazy-loaded tabs)
- Cached: transactions, categories (by type), budgets (by monthKey), recurring
- `dispose()` cancels all subscriptions on logout

### 3.5 RecurringService
Runs once at app startup:
1. Fetch all active recurring docs where `nextDate <= now`
2. For each: create transaction with ID `recurring_{docId}_{milliseconds}`
3. Advance `nextDate` by frequency interval, repeat until future
4. Uses Firestore transaction for atomicity

### 3.6 SplitwiseService
- **Auth**: API key only (Bearer token) - NO OAuth2
- **Base URL**: `https://secure.splitwise.com/api/v3.0`
- **Token storage**: SharedPreferences (fast) + Main Firestore (persistent)
- **Methods**: `getCurrentUser()`, `getExpenses()`, `getFriends()`, `getGroups()`
- **Parsing**: Maps Splitwise categories to Selvo categories, detects settlements
- **Category Mapping**: Food->Food & Dining, Transportation->Transport, Utilities->Bills, etc.

### 3.7 ComputeService (Isolate-based)

**`computeReports(allTx, year, month)`** returns:
- Current month: income, expense, category breakdowns, daily expense map
- Comparison: last month expense, same month last year, YTD
- 6-month trend: monthly income/expense arrays
- Stats: expense change %, YoY change %, top spending day, avg daily

**`computeDashboard(allTx)`** returns:
- Monthly totals: income, expense, balance, category totals
- Top 8 categories by amount
- Recent 5 transactions (sorted by date DESC, then createdAt DESC)

### 3.8 BiometricService
- `isAvailable()`, `authenticate()`, `isEnabled()`, `setEnabled()`
- Storage: SharedPreferences key `app_lock_enabled`
- **Web note**: Skip for web (limited browser support)

---

## 4. All Screens & Features

### 4.1 Login Screen
- Email + password form with validation
- Google Sign-In button
- Forgot Password bottom sheet (email input -> sends reset)
- Password visibility toggle
- Animated background with pulse animation on logo

### 4.2 Welcome Screen (Onboarding)
- 3-page carousel:
  1. "Welcome to Selvo" (wallet icon, orange gradient)
  2. "Your Data, Your Cloud" (cloud icon, dark gradient)
  3. "Built with Purpose" (star icon, green gradient) + Founder card
- Skip button, page indicator dots, Next/Get Started buttons

### 4.3 Firebase Setup Screen
- **Step 1**: Upload `google-services.json` or manual field entry (API Key, Project ID, App ID, Storage Bucket, Messaging Sender ID) + "Test Connection"
- **Step 2**: Display Firestore security rules + copy-to-clipboard + confirmation checkbox
- Validates project not already used by another user

### 4.4 Shell Screen (Main Navigation)
- Bottom nav: Dashboard(0) | Transactions(1) | [FAB] | Budget(3) | Settings(4)
- Center FAB opens modal: "Expense" or "Income" card selection
- Lazy-loaded tabs via IndexedStack
- SyncIndicator in top-right

### 4.5 Dashboard Screen
- **Header**: Avatar, greeting (Good Morning/Afternoon/Evening), display name
- **Balance Card**: Animated counter, income/expense badges
- **Charts**: Pie chart (expense breakdown), bar chart (income vs expense)
- **Period Selector**: Daily / Weekly / Monthly
- **Top Categories**: Top 8 with % bars
- **Recent Transactions**: Last 5, tappable
- **Splitwise Card**: Friend balances (if connected)
- Isolate-based computation, 5-min Splitwise API cache

### 4.6 Transaction List Screen
- Search bar (animated expand/collapse)
- Filter chips: All | Income | Expense
- Date range picker with chip display
- Grouped by month, sorted by date DESC then createdAt DESC
- Each item: category icon, name, amount (green/red), date

### 4.7 Add Expense Screen
- Orange/red gradient header with large amount input (₹ prefix)
- Form: Category (chip selector), Name, Date, Payment Mode (Cash/Card/UPI), Note
- Edit mode: pre-fills + Delete button with confirmation

### 4.8 Add Income Screen
- Green gradient header with large amount input
- Label "Source" instead of "Category", no Payment Mode, defaults to "Salary"

### 4.9 Transaction Detail Screen
- Type badge, large amount, name
- Detail rows: Category, Name, Date, Payment Mode (if expense), Note
- Edit and Delete buttons

### 4.10 Budget Screen
- Month navigation (prev/next + month picker)
- Budget list: category icon, budget amount, spent amount, progress bar
- Add/Edit bottom sheet: category selector (locked on edit), amount, optional name
- Only expense categories

### 4.11 Budget vs Expense Screen
- Bar chart: budget vs actual side-by-side
- Summary: total budget, total spent, remaining, % used
- Per-category table with status badges (On Track / Warning / Over Budget)

### 4.12 Categories Screen
- Tabs: Expense | Income
- Default categories (read-only)
- Custom categories (editable, deletable)
- Add bottom sheet: name, icon grid (24 icons), color picker (12 colors)

### 4.13 Recurring Transactions Screen
- Grouped by type: category icon, name, frequency, amount, next date
- Add form: type, category, name, amount, frequency, next date, payment mode, note
- Toggle active/inactive, delete confirmation

### 4.14 Reports Screen
- Month navigation + picker
- Chart tabs: Expense pie | Income pie
- Legend: category, amount, percentage
- Insights: total, count, top category, average
- Excel export (.xlsx)

### 4.15 Settings Screen
- Profile: avatar, name, email, edit bottom sheet
- App Lock: biometric toggle
- Theme: Light/Dark
- Links: Recurring, Categories, Splitwise
- Data: CSV export
- Advanced: Logout, Firebase config, account deletion

### 4.16 Splitwise Screen
- API key connection + validation
- Tab 1: Expenses & Settlements (filter, multi-select import, tracks imported IDs)
- Tab 2: Friend Balances (name, avatar, amount, color-coded)
- Disconnect with confirmation

---

## 5. Design System

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| orange (primary) | #CF4500 | Brand, buttons, accents |
| orangeLight | #FF6B2C | Dark mode primary |
| income | #2ECC71 | Income amounts, badges |
| expense | #CF4500 | Expense amounts |
| budget | #3498DB | Budget elements |
| charcoal | #323231 | Body text (light) |
| charcoalLight | #4A4A49 | Secondary text |
| surfaceLight | #F8F8F8 | Background (light) |
| surfaceDark | #1E1E1E | Background (dark) |
| cardLight | #FFFFFF | Cards (light) |
| cardDark | #2A2A2A | Cards (dark) |
| Chart palette | #CF4500, #323231, #8E8E8D, #2ECC71, #3498DB, #F39C12 | Charts |

### Typography
| Style | Font | Size | Weight |
|-------|------|------|--------|
| Display Large | Plus Jakarta Sans | 40px | 800 |
| Display Medium | Plus Jakarta Sans | 32px | 700 |
| Headline Large | Plus Jakarta Sans | 24px | 700 |
| Headline Medium | Plus Jakarta Sans | 20px | 600 |
| Title Large | Inter | 18px | 600 |
| Title Medium | Inter | 16px | 500 |
| Body Large | Inter | 16px | 400 |
| Body Medium | Inter | 14px | 400 |
| Label Large | Inter | 14px | 600 |
| Label Small | Inter | 11px | 500 |

### Component Styles
| Component | Spec |
|-----------|------|
| Cards | 16px radius, 0 elevation, 1px border (#EEE / #3A3A3A dark) |
| Buttons | 12px radius, 24px h-padding, 14px v-padding |
| Bottom Sheets | 28px top radius |
| TextFields | 12px radius, filled, 2px orange focus border |
| Snackbars | Floating, 12px radius, charcoal bg |

### Formatting
- **Currency**: Indian numbering (1,00,000) with ₹ symbol
- **Dates**: `dd MMMM yyyy` for display, `MMMM yyyy` for month headers
- **Decimal**: Max 2 decimal places

---

## 6. Caching & Sync Strategy

| Data | Mobile Cache | Web Equivalent |
|------|-------------|----------------|
| Transactions | SQLite (full replace) | Firestore persistence + localStorage |
| Categories | SQLite (full replace) | Same |
| Budgets | SQLite (per-month replace) | Same |
| Recurring | SQLite (full replace) | Same |
| User Profile | SQLite | localStorage |
| Firebase Config | SharedPreferences (JSON) | localStorage |
| Splitwise Token | SharedPreferences + Firestore | localStorage + Firestore |
| Theme | SharedPreferences | localStorage (next-themes) |

**On Logout**: Cancel streams -> Clear localStorage -> Disconnect secondary Firebase -> Clear Splitwise token

---

## 7. Firestore Security Rules

**Main Firebase**:
```
users/{uid}: read/write by authenticated user {uid}
firebase_projects/{projectId}: read by ANY authenticated user
```

**User's Firebase**:
```
users/{uid}/transactions/*: read/write by owner
users/{uid}/categories/*: read/write by owner
users/{uid}/budgets_*/*: read/write by owner
users/{uid}/recurring/*: read/write by owner
```

---

# PART 2: WEB IMPLEMENTATION PLAN

---

## 8. Tech Stack & Libraries

| Purpose | Library | Why |
|---------|---------|-----|
| Framework | Next.js 15 (App Router) | SSR, file routing, React Server Components |
| UI | React 19 + TypeScript | Type safety, hooks-based state |
| Styling | Tailwind CSS 4 | Utility-first, maps to design tokens |
| Components | shadcn/ui | Headless, customizable (dialog, sheet, toast) |
| Firebase | firebase JS SDK v10 | Same Firestore as mobile |
| Charts | Recharts | React-native charts, pie/bar/line |
| Icons | Lucide React | Maps well to Material Icons |
| Date Formatting | date-fns | Lightweight, tree-shakeable |
| Excel Export | SheetJS (xlsx) | .xlsx in browser |
| CSV Export | Native JS | String generation + Blob download |
| Theme | next-themes | Light/dark, system detect, localStorage |
| Fonts | next/font | Plus Jakarta Sans + Inter |
| Toast | sonner | Lightweight (shadcn default) |
| File Upload | Native HTML | google-services.json upload |
| HTTP | Native fetch | Splitwise API |
| Caching | localStorage | Replaces SharedPreferences |
| Heavy Computation | Web Workers | Replaces Dart isolates |

---

## 9. Project Structure

```
selvo-web/
├── public/
│   ├── favicon.ico
│   └── icons/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, providers, auth guard)
│   │   ├── page.tsx                  # Redirect -> /dashboard or /login
│   │   ├── login/page.tsx
│   │   ├── welcome/page.tsx
│   │   ├── setup/page.tsx            # Firebase setup wizard
│   │   ├── (app)/                    # Authenticated route group
│   │   │   ├── layout.tsx            # Sidebar + header shell
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── transactions/
│   │   │   │   ├── page.tsx          # List view
│   │   │   │   └── [id]/page.tsx     # Detail view
│   │   │   ├── budget/
│   │   │   │   ├── page.tsx
│   │   │   │   └── comparison/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── recurring/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── splitwise/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts            # Main Firebase init
│   │   │   ├── user-firebase.ts     # Secondary Firebase manager
│   │   │   └── auth.ts              # Auth helpers
│   │   ├── services/
│   │   │   ├── firestore.ts         # All CRUD operations
│   │   │   ├── stream-cache.ts      # Firestore stream dedup
│   │   │   ├── recurring.ts         # Process recurring on login
│   │   │   ├── splitwise.ts         # Splitwise API
│   │   │   └── compute.ts           # Web Worker computation
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-transactions.ts
│   │   │   ├── use-categories.ts
│   │   │   ├── use-budgets.ts
│   │   │   ├── use-recurring.ts
│   │   │   └── use-theme.ts
│   │   ├── types/
│   │   │   ├── transaction.ts
│   │   │   ├── category.ts
│   │   │   ├── budget.ts
│   │   │   ├── recurring.ts
│   │   │   └── user.ts
│   │   ├── constants/
│   │   │   ├── categories.ts        # Defaults with icons/colors
│   │   │   └── splitwise-map.ts     # Splitwise -> Selvo mapping
│   │   └── utils/
│   │       ├── format.ts            # Indian numbers, currency, dates
│   │       └── helpers.ts
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── sidebar.tsx          # Desktop sidebar nav
│   │   │   ├── header.tsx           # Top bar
│   │   │   └── mobile-nav.tsx       # Responsive bottom nav
│   │   ├── charts/
│   │   │   ├── pie-chart.tsx
│   │   │   ├── bar-chart.tsx
│   │   │   └── trend-chart.tsx
│   │   ├── transaction/
│   │   │   ├── transaction-form.tsx
│   │   │   ├── transaction-list.tsx
│   │   │   └── transaction-item.tsx
│   │   ├── budget/
│   │   │   ├── budget-form.tsx
│   │   │   └── budget-progress.tsx
│   │   ├── category/
│   │   │   ├── category-chip.tsx
│   │   │   ├── category-form.tsx
│   │   │   └── icon-color-picker.tsx
│   │   ├── splitwise/
│   │   │   ├── connect-form.tsx
│   │   │   ├── expense-list.tsx
│   │   │   └── balance-card.tsx
│   │   └── shared/
│   │       ├── empty-state.tsx
│   │       ├── month-picker.tsx
│   │       ├── sync-indicator.tsx
│   │       └── currency-input.tsx
│   └── providers/
│       ├── auth-provider.tsx
│       ├── firebase-provider.tsx
│       └── theme-provider.tsx
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 10. Architectural Decisions for Web

### 10.1 Sidebar Navigation (replaces Bottom Nav)
```
┌──────────┬──────────────────────────────────────┐
│ SELVO    │                                      │
│          │                                      │
│ Dashboard│          MAIN CONTENT                │
│ Transact.│                                      │
│ Budget   │                                      │
│ Reports  │                                      │
│ Splitwise│                                      │
│          │                                      │
│ ──────── │                                      │
│ Categories│                                     │
│ Recurring│                                      │
│ Settings │                                      │
│          │                                      │
│ + Add    │                                      │
│ Transaction                                     │
└──────────┴──────────────────────────────────────┘
```
- On mobile (<768px): collapses to hamburger or bottom nav
- "Add Transaction" is a prominent button in sidebar

### 10.2 Dual Firebase on Web
Same pattern as mobile:
1. Main Firebase initialized at startup with env vars
2. Secondary Firebase: `initializeApp(userConfig, { name: 'userDb' })`
3. `getFirestore(secondaryApp)` for all financial data

### 10.3 Firestore Streams -> React Hooks
```typescript
function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(userFirestore, `users/${uid}/transactions`),
      (snap) => setTransactions(snap.docs.map(docToTransaction))
    );
    return unsub;
  }, [uid]);
  return transactions;
}
```

### 10.4 Caching
- **localStorage**: Firebase config, theme, Splitwise token, user profile
- **Firestore offline persistence**: `enableIndexedDbPersistence` for data
- No manual SQLite needed on web

### 10.5 Isolates -> Web Workers
Heavy computation (reports, dashboard) runs in Web Workers to avoid blocking UI.

### 10.6 Bottom Sheets -> Dialogs/Side Sheets
- Forms: **Sheet** (slide-in side panel) or **Dialog** (centered modal)
- Month picker: Popover/dropdown

### 10.7 Auth
- `signInWithPopup(auth, googleProvider)` for Google
- `signInWithEmailAndPassword` for email
- Auth state via `onIdTokenChanged` in AuthProvider context

---

## 11. Screen-by-Screen Web Adaptation

| Mobile Screen | Web Route | Key Web Changes |
|---------------|-----------|-----------------|
| LoginScreen | `/login` | Full-page centered card, Google popup |
| WelcomeScreen | `/welcome` | Horizontal stepper (not swipe carousel) |
| FirebaseSetupScreen | `/setup` | Step wizard with drag-and-drop file zone |
| ShellScreen | `(app)/layout.tsx` | Sidebar + header replaces bottom nav |
| DashboardScreen | `/dashboard` | Multi-column grid, charts side-by-side |
| TransactionListScreen | `/transactions` | Table view with sortable columns |
| AddExpense/Income | Dialog/Sheet | Side sheet overlay, not full screen |
| TransactionDetail | `/transactions/[id]` | Detail page or expandable row |
| BudgetScreen | `/budget` | Grid of budget cards |
| BudgetVsExpense | `/budget/comparison` | Full-width comparison charts |
| CategoriesScreen | `/categories` | Tabs with grid layout |
| RecurringScreen | `/recurring` | Table with inline edit |
| ReportsScreen | `/reports` | Full-width charts, export in header |
| SettingsScreen | `/settings` | Settings as card sections |
| SplitwiseScreen | `/splitwise` | Two-column: expenses + balances |

---

## 12. Icon Mapping (Material -> Lucide)

```typescript
const ICON_MAP: Record<string, string> = {
  'restaurant': 'utensils',
  'local_grocery_store': 'shopping-cart',
  'directions_bus': 'bus',
  'shopping_bag': 'shopping-bag',
  'receipt': 'receipt',
  'home': 'home',
  'movie': 'film',
  'flight': 'plane',
  'local_hospital': 'heart-pulse',
  'school': 'graduation-cap',
  'more_horiz': 'more-horizontal',
  'account_balance': 'landmark',
  'laptop': 'laptop',
  'storefront': 'store',
  'trending_up': 'trending-up',
  'card_giftcard': 'gift',
  'category': 'grid-2x2',
  'phone_android': 'smartphone',
  'sports_esports': 'gamepad-2',
  'pets': 'paw-print',
  'coffee': 'coffee',
  'fitness_center': 'dumbbell',
  'child_care': 'baby',
  'build': 'wrench',
  'wifi': 'wifi',
  'local_gas_station': 'fuel',
  'local_parking': 'parking-circle',
  'attach_money': 'dollar-sign',
  'savings': 'piggy-bank',
  'work': 'briefcase',
  'star': 'star',
};
```

---

## 13. Firebase Config for Web

### .env.local
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

These values already exist in the mobile app's `firebase_options.dart` (web platform config).

---

## 14. Shared Data Compatibility Notes

Since web and mobile share the same Firestore:
- **Timestamps**: Firebase JS SDK uses same `Timestamp` class
- **Document IDs**: Same format, same collections
- **iconCode/colorValue**: Web needs lookup table (Material codePoints -> Lucide icons)
- **Indian formatting**: `formatIndianNumber()` must match mobile exactly
- **Recurring IDs**: Same format `recurring_{docId}_{ms}` to prevent duplicates

---

## 15. Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. Init Next.js + TypeScript + Tailwind + shadcn/ui
2. Firebase main app setup with env config
3. AuthProvider (email/password + Google popup)
4. Login page with form validation
5. Auth guard (redirect unauthenticated)
6. Theme (light/dark) with next-themes
7. Google Fonts (Plus Jakarta Sans + Inter)
8. TypeScript types for all models
9. Tailwind color tokens matching AppColors

### Phase 2: Dual Firebase + Onboarding (Week 2-3)
10. UserFirebaseManager (singleton, secondary app)
11. Firebase config caching (localStorage)
12. Welcome page (stepper)
13. Firebase setup page (file upload + manual + test connection)
14. Project ownership check
15. Auth flow routing

### Phase 3: Core Data Layer (Week 3-4)
16. FirestoreService (all CRUD)
17. Hooks: useTransactions, useCategories, useBudgets, useRecurring
18. Default category seeding
19. Firestore offline persistence
20. Indian number formatting
21. Date formatting (date-fns)

### Phase 4: Dashboard & Navigation (Week 4-5)
22. Sidebar navigation
23. Dashboard: balance card, greeting header
24. Pie chart (Recharts)
25. Bar chart (Recharts)
26. Top categories list
27. Recent transactions widget
28. Web Worker for computation
29. Responsive header

### Phase 5: Transactions (Week 5-6)
30. Transaction list (table + card view)
31. Search with debounce
32. Filter chips (All/Income/Expense)
33. Date range picker
34. Month grouping
35. Add Expense side sheet
36. Add Income side sheet
37. Edit transaction
38. Delete with confirmation
39. Transaction detail

### Phase 6: Budget (Week 6-7)
40. Budget page with month nav
41. Progress bars
42. Add/Edit dialog
43. Budget vs Expense comparison
44. Status badges

### Phase 7: Categories & Recurring (Week 7-8)
45. Categories page (tabs)
46. Default categories (read-only)
47. Add custom category (icon + color picker)
48. Edit/delete
49. Recurring page (table)
50. Add/Edit recurring dialog
51. Process pending on login
52. Toggle active/inactive

### Phase 8: Reports & Export (Week 8-9)
53. Reports page + month picker
54. Pie charts
55. Insight cards
56. Web Worker computation
57. Excel export (SheetJS)
58. CSV export

### Phase 9: Splitwise & Settings (Week 9-10)
59. Splitwise connection
60. Expense list + import
61. Friend balances
62. Disconnect flow
63. Settings: profile, theme
64. Firebase config management
65. Account deletion
66. Logout

### Phase 10: Polish & Deploy (Week 10-11)
67. Responsive breakpoints (1920, 1366, 768, 375px)
68. Loading skeletons
69. Empty states
70. Error boundaries
71. Toast notifications
72. Keyboard shortcuts (Cmd+N = new transaction)
73. SEO meta tags
74. Deploy to Vercel
75. PWA manifest (optional)

---

## 16. Feature Priority

### Must Have (P0)
- Auth (email + Google)
- Dual Firebase connection + setup
- Dashboard with charts
- Transaction CRUD
- Transaction list (search, filter, date range)
- Budget management
- Category management
- Light/Dark theme

### Should Have (P1)
- Recurring transactions
- Budget vs Expense comparison
- Reports with charts
- Excel/CSV export
- Splitwise integration
- Profile management

### Nice to Have (P2)
- Full responsive (tablet + mobile web)
- Keyboard shortcuts
- PWA offline support
- Browser notifications

### Skip
- Biometric app lock
- In-App Messaging (FIAM is mobile-only)

---

## 17. Verification Checklist

| # | Test | Expected |
|---|------|----------|
| 1 | Login with same email as mobile | Same UID, same profile |
| 2 | Connect same Firebase project | See same transactions |
| 3 | Add transaction on web | Appears on mobile instantly |
| 4 | Add transaction on mobile | Appears on web instantly |
| 5 | Set budget on web | Visible on mobile for same month |
| 6 | Custom category from mobile | Shows on web with correct icon/color |
| 7 | Recurring rules from mobile | Web processes pending correctly |
| 8 | Reports same month | Numbers match between platforms |
| 9 | Splitwise same API key | Works on both, imports tracked |
| 10 | Theme toggle | Matches mobile design system |
| 11 | Responsive 1920px | Full sidebar, multi-column |
| 12 | Responsive 768px | Collapsed nav, single column |
| 13 | Responsive 375px | Mobile-optimized layout |
