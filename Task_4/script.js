// Add event listeners for radio buttons
const districtRadio = document.getElementById('district');
const independentRadio = document.getElementById('independent');

districtRadio.addEventListener('change', toggleDistrict);
independentRadio.addEventListener('change', toggleDistrict);

function toggleDistrict() {
    const districtSelect = document.getElementById('district');
    districtSelect.disabled = !districtRadio.checked;
}

// Add event listener for the login button
const loginBtn = document.querySelector('.login-btn');
loginBtn.addEventListener('click', login);

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Perform login validation and submit the form
    // Replace this with your actual login logic
    if (username && password) {
        alert('Login successful!');
    } else {
        alert('Please enter a valid username and password.');
    }
}



