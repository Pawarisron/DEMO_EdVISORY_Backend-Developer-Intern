-- Enable uuid-ossp extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================
-- Users table: store user login info
-- ==========================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
-- ==========================
-- Accounts table: stores user accounts (e.g., Cash, Bank)
-- ==========================
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ==========================
-- Categories table: stores transaction categories
-- ==========================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  type VARCHAR CHECK (type IN ('INCOME', 'EXPENSE')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ==========================
-- Transactions table: records all income/expenses
-- ==========================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  transaction_date DATE NOT NULL,
  note_cleaned TEXT,
  slip_path TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
