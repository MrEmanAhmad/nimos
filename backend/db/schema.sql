CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','admin','kitchen')),
  loyalty_points INTEGER DEFAULT 0,
  notify_sms INTEGER DEFAULT 1,
  notify_email INTEGER DEFAULT 1,
  notify_push INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price REAL NOT NULL,
  popular INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  image_url TEXT DEFAULT '',
  avg_rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  upsell_ids TEXT DEFAULT '[]',
  FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

CREATE TABLE IF NOT EXISTS option_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_item_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'single' CHECK(type IN ('single','multi')),
  required INTEGER DEFAULT 0,
  min_select INTEGER DEFAULT 0,
  max_select INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS option_choices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price REAL DEFAULT 0,
  default_selected INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (group_id) REFERENCES option_groups(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled')),
  type TEXT NOT NULL DEFAULT 'pickup' CHECK(type IN ('delivery','pickup')),
  total REAL NOT NULL DEFAULT 0,
  subtotal REAL NOT NULL DEFAULT 0,
  discount REAL DEFAULT 0,
  delivery_address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  promo_code TEXT DEFAULT '',
  payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash','stripe','apple_pay','google_pay')),
  payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending','paid','failed','refunded')),
  stripe_payment_id TEXT DEFAULT '',
  scheduled_for DATETIME,
  confirmed_at DATETIME,
  preparing_at DATETIME,
  ready_at DATETIME,
  delivered_at DATETIME,
  cancelled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  estimated_ready DATETIME,
  loyalty_earned INTEGER DEFAULT 0,
  loyalty_redeemed INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL,
  options_json TEXT DEFAULT '[]',
  notes TEXT DEFAULT '',
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS platform_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  platform TEXT NOT NULL CHECK(platform IN ('justeat','deliveroo','orderyoyo')),
  external_id TEXT,
  raw_data TEXT DEFAULT '{}',
  synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('percentage','fixed')),
  value REAL NOT NULL,
  min_order REAL DEFAULT 0,
  max_uses INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  expires_at DATETIME,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favourites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, menu_item_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  label TEXT DEFAULT 'Home',
  address TEXT NOT NULL,
  is_default INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(order_id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS loyalty_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_id INTEGER,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('earn','redeem')),
  description TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  order_id INTEGER,
  channel TEXT NOT NULL CHECK(channel IN ('sms','email','push','internal')),
  subject TEXT DEFAULT '',
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','sent','failed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK(status IN ('unread','read','replied')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
