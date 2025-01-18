//Javascript for login/sign up 


let currentUserType = 'buyer';
let isLogin = true;

function SwitchUserType(type, event)
{
    document.querySelectorAll('.user-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.querySelectorAll('.form').forEach(form => {
        form.classList.add('hidden');
    });
    document.getElementById(`${type}-login`).classList.remove('hidden');

}

//toggle form 
function toggleForm() {
    const activeForms = document.querySelectorAll('.form:not(.hidden)');
    const activeForm = activeForms[0];
    const isLogin = activeForm.id.includes('login');
    const userType = activeForm.id.split('-')[0];
    
    activeForm.classList.add('hidden');
    document.getElementById(`${userType}-${isLogin ? 'signup' : 'login'}`).classList.remove('hidden');
}

function updateUsername(username) {
    const usernameElement = document.querySelector('.username');
    if (usernameElement) {
        usernameElement.textContent = username || 'Guest';
    }
}


$(document).ready(function() {
    // Handle form submissions
    $('.form').submit(function(e) {
        e.preventDefault();
        
        const formId = $(this).attr('id');
        const isLogin = formId.includes('login');
        const type = formId.split('-')[0];
        
        let data = {};
        if (isLogin) {
            data = {
                email: $(`#${formId}-email`).val(),
                password: $(`#${formId}-password`).val()
            };
        } else {
            // Signup
            const password = $(`#${formId}-password`).val();
            const confirm = $(`#${formId}-confirm`).val();
            
            if (password !== confirm) {
                alert('Passwords do not match!');
                return;
            }
            
            data = {
                email: $(`#${formId}-email`).val(),
                password: password,
                username: type === 'buyer' ? 
                    $(`#${formId}-name`).val() : 
                    $(`#${formId}-business`).val()
            };
        }
        
        $.ajax({
            url: '/',
            method: 'POST',
            data: {
                type: type,
                action: isLogin ? 'login' : 'signup',
                data: data
            },
            success: function(response) {
                if (response.success) {
                    // Store username in sessionStorage
                    console.log(response)
                    if (response.Username) {
                        console.log("Setting Session storage")
                        sessionStorage.setItem('username', response.Username);
                        updateUsername(response.Username);
                    }
                    window.location.href = response.redirectUrl;
                }
            },
            error: function(xhr) {
                const response = xhr.responseJSON;
                alert(response?.error || 'An error occurred. Please try again.');
            }
        });
    });

    // Update username from session storage on page load
    const username = sessionStorage.getItem('username');
    if (username) {
        updateUsername(username);
    }
});

