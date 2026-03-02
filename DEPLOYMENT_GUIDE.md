# V-Nexus Deployment Guide

## Prerequisites
- Fresh Ubuntu VM (20.04 or 22.04)
- Domain: `example.com` pointing to VM IP
- Local V-Nexus source code ready

## Step 1: Initial Server Setup

### 1.1 Connect to VM
```bash
ssh ubuntu@[VM_IP]
```

### 1.2 Add Swap Memory (4GB)
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 1.3 Update System
```bash
sudo apt-get update && sudo apt-get upgrade -y
```

## Step 2: Install Dependencies

### 2.1 Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.2 Install PM2
```bash 
sudo npm install -g pm2
```

### 2.3 Install Nginx
```bash
sudo apt-get install -y nginx
```

### 2.4 Install Certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

## Step 3: Upload Source Code

### 3.1 Create Directory
```bash
mkdir -p ~/v-nexus
```

### 3.2 Upload Files (From Local Machine)
```bash
# Upload source files (excluding node_modules and .next)
scp -r src data public package.json package-lock.json next.config.js jsconfig.json ubuntu@[VM_IP]:~/v-nexus/
```

## Step 4: Build Application

### 4.1 Install Dependencies
```bash
cd ~/v-nexus
npm install
```

### 4.2 Build Next.js
```bash
npm run build
```

## Step 5: Configure Nginx

### 5.1 Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/vnexus
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/vnexus /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Step 6: Generate SSL Certificate

### 6.1 Run Certbot
```bash
sudo certbot --nginx -d example.com --non-interactive --agree-tos -m [EMAIL_ADDRESS] --redirect
```

This will:
- Automatically configure HTTPS
- Set up auto-renewal
- Redirect HTTP to HTTPS

## Step 7: Start Application with PM2

### 7.1 Start App
```bash
cd ~/v-nexus
pm2 start npm --name "v-nexus" -- start
```

### 7.2 Save PM2 Configuration
```bash
pm2 save
pm2 startup
# Run the command that PM2 outputs
```

## Step 8: Verify Deployment

### 8.1 Check Application Status
```bash
pm2 status
pm2 logs v-nexus --lines 50
```

## Troubleshooting

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check PM2 Logs
```bash
pm2 logs v-nexus
```

### Check Firewall
```bash
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Restart Services
```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart PM2 App
pm2 restart v-nexus

# Rebuild if needed
cd ~/v-nexus
npm run build
pm2 restart v-nexus
```


## Notes
- The app runs on port 3000 internally
- Nginx handles ports 80 and 443
- SSL certificates auto-renew via certbot
- PM2 ensures app stays running and restarts on reboot
