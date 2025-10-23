// Initialize application with performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core components
    ui.init();
    forms.init();
    
    // Register service worker if supported
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
        });
    }
    
    // Performance metrics logging
    if (window.performance) {
        const perfData = window.performance.timing;
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
                
                // Track performance if analytics available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'timing_complete', {
                        'name': 'load',
                        'value': loadTime,
                        'event_category': 'Performance'
                    });
                }
            }, 0);
        });
    }
    
    // Setup video controls for hero section
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // Add play/pause button
        const videoContainer = document.querySelector('.video-container');
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'video-controls';
        controlsDiv.innerHTML = `
            <button class="video-control-btn" aria-label="Pausar video">
                <i data-lucide="pause" class="video-control-icon"></i>
            </button>
        `;
        videoContainer.appendChild(controlsDiv);
        
        // Initialize icon
        lucide.createIcons();
        
        // Setup control functionality
        const controlBtn = controlsDiv.querySelector('.video-control-btn');
        const controlIcon = controlBtn.querySelector('i');
        
        controlBtn.addEventListener('click', () => {
            if (heroVideo.paused) {
                heroVideo.play();
                controlIcon.setAttribute('data-lucide', 'pause');
                controlBtn.setAttribute('aria-label', 'Pausar video');
            } else {
                heroVideo.pause();
                controlIcon.setAttribute('data-lucide', 'play');
                controlBtn.setAttribute('aria-label', 'Reproducir video');
            }
            lucide.createIcons();
        });
    }
    
    // Setup musician CTA button animation
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        // Add hover effect
        ctaButton.addEventListener('mouseenter', () => {
            ctaButton.style.transform = 'scale(1.05) translateY(-2px)';
        });
        
        ctaButton.addEventListener('mouseleave', () => {
            ctaButton.style.transform = '';
        });
    }
});