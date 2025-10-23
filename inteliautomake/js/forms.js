// Forms Management
const forms = {
    // Initialize forms
    init() {
        this.setupContactForm();
        this.setupCaptcha();
        this.setupFormValidation();
    },

    // Setup contact form
    setupContactForm() {
        const form = document.getElementById('contact-form');
        const closeBtn = document.querySelector('#contact-modal .close-modal');
        
        if (!form || !closeBtn) return;
        
        closeBtn.addEventListener('click', () => {
            ui.hideContactModal();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Disable form during submission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            submitBtn.classList.add('loading');
            
            const formData = new FormData(form);
            const captchaInput = document.getElementById('captcha-input');
            const captchaCode = document.getElementById('captcha-code').textContent;
            
            // Validate captcha
            if (captchaInput.value !== captchaCode) {
                document.querySelector('.captcha-error').style.display = 'block';
                document.querySelector('.captcha-error').textContent = 'Código incorrecto. Por favor, intenta nuevamente.';
                this.refreshCaptcha();
                
                // Re-enable form
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                submitBtn.classList.remove('loading');
                return;
            }

            // Validate form fields
            const errors = utils.validateForm(formData);
            
            if (errors.length > 0) {
                alert(errors.join('\n'));
                
                // Re-enable form
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                submitBtn.classList.remove('loading');
                return;
            }

            // Send form data
            try {
                const success = await utils.sendFormData(formData);
                
                if (success) {
                    // Track form submission (if analytics available)
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submission', {
                            'event_category': 'Contact',
                            'event_label': 'Contact Form'
                        });
                    }
                    
                    form.reset();
                    ui.hideContactModal();
                    ui.showThankYouModal();
                } else {
                    alert('Hubo un error al enviar el formulario. Por favor, intenta nuevamente.');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                alert('Hubo un error al enviar el formulario. Por favor, intenta nuevamente.');
            } finally {
                // Re-enable form
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                submitBtn.classList.remove('loading');
            }
        });
    },

    // Setup captcha
    setupCaptcha() {
        const refreshBtn = document.querySelector('.refresh-captcha');
        if (!refreshBtn) return;
        
        this.refreshCaptcha();
        
        refreshBtn.addEventListener('click', () => {
            this.refreshCaptcha();
        });
    },

    // Refresh captcha
    refreshCaptcha() {
        const captchaCode = document.getElementById('captcha-code');
        const captchaInput = document.getElementById('captcha-input');
        const captchaError = document.querySelector('.captcha-error');
        
        if (!captchaCode || !captchaInput || !captchaError) return;
        
        captchaCode.textContent = utils.generateCaptcha();
        captchaInput.value = '';
        captchaError.style.display = 'none';
    },
    
    // Setup real-time form validation
    setupFormValidation() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            // Validate on blur
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
            
            // Clear error on focus
            input.addEventListener('focus', () => {
                const errorElement = input.parentElement.querySelector('.input-error');
                if (errorElement) {
                    errorElement.remove();
                }
                input.classList.remove('error');
            });
        });
    },
    
    // Validate individual input
    validateInput(input) {
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error
        const existingError = input.parentElement.querySelector('.input-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Validate based on input type
        switch (input.id) {
            case 'name':
                if (input.value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'Por favor, ingresa un nombre válido';
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    errorMessage = 'Por favor, ingresa un email válido';
                }
                break;
                
            case 'phone':
                if (input.value.trim().length < 6) {
                    isValid = false;
                    errorMessage = 'Por favor, ingresa un número de teléfono válido';
                }
                break;
                
            case 'message':
                if (input.value.trim().length < 10) {
                    isValid = false;
                    errorMessage = 'Por favor, ingresa un mensaje más detallado';
                }
                break;
        }
        
        // Show error if invalid
        if (!isValid) {
            input.classList.add('error');
            
            const errorElement = document.createElement('p');
            errorElement.className = 'input-error';
            errorElement.style.color = 'rgb(239, 68, 68)';
            errorElement.style.fontSize = '0.75rem';
            errorElement.style.marginTop = '0.25rem';
            errorElement.textContent = errorMessage;
            
            input.parentElement.appendChild(errorElement);
        } else {
            input.classList.remove('error');
        }
        
        return isValid;
    }
};