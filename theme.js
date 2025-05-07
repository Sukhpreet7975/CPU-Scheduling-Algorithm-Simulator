// theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('themeToggleButton');
    const currentTheme = localStorage.getItem('theme');

    // Apply saved theme on initial load
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        // Optional: Update button text/icon if needed on load
        // themeToggleButton.textContent = 'Light Mode';
    } else {
        // Default to light mode if no theme saved or it's 'light'
        document.body.classList.remove('dark-mode');
        // Optional: Update button text/icon
        // themeToggleButton.textContent = 'Dark Mode';
    }

    // Add event listener for the toggle button
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            // Toggle the .dark-mode class on the body
            document.body.classList.toggle('dark-mode');

            // Determine the new theme and save it
            let theme = 'light'; // Default to light
            if (document.body.classList.contains('dark-mode')) {
                theme = 'dark';
                // Optional: Update button text/icon
                // themeToggleButton.textContent = 'Light Mode';
            } else {
                 // Optional: Update button text/icon
                // themeToggleButton.textContent = 'Dark Mode';
            }
            localStorage.setItem('theme', theme);
        });
    } else {
        console.warn("Theme toggle button not found on this page.");
    }
});