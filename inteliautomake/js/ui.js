// UI Management
const ui = {
    // Initialize UI components
    init() {
        this.initializeIcons();
        this.setupEventListeners();
        this.renderServices();
        this.renderProjects();
        this.renderWordCloud();
        this.updateCopyright();
        this.setupHeaderScroll();
        utils.lazyLoadImages();
        utils.setupSmoothScroll();
    },

    // Initialize Lucide icons
    initializeIcons() {
        lucide.createIcons();
    },

    // Setup event listeners
    setupEventListeners() {
        // Mobile menu
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                const isActive = mobileMenu.classList.toggle('active');
                menuBtn.setAttribute('aria-expanded', isActive);
                
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 
                        isActive ? 'x' : 'menu'
                    );
                    lucide.createIcons();
                }
            });
        }

        // Contact modal triggers
        document.querySelectorAll('.contact-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.showContactModal();
            });
        });

        // Mouse movement for background effect (throttled)
        document.addEventListener('mousemove', utils.updateMousePosition);
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => {
                if (e.target === modal) {
                    if (modal.id === 'contact-modal') {
                        this.hideContactModal();
                    } else if (modal.id === 'thank-you-modal') {
                        modal.classList.remove('active');
                    } else {
                        modal.remove();
                    }
                }
            });
        });
        
        // Handle escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.active');
                modals.forEach(modal => {
                    if (modal.id === 'contact-modal') {
                        this.hideContactModal();
                    } else if (modal.id === 'thank-you-modal') {
                        modal.classList.remove('active');
                    } else {
                        modal.remove();
                    }
                });
            }
        });
    },
    
    // Setup header scroll behavior
    setupHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            } else {
                header.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            }
        };
        
        window.addEventListener('scroll', utils.debounce(handleScroll, 100));
        handleScroll(); // Initial call
    },

    // Render services section
    renderServices() {
        const servicesGrid = document.getElementById('services-grid');
        if (!servicesGrid) return;
        
        services.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card';
            serviceCard.innerHTML = `
                <i data-lucide="${service.icon}" class="card-icon w-12 h-12"></i>
                <h3 class="card-title">${service.title}</h3>
                <p class="card-description">${service.description}</p>
                <button class="expand-btn" data-service="${service.title}" aria-label="Ver más sobre ${service.title}">
                    <i data-lucide="maximize-2" class="w-4 h-4"></i>
                    Ampliar
                </button>
            `;
            
            servicesGrid.appendChild(serviceCard);
        });

        // Setup expand buttons
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const service = services.find(s => s.title === btn.dataset.service);
                this.showExpandedContent('service', service);
            });
        });

        lucide.createIcons();
    },

    // Render projects section
    renderProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;
        
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <i data-lucide="${project.icon}" class="card-icon w-8 h-8"></i>
                <h3 class="card-title">${project.title}</h3>
                <p class="card-description">${project.description}</p>
                <button class="expand-btn" data-project="${project.title}" aria-label="Ver más sobre ${project.title}">
                    <i data-lucide="maximize-2" class="w-4 h-4"></i>
                    Ampliar
                </button>
            `;
            
            projectsGrid.appendChild(projectCard);
        });

        // Setup expand buttons
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const project = projects.find(p => p.title === btn.dataset.project);
                this.showExpandedContent('project', project);
            });
        });

        lucide.createIcons();
    },

    // Show expanded content modal
    showExpandedContent(type, content) {
        if (!content) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `${type}-modal-title`);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="flex items-center gap-4">
                        <i data-lucide="${content.icon}" class="w-8 h-8 text-primary"></i>
                        <h3 id="${type}-modal-title" class="text-2xl font-bold">${content.title}</h3>
                    </div>
                    <button class="close-modal" aria-label="Cerrar">
                        <i data-lucide="arrow-left"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="prose prose-invert max-w-none">
                        <p class="text-lg whitespace-pre-line mb-4">${content.fullDescription}</p>
                    </div>
                    ${content.media ? utils.formatMediaContent(content.media) : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        lucide.createIcons();

        // Trap focus within modal for accessibility
        this.trapFocus(modal);

        // Close button handler
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    // Show contact modal
    showContactModal() {
        const contactModal = document.getElementById('contact-modal');
        if (contactModal) {
            contactModal.classList.add('active');
            contactModal.setAttribute('aria-hidden', 'false');
            
            // Focus first input for accessibility
            setTimeout(() => {
                const firstInput = contactModal.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
            
            // Trap focus within modal
            this.trapFocus(contactModal);
        }
    },

    // Hide contact modal
    hideContactModal() {
        const contactModal = document.getElementById('contact-modal');
        if (contactModal) {
            contactModal.classList.remove('active');
            contactModal.setAttribute('aria-hidden', 'true');
        }
    },

    // Show thank you modal
    showThankYouModal() {
        const thankYouModal = document.getElementById('thank-you-modal');
        if (thankYouModal) {
            thankYouModal.classList.add('active');
            thankYouModal.setAttribute('aria-hidden', 'false');
            
            setTimeout(() => {
                thankYouModal.classList.remove('active');
                thankYouModal.setAttribute('aria-hidden', 'true');
            }, 3000);
        }
    },

    // Render word cloud
    renderWordCloud() {
        const wordCloud = document.getElementById('word-cloud');
        if (!wordCloud) return;
        
        const items = [...services, ...projects];
        const usedWords = new Set();
        
        items.forEach((item, index) => {
            // Extract first meaningful word from title
            const words = item.title.split(' ');
            let word = words[0];
            
            // Skip common words and ensure uniqueness
            if (word.toLowerCase() === 'de' || word.toLowerCase() === 'para' || word.toLowerCase() === 'con') {
                word = words[1] || words[0];
            }
            
            if (usedWords.has(word)) return;
            usedWords.add(word);
            
            const tag = document.createElement('span');
            tag.className = `cloud-tag cloud-tag-${(index % 3) + 1}`;
            tag.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
            tag.textContent = word;
            
            wordCloud.appendChild(tag);
        });
    },

    // Update copyright year
    updateCopyright() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    },
    
    // Trap focus within modal for accessibility
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
};