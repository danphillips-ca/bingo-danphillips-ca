function toggleFullscreen() {
    var navbarCollapse = document.getElementById('navbarNav');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    if (navbarCollapse.classList.contains('show')) {
        var bsCollapse = new bootstrap.Collapse(navbarCollapse, {
            toggle: false
        });
        bsCollapse.hide();
    }
}

// Function to delete a cookie by name
function deleteCookie(name) {
    // Set the cookie's expiration date to a past date
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Reload the webpage
    location.reload();
}
