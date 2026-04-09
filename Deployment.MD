# Deployment Guide: Eco‑Wise‑Marketing Landing Page on Vercel

This document explains how to deploy the **Eco‑Wise‑Marketing** landing page (frontend) to [Vercel](https://eco-marketing.vercel.app/). The landing page is a static or server‑rendered application that serves as the public face of the e‑commerce platform.

---

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier works).
- Our project code is hosted on a Git repository (GitHub ).
- Node.js (v16 or later) and npm/yarn/pnpm installed locally (if you need to test locally).
- The project must have a valid build setup (e.g., `package.json` with build script, or a static HTML/CSS/JS folder).

---

## Step‑by‑Step Deployment

### 1. Preparing Project for Vercel

Our project have the following:

- **For static sites:**  
  The root folder contains `index.html` and all assets. Vercel serve them directly.

- **For frameworks (VS code):**  
  Our project  have a `package.json` with a `build` script.  
  Vercel automatically detects the framework and applies the correct build settings.

**Example folder structure:**


### 2.We Pushed our Code to a Git Repository

Vercel integrates with Git. So we Pushed our code to a repository on GitHub.

### 3. Imported the Project into Vercel

1. Log in to our Vercel dashboard.
2. Click **Add New** → **Project**.
3. Selected our Git provider and authorize Vercel if needed.
4. Choose the repository containing your landing page.
5. Vercel automatically detected the framework and fill in build settings.  
   Verify:
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.
   - **Install Command**: `npm install` (default).

6. Then **Deploy**.

## Vercel Configuration File (`vercel.json`)

For advanced settings, we created a `vercel.json` file in the root of our project.

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}