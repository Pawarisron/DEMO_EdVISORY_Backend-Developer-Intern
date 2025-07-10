# Demo EdVISORY Backend Developer Intern

Backend project สำหรับการฝึกงานตำแหน่ง Backend Intern โดยใช้ Fastify + TypeScript + PostgreSQL + TypeORM และรองรับการอัปโหลดไฟล์,Custom Authentication, Swagger API Docs, Excel export, และ multi-language (i18n)

- ระบบ login
- ระบบเพิ่ม ลบ บัญชีใช้จ่าย
- ระบบเพิ่ม ลบ ประเภทของการใช้จ่าย
- ระบบสรุปยอดใช้จ่าย
- ระบบ filter เดือน, ปี, ประเภท, บัญชี
- ระบบแนบ transaction slip หรือหลักฐานการใข้จ่าย (เป็นไฟล์ภาพ)
- ระบบ note ว่า transaction นั้นทําอะไร
  - ระบบจัดการคําหยาบโดยให้แปลงคําหยาบเป็น *** แทน
- หาก api คืนค่าเป็นเป็น pagination
- เลือกได้ว่าจะให้คืนข้อมูล 10, 20, 50, 100 ข้อมูลต่อหน้า
- ระบบ export ของหน้าสรุปผลออกมาเป็น excel(.xlsx)
- ระบบ import ข้อมูล transaction จาก excel(.xlsx) มีตัวอย่างไฟล์สำหรับ `import_data_example.xlsx`
- ระบบ เฉลี่ยนเงินที่สามารถใช้จ่ายจนถึงสิ้นเดือน
  - จากเงินที่เหลืออยู่ (actual)
  - จากค่าใช้จ่ายที่ประมาณ (expect)
- ระบบรองรับหลายภาษา ผ่าน header `accept-language` มี `th,en`
- ระบบ จดจำ sessions ที่ทำการ login และสามารถออกจากระบบ ทุก sessions ได้
- ระบบ authentication ที่จัดทำขึ้นมาเองผ่าน `middlewares/auth.ts`
- config ผ่าน enviroment (.env)
- ใช้ Joi เพื่อ Validation

## Tech Stack

* **Framework**: Fastify
* **Language**: TypeScript
* **Database**: PostgreSQL
* **Redis**: ioredis
* **ORM**: TypeORM
* **Validation**: Joi
* **Config**: dotenv
* **Excel Support**: ExcelJS
* **Swagger**: @fastify/swagger + @fastify/swagger-ui
* **Multi-language**: fastify-i18n
* **Bad-word**: leo-profanity

## Installation

```bash
# Clone project
git clone https://github.com/Pawarisron/DEMO_EdVISORY_Backend-Developer-Intern.git
cd demo_edvisory_backend-developer-intern

# Install dependencies
npm install

# Database Setup
# Redis Setup

# Start development server
npm run dev
```

## Project Structure

```bash
src/
├── controllers/       # API Controllers
├── database/          # Config database postgreSQL, redis
├── entities/          # TypeORM Entity definitions
├── locales/           # Localization files
├── middlewares/       # Custom middleware / auth
├── routes/            # Route definitions
├── schemas/           # Validation schemas
├── types/             # Declaration Merging
└── server.ts          # Entry point
```

## API Documentation (Swagger)

```
http://localhost:9090/docs
```

## Database SQL Schema

 `db_schema_public.sql`

```sql
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

```

## Database Setup

This project uses **PostgreSQL** as the database.

I’ve provided a `database.sql` includes:

- The full database schema (DDL)
- Sample/mock data for testing

## X-Paw Authentication

โปรเจกต์นี้ใช้ระบบตรวจสอบสิทธิ์ แบบทำขึ้นมาเองโดยใช้ **middleware** **สำหรับตรวจสอบสิทธิ์** (Auth Middleware) และการ login ด้วย **Basic Auth** และการตรวจสอบ token ด้วย **ลายเซ็น HMAC** เพื่อป้องกันการเข้าถึง API โดยไม่ได้รับอนุญาต และ รองรับ หนึ่ง user หลาย session

### How It Works

* ทุกคำขอ (request) ที่เข้ามาจะถูกตรวจสอบผ่าน middleware
* หาก URL อยู่ใน Whitelist `/login` `/docs` ระบบจะอนุญาตให้ผ่านโดยไม่ตรวจสอบ
* สำหรับเส้นทางอื่นๆ ระบบจะต้องได้รับ header

```yaml
#header
x-paw-key: {access_token}

#access_token ที่ส่งมาใน header จะต้องอยู่ในรูปแบบ
{user_id}.{session_id}.{signature}

#ตัวอย่าง access_token
70cf813c-50ff-4230-b9b8-be7ec22876da.44714278-586a-4173-925c-0c21c6ce73d2.8fad8a5c42e9edb0b4b78cba5ceb8716b632007c9a825c9123821b39cc9adfa0
```

#### access_token

สร้างโดยการใช้ `UUID` ที่สุ่มออกกับ `User id` เป็นข้อมูลที่จะถูกนำไปทำ `HMAC` โดยใช้ `secret key` ที่เก็บไว้ใน .env แล้วเก็บใน Redis cache เพื่อตั้งเวลาหมดอายุ

- `user_id`: รหัสผู้ใช้
- `session_id`: UUID หรือรหัส session แบบสุ่ม
- `signature`: ลายเซ็นที่เข้ารหัสแบบ HMAC-SHA256 โดยใช้ secret key เซ็น

#### Login

