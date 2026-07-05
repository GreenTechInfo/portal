const NAVIGATION_DATA = {
    mainLinks: [
        { href: "index.html", icon: "home.png", text: "Главная" },
        { href: "pages/about.html", icon: "about.png", text: "О сервере" },
        { href: "pages/rules.html", icon: "rules.png", text: "Правила сервера" },
        { href: "pages/systems.html", icon: "systems.png", text: "Системы сервера" },
        { href: "pages/animations.html", icon: "animations.png", text: "Анимации" },
        { href: "pages/jobs.html", icon: "jobs.png", text: "Работы" },
		{ href: "pages/skins.html", icon: "skins.png", text: "Скины" },
        { href: "pages/map.html", icon: "map.png", text: "Карта" }
    ],
    
    vehiclesSubmenu: {
        title: "Автомобили",
        icon: "vehicles.png",
        links: [
            { href: "pages/vehicles.html", text: "Список автомобилей" },
            { href: "pages/tuning.html", text: "Тюнинг" },
            { href: "pages/paintjob.html", text: "Покрасочные работы" },
            { href: "pages/wheels.html", text: "Диски" }
        ]
    },
    
    fractionsSubmenu: {
        title: "Фракции",
        icon: "fractions.png",
        links: [
            { href: "pages/fraction-ufsb.html", text: "УФСБ" },
            { href: "pages/fraction-pravitelstvo.html", text: "Правительство" },
            { href: "pages/fraction-sud.html", text: "Судебная организация" },
            { href: "pages/fraction-gu_fsin.html", text: "ГУФСИН" },
            { href: "pages/fraction-prokuratura.html", text: "Прокуратура" },
            { href: "pages/fraction-sledstvennii_komitet.html", text: "Следственный комитет" },
            { href: "pages/fraction-gu_mvd.html", text: "МУ МВД" },
            { href: "pages/fraction-ugibdd.html", text: "УГИБДД" },
            { href: "pages/fraction-ufsvng.html", text: "УФСВНГ" },
            { href: "pages/fraction-mz.html", text: "ГК ССМП" },
            { href: "pages/fraction-mchs.html", text: "МЧС" },
            { href: "pages/fraction-army.html", text: "Армия" },
            { href: "pages/fraction-tsordd.html", text: "ЦОРДД" }
        ]
    }
};

function getCurrentPageInfo() {
    const path = window.location.pathname;
    const isInPagesFolder = path.includes('/pages/') && !path.endsWith('/index.html');
    
    return {
        isInPagesFolder: isInPagesFolder
    };
}

function getIconPath(iconName) {
    const pageInfo = getCurrentPageInfo();
    const basePath = pageInfo.isInPagesFolder ? '../images/icons/' : 'images/icons/';
    return basePath + iconName;
}

function getCorrectHref(href) {
    const pageInfo = getCurrentPageInfo();
    
    if (pageInfo.isInPagesFolder) {
        if (href === 'index.html') {
            return '../index.html';
        }
        if (href.startsWith('pages/')) {
            return href.replace('pages/', '');
        }
        return '../' + href;
    }
    
    return href;
}

function generateSidebar() {
    const buildMainLinks = () => {
        return NAVIGATION_DATA.mainLinks.map(link => {
            let href = getCorrectHref(link.href);
            return `
                <li><a href="${href}">
                    <img src="${getIconPath(link.icon)}" alt="${link.text}" class="nav-icon">${link.text}
                </a></li>
            `;
        }).join('');
    };
    
    const buildSubmenu = (menu, id) => {
        const linksHtml = menu.links.map(link => {
            let href = getCorrectHref(link.href);
            return `
                <li><a href="${href}"><span class="submenu-dot">·</span>${link.text}</a></li>
            `;
        }).join('');
        
        return `
            <li>
                <a href="#" id="${id}Toggle">
                    <img src="${getIconPath(menu.icon)}" alt="${menu.title}" class="nav-icon">
                    ${menu.title} <span class="arrow">▼</span>
                </a>
                <ul class="submenu" id="${id}Submenu">
                    ${linksHtml}
                </ul>
            </li>
        `;
    };
    
    return `
		<ul class="sidebar-nav">
			<li class="sidebar-section-title">Навигация</li>
			${buildMainLinks()}
			${buildSubmenu(NAVIGATION_DATA.vehiclesSubmenu, 'vehicles')}
			${buildSubmenu(NAVIGATION_DATA.fractionsSubmenu, 'fractions')}
			<li><a href="${getCorrectHref('pages/commands.html')}">
				<img src="${getIconPath('commands.png')}" alt="Команды" class="nav-icon">Команды
			</a></li>
			<li><a href="${getCorrectHref('pages/faq.html')}">
				<img src="${getIconPath('faq.png')}" alt="FAQ" class="nav-icon">FAQ
			</a></li>
			<li><a href="${getCorrectHref('pages/about-site.html')}">
				<img src="${getIconPath('site.png')}" alt="О сайте" class="nav-icon">О сайте
			</a></li>
		</ul>
	`;
}

function setActiveLink() {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop();
    
    document.querySelectorAll('.sidebar-nav a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        
        const hrefFile = href.split('/').pop();
        
        if (currentFile === hrefFile) {
            link.classList.add('active');
            
            const parentSubmenu = link.closest('.submenu');
            if (parentSubmenu) {
                parentSubmenu.classList.add('open');
                const toggleId = parentSubmenu.id.replace('Submenu', 'Toggle');
                const toggle = document.getElementById(toggleId);
                if (toggle) toggle.setAttribute('aria-expanded', 'true');
            }
        }
    });
}

function setupDropdownHandlers() {
    const vehiclesToggle = document.getElementById('vehiclesToggle');
    const vehiclesSubmenu = document.getElementById('vehiclesSubmenu');
    const fractionsToggle = document.getElementById('fractionsToggle');
    const fractionsSubmenu = document.getElementById('fractionsSubmenu');
    
    if (vehiclesToggle && vehiclesSubmenu) {
        const newToggle = vehiclesToggle.cloneNode(true);
        vehiclesToggle.parentNode.replaceChild(newToggle, vehiclesToggle);
        
        newToggle.addEventListener('click', (e) => {
            e.preventDefault();
            vehiclesSubmenu.classList.toggle('open');
            newToggle.setAttribute('aria-expanded', vehiclesSubmenu.classList.contains('open'));
        });
    }
    
    if (fractionsToggle && fractionsSubmenu) {
        const newToggle = fractionsToggle.cloneNode(true);
        fractionsToggle.parentNode.replaceChild(newToggle, fractionsToggle);
        
        newToggle.addEventListener('click', (e) => {
            e.preventDefault();
            fractionsSubmenu.classList.toggle('open');
            newToggle.setAttribute('aria-expanded', fractionsSubmenu.classList.contains('open'));
        });
    }
}

function initNavigation() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.hasAttribute('data-nav-initialized')) {
        sidebar.innerHTML = generateSidebar();
        sidebar.setAttribute('data-nav-initialized', 'true');
        
        setupDropdownHandlers();
        setActiveLink();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}