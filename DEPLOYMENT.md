# AgentFlow OS - Deployment Guide

## Quick Start - Local Development

```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Docker Deployment

### Local Development with Docker

```bash
cd backend
docker-compose up -d
```

### Production Deployment

```bash
# Create .env file with production values
cat > .env.prod << EOF
DB_USER=agentflow
DB_PASSWORD=your-secure-password
SECRET_KEY=your-secret-key-32-chars-min
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
EOF

# Deploy
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

---

## Cloud Deployment Options

### 1. Render.com (Recommended for Beginners)

#### Backend Service:
```bash
1. Create new Web Service
2. Connect GitHub repo
3. Environment: Docker
4. Root directory: backend
5. Environment variables:
   - DATABASE_URL: postgresql://...
   - REDIS_URL: redis://...
   - SECRET_KEY: [generate 32-char key]
```

#### Frontend Service:
```bash
1. Create new Web Service
2. Connect GitHub repo
3. Root directory: frontend
4. Build command: npm install && npm run build
5. Start command: npm start
6. Environment variable: NEXT_PUBLIC_API_BASE_URL=https://backend-url.onrender.com/api/v1
```

### 2. Railway.app (Full Stack)

```bash
1. Connect GitHub repo
2. Railway auto-detects backend + frontend
3. Configure volumes for PostgreSQL
4. Set environment variables
5. Deploy with git push
```

### 3. AWS ECS/Fargate

```bash
# Push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com

docker tag agentflow-backend:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/agentflow-backend:latest
docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/agentflow-backend:latest

# Create ECS cluster and services via AWS Console or Terraform
```

### 4. Vercel + Custom Backend

```bash
# Frontend only on Vercel
cd frontend
npm install -g vercel
vercel --prod

# Backend on Railway/Render/AWS
# Set NEXT_PUBLIC_API_BASE_URL to backend URL
```

---

## Environment Configuration

### Production Variables (.env.prod)

**Backend:**
```env
# Database
DATABASE_URL=postgresql://user:pass@db-host:5432/agentflow
REDIS_URL=redis://redis-host:6379/0

# Security
SECRET_KEY=your-32-character-random-secret-key
ALGORITHM=HS256

# Logging
LOG_LEVEL=WARNING

# CORS
CORS_ORIGINS=["https://yourdomain.com"]

# Business
AUTO_APPROVAL_AMOUNT_THRESHOLD=1000.0
```

**Frontend:**
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_NAME=AgentFlow OS
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_WEBSOCKET_ENABLED=true

# Server-only (never client-exposed)
OPENAI_API_KEY=sk-...
```

---

## Pre-Deployment Checklist

- [ ] Remove sensitive data from .env files
- [ ] Change `SECRET_KEY` in production
- [ ] Set up PostgreSQL database (not SQLite)
- [ ] Configure Redis for production
- [ ] Set CORS origins to your domain
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure backups for database
- [ ] Set up monitoring/logging
- [ ] Test health checks
- [ ] Configure domain DNS
- [ ] Set up CDN for static assets (optional)

---

## Database Migration (SQLite → PostgreSQL)

For production, migrate from SQLite to PostgreSQL:

```bash
# Backup SQLite
cp agentflow.db agentflow.db.backup

# Setup PostgreSQL locally
docker run --name agentflow-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/agentflow

# Run migrations (when available)
alembic upgrade head
```

---

## Monitoring & Logs

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Health checks
curl http://localhost:8000/health
curl http://localhost:3000

# Metrics
curl http://localhost:8000/metrics  # Prometheus metrics
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker logs agentflow-backend-prod

# Verify environment variables
docker exec agentflow-backend-prod env | grep DATABASE_URL
```

### Frontend can't reach backend
```bash
# Check API URL
curl -H "Origin: http://localhost:3000" http://localhost:8000/health

# Verify CORS settings
docker logs agentflow-backend-prod | grep CORS
```

### Database connection errors
```bash
# Test PostgreSQL connection
psql postgresql://user:pass@localhost:5432/agentflow

# Check if Redis is running
redis-cli ping
```

---

## Security Recommendations

1. **Never commit secrets** - Use .gitignore + environment variables
2. **Use strong passwords** - Min 16 chars, mixed case + numbers + symbols
3. **Enable HTTPS** - Use Let's Encrypt or AWS ACM
4. **Set CORS correctly** - Don't use "*" in production
5. **Rotate secrets** - Change SECRET_KEY periodically
6. **Update dependencies** - Run `pip install -U -r requirements-dev.txt`
7. **Use VPC/Private networks** - Don't expose databases publicly
8. **Enable database backups** - Daily automated snapshots
9. **Monitor logs** - Use CloudWatch, Datadog, or similar
10. **Setup alerts** - Notify on errors, high latency, etc.

---

## Post-Deployment

1. **Test functionality** - Login, create workflows, test approvals
2. **Load testing** - Use tools like Apache JMeter or k6
3. **Security audit** - Run OWASP ZAP scanner
4. **Backup verification** - Confirm backups work
5. **Disaster recovery plan** - Document recovery procedures

---

## Support & Resources

- API Docs: `https://yourdomain.com/docs`
- GitHub: https://github.com/kartikeya2006jay/agent--flow
- Issues: Use GitHub Issues for bug reports
