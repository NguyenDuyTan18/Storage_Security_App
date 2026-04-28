# Secure File Storage System - Giải thích Bảo mật

## 1. Tại sao cần `password_hash` thay vì lưu mật khẩu thô?

### ❌ KHÔNG NÊN: Lưu mật khẩu thô (plain text)
```javascript
// ❌ Nguy hiểm - không bao giờ làm vậy
user.password = "myPassword123"
```

### ✅ NÊN: Lưu password đã hash
```javascript
// ✅ An toàn - lưu hash thay vì mật khẩu thật
user.password_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqKx5P6mG"
```

### Lý do quan trọng:

| Lý do | Giải thích |
|-------|------------|
| **Bảo vệ khi bị đánh cắp** | Nếu database bị hack, attacker không biết được mật khẩu thật của user |
| **One-way function** | Hashing là hàm một chiều - không thể đảo ngược để lấy lại mật khẩu gốc |
| **Rainbow table attack** | Salt + hash ngẫu nhiên ngăn attacker dùng bảng tra cứu để giải mã |
| **Không ai biết** | Ngay cả admin cũng không thể xem được mật khẩu của user khác |

### Ví dụ sử dụng bcrypt:
```javascript
const bcrypt = require('bcrypt');

// Khi tạo user mới
const hash = await bcrypt.hash('password123', 10);
await db.execute('INSERT INTO users SET ?', { password_hash: hash });

// Khi đăng nhập
const match = await bcrypt.compare(inputPassword, storedHash);
```

---

## 2. Tại sao bảng `files` cần cột `iv` (Initialization Vector)?

### ❌ KHÔNG NÊN: Mã hóa không có IV
```javascript
// ❌ Nguy hiểm - cùng plaintext → cùng ciphertext
encrypt("Hello", key) → "abc123"
encrypt("Hello", key) → "abc123"  // Pattern lặp lại!
```

### ✅ NÊN: Mã hóa có IV ngẫu nhiên
```javascript
// ✅ An toàn - mỗi lần mã hóa cho kết quả khác nhau
encrypt("Hello", key, iv1) → "x7k9m2"
encrypt("Hello", key, iv2) → "p3q5n8"  // Khác hoàn toàn!
```

### Lý do:

```
┌─────────────────────────────────────────────────────────────┐
│                    AES-256-CBC Mode                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Plaintext: "HELLO"                                        │
│        ↓                                                    │
│   + IV ngẫu nhiên (16 bytes)                               │
│        ↓                                                    │
│   + Encryption Key                                         │
│        ↓                                                    │
│   Ciphertext: "a8f5f7..."                                   │
│                                                             │
│   Lý do cần IV:                                            │
│   ┌────────────────────────────────────────────────────┐   │
│   │ 1. Đảm bảo mỗi file mã hóa cho kết quả khác nhau   │   │
│   │ 2. Ngăn pattern nhận diện (pattern attack)         │   │
│   │ 3. Bảo vệ against chosen-plaintext attacks         │   │
│   │ 4. Tuân thủ FIPS-140 / security standards           │   │
│   └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Cấu trúc bảng files:
```sql
encryption_iv VARCHAR(32) NOT NULL  -- Lưu IV đã mã hóa Base64
```

### Quy trình mã hóa file:
```javascript
const crypto = require('crypto');

function encryptFile(buffer, key) {
    // Tạo IV ngẫu nhiên 16 bytes
    const iv = crypto.randomBytes(16);
    
    // Mã hóa với AES-256-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    
    return {
        data: encrypted,
        iv: iv.toString('base64')  // Lưu vào database
    };
}
```

---

## Tóm tắt

| Khái niệm | Mục đích | Security Benefit |
|-----------|----------|-------------------|
| `password_hash` | Lưu hash thay mật khẩu | Chống đánh cắp, rainbow table |
| `encryption_iv` | Vector khởi tạo ngẫu nhiên | Chống pattern analysis, bảo mật CBC mode |
| Foreign Keys | Ràng buộc quan hệ | Toàn vẹn dữ liệu |
| Indexes | Tăng tốc truy vấn | Performance + Audit trail |