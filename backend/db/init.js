const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'nimos.db');

let _db = null;

function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    console.log('[DB] Singleton connection opened');
  }
  return _db;
}

function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
    console.log('[DB] Connection closed');
  }
}

function initialize() {
  const db = getDb();
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  const count = db.prepare('SELECT COUNT(*) as c FROM menu_categories').get().c;
  if (count > 0) { return; }

  // Categories
  const insertCat = db.prepare('INSERT INTO menu_categories (name, icon, sort_order) VALUES (?, ?, ?)');
  const cats = [
    ['Pizzas','🍕',1],['Kebabs','🥙',2],['Wraps','🌯',3],['Burgers','🍔',4],
    ['Chicken','🍗',5],['Fish','🐟',6],['Fresh Chips','🍟',7],['Side Orders','📦',8],
    ['Kids Meals','👶',9],['Soft Drinks','🥤',10],['Sauces','🫙',11]
  ];
  const catIds = {};
  for (const [name, icon, order] of cats) {
    const r = insertCat.run(name, icon, order);
    catIds[name] = Number(r.lastInsertRowid);
  }

  // Menu items with upsell references
  const insertItem = db.prepare('INSERT INTO menu_items (category_id, name, description, price, popular, upsell_ids) VALUES (?, ?, ?, ?, ?, ?)');
  const items = [
    [catIds['Pizzas'], 'Margherita Pizza', 'Tomato Sauce, Mozzarella Cheese', 8.00, 0],
    [catIds['Pizzas'], 'Pepperoni Pizza', 'Tomato Sauce, Mozzarella Cheese & Pepperoni', 9.00, 1],
    [catIds['Pizzas'], 'Prosciutto Pizza', 'Tomato Sauce, Mozzarella Cheese & Ham', 9.00, 0],
    [catIds['Pizzas'], 'Fungi Pizza', 'Tomato Sauce, Mozzarella Cheese & Mushroom', 9.00, 0],
    [catIds['Pizzas'], 'Veggie Garden Pizza', 'Tomato Sauce, Mozzarella Cheese, Peppers, Onion, Sweetcorn, Pineapple & Mushroom', 9.00, 0],
    [catIds['Pizzas'], 'Boscaiola Pizza', 'Tomato Sauce, Mozzarella Cheese, Chicken, Mushroom & Onion', 9.00, 0],
    [catIds['Pizzas'], 'Hawaiian Pizza', 'Tomato Sauce, Mozzarella Cheese, Ham & Pineapple', 9.00, 0],
    [catIds['Pizzas'], 'Meat Feast Pizza', 'Tomato Sauce, Mozzarella Cheese, Ham, Pepperoni, Chicken & Donner', 9.00, 1],
    [catIds['Pizzas'], 'Spicy Treat Pizza', 'Tomato Sauce, Mozzarella Cheese, Chicken, Jalapeno, Onion & Mushroom', 9.00, 0],
    [catIds['Pizzas'], 'Quattro Stagioni Pizza', 'Tomato Sauce, Mozzarella Cheese, Ham, Pepperoni, Mushroom & Peppers', 9.00, 0],
    [catIds['Pizzas'], 'Special Pizza', 'Tomato Sauce, Mozzarella Cheese & Bit of Everything', 10.00, 0],
    [catIds['Kebabs'], 'Veggie Kebab', '', 9.00, 0],
    [catIds['Kebabs'], 'Donner Kebab', '', 9.50, 1],
    [catIds['Kebabs'], 'Tikka Kebab', '', 9.50, 0],
    [catIds['Kebabs'], 'Chicken Goujon Kebab', '', 9.50, 0],
    [catIds['Kebabs'], 'Mix Kebab (Goujon & Donner)', '', 11.50, 0],
    [catIds['Wraps'], 'Donner Wrap', '', 7.00, 0],
    [catIds['Wraps'], 'Tikka Wrap', '', 7.00, 0],
    [catIds['Wraps'], 'Veggie Wrap', '', 7.00, 0],
    [catIds['Wraps'], 'Mix Wrap (Goujon & Donner)', '', 8.00, 0],
    [catIds['Burgers'], 'Regular Burger', 'Cheese + Onion + Pink Sauce', 5.00, 0],
    [catIds['Burgers'], 'Doner Burger', '', 5.50, 0],
    [catIds['Burgers'], 'Veggie Burger', 'Lettuce + Onion + Pink Sauce', 5.50, 0],
    [catIds['Burgers'], 'Chicken Burger', 'Lettuce + Mayo', 6.50, 1],
    [catIds['Burgers'], 'Quarter Pounder Burger', '', 6.50, 1],
    [catIds['Burgers'], 'Half Pounder Burger', '', 8.00, 1],
    [catIds['Burgers'], 'Farm House Quarter Pounder', '', 8.00, 0],
    [catIds['Chicken'], 'Mini Box', '1 Piece Chicken + Chips', 6.00, 0],
    [catIds['Chicken'], 'Snack Box', '2 Piece Chicken + Chips', 8.50, 0],
    [catIds['Chicken'], 'Dinner Box', '3 Piece Chicken + Chips', 9.50, 1],
    [catIds['Chicken'], 'Breast Box', 'Breast of Chicken + Chips', 8.50, 0],
    [catIds['Chicken'], 'Breast of Chicken', '', 5.00, 0],
    [catIds['Chicken'], 'Spicy Wings', '4 Pieces Wings', 5.50, 0],
    [catIds['Fish'], 'Fish & Chips', '', 10.50, 0],
    [catIds['Fish'], 'Fillet Cod', '', 8.50, 0],
    [catIds['Fish'], 'Square Cod', '', 5.50, 0],
    [catIds['Fresh Chips'], 'Chips', '', 5.00, 0],
    [catIds['Fresh Chips'], 'Curry Chips', '', 6.50, 0],
    [catIds['Fresh Chips'], 'Garlic Chips', '', 6.50, 0],
    [catIds['Fresh Chips'], 'Curry Cheese Chips', '', 7.50, 1],
    [catIds['Fresh Chips'], 'Garlic Cheese Chips', '', 7.50, 1],
    [catIds['Fresh Chips'], 'Taco Chips', '', 8.00, 0],
    [catIds['Fresh Chips'], 'Donner Meat & Chips', '', 8.50, 1],
    [catIds['Fresh Chips'], 'Curry Garlic Chips', '', 7.50, 0],
    [catIds['Fresh Chips'], 'Curry Garlic Cheese Chips', '', 8.50, 0],
    [catIds['Side Orders'], 'Nuggets (5 Pieces)', '', 4.50, 0],
    [catIds['Side Orders'], 'Goujon (5 Pieces)', '', 5.50, 0],
    [catIds['Side Orders'], 'Sausage', '', 2.50, 0],
    [catIds['Side Orders'], 'Battered Sausage', '', 3.00, 0],
    [catIds['Side Orders'], 'Mozzarella Sticks (5 Pieces)', '', 5.00, 0],
    [catIds['Kids Meals'], 'Nuggets Meal', '4 Pieces Nuggets, Chips & Caprisun', 7.50, 0],
    [catIds['Kids Meals'], 'Burger Meal', 'Burger, Chips & Caprisun', 7.50, 0],
    [catIds['Kids Meals'], 'Sausage Meal', '2 Sausages, Chips & Caprisun', 7.50, 0],
    [catIds['Soft Drinks'], 'Cans', '', 2.00, 0],
    [catIds['Soft Drinks'], '500ml Bottle', '', 2.70, 0],
    [catIds['Soft Drinks'], 'Large Bottle', '', 4.50, 0],
    [catIds['Sauces'], 'Sauce', '', 2.50, 0],
  ];

  // IDs will be 1-57
  const drinkIds = [54, 55, 56]; // Cans, 500ml, Large
  const sideIds = [46, 47, 50]; // Nuggets, Goujon, Mozz sticks
  const chipIds = [37, 40, 41]; // Chips, Curry Cheese, Garlic Cheese
  const sauceIds = [57]; // Sauce

  const insertMany = db.transaction(() => {
    for (const [catId, name, desc, price, pop] of items) {
      // Assign upsells based on category
      let upsells = [];
      if (catId === catIds['Pizzas']) upsells = [...drinkIds, ...sideIds];
      else if (catId === catIds['Burgers']) upsells = [...chipIds, ...drinkIds];
      else if (catId === catIds['Kebabs'] || catId === catIds['Wraps']) upsells = [...chipIds, ...drinkIds];
      else if (catId === catIds['Chicken'] || catId === catIds['Fish']) upsells = [...drinkIds, ...sauceIds];
      else if (catId === catIds['Fresh Chips']) upsells = [...drinkIds, ...sauceIds];
      else upsells = drinkIds;
      insertItem.run(catId, name, desc, price, pop, JSON.stringify(upsells.slice(0, 4)));
    }
  });
  insertMany();

  // Option groups for burgers
  const insertGroup = db.prepare('INSERT INTO option_groups (menu_item_id, name, type, required, min_select, max_select, sort_order) VALUES (?,?,?,?,?,?,?)');
  const insertChoice = db.prepare('INSERT INTO option_choices (group_id, name, price, default_selected, sort_order) VALUES (?,?,?,?,?)');

  // Burger customisation (items 21-27)
  for (let id = 21; id <= 27; id++) {
    const g1 = insertGroup.run(id, 'Extra Toppings', 'multi', 0, 0, 5, 1).lastInsertRowid;
    insertChoice.run(g1, 'Extra Cheese', 0.50, 0, 1);
    insertChoice.run(g1, 'Bacon', 1.00, 0, 2);
    insertChoice.run(g1, 'Jalapeños', 0.50, 0, 3);
    insertChoice.run(g1, 'Onion Rings', 1.00, 0, 4);
    insertChoice.run(g1, 'Egg', 0.80, 0, 5);

    const g2 = insertGroup.run(id, 'Choose Sauce', 'single', 0, 0, 1, 2).lastInsertRowid;
    insertChoice.run(g2, 'Ketchup', 0, 0, 1);
    insertChoice.run(g2, 'Mayo', 0, 0, 2);
    insertChoice.run(g2, 'Pink Sauce', 0, 1, 3);
    insertChoice.run(g2, 'BBQ Sauce', 0, 0, 4);
    insertChoice.run(g2, 'Garlic Mayo', 0, 0, 5);
    insertChoice.run(g2, 'Hot Sauce', 0, 0, 6);
  }

  // Pizza customisation (items 1-11)
  for (let id = 1; id <= 11; id++) {
    const g = insertGroup.run(id, 'Extra Toppings', 'multi', 0, 0, 5, 1).lastInsertRowid;
    insertChoice.run(g, 'Extra Cheese', 1.00, 0, 1);
    insertChoice.run(g, 'Pepperoni', 1.00, 0, 2);
    insertChoice.run(g, 'Ham', 1.00, 0, 3);
    insertChoice.run(g, 'Chicken', 1.50, 0, 4);
    insertChoice.run(g, 'Mushrooms', 0.80, 0, 5);
    insertChoice.run(g, 'Peppers', 0.80, 0, 6);
    insertChoice.run(g, 'Onions', 0.80, 0, 7);
    insertChoice.run(g, 'Jalapeños', 0.80, 0, 8);
    insertChoice.run(g, 'Pineapple', 0.80, 0, 9);
  }

  // Kebab/wrap sauce choices (items 12-20)
  for (let id = 12; id <= 20; id++) {
    const g = insertGroup.run(id, 'Choose Sauce', 'single', 0, 0, 1, 1).lastInsertRowid;
    insertChoice.run(g, 'Garlic Sauce', 0, 1, 1);
    insertChoice.run(g, 'Chilli Sauce', 0, 0, 2);
    insertChoice.run(g, 'Yogurt Sauce', 0, 0, 3);
    insertChoice.run(g, 'BBQ Sauce', 0, 0, 4);
    const g2 = insertGroup.run(id, 'Add Extras', 'multi', 0, 0, 3, 2).lastInsertRowid;
    insertChoice.run(g2, 'Extra Meat', 2.00, 0, 1);
    insertChoice.run(g2, 'Cheese', 0.50, 0, 2);
    insertChoice.run(g2, 'Jalapeños', 0.50, 0, 3);
  }

  // Chips customisation (items 37-45)
  for (let id = 37; id <= 45; id++) {
    const g = insertGroup.run(id, 'Add Extra', 'multi', 0, 0, 3, 1).lastInsertRowid;
    insertChoice.run(g, 'Extra Cheese', 1.00, 0, 1);
    insertChoice.run(g, 'Extra Sauce', 0.50, 0, 2);
    insertChoice.run(g, 'Coleslaw', 1.00, 0, 3);
  }

  // Drink choices
  for (let id = 54; id <= 56; id++) {
    const g = insertGroup.run(id, 'Choose Drink', 'single', 1, 1, 1, 1).lastInsertRowid;
    insertChoice.run(g, 'Coca-Cola', 0, 1, 1);
    insertChoice.run(g, 'Diet Coke', 0, 0, 2);
    insertChoice.run(g, 'Fanta Orange', 0, 0, 3);
    insertChoice.run(g, '7Up', 0, 0, 4);
    insertChoice.run(g, 'Club Lemon', 0, 0, 5);
    insertChoice.run(g, 'Water', 0, 0, 6);
  }

  // Seed users
  const insertUser = db.prepare('INSERT INTO users (name, email, phone, password_hash, role, loyalty_points) VALUES (?, ?, ?, ?, ?, ?)');
  insertUser.run('Admin', 'admin@nimos.ie', '+353 6243300', bcrypt.hashSync('admin123', 10), 'admin', 0);
  insertUser.run('Test Customer', 'customer@test.ie', '+353 8512345678', bcrypt.hashSync('customer123', 10), 'customer', 25);
  insertUser.run('Kitchen', 'kitchen@nimos.ie', '', bcrypt.hashSync('kitchen123', 10), 'kitchen', 0);

  // Seed addresses for test customer
  db.prepare('INSERT INTO addresses (user_id, label, address, is_default) VALUES (?,?,?,?)').run(2, 'Home', '15 Main Street, Knocklong, Co. Limerick', 1);
  db.prepare('INSERT INTO addresses (user_id, label, address, is_default) VALUES (?,?,?,?)').run(2, 'Work', 'Limerick Business Park, Limerick City', 0);

  // Seed promo codes
  const insertPromo = db.prepare('INSERT INTO promo_codes (code, type, value, min_order, max_uses, expires_at, active) VALUES (?,?,?,?,?,?,?)');
  insertPromo.run('WELCOME10', 'percentage', 10, 15, 100, '2026-12-31', 1);
  insertPromo.run('FIVER', 'fixed', 5, 20, 50, '2026-06-30', 1);
  insertPromo.run('NIMOS20', 'percentage', 20, 25, 30, '2026-03-31', 1);

  // Seed settings
  const s = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  s.run('business_name', "Nimo's Limerick");
  s.run('address', 'The Cross, Knocklong East, Co. Limerick, V94TY05');
  s.run('phone', '+353 6243300');
  s.run('delivery_hours', JSON.stringify({ thu:'15:00-22:30', fri:'15:00-22:30', sat:'15:00-22:30', sun:'15:00-22:00' }));
  s.run('pickup_hours', JSON.stringify({ mon:'15:00-22:30', tue:'15:00-22:30', wed:'15:00-22:30', thu:'15:00-22:30', fri:'15:00-22:30', sat:'15:00-22:30', sun:'15:00-22:30' }));
  s.run('delivery_time_min', '60');
  s.run('pickup_time_min', '15');
  s.run('delivery_radius_km', '10');
  s.run('delivery_min_order', '15');
  s.run('restaurant_open', '1');
  s.run('busy_mode', '0');
  s.run('busy_extra_minutes', '15');
  s.run('pause_orders', '0');
  s.run('loyalty_rate', '1');
  s.run('loyalty_redeem_threshold', '50');
  s.run('loyalty_redeem_value', '5');
  s.run('stripe_public_key', '');
  s.run('stripe_secret_key', '');
  s.run('platform_justeat', JSON.stringify({ connected: false, api_key: '', restaurant_id: '', secret: '' }));
  s.run('platform_deliveroo', JSON.stringify({ connected: false, client_id: '', client_secret: '', restaurant_id: '' }));
  s.run('platform_orderyoyo', JSON.stringify({ connected: false, api_key: '', restaurant_id: '' }));

  console.log('Database initialized and seeded.');
}

module.exports = { getDb, closeDb, initialize, DB_PATH };
