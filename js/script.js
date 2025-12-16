// Dynamic Content Loading
let portfolioData = null;

// Load portfolio data from JSON
async function loadPortfolioData() {
    try {
        const response = await fetch('data/portfolio-data.json');
        if (!response.ok) {
            throw new Error('Failed to load portfolio data');
        }
        portfolioData = await response.json();
        return portfolioData;
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        return null;
    }
}

// Render portfolio categories dynamically
function renderPortfolio(data) {
    const portfolioContent = document.getElementById('portfolio-content');
    if (!portfolioContent || !data.portfolioCategories) return;

    portfolioContent.innerHTML = '';

    data.portfolioCategories.forEach((category, index) => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'portfolio__card';
        categoryCard.id = `category-${index}`;

        // Create background slideshow container
        const bgContainer = document.createElement('div');
        bgContainer.className = 'portfolio__card-bg';

        // Add all images as hidden (we'll rotate them)
        category.images.forEach((img, imgIndex) => {
            const imgElement = document.createElement('img');
            imgElement.src = img;
            imgElement.alt = category.title;
            imgElement.className = 'portfolio__card-img';
            if (imgIndex === 0) {
                imgElement.classList.add('active');
            }
            bgContainer.appendChild(imgElement);
        });

        // Create overlay with title
        const overlay = document.createElement('div');
        overlay.className = 'portfolio__card-overlay';

        const title = document.createElement('h3');
        title.className = 'portfolio__card-title';
        title.textContent = category.title;

        overlay.appendChild(title);

        categoryCard.appendChild(bgContainer);
        categoryCard.appendChild(overlay);
        portfolioContent.appendChild(categoryCard);

        // Add click handler to show category images
        categoryCard.addEventListener('click', () => {
            showCategoryImages(category, index);
        });

        // Start image rotation for this card
        if (category.images.length > 1) {
            rotateImages(categoryCard, category.images);
        }
    });
}

// Show all images from a category in 3-column grid
function showCategoryImages(category, categoryIndex) {
    const portfolioContent = document.getElementById('portfolio-content');
    if (!portfolioContent) return;

    portfolioContent.innerHTML = '';
    portfolioContent.style.gridTemplateColumns = 'repeat(3, 1fr)';

    // Add back button
    const backBtn = document.createElement('button');
    backBtn.className = 'portfolio__back-btn';
    backBtn.innerHTML = '<i class="ri-arrow-left-line"></i> Back to Categories';
    backBtn.addEventListener('click', () => {
        renderPortfolio(portfolioData);
    });
    
    const header = document.createElement('div');
    header.className = 'portfolio__detail-header';
    header.appendChild(backBtn);
    
    const titleEl = document.createElement('h2');
    titleEl.className = 'portfolio__detail-title';
    titleEl.textContent = category.title;
    header.appendChild(titleEl);

    portfolioContent.appendChild(header);

    // Create 3-column grid for images
    const grid = document.createElement('div');
    grid.className = 'portfolio__detail-grid';

    // Split images into 3 columns
    const imagesPerColumn = Math.ceil(category.images.length / 3);
    
    for (let i = 0; i < 3; i++) {
        const column = document.createElement('div');
        column.className = 'portfolio__detail-column';
        const startIndex = i * imagesPerColumn;
        const endIndex = Math.min(startIndex + imagesPerColumn, category.images.length);
        
        for (let j = startIndex; j < endIndex; j++) {
            const img = document.createElement('img');
            img.src = category.images[j];
            img.alt = category.title;
            img.loading = 'lazy';
            column.appendChild(img);
        }
        
        grid.appendChild(column);
    }

    portfolioContent.appendChild(grid);
}

// Rotate images in a card every 3 seconds
function rotateImages(cardElement, images) {
    let currentIndex = 0;

    setInterval(() => {
        const imgElements = cardElement.querySelectorAll('.portfolio__card-img');
        imgElements.forEach(img => img.classList.remove('active'));
        
        currentIndex = (currentIndex + 1) % images.length;
        imgElements[currentIndex].classList.add('active');
    }, 3000);
}

