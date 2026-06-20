# TaxHero - GST & Invoice Control Center

TaxHero is a complete, production-ready, client-side single-page web application for calculating goods and services taxes (GST) and generating professional business invoices. It is built using clean, responsive HTML, CSS, and modern JavaScript, with zero build configurations, allowing instant static deployment on hosting providers like Vercel.

## Features

### 1. Live GST Calculator
- **Tax Inclusion/Exclusion Toggle**: Swap between **Add GST** (exclusive calculation) and **Remove GST** (inclusive calculation).
- **Tax Rate Presets**: Dropdown selection for standard tax brackets (5%, 12%, 18%, 28%) and custom tax rates.
- **Detailed Tax Breakdown**: Live-updating display of Pre-Tax Amount, CGST (Central GST), SGST (State GST), Total Tax Amount, and Final Invoice Total.

### 2. Professional Invoice Builder
- **Flexible Billing Form**: Customize seller and client parameters, including business names, addresses, invoice IDs, dates, and GSTIN registry.
- **Interactive Line Items Grid**: Add or delete unlimited rows, edit items, custom quantities, rates, and set line-item-specific tax rates.
- **Auto-Calculating Ledger**: Live calculations of subtotal, individual tax groups, tax sums, and the absolute Grand Total.
- **Visual Print Preview**: Review your clean, corporate invoice document before printing or exporting.
- **High-Fidelity PDF Export**: Download client-ready, styled invoice pages locally using browser graphics conversion (`html2pdf.js`).

---

## Local Development

Since TaxHero uses plain HTML, CSS, and JavaScript, it has **zero build steps** and **no dependencies** to compile. You can run it instantly using any of the following methods:

### Method A: Direct Opening
Simply open the `index.html` file in any modern web browser (Double-click `index.html` or drag-and-drop it into Chrome, Safari, Firefox, or Edge).

### Method B: Static Local Server
Run a lightweight HTTP server in the project directory using Node.js:
```bash
npx serve .
# Or using python
python3 -m http.server 8000
```
Then navigate to `http://localhost:3000` (or `http://localhost:8000`) in your browser.

---

## Pushing to GitHub

To store your code in a new public GitHub repository, open your terminal in the project folder and run the following commands (make sure to replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub credentials):

1. **Initialize Git repository**:
   ```bash
   git init
   ```

2. **Stage and commit all files**:
   ```bash
   git add .
   git commit -m "feat: initial release of TaxHero GST & Invoice Calculator"
   ```

3. **Rename branch to main**:
   ```bash
   git branch -M main
   ```

4. **Link to your GitHub repository**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

5. **Push to GitHub**:
   ```bash
   git push -u origin main
   ```

---

## Deploying to Vercel (Free Hobby Plan)

Deploying a static site on Vercel is free and takes less than a minute. No credit card is required.

1. **Sign Up / Log In**:
   Go to [vercel.com](https://vercel.com) and log in with your GitHub account.

2. **Create a New Project**:
   In your Vercel Dashboard, click **Add New** at the top right and select **Project**.

3. **Import Repository**:
   Authorize Vercel to access your GitHub repositories, locate your newly pushed repository (e.g. `YOUR_REPO_NAME`), and click **Import**.

4. **Configure Settings**:
   Vercel will auto-detect that this is a static site with no build process.
   - **Framework Preset**: Leave as `Other` or `None`.
   - **Build & Development Settings**: Do not modify (leave empty).
   - **Environment Variables**: Leave empty.

5. **Deploy**:
   Click the **Deploy** button. Vercel will build and host your site on a secure `https://[your-project-name].vercel.app` URL within seconds!
