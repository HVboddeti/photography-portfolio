// Dynamic Content Loading
let portfolioData = null;
let heicCache = new Map(); // Cache converted HEIC images
const ASSET_VERSION = 'v3'; // cache-busting token for static assets
let inDetailView = false; // Track when a category grid is open
const isMobile = window.matchMedia('(max-width: 768px)').matches;

// Ensure local asset URLs resolve correctly in production
function normalizeImageUrl(url) {
    if (!url) return url;
    // Leave external URLs as-is
    if (/^https?:\/\//i.test(url)) return url;
    // Already absolute
    if (url.startsWith('/')) return `${url}?v=${ASSET_VERSION}`;
    // Make root-relative to avoid nested path issues and bust stale caches
    return `/${url}?v=${ASSET_VERSION}`;
}

// Apply Cloudinary transforms for performance
function optimizeImageUrl(url, variant = 'grid') {
    // Only transform Cloudinary URLs
    if (!url || !url.includes('res.cloudinary.com')) return url;
    const quality = 'q_auto:eco';
    const format = 'f_auto';
    const width = variant === 'modal' ? 'w_1600' : 'w_900';
    return url.replace('/upload/', `/upload/${format},${quality},${width}/`);
}

// Convert HEIC image to JPG blob URL
async function convertHeicToJpg(imageUrl) {
    // Check cache first
    if (heicCache.has(imageUrl)) {
        return heicCache.get(imageUrl);
    }

    try {
        // Check if heic2any is available
        if (typeof heic2any === 'undefined') {
            console.warn('heic2any library not loaded');
            return imageUrl;
        }

        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }
        
        const blob = await response.blob();
        
        // Check if it's actually a HEIC file
        if (blob.type === 'image/heic' || blob.type === 'image/heif' || imageUrl.toLowerCase().endsWith('.heic')) {
            const convertedBlob = await heic2any({
                blob: blob,
                toType: 'image/jpeg',
                quality: 0.9
            });
            const blobUrl = URL.createObjectURL(convertedBlob);
            heicCache.set(imageUrl, blobUrl);
            return blobUrl;
        }
        
        // Not a HEIC file, return original URL
        return imageUrl;
    } catch (error) {
        console.warn('Failed to convert HEIC image:', imageUrl, error);
        return imageUrl; // Return original URL on error
    }
}

// Check if image is HEIC format
function isHeicImage(imageUrl) {
    return imageUrl.toLowerCase().endsWith('.heic') || imageUrl.toLowerCase().endsWith('.heif');
}

// Load portfolio data from JSON
async function loadPortfolioData() {
    try {
        const response = await fetch('data/portfolio-data.json');
        if (!response.ok) {
            throw new Error('Failed to load portfolio data');
        }
        portfolioData = await response.json();
        
        // Filter out HEIC files from all categories (not supported in browsers)
        if (portfolioData && portfolioData.portfolioCategories) {
            portfolioData.portfolioCategories.forEach(category => {
                const originalCount = category.images.length;
                category.images = category.images.filter(img => {
                    const isHeic = img.toLowerCase().endsWith('.heic') || img.toLowerCase().endsWith('.heif');
                    if (isHeic) {
                        console.warn('Removing unsupported HEIC file:', img);
                    }
                    return !isHeic;
                });
                const removedCount = originalCount - category.images.length;
                if (removedCount > 0) {
                    console.log(`Removed ${removedCount} HEIC files from category: ${category.title}`);
                }
            });
        }
        
        console.log('Portfolio data loaded:', portfolioData);
        return portfolioData;
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        return null;
    }
}

