"""
Gunicorn configuration for production deployment
"""
import multiprocessing
import os

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 60
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.getenv("LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "agentflow-api"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed, configure via environment)
keyfile = os.getenv("SSL_KEYFILE")
certfile = os.getenv("SSL_CERTFILE")
ssl_version = 3
cert_reqs = 0
ca_certs = None
suppress_ragged_eof = True

# Application
wsgi_app = "app.main:app"
chdir = None
preload_app = False
sendfile = None
raw_env = []

# Hook functions
def on_starting(server):
    print(f"🚀 Gunicorn starting with {workers} workers")

def when_ready(server):
    print("✅ Gunicorn ready. Spawning workers")

def on_exit(server):
    print("🛑 Gunicorn shutting down")
