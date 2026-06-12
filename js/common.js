document.addEventListener('DOMContentLoaded', () => {
    // Инициализация навигации
    if (typeof initNavigation === 'function') {
        initNavigation();
    }
    
    // Остальной код (мобильное меню, кнопка наверх, etc.)
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const logo = document.getElementById('logo');
    
    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('show');
    }
    
    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('show');
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            if (sidebar && sidebar.classList.contains('open')) closeSidebar();
            else openSidebar();
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    if (logo) {
        logo.addEventListener('click', () => {
            window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
        });
    }
    
    // Кнопка наверх
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('show', window.scrollY > 300);
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});