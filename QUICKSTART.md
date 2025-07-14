# 🚀 Quick Start Guide

## Cách sử dụng nhanh

### 1. Khởi chạy full-stack (Khuyến nghị)
```bash
make up
```
- Khởi động toàn bộ: database + backend + frontend
- Truy cập: http://localhost:3000

### 2. Dừng tất cả services
```bash
make down
```

### 3. Build lại toàn bộ ứng dụng
```bash
make build
```

### 4. Rebuild hoàn toàn (down → build → up)
```bash
make rebuild
```

## 📋 Lệnh chính

| Lệnh | Mô tả |
|------|-------|
| `make up` | Khởi động full-stack |
| `make down` | Dừng tất cả containers |
| `make build` | Build lại images |
| `make rebuild` | Rebuild hoàn toàn |
| `make logs` | Xem logs |
| `make status` | Kiểm tra trạng thái containers |
| `make help` | Hiển thị tất cả lệnh |

## 🔧 Development Commands

```bash
# Chỉ khởi động database
make db-up

# Chạy backend locally
make run-backend

# Setup frontend
make setup-frontend

# Chạy frontend locally  
make run-frontend

# Chạy tests
make test
```

## 🛠️ Utility Commands

```bash
# Format code
make fmt

# Clean build artifacts
make clean

# Update dependencies
make deps

# Clean Docker volumes
make clean-volumes
```

## 🎯 Quick Start Script

Sử dụng script tương tác:
```bash
./start.sh
```

## 📍 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

## 🆘 Troubleshooting

### Container không start được
```bash
make down
make clean-volumes
make rebuild
```

### Xem logs để debug
```bash
make logs
```

### Kiểm tra trạng thái
```bash
make status
```
