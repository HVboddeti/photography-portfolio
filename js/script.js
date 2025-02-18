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

/// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Admin code (in real implementation, this should be handled securely on the server)
    const ADMIN_CODE = '1234';

    // Get DOM elements
    const modal = document.getElementById('uploadModal');
    const addButton = document.querySelector('.add-button');
    const closeButton = document.querySelector('.close-button');
    const adminAuth = document.getElementById('adminAuth');
    const uploadForm = document.getElementById('uploadForm');
    const authError = document.getElementById('authError');

    // Make sure elements are found
    if (!modal || !addButton || !closeButton || !adminAuth || !uploadForm || !authError) {
        console.error('One or more elements not found');
        return;
    }

    // Add Button Click Event
    addButton.addEventListener('click', function() {
        console.log('Add button clicked'); // Debug log
        modal.style.display = 'block';
        adminAuth.style.display = 'block';
        uploadForm.style.display = 'none';
        authError.style.display = 'none';
        // Reset the admin code input
        document.getElementById('adminCode').value = '';
    });

    // Close Button Click Event
    closeButton.addEventListener('click', function() {
        console.log('Close button clicked'); // Debug log
        modal.style.display = 'none';
    });

    // Click Outside Modal to Close
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Admin Verification
    window.verifyAdmin = function() {
        const adminCode = document.getElementById('adminCode').value;
        console.log('Verifying admin code'); // Debug log
        
        if (adminCode === ADMIN_CODE) {
            adminAuth.style.display = 'none';
            uploadForm.style.display = 'block';
            authError.style.display = 'none';
        } else {
            authError.style.display = 'block';
            authError.textContent = 'Only Admin can use this.';
        }
    };

    // Image Upload
    window.uploadImage = function() {
        const section = document.getElementById('section').value;
        const imageFile = document.getElementById('imageUpload').files[0];
        const imageTitle = document.getElementById('imageTitle').value;

        if (!imageFile || !imageTitle) {
            alert('Please fill in all fields');
            return;
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('title', imageTitle);
        formData.append('section', section);

        // For demonstration purposes
        console.log('Uploading to section:', section);
        console.log('File:', imageFile.name);
        console.log('Title:', imageTitle);
        
        alert('Upload simulation complete!');
        modal.style.display = 'none';
        
        // Reset form
        document.getElementById('imageUpload').value = '';
        document.getElementById('imageTitle').value = '';
    };
});