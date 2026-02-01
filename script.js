document.addEventListener('DOMContentLoaded', () => {
    
    const html = document.documentElement;
    
    /* =========================================
       0. GLOBAL STATE & HELPERS
       ========================================= */
    let currentParticleColor = html.getAttribute('data-theme') === 'solar' ? '#2d3436' : '#00d2ff';
    
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

/* =========================================
       1. THEME SWITCHER LOGIC (WITH MEMORY)
       ========================================= */
    const themeBtn = document.getElementById('theme-btn');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    // 1. Check for saved theme in LocalStorage, or fallback to default
    const savedTheme = localStorage.getItem('portfolio_theme') || html.getAttribute('data-theme') || 'lunar';
    
    // 2. Apply the saved theme immediately
    html.setAttribute('data-theme', savedTheme);
    
    // 3. Update the global particle color variable based on the saved theme
    // (This ensures particles are the right color before they even start drawing)
    if (savedTheme === 'solar') {
        currentParticleColor = '#2c3e50'; // Use your Solar text color
    } else {
        currentParticleColor = '#00d2ff'; // Use your Lunar accent color
    }

    function setIconState(theme) {
        if (!themeIcon || !themeText) return; 
        themeIcon.className = '';
        if (theme === 'lunar') {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'LUNAR';
        } else {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'SOLAR';
        }
    }

    // Set the button icon to match the loaded theme
    setIconState(savedTheme);

    window.toggleTheme = function() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'solar' ? 'lunar' : 'solar';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio_theme', newTheme); // SAVE TO MEMORY
        
        setIconState(newTheme);
        
        // Update Particles Color
        currentParticleColor = newTheme === 'solar' ? '#2c3e50' : '#00d2ff';

        if (window.updateThreeMaterial) {
            window.updateThreeMaterial(newTheme);
        }
    };

    /* =========================================
       2. SCROLL REVEAL ANIMATION
       ========================================= */
    const observerOptions = { root: null, threshold: 0.15, rootMargin: "0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const reveals = entry.target.querySelectorAll('.scroll-reveal-left, .scroll-reveal-right');
                reveals.forEach(el => el.classList.add('active-reveal'));
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-section').forEach(section => {
        observer.observe(section);
    });

    /* =========================================
       3. TAB SWITCHER (FIXED FOR COMPATIBILITY)
       ========================================= */
    window.openTab = function(event, tabName) {
        // 1. Hide all content
        const contents = document.querySelectorAll('.tab-content');
        contents.forEach(content => content.classList.remove('active'));
        
        // 2. Deactivate all buttons
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // 3. Show target content
        const targetContent = document.getElementById(tabName);
        if(targetContent) targetContent.classList.add('active');
        
        // 4. Activate clicked button
        if(event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }
    };

 /* =========================================
       4. MOBILE MENU TOGGLE (UPDATED)
       ========================================= */
    window.toggleMobileMenu = function() {
        // FIX: Do not run this logic on Desktop (screens wider than 900px)
        if (window.innerWidth > 900) return;

        const navLinks = document.getElementById('nav-links');
        if (!navLinks) return;
        
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    };

    /* =========================================
       5. THREE.JS ORBITAL ANIMATION
       ========================================= */
    const container = document.getElementById('three-container');
    if (container) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
        container.appendChild(renderer.domElement);

        const orbitalGroup = new THREE.Group();
        scene.add(orbitalGroup);

        const coreGeometry = new THREE.IcosahedronGeometry(9, 1);
        const satGeometry = new THREE.SphereGeometry(1.5, 16, 16);

        const isSolar = html.getAttribute('data-theme') === 'solar';
        const initialColor = isSolar ? 0xd35400 : 0x00d2ff; 
        
        const coreMaterial = new THREE.MeshBasicMaterial({ 
            color: initialColor, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.8 
        });
        const satMaterial = new THREE.MeshBasicMaterial({ color: initialColor });

        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        const satellite = new THREE.Mesh(satGeometry, satMaterial);
        
        orbitalGroup.add(core);
        orbitalGroup.add(satellite);

                    window.updateThreeMaterial = function(theme) {
                // 0xdc2626 is the Hex code for the Red we just set
                // 0x00d2ff is the Cyan for Lunar mode
                const color = theme === 'solar' ? 0xdc2626 : 0x00d2ff; 
                
                core.material.color.setHex(color);
                satellite.material.color.setHex(color);
            };

        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) - 0.5;
            mouseY = (event.clientY / window.innerHeight) - 0.5;
        });

        function updateCameraPosition() {
            if(!container) return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            if (window.innerWidth > 900) {
                orbitalGroup.position.set(0, 0, 0);
                camera.position.z = 45; 
            } else {
                orbitalGroup.position.set(0, 0, 0);
                camera.position.z = 28; 
            }
        }

        updateCameraPosition();
        window.addEventListener('resize', debounce(updateCameraPosition, 100));

        let time = 0;
        const orbitRadius = 16;

        function animateThree() {
            requestAnimationFrame(animateThree);
            time += 0.005;
            core.rotation.y += 0.002;
            core.rotation.x += 0.001;
            orbitalGroup.rotation.x += (mouseY * 0.5 - orbitalGroup.rotation.x) * 0.05;
            orbitalGroup.rotation.y += (mouseX * 0.5 - orbitalGroup.rotation.y) * 0.05;
            satellite.position.x = Math.cos(time) * orbitRadius;
            satellite.position.y = Math.sin(time) * orbitRadius;
            satellite.position.z = Math.sin(time * 2) * 5;
            renderer.render(scene, camera);

            // In script.js, inside animateThree()

// Make the core pulse slightly (breathing effect)
const scale = 1 + Math.sin(time * 2) * 0.05;
core.scale.set(scale, scale, scale);

// Rotation - faster, more dynamic
core.rotation.y += 0.005; 
core.rotation.x += 0.002;

// Mouse Interaction - allow the user to "tilt" the aircraft/sphere
orbitalGroup.rotation.x += (mouseY * 1.0 - orbitalGroup.rotation.x) * 0.1; // Increased sensitivity
orbitalGroup.rotation.y += (mouseX * 1.0 - orbitalGroup.rotation.y) * 0.1;
        }
        animateThree();
    }

    /* =========================================
       6. PARTICLE BACKGROUND
       ========================================= */
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;
        let mouse = { x: null, y: null, radius: 100 };

        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        class Particle {
            constructor(x, y, directionX, directionY, size) {
                this.x = x; this.y = y; this.baseX = x; this.baseY = y;
                this.directionX = directionX; this.directionY = directionY;
                this.size = size; this.density = (Math.random() * 30) + 1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = currentParticleColor; 
                ctx.fill();
            }
            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx*dx + dy*dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let force = (mouse.radius - distance) / mouse.radius;
                
                if (distance < mouse.radius) {
                    this.x -= forceDirectionX * force * this.density;
                    this.y -= forceDirectionY * force * this.density;
                } else {
                    if (this.x !== this.baseX) this.x -= (this.x - this.baseX)/10;
                    if (this.y !== this.baseY) this.y -= (this.y - this.baseY)/10;
                }
                this.draw();
            }
        }

        function initParticles() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particlesArray = [];
            const calculatedParticles = (canvas.height * canvas.width) / 10000;
            const numberOfParticles = Math.min(calculatedParticles, 80); 

            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1; 
                let x = Math.random() * (innerWidth - size * 2) + size * 2;
                let y = Math.random() * (innerHeight - size * 2) + size * 2;
                let directionX = (Math.random() * 0.4) - 0.2; 
                let directionY = (Math.random() * 0.4) - 0.2;
                particlesArray.push(new Particle(x, y, directionX, directionY, size));
            }
        }

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }

        window.addEventListener('resize', debounce(initParticles, 200));
        initParticles();
        animateParticles();
    }

    /* =========================================
       7. FOOTER YEAR UPDATE
       ========================================= */
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});

const contactForm = document.querySelector('.contact-form');
if(contactForm) {
    contactForm.addEventListener('submit', (e) => {
        // e.preventDefault(); // Uncomment if handling via AJAX
        const btn = contactForm.querySelector('.btn-submit');
        const originalText = btn.textContent;
        
        btn.textContent = 'Transmitting...';
        btn.style.opacity = '0.7';
        
        // Simulate delay or wait for response
        setTimeout(() => {
            btn.textContent = 'Message Sent ✓';
            btn.style.background = 'var(--accent-primary)';
            btn.style.color = 'var(--bg-core)';
        }, 1500);
    });
}