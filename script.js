document.addEventListener('DOMContentLoaded', () => {
    
    const navbar = document.getElementById('mainNav');
    const contentWrapper = document.getElementById('page-content-wrapper');
    
    const checkScroll = () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });

    const navToggle = document.querySelector('.nav-toggle');
    const navLinksList = document.querySelector('.nav-links');

    if (navToggle && navLinksList) {
        navToggle.addEventListener('click', () => {
            const isOpened = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isOpened);
            navLinksList.classList.toggle('mobile-open');
            document.body.style.overflow = isOpened ? '' : 'hidden';
        });
    }

    const initScrollAnimations = () => {
        const revealElements = document.querySelectorAll('.reveal');
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                });
            }, { root: null, threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

            revealElements.forEach(element => revealObserver.observe(element));
        } else {
            revealElements.forEach(element => element.classList.add('active'));
        }
    };

    const initFormValidation = () => {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                const submitBtn = contactForm.querySelector('.form-submit-btn');
                if (!contactForm.checkValidity()) {
                    e.preventDefault();
                    return;
                }
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = 'Mengirim...';
                }
            });
        }
    };

    const initLazyLoadPlaceholders = () => {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
            if (img.complete) {
                const parent = img.closest('.image-placeholder');
                if (parent) parent.classList.remove('animate-pulse');
            }
            img.addEventListener('load', () => {
                const parent = img.closest('.image-placeholder');
                if (parent) parent.classList.remove('animate-pulse');
            });
            img.addEventListener('error', () => {
                const parent = img.closest('.image-placeholder');
                if (parent) {
                    parent.classList.remove('animate-pulse');
                    parent.classList.add('fallback-active');
                }
            });
        });
    };

    const updateActiveNavbarLink = (targetUrl) => {
        const currentPath = targetUrl.split('/').pop() || 'index.html';
        const allNavLinks = document.querySelectorAll('.nav-links a');
        allNavLinks.forEach(link => {
            const linkPath = link.getAttribute('href').split('/').pop();
            if (linkPath === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    const loadPageAsync = async (url) => {
        try {
            contentWrapper.classList.add('page-fade-out');
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Gagal memuat halaman');
            
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const newContent = doc.querySelector('main');
            const newTitle = doc.querySelector('title').innerText;
            
            // FIX LOGIKA SEO: SINKRONISASI METADATA HEAD SECARA ASINKRON
            const updateMeta = (selector, attr) => {
                const oldMeta = document.querySelector(selector);
                const newMeta = doc.querySelector(selector);
                if (oldMeta && newMeta) {
                    oldMeta.setAttribute(attr, newMeta.getAttribute(attr));
                } else if (newMeta) {
                    document.head.appendChild(newMeta.cloneNode(true));
                }
            };
            
            updateMeta('meta[name="description"]', 'content');
            updateMeta('meta[name="keywords"]', 'content');
            updateMeta('meta[property="og:title"]', 'content');
            updateMeta('meta[property="og:description"]', 'content');
            updateMeta('meta[property="og:url"]', 'content');
            updateMeta('meta[property="og:image"]', 'content');
            updateMeta('meta[name="twitter:title"]', 'content');
            updateMeta('meta[name="twitter:description"]', 'content');
            updateMeta('meta[name="twitter:image"]', 'content');

            setTimeout(() => {
                contentWrapper.innerHTML = '';
                contentWrapper.appendChild(newContent);
                document.title = newTitle;
                
                contentWrapper.classList.remove('page-fade-out');
                updateActiveNavbarLink(url);
                
                if (navToggle && navLinksList.classList.contains('mobile-open')) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navLinksList.classList.remove('mobile-open');
                    document.body.style.overflow = '';
                }

                initScrollAnimations();
                initFormValidation();
                initLazyLoadPlaceholders();
                bindAsyncNavigation();

                // REPARASI BUG SCROLL: Kembali ke puncak viewport paling atas (0), bukan kepotong 45%
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

            }, 300);

        } catch (error) {
            window.location.href = url;
        }
    };

    const bindAsyncNavigation = () => {
        const structuralLinks = document.querySelectorAll('.data-nav-link');
        structuralLinks.forEach(link => {
            link.removeEventListener('click', handleLinkClick);
            link.addEventListener('click', handleLinkClick);
        });
    };

    function handleLinkClick(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href && href !== '#' && href !== window.location.pathname) {
            history.pushState(null, '', href);
            loadPageAsync(href);
        }
    }

    window.addEventListener('popstate', () => {
        loadPageAsync(window.location.pathname);
    });

    initScrollAnimations();
    initFormValidation();
    initLazyLoadPlaceholders();
    bindAsyncNavigation();
});

// ==========================================================================
    // MEKANISME DRAG & SPRING-BACK LANYARD KIRI ATAS
    // ==========================================================================
    const lanyard = document.getElementById('interactiveLanyard');
    const svgString = lanyard ? lanyard.querySelector('.lanyard-string-svg') : null;
    const lanyardCard = lanyard ? lanyard.querySelector('.lanyard-id-card') : null;

    if (lanyard && svgString && lanyardCard) {
        let isDragging = false;
        let startY = 0;
        let currentY = 0;
        
        // Membaca tinggi tali default dari CSS komputer user
        const baseHeight = parseInt(window.getComputedStyle(svgString).height) || 50;
        const maxPullDistance = 200; // Batas tarikan aman maksimal (pixel)

        const startDragging = (e) => {
            isDragging = true;
            startY = e.clientY || e.touches[0].clientY;
            
            // Matikan transisi biar pergerakan mengikuti jari/mouse secara real-time (instant)
            lanyardCard.style.transition = 'none';
            svgString.style.style.transition = 'none';
        };

        const whileDragging = (e) => {
            if (!isDragging) return;
            const currentClientY = e.clientY || e.touches[0].clientY;
            let deltaY = currentClientY - startY;

            // Batasi agar lanyard tidak bisa didorong ke atas melewati batas atap layar
            if (deltaY < 0) deltaY = 0;

            // Efek karet: semakin ditarik ke bawah banget, tarikan terasa makin berat
            if (deltaY > maxPullDistance) {
                deltaY = maxPullDistance + (deltaY - maxPullDistance) * 0.25;
            }

            currentY = deltaY;

            // Ulur tali SVG & berikan sedikit efek rotasi goyang estetik saat ditarik
            svgString.style.height = `${baseHeight + currentY}px`;
            lanyardCard.style.transform = `rotate(${currentY * 0.03}deg)`;
        };

        const stopDragging = () => {
            if (!isDragging) return;
            isDragging = false;

            // KUNCI UTAMA: Efek membal balik elastis pakai kurva cubic-bezier jepret
            svgString.style.transition = 'height 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            lanyardCard.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            // Kembalikan ukuran ke posisi semula
            svgString.style.height = `${baseHeight}px`;
            lanyardCard.style.transform = 'rotate(0deg)';
            currentY = 0;
        };

        // Event listener pendeteksi klik mouse desktop
        lanyardCard.addEventListener('mousedown', startDragging);
        window.addEventListener('mousemove', whileDragging);
        window.addEventListener('mouseup', stopDragging);

        // Event listener pendeteksi usapan jari di layar HP
        lanyardCard.addEventListener('touchstart', startDragging, { passive: true });
        window.addEventListener('touchmove', whileDragging, { passive: false });
        window.addEventListener('touchend', stopDragging);
    }