document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addArtworkBtn = document.querySelector('.add-artwork');
    const artworkGrid = document.querySelector('.artwork-grid');
    const editProfileBtn = document.querySelector('.edit-profile');
    
    // Add New Artwork Modal
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
                        <label for="artworkImage">Image</label>
                        <input type="file" id="artworkImage" name="image" accept="image/*" required>
                    </div>
                    <div class="form-group">
                        <label for="artworkDescription">Description</label>
                        <textarea id="artworkDescription" name="description"></textarea>
                    </div>
                    <button type="submit">Add Artwork</button>
                </form>
            </div>
        </div>
    `;
    
    // Add modal HTML to page
    document.body.insertAdjacentHTML('beforeend', createArtworkModal);
    
    // Modal Elements
    const modal = document.getElementById('addArtworkModal');
    const closeBtn = modal.querySelector('.close');
    const addArtworkForm = document.getElementById('addArtworkForm');
    
    // Show Add Artwork Modal
    addArtworkBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    // Close Modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close Modal on Outside Click
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle Add Artwork Form Submit
    addArtworkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(addArtworkForm);
        
        try {
            const response = await fetch('/seller/artwork/add', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Refresh the artwork grid
                location.reload();
            } else {
                alert(data.message || 'Failed to add artwork');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add artwork');
        }
    });
    
    // Handle Edit Artwork
    document.querySelectorAll('.artwork-actions .edit').forEach(button => {
        button.addEventListener('click', async (e) => {
            const artworkCard = e.target.closest('.artwork-card');
            const artworkId = artworkCard.dataset.id;
            const title = artworkCard.querySelector('h3').textContent;
            const price = artworkCard.querySelector('.price').textContent.replace('₹', '');
            
            // Create and show edit form
            const editForm = createEditForm(artworkId, title, price);
            artworkCard.insertAdjacentHTML('beforeend', editForm);
            
            // Show edit form
            artworkCard.querySelector('.edit-form').style.display = 'block';
            artworkCard.querySelector('.artwork-details').style.display = 'none';
        });
    });
    
    // Handle Delete Artwork
    document.querySelectorAll('.artwork-actions .delete').forEach(button => {
        button.addEventListener('click', async (e) => {
            if (confirm('Are you sure you want to delete this artwork?')) {
                const artworkCard = e.target.closest('.artwork-card');
                const artworkId = artworkCard.dataset.id;
                
                try {
                    const response = await fetch(`/seller/artwork/${artworkId}`, {
                        method: 'DELETE'
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        artworkCard.remove();
                    } else {
                        alert(data.message || 'Failed to delete artwork');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to delete artwork');
                }
            }
        });
    });
    
    // Helper function to create edit form
    function createEditForm(id, title, price) {
        return `
            <div class="edit-form">
                <form onsubmit="updateArtwork(event, ${id})">
                    <input type="text" name="title" value="${title}" required>
                    <input type="number" name="price" value="${price}" required>
                    <button type="submit">Save</button>
                    <button type="button" onclick="cancelEdit(this)">Cancel</button>
                </form>
            </div>
        `;
    }
});

// Update Artwork
async function updateArtwork(event, artworkId) {
    event.preventDefault();
    const form = event.target;
    const artworkCard = form.closest('.artwork-card');
    
    const data = {
        title: form.title.value,
        price: form.price.value
    };
    
    try {
        const response = await fetch(`/seller/artwork/${artworkId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update the UI
            artworkCard.querySelector('h3').textContent = data.title;
            artworkCard.querySelector('.price').textContent = `₹${data.price}`;
            
            // Hide edit form
            cancelEdit(form.querySelector('button[type="button"]'));
        } else {
            alert(result.message || 'Failed to update artwork');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update artwork');
    }
}

// Cancel Edit
function cancelEdit(button) {
    const artworkCard = button.closest('.artwork-card');
    artworkCard.querySelector('.edit-form').style.display = 'none';
    artworkCard.querySelector('.artwork-details').style.display = 'block';
}