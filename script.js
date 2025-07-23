// Complete script.js
function selectAll(groupName) { document.querySelectorAll(`input[name="${groupName}"]`).forEach(cb => cb.checked = true); }
function clearAll(groupName) { document.querySelectorAll(`input[name="${groupName}"]`).forEach(cb => cb.checked = false); }

const translations = {
    en: {
        title: "✨ ContentPromptPro", subtitle: "AI Social Media Content Generator", progress_question: "Question", progress_of: "of", submit: "Generate Content Plan", yes: "Yes", no: "No", select_option: "Select an option...", error_required: "This field is required.", error_invalid_email: "Please enter a valid email address.",
        final_message_h2: "Thank You!", final_message_p: "Your submission has been received.",
        step0_h2: "Welcome!", step0_p_login: "Please log in to continue.", login: "Login", register_prompt: "Don't have an account? Register Here", forgot_password: "Forgot Password?", step0_email_label: "Email", step0_password_label: "Password",
        auth_fail: "Invalid email or password.",
        // ... all other text translations are needed here for the app to work fully.
    },
    es: { /* All Spanish translations */ }
};

class MultiStepForm {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 40;
        this.formData = {};
        this.proxyUrl = ''; // This will be set in init()
        this.currentLang = 'en';
        this.init();
    }

    init() {
        // IMPORTANT: Set your deployed proxy URL here.
        // this.proxyUrl = 'https://your-app-name.onrender.com';
        this.bindEvents();
        this.applyLanguage(this.currentLang);
        this.showView('step0');
    }

    bindEvents() {
        document.getElementById('authBtn').addEventListener('click', () => this.handleAuth());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.previousStep());
        document.getElementById('multiStepForm').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('languageSelect').addEventListener('change', (e) => this.applyLanguage(e.target.value));
    }

    showView(viewId) {
        document.querySelectorAll('.auth-view, .step').forEach(v => v.classList.remove('active'));
        const view = document.getElementById(viewId);
        if (view) view.classList.add('active');

        const isAuthView = viewId === 'step0';
        document.querySelector('.progress-container').classList.toggle('d-none', isAuthView);
        document.querySelector('.form-navigation').classList.toggle('d-none', isAuthView);

        if (!isAuthView) {
            this.updateProgressBar();
            this.updateNavigation();
        }
    }
            
    async handleAuth() {
        const authBtn = document.getElementById('authBtn');
        const authError = document.getElementById('authError');
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            authError.textContent = translations[this.currentLang].error_required;
            authError.style.display = 'block';
            return;
        }

        authError.style.display = 'none';
        authBtn.disabled = true;
                
        try {
            const response = await fetch(`${this.proxyUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Authentication failed');
            }
                    
            await this.loadPreviousData(email);
            this.currentStep = 1;
            this.showView(`step${this.currentStep}`);

        } catch (error) {
            authError.textContent = error.message;
            authError.style.display = 'block';
        } finally {
            authBtn.disabled = false;
        }
    }

    async loadPreviousData(email) {
        try {
            const response = await fetch(`${this.proxyUrl}/api/get-contact-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (!response.ok) throw new Error('Could not load user data.');
            const data = await response.json();
            this.formData = { ...this.formData, ...data };
            this.restoreAllFormData();
        } catch (error) {
            console.error("Failed to load previous data:", error);
        }
    }

    restoreAllFormData() {
        document.querySelectorAll('#multiStepForm input, #multiStepForm textarea, #multiStepForm select').forEach(input => {
            const name = input.name;
            if (this.formData[name] !== undefined) {
                if (input.type === 'checkbox') {
                    input.checked = Array.isArray(this.formData[name]) ? this.formData[name].includes(input.value) : this.formData[name] === input.value;
                } else if (input.type === 'radio') {
                    input.checked = (this.formData[name] === input.value);
                } else {
                    input.value = this.formData[name];
                }
            }
        });
    }

    applyLanguage(lang) {
        this.currentLang = lang;
        const langData = translations[lang];
        if (!langData) return;
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (langData[key]) el.textContent = langData[key];
        });
        document.getElementById('authBtn').textContent = langData.login;
    }
            
    // ... all other class methods (nextStep, previousStep, etc.) are needed here ...
}

document.addEventListener('DOMContentLoaded', () => { new MultiStepForm(); });