// Admin Panel JavaScript
const ADMIN_PASSWORD = "harsha2024"; // Change this to your secure password
const CLOUDINARY_KEY = 'cloudinary_cloud_name';
const SAVE_ENDPOINT = '/.netlify/functions/save-portfolio';
let portfolioData = null;
let cloudinaryCloudName = localStorage.getItem(CLOUDINARY_KEY) || '';
let cloudinaryReady = false;
let cloudinaryLoading = false;

// Load Cloudinary Script
function loadCloudinaryScript() {
    if (window.cloudinary) {
        cloudinaryReady = true;
        return Promise.resolve(true);
    }

    if (cloudinaryLoading) {
        return new Promise(resolve => {
            document.addEventListener('cloudinary:ready', () => resolve(true), { once: true });
        });
    }

    cloudinaryLoading = true;

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://upload-widget.cloudinary.com/latest/CloudinaryUploadWidget.js';
        script.onload = () => {
            cloudinaryReady = true;
            cloudinaryLoading = false;
            document.dispatchEvent(new Event('cloudinary:ready'));
            resolve(true);
        };
        script.onerror = (err) => {
            cloudinaryLoading = false;
            reject(err);
        };
        document.body.appendChild(script);
    });
}

// Check if already logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showDashboard();
    }
}

// Login Handler
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    const errorMsg = document.getElementById('login-error');

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
        errorMsg.textContent = '';
    } else {
        errorMsg.textContent = '❌ Incorrect password!';
    }
});

// Logout Handler
document.getElementById('logout-btn').addEventListener('click', function() {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
});

// Render Portfolio Categories
function renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';

    portfolioData.portfolioCategories.forEach((category, categoryIndex) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-section';
        
        categoryDiv.innerHTML = `
            <div class="category-header">
                <h3>${category.title}</h3>
                <div class="category-actions">
                    <button class="btn-secondary" onclick="deleteCategory(${categoryIndex})">
                        <i class="ri-delete-bin-line"></i> Delete Category
                    </button>
                </div>
            </div>
            <div class="image-upload-area" data-category="${categoryIndex}">
                <label class="upload-box">
                    <i class="ri-upload-cloud-line"></i>
                    <span>Click to upload images or drag & drop</span>
                    <input type="file" accept="image/*" multiple onchange="handleImageUpload(event, ${categoryIndex})">
                </label>
            </div>
            <div class="images-grid" id="images-grid-${categoryIndex}">
                ${category.images.map((img, imgIndex) => `
                    <div class="image-item">
                        <img src="${img}" alt="${category.title}">
                        <button class="delete-img-btn" onclick="deleteImage(${categoryIndex}, ${imgIndex})">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(categoryDiv);
    });
}

// Handle Image Upload
async function handleImageUpload(event, categoryIndex) {
    event.preventDefault();
    
    const cloudName = localStorage.getItem(CLOUDINARY_KEY) || cloudinaryCloudName;
    
    if (!cloudName) {
        showNotification('Please set your Cloudinary Cloud Name in the Settings tab first.', 'error');
        document.querySelector('[data-tab="settings"]').click();
        return;
    }
    
    try {
        await loadCloudinaryScript();
    } catch (err) {
        showNotification('Cloudinary failed to load. Please refresh and try again.', 'error');
        return;
    }

    if (typeof cloudinary === 'undefined') {
        showNotification('Cloudinary is still loading. Please try again in a moment.', 'error');
        return;
    }
    
    // Open Cloudinary upload widget
    cloudinary.openUploadWidget({
        cloudName: cloudName,
        uploadPreset: 'portfolio_present',  // Ensure this preset exists in your Cloudinary account
        multiple: true,  // Allow multiple file selection
        maxFiles: 20,    // Limit to 20 files at once
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 20000000,  // 20MB max
        folder: 'portfolio'     // Optional: organize uploads in a folder
    }, function(error, result) {
        if (!error && result && result.event === "queues-end") {
            // Process all successful uploads
            const uploadedUrls = result.info.files.map(file => file.uploadInfo.secure_url);
            
            if (uploadedUrls.length > 0) {
                portfolioData.portfolioCategories[categoryIndex].images.push(...uploadedUrls);
                renderCategories();
                showNotification(`${uploadedUrls.length} image(s) added! Click "Save All Changes" to persist.`, 'success');
            }
        } else if (error && error.status !== 'dismissed') {
            showNotification('Upload failed: ' + error.message, 'error');
        }
    });
}

