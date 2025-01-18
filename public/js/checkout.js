document.getElementById('checkout-button').addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Get the final price from the page
    const finalPrice = parseFloat(document.querySelector('.Price_details h4 span')
        .textContent.replace('₹', '')
        .replace(/[^\d.-]/g, ''));

    try {
        const response = await fetch('/payment/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                finalPrice,
                cartItems: Array.from(document.querySelectorAll('.cart_items li')).map(item => ({
                    name: item.querySelector('h4').textContent,
                    price: parseFloat(item.querySelector('p').textContent.replace('₹', '').replace(/[^\d.-]/g, '')),
                    image: item.querySelector('img').src
                }))
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { url } = await response.json();
        window.location = url;
    } catch (error) {
        console.error('Error:', error);
        alert('There was a problem with the checkout process.');
    }
});