// Render portfolio categories dynamically
function renderPortfolio(data) {
    console.log('renderPortfolio called, closing detail view');
    const portfolioContent = document.getElementById('portfolio-content');
    console.log('renderPortfolio called with data:', data);
    console.log('portfolio-content element:', portfolioContent);
    
    if (!portfolioContent || !data || !data.portfolioCategories) {
        console.error('Missing data or portfolio-content element');
        return;
    }

    portfolioContent.innerHTML = '';
    // Reset any inline styles that may force incorrect layout
    portfolioContent.removeAttribute('style');
    inDetailView = false; // back to category cards
    console.log('Detail view closed, returning to categories');

    console.log('Number of categories:', data.portfolioCategories.length);

    data.portfolioCategories.forEach((category, index) => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'portfolio__card';
        categoryCard.id = `category-${index}`;

        // Create background slideshow container
        const bgContainer = document.createElement('div');
        bgContainer.className = 'portfolio__card-bg';

        // Add all images as hidden (we'll rotate them)
        if (!category.images || category.images.length === 0) {
            // Still render a card with title so user can see category exists
            const emptyImg = document.createElement('img');
            emptyImg.className = 'portfolio__card-img active';
            emptyImg.alt = category.title;
            emptyImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23eee" width="100" height="100"/%3E%3Ctext x="50" y="55" font-size="12" text-anchor="middle" fill="%23999"%3ENo Images%3C/text%3E%3C/svg%3E';
            bgContainer.appendChild(emptyImg);
        } else {
        category.images.forEach((img, imgIndex) => {
            const imgElement = document.createElement('img');
            // Use optimized Cloudinary URLs when possible
            const src = optimizeImageUrl(normalizeImageUrl(img), 'grid');
            imgElement.src = src; // All non-HEIC now
            imgElement.alt = category.title;
            imgElement.className = 'portfolio__card-img';

            // Fallback if the card background image fails to load
            imgElement.onerror = function () {
                console.warn('Card image failed to load:', this.src);
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23eee" width="100" height="100"/%3E%3Ctext x="50" y="55" font-size="12" text-anchor="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
            };

            if (imgIndex === 0) {
                imgElement.classList.add('active');
            }
            bgContainer.appendChild(imgElement);
        });
        }

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

        // Start image rotation for this card (skip on mobile to reduce crashes/memory)
        if (category.images.length > 1 && !isMobile) {
            rotateImages(categoryCard, category.images);
        }
    });
    
    console.log('Portfolio rendered successfully');
}

// Show all images from a category in 3-column grid
function showCategoryImages(category, categoryIndex) {
    console.log(`Opening category: ${category.title}`);
    const portfolioContent = document.getElementById('portfolio-content');
    if (!portfolioContent) return;

    portfolioContent.innerHTML = '';
    portfolioContent.style.display = 'block'; // Change from grid to block for detail view
    inDetailView = true;

    // Add back button
    const backBtn = document.createElement('button');
    backBtn.className = 'portfolio__back-btn';
    backBtn.type = 'button'; // Ensure it's not treated as form submit
    backBtn.innerHTML = '<i class="ri-arrow-left-line"></i> Back to Categories';
    backBtn.addEventListener('click', (e) => {
        console.log('Back button clicked');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
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
            const imageUrl = optimizeImageUrl(normalizeImageUrl(category.images[j]), 'grid');

            img.alt = category.title;
            img.loading = 'lazy';

            // All HEIC files are filtered out during data load; set src directly
            img.src = imageUrl;

            // Replace broken images with a visible placeholder so grid stays intact
            img.onerror = function () {
                console.warn('Failed to load image:', this.src);
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23eee" width="100" height="100"/%3E%3Ctext x="50" y="55" font-size="12" text-anchor="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
            };

            // Open modal on click without bubbling to parent
            img.addEventListener('click', function (e) {
                e.stopPropagation();
                openImageModal(optimizeImageUrl(category.images[j], 'modal'), category.images, j);
            });

            column.appendChild(img);
        }
        
        grid.appendChild(column);
    }

    portfolioContent.appendChild(grid);
}

// Rotate images in a card every 3 seconds
function rotateImages(cardElement, images) {
    try {
        let currentIndex = 0;

        const intervalId = setInterval(() => {
            try {
                const imgElements = cardElement.querySelectorAll('.portfolio__card-img');
                if (!imgElements || imgElements.length === 0) {
                    clearInterval(intervalId);
                    return;
                }
                imgElements.forEach(img => img.classList.remove('active'));
                
                currentIndex = (currentIndex + 1) % images.length;
                if (imgElements[currentIndex]) {
                    imgElements[currentIndex].classList.add('active');
                }
            } catch (e) {
                console.error('Error in rotateImages interval:', e);
                clearInterval(intervalId);
            }
        }, 3000);
    } catch (e) {
        console.error('Error initializing rotateImages:', e);
    }
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

// Image modal state
let currentModalImages = [];
let currentModalIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

// Open image modal
function openImageModal(imageSrc, imagesArray, index) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");

    if (!modal || !modalImg) {
        console.error("Modal elements not found");
        return;
    }

    currentModalImages = imagesArray;
    currentModalIndex = index;

    modal.style.display = "flex";
    modalImg.src = imageSrc;
    
    // Add error handler for modal images
    modalImg.onerror = function() {
        console.warn('Failed to load modal image:', this.src);
        closeImageModal();
        alert('Sorry, this image could not be loaded.');
    };
    
    document.body.style.overflow = "hidden"; // Prevent background scrolling
}

