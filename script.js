/**
 * Portfolio Script - Handles section loading, modals, and games
 */

// ============================================
// CONFIGURATION
// ============================================
const RESUME_PDF_PATH = "Kartikey_Rai_Resume.pdf";  // CHANGE THIS to your PDF path

// ============================================
// SECTION LOADING - Load both Projects & Games together
// ============================================

/**
 * Loads both Projects and Games sections together on the same page
 */
async function loadAllSections() {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) return;
    
    // Show loader
    mainContent.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
    
    try {
        // Fetch both sections simultaneously
        const [projectsHtml, gamesHtml] = await Promise.all([
            fetch('sections/projects.html').then(response => {
                if (!response.ok) throw new Error('Projects section not found');
                return response.text();
            }),
            fetch('sections/games.html').then(response => {
                if (!response.ok) throw new Error('Games section not found');
                return response.text();
            })
        ]);
        
        // Combine both sections on the same page
        mainContent.innerHTML = projectsHtml + gamesHtml;
        
        // Update active state in navigation
        document.querySelectorAll('.nav li a[data-page]').forEach(link => {
            link.style.backgroundColor = '';
        });
        
    } catch (error) {
        console.error('Error loading sections:', error);
        mainContent.innerHTML = `
            <div class="loader-container">
                <div style="text-align: center; color: #ff6b6b; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                    <p>Error loading content. Please refresh the page.</p>
                    <p style="font-size: 14px; margin-top: 10px;">${error.message}</p>
                </div>
            </div>
        `;
    }
}

/**
 * Loads the documentation modal content
 */
async function loadDocsContent() {
    const docsBody = document.getElementById('docsBody');
    if (!docsBody) return;
    
    docsBody.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
    
    try {
        const response = await fetch('sections/docs.html');
        if (!response.ok) throw new Error('Docs section not found');
        const html = await response.text();
        docsBody.innerHTML = html;
    } catch (error) {
        console.error('Error loading docs:', error);
        docsBody.innerHTML = `
            <div class="docs-placeholder">
                <i class="fas fa-code-branch"></i>
                <h3>📚 Project Documentation</h3>
                <p>Complete documentation for all projects including:</p>
                <ul style="text-align: left; margin: 20px auto; max-width: 300px; color: #ccc;">
                    <li>📖 ITIL Ticketing System User Guide</li>
                    <li>🎓 College Recommendation System Manual</li>
                    <li>🔧 Installation & Setup Instructions</li>
                    <li>🐛 Troubleshooting Guide</li>
                </ul>
                <div class="coming-soon">
                    <i class="fas fa-clock"></i> Coming Soon
                </div>
                <p style="margin-top: 20px; font-size: 0.9rem; color: #888;">
                    Documentation is being prepared. Contact me for immediate assistance.
                </p>
            </div>
        `;
    }
}

// ============================================
// GAME MODAL
// ============================================

/**
 * Loads and displays a game in the modal
 * @param {string} gameId - ID of the game to load (e.g., 'personality-quiz')
 */
window.loadGame = async function(gameId) {
    const modal = document.getElementById('gameModal');
    const modalBody = document.getElementById('gameModalBody');
    const closeBtn = document.getElementById('closeGameBtn');
    
    if (!modal || !modalBody) {
        console.error('Modal elements not found');
        return;
    }
    
    // Show loader
    modalBody.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    try {
        const response = await fetch(`games/${gameId}/game.html`);
        if (!response.ok) throw new Error(`Game not found at games/${gameId}/game.html`);
        const html = await response.text();
        modalBody.innerHTML = html;
        
        // Load game CSS
        const existingCss = document.querySelector(`link[href="games/${gameId}/game.css"]`);
        if (!existingCss) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `games/${gameId}/game.css`;
            document.head.appendChild(link);
        }
        
        // Remove existing game script to avoid duplicates
        const existingScript = document.querySelector(`script[src="games/${gameId}/game.js"]`);
        if (existingScript) {
            existingScript.remove();
        }
        
        // Load game JavaScript
        const script = document.createElement('script');
        script.src = `games/${gameId}/game.js`;
        document.body.appendChild(script);
        
    } catch (error) {
        console.error('Error loading game:', error);
        modalBody.innerHTML = `
            <div style="text-align: center; color: #ff6b6b; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                <p>Error loading game: ${error.message}</p>
            </div>
        `;
    }
    
    // Close button handler
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };
    }
    
    // Click outside to close
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };
};

// ============================================
// RESUME MODAL
// ============================================

/**
 * Opens the resume modal and loads the PDF
 */
function openResumeModal(e) {
    if (e) e.preventDefault();
    
    const resumeModal = document.getElementById('resumeModal');
    const pdfEmbed = document.getElementById('pdfEmbed');
    
    if (!resumeModal || !pdfEmbed) return;
    
    pdfEmbed.src = RESUME_PDF_PATH;
    resumeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the resume modal
 */
function closeResumeModal() {
    const resumeModal = document.getElementById('resumeModal');
    const pdfEmbed = document.getElementById('pdfEmbed');
    
    if (resumeModal) resumeModal.classList.remove('active');
    document.body.style.overflow = '';
    
    if (pdfEmbed) {
        setTimeout(() => { pdfEmbed.src = ''; }, 300);
    }
}

/**
 * Downloads the resume PDF
 */
function downloadResume() {
    const link = document.createElement('a');
    link.href = RESUME_PDF_PATH;
    link.download = 'Kartikey_Rai_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// CONTACT & DOCS MODALS
// ============================================

/**
 * Opens the contact modal
 */
function openContactModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Closes the contact modal
 */
function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Opens the documentation modal
 */
async function openDocsModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('docsModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        await loadDocsContent();
    }
}

/**
 * Closes the documentation modal
 */
function closeDocsModal() {
    const modal = document.getElementById('docsModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// CONTACT FORM SUBMISSION
// ============================================

/**
 * Sets up the contact form submission
 */
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('userName')?.value || '';
        const email = document.getElementById('userEmail')?.value || '';
        const message = document.getElementById('userMessage')?.value || '';
        
        try {
            const response = await fetch('https://formsubmit.co/ajax/kartikeynrai@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message,
                    _subject: `Portfolio Contact from ${name}`,
                    _template: 'table',
                    _captcha: 'false'
                })
            });
            
            if (response.ok && formSuccess) {
                formSuccess.style.display = 'block';
                contactForm.reset();
                setTimeout(() => {
                    formSuccess.style.display = 'none';
                    closeContactModal();
                }, 3000);
            } else {
                alert('Failed to send message. Please email me directly.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending message. Please email me directly.');
        }
    });
}