// Update site information
function updateSiteInfo(data) {
    if (!data.siteInfo) return;

    const headerTagline = document.getElementById('header-tagline');
    const headerLocation = document.getElementById('header-location');
    const aboutDescription = document.getElementById('about-description');
    const aboutMission = document.getElementById('about-mission');
    const contactDesc1 = document.getElementById('contact-description1');
    const contactDesc2 = document.getElementById('contact-description2');
    const footerTouch = document.getElementById('footer-touch');
    const footerCopyright = document.getElementById('footer-copyright');

    if (headerTagline) headerTagline.textContent = data.siteInfo.tagline;
    if (headerLocation) headerLocation.textContent = data.siteInfo.location;
    if (aboutDescription) aboutDescription.textContent = data.siteInfo.description;
    if (aboutMission) aboutMission.textContent = data.siteInfo.mission;
    if (contactDesc1) contactDesc1.textContent = data.contact.description1;
    if (contactDesc2) contactDesc2.textContent = data.contact.description2;
    if (footerTouch) footerTouch.textContent = data.footer.getInTouch;
    if (footerCopyright) footerCopyright.textContent = data.footer.copyright;
}

// Render social links
function renderSocialLinks(data) {
    if (!data.footer || !data.footer.socialLinks) return;

    const socialLinksContainer = document.getElementById('social-links');
    if (!socialLinksContainer) return;

    socialLinksContainer.innerHTML = '';

    data.footer.socialLinks.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        
        const icon = document.createElement('i');
        icon.className = link.icon;
        
        a.appendChild(icon);
        li.appendChild(a);
        socialLinksContainer.appendChild(li);
    });
}

// Initialize image modal
function initializeImageModal() {
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
            console.log("Image clicked:", this.src);
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
}

// Contact Form Handler
function initializeContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const nameInput = form.querySelector("input[placeholder='Your Name']");
    const emailInput = form.querySelector("input[placeholder='Your Email']");
    const messageInput = form.querySelector("input[placeholder='Your Message']");
    
    // Create status message element
    let statusMessage = form.querySelector('.form-status');
    if (!statusMessage) {
        statusMessage = document.createElement("p");
        statusMessage.className = 'form-status';
        statusMessage.style.marginTop = "10px";
        form.appendChild(statusMessage);
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Input Validation
        if (!validateForm(nameInput, emailInput, messageInput, statusMessage)) {
            return;
        }

        // Send WhatsApp Message
        await sendWhatsAppMessage(
            nameInput.value.trim(), 
            emailInput.value.trim(), 
            messageInput.value.trim(), 
            statusMessage
        );

        // Reset form fields
        form.reset();
    });
}

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
    const whatsappNumber = "15712838727";
    const apiKey = "7801597";
    const whatsappMessage = `New Contact Form Submission:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;

    try {
        const response = await fetch(
            `https://api.callmebot.com/whatsapp.php?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}&apikey=${apiKey}`
        );

        if (response.ok) {
            console.log("WhatsApp notification sent successfully.");
            status.textContent = "✅ Message sent successfully!";
            status.style.color = "green";
        } else {
            throw new Error("Failed to send WhatsApp message.");
        }
    } catch (error) {
        console.error("WhatsApp API Error:", error);
        status.textContent = "⚠️ Failed to send message. Try again later.";
        status.style.color = "red";
    }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
    // Load dynamic content first
    const data = await loadPortfolioData();
    if (data) {
        updateSiteInfo(data);
        renderPortfolio(data);
        renderSocialLinks(data);
        
        // Initialize modal after portfolio is rendered
        initializeImageModal();
    }
    
    // Initialize contact form
    initializeContactForm();

    // Hamburger menu functionality
    const menuBtn = document.getElementById("menu-btn");
    const navLinks = document.getElementById("nav-links");
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("open");
        });

        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll("a");
        links.forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
            });
        });
    }
});
