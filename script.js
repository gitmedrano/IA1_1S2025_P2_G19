document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const spans = hamburger.querySelectorAll('span');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        spans.forEach(span => {
            span.classList.toggle('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            spans.forEach(span => span.classList.remove('active'));
        }
    });
}); 