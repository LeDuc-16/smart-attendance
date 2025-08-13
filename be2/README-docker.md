# Docker Setup for Smart Attendance Backend

## Prerequisites

- Docker và Docker Compose đã được cài đặt trên máy
- Port 8080 và 5432 không bị sử dụng bởi ứng dụng khác

## Cách chạy ứng dụng

### 1. Build và chạy với docker-compose

```bash
# Build và chạy tất cả services
docker-compose up --build

# Hoặc chạy ở background
docker-compose up -d --build
```

### 2. Chỉ build Docker image

```bash
# Build image manually
docker build -t smart-attendance-backend .
```

### 3. Kiểm tra logs

```bash
# Xem logs của tất cả services
docker-compose logs

# Xem logs của service cụ thể
docker-compose logs app
docker-compose logs postgres
```

### 4. Dừng services

```bash
# Dừng services
docker-compose down

# Dừng và xóa volumes (cẩn thận - sẽ mất data)
docker-compose down -v
```

## Truy cập ứng dụng

- **API Backend**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui/index.html
- **PostgreSQL**: localhost:5432 (username: postgres, password: password)

## Environment Variables

Các biến môi trường quan trọng trong `docker-compose.yml`:

- `SPRING_PROFILES_ACTIVE=docker`: Sử dụng profile docker
- `SPRING_DATASOURCE_URL`: URL kết nối database
- `APPLICATION_SECURITY_JWT_SECRET_KEY`: Secret key cho JWT
- `APPLICATION_SECURITY_JWT_EXPIRATION`: Thời gian hết hạn JWT (ms)

## Database

- Database name: `smart_attendance`
- Username: `postgres`
- Password: `password`
- Port: `5432`

## Troubleshooting

### 1. Port đã được sử dụng

```bash
# Kiểm tra port đang sử dụng
lsof -i :8080
lsof -i :5432

# Thay đổi port trong docker-compose.yml nếu cần
```

### 2. Container không start

```bash
# Xem logs để debug
docker-compose logs app

# Kiểm tra container status
docker-compose ps
```

### 3. Database connection issues

```bash
# Kiểm tra postgres container
docker-compose logs postgres

# Vào postgres container để debug
docker-compose exec postgres psql -U postgres -d smart_attendance
```

### 4. Rebuild từ đầu

```bash
# Xóa tất cả và rebuild
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Development

### Hot reload trong Docker

Để development, bạn có thể mount source code:

```yaml
# Thêm vào service app trong docker-compose.yml
volumes:
  - ./src:/app/src
  - ./pom.xml:/app/pom.xml
```

### Debug mode

Thêm vào environment của service app:

```yaml
environment:
  - JAVA_TOOL_OPTIONS=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
ports:
  - "5005:5005" # Debug port
```

## Production Deployment

Cho production, cần thay đổi:

1. Sử dụng secret key mạnh hơn
2. Thay đổi database password
3. Sử dụng external database
4. Thêm SSL/HTTPS
5. Sử dụng Docker secrets cho sensitive data
