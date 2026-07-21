# Auro Verse Event Portal — Setup & Deployment Guide

This guide provides a detailed step-by-step walkthrough for the following:
1. Setting up Google Sheets and writing / deploying the Google Apps Script backend.
2. Uploading project files to GitHub and enabling GitHub Pages for free hosting.
3. Connecting the portal to the database using the Admin Dashboard.

---

## Part 1: Google Sheets & Apps Script Configuration (Backend)

Google Sheets is used as a cloud database to receive and organize applicant submissions into separate tabs.
Applicant photos are automatically saved to a dedicated Google Drive folder named **"Auro Verse - Applicant Photos"** and a link to each photo is stored in the sheet.

### Step 1 — Create a New Spreadsheet
1. Sign in to your Google account and go to [Google Sheets](https://sheets.google.com).
2. Create a new blank spreadsheet.
3. Give it any name you prefer (e.g. `Auro Verse Event Applicants Database`).
4. **Important:** Do NOT create any tabs manually. The Apps Script code will automatically create the correct tabs and column headers the first time a submission is received for each category.

### Step 2 — Set Up the Apps Script
1. In the Google Sheet top menu, click **Extensions** → **Apps Script**.
2. A code editor will open in a new window. Remove the default `myFunction` placeholder code.
3. Open the `Code.gs` file from this project and copy its entire contents.
4. Paste the code into the Apps Script editor.
5. Click the **Save** icon 💾 at the top of the editor.

### Step 3 — Deploy as a Web App
To allow the frontend to communicate with the spreadsheet, you need to publish the Apps Script as a Web App:

1. In the top-right corner of the Apps Script editor, click **Deploy** → **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. Fill in the deployment settings as follows:
   - **Description:** Any description you like (e.g. `Auro Verse Applicant System`).
   - **Execute as:** Select **Me (your-email@gmail.com)**.
   - **Who has access:** Select **Anyone** — *This step is critical to allow the browser to submit forms without CORS errors.*
4. Click the **Deploy** button.
5. A permissions dialog will appear (Authorization Required). Click **Authorize access**.
6. Select your Google account.
7. A warning page will appear: "Google hasn't verified this app". Click **Advanced** at the bottom, then click **Go to [project name] (unsafe)** (safe for personal use).
8. A list of required permissions will show including **Google Drive** (for photo uploads) and **Google Sheets** (for data storage). Click **Allow**.
   > ⚠️ **Photo Upload Note:** The Drive permission is required for photo uploads to work. Apps Script will automatically create a folder named **"Auro Verse - Applicant Photos"** in your Google Drive and save every uploaded image there, storing the shareable link in the sheet.
9. Once complete, a window will show your **Web App URL**.
10. **Copy this URL** and keep it safe — you'll use it to connect your portal to the database. It will look like:
    `https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXX/exec`

> 📌 **Reminder:** Every time you edit the `Code.gs` script, you must create a **New Deployment** for changes to take effect.

---

## Part 2: Upload to GitHub and Enable GitHub Pages

GitHub Pages is used to host the portal website for free and make it accessible online.

### Step 1 — Create a New Repository
1. Sign in to [GitHub](https://github.com).
2. Click **New** to create a new repository.
3. Enter a repository name (e.g. `auroverse-event-portal`).
4. Make sure the repository is set to **Public** to enable free GitHub Pages hosting.
5. Leave other settings as default and click **Create repository**.

### Step 2 — Upload Project Files
Upload the files directly from your browser:
1. On the repository page, click the **uploading an existing file** link.
2. Drag and drop the following files from your computer:
   - `index.html`
   - `admin.html`
   - `style.css`
   - `script.js`
   - `logo.jpg`
3. Wait for all files to upload completely.
4. In the **Commit changes** field below, add a commit title (e.g. `Initial Commit`).
5. Click **Commit changes** to save the files to the repository.

### Step 3 — Activate GitHub Pages
1. Go to the **Settings** tab at the top of your repository page.
2. From the left sidebar, click **Pages**.
3. Under **Build and deployment**:
   - Set **Source** to **Deploy from a branch**.
   - Under **Branch**, change `None` to your main branch (usually `main` or `master`).
   - Leave the folder as `/ (root)`.
4. Click **Save**.
5. Wait 1–2 minutes, then refresh the page.
6. A green banner will appear showing your live site URL, like:
   `https://username.github.io/auroverse-event-portal/`

---

## Part 3: Connect the Portal to Google Sheets

To fully activate form submissions and link the frontend to the backend:

1. Open your browser and go to your admin page (e.g. `https://username.github.io/auroverse-event-portal/admin.html`).
2. The login screen will appear. Use the default credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. After logging in, the dashboard will open. Scroll to the bottom of the page to the **Google Apps Script Configuration** card.
4. Paste the **Web App URL** you copied in Step 10 of Part 1 into the input field.
5. Click **Save & Connect**.
6. A success message will confirm the connection is active.
7. The browser stores the URL locally, and data from all 5 category tabs will be fetched and displayed immediately.

---

## Part 4: Testing the Full System

1. Go to the main user portal (`index.html`).
2. Select one of the 5 available categories (Classic Cars, Exotic Cars, Sport Cars, Motorcycles, or Organizers) by clicking the corresponding button.
3. The application form specific to that category will appear.
4. Fill in all required fields and upload a photo, then click **Submit Application**.
5. A modal dialog will confirm submission in progress, followed by a green success message.
6. Open your Google Sheet — a new tab named after the selected category will have been created automatically, with the applicant's data and photo link stored in the correct columns.
7. Navigate to the Admin Dashboard (`admin.html`) to see updated statistics, a live pie chart, and full applicant table data.
