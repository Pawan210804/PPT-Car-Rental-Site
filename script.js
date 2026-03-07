// --- EmailJS Form Submission Logic ---
// This handles the booking form without refreshing the page
document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents the default form reload

    // Identify the submit button to provide visual feedback to the user
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Sending Request...';

    // Sends the form data to EmailJS using your verified keys
    // Service ID: service_mp3z5wa | Template ID: template_tgoh737
    emailjs.sendForm('service_mp3z5wa', 'template_tgoh737', this)
        .then(function() {
            // Success: Show popup, reset form fields, and restore button text
            alert('Success! Your booking request has been sent to PawanPutra Travel.');
            document.getElementById('bookingForm').reset();
            submitBtn.innerText = originalText;
        }, function(error) {
            // Error: Notify user and log the technical error to the console
            alert('FAILED to send message. Please try again or contact us on WhatsApp.');
            console.log('EmailJS Error:', error);
            submitBtn.innerText = originalText;
        });
});

// --- About Us Image Slider Logic ---
// Controls the manual image transitions in the About section
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');

function changeSlide(direction) {
    // Hide the current active slide
    slides[currentSlideIndex].classList.remove('active');
    
    // Calculate the next slide index
    currentSlideIndex += direction;
    
    // Loop back to the start or end if boundaries are reached
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } 
    else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    // Show the new active slide
    slides[currentSlideIndex].classList.add('active');
}

// --- Gallery Horizontal Scroll Logic ---
// Handles the smooth left/right scrolling for the 20+ photo gallery
function slideGallery(direction) {
    const track = document.getElementById('galleryTrack');
    // Defines scroll distance (300px image width + 15px gap)
    const scrollAmount = 315; 
    
    track.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}