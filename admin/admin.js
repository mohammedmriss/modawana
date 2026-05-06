const admin = {
    config: {
        token: localStorage.getItem('gh_token'),
        user: localStorage.getItem('gh_user'),
        repo: localStorage.getItem('gh_repo'),
    },

    articles: [],
    currentFileSha: null,

    init() {
        if (this.config.token && this.config.user && this.config.repo) {
            document.getElementById('login-overlay').style.display = 'none';
            this.fetchArticles();
        }
    },

    login() {
        const token = document.getElementById('github-token').value;
        const user = document.getElementById('github-user').value;
        const repo = document.getElementById('github-repo').value;

        if (token && user && repo) {
            localStorage.setItem('gh_token', token);
            localStorage.setItem('gh_user', user);
            localStorage.setItem('gh_repo', repo);
            location.reload();
        } else {
            alert('يرجى ملء جميع الحقول');
        }
    },

    logout() {
        localStorage.clear();
        location.reload();
    },

    async fetchArticles() {
        const url = `https://api.github.com/repos/${this.config.user}/${this.config.repo}/contents/articles.json`;
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `token ${this.config.token}` }
            });
            const data = await response.json();
            this.currentFileSha = data.sha;
            const content = JSON.parse(atob(data.content));
            this.articles = content.articles;
            this.renderList();
        } catch (error) {
            console.error('Error fetching articles:', error);
            alert('خطأ في الاتصال بـ GitHub. تأكد من صحة التوكن والبيانات.');
        }
    },

    renderList() {
        const list = document.getElementById('articles-list');
        list.innerHTML = this.articles.map(article => `
            <div class="article-item">
                <div>
                    <strong>${article.title}</strong>
                    <div style="font-size: 0.8rem; color: #64748b;">${article.category} | ${article.date}</div>
                </div>
                <div class="article-actions">
                    <button class="btn btn-primary" onclick="admin.showModal(${article.id})">تعديل</button>
                    <button class="btn btn-danger" onclick="admin.deleteArticle(${article.id})">حذف</button>
                </div>
            </div>
        `).join('') || '<div style="padding: 40px; text-align: center;">لا توجد مقالات بعد.</div>';
    },

    showModal(id = null) {
        const modal = document.getElementById('article-modal');
        const title = document.getElementById('modal-title');
        modal.style.display = 'flex';

        if (id) {
            title.innerText = 'تعديل مقال';
            const article = this.articles.find(a => a.id == id);
            document.getElementById('article-id').value = article.id;
            document.getElementById('edit-title').value = article.title;
            document.getElementById('edit-category').value = article.category;
            document.getElementById('edit-image').value = article.image;
            document.getElementById('edit-content').value = article.content;
        } else {
            title.innerText = 'إضافة مقال جديد';
            document.getElementById('article-id').value = '';
            document.getElementById('edit-title').value = '';
            document.getElementById('edit-image').value = '';
            document.getElementById('edit-content').value = '';
        }
    },

    hideModal() {
        document.getElementById('article-modal').style.display = 'none';
    },

    async saveArticle() {
        const id = document.getElementById('article-id').value;
        const title = document.getElementById('edit-title').value;
        const category = document.getElementById('edit-category').value;
        const image = document.getElementById('edit-image').value;
        const content = document.getElementById('edit-content').value;

        if (!title || !content) return alert('العنوان والمحتوى مطلوبان');

        const articleData = {
            id: id ? parseInt(id) : Date.now(),
            title,
            category,
            date: new Date().toISOString().split('T')[0],
            image: image || 'https://via.placeholder.com/800x400',
            content
        };

        if (id) {
            const index = this.articles.findIndex(a => a.id == id);
            this.articles[index] = articleData;
        } else {
            this.articles.unshift(articleData);
        }

        await this.updateGitHub();
    },

    async deleteArticle(id) {
        if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
        this.articles = this.articles.filter(a => a.id != id);
        await this.updateGitHub();
    },

    async updateGitHub() {
        const url = `https://api.github.com/repos/${this.config.user}/${this.config.repo}/contents/articles.json`;
        const newContent = btoa(unescape(encodeURIComponent(JSON.stringify({ articles: this.articles }, null, 2))));

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.config.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update articles.json - ${new Date().toISOString()}`,
                    content: newContent,
                    sha: this.currentFileSha
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.currentFileSha = data.content.sha;
                alert('تم الحفظ بنجاح!');
                this.hideModal();
                this.renderList();
            } else {
                const err = await response.json();
                throw new Error(err.message);
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('فشل التحديث: ' + error.message);
        }
    }
};

admin.init();
