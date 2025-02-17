document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addArtworkBtn = document.querySelector('.add-artwork');
    const artworkGrid = document.querySelector('.artwork-grid');
    
    // Add New Artwork Modal Template
    const createArtworkModal = `
        <div class="modal" id="addArtworkModal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Add New Artwork</h2>
                <form id="addArtworkForm">
                    <div class="form-group">
                        <label for="artworkTitle">Title</label>
                        <input type="text" id="artworkTitle" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="artworkPrice">Price (₹)</label>
                        <input type="number" id="artworkPrice" name="price" required>
                    </div>
                    <div class="form-group">
                        <label for="artworkImage">Image Upload</label>
                        <input type="file" id="artworkImage" name="image" accept="image/*" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="artworkProductTag">Product Tag</label>
                        <input type="text" id="artworkProductTag" name="product_tag" required>
                    </div>
                    <button type="submit">Add Artwork</button>
                </form>
            </div>
        </div>
    `;

    // Edit Artwork Modal Template
    const editArtworkModal = `
        <div class="modal" id="editArtworkModal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Edit Artwork</h2>
                <form id="editArtworkForm">
                    <input type="hidden" id="editArtworkId" name="artwork_id">
                    <div class="form-group">
                        <label for="editArtworkTitle">Title</label>
                        <input type="text" id="editArtworkTitle" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="editArtworkPrice">Price (₹)</label>
                        <input type="number" id="editArtworkPrice" name="price" required>
                    </div>
                    <div class="form-group">
                        <label for="editArtworkImageUrl">Image URL</label>
                        <input type="url" id="editArtworkImageUrl" name="image_url" required>
                    </div>
                    <div class="form-group">
                        <label for="editArtworkProductTag">Product Tag</label>
                        <input type="text" id="editArtworkProductTag" name="product_tag" required>
                    </div>
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    `;
    
    // Add modals to page
    document.body.insertAdjacentHTML('beforeend', createArtworkModal);
    document.body.insertAdjacentHTML('beforeend', editArtworkModal);
    
    // Modal Elements
    const addModal = document.getElementById('addArtworkModal');
    const editModal = document.getElementById('editArtworkModal');
    const addCloseBtn = addModal.querySelector('.close');
    const editCloseBtn = editModal.querySelector('.close');
    const addArtworkForm = document.getElementById('addArtworkForm');
    const editArtworkForm = document.getElementById('editArtworkForm');
    
    // Show Add Artwork Modal
    addArtworkBtn.addEventListener('click', () => {
        addModal.style.display = 'block';
        addArtworkForm.reset();
    });
    
    // Handle Edit Button Clicks
    document.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', (e) => {
            const artworkItem = e.target.closest('.artwork-item');
            const artworkId = artworkItem.querySelector('.artwork-id').textContent;
            const title = artworkItem.querySelector('.artwork-name').textContent;
            const price = artworkItem.querySelector('.artwork-price').textContent.replace('₹', '');
            const tag = artworkItem.querySelector('.artwork-tag').textContent;
            const imageUrl = artworkItem.querySelector('.artwork-thumbnail').src;
            
            // Populate edit form
            document.getElementById('editArtworkId').value = artworkId;
            document.getElementById('editArtworkTitle').value = title;
            document.getElementById('editArtworkPrice').value = price;
            document.getElementById('editArtworkProductTag').value = tag;
            document.getElementById('editArtworkImageUrl').value = imageUrl;
            
            // Show edit modal
            editModal.style.display = 'block';
        });
    });
    
    // Close Modals
    [addCloseBtn, editCloseBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });
    
    // Close Modals on Outside Click
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Handle Add Artwork Form Submit
    addArtworkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(addArtworkForm);
        
        if (!validateArtworkForm(formData)) {
            return;
        }
        
        try {
            // If user clicks on submit button then that button should change to uploading...
            const submitBtn = addArtworkForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';

            // If uploding is successfull then below route will be called
            const response = await fetch('/seller/artwork/add', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                addModal.style.display = 'none';
                location.reload();
            } else {
                showError(data.message || 'Failed to add artwork');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to add artwork');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Artwork';
        }
    });

    // Handle Edit Artwork Form Submit
    editArtworkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(editArtworkForm);
        const artworkId = formData.get('artwork_id');
        
        if (!validateArtworkForm(formData)) {
            return;
        }
        
        try {
            const submitBtn = editArtworkForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            const response = await fetch(`/seller/artwork/${artworkId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: formData.get('title'),
                    price: formData.get('price'),
                    Product_tag: formData.get('product_tag'),
                    imageurl: formData.get('image_url')
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                editModal.style.display = 'none';
                location.reload();
            } else {
                showError(data.message || 'Failed to update artwork', editArtworkForm);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to update artwork', editArtworkForm);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    });

    // Handle Delete Artwork
    // async function deleteArtwork(artworkId) {
    //     if (!confirm('Are you sure you want to delete this artwork?')) {
    //         return;
    //     }
        
    //     try {
    //         const response = await fetch(`/seller/artwork/${artworkId}`, {
    //             method: 'DELETE'
    //         });
            
    //         const data = await response.json();
            
    //         if (data.success) {
    //             const artworkElement = document.querySelector(`.artwork-item:has(.artwork-id:contains('${artworkId}'))`);
    //             if (artworkElement) {
    //                 artworkElement.remove();
    //             }
    //         } else {
    //             alert(data.message || 'Failed to delete artwork');
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //         alert('Failed to delete artwork');
    //     }
    // }

    // Form Validation
    function validateArtworkForm(formData) {
        const title = formData.get('title').trim();
        const price = parseFloat(formData.get('price'));
        const imageurl = formData.get('image_url');
        const image = formData.get('image');
        
        if (!title) {
            showError('Title is required');
            return false;
        }
        
        if (!price || price <= 0) {
            showError('Please enter a valid price');
            return false;
        }
        
        // if (!imageurl) {
        //     showError('Image URL is required');
        //     return false;
        // }

        try {
            new URL(imageurl);
        } catch (e) {
            showError('Please enter a valid image URL');
            return false;
        }
        
        if (image && image.size) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(image.type)) {
                showError('Please upload a valid image file (JPEG, PNG, or GIF)');
                return false;
            }
            
            if (image.size > 5 * 1024 * 1024) {
                showError('Image size should be less than 5MB');
                return false;
            }
        }
        
        return true;
    }

    // Error Display
    function showError(message, form = addArtworkForm) {
        const feedback = form.querySelector('.form-feedback') || 
            form.insertAdjacentElement('beforeend', createElement('div', { class: 'form-feedback' }));
        
        feedback.textContent = message;
        feedback.style.color = 'red';
        feedback.style.marginTop = '10px';
    }

    // Helper function to create elements
    function createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }
});

async function deleteArtwork(artworkId) {
    if (!confirm('Are you sure you want to delete this artwork?')) {
        return;
    }
    
    try {
        const response = await fetch(`/seller/artwork/${artworkId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Find the artwork element using a more compatible selector approach
            const artworkElements = document.querySelectorAll('.artwork-item');
            const artworkToDelete = Array.from(artworkElements).find(element => {
                const idElement = element.querySelector('.artwork-id');
                return idElement && idElement.textContent === artworkId.toString();
            });
            
            if (artworkToDelete) {
                artworkToDelete.remove();
            }
        } else {
            alert(data.message || 'Failed to delete artwork');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete artwork');
    }
}