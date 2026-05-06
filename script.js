// Config
const ARTICLES_PER_PAGE = 6;
let allArticles = [];
let currentArticles = [];
let currentPage = 1;

// Elements
const articlesContainer = document.getElementById('articles-container');
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('search-input');

// Categories Mapping
const CATEGORIES = {
    akhbar: 'أخبار',
    wazaef: 'وظائف',
    hijra: 'الهجرة',
    riyada: 'رياضة',
    tabkh: 'الطبخ',
    siya9a: 'تعليم السياقة',
    aflam: 'أفلام ومسلسلات',
    ribh: 'الربح من الإنترنت',
    hiraf: 'الحرف والمشاريع',
    wataik: 'الوثائق الإدارية',
    islah: 'إصلاح الإلكترونيات'
};

const CATEGORY_ICONS = {
    akhbar: '📰',
    wazaef: '💼',
    hijra: '✈️',
    riyada: '⚽',
    tabkh: '🍲',
    siya9a: '🚗',
    aflam: '🎬',
    ribh: '💰',
    hiraf: '🛠️',
    wataik: '📄',
    islah: '🔧'
};

const CATEGORY_DESCRIPTIONS = {
    akhbar: 'آخر المستجدات والتقارير الإخبارية المحلية والدولية.',
    wazaef: 'أحدث فرص الشغل والمباريات والوظائف في القطاعين العام والخاص.',
    hijra: 'دليل شامل للسفر والعمل والهجرة والدراسة بالخارج.',
    riyada: 'تغطية مستمرة لأخبار كرة القدم ومختلف الرياضات العالمية.',
    tabkh: 'وصفات طبخ شهية وأسرار المطبخ التقليدي والعصري.',
    siya9a: 'دروس تعليم السياقة وشرح مفصل لقوانين السير.',
    aflam: 'مراجعات وتوصيات لأحدث الأفلام والمسلسلات الفنية.',
    ribh: 'طرق الربح من الإنترنت والعمل الحر والتجارة الإلكترونية.',
    hiraf: 'أفكار مشاريع مربحة ومهارات يدوية وحرفية.',
    wataik: 'دليل المساطر الإدارية والوثائق الرسمية المطلوبة.',
    islah: 'شروحات صيانة وإصلاح الهواتف الذكية والحواسيب.'
};

// Determine the base path for assets/data
// If we are in /categories/ or /admin/, we need to go up one level
const isSubDir = window.location.pathname.includes('/categories/') || window.location.pathname.includes('/admin/');
const basePath = isSubDir ? '../' : './';

// Initialize
async function init() {
    try {
        const response = await fetch(basePath + 'articles.json');
        if (!response.ok) throw new Error('Failed to load articles.json');
        const data = await response.json();
        allArticles = data.articles;
        currentArticles = [...allArticles];
        
        // Handle Category Filtering based on body attribute OR URL parameter
        const bodyCategory = document.body.dataset.category;
        const urlParams = new URLSearchParams(window.location.search);
        const urlCategory = urlParams.get('cat');
        
        const filterCat = bodyCategory || urlCategory;
        if (filterCat) {
            currentArticles = allArticles.filter(a => a.category === filterCat);
            // Update page title if filtering by URL
            if (urlCategory && CATEGORIES[urlCategory]) {
                const titleEl = document.getElementById('category-page-title');
                if (titleEl) titleEl.innerText = CATEGORIES[urlCategory];
                document.title = `${CATEGORIES[urlCategory]} | مدونة المعرفة`;
            }
        }

        // Handle Search
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }

        renderArticles();
        renderCategoryDropdown();
    } catch (error) {
        console.error('Error loading articles:', error);
        if (articlesContainer) {
            articlesContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">عذراً، تعذر تحميل المقالات. يرجى التأكد من تشغيل الموقع عبر خادم (Server).</p>';
        }
    }
}

