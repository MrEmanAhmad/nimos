/**
 * Deals data for the Deals page.
 *
 * Each deal can have:
 *   - id: unique slug for the deal
 *   - name: display title
 *   - description: short tagline
 *   - items: array of included items
 *   - price: deal price
 *   - originalPrice: original combined price (optional)
 *   - savings: amount saved (optional, computed from above if missing)
 *   - badge: promotional badge text (optional)
 *   - promoCodes: array of valid promo codes for this deal (optional)
 *   - expiresAt: ISO 8601 date string when the deal expires (optional)
 *   - menuCategory: the menu category slug to link to (optional)
 */
export const deals = [
  {
    id: "pizza-combo",
    menuItemId: 58,
    name: "Pizza Combo",
    description: "Any Pizza + Garlic Cheese Chips + Can",
    items: ["Any Pizza", "Garlic Cheese Chips", "Can"],
    price: 15.00,
    originalPrice: 18.50,
    savings: 3.50,
    badge: "BEST SELLER",
    menuCategory: "pizzas",
  },
  {
    id: "burger-combo",
    menuItemId: 59,
    name: "Burger Combo",
    description: "Half Pounder + Chips + Can",
    items: ["Half Pounder Burger", "Chips", "Can"],
    price: 13.00,
    originalPrice: 15.00,
    savings: 2.00,
    menuCategory: "burgers",
  },
  {
    id: "family-feast",
    menuItemId: 60,
    name: "Family Feast",
    description: "2 Pizzas + Garlic Cheese Chips + Large Bottle",
    items: ["Any Pizza", "Any Pizza", "Garlic Cheese Chips", "Large Bottle"],
    price: 24.00,
    originalPrice: 28.50,
    savings: 4.50,
    menuCategory: "pizzas",
  },
  {
    id: "full-time-feast",
    menuItemId: 61,
    name: "Full Time Feast",
    description: "GAA Match Day special — Pizza + Garlic Cheese Chips + Chicken Box + 2 Cans",
    items: ["Any Pizza", "Garlic Cheese Chips", "Dinner Box (3pc Chicken + Chips)", "Can", "Can"],
    price: 20.00,
    originalPrice: 30.00,
    savings: 10.00,
    badge: "MATCH DAY",
    promoCodes: ["LIMERICK", "FULLTIME"],
    expiresAt: "2026-03-31T23:59:59",
    menuCategory: "chicken",
  },
];
