document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".contact form"); // Get the form
    const nameInput = form.querySelector("input[placeholder='Your Name']");
    const emailInput = form.querySelector("input[placeholder='Your Email']");
    const messageInput = form.querySelector("input[placeholder='Your Message']");
    const statusMessage = document.createElement("p"); // Element for success/error messages
    statusMessage.style.marginTop = "10px";
    form.appendChild(statusMessage); // Append status message to the form

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission

        // Input Validation
        if (!validateForm(nameInput, emailInput, messageInput, statusMessage)) {
            return;
        }

        // Form Data
        const formData = new FormData();
        formData.append("name", nameInput.value.trim());
        formData.append("email", emailInput.value.trim());
        formData.append("message", messageInput.value.trim());

        // Send WhatsApp Message
        await sendWhatsAppMessage(nameInput.value, emailInput.value, messageInput.value, statusMessage);

        // Reset form fields
        form.reset();
        statusMessage.textContent = "✅ Message sent successfully!";
        statusMessage.style.color = "green";
    });

    // Validate Form Function
    function validateForm(name, email, message, status) {
        if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
            status.textContent = "⚠️ Please fill in all fields!";
            status.style.color = "red";
            return false;
        }

        if (!validateEmail(email.value.trim())) {
            status.textContent = "⚠️ Please enter a valid email!";
            status.style.color = "red";
            return false;
        }

        return true;
    }

    // Email Validation
    function validateEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    // Send WhatsApp Message
    async function sendWhatsAppMessage(name, email, message, status) {
        const whatsappNumber = "15712838727"; // Your WhatsApp Number
        const apiKey = "7801597"; // CallMeBot API Key
        const whatsappMessage = `New Contact Form Submission:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;

        try {
            const response = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}&apikey=${apiKey}`);

            if (response.ok) {
                console.log("WhatsApp notification sent successfully.");
            } else {
                throw new Error("Failed to send WhatsApp message.");
            }
        } catch (error) {
            console.error("WhatsApp API Error:", error);
            status.textContent = "⚠️ Failed to send message. Try again later.";
            status.style.color = "red";
        }
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeModal = document.getElementById("closeModal");

    if (!modal || !modalImg || !closeModal) {
        console.error("Modal elements not found. Check your HTML structure.");
        return;
    }

    // Select all portfolio images
    document.querySelectorAll(".portfolio__grid img").forEach(img => {
        img.addEventListener("click", function () {
            console.log("Image clicked:", this.src); // Debugging
            modal.style.display = "flex";
            modalImg.src = this.src;
        });
    });

    // Close modal when clicking close button
    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Close modal when clicking outside the image
    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // Close modal when pressing ESC key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            modal.style.display = "none";
        }
    });
});

