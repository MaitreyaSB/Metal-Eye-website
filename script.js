// --- 1. Preloader: hides as soon as the page is actually ready ---
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.getElementById('preloader').classList.add('fade-out');
            }, 300);
        });
        // Safety net so the preloader can never trap a visitor if 'load' misfires
        setTimeout(() => {
            document.getElementById('preloader').classList.add('fade-out');
        }, 3000);

        // --- 2. Custom Studio Cursor ---
        const dot = document.querySelector('.cursor-dot');
        const outline = document.querySelector('.cursor-outline');

        // Throttled to one update per animation frame. The old version created a new
        // Animation object on every mousemove event — hundreds per second.
        let pointerX = 0, pointerY = 0, outlineX = 0, outlineY = 0, cursorQueued = false;

        window.addEventListener('mousemove', (e) => {
            pointerX = e.clientX;
            pointerY = e.clientY;
            dot.style.transform = `translate(${pointerX}px, ${pointerY}px) translate(-50%, -50%)`;
            if (!cursorQueued) { cursorQueued = true; requestAnimationFrame(followPointer); }
        });

        function followPointer() {
            cursorQueued = false;
            // ease the outline toward the pointer instead of animating to it
            outlineX += (pointerX - outlineX) * 0.18;
            outlineY += (pointerY - outlineY) * 0.18;
            outline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
            if (Math.abs(pointerX - outlineX) > 0.5 || Math.abs(pointerY - outlineY) > 0.5) {
                cursorQueued = true;
                requestAnimationFrame(followPointer);
            }
        }

        document.querySelectorAll('a, button, .service-card, input, select, textarea').forEach(el => {
            el.addEventListener('mouseenter', () => {
                outline.style.width = '60px';
                outline.style.height = '60px';
                outline.style.backgroundColor = 'rgba(229, 169, 61, 0.1)';
                outline.style.borderColor = 'var(--gold)';
            });
            el.addEventListener('mouseleave', () => {
                outline.style.width = '40px';
                outline.style.height = '40px';
                outline.style.backgroundColor = 'transparent';
                outline.style.borderColor = 'rgba(229, 169, 61, 0.4)';
            });
        });

        // --- 3. Hero parallax (desktop only, skipped if reduced motion is requested) ---
        const hero = document.querySelector('.hero');
        const parallaxWrapper = document.getElementById('parallax-wrapper');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (window.innerWidth > 768 && !reducedMotion) {
            hero.addEventListener('mousemove', (e) => {
                const x = (window.innerWidth / 2 - e.pageX) / 35;
                const y = (window.innerHeight / 2 - e.pageY) / 35;
                parallaxWrapper.style.transform = `translate(${x}px, ${y}px)`;
            });
            hero.addEventListener('mouseleave', () => {
                parallaxWrapper.style.transform = `translate(0px, 0px)`;
            });
        }

        // --- 3b. Pause the hero's infinite animations when it's off-screen ---
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([entry]) => {
                hero.classList.toggle('anim-paused', !entry.isIntersecting);
            }, { threshold: 0 }).observe(hero);
        }

        // --- 4. Scroll reveal ---
        const revealOnScroll = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });

        document.querySelectorAll('.reveal').forEach(el => revealOnScroll.observe(el));

        // --- 5. Footer year ---
        document.getElementById('year').textContent = new Date().getFullYear();

        // --- 6. Form submission with inline status (no more alert popups) ---
        const form = document.getElementById('bookingForm');
        const status = document.getElementById('formStatus');
        const submitButton = form.querySelector('.btn-submit');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                status.className = 'form-status error';
                status.textContent = 'Please fill in every field before sending.';
                form.reportValidity();
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            status.className = 'form-status';
            status.textContent = '';

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(new FormData(form)))
                });

                if (response.ok) {
                    status.className = 'form-status success';
                    status.textContent = 'Message sent. I\u2019ll get back to you within 48 hours.';
                    form.reset();
                } else {
                    throw new Error('Request failed');
                }
            } catch (err) {
                status.className = 'form-status error';
                status.innerHTML = 'That didn\u2019t send. Email me directly at <a href="mailto:mbhagwat2007@gmail.com" style="color: var(--gold);">mbhagwat2007@gmail.com</a>.';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }
        });
