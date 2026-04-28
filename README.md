# Secure File Storage System

A secure file storage application built with Node.js, Express, and MySQL. Features include user authentication, file encryption (AES-256-CBC), and activity logging.

---

## 📁 Project Structure

```
StorageSecurityApp/
├── database.sql                    # MySQL database schema
├── package.json                     # Dependencies and scripts
├── .env                             # Environment variables
├── SECURITY_EXPLAINED.md            # Security concepts explanation
│
└── src/
    ├── app.js                       # Main Express application entry point
    │
    ├── config/
    │   ├── app.js                   # App configuration (port, JWT, upload settings)
    │   └── database.js              # MySQL connection pool using mysql2/promise
    │
    ├── controllers/
    │   ├── authController.js        # Handle register, login, getProfile
    │   └── fileController.js         # Handle upload, download, delete, getAll
    │
    ├── routes/
    │   ├── auth.js                  # /api/auth routes (register, login, profile)
    │   └── files.js                 # /api/files routes (CRUD operations)
    │
    ├── middleware/
    │   ├── auth.js                  # JWT authentication & admin authorization
    │   └── upload.js                 # Multer configuration for file uploads
    │
    ├── services/
    │   ├── AuthService.js           # User registration, login, JWT verification
    │   ├── EncryptionService.js      # AES-256-CBC encryption/decryption
    │   └── FileService.js            # File upload, download, delete logic
    │
    └── models/
        ├── UserModel.js             # User database operations
        ├── FileModel.js              # File metadata database operations
        └── LogModel.js               # Activity logging database operations
```

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `bcrypt` | ^5.1.1 | Password hashing |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `dotenv` | ^16.3.1 | Environment variable management |
| `express` | ^4.22.1 | Web framework |
| `jsonwebtoken` | ^9.0.2 | JWT token generation/verification |
| `multer` | ^1.4.5-lts.1 | File upload handling |
| `mysql2` | ^3.6.5 | MySQL database driver |

---

## 🗃️ Database Schema (3 Tables)

### 1. `users` - User accounts
- `id` (PK, AUTO_INCREMENT)
- `username` (UNIQUE, NOT NULL)
- `email` (UNIQUE, NOT NULL)
- `password_hash` (NOT NULL) — stored as bcrypt hash
- `role` (ENUM: 'admin', 'user') — default: 'user'
- `created_at`, `updated_at` (TIMESTAMP)
- Indexes: `idx_username`, `idx_email`, `idx_role`

### 2. `files` - Encrypted file metadata
- `id` (PK, AUTO_INCREMENT)
- `user_id` (FK → users.id, ON DELETE CASCADE)
- `filename` (NOT NULL) — unique system filename
- `original_name` (NOT NULL) — original filename
- `file_path` (NOT NULL) — storage path
- `file_size` (BIGINT)
- `mime_type`
- `encryption_iv` (NOT NULL) — AES-256-CBC initialization vector
- `encryption_key_hash` — hash of encryption key
- `created_at`, `updated_at`
- Indexes: `idx_user_id`, `idx_created_at`

### 3. `logs` - Activity audit trail
- `id` (PK, AUTO_INCREMENT)
- `user_id` (FK → users.id, ON DELETE SET NULL)
- `action` (VARCHAR: login_success, file_upload, etc.)
- `target_type` (VARCHAR: 'file', 'user', 'system')
- `target_id`
- `ip_address`
- `user_agent`
- `details` (TEXT, JSON string)
- `created_at`
- Indexes: `idx_user_id`, `idx_action`, `idx_created_at`

---

## 🔐 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login, receive JWT |
| GET | `/profile` | ✅ | Get current user info |

