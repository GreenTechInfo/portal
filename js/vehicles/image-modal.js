export function addImageModal() {
    if (document.getElementById('imageModal')) return;

    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    `;

    modal.innerHTML = `
        <div style="position: relative; max-width: 90%; max-height: 85vh;">
            <img id="modalImage" src="" alt="Увеличенное изображение" style="max-width: 100%; max-height: 85vh; object-fit: contain; border-radius: 8px;">
            <button id="closeModalBtn" style="
                position: absolute;
                top: -50px;
                right: 50;
                background: none;
                border: none;
                color: white;
                font-size: 32px;
                cursor: pointer;
                padding: 8px;
                transition: transform 0.2s;
                z-index: 10001;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">✕</button>
        </div>
        <div id="modalCaption" style="
            margin-top: 16px;
            color: var(--text-secondary);
            font-size: 0.9rem;
            text-align: center;
            max-width: 80%;
            background: rgba(0,0,0,0.6);
            padding: 8px 16px;
            border-radius: 8px;
        "></div>
    `;

    document.body.appendChild(modal);

    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const closeBtn = document.getElementById('closeModalBtn');

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modalCaption.textContent = '';
    }

    modal.addEventListener('click', closeModal);

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    initImageModalClicks();
}

export function initImageModalClicks() {
    const images = document.querySelectorAll('.clickable-image');
    const modal = document.getElementById('imageModal');
    if (!modal) return;

    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');

    images.forEach(img => {
        const newImg = img.cloneNode(true);
        img.parentNode.replaceChild(newImg, img);

        newImg.addEventListener('click', (e) => {
            e.stopPropagation();
            const fullImgSrc = newImg.getAttribute('data-full-img') || newImg.src;
            if (fullImgSrc && fullImgSrc !== '') {
                modalImg.src = fullImgSrc;
                const caption = newImg.getAttribute('data-caption') || newImg.alt;
                modalCaption.textContent = caption;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });
}