// ============================================
// ENHANCED SMOOTH SCROLLING
// ============================================

/**
 * Enhanced smooth scrolling with longer duration
 * @param {HTMLElement} element - Target element to scroll to
 * @param {number} offset - Offset from top (default: 70px for header)
 * @param {number} duration - Scroll duration in milliseconds (default: 1000ms)
 */
function smoothScrollTo(element, offset = 70, duration = 1000) {
    if (!element) return;
    
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function for smooth deceleration
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, startPosition + distance * easeOutCubic);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

/**
 * Sets up smooth scrolling when clicking on PROJECTS or GAMES links
 */
function setupSmoothScroll() {
    // Get all navigation links that point to sections
    const projectsLink = document.querySelector('.nav li a[href="#projects"]');
    const gamesLink = document.querySelector('.nav li a[href="#games"]');
    
    if (projectsLink) {
        projectsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const projectsSection = document.querySelector('.projects-section');
            if (projectsSection) {
                // Use enhanced smooth scroll with longer duration
                smoothScrollTo(projectsSection, 70, 1200);
            }
            // Close mobile menu
            const navList = document.getElementById('navList');
            if (navList && window.innerWidth <= 750) {
                navList.classList.remove('showing');
            }
        });
    }
    
    if (gamesLink) {
        gamesLink.addEventListener('click', (e) => {
            e.preventDefault();
            const gamesSection = document.querySelector('.games-section');
            if (gamesSection) {
                // Use enhanced smooth scroll with longer duration
                smoothScrollTo(gamesSection, 70, 1200);
            }
            // Close mobile menu
            const navList = document.getElementById('navList');
            if (navList && window.innerWidth <= 750) {
                navList.classList.remove('showing');
            }
        });
    }
}

/**
 * Adds scroll event listener for active section highlighting
 */
function setupScrollSpy() {
    const sections = document.querySelectorAll('.projects-section, .games-section');
    const navLinks = document.querySelectorAll('.nav li a');
    
    if (sections.length === 0) return;
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                if (section.classList.contains('projects-section')) {
                    current = '#projects';
                } else if (section.classList.contains('games-section')) {
                    current = '#games';
                }
            }
        });
        
        navLinks.forEach(link => {
            link.style.backgroundColor = '';
            if (link.getAttribute('href') === current) {
                link.style.backgroundColor = '#4169E1';
            }
        });
    });
}

// ============================================
// NAVIGATION & MOBILE MENU
// ============================================

/**
 * Sets up mobile menu toggle
 */
function setupMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuBtn');
    const navList = document.getElementById('navList');
    
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('showing');
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize everything when DOM is ready
 */
$(document).ready(function() {
    // Load both Projects and Games together
    loadAllSections();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup smooth scrolling with delay to ensure sections are loaded
    setTimeout(() => {
        setupSmoothScroll();
        setupScrollSpy();
    }, 500);
    
    // Setup modals
    const resumeLink = document.getElementById('resumeNavLink');
    const closeResumeBtn = document.getElementById('closeResumeBtn');
    const downloadResumeBtn = document.getElementById('downloadResumeBtn');
    const contactLink = document.getElementById('contactLink');
    const footerContactLink = document.getElementById('footerContactLink');
    const docsLink = document.getElementById('docsLink');
    const closeContactBtn = document.getElementById('closeContactModal');
    const closeDocsBtn = document.getElementById('closeDocsModal');
    
    if (resumeLink) resumeLink.addEventListener('click', openResumeModal);
    if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResumeModal);
    if (downloadResumeBtn) downloadResumeBtn.addEventListener('click', downloadResume);
    if (contactLink) contactLink.addEventListener('click', openContactModal);
    if (footerContactLink) footerContactLink.addEventListener('click', openContactModal);
    if (docsLink) docsLink.addEventListener('click', openDocsModal);
    if (closeContactBtn) closeContactBtn.addEventListener('click', closeContactModal);
    if (closeDocsBtn) closeDocsBtn.addEventListener('click', closeDocsModal);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const contactModal = document.getElementById('contactModal');
        const docsModal = document.getElementById('docsModal');
        const resumeModal = document.getElementById('resumeModal');
        
        if (e.target === contactModal) closeContactModal();
        if (e.target === docsModal) closeDocsModal();
        if (e.target === resumeModal) closeResumeModal();
    });
    
    // Handle hash links for scrolling
    if (window.location.hash) {
        setTimeout(() => {
            const hash = window.location.hash;
            const element = document.querySelector(hash);
            if (element) {
                smoothScrollTo(element, 70, 1000);
            }
        }, 600);
    }
    
    // Setup contact form
    setupContactForm();
    
    console.log('✅ Portfolio initialized!');
    console.log('🐉 Chinese dragons are now moving across the header!');
    console.log('📄 Projects and Games loaded together with smooth scrolling');
});