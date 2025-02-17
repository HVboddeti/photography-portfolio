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


document.getElementById("addImageBtn").addEventListener("click", function () {
    document.getElementById("uploadForm").classList.add("active");
  });
  
  function closeForm() {
    document.getElementById("uploadForm").classList.remove("active");
  }
  
  
  function uploadImage() {
    const adminCode = document.getElementById("adminCode").value;
    const correctCode = "1234"; // Change this to your secure admin code
    const category = document.getElementById("categorySelect").value;
    const fileInput = document.getElementById("imageUpload");
  
    if (adminCode !== correctCode) {
      alert("Incorrect Admin Code!");
      return;
    }
  
    if (!fileInput.files.length) {
      alert("Please select an image to upload.");
      return;
    }
  
    const file = fileInput.files[0];
    const reader = new FileReader();
  
    reader.onload = function (event) {
      const img = document.createElement("img");
      img.src = event.target.result;
      img.alt = "New Image";
  
      const section =
        category === "whispers"
          ? document.querySelector(".portfolio__category:nth-child(2) .portfolio__grid")
          : document.querySelector(".portfolio__category:nth-child(3) .portfolio__grid");
  
      const div = document.createElement("div");
      div.appendChild(img);
      section.appendChild(div);
  
      alert("Image uploaded successfully!");
      closeForm();
    };
  
    reader.readAsDataURL(file);
  }
  