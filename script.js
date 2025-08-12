// SAGE Landing Page JavaScript

// Floating navigation scroll effect
window.addEventListener('scroll', function() {
    const floatingNav = document.getElementById('floatingNav');
    if (window.scrollY > window.innerHeight * 0.3) {
        floatingNav.classList.add('visible');
    } else {
        floatingNav.classList.remove('visible');
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe feature cards and other elements
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.feature-card, .step-card, .section-animate').forEach(el => {
        // Set initial animation state
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
        
        // Check if element is already in viewport
        const rect = el.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInViewport) {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.classList.add('visible');
            }, 100);
        }
    });
});

// Add some interactive effects
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.02)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Enhanced dynamic background effects
function createStreamingData() {
    const hero = document.querySelector('.hero');
    const dataNodesContainer = document.querySelector('.data-nodes');
    
    // Create additional flowing data particles
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'data-node';
            particle.style.cssText = `
                top: ${Math.random() * 100}%;
                left: -10px;
                background: ${['rgba(59, 130, 246, 0.8)', 'rgba(147, 51, 234, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)'][Math.floor(Math.random() * 4)]};
                animation-duration: ${8 + Math.random() * 4}s;
                animation-delay: ${Math.random() * 2}s;
            `;
            dataNodesContainer.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 12000);
        }, i * 300);
    }
}

// Create starfield
function createStarfield() {
    const starfield = document.querySelector('.starfield');
    
    // Create 150 stars
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 3}s;
        `;
        starfield.appendChild(star);
    }
}

// Create floating data labels with boxes
function createDataLabels() {
    const labels = [
        { text: 'RAG', class: '' },
        { text: 'Vector DB', class: 'purple' },
        { text: 'Streaming', class: 'green' },
        { text: 'AI Agent', class: 'orange' },
        { text: 'ML Pipeline', class: '' },
        { text: 'DataFlow', class: 'purple' },
        { text: 'MCP', class: 'green' },
        { text: 'Multi Agent', class: 'orange' },
        { text: 'Online Learning', class: '' },
        { text: 'Streaming Benchmark', class: 'purple' },
        { text: 'Embodied Intelligence', class: 'green' },
        { text: 'Neural Memory', class: 'orange' },
        { text: 'Real-time Analytics', class: '' },
        { text: 'Distributed Computing', class: 'purple' }
    ];
    const hero = document.querySelector('.hero');
    
    labels.forEach((label, index) => {
        setTimeout(() => {
            const labelEl = document.createElement('div');
            labelEl.textContent = label.text;
            labelEl.className = `data-label ${label.class}`;
            labelEl.style.cssText = `
                top: ${20 + Math.random() * 60}%;
                left: -200px;
                animation-delay: ${Math.random() * 3}s;
            `;
            hero.appendChild(labelEl);
            
            setTimeout(() => {
                if (labelEl.parentNode) {
                    labelEl.parentNode.removeChild(labelEl);
                }
            }, 15000);
        }, index * 2000);
    });
}

// Start all animations
createStarfield();
createStreamingData();
setInterval(createStreamingData, 10000);

createDataLabels();
setInterval(createDataLabels, 25000);

// Mouse move parallax effect
document.addEventListener('mousemove', function(e) {
    const hero = document.querySelector('.hero');
    const nodes = document.querySelectorAll('.data-node');
    const stars = document.querySelectorAll('.star');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    nodes.forEach((node, index) => {
        const speed = (index % 3 + 1) * 0.5;
        const x = (mouseX - 0.5) * speed * 20;
        const y = (mouseY - 0.5) * speed * 20;
        node.style.transform += ` translate(${x}px, ${y}px)`;
    });
    
    // Add subtle parallax to stars
    stars.forEach((star, index) => {
        if (index % 10 === 0) { // Only affect every 10th star for performance
            const speed = 0.1;
            const x = (mouseX - 0.5) * speed * 10;
            const y = (mouseY - 0.5) * speed * 10;
            star.style.transform = `translate(${x}px, ${y}px)`;
        }
    });
});

// Parallax effect for hero section (reduced intensity)
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});