// Delete Image
function deleteImage(categoryIndex, imageIndex) {
    if (confirm('Are you sure you want to delete this image?')) {
        portfolioData.portfolioCategories[categoryIndex].images.splice(imageIndex, 1);
        renderCategories();
        showNotification('Image removed! Click "Save All Changes" to persist.', 'success');
    }
}

// Delete Category
function deleteCategory(categoryIndex) {
    if (confirm('Are you sure you want to delete this entire category?')) {
        portfolioData.portfolioCategories.splice(categoryIndex, 1);
        renderCategories();
        showNotification('Category removed! Click "Save All Changes" to persist.', 'success');
    }
}

// Add Category Modal
document.getElementById('add-category-btn').addEventListener('click', function() {
    document.getElementById('category-modal').classList.remove('hidden');
});

document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('category-modal').classList.add('hidden');
});

document.getElementById('save-category-btn').addEventListener('click', function() {
    const id = document.getElementById('new-category-id').value.trim();
    const title = document.getElementById('new-category-title').value.trim();
    
    if (!id || !title) {
        alert('Please fill in all fields');
        return;
    }
    
    portfolioData.portfolioCategories.push({
        id: id,
        title: title,
        images: []
    });
    
    renderCategories();
    document.getElementById('category-modal').classList.add('hidden');
    document.getElementById('new-category-id').value = '';
    document.getElementById('new-category-title').value = '';
    
    showNotification('Category added! Click "Save All Changes" to persist.', 'success');
});

// Populate Site Info Form
function populateSiteInfo() {
    document.getElementById('site-title').value = portfolioData.siteInfo.title;
    document.getElementById('site-photographer').value = portfolioData.siteInfo.photographer;
    document.getElementById('site-location').value = portfolioData.siteInfo.location;
    document.getElementById('site-tagline').value = portfolioData.siteInfo.tagline;
    document.getElementById('site-description').value = portfolioData.siteInfo.description;
    document.getElementById('site-mission').value = portfolioData.siteInfo.mission;
}

// Save Site Info
document.getElementById('site-info-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    portfolioData.siteInfo.title = document.getElementById('site-title').value;
    portfolioData.siteInfo.photographer = document.getElementById('site-photographer').value;
    portfolioData.siteInfo.location = document.getElementById('site-location').value;
    portfolioData.siteInfo.tagline = document.getElementById('site-tagline').value;
    portfolioData.siteInfo.description = document.getElementById('site-description').value;
    portfolioData.siteInfo.mission = document.getElementById('site-mission').value;
    
    saveAllChanges();
});

// Populate Contact Info
function populateContactInfo() {
    document.getElementById('contact-desc1').value = portfolioData.contact.description1;
    document.getElementById('contact-desc2').value = portfolioData.contact.description2;
    document.getElementById('footer-touch').value = portfolioData.footer.getInTouch;
    document.getElementById('footer-copyright').value = portfolioData.footer.copyright;
    
    renderSocialLinks();
}

// Render Social Links Editor
function renderSocialLinks() {
    const container = document.getElementById('social-links-editor');
    container.innerHTML = '';
    
    portfolioData.footer.socialLinks.forEach((link, index) => {
        const linkDiv = document.createElement('div');
        linkDiv.className = 'social-link-item';
        linkDiv.innerHTML = `
            <input type="text" value="${link.platform}" placeholder="Platform (e.g., facebook)" 
                   onchange="updateSocialLink(${index}, 'platform', this.value)">
            <input type="text" value="${link.icon}" placeholder="Icon class (e.g., ri-facebook-fill)" 
                   onchange="updateSocialLink(${index}, 'icon', this.value)">
            <input type="text" value="${link.url}" placeholder="URL" 
                   onchange="updateSocialLink(${index}, 'url', this.value)">
            <button type="button" class="btn-danger" onclick="deleteSocialLink(${index})">
                <i class="ri-delete-bin-line"></i>
            </button>
        `;
        container.appendChild(linkDiv);
    });
}

// Update Social Link
function updateSocialLink(index, field, value) {
    portfolioData.footer.socialLinks[index][field] = value;
}

// Delete Social Link
function deleteSocialLink(index) {
    portfolioData.footer.socialLinks.splice(index, 1);
    renderSocialLinks();
}

// Add Social Link
document.getElementById('add-social-btn').addEventListener('click', function() {
    portfolioData.footer.socialLinks.push({
        platform: '',
        icon: '',
        url: ''
    });
    renderSocialLinks();
});

