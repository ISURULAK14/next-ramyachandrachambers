/**
 * Ramyachandra Gunasekera Chambers — Main Interactive Logic
 * High-Performance, Zero-Console-Errors, Accessible Suite
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Email Protection / Anti-Scraping Hydration
    document.querySelectorAll('.protected-email').forEach(el => {
        const u = el.getAttribute('data-user') || 'ramyachandra';
        const d = el.getAttribute('data-domain') || 'sltnet.lk';
        el.href = `mailto:${u}@${d}`;
        el.textContent = `${u}@${d}`;
    });

        // 2. Navigation Highlighting & Smooth Scrolling
    const navLinks = [...document.querySelectorAll('.nav-link')];
    const sections = [...document.querySelectorAll('section[id]')];
    const navEl = document.querySelector('nav.site-nav') || document.querySelector('nav');
    let cachedNavHeight = 70;
    let sectionOffsets = [];
    const updateMeasurements = () => {
        if (navEl) cachedNavHeight = navEl.offsetHeight || 70;
        sectionOffsets = sections.map(sec => ({ id: sec.id, top: sec.offsetTop }));
    };
    if ('requestIdleCallback' in window) { requestIdleCallback(updateMeasurements); } else { setTimeout(updateMeasurements, 200); }
    window.addEventListener('resize', updateMeasurements, { passive: true });
    window.addEventListener('load', () => setTimeout(updateMeasurements, 400), { passive: true });

    let activeNavId = '';
    function setActiveNav(targetId) {
        if (!navLinks.length || targetId === activeNavId) return;
        activeNavId = targetId;
        navLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            const isMatch = href === `#${targetId}` || href === `/#${targetId}` || (targetId === 'home' && (href === '/' || href === '#home' || href === '/#home'));
            link.classList.toggle('active', isMatch);
            if (isMatch && window.innerWidth <= 900) {
                try {
                    link.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                } catch (err) {}
            }
        });
    }

    if (navLinks.length) {
        navLinks.forEach(link => {
            link.addEventListener('click', e => {
                const href = link.getAttribute('href') || '';
                if (href.startsWith('#')) {
                    const targetEl = document.querySelector(href);
                    if (targetEl) {
                        e.preventDefault();
                        const navHeight = cachedNavHeight || 70;
                        const targetTop = Math.max(0, targetEl.offsetTop - navHeight + 2);
                        window.scrollTo({ top: targetTop, behavior: 'smooth' });
                        setActiveNav(targetEl.id);
                    }
                }
            });
        });

        // Check if page loaded with a hash (e.g. /#about)
        if (window.location.hash) {
            setTimeout(() => {
                const targetEl = document.querySelector(window.location.hash);
                if (targetEl) {
                    const navHeight = cachedNavHeight || 70;
                    const targetTop = Math.max(0, targetEl.offsetTop - navHeight + 2);
                    window.scrollTo({ top: targetTop, behavior: 'smooth' });
                    setActiveNav(targetEl.id);
                }
            }, 100);
        }

        let scrollTicking = false;
        let isScrolledCached = false;
        window.addEventListener('scroll', () => {
            if (scrollTicking) return;
            scrollTicking = true;
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const isScrolled = scrollY > 30;
                if (navEl && isScrolled !== isScrolledCached) {
                    isScrolledCached = isScrolled;
                    navEl.classList.toggle('scrolled', isScrolled);
                }
                if (sectionOffsets.length) {
                    const marker = scrollY + (cachedNavHeight || 70) + 100;
                    let current = sectionOffsets[0].id;
                    for (let i = 0; i < sectionOffsets.length; i++) {
                        if (marker >= sectionOffsets[i].top) {
                            current = sectionOffsets[i].id;
                        }
                    }
                    setActiveNav(current);
                }
                scrollTicking = false;
            });
        }, { passive: true });
    }

    // 3. Counter Rolling Cadence
    const stats = [...document.querySelectorAll('.stat-value[data-target]')];
    if (stats.length) {
        const duration = 2400;
        const restDuration = 3000;
        const timerEase = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        let isVisible = true;
        let isRunning = false;
        let currentRaf = null;
        let cycleTimeout = null;

        const stopCycle = () => {
            if (currentRaf) {
                cancelAnimationFrame(currentRaf);
                currentRaf = null;
            }
            if (cycleTimeout) {
                clearTimeout(cycleTimeout);
                cycleTimeout = null;
            }
            isRunning = false;
        };

        const runCountCycle = () => {
            stopCycle();
            isRunning = true;

            stats.forEach(el => {
                const suffix = el.getAttribute('data-suffix') || '';
                el.textContent = '0' + suffix;
            });

            const startTime = performance.now();
            let lastVals = new Map();

            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = timerEase(progress);

                stats.forEach(el => {
                    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
                    const suffix = el.getAttribute('data-suffix') || '';
                    let currentVal = Math.round(target * ease);
                    if (progress >= 1) currentVal = target;

                    if (lastVals.get(el) !== currentVal) {
                        lastVals.set(el, currentVal);
                        el.textContent = currentVal + suffix;
                    }
                });

                if (progress < 1) {
                    currentRaf = requestAnimationFrame(step);
                } else {
                    currentRaf = null;
                    stats.forEach(el => {
                        const target = el.getAttribute('data-target');
                        const suffix = el.getAttribute('data-suffix') || '';
                        el.textContent = target + suffix;
                    });
                    cycleTimeout = setTimeout(() => {
                        cycleTimeout = null;
                        if (isVisible) {
                            runCountCycle();
                        } else {
                            isRunning = false;
                        }
                    }, restDuration);
                }
            };
            currentRaf = requestAnimationFrame(step);
        };

        const statsBanner = document.querySelector('.banner-stats');
        if ('IntersectionObserver' in window && statsBanner) {
            let hasInitialDeferredRun = false;
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isVisible = entry.isIntersecting;
                    if (isVisible) {
                        if (!isRunning) {
                            if (!hasInitialDeferredRun) {
                                hasInitialDeferredRun = true;
                                setTimeout(runCountCycle, 1500);
                            } else {
                                runCountCycle();
                            }
                        }
                    } else {
                        stopCycle();
                    }
                });
            }, { threshold: 0.05, rootMargin: '50px' });
            statsObserver.observe(statsBanner);
        } else {
            setTimeout(runCountCycle, 1500);
        }
    }

    // 4. World Map Active Pin Cycling (Strict 500ms Step Cadence: 0ms, 500ms, 1000ms, 1500ms, 2000ms -> 2500ms Clear -> 3000ms Next)
    const mapWrapper = document.querySelector('.map-wrapper');
    const pins = [...document.querySelectorAll('.map-pin')];
    if (pins.length) {
        // 7 Non-Overlapping Globally Balanced Cohorts Covering All 35 Sovereign Jurisdictions
                                const cohorts = [
            // Cycle 1: Americas, SE Europe, Southeast Asia, SW Iberia, Middle East
            ['pin-usa', 'pin-romania', 'pin-malaysia', 'pin-portugal', 'pin-uae'],

            // Cycle 2: Northwest Europe, East Europe, Central-West Europe, Indian Ocean, Oceania
            ['pin-netherlands', 'pin-slovakia', 'pin-luxembourg', 'pin-maldives', 'pin-australia'],

            // Cycle 3: Scandinavia North, Baltic East, Central Europe, South Asia, Mediterranean South
            ['pin-sweden', 'pin-latvia', 'pin-germany', 'pin-bangladesh', 'pin-malta'],

            // Cycle 4: Central Europe, Southeast Asia, Scandinavia North, NW Atlantic, West Africa
            ['pin-austria', 'pin-singapore', 'pin-norway', 'pin-ireland', 'pin-mali'],

            // Cycle 5: West Europe, North Europe, SE Mediterranean, East Asia, East Africa
            ['pin-belgium', 'pin-denmark', 'pin-greece', 'pin-korea', 'pin-zanzibar'],

            // Cycle 6: West Europe, Middle East, Mediterranean South, South Asia, East Asia
            ['pin-france', 'pin-israel', 'pin-italy', 'pin-india', 'pin-china'],

            // Cycle 7: Alps, British Isles, South Asia, East Asia, Oceania
            ['pin-switzerland', 'pin-uk', 'pin-srilanka', 'pin-japan', 'pin-nz']
        ];

        let cohortIndex = 0;
        let stepTimers = [];
        let mainTimer = null;
        let isRunning = false;
        let isHovered = false;

        const clearAllActivePins = () => {
            pins.forEach(p => p.classList.remove('active'));
        };

        const clearStepTimers = () => {
            stepTimers.forEach(t => clearTimeout(t));
            stepTimers = [];
        };

        const runSequence = () => {
            if (isHovered) return;
            clearStepTimers();
            clearAllActivePins();

            const currentCohort = cohorts[cohortIndex];
            if (!currentCohort) return;

            // 0 ms: Country 1 appears
            stepTimers.push(setTimeout(() => {
                if (isHovered) return;
                const el = document.getElementById(currentCohort[0]);
                if (el) el.classList.add('active');
            }, 0));

            // 500 ms: Country 2 appears (Country 1 remains)
            stepTimers.push(setTimeout(() => {
                if (isHovered) return;
                const el = document.getElementById(currentCohort[1]);
                if (el) el.classList.add('active');
            }, 500));

            // 1000 ms: Country 3 appears (Countries 1 and 2 remain)
            stepTimers.push(setTimeout(() => {
                if (isHovered) return;
                const el = document.getElementById(currentCohort[2]);
                if (el) el.classList.add('active');
            }, 1000));

            // 1500 ms: Country 4 appears (Countries 1, 2, and 3 remain)
            stepTimers.push(setTimeout(() => {
                if (isHovered) return;
                const el = document.getElementById(currentCohort[3]);
                if (el) el.classList.add('active');
            }, 1500));

            // 2000 ms: Country 5 appears (Countries 1, 2, 3, and 4 remain)
            stepTimers.push(setTimeout(() => {
                if (isHovered) return;
                const el = document.getElementById(currentCohort[4]);
                if (el) el.classList.add('active');
            }, 2000));

            // 2500 ms: Sequence clears. All elements (Countries 1 through 5) disappear simultaneously.
            stepTimers.push(setTimeout(() => {
                if (isHovered) return;
                clearAllActivePins();
            }, 2500));

            // 3000 ms: Next sequence begins!
            cohortIndex = (cohortIndex + 1) % cohorts.length;
            mainTimer = setTimeout(runSequence, 3000);
        };

        const startSequence = () => {
            if (isRunning) return;
            isRunning = true;
            runSequence();
        };

        const stopSequence = () => {
            isRunning = false;
            if (mainTimer) clearTimeout(mainTimer);
            mainTimer = null;
            clearStepTimers();
            clearAllActivePins();
        };

        if (mapWrapper) {
            mapWrapper.addEventListener('mouseenter', () => {
                isHovered = true;
                if (mainTimer) clearTimeout(mainTimer);
                mainTimer = null;
                clearStepTimers();
                clearAllActivePins();
            });
            mapWrapper.addEventListener('mouseleave', () => {
                isHovered = false;
                clearAllActivePins();
                runSequence();
            });
        }

        pins.forEach(pin => {
            pin.addEventListener('mouseenter', () => {
                isHovered = true;
                clearAllActivePins();
                pin.classList.add('active');
            });
            pin.addEventListener('mouseleave', () => {
                pin.classList.remove('active');
            });
        });

        if ('IntersectionObserver' in window && mapWrapper) {
            const mapObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) startSequence();
                    else stopSequence();
                });
            }, { rootMargin: '100px' });
            mapObserver.observe(mapWrapper);
        } else {
            startSequence();
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopSequence();
            else if (mapWrapper && mapWrapper.getBoundingClientRect().top < window.innerHeight) startSequence();
        });
    }

    // 5. Dual Google Reviews Carousels (All Reviews Cycled Every 2 Seconds with Scroll Buttons)
    const reviewCards = [...document.querySelectorAll('.reviews-grid .review-card')];
    if (reviewCards.length) {
        reviewCards.forEach((card) => {
            const slides = [...card.querySelectorAll('.google-review-slide')];
            const dots = [...card.querySelectorAll('.carousel-dot')];
            const prevBtn = card.querySelector('.carousel-prev');
            const nextBtn = card.querySelector('.carousel-next');
            const counter = card.querySelector('.carousel-counter');
            if (slides.length <= 1) return;

            let currentIndex = 0;
            let reviewTimer = null;

            const goToSlide = (index) => {
                slides.forEach((s, idx) => s.classList.toggle('is-active', idx === index));
                dots.forEach((d, idx) => d.classList.toggle('is-active', idx === index));
                currentIndex = index;
                if (counter) {
                    counter.textContent = `${currentIndex + 1} / ${slides.length}`;
                }
            };

            const nextSlide = () => {
                goToSlide((currentIndex + 1) % slides.length);
            };

            const prevSlide = () => {
                goToSlide((currentIndex - 1 + slides.length) % slides.length);
            };

            const startTimer = () => {
                if (reviewTimer) clearInterval(reviewTimer);
                reviewTimer = setInterval(nextSlide, 2000); // Strict 2-second rotation
            };

            const stopTimer = () => {
                if (reviewTimer) clearInterval(reviewTimer);
                reviewTimer = null;
            };

            dots.forEach((dot, idx) => {
                dot.addEventListener('click', () => {
                    goToSlide(idx);
                    startTimer();
                });
            });

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    prevSlide();
                    startTimer();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    nextSlide();
                    startTimer();
                });
            }

            // Pause rotation on hover or touch for comfortable reading
            card.addEventListener('mouseenter', stopTimer);
            card.addEventListener('mouseleave', startTimer);
            card.addEventListener('touchstart', stopTimer, { passive: true });
            card.addEventListener('touchend', startTimer, { passive: true });

            if ('IntersectionObserver' in window && card) {
                const reviewObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) startTimer();
                        else stopTimer();
                    });
                }, { threshold: 0.1 });
                reviewObserver.observe(card);
            } else {
                startTimer();
            }
        });
    }

    // 6. Practice Areas / Services Accordion Cards
    const serviceGrid = document.querySelector('.services-grid');
    const serviceCards = [...document.querySelectorAll('.service-card')];

    function setServiceState(card, open) {
        if (!card) return;
        const content = card.querySelector('.accordion-content');
        const header = card.querySelector('.accordion-header');
        const arrow = card.querySelector('.arrow-icon');
        if (!content) return;
        card.classList.toggle('is-open', open);
        if (header) header.setAttribute('aria-expanded', String(open));
        content.style.maxHeight = open ? `${content.scrollHeight + 60}px` : '0px';
        if (arrow) arrow.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    function getServiceRow(card) {
        if (!serviceGrid) return [card];
        const columnCount = Math.max(1, getComputedStyle(serviceGrid).gridTemplateColumns.split(' ').filter(Boolean).length);
        const cardIndex = serviceCards.indexOf(card);
        const rowStart = Math.floor(cardIndex / columnCount) * columnCount;
        return serviceCards.slice(rowStart, rowStart + columnCount);
    }

    window.toggleAccordion = function(element) {
        const card = element ? element.closest('.service-card') : null;
        if (!card) return;
        const isOpen = card.classList.contains('is-open');

        if (window.innerWidth <= 900) {
            // Mobile & Tablet: single card toggle
            serviceCards.forEach(c => {
                if (c !== card) setServiceState(c, false);
            });
            setServiceState(card, !isOpen);
        } else {
            // Desktop: toggle row
            const row = getServiceRow(card);
            const rowIsOpen = row.length > 0 && row.every(rc => rc.classList.contains('is-open'));
            if (rowIsOpen) {
                row.forEach(rc => setServiceState(rc, false));
                if (serviceGrid && !serviceCards.some(c => c.classList.contains('is-open'))) {
                    serviceGrid.classList.remove('row-open');
                }
            } else {
                if (serviceGrid) serviceGrid.classList.add('row-open');
                row.forEach(rc => setServiceState(rc, true));
            }
        }
    };

    if (serviceCards.length) {
        serviceCards.forEach(card => {
            const header = card.querySelector('.accordion-header');
            if (header) {
                header.addEventListener('click', () => {
                    window.toggleAccordion(header);
                });
            }
        });
    }

    // 7. Scroll Reveal Animation
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -20px 0px',
            threshold: 0.05
        });
        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    } else {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }

    // 8. Legal Modals Handler
    const openPrivacy = document.getElementById('open-privacy-link');
    const openTerms = document.getElementById('open-terms-link');
    const privacyModal = document.getElementById('privacy-modal');
    const termsModal = document.getElementById('terms-modal');

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('is-open', 'active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('is-open', 'active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (openPrivacy) openPrivacy.addEventListener('click', (e) => { e.preventDefault(); openModal(privacyModal); });
    if (openTerms) openTerms.addEventListener('click', (e) => { e.preventDefault(); openModal(termsModal); });

    [privacyModal, termsModal].forEach(modal => {
        if (!modal) return;
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('.legal-modal-close')) {
                closeModal(modal);
            }
        });
        const closeBtn = modal.querySelector('.legal-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeModal(modal);
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(privacyModal);
            closeModal(termsModal);
        }
    });

    // 9. Stardust Ambient Canvas (Hero Cosmos)
    const canvas = document.getElementById('ambient-cosmos-canvas');
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ctx = canvas.getContext('2d', { alpha: true });
        if (ctx) {
            let width = 0, height = 0;
            let particles = [];
            let animId = 0;
            let mouseX = -1000, mouseY = -1000;
            const isMobile = window.innerWidth <= 768;
            const particleCount = isMobile ? 36 : 48;

            const resize = () => {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            };
            resize();
            window.addEventListener('resize', resize, { passive: true });

            class StardustParticle {
                constructor() { this.reset(true); }
                reset(initial = false) {
                    this.x = Math.random() * width;
                    this.y = initial ? Math.random() * height : height + 10;
                    this.baseSize = Math.random() * 1.5 + 1.0;
                    this.size = this.baseSize;
                    this.vx = (Math.random() - 0.5) * 0.22;
                    this.vy = -(Math.random() * 0.28 + 0.14);
                    this.alpha = Math.random() * 0.40 + 0.35;
                    this.pulseSpeed = Math.random() * 0.022 + 0.010;
                    this.pulsePhase = Math.random() * Math.PI * 2;
                    const colors = ['rgba(223, 179, 93, ', 'rgba(244, 208, 138, ', 'rgba(202, 239, 231, ', 'rgba(255, 255, 255, '];
                    this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
                }
                update(scrollDelta) {
                    this.pulsePhase += this.pulseSpeed;
                    const pulse = Math.sin(this.pulsePhase) * 0.15;
                    this.currentAlpha = Math.max(0.15, Math.min(0.85, this.alpha + pulse));
                    this.x += this.vx;
                    this.y += this.vy - (scrollDelta * 0.08);
                    if (this.y < -15) this.y = height + 10;
                    else if (this.y > height + 15) this.y = -10;
                    if (this.x < -15) this.x = width + 10;
                    else if (this.x > width + 15) this.x = -10;
                }
                draw() {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = this.colorPrefix + this.currentAlpha + ')';
                    ctx.fill();
                    ctx.restore();
                }
            }

            for (let i = 0; i < particleCount; i++) particles.push(new StardustParticle());

            let isTabActive = true;
            let scrollDelta = 0;
            let lastScrollY = 0;

            window.addEventListener('scroll', () => {
                const nowY = window.pageYOffset || document.documentElement.scrollTop || 0;
                scrollDelta = nowY - lastScrollY;
                lastScrollY = nowY;
            }, { passive: true });

            document.addEventListener('visibilitychange', () => {
                isTabActive = !document.hidden;
                if (isTabActive) {
                    scrollDelta = 0;
                    renderCosmos();
                } else {
                    cancelAnimationFrame(animId);
                }
            });

            const renderCosmos = () => {
                if (!isTabActive) return;
                const delta = scrollDelta;
                scrollDelta = 0;
                ctx.clearRect(0, 0, width, height);
                for (let i = 0; i < particles.length; i++) {
                    particles[i].update(delta);
                    particles[i].draw();
                }
                animId = requestAnimationFrame(renderCosmos);
            };
            const heroSec = document.getElementById('home') || canvas;
            if ('IntersectionObserver' in window && heroSec) {
                const cosmosObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            if (!animId) animId = requestAnimationFrame(renderCosmos);
                        } else {
                            if (animId) {
                                cancelAnimationFrame(animId);
                                animId = 0;
                            }
                        }
                    });
                }, { threshold: 0.05 });
                cosmosObserver.observe(heroSec);
            } else {
                animId = requestAnimationFrame(renderCosmos);
            }
        }
    }

    // 10. Service Worker Registration for Instant Load & PWA Offline Caching
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
    }

    // 6. Interactive FAQ Search, Filter Tabs, and Accordion Toggle
    const faqCards = [...document.querySelectorAll('.faq-card')];
    const faqSearchInput = document.getElementById('faq-search-input');
    const faqClearBtn = document.getElementById('faq-clear-btn');
    const faqCatButtons = [...document.querySelectorAll('.faq-category-btn')];
    const faqCounterText = document.getElementById('faq-counter-text');

    if (faqCards.length) {
        let currentFaqCategory = 'all';
        let faqSearchQuery = '';

        function setFaqCardState(card, open) {
            const body = card.querySelector('.faq-body');
            const header = card.querySelector('.faq-header');
            if (!body || !header) return;

            card.classList.toggle('is-open', open);
            header.setAttribute('aria-expanded', String(open));
            body.style.maxHeight = open ? `${body.scrollHeight + 30}px` : '0px';
        }

        faqCards.forEach(card => {
            const header = card.querySelector('.faq-header');
            if (!header) return;
            header.addEventListener('click', (e) => {
                e.preventDefault();
                const isOpen = card.classList.contains('is-open');
                setFaqCardState(card, !isOpen);
            });
        });

        function applyFaqFilters() {
            let visibleCount = 0;
            const query = faqSearchQuery.trim().toLowerCase();

            faqCards.forEach(card => {
                const cat = card.getAttribute('data-category');
                const question = card.querySelector('.faq-question')?.textContent.toLowerCase() || '';
                const answer = card.querySelector('.faq-answer-text')?.textContent.toLowerCase() || '';

                const matchesCategory = currentFaqCategory === 'all' || cat === currentFaqCategory;
                const matchesSearch = !query || question.includes(query) || answer.includes(query);

                const isVisible = matchesCategory && matchesSearch;
                card.style.display = isVisible ? 'block' : 'none';
                if (isVisible) visibleCount++;
            });

            if (faqCounterText) {
                if (visibleCount === faqCards.length) {
                    faqCounterText.textContent = `Showing all ${faqCards.length} legal topics`;
                } else if (visibleCount === 0) {
                    faqCounterText.textContent = `No matching questions found for "${faqSearchQuery}"`;
                } else {
                    faqCounterText.textContent = `Showing ${visibleCount} of ${faqCards.length} legal topics`;
                }
            }
        }

        if (faqSearchInput) {
            faqSearchInput.addEventListener('input', e => {
                faqSearchQuery = e.target.value;
                if (faqClearBtn) faqClearBtn.style.display = faqSearchQuery ? 'block' : 'none';
                applyFaqFilters();
            });
        }

        if (faqClearBtn) {
            faqClearBtn.addEventListener('click', () => {
                if (faqSearchInput) faqSearchInput.value = '';
                faqSearchQuery = '';
                faqClearBtn.style.display = 'none';
                applyFaqFilters();
                if (faqSearchInput) faqSearchInput.focus();
            });
        }

        faqCatButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                faqCatButtons.forEach(b => {
                    b.classList.remove('is-active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('is-active');
                btn.setAttribute('aria-selected', 'true');
                currentFaqCategory = btn.getAttribute('data-cat') || 'all';
                applyFaqFilters();
            });
        });

        // Deep link handling (e.g. faq.html#property-deed-matara)
        const openFaqFromHash = () => {
            if (!window.location.hash) return;
            const targetId = window.location.hash.substring(1);
            const targetCard = document.getElementById(targetId);
            if (targetCard && targetCard.classList.contains('faq-card')) {
                setFaqCardState(targetCard, true);
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };
        if (window.location.hash) {
            setTimeout(openFaqFromHash, 300);
        }
        window.addEventListener('hashchange', openFaqFromHash);
    }


    // =========================================================================
    // 10. Fine-Pointer Ambient Mouse Cursor Animation
    // =========================================================================
    (() => {
        const field = document.querySelector('.cursor-pixel-field');
        if (!field || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return;
        
        let x = -200, y = -200, raf = 0;
        const render = () => {
            field.style.transform = `translate3d(${x - 56}px, ${y - 56}px, 0)`;
            raf = 0;
        };
        
        window.addEventListener('pointermove', (event) => {
            x = event.clientX;
            y = event.clientY;
            document.body.classList.add('pixel-cursor-ready');
            if (!raf) raf = requestAnimationFrame(render);
        }, { passive: true });
        
        window.addEventListener('pointerleave', () => {
            document.body.classList.remove('pixel-cursor-ready');
            if (raf) {
                cancelAnimationFrame(raf);
                raf = 0;
            }
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (raf) { cancelAnimationFrame(raf); raf = 0; }
            }
        });
    })();

});
    // Client-Side Email Obfuscation Protection (Anti-Spam Scraper Defense)
    function initProtectedEmails() {
        document.querySelectorAll('.protected-email').forEach(function(el) {
            var user = el.getAttribute('data-user');
            var domain = el.getAttribute('data-domain');
            if (user && domain) {
                var email = user + '@' + domain;
                el.addEventListener('click', function(e) {
                    if (el.getAttribute('href') === '#') {
                        el.setAttribute('href', 'mailto:' + email);
                    }
                }, { passive: true });
                el.addEventListener('mouseenter', function() {
                    el.setAttribute('href', 'mailto:' + email);
                }, { passive: true });
            }
        });
        document.querySelectorAll('.email-text').forEach(function(el) {
            var user = el.getAttribute('data-user');
            var domain = el.getAttribute('data-domain');
            if (user && domain) {
                el.textContent = user + '@' + domain;
            }
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProtectedEmails);
    } else {
        initProtectedEmails();
    }


    // Deferred Iframe Loading (Performance & Zero TBT Penalty)
    function initLazyIframes() {
        var iframes = document.querySelectorAll('iframe[data-src]');
        if (!iframes.length) return;
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries, obs) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var frame = entry.target;
                        if (frame.dataset.src) {
                            frame.src = frame.dataset.src;
                            frame.removeAttribute('data-src');
                        }
                        obs.unobserve(frame);
                    }
                });
            }, { rootMargin: '350px' });
            iframes.forEach(function(f) { observer.observe(f); });
        } else {
            iframes.forEach(function(f) {
                if (f.dataset.src) {
                    f.src = f.dataset.src;
                    f.removeAttribute('data-src');
                }
            });
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLazyIframes);
    } else {
        initLazyIframes();
    }
