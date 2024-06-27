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
