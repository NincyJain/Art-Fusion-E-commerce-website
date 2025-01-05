//Javascript for login/sign up 


let currentUserType = 'buyer';
let isLogin = true;

function SwitchUserType(type, event)
{
    currentUserType = type;
    isLogin = true;
    UpdateFormVisibility();

    //Update button styles

    const buttons = document.querySelectorAll('.user-type-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

}

//toggle form 
function toggleForm() {
    isLogin = !isLogin;   //flipping the condition 
    UpdateFormVisibility();
}

function UpdateFormVisibility()
{
    const forms = document.querySelectorAll('.form');
    forms.forEach(form => {
        form.classList.add('hidden');
    });

    const formToShow = document.getElementById(`${currentUserType}-${isLogin ? 'login' : 'signup'}`);
    if (formToShow) {
        formToShow.classList.remove('hidden');
    }
    
    // Update the toggle button text
    const toggleBtns = document.querySelectorAll('.toggle-form button');
    toggleBtns.forEach(btn => {
        btn.textContent = isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login";
    });
}



// Form submission handling
document.querySelectorAll('.form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        try {
            // Add your API endpoint here
            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: currentUserType,
                    action: isLogin ? 'login' : 'signup',
                    data: formObject
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Handle successful authentication
                window.location.href = data.redirectUrl || '/';
            } else {
                // Handle errors
                console.error('Authentication failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
