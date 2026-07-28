import { pgTable, serial, text, varchar, integer, decimal, timestamp, date } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  storeName: varchar("store_name", { length: 255 }).notNull(),
  storeDate: date("store_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const receiptItems = pgTable("receipt_items", {
  id: serial("id").primaryKey(),
  receiptId: integer("receipt_id").references(() => receipts.id).notNull(),
  productName: varchar("product_name", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  category: varchar("category", { length: 255 }),
});

export const referencePrices = pgTable("reference_prices", {
  id: serial("id").primaryKey(),
  productName: varchar("product_name", { length: 500 }).notNull(),
  storeName: varchar("store_name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 100 }),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});
