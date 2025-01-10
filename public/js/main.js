// Main JavaScript file for the website
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize any interactive components
    initComponents();
});

function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    // Handle scroll behavior
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
    
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.querySelector('.nav-menu').classList.toggle('active');
        });
    }
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => observer.observe(element));
}

function initComponents() {
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(initTooltip);
    
    // Initialize modals
    const modals = document.querySelectorAll('[data-modal]');
    modals.forEach(initModal);
}

// Utility functions
function initTooltip(element) {
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
}

function initModal(element) {
    const modalId = element.dataset.modal;
    const modal = document.getElementById(modalId);
    
    element.addEventListener('click', () => {
        modal.classList.add('active');
    });
    
    modal.querySelector('.close-btn')?.addEventListener('click', () => {
        modal.classList.remove('active');
    });
} 