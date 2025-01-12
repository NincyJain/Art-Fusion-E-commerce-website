document.addEventListener('DOMContentLoaded', function() {
    const profileIcon = document.querySelector('.profile-icon');
    if (profileIcon) {
      profileIcon.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        console.log('clicked');
        const dropdownContent = document.querySelector('.dropdown-content');
        if (dropdownContent) {
          dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        }
      });
    }
  
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
      const dropdownContent = document.querySelector('.dropdown-content');
      if (dropdownContent && dropdownContent.style.display === 'block') {
        dropdownContent.style.display = 'none';
      }
    });
  });


// function printClick (){
//     console.log("clicked")
// }

// const profileIcon = document.querySelector('.profile-icon');
// profileIcon.addEventListener('click', printClick)