// Save Contact Info
document.getElementById('contact-form-info').addEventListener('submit', function(e) {
    e.preventDefault();
    
    portfolioData.contact.description1 = document.getElementById('contact-desc1').value;
    portfolioData.contact.description2 = document.getElementById('contact-desc2').value;
    portfolioData.footer.getInTouch = document.getElementById('footer-touch').value;
    portfolioData.footer.copyright = document.getElementById('footer-copyright').value;
    
    saveAllChanges();
});

// Save All Changes
async function saveAllChanges() {
    const autoSave = localStorage.getItem('auto_save_enabled') === 'true';

    if (!autoSave) {
        // Manual download path
        const dataStr = JSON.stringify(portfolioData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'portfolio-data.json';
        link.click();
        showNotification('✅ Downloaded JSON. Replace data/portfolio-data.json and push to deploy.', 'success', 5000);
        return;
    }

    // Auto-save via Netlify Function
    try {
        let token = null;
        if (window.netlifyIdentity && netlifyIdentity.currentUser()) {
            token = await netlifyIdentity.currentUser().jwt();
        }

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(SAVE_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify({ data: portfolioData, commitMessage: 'Update portfolio data via admin' })
        });

        if (!response.ok) {
            throw new Error('Save function error');
        }

        showNotification('✅ Changes saved and committed! Netlify will redeploy shortly.', 'success', 5000);
    } catch (err) {
        const dataStr = JSON.stringify(portfolioData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'portfolio-data.json';
        link.click();
        showNotification('⚠️ Auto-save failed. Download the JSON and replace data/portfolio-data.json manually.', 'error', 6000);
    }
}

// Show Notification
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.getElementById('save-notification');
    const messageEl = document.getElementById('notification-message');
    
    messageEl.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, duration);
}

// Settings Form Handler
document.addEventListener('DOMContentLoaded', function() {
    // Load saved Cloudinary Cloud Name
    const savedCloudName = localStorage.getItem(CLOUDINARY_KEY);
    if (savedCloudName) {
        const cloudNameInput = document.getElementById('cloudinary-cloud-name');
        if (cloudNameInput) cloudNameInput.value = savedCloudName;
        cloudinaryCloudName = savedCloudName;
        loadCloudinaryScript();
    }

    // Load auto-save preference
    const autoSavePref = localStorage.getItem('auto_save_enabled');
    const autoSaveToggle = document.getElementById('auto-save-toggle');
    if (autoSaveToggle) {
        autoSaveToggle.checked = autoSavePref === 'true';
    }

    // Settings Form Submit
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const cloudName = document.getElementById('cloudinary-cloud-name').value;
            const newPassword = document.getElementById('admin-password-setting').value;
            const autoSaveToggle = document.getElementById('auto-save-toggle');
            
            if (cloudName) {
                localStorage.setItem(CLOUDINARY_KEY, cloudName);
                cloudinaryCloudName = cloudName;
                loadCloudinaryScript();
                showNotification('✅ Cloudinary Cloud Name saved!', 'success');
            }
            
            if (newPassword) {
                // You can optionally update the password (for demonstration only)
                showNotification('✅ Settings updated!', 'success');
            }

            if (autoSaveToggle) {
                localStorage.setItem('auto_save_enabled', autoSaveToggle.checked ? 'true' : 'false');
                showNotification(`Auto-save ${autoSaveToggle.checked ? 'enabled' : 'disabled'}.`, autoSaveToggle.checked ? 'success' : 'error');
            }
        });
    }

    // Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Hide all tabs
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected tab
            const selectedTab = document.getElementById(tabName + '-tab');
            if (selectedTab) selectedTab.classList.add('active');
            
            // Add active class to clicked button
            this.classList.add('active');
        });
    });

    // Netlify Identity login button
    const netlifyLoginBtn = document.getElementById('netlify-login-btn');
    if (netlifyLoginBtn && window.netlifyIdentity) {
        netlifyLoginBtn.addEventListener('click', () => {
            netlifyIdentity.open('login');
        });

        netlifyIdentity.on('login', () => {
            showNotification('✅ Logged in. You can now auto-save to GitHub.', 'success');
            netlifyIdentity.close();
        });

        netlifyIdentity.on('logout', () => {
            showNotification('Logged out. Auto-save will fall back to manual download.', 'error');
        });
    }
});

// Initialize
checkAuth();
