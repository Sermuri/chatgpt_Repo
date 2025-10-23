// Utility functions
const utils = {
    // Update mouse position for background effect
    updateMousePosition(e) {
        const root = document.documentElement;
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        
        root.style.setProperty('--mouse-x', `${x}%`);
        root.style.setProperty('--mouse-y', `${y}%`);
    },
    
    // Generate random captcha code
    generateCaptcha() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    },
    
    // Format media content based on type
    formatMediaContent(media) {
        switch (media.type) {
            case 'youtube':
                return `
                    <div class="aspect-video rounded-lg overflow-hidden">
                        <iframe 
                            src="${media.url.replace('youtu.be/', 'youtube.com/embed/')}" 
                            title="YouTube video player" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            class="w-full h-full"
                        ></iframe>
                    </div>
                `;
                
            case 'soundcloud':
                return `
                    <div class="aspect-video rounded-lg overflow-hidden">
                        <iframe 
                            src="https://w.soundcloud.com/player/?url=${encodeURIComponent(media.url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true" 
                            title="SoundCloud player" 
                            frameborder="0" 
                            allowfullscreen
                            class="w-full h-full"
                        ></iframe>
                    </div>
                `;
                
            case 'carousel':
                return `
                    <div class="carousel-container relative rounded-lg overflow-hidden">
                        <div class="carousel-slides">
                            ${Array.from({ length: media.totalImages }, (_, i) => 
                                `<img 
                                    src="/imag/imagen${i + 1}.jpeg" 
                                    alt="Generated Image ${i + 1}" 
                                    class="carousel-slide w-full aspect-video object-cover"
                                    loading="lazy"
                                />`
                            ).join('')}
                        </div>
                        <button class="carousel-prev" aria-label="Previous image">
                            <i data-lucide="chevron-left"></i>
                        </button>
                        <button class="carousel-next" aria-label="Next image">
                            <i data-lucide="chevron-right"></i>
                        </button>
                        <div class="carousel-dots">
                            ${Array.from({ length: media.totalImages }, (_, i) => 
                                `<button 
                                    class="carousel-dot ${i === 0 ? 'active' : ''}" 
                                    data-index="${i}"
                                    aria-label="Go to image ${i + 1}"
                                ></button>`
                            ).join('')}
                        </div>
                    </div>
                    <script>
                        (() => {
                            const container = document.querySelector('.carousel-container');
                            if (!container) return;
                            
                            const slides = container.querySelectorAll('.carousel-slide');
                            const dots = container.querySelectorAll('.carousel-dot');
                            const prevBtn = container.querySelector('.carousel-prev');
                            const nextBtn = container.querySelector('.carousel-next');
                            
                            let currentIndex = 0;
                            
                            const showSlide = (index) => {
                                slides.forEach((slide, i) => {
                                    slide.style.display = i === index ? 'block' : 'none';
                                });
                                
                                dots.forEach((dot, i) => {
                                    dot.classList.toggle('active', i === index);
                                });
                                
                                currentIndex = index;
                            };
                            
                            // Initialize
                            showSlide(0);
                            
                            // Event listeners
                            prevBtn.addEventListener('click', () => {
                                const newIndex = (currentIndex - 1 + slides.length) % slides.length;
                                showSlide(newIndex);
                            });
                            
                            nextBtn.addEventListener('click', () => {
                                const newIndex = (currentIndex + 1) % slides.length;
                                showSlide(newIndex);
                            });
                            
                            dots.forEach((dot, i) => {
                                dot.addEventListener('click', () => {
                                    showSlide(i);
                                });
                            });
                            
                            // Auto-advance
                            let interval = setInterval(() => {
                                const newIndex = (currentIndex + 1) % slides.length;
                                showSlide(newIndex);
                            }, 5000);
                            
                            // Pause on hover
                            container.addEventListener('mouseenter', () => {
                                clearInterval(interval);
                            });
                            
                            container.addEventListener('mouseleave', () => {
                                interval = setInterval(() => {
                                    const newIndex = (currentIndex + 1) % slides.length;
                                    showSlide(newIndex);
                                }, 5000);
                            });
                            
                            // Add keyboard navigation
                            container.setAttribute('tabindex', '0');
                            container.addEventListener('keydown', (e) => {
                                if (e.key === 'ArrowLeft') {
                                    const newIndex = (currentIndex - 1 + slides.length) % slides.length;
                                    showSlide(newIndex);
                                } else if (e.key === 'ArrowRight') {
                                    const newIndex = (currentIndex + 1) % slides.length;
                                    showSlide(newIndex);
                                }
                            });
                            
                            // Create icons
                            lucide.createIcons();
                        })();
                    </script>
                `;
                
            default:
                return '';
        }
    },
    
    // Validate form data
    validateForm(formData) {
        const errors = [];
        
        // Validate name
        const name = formData.get('name');
        if (!name || name.trim().length < 2) {
            errors.push('Por favor, ingresa un nombre válido');
        }
        
        // Validate email
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.push('Por favor, ingresa un email válido');
        }
        
        // Validate phone
        const phone = formData.get('phone');
        if (!phone || phone.trim().length < 6) {
            errors.push('Por favor, ingresa un número de teléfono válido');
        }
        
        // Validate message
        const message = formData.get('message');
        if (!message || message.trim().length < 10) {
            errors.push('Por favor, ingresa un mensaje más detallado');
        }
        
        return errors;
    },

    // Send form data to webhook with error handling and retry
    async sendFormData(formData) {
        const maxRetries = 2;
        let retryCount = 0;
        
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            source: 'website_contact_form'
        };
        
        const sendRequest = async () => {
            try {
                const response = await fetch('https://hook.us2.make.com/uc9ewbmuv5337dmvytm9p81o9rz5ajd2', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                return true;
            } catch (error) {
                console.error('Error submitting form:', error);
                
                if (retryCount < maxRetries) {
                    retryCount++;
                    // Exponential backoff
                    const delay = 1000 * Math.pow(2, retryCount);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return sendRequest();
                }
                
                return false;
            }
        };
        
        return sendRequest();
    },
    
    // Debounce function for performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Lazy load images
    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                        }
                        
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            });
        }
    },
    
    // Add smooth scroll for anchor links
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Close mobile menu if open
                    const mobileMenu = document.querySelector('.mobile-menu');
                    if (mobileMenu && mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                        const menuBtn = document.querySelector('.mobile-menu-btn i');
                        if (menuBtn) {
                            menuBtn.setAttribute('data-lucide', 'menu');
                            lucide.createIcons();
                        }
                    }
                    
                    // Smooth scroll to target
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
};