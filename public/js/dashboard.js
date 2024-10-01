// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    const dateElement = document.getElementById('currentDate');
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('en-GB', options);
  });
  