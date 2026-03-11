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
        const wrap      = document.getElementById('razorpay-btn-wrap');
        const confirmed = document.getElementById('payment-confirmed');
        if (radio.value === 'none') {
            wrap.style.display = 'none';
            confirmed.style.display = 'none';
            advancePaid   = false;
            advanceAmount = 0;
        } else {
            wrap.style.display = 'block';
            confirmed.style.display = 'none';
            advancePaid   = false;
            advanceAmount = parseInt(radio.value);
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
        bookingForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const selectedPayment = document.querySelector('[name="advance_payment"]:checked').value;
            if (selectedPayment !== 'none' && !advancePaid) {
                alert('Please complete the advance payment first, or select "No advance — confirm via WhatsApp".');
                return;
            }

            const submitBtn   = document.getElementById('submitBtn');
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled  = true;

            const name     = this.customer_name.value;
            const phone    = this.customer_phone.value;
            const email    = this.customer_email.value;
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

                    // Step 4: Show success message
                    bookingForm.innerHTML =
                        '<div class="booking-success">' +
                        '<div class="success-icon">✅</div>' +
                        '<h3>Booking Request Sent!</h3>' +
                        '<p>A confirmation email has been sent to <strong>' + email + '</strong></p>' +
                        '<p>WhatsApp has opened — just press Send.</p>' +
                        '<p>Pramod will confirm within <strong>30 minutes</strong>.</p>' +
                        '<a href="https://wa.me/919650473759" class="btn-yellow" target="_blank" ' +
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
            const stars  = '⭐'.repeat(parseInt(rating));
            const grid   = document.querySelector('.reviews-grid');
            const card   = document.createElement('div');
            card.className   = 'review-card';
            card.innerHTML   = `<div class="stars">${stars}</div><p>"${text}"</p><h4>- ${name}</h4>`;
            grid.appendChild(card);
            reviewForm.reset();
            alert('Thank you for your review!');
        });
    }



    // ── 8. LOADING SCREEN ────────────────────────────────────
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(function () { loader.classList.add('hidden'); }, 1600);
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

}); // end DOMContentLoaded