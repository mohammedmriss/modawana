# Professional Static Blog with GitHub Admin Panel

A complete, high-performance static blog system built with HTML, CSS, and Vanilla JavaScript. Features a custom admin panel that persists data directly to your GitHub repository.

## 🚀 Step 1: Create a GitHub Repository
1. Log in to your GitHub account.
2. Create a new repository (e.g., `my-blog`).
3. Upload all the files from this project to that repository.
4. **Important:** Make sure `articles.json` is in the root of the repository.

## 🔑 Step 2: Generate GitHub Personal Access Token (PAT)
The admin panel needs a token to "push" changes to your `articles.json`.
1. Go to **GitHub Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
2. Click **Generate new token (classic)**.
3. Give it a note (e.g., "Blog Admin").
4. Select the `repo` scope (this allows the token to read/write to your repositories).
5. Click **Generate token** and **COPY IT**. You won't see it again.

## 🛠️ Step 3: Setup the Admin Panel
1. Open your blog's URL (locally or deployed).
2. Go to `/admin/`.
3. You will see a login screen.
4. Enter your **GitHub Token**, **GitHub Username**, and **Repository Name**.
5. Click **Login**.
6. Now you can Add, Edit, and Delete articles. Each action will create a "commit" in your GitHub repository!

## 🌐 Step 4: Deploy to Netlify
1. Go to [Netlify](https://www.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Connect to your GitHub and select the `my-blog` repository.
4. Click **Deploy**.
5. Your blog is now live!

## 🔒 Security Note
This system stores your GitHub token in the browser's `localStorage`. This is convenient for a personal blog but means anyone with physical access to your computer could potentially find the token.
- **NEVER** share your token with anyone.
- If you suspect your token is leaked, delete it from GitHub and generate a new one.
- For maximum security, you could implement a "Backend Proxy" (like a Netlify Function) to hide the token from the frontend.

## 📂 Project Structure
- `index.html`: Main blog page.
- `article.html`: Single article view.
- `style.css`: Global styles.
- `script.js`: Core blog logic.
- `articles.json`: Your database.
- `admin/`: The admin dashboard.
- `categories/`: Auto-generated category pages.

---
Built with ❤️ for a professional blogging experience.
