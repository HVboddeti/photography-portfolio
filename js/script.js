document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        status.textContent = "Message sent successfully!";
        status.style.color = "lightgreen";

        // Reset form
        form.reset();
    });
});


document.getElementById("contact-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    // Send WhatsApp Message using CallMeBot API
    const whatsappNumber = "15712838727"; // Use international format (e.g., +123456789)
    const apiKey = "7801597"; // Get your API key from CallMeBot

    const whatsappMessage = `New Contact Form Submission:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;

    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}&apikey=${apiKey}`);

    // Submit Form to FormSubmit
    this.submit();
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const ADMIN_CODE = '1234';

    // DOM Elements
    const modal = document.getElementById('uploadModal');
    const addButton = document.getElementById('addButton');
    const closeButton = document.getElementById('closeButton');
    const adminAuth = document.getElementById('adminAuth');
    const uploadForm = document.getElementById('uploadForm');
    const authError = document.getElementById('authError');

    // Verify all elements are found
    if (!modal || !addButton || !closeButton || !adminAuth || !uploadForm || !authError) {
        console.error('Required elements not found. Check your HTML IDs.');
        return;
    }

    // Event Listeners
    addButton.addEventListener('click', showModal);
    closeButton.addEventListener('click', hideModal);
    window.addEventListener('click', handleOutsideClick);

    // Show Modal Function
    function showModal() {
        modal.style.display = 'block';
        adminAuth.style.display = 'block';
        uploadForm.style.display = 'none';
        authError.style.display = 'none';
        // Reset form
        document.getElementById('adminCode').value = '';
    }

    // Hide Modal Function
    function hideModal() {
        modal.style.display = 'none';
        // Reset forms
        document.getElementById('adminCode').value = '';
        document.getElementById('imageUpload').value = '';
        document.getElementById('imageTitle').value = '';
    }

    // Handle Outside Click
    function handleOutsideClick(event) {
        if (event.target === modal) {
            hideModal();
        }
    }

    // Make functions global for onclick handlers
    window.verifyAdmin = function() {
        const adminCode = document.getElementById('adminCode').value;
        
        if (adminCode === ADMIN_CODE) {
            adminAuth.style.display = 'none';
            uploadForm.style.display = 'block';
            authError.style.display = 'none';
        } else {
            authError.style.display = 'block';
            // Shake animation for error message
            authError.style.animation = 'shake 0.5s';
            setTimeout(() => {
                authError.style.animation = '';
            }, 500);
        }
    };

    window.uploadImage = function() {
        const section = document.getElementById('section').value;
        const imageFile = document.getElementById('imageUpload').files[0];
        const imageTitle = document.getElementById('imageTitle').value;

        if (!imageFile || !imageTitle) {
            alert('Please fill in all fields');
            return;
        }

        // Create FormData for upload
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('title', imageTitle);
        formData.append('section', section);

        // Here you would typically send the formData to your server
        // For demonstration, we'll just show an alert
        alert(`Image "${imageTitle}" would be uploaded to ${section} section`);
        
        // Reset and close modal
        hideModal();
    };
});