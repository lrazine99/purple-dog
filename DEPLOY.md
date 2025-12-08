# 🚀 Deploy Purple Dog to DigitalOcean

## What You Need Before Starting

- [ ] DigitalOcean account → [Sign up here](https://digitalocean.com)
- [ ] GitHub account → [Sign up here](https://github.com)
- [ ] Your code pushed to GitHub

---

## Step 1: Install Terraform

Open PowerShell and run:

```powershell
winget install Hashicorp.Terraform
```

Close and reopen PowerShell after installing.

---

## Step 2: Create DigitalOcean API Token

1. Go to → https://cloud.digitalocean.com/account/api/tokens
2. Click **"Generate New Token"**
3. Name: `purple-dog`
4. Check **"Write"** permission
5. Click **"Generate Token"**
6. **Copy the token** (you can only see it once!)

---

## Step 3: Create SSH Key

Check if you already have one:

```powershell
cat ~/.ssh/id_rsa.pub
```

**If you see a long string starting with `ssh-rsa`** → You have a key, skip to Step 4.

**If you see an error** → Create a new key:

```powershell
ssh-keygen -t rsa -b 4096
```

Press Enter for all questions (use defaults).

---

## Step 4: Push Your Code to GitHub

```powershell
cd C:\Users\elhan\OneDrive\Desktop\purple-dog\purple-dog

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/purple-dog.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 5: Configure Terraform

```powershell
cd terraform
copy terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars
```

**Fill in these values:**

```
do_token            = "paste_your_digitalocean_token_here"
github_repo         = "https://github.com/YOUR_USERNAME/purple-dog.git"
postgres_password   = "MySecurePassword123"
```

Save and close notepad.

---

## Step 6: Deploy! 🎉

```powershell
cd terraform

terraform init
terraform apply
```

When it asks **"Do you want to perform these actions?"** → Type `yes` and press Enter.

**Wait 3-5 minutes...**

---

## Step 7: See Your App!

After deployment, you'll see:

```
frontend_url = "http://143.198.xxx.xxx:3000"
backend_url  = "http://143.198.xxx.xxx:3001"
```

**Open the frontend_url in your browser** → Your app is live! 🎉

---

## Common Commands

| What you want to do | Command |
|---------------------|---------|
| See your app URLs | `terraform output` |
| Delete everything | `terraform destroy` |
| Connect to server | `ssh root@YOUR_IP` |

---

## Update Your App After Changes

1. Push changes to GitHub:
```powershell
git add .
git commit -m "My changes"
git push
```

2. Redeploy on server:
```powershell
ssh root@YOUR_DROPLET_IP "cd /opt/purple-dog && git pull && docker-compose up -d --build"
```

---

## Cost

**~$24/month** for a good server (4GB RAM, 2 CPU)

Want cheaper? Edit `terraform.tfvars`:
```
droplet_size = "s-1vcpu-2gb"
```
This costs **$12/month** (2GB RAM, 1 CPU)

---

## Need Help?

If something doesn't work, check:

1. **Is Terraform installed?**
   ```powershell
   terraform version
   ```

2. **Is your token correct?** 
   - Check `terraform.tfvars` has the right token

3. **Is your GitHub repo public?**
   - Make sure your repo exists and is accessible

4. **Server not responding?**
   - Wait 5 minutes for setup to complete
   - Then try the URL again
