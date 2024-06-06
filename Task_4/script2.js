document.querySelectorAll('.g-link').forEach(link => {
    link.addEventListener('click', function(event) {
        document.querySelectorAll('.g-link').forEach(link => link.classList.remove('active'));
        
        event.currentTarget.classList.add('active');
    });
});