### Files (`/api/files`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Upload encrypted file |
| GET | `/` | ✅ | List user's files |
| GET | `/:id/download` | ✅ | Download & decrypt file |
| DELETE | `/:id` | ✅ | Delete file |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Edit .env file with your database credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=secure_file_storage
JWT_SECRET=your-secret-key
PORT=3000
```

### 3. Create Database
```bash
# In phpMyAdmin:
# 1. Create database "secure_file_storage" (collation: utf8mb4_unicode_ci)
# 2. Import database.sql
```

### 4. Start Server
```bash
npm start
```

---

## 🔑 Key Security Features

### Why `password_hash`?
- **One-way function** — cannot reverse to get original password
- **Salt included** — prevents rainbow table attacks
- **If DB is stolen** — attackers cannot see users' real passwords

### Why `iv` in files table?
- **AES-256-CBC** requires random IV for each encryption
- **Prevents pattern analysis** — same content produces different ciphertext
- **Security standard** — follows FIPS-140 guidelines

---

## 📝 Avoid Duplication

When adding new features, check existing files:

| Feature | File to Modify |
|---------|----------------|
| Add new API route | `src/routes/auth.js` or `src/routes/files.js` |
| Add new controller logic | `src/controllers/` |
| Add new service logic | `src/services/` |
| Add new model query | `src/models/` |
| Change database schema | `database.sql` |
| Add new environment variable | `.env` + `src/config/app.js` |

---

## 📄 License

ISC - Author: NDT

---

## 📝 Functions & Objects Summary

### Services (src/services/)

#### AuthService.js
| Function | Description |
|----------|-------------|
| `register(userData)` | Register new user with username, email, password |
| `login(username, password, req)` | Login, generate JWT token |
| `verifyToken(token)` | Verify JWT token |

#### FileService.js
| Function | Description |
|----------|-------------|
| `uploadFile(file, userId, req)` | Upload and encrypt file |
| `downloadFile(fileId, userId, req)` | Download and decrypt file |

#### EncryptionService.js
| Function | Description |
|----------|-------------|
| `generateKey()` | Generate random 32-byte key (AES-256) |
| `generateIV()` | Generate random 16-byte IV |
| `encrypt(data, key, iv)` | Encrypt data with AES-256-CBC |
| `decrypt(encryptedData, key, iv)` | Decrypt data |
| `encryptFile(buffer, key)` | Encrypt file buffer |
| `decryptFile(encryptedBuffer, key, ivHex)` | Decrypt file buffer |
| `hashKey(key)` | Hash key for storage |

### Models (src/models/)

#### UserModel.js
- `create(userData)`, `findByUsername(username)`, `findByEmail(email)`
- `findById(id)`, `getAll()`, `update(id, userData)`, `delete(id)`

#### FileModel.js
- `create(fileData)`, `findById(id)`, `getByUserId(userId)`
- `getAll()`, `delete(id, userId)`, `getUserFileCount(userId)`

#### LogModel.js
- `create(logData)`, `getByUserId(userId, limit)`, `getAll(limit)`
- `getByAction(action, limit)`, `log(action, targetType, targetId, userId, details, req)`

### Controllers (src/controllers/)

#### authController.js
- `register(req, res)`, `login(req, res)`, `getProfile(req, res)`

#### fileController.js
- `upload(req, res)`, `download(req, res)`, `delete(req, res)`, `getAll(req, res)`

### Middleware (src/middleware/)

#### auth.js
- `authenticate(req, res, next)` - Verify JWT token
- `requireAdmin(req, res, next)` - Check admin role

#### upload.js
- `upload` - Multer instance with memory storage
- `fileFilter` - Filter allowed file types

### Config (src/config/)

#### database.js
- `testConnection()` - Test MySQL connection
- `executeQuery(sql, params)` - Execute safe SQL
- `closePool()` - Close connection pool

#### app.js
- `port`, `jwtSecret`, `jwtExpire`, `uploadDir`, `maxFileSize`, `encryptionAlgorithm`

### Routes (src/routes/)

| File | Endpoints |
|------|-----------|
| `auth.js` | POST `/api/auth/register`, POST `/api/auth/login`, GET `/api/auth/profile` |
| `files.js` | POST `/api/files/`, GET `/api/files/`, GET `/api/files/:id/download`, DELETE `/api/files/:id` |

### Main App (src/app.js)
- `startServer()` - Start server, test DB connection