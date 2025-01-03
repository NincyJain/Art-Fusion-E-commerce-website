//for slick crousel
$(document).ready(function(){
    $('.products_slick-carousel').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      infinite: false,
      dots: false,
      arrows: false,
      autoplay: true,
      autoplaySpeed: 2000,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    });
  });

//add-to- wishlist functionality
document.querySelectorAll('.add-to-wishlist').forEach(button => {
  button.addEventListener('click', async () => {
    const productId = button.getAttribute('data-id');
    try {
      const response = await fetch('/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Product added to wishlist!');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Something went wrong.');
    }
  });
});
  
//remove from wishlist
document.querySelectorAll('.remove-from-wishlist').forEach(button => {
  button.addEventListener('click', async () => {
    const productId = button.getAttribute('data-id');
    try {
      const response = await fetch('/wishlist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Product removed from wishlist!');
        location.reload();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Something went wrong.');
    }
  });
});

// -----Add to cart--

//add-to- cart functionality
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', async () => {
    const productId = button.getAttribute('data-id');
    try {
      const response = await fetch('/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Product added to cart!');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Something went wrong.');
    }
  });
});
  
//remove from cart
document.querySelectorAll('.remove-from-cart').forEach(button => {
  button.addEventListener('click', async () => {
    const productId = button.getAttribute('data-id');
    try {
      const response = await fetch('/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Product removed from cart!');
        location.reload();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Something went wrong.');
    }
  });
});
