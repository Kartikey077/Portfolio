// Page loader for dynamic content
async function loadPage(pageName) {
    const mainContent = document.getElementById('main-content');
    
    // Show loader
    mainContent.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
    
    try {
        const response = await fetch(`sections/${pageName}.html`);
        if (!response.ok) throw new Error('Page not found');
        const html = await response.text();
        mainContent.innerHTML = html;
        
        // Update active nav
        document.querySelectorAll('.nav li a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });
        
        // Update URL
        history.pushState({ page: pageName }, '', `#${pageName}`);
        
    } catch (error) {
        console.error('Error loading page:', error);
        mainContent.innerHTML = `
            <div class="loader-container">
                <div style="text-align: center; color: #ff6b6b;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                    <p>Error loading page. Please refresh.</p>
                </div>
            </div>
        `;
    }
}



// Navigation setup
document.addEventListener('DOMContentLoaded', () => {
    // Load initial page based on URL hash
    const hash = window.location.hash.substring(1);
    const validPages = ['home', 'projects', 'games'];
    const initialPage = hash && validPages.includes(hash) ? hash : 'home';
    loadPage(initialPage);
    
    // Handle navigation clicks
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            loadPage(page);
            
            // Close mobile menu if open
            if (window.innerWidth <= 750) {
                document.getElementById('navList')?.classList.remove('showing');
            }
        });
    });
    
    // Handle nav buttons (from home page)
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-nav]')) {
            e.preventDefault();
            const page = e.target.closest('[data-nav]').getAttribute('data-nav');
            loadPage(page);
        }
    });
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('mobileMenuBtn');
    const navList = document.getElementById('navList');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('showing');
        });
    }
    
    // Modal close
    const closeBtn = document.getElementById('closeGameBtn');
    const modal = document.getElementById('gameModal');
    
    closeBtn?.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            loadPage(event.state.page);
        }
    });
});