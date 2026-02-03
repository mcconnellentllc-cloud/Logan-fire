# Logan Fire Website - Setup Guide

This document explains how to deploy the site securely.

## Deployment on Netlify

The site is configured for Netlify deployment with serverless functions for secure API handling.

### Step 1: Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up/log in
2. Click "Add new site" > "Import an existing project"
3. Connect your GitHub repository
4. Netlify will auto-detect the configuration from `netlify.toml`

### Step 2: Set Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

| Variable | Description |
|----------|-------------|
| `AIRTABLE_API_KEY` | Your Airtable Personal Access Token |
| `AIRTABLE_BASE_ID` | Your Airtable Base ID (starts with "app") |
| `AIRTABLE_TABLE_NAME` | Table name (default: "Stories") |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_UPLOAD_PRESET` | Your unsigned upload preset name |

### Step 3: Custom Domain

1. In Netlify dashboard, go to **Domain management**
2. Add your custom domain (flamesoffury.com)
3. Update DNS settings as instructed
4. Enable HTTPS

## Security Notes

- API keys are stored in Netlify environment variables, NOT in client-side code
- All API calls go through serverless functions
- The manuscript password uses SHA-256 hashing (not plain text)
- NAME_KEY.md is excluded from git (contains confidential name mappings)

## Local Development

For local development, you can use Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

This will run the site locally with functions at `http://localhost:8888`.

## Updating the Password

If you need to change the manuscript password:

1. Generate a new SHA-256 hash:
   ```bash
   echo -n "your-new-password" | sha256sum
   ```
2. Update the hash in `js/auth.js`
