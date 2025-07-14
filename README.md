# GitHub Notes Backend

Một ứng dụng backend hoàn chỉnh được viết bằng Golang để quản lý ghi chú với tích hợp GitHub Pull Request.

## Tính năng

### Authentication
- Đăng ký user với email và password
- Đăng nhập và nhận JWT token
- Mật khẩu được hash bằng bcrypt
- Middleware bảo vệ các API cần đăng nhập

### Quản lý GitHub Profile
- Lưu trữ GitHub username và token của user
- Sử dụng token để gọi GitHub API
- Kiểm tra và yêu cầu cấu hình GitHub token khi cần

### Quản lý Notes
- Tạo, đọc, cập nhật, xóa ghi chú
- Liên kết ghi chú với GitHub Pull Request
- Tự động fetch thông tin PR từ GitHub API
- Lưu cache thông tin PR để tránh gọi API nhiều lần
- Tìm kiếm ghi chú theo tiêu đề, nội dung, PR number, PR state
- Phân trang kết quả

## Công nghệ sử dụng

- **Backend**: Golang với Gin framework
- **Database**: PostgreSQL
- **ORM**: GORM
- **Authentication**: JWT
- **Containerization**: Docker & Docker Compose
- **Password Hashing**: bcrypt

## Cấu trúc dự án

```
├── cmd/
│   └── main.go                 # Entry point của ứng dụng
├── internal/
│   ├── config/
│   │   └── config.go          # Cấu hình ứng dụng
│   ├── database/
│   │   └── database.go        # Kết nối database
│   ├── handlers/
│   │   ├── auth.go           # Handlers cho authentication
│   │   ├── user.go           # Handlers cho user management
│   │   └── note.go           # Handlers cho note management
│   ├── middleware/
│   │   └── auth.go           # Authentication middleware
│   ├── models/
│   │   └── models.go         # Database models và DTOs
│   ├── services/
│   │   └── github.go         # GitHub API service
│   └── utils/
│       ├── auth.go           # Authentication utilities
│       └── response.go       # Response utilities
├── migrations/               # Database migrations (nếu cần)
├── .env                     # Environment variables
├── docker-compose.yml       # Docker compose configuration
├── Dockerfile              # Docker configuration
├── go.mod                  # Go module dependencies
├── go.sum                  # Go module checksums
├── init.sql                # Database initialization
└── README.md               # Documentation
```

## Cài đặt và chạy

### Yêu cầu hệ thống
- Docker và Docker Compose
- Go 1.23+ (nếu chạy local)
- PostgreSQL (nếu chạy local)

### Chạy với Docker Compose (Khuyến nghị)

1. Clone repository:
```bash
git clone <repository-url>
cd githubBE
```

2. Tạo file .env (đã có sẵn, có thể chỉnh sửa nếu cần):
```bash
cp .env.example .env
```

3. Chạy ứng dụng:
```bash
docker-compose up -d
```

4. Kiểm tra logs:
```bash
docker-compose logs -f backend
```

5. Ứng dụng sẽ chạy tại: http://localhost:8080

### Chạy local (Development)

1. Cài đặt dependencies:
```bash
go mod tidy
```

2. Chạy PostgreSQL (có thể dùng Docker):
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=github_notes -p 5432:5432 -d postgres:15-alpine
```

3. Chạy ứng dụng:
```bash
go run cmd/main.go
```

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication

#### Đăng ký
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Đăng nhập
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### User Management

#### Lấy thông tin profile
```bash
GET /api/user/profile
Authorization: Bearer <jwt_token>
```

#### Cập nhật GitHub profile
```bash
PUT /api/user/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "github_username": "yourusername",
  "github_token": "ghp_your_github_token"
}
```

### Notes Management

#### Tạo ghi chú
```bash
POST /api/notes
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "My Note",
  "content": "Note content here",
  "github_pr_number": 123,
  "repo_owner": "owner",
  "repo_name": "repository"
}
```

#### Lấy danh sách ghi chú
```bash
GET /api/notes?page=1&limit=10&search=keyword&pr_number=123&pr_state=open
Authorization: Bearer <jwt_token>
```

#### Lấy chi tiết ghi chú
```bash
GET /api/notes/:id
Authorization: Bearer <jwt_token>
```

#### Cập nhật ghi chú
```bash
PUT /api/notes/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Note",
  "content": "Updated content"
}
```

#### Xóa ghi chú
```bash
DELETE /api/notes/:id
Authorization: Bearer <jwt_token>
```

## Ví dụ cURL

### Đăng ký user mới
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Đăng nhập
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Cập nhật GitHub profile
```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "github_username": "yourusername",
    "github_token": "ghp_your_github_token"
  }'
```

### Tạo ghi chú với PR
```bash
curl -X POST http://localhost:8080/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Fix bug in authentication",
    "content": "This note describes the bug fix in PR #123",
    "github_pr_number": 123,
    "repo_owner": "facebook",
    "repo_name": "react"
  }'
```

### Lấy danh sách ghi chú
```bash
curl -X GET "http://localhost:8080/api/notes?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password_hash` (String)
- `github_username` (String, Optional)
- `github_token` (String, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Notes Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `title` (String, Max 255)
- `content` (Text)
- `github_pr_number` (Integer, Optional)
- `repo_owner` (String, Optional)
- `repo_name` (String, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Pull Requests Table
- `id` (UUID, Primary Key)
- `number` (Integer)
- `repo_owner` (String)
- `repo_name` (String)
- `title` (String)
- `body` (Text)
- `author` (String)
- `state` (String)
- `url` (String)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Note PR Links Table (Many-to-Many)
- `note_id` (UUID)
- `pr_id` (UUID)

## Environment Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=github_notes
DB_SSL_MODE=disable

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=8080
```

## Bảo mật

- Mật khẩu được hash bằng bcrypt
- JWT token để authentication
- Prepared statements với GORM để tránh SQL injection
- GitHub token không được trả về trong API response
- CORS middleware được cấu hình

## Development

### Thêm migration mới
```bash
# Nếu sử dụng migrate tool
migrate create -ext sql -dir migrations -seq migration_name
```

### Chạy tests
```bash
go test ./...
```

### Build production
```bash
docker build -t github-notes-backend .
```

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra PostgreSQL đã chạy
- Kiểm tra thông tin kết nối trong .env
- Kiểm tra network trong Docker Compose

### Lỗi GitHub API
- Kiểm tra GitHub token có quyền truy cập repository
- Kiểm tra repository và PR number có tồn tại
- Kiểm tra rate limit của GitHub API

### Lỗi JWT
- Kiểm tra JWT_SECRET trong .env
- Kiểm tra token đã expired chưa
- Kiểm tra format của Authorization header

## Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.