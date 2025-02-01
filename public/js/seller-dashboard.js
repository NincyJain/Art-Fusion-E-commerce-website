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
                        <label for="artworkProductTag">Product Tag</label>
                        <input type="text" id="artworkProductTag" name="product_tag" required>
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
        console.log("clicked the add-artwork button!")
        modal.style.display = 'block';
        addArtworkForm.reset();
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
        console.log(formData)

        // Validate inputs
        const title = formData.get('title').trim();
        const price = parseFloat(formData.get('price'));
        const image = formData.get('image');
        
        if (!title) {
            showError('Title is required');
            return;
        }
        
        if (!price || price <= 0) {
            showError('Please enter a valid price');
            return;
        }
        
        if (!image || !image.size) {
            showError('Please select an image');
            return;
        }
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(image.type)) {
            showError('Please upload a valid image file (JPEG, PNG, or GIF)');
            return;
        }
        
        if (image.size > 5 * 1024 * 1024) {
            showError('Image size should be less than 5MB');
            return;
        }
        
        try {

            const submitBtn = addArtworkForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';


            const response = await fetch('/seller/artwork/add', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                addArtworkForm.reset();
                modal.style.display = 'none';
                location.reload();
            } else {
                alert(data.message || 'Failed to add artwork');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add artwork');
        }
    });

    function showError(message) {
        formFeedback.textContent = message;
        formFeedback.style.color = 'red';
        formFeedback.style.marginTop = '10px';
    }
    
    // Handle Edit Artwork
    document.querySelectorAll('.edit').forEach(button => {
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
    // document.querySelectorAll('.delete').forEach(button => {
    //     button.addEventListener('click', async (e) => {
    //         let confirmation = confirm('Are you sure you want to delete this artwork?')
    //         if (confirmation === true) {
    //             const artworkCard = e.target.closest('.artwork-item');
    //             const artworkId = artworkCard.dataset.artworkId;;
    //             // const artworkId = artworkCard;
    //             console.log(artworkId)
    //             console.log('Deletion Started!')
    //             try {
    //                 const response = await fetch(`/seller/artwork/${artworkId}`, {
    //                     method: 'DELETE'
    //                 });
                    
    //                 const data = await response.json();
                    
    //                 if (data.success) {
    //                     artworkCard.remove();
    //                 } else {
    //                     alert(data.message || 'Failed to delete artwork');
    //                 }
    //             } catch (error) {
    //                 console.error('Error:', error);
    //                 alert('Failed to delete artwork');
    //             }
    //         }
    //     });
    // });

    async function deleteArtwork(artworkId) {
        let confirmation = confirm('Are you sure you want to delete this artwork?');
        if (confirmation) {
            console.log('Deleting artwork with ID:', artworkId);
            try {
                const response = await fetch(`/seller/artwork/${artworkId}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                console.log(data)
                
                if (data.success) {
                    // Find and remove the artwork item from DOM
                    const artworkElement = document.querySelector(`.artwork-item:has(.artwork-id:contains('${artworkId}'))`);
                    if (artworkElement) {
                        artworkElement.remove();
                    }
                } else {
                    alert(data.message || 'Failed to delete artwork');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to delete artwork');
            }
        }
    }
    
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

    if (!data.title || !data.price || data.price <= 0) {
        alert('Please fill all fields correctly');
        return;
    }
    
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

// Modal handling
const modal = document.getElementById('updateModal');

function openUpdateModal(artworkId) {
    const artwork = artworks.find(art => art.id === artworkId);
    if (artwork) {
        document.getElementById('artworkId').value = artwork.id;
        document.getElementById('artworkName').value = artwork.name;
        document.getElementById('artworkPrice').value = artwork.price;
        document.getElementById('artworkTag').value = artwork.tag;
        modal.style.display = 'block';
    }
}

function closeModal() {
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// Handle artwork update
async function handleUpdate(event) {
    event.preventDefault();
    
    const artworkId = document.getElementById('artworkId').value;
    const updateData = {
        name: document.getElementById('artworkName').value,
        price: document.getElementById('artworkPrice').value,
        tag: document.getElementById('artworkTag').value
    };

    try {
        const response = await fetch(`seller/artwork/${artworkId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            // Refresh the page or update the UI
            window.location.reload();
        } else {
            alert('Failed to update artwork');
        }
    } catch (error) {
        console.error('Error updating artwork:', error);
        alert('Error updating artwork');
    }
}

// Handle artwork deletion
async function deleteArtwork(artworkId) {
    if (confirm('Are you sure you want to delete this artwork?')) {
        try {
            const response = await fetch(`/seller/artwork/${artworkId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Refresh the page or update the UI
                window.location.reload();
            } else {
                alert('Failed to delete artwork');
            }
        } catch (error) {
            console.error('Error deleting artwork:', error);
            alert('Error deleting artwork');
        }
    }
}
