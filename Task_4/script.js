const districtRadio = document.getElementById('district');
const independentRadio = document.getElementById('independent');

districtRadio.addEventListener('change', toggleDistrict);
independentRadio.addEventListener('change', toggleDistrict);

function toggleDistrict() {
    const districtSelect = document.getElementById('district');
    districtSelect.disabled = !districtRadio.checked;
}

const loginBtn = document.querySelector('.login-btn');
loginBtn.addEventListener('click', login);

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        redirect();
    } else {
        alert('Please enter a valid username and password.');
    }
}

function redirect() {
    window.location.href = 'dashboard.html';
}