1. เข้า URL `/login` แล้วกรอก `username` และ `password` ผ่านรูปแบบ [Basic Auth](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/#basic-auth)

   ```yaml
   #ตัวอย่าง header ส่งผ่าน Basic Auth สำหรับ login 
   #โดยใข้การ endcode ด้วย base64( {username}:{password} )
   Authorization: Basic YWRtaW46MTIzNA==
   ```
2. ถ้า `username` และ `password` ถูกต้อง server จะทำการสร้าง `access_token` และเก็บเอาไว้ใน Redis cache ตั้งค่าเวลาหมดอายุ และทำการส่ง `access_token` มาให้ในรูปแบบ

   ```yaml
   {
     "access_token": {access_token},
     "token_type": "x-paw-key"
   }
   ```
3. นำ `access_token` ไปใส่ใน header `x-paw-key` เพื่อนำไปใช้ยิง api อื่นๆต่อจากนี้

#### Verification

1. หลังจากระบบได้รับ `access_token` ผ่าน header `x-paw-key` ดึง `session_id` หรือ `uuid` กับ `user_id` จาก `access_token`
2. ใช้ `session_id` , `user_id` ไปสร้าง HMAC โดยใช้ `secret key` ของเรา แล้วตรวจสอบว่าเหมือนกับที่รับมาหรือไม่
3. ตรวจสอบว่า session นี้มีอยู่ใน Redis หรือไม่ (ใช้ key `{user_id}:{access_token}`) ถ้าไม่มีแปลว่า session นี้หมดอายุ

#### Logout

1. เข้า URL `/logout` หรือ `/logout-all`
2. นำ `user_id` จาก `access_token` ไปใช้เป็น key ใน Redis
3. ลบ session ใน redis

## API Reference

### Authentication

```apache
POST   /login
#login with basic auth
```

```apache
POST	/logout
#logout require access_token
```

```apache
POST   /logout-all
#logout all session require access_token
```

### Accounts

```apache
GET	/accounts
# Get all accounts that belong to the specific user with pagination
# Query
#    page: The page number to retrieve
#    size: The number of items per page

```

```apache
POST	/accounts
# Create accounts that belong to the specific user
# Body
#    name: Name of the new account

```

```apache
DELETE	/accounts/{id}
# Delete an account that is associated with a specific user.
# Params
#    id: ID of the account
```

### Categories

```apache
GET	/categories
# Get all categories that belong to the specific user with pagination.
# Query
#    page: The page number to retrieve.
#    size: The number of items per page.

```

```apache
POST	/categories
# Create category that belong to the specific user
# Body
#    name: Name of the new category.
#    type: The type of transaction (INCOME, EXPENSE)

```

```apache
DELETE	/categories/{id}
# Delete an category that is associated with a specific user.
# Params
#    id: ID of the category
```

### Transactions

```apache
GET	/transactions
# Get all transactions that belong to a specific user, with optional filters and pagination.
# Query
#    page: The page number to retrieve.
#    size: The number of items per page. 
#    month: Filter by month (1–12)
#    year: Filter by year (e.g., 2025)
#    type: Type of transaction: 'INCOME' or 'EXPENSE'.
#    accountId: Filter transactions by account ID.
#    categoryId: Filter transactions by category ID.
```

```apache
GET	/transactions/{id}
# Retrieve a specific transaction by its ID. The transaction must belong to the authenticated user
# Parms
#    id: The ID of the transaction to retrieve.
```

```apache
POST	/transactions
# Create a new transaction that belongs to a specific user
# The transaction must be associated with an account and category owned by the user
# Body
#    accountId: UUID of the account this transaction belongs to
#    categoryId: UUID of the category this transaction is classified under
#    amount: The amount of the transaction. Must be a positive number
#    transactionDate: The date and time the transaction occurred. Must be in ISO format
#    note: Optional note for the transaction.
```

```apache
POST	/transactions/{id}/slip
# Upload a transaction slip (image) for a specific transaction. The transaction must belong to the authenticated user
# Parms
#     id: The UUID of the transaction to upload a slip for
# Body
#     file: The transaction slip image to upload
```

```apache
POST	/transactions/import-excel
# Import multiple transactions by uploading an Excel (.xlsx) file. (ADMIN ONLY)
# Body
#     file: Excel file (.xlsx) to import transactions from.
```

### Summary

```apache
GET	/summary
# Retrieve a summary of transactions belonging to the authenticated user
# Supports filtering by day, month, year, or date range. Results can be paginated or exported as an Excel file
# Query
#     mode: Filter mode. Allowed values: "day", "month", "year", "range"
#     date: Required only if mode is "day". The exact date to filter transactions
#     month: Required only if mode is "month". Integer between 1 and 12
#     year: Required if mode is "month" or "year". Minimum year is 2000
#     from: Required if mode is "range". Start date of the filter range
#     to: Required if mode is "range". Must be a date equal to or after from
#     accountId: Filter transactions by account ID.
#     format: Output format. Currently only "excel" is allowed for export.
```

```apache
GET	/summary/allowance
# Retrieve an allowance summary for the authenticated user. Supports two modes:
# "actual": calculates based on actual income and expenses
# "expect": calculates based on expected monthly expenses
# Also supports filtering by account, pagination, and exporting results as an Excel file
# Query
#     mode: Summary mode. Allowed values: "actual" or "expect"
#     today: The current date. Must be in ISO date format
#     payday: The next payday date. Must be in ISO date format and strictly greater than today
#     monthlyExpense: Required only if mode is "expect"
#     accountId: Filter transactions by account ID.
#     format: Optional output format. Only "excel" is valid for export.
```

## Author

ปวริศร วิทยา

6410401094 - Computer Science, Kasetsart University

Intern at Edvisory (Developer - Backend)
