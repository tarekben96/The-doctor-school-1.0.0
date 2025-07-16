
// تعريف الحسابات
let users = [
    { username: 'admin', password: '1234' },
];
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(users));
}

function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('loggedIn', 'true');
        showApp();
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
}

function handleLogout() {
    localStorage.removeItem('loggedIn');
    location.reload();
}

function showApp() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = '';
}

window.onload = function () {
    if (localStorage.getItem('loggedIn') === 'true') {
        showApp();
    } else {
        document.getElementById('loginSection').style.display = '';
        document.getElementById('dashboardSection').style.display = 'none';
    }
};
