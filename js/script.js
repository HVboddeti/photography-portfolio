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

document.addEventListener("DOMContentLoaded", function () {
    // Constants
    const ADMIN_CODE = "1234"; // Change this to your real admin code
  
    // Get Elements
    const modal = document.getElementById("uploadModal");
    const addButton = document.getElementById("addButton");
    const closeButton = document.getElementById("closeButton");
    const adminAuth = document.getElementById("adminAuth");
    const uploadForm = document.getElementById("uploadForm");
    const authError = document.getElementById("authError");
  
    // Ensure all elements exist
    if (!modal || !addButton || !closeButton || !adminAuth || !uploadForm || !authError) {
        console.error("Error: Required elements not found. Check your HTML IDs.");
        return;
    }
  
    // Show Modal when clicking "+"
    addButton.addEventListener("click", function () {
        modal.style.display = "block";
        adminAuth.style.display = "block";
        uploadForm.style.display = "none";
        authError.style.display = "none";
        document.getElementById("adminCode").value = "";
    });
  
    // Close Modal
    closeButton.addEventListener("click", function () {
        modal.style.display = "none";
        resetForm();
    });
  
    // Handle Clicking Outside of Modal to Close
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
            resetForm();
        }
    });
  
    // Admin Verification
    window.verifyAdmin = function () {
        const adminCode = document.getElementById("adminCode").value;
        if (adminCode === ADMIN_CODE) {
            adminAuth.style.display = "none";
            uploadForm.style.display = "block";
            authError.style.display = "none";
        } else {
            authError.style.display = "block";
            authError.style.animation = "shake 0.5s";
            setTimeout(() => (authError.style.animation = ""), 500);
        }
    };
  
    // Upload Image Function
    window.uploadImage = function () {
        const section = document.getElementById("section").value;
        const imageFile = document.getElementById("imageUpload").files[0];
        const imageTitle = document.getElementById("imageTitle").value;
  
        if (!imageFile || !imageTitle) {
            alert("⚠️ Please fill in all fields before uploading.");
            return;
        }
  
        // Validate File Type
        const allowedFormats = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!allowedFormats.includes(imageFile.type)) {
            alert("⚠️ Only JPG, PNG, and WEBP formats are allowed!");
            return;
        }
  
        // Validate File Size (Max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (imageFile.size > maxSize) {
            alert("⚠️ File size exceeds 5MB limit!");
            return;
        }
  
        // Read Image File
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = document.createElement("img");
            img.src = event.target.result;
            img.alt = imageTitle;
            img.classList.add("uploaded-image");
  
            // Append image to the correct portfolio section
            const targetSection =
                section === "whispers"
                    ? document.querySelector(".portfolio__category:nth-child(2) .portfolio__grid")
                    : document.querySelector(".portfolio__category:nth-child(3) .portfolio__grid");
  
            const div = document.createElement("div");
            div.appendChild(img);
            targetSection.appendChild(div);
  
            alert("✅ Image uploaded successfully!");
            modal.style.display = "none";
            resetForm();
        };
  
        reader.readAsDataURL(imageFile);
    };
  
    // Reset Form Fields
    function resetForm() {
        document.getElementById("adminCode").value = "";
        document.getElementById("imageUpload").value = "";
        document.getElementById("imageTitle").value = "";
    }
});
