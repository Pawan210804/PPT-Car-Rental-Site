// =============================================================
//  PawanPutra Travel (PPT Car Rental) — script.js
//  All site JavaScript in one clean file
// =============================================================

// Wait for full page load before running anything
document.addEventListener('DOMContentLoaded', function () {

    // ── 1. EmailJS INIT ──────────────────────────────────────
    emailjs.init('Pwuk1OluTYMPhVI83');


    // ── 2. ABOUT US IMAGE CAROUSEL ───────────────────────────
    let currentSlideIndex = 0;
    const slides = document.querySelectorAll('.slide');

    window.changeSlide = function (direction) {
        if (!slides.length) return;
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex += direction;
        if (currentSlideIndex >= slides.length) currentSlideIndex = 0;
        else if (currentSlideIndex < 0) currentSlideIndex = slides.length - 1;
        slides[currentSlideIndex].classList.add('active');
    };

    // Auto-advance carousel every 4 seconds
    setInterval(() => window.changeSlide(1), 4000);


    // ── 3. GALLERY HORIZONTAL SCROLL ────────────────────────
    window.slideGallery = function (direction) {
        const track = document.getElementById('galleryTrack');
        if (!track) return;
        track.scrollBy({ left: direction * 335, behavior: 'smooth' });
    };




    // ── 5. RAZORPAY ADVANCE PAYMENT ──────────────────────────
    // ⚠️ Replace 'rzp_test_YourKeyHere' with your real Razorpay Key ID
    // Get it from: https://dashboard.razorpay.com → Settings → API Keys
    const RAZORPAY_KEY = 'rzp_test_YourKeyHere';

    let advancePaid   = false;
    let advanceAmount = 0;

    window.togglePayment = function (radio) {
        const wrap        = document.getElementById('razorpay-btn-wrap');
        const confirmed   = document.getElementById('payment-confirmed');
        const customWrap  = document.getElementById('custom-amount-wrap');
        advancePaid = false;
        confirmed.style.display = 'none';

        if (radio.value === 'none') {
            wrap.style.display       = 'none';
            customWrap.style.display = 'none';
            advanceAmount = 0;
        } else if (radio.value === 'custom') {
            customWrap.style.display = 'block';
            wrap.style.display       = 'none'; // show after valid amount entered
            advanceAmount = 0;
        } else {
            customWrap.style.display = 'none';
            wrap.style.display       = 'block';
            advanceAmount = parseInt(radio.value);
        }
    };

    window.updateCustomAmount = function () {
        const input  = document.getElementById('custom-amount-input');
        const wrap   = document.getElementById('razorpay-btn-wrap');
        const val    = parseInt(input.value);
        if (val >= 100 && val <= 50000) {
            advanceAmount        = val;
            wrap.style.display   = 'block';
            input.style.border   = '2px solid #4CAF50';
        } else {
            advanceAmount        = 0;
            wrap.style.display   = 'none';
            input.style.border   = val ? '2px solid #e74c3c' : '';
        }
    };

    window.openRazorpay = function () {
        const name  = document.querySelector('[name="customer_name"]').value.trim();
        const phone = document.querySelector('[name="customer_phone"]').value.trim();
        const email = document.querySelector('[name="customer_email"]').value.trim();

        if (!name || !phone) {
            alert('Please fill in your Name and Phone Number first.');
            return;
        }

        const options = {
            key:         RAZORPAY_KEY,
            amount:      advanceAmount * 100,
            currency:    'INR',
            name:        'PawanPutra Travel',
            description: 'Cab Booking Advance',
            image:       'logo.png',
            prefill:     { name: name, email: email, contact: phone },
            theme:       { color: '#FFCC00' },
            handler: function (response) {
                advancePaid = true;
                document.getElementById('razorpay-btn-wrap').style.display = 'none';
                const confirmed = document.getElementById('payment-confirmed');
                confirmed.style.display = 'block';
                confirmed.textContent =
                    '✅ Advance of ₹' + advanceAmount +
                    ' paid! Payment ID: ' + response.razorpay_payment_id +
                    '. Submit your booking below.';
            },
        };

        if (typeof Razorpay === 'undefined') {
            const script  = document.createElement('script');
            script.src    = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = function () { new Razorpay(options).open(); };
            document.head.appendChild(script);
        } else {
            new Razorpay(options).open();
        }
    };


    // ── 6. BOOKING FORM SUBMIT ───────────────────────────────
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {

        // Rate limiting: max 3 submissions per 15 min
        function isRateLimited() {
            try {
                var d = JSON.parse(sessionStorage.getItem('_ppt_rl') || '{"c":0,"t":0}');
                if (Date.now() - d.t > 15 * 60 * 1000) return false;
                return d.c >= 3;
            } catch(e) { return false; }
        }
        function bumpRate() {
            try {
                var d = JSON.parse(sessionStorage.getItem('_ppt_rl') || '{"c":0,"t":0}');
                if (Date.now() - d.t > 15 * 60 * 1000) { d = {c:1, t:Date.now()}; }
                else { d.c++; }
                sessionStorage.setItem('_ppt_rl', JSON.stringify(d));
            } catch(e) {}
        }
        function isValidEmail(e) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
        }
        function isValidPhone(p) {
            return /^[6-9]\d{9}$/.test(p.replace(/[\s\-\+]/g,''));
        }

        bookingForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Honeypot check
            var hp = document.getElementById('_hp_field');
            if (hp && hp.value) return; // bot detected — silent drop

            // Rate limit
            if (isRateLimited()) {
                alert('Too many booking attempts. Please wait 15 minutes or WhatsApp us directly at +91 9650473759.');
                return;
            }

            var selectedPayment = document.querySelector('[name="advance_payment"]:checked').value;
            if (selectedPayment !== 'none' && !advancePaid) {
                alert('Please complete the advance payment first, or select "No advance — confirm via WhatsApp".');
                return;
            }

            var name  = this.customer_name.value.trim();
            var phone = this.customer_phone.value.trim();
            var email = this.customer_email.value.trim();

            if (!isValidPhone(phone)) {
                alert('Please enter a valid 10-digit Indian mobile number.');
                return;
            }
            if (email && !isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled  = true;

            const dateTime = this.date_time.value;
            const car      = this.car_type.value;
            const tripType = this.trip_type.value;
            const pickup   = this.pickup_location.value;
            const drop     = this.drop_location.value;
            const query    = this.travel_query ? this.travel_query.value : '';
            const advance  = advancePaid ? '₹' + advanceAmount + ' PAID' : 'None';

            // Step 1: Email to Pramod
            emailjs.sendForm('service_mp3z5wa', 'template_tgoh737', this)
                .then(function () {
                    // Step 2: Confirmation email to customer
                    return emailjs.send('service_mp3z5wa', 'template_ugulun7', {
                        customer_name:   name,
                        customer_email:  email,
                        car_type:        car,
                        trip_type:       tripType,
                        date_time:       dateTime,
                        pickup_location: pickup,
                        drop_location:   drop,
                        advance_status:  advance,
                    });
                })
                .then(function () {
                    // Step 3: Open WhatsApp with booking details
                    const msg = encodeURIComponent(
                        'Hi Pramod ji, I just submitted a booking on your website.\n\n' +
                        'Name: '      + name     + '\n' +
                        'Phone: '     + phone    + '\n' +
                        'Car: '       + car      + '\n' +
                        'Trip: '      + tripType + '\n' +
                        'Date/Time: ' + dateTime + '\n' +
                        'Pickup: '    + pickup   + '\n' +
                        'Drop: '      + drop     + '\n' +
                        'Advance: '   + advance  + '\n' +
                        (query ? 'Note: ' + query + '\n' : '') +
                        '\nPlease confirm my booking.'
                    );
                    window.open('https://wa.me/919650473759?text=' + msg, '_blank');
                    bumpRate(); // count successful submission against rate limit

                    // Step 4: Show success message — escape email to prevent XSS
                    const safeEmail = email.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
                    bookingForm.innerHTML =
                        '<div class="booking-success">' +
                        '<div class="success-icon">✅</div>' +
                        '<h3>Booking Request Sent!</h3>' +
                        '<p>A confirmation email has been sent to <strong>' + safeEmail + '</strong></p>' +
                        '<p>WhatsApp has opened — just press Send.</p>' +
                        '<p>Pramod will confirm within <strong>30 minutes</strong>.</p>' +
                        '<a href="https://wa.me/919650473759" class="btn-yellow" target="_blank" rel="noopener noreferrer" ' +
                        'style="margin-top:16px;display:inline-block;">💬 Open WhatsApp Again</a>' +
                        '</div>';
                })
                .catch(function (error) {
                    // Email failed — still open WhatsApp so booking isn't lost
                    const msg = encodeURIComponent(
                        'Hi Pramod ji, I want to book a cab.\n\n' +
                        'Name: '      + name     + '\n' +
                        'Phone: '     + phone    + '\n' +
                        'Car: '       + car      + '\n' +
                        'Trip: '      + tripType + '\n' +
                        'Date/Time: ' + dateTime + '\n' +
                        'Pickup: '    + pickup   + '\n' +
                        'Drop: '      + drop     + '\n' +
                        'Advance: '   + advance
                    );
                    window.open('https://wa.me/919650473759?text=' + msg, '_blank');
                    alert('Email failed, but WhatsApp is open with your details. Please send that message.');
                    submitBtn.innerText = '🚗 Submit Booking Request';
                    submitBtn.disabled  = false;
                    console.error('EmailJS Error:', error);
                });
        });
    }


    // ── 7. REVIEW FORM ───────────────────────────────────────
    const reviewForm = document.getElementById('user-review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name   = document.getElementById('reviewer-name').value.trim();
            const rating = document.getElementById('review-rating').value;
            const text   = document.getElementById('review-text').value.trim();
            if(!name || !text) return;
            const stars  = '⭐'.repeat(Math.min(5, Math.max(1, parseInt(rating))));
            const grid   = document.querySelector('.reviews-grid');
            const card   = document.createElement('div');
            card.className = 'review-card';
            // Build DOM safely — no innerHTML with user input to prevent XSS
            const starsEl = document.createElement('div');
            starsEl.className = 'stars';
            starsEl.textContent = stars;
            const textEl = document.createElement('p');
            textEl.textContent = '\u201c' + text + '\u201d'; // curly quotes, escaped
            const nameEl = document.createElement('h4');
            nameEl.textContent = '— ' + name;
            card.appendChild(starsEl);
            card.appendChild(textEl);
            card.appendChild(nameEl);
            grid.appendChild(card);
            reviewForm.reset();
            alert('Thank you for your review!');
        });
    }



    // ── 8. LOADING SCREEN ────────────────────────────────────
    const loader = document.getElementById('loader');
    if (loader) {
        var loaderDone = false;
        var pageDone = false;
        var minTime = 2500; // minimum ms to show loader

        function tryHideLoader() {
            if (loaderDone && pageDone) {
                loader.classList.add('hidden');
            }
        }
        // Minimum display time
        setTimeout(function() {
            loaderDone = true;
            tryHideLoader();
        }, minTime);
        // Wait for page to fully load
        window.addEventListener('load', function() {
            pageDone = true;
            tryHideLoader();
        });
    }

    // ── 9. COOKIE CONSENT ────────────────────────────────────
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner && !localStorage.getItem('ppt_cookies_accepted')) {
        setTimeout(function () { cookieBanner.classList.add('visible'); }, 2000);
    }
    window.acceptCookies = function () {
        localStorage.setItem('ppt_cookies_accepted', 'true');
        if (cookieBanner) cookieBanner.classList.remove('visible');
    };

    // ── 10. BACK TO TOP ──────────────────────────────────────
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        });
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ── 11. HAMBURGER MENU ───────────────────────────────────
    window.toggleMenu = function () {
        const nav     = document.getElementById('mainNav');
        const burger  = document.getElementById('hamburger');
        const overlay = document.getElementById('navOverlay');
        const isOpen  = nav.classList.toggle('open');
        burger.classList.toggle('open', isOpen);
        overlay.classList.toggle('visible', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    window.closeMenu = function () {
        document.getElementById('mainNav').classList.remove('open');
        document.getElementById('hamburger').classList.remove('open');
        document.getElementById('navOverlay').classList.remove('visible');
        document.body.style.overflow = '';
    };


    // ── 12. SCROLL ANIMATIONS (Intersection Observer) ────────
    const animElems = document.querySelectorAll(
        '.anim-fade-up, .anim-fade-left, .anim-fade-right, .anim-blur, .anim-zoom, .section-title'
    );

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); // animate only once
            }
        });
    }, { threshold: 0.12 });

    animElems.forEach(function (el) {
        observer.observe(el);
    });


    // ── 13. STICKY HEADER BLUR ON SCROLL ─────────────────────
    const siteHeader = document.querySelector('header');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 60) {
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }
    });


    // ── 14. ROUTE FARE CALCULATOR ────────────────────────────
    var selectedRouteData = null;
    var selectedCarRate   = null;
    var selectedCarName   = null;

    window.selectRoute = function (card) {
        // Deselect all cards
        document.querySelectorAll('.route-selectable').forEach(function(c) {
            c.classList.remove('selected');
            c.querySelector('.route-selected-badge').textContent = 'Tap to select';
        });

        // Select this card
        card.classList.add('selected');
        card.querySelector('.route-selected-badge').textContent = '✓ Selected';

        // Store route data
        selectedRouteData = {
            name  : card.dataset.route,
            km    : parseInt(card.dataset.km),
            hrs   : card.dataset.hrs,
            icon  : card.dataset.icon,
            place : card.dataset.place
        };

        // Reset car selection & result
        selectedCarRate = null;
        selectedCarName = null;
        document.querySelectorAll('.fare-car-btn').forEach(function(b) { b.classList.remove('selected'); });
        document.getElementById('fareResult').style.display = 'none';

        // Update and show calc box
        document.getElementById('fareRouteIcon').textContent = selectedRouteData.icon;
        document.getElementById('fareRouteName').textContent = selectedRouteData.name;

        if (selectedRouteData.km > 0) {
            document.getElementById('fareRouteDetail').textContent =
                selectedRouteData.km + ' km round trip · ~' + selectedRouteData.hrs + ' hrs · ' + selectedRouteData.place;
        } else {
            document.getElementById('fareRouteDetail').textContent = "Tell us your destination — we'll give you a custom quote!";
        }

        var box = document.getElementById('fareCalcBox');
        box.style.display = 'block';
        setTimeout(function() {
            box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    window.selectCar = function (btn, carName, ratePerKm) {
        document.querySelectorAll('.fare-car-btn').forEach(function(b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        selectedCarRate = ratePerKm;
        selectedCarName = carName;
        showFare();
    };

    function showFare() {
        if (!selectedRouteData || !selectedCarRate) return;

        var result = document.getElementById('fareResult');
        var priceDisplay = document.getElementById('farePriceDisplay');
        var bookBtn = document.getElementById('fareBookBtn');

        if (selectedRouteData.km === 0) {
            // Custom route
            priceDisplay.textContent = 'Custom';
            var waText = 'Hi Pramod ji, I need a custom cab booking with ' + selectedCarName + '. Please share availability and pricing.';
            bookBtn.href = 'https://wa.me/919650473759?text=' + encodeURIComponent(waText);
        } else {
            var fare = selectedRouteData.km * selectedCarRate;
            // Round to nearest 50
            fare = Math.round(fare / 50) * 50;
            priceDisplay.textContent = '₹' + fare.toLocaleString('en-IN');
            var waText = 'Hi Pramod ji, I want to book a ' + selectedCarName + ' for ' + selectedRouteData.name + ' (' + selectedRouteData.km + ' km round trip). Estimated fare shown: ₹' + fare.toLocaleString('en-IN') + '. Please confirm availability.';
            bookBtn.href = 'https://wa.me/919650473759?text=' + encodeURIComponent(waText);
        }

        result.style.display = 'flex';
    }


    // ── 15. STATS COUNTER ANIMATION ──────────────────────────
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                const duration = 1800;
                const step = target / (duration / 16);
                let current = 0;
                const timer = setInterval(function() {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = Math.floor(current).toLocaleString('en-IN');
                }, 16);
                statsObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    statNumbers.forEach(function(el) { statsObserver.observe(el); });

    // ── 16. HERO QUICK BOOK ───────────────────────────────────
    window.heroQuickBook = function() {
        const route = document.getElementById('hqbRoute').value;
        const car   = document.getElementById('hqbCar').value;
        if (!route && !car) {
            // Just scroll to contact form
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
            return;
        }
        var text = 'Hi Pramod ji, I want to book a cab.';
        if (route) text += ' Route: ' + route + '.';
        if (car)   text += ' Car: ' + car + '.';
        text += ' Please share availability and pricing.';
        window.open('https://wa.me/919650473759?text=' + encodeURIComponent(text), '_blank');
    };

}); // end DOMContentLoaded

    // ── 17. 3D CARD TILT ─────────────────────────────────────
    // Portfolio-style: cards respond to cursor position
    document.querySelectorAll('.car-card, .feature-card, .service-card').forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var r   = card.getBoundingClientRect();
            var x   = (e.clientX - r.left) / r.width  - 0.5;  // -0.5 to 0.5
            var y   = (e.clientY - r.top)  / r.height - 0.5;
            card.style.transform = 'perspective(600px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 8) + 'deg) translateZ(6px)';
        });
        card.addEventListener('mouseleave', function() {
            card.style.transform = '';
        });
    });


    // ── 18. STAT NUMBER BUMP PULSE ───────────────────────────
    // Adds a quick scale pulse each time count ticks over a threshold
    document.querySelectorAll('.stat-number').forEach(function(el) {
        var prev = 0;
        var mo = new MutationObserver(function() {
            var curr = parseInt(el.textContent.replace(/,/g,'')) || 0;
            if (Math.floor(curr / 10) !== Math.floor(prev / 10)) {
                el.classList.add('bump');
                setTimeout(function(){ el.classList.remove('bump'); }, 150);
            }
            prev = curr;
        });
        mo.observe(el, { childList: true, characterData: true, subtree: true });
    });


    // ── 19. NAV ACTIVE LINK HIGHLIGHT ────────────────────────
    var navLinks = document.querySelectorAll('nav a[href^="#"]');
    var sections = Array.from(document.querySelectorAll('section[id], div[id]'));
    var _rafNav = false;
    window.addEventListener('scroll', function() {
        if (_rafNav) return;
        _rafNav = true;
        requestAnimationFrame(function() {
            _rafNav = false;
            var sy = window.scrollY + 100;
            navLinks.forEach(function(a) { a.classList.remove('active'); });
            for (var i = sections.length - 1; i >= 0; i--) {
                if (sections[i].offsetTop <= sy) {
                    var id = sections[i].id;
                    var active = document.querySelector('nav a[href="#' + id + '"]');
                    if (active) active.classList.add('active');
                    break;
                }
            }
        });
    }, { passive: true });

