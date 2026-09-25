document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. HERO TYPING EFFECT (AI Enthusiast / ML Developer / Hackathon Winner)
       ========================================================================== */
    const typewriterElement = document.getElementById('typewriter-text');
    const professions = [
        "AI & ML Developer",
        "AI Domain Intern",
        "Hackathon Winner",
        "Problem Solver"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function handleTypewriter() {
        if (!typewriterElement) return;

        const currentWord = professions[wordIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Deletes faster
        } else {
            typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Normal typing speed
        }

        // Word completed typing
        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } 
        // Word completed deleting
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % professions.length;
            typingSpeed = 500; // Short pause before next word
        }

        setTimeout(handleTypewriter, typingSpeed);
    }

    // Start Typewriter
    if (typewriterElement) {
        setTimeout(handleTypewriter, 500);
    }


    /* ==========================================================================
       2. HAMBURGER MENU ACTIONS (Mobile Drawer)
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle-btn');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuToggle && mobileNavOverlay) {
        function toggleMobileMenu() {
            menuToggle.classList.toggle('open');
            mobileNavOverlay.classList.toggle('open');
            document.body.classList.toggle('overflow-hidden');
        }

        menuToggle.addEventListener('click', toggleMobileMenu);

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNavOverlay.classList.contains('open')) {
                    toggleMobileMenu();
                }
            });
        });
    }


    /* ==========================================================================
       3. SCROLL REVEALS & ACTIVE STATE SCROLLSPY (Intersection Observers)
       ========================================================================== */
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // A. Scroll fade-up on sections (simple opacity + translateY)
    const revealItems = document.querySelectorAll('.reveal');
    
    const sectionRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.08 });

    revealItems.forEach(item => sectionRevealObserver.observe(item));

    // B. Navbar active link tracking on scroll (ScrollSpy)
    const scrollspyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                // Exclude hero header from matching normal navlinks directly if active isn't listed
                if (id === 'hero') {
                    navLinks.forEach(link => link.classList.remove('active'));
                    return;
                }
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(section => scrollspyObserver.observe(section));


    /* ==========================================================================
       4. CARD MOUSE-GLOW MAPPING SYSTEM
       ========================================================================== */
    const glassCards = document.querySelectorAll('.glass-card');

    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });


    /* ==========================================================================
       5. COPY BUTTON AND DIRECT EMAIL INTERACTION
       ========================================================================== */
    const copyBtns = document.querySelectorAll('.action-copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const textToCopy = btn.getAttribute('data-copy');
            const tooltip = btn.querySelector('.action-tooltip');
            
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    if (tooltip) {
                        const originalText = tooltip.textContent;
                        tooltip.textContent = "Copied!";
                        tooltip.style.color = "#2ecc71";
                        tooltip.style.borderColor = "rgba(46, 204, 113, 0.4)";
                        tooltip.style.opacity = "1";
                        
                        setTimeout(() => {
                            tooltip.textContent = originalText;
                            tooltip.style.color = "var(--pink)";
                            tooltip.style.borderColor = "rgba(255, 79, 163, 0.25)";
                            tooltip.style.opacity = "";
                        }, 2000);
                    }
                }).catch(err => {
                    console.error("Could not copy detail text: ", err);
                });
            }
        });
    });

    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText('soumisms12@gmail.com').catch(() => {});
            }
        });
    });

    const copyCards = document.querySelectorAll('.click-to-copy');
    copyCards.forEach(card => {
        card.addEventListener('click', () => {
            const textToCopy = card.getAttribute('data-copy');
            const tooltip = card.querySelector('.row-copy-tooltip');
            
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    if (tooltip) {
                        const originalText = tooltip.textContent;
                        tooltip.textContent = "Copied!";
                        tooltip.style.color = "#2ecc71";
                        tooltip.style.borderColor = "rgba(46, 204, 113, 0.4)";
                        
                        setTimeout(() => {
                            tooltip.textContent = originalText;
                            tooltip.style.color = "var(--pink)";
                            tooltip.style.borderColor = "rgba(255, 79, 163, 0.25)";
                        }, 2000);
                    }
                }).catch(err => {
                    console.error("Could not copy detail text: ", err);
                });
            }
        });
    });
});