// Render Articles Grid
function renderArticles() {
    if (!articlesContainer) return;

    const start = (currentPage - 1) * ARTICLES_PER_PAGE;
    const end = start + ARTICLES_PER_PAGE;
    const paginatedArticles = currentArticles.slice(start, end);

    if (paginatedArticles.length === 0) {
        articlesContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">لا توجد مقالات تطابق بحثك.</p>';
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    articlesContainer.innerHTML = paginatedArticles.map(article => `
        <article class="article-card">
            <a href="${basePath}article.html?id=${article.id}">
                <img src="${article.image}" alt="${article.title}" class="article-image" onerror="this.src='https://via.placeholder.com/400x200?text=Image+Not+Found'">
                <div class="article-info">
                    <span class="article-category">${CATEGORIES[article.category] || article.category}</span>
                    <h2 class="article-title">${article.title}</h2>
                    <p class="article-date">${article.date}</p>
                </div>
            </a>
        </article>
    `).join('');

    renderPagination();
}

// Render Pagination
function renderPagination() {
    if (!paginationContainer) return;

    const totalPages = Math.ceil(currentArticles.length / ARTICLES_PER_PAGE);
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    paginationContainer.innerHTML = paginationHTML;
}

// Change Page
window.changePage = (page) => {
    currentPage = page;
    renderArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Handle Search
function handleSearch(e) {
    const term = e.target.value.toLowerCase();
    const bodyCategory = document.body.dataset.category;
    
    let filtered = [...allArticles];
    
    if (bodyCategory) {
        filtered = filtered.filter(a => a.category === bodyCategory);
    }
    
    currentArticles = filtered.filter(a => 
        a.title.toLowerCase().includes(term) || 
        (a.content && a.content.toLowerCase().includes(term))
    );
    
    currentPage = 1;
    renderArticles();
}

// Single Article Logic
async function loadSingleArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('article-content-wrapper');

    if (!id || !container) return;

    try {
        const response = await fetch(basePath + 'articles.json');
        const data = await response.json();
        const article = data.articles.find(a => a.id == id);

        if (article) {
            document.title = `${article.title} | مدونة المعرفة`;
            container.innerHTML = `
                <div class="article-page">
                    <article class="article-detail">
                        <header class="article-header">
                            <h1>${article.title}</h1>
                            <p class="article-date">📅 ${article.date}</p>
                        </header>
                        <img class="article-hero-image" src="${article.image}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/800x400?text=Image+Not+Found'">
                        <div class="article-content">
                            ${article.content}
                        </div>
                        <section class="article-share" aria-label="شارك المقال">
                            <h3>شارك المقال:</h3>
                            <div class="share-buttons">
                                <a class="share-btn whatsapp" href="https://wa.me/?text=${encodeURIComponent(article.title)}" target="_blank" rel="noopener" aria-label="شارك على واتساب">☘</a>
                                <a class="share-btn twitter" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}" target="_blank" rel="noopener" aria-label="شارك على تويتر">t</a>
                                <a class="share-btn facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener" aria-label="شارك على فيسبوك">f</a>
                            </div>
                        </section>
                        <div class="article-actions">
                            <button type="button" class="article-back-btn" onclick="goBack()">← العودة للرئيسية</button>
                        </div>
                    </article>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="article-detail" style="text-align:center;"><h2>المقال غير موجود</h2><a href="${basePath}index.html" class="btn btn-primary">العودة للرئيسية</a></div>';
        }
    } catch (error) {
        console.error('Error loading article:', error);
        container.innerHTML = '<p style="text-align:center;">خطأ في تحميل المقال.</p>';
    }
}

function goBack() {
    if (document.referrer) {
        history.back();
    } else {
        window.location.href = `${basePath}index.html`;
    }
}

// Global Nav Handler (Optional but useful for consistency)
document.addEventListener('DOMContentLoaded', () => {
    setupScrollTopButton();

    // Fix nav links to be relative based on depth
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
            // Convert root-absolute to relative
            link.setAttribute('href', basePath + href.substring(1));
        }
    });

    if (document.getElementById('articles-container')) {
        init();
    } else if (document.getElementById('article-content-wrapper')) {
        loadSingleArticle();
    } else if (document.getElementById('all-categories-grid')) {
        init().then(() => generateCategoriesPage());
    } else {
        // For other pages (About, Contact), we still want the dropdown
        init();
    }
});

/**
 * FEATURE: Categories Dropdown with Counts
 */

function getCategoryCounts() {
    const counts = {};
    allArticles.forEach(article => {
        counts[article.category] = (counts[article.category] || 0) + 1;
    });
    return counts;
}

function renderCategoryDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    if (!dropdown) return;

    const counts = getCategoryCounts();
    
    // Convert to array of [slug, count] and sort by count descending
    const sortedCategories = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length === 0) {
        dropdown.innerHTML = '<div style="padding: 10px 20px;">لا توجد تصنيفات</div>';
        return;
    }

    dropdown.innerHTML = sortedCategories.map(([slug, count]) => `
        <a href="${basePath}categories/${slug}.html" class="dropdown-item">
            <span>${CATEGORIES[slug] || slug}</span>
            <span class="count-badge">${count}</span>
        </a>
    `).join('');
}

function generateCategoriesPage() {
    const grid = document.getElementById('all-categories-grid');
    if (!grid) return;

    const counts = getCategoryCounts();
    
    const html = Object.keys(CATEGORIES).map(slug => {
        const count = counts[slug] || 0;
        const title = CATEGORIES[slug];
        const icon = CATEGORY_ICONS[slug] || '📁';
        const desc = CATEGORY_DESCRIPTIONS[slug] || '';

        return `
            <a href="${basePath}category.html?cat=${slug}" class="category-card category-card-link">
                <div class="category-icon">${icon}</div>
                <h3>${title}</h3>
                <p>${desc}</p>
                <span class="category-count">${count} مقالات</span>
            </a>
        `;
    }).join('');

    grid.innerHTML = html;
}

function setupScrollTopButton() {
    if (document.querySelector('.scroll-top-btn')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'scroll-top-btn';
    button.setAttribute('aria-label', 'العودة إلى الأعلى');
    button.textContent = '⌃';
    document.body.appendChild(button);

    const toggleButton = () => {
        button.classList.toggle('show', window.scrollY > 300);
    };

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', toggleButton, { passive: true });
    toggleButton();
}