// Close image modal
function closeImageModal() {
    const modal = document.getElementById("imageModal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = ""; // Restore scrolling
    }
}

// Navigate modal images
function navigateModal(direction) {
    if (currentModalImages.length === 0) return;

    if (direction === 'next') {
        currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
    } else if (direction === 'prev') {
        currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
    }

    const modalImg = document.getElementById("modalImage");
    if (modalImg) {
        modalImg.src = normalizeImageUrl(currentModalImages[currentModalIndex]);
    }
}

// Handle swipe gestures
function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance for swipe
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped left - show next image
            navigateModal('next');
        } else {
            // Swiped right - show previous image
            navigateModal('prev');
        }
    }
}

// Initialize image modal
function initializeImageModal() {
    const modal = document.getElementById("imageModal");
    const closeModal = document.getElementById("closeModal");
    const modalPrev = document.getElementById("modalPrev");
    const modalNext = document.getElementById("modalNext");

    if (!modal || !closeModal) {
        console.error("Modal elements not found");
        return;
    }

    // Close modal when clicking close button
    closeModal.addEventListener("click", function(e) {
        e.stopPropagation();
        closeImageModal();
    });

    // Navigation arrow buttons
    if (modalPrev) {
        modalPrev.addEventListener("click", function(e) {
            e.stopPropagation();
            navigateModal('prev');
        });
    }
    
    if (modalNext) {
        modalNext.addEventListener("click", function(e) {
            e.stopPropagation();
            navigateModal('next');
        });
    }

    // Close modal when clicking outside the image
    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
        if (modal.style.display === "flex") {
            if (e.key === "Escape") {
                closeImageModal();
            } else if (e.key === "ArrowLeft") {
                navigateModal('prev');
            } else if (e.key === "ArrowRight") {
                navigateModal('next');
            }
        }
    });

    // Touch/swipe navigation (desktop/tablet only; disable on mobile to avoid back-swipe conflicts)
    const modalImg = document.getElementById("modalImage");
    if (modalImg && !isMobile) {
        modalImg.addEventListener("touchstart", handleTouchStart, false);
        modalImg.addEventListener("touchend", handleTouchEnd, false);
    }
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
    console.log('DOMContentLoaded fired');
    
    // Load dynamic content first
    const data = await loadPortfolioData();
    console.log('Data returned from loadPortfolioData:', data);
    
    if (data) {
        updateSiteInfo(data);
        renderPortfolio(data);
        renderSocialLinks(data);
        
        // Initialize modal after portfolio is rendered
        initializeImageModal();
    } else {
        console.error('No data loaded');
    }
    
    // Initialize contact form
    initializeContactForm();

    // Hamburger menu functionality
    const menuBtn = document.getElementById("menu-btn");
    const navLinks = document.getElementById("nav-links");
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", (e) => {
            e.preventDefault();
            navLinks.classList.toggle("open");
        });

        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll("a");
        links.forEach(link => {
            link.addEventListener("click", (e) => {
                // If in detail view, prevent accidental navigation;
                // user can use back button or explicitly choose nav.
                if (inDetailView && link.getAttribute('href') === '#home') {
                    e.preventDefault();
                    e.stopPropagation();
                    renderPortfolio(portfolioData);
                }
                navLinks.classList.remove("open");
            });
        });
    }

});

// Global error handler to prevent crashes
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    event.preventDefault();
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent crashing
});

// Additional safety: catch any synchronous errors in DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        try {
            console.log('DOM fully loaded and parsed');
        } catch (e) {
            console.error('Error in DOMContentLoaded handler:', e);
        }
    });
}
