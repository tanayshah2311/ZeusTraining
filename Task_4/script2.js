document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#header-links .g-link').forEach(link => {
        link.addEventListener('click', function(event) {
            // Prevent default behavior if necessary
            event.preventDefault();

            // Remove active class from all links
            document.querySelectorAll('#header-links .g-link').forEach(link => link.classList.remove('active'));

            // Add active class to the clicked link
            event.currentTarget.classList.add('active');
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const coursesLink = document.getElementById('courses-link');
    const classesLink = document.getElementById('classes-link');
    const subheading = document.querySelector('.SubHeading');
    const indicator = document.createElement('div');
    
    indicator.classList.add('active-indicator', 'active');
    indicator.id = 'courses-indicator'; 
    subheading.appendChild(indicator);

    coursesLink.addEventListener('click', function(event) {
        event.preventDefault(); 
        indicator.id = 'courses-indicator';
    });

    classesLink.addEventListener('click', function(event) {
        event.preventDefault(); 
        indicator.id = 'classes-indicator';
    });
});
