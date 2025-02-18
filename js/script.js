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

// Admin code (in real implementation, this should be handled securely on the server)
const ADMIN_CODE = '1234';

// Get DOM elements
const modal = document.getElementById('uploadModal');
const addButton = document.querySelector('.add-button');
const closeButton = document.querySelector('.close-button');
const adminAuth = document.getElementById('adminAuth');
const uploadForm = document.getElementById('uploadForm');
const authError = document.getElementById('authError');

// Event Listeners
addButton.addEventListener('click', () => {
    modal.style.display = 'block';
    adminAuth.style.display = 'block';
    uploadForm.style.display = 'none';
    authError.style.display = 'none';
});

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('adminCode').value = '';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.getElementById('adminCode').value = '';
    }
});

function verifyAdmin() {
    const adminCode = document.getElementById('adminCode').value;
    
    if (adminCode === ADMIN_CODE) {
        adminAuth.style.display = 'none';
        uploadForm.style.display = 'block';
        authError.style.display = 'none';
    } else {
        authError.style.display = 'block';
    }
}

function uploadImage() {
    const section = document.getElementById('section').value;
    const imageFile = document.getElementById('imageUpload').files[0];
    const imageTitle = document.getElementById('imageTitle').value;

    if (!imageFile || !imageTitle) {
        alert('Please fill in all fields');
        return;
    }

    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', imageTitle);
    formData.append('section', section);

    // Example fetch request (you'll need to implement the server endpoint)
    /*
    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert('Upload successful!');
        modal.style.display = 'none';
        // Refresh the page or update the UI
    })
    .catch(error => {
        alert('Upload failed: ' + error.message);
    });
    */

    // For demonstration purposes, just show an alert
    alert('Upload functionality would go here');
    modal.style.display = 'none';
}
  