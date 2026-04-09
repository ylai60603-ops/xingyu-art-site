let scrollRAF = null;
let currentGalleryData = [];
let currentGalleryIndex = 0;

async function loadDynamicContent() {
    try {
        const b = await fetch('data/bio.json').then(r => r.json());
        document.getElementById('bio-text').innerHTML = b.text ? marked.parse(b.text) : '';
        
        const a = await fetch('data/artworks.json').then(r => r.json());
        const g = document.getElementById('work-grid');
        if (a.items) {
            a.items.forEach(art => {
                const i = document.createElement('div'); 
                i.className = 'grid-item span-' + (art.span || '1');
                
                // 获取封面：兼容单图优先，若无单图则抓取图集首图
                let coverImg = '';
                if (art.image) coverImg = art.image;
                else if (art.gallery && art.gallery.length > 0) {
                    coverImg = typeof art.gallery[0] === 'string' ? art.gallery[0] : art.gallery[0].image;
                }
                
                i.innerHTML = '<img src="'+coverImg+'"><div class="item-info"><p>'+art.title+'</p></div>';
                i.onclick = () => openModal(art); 
                g.appendChild(i);
            });
        }
    } catch(e) { console.error("Load Failed"); }
}

function showSection(id) { 
    document.querySelectorAll('section').forEach(s => s.classList.remove('active')); 
    document.getElementById(id).classList.add('active'); 
    window.scrollTo(0,0);
}

function openModal(art) {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
    
    if (scrollRAF) cancelAnimationFrame(scrollRAF);

    const track = document.getElementById('modal-img-track');
    track.classList.remove('is-scrolling');

    // 物理修正：強制合併新舊圖庫為絕對唯一的一維数组
    currentGalleryData = [];
    if (art.image) currentGalleryData.push(art.image);
    if (art.gallery && Array.isArray(art.gallery)) {
        art.gallery.forEach(g => {
            if (typeof g === 'string') currentGalleryData.push(g);
            else if (g && g.image) currentGalleryData.push(g.image);
        });
    }
    currentGalleryData = [...new Set(currentGalleryData)]; // 剔除可能重复添加的数据
    currentGalleryIndex = 0;

    const modalImg = document.getElementById('modal-img');
    const newModalImg = modalImg.cloneNode(true);
    modalImg.parentNode.replaceChild(newModalImg, modalImg);
    newModalImg.src = currentGalleryData[currentGalleryIndex];

    const navLeft = document.getElementById('gallery-nav-left');
    const navRight = document.getElementById('gallery-nav-right');
    const dotsContainer = document.getElementById('gallery-dots');

    // UI 引擎：如果多于 1 张图且未开启长卷模式，则激活翻页器与圆点
    if (!art.autoScroll && currentGalleryData.length > 1) {
        navLeft.style.display = 'block';
        navRight.style.display = 'block';
        dotsContainer.style.display = 'flex';
        
        newModalImg.style.cursor = 'pointer';
        newModalImg.title = 'Click for next image';
        newModalImg.onclick = () => { nextImage(); };

        renderDots();
    } else {
        navLeft.style.display = 'none';
        navRight.style.display = 'none';
        dotsContainer.style.display = 'none';
        newModalImg.style.cursor = 'default';
        newModalImg.title = '';
        newModalImg.onclick = null;
    }

    if (art.autoScroll) {
        track.classList.add('is-scrolling');
        newModalImg.style.cursor = 'ew-resize';

        const startAnimation = () => {
            // 物理修正 2：注入 100ms 延遲以確保寬高校準，並倍增速率至 2.5
            setTimeout(() => {
                track.scrollLeft = 0;
                if (track.scrollWidth > track.clientWidth) {
                    let dir = 1;
                    const speed = 2.5; 
                    
                    function step() {
                        track.scrollLeft += dir * speed;
                        if (track.scrollLeft >= (track.scrollWidth - track.clientWidth - 1)) dir = -1;
                        if (track.scrollLeft <= 0) dir = 1;
                        scrollRAF = requestAnimationFrame(step);
                    }
                    scrollRAF = requestAnimationFrame(step);
                }
            }, 100);
        };

        // 物理修正 3：注入 complete 屬性快照以繞過緩存跳躍
        if (newModalImg.complete) startAnimation();
        else newModalImg.onload = startAnimation;
    }

    const descHTML = art.description ? marked.parse(art.description) : '';
    document.getElementById('modal-caption').innerHTML = '<h3>'+art.title+'</h3><p>'+art.meta+'</p><div>'+descHTML+'</div>';
}

function renderDots() {
    const dotsContainer = document.getElementById('gallery-dots');
    dotsContainer.innerHTML = '';
    currentGalleryData.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = 'gallery-dot' + (idx === currentGalleryIndex ? ' active' : '');
        dot.onclick = (e) => { e.stopPropagation(); goToImage(idx); };
        dotsContainer.appendChild(dot);
    });
}

function updateGalleryView() {
    const img = document.getElementById('modal-img');
    img.style.opacity = '0.5';
    setTimeout(() => {
        img.src = currentGalleryData[currentGalleryIndex];
        img.style.opacity = '1';
        renderDots();
    }, 150);
}

function nextImage(e) {
    if(e) e.stopPropagation();
    currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryData.length;
    updateGalleryView();
}

function prevImage(e) {
    if(e) e.stopPropagation();
    currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryData.length) % currentGalleryData.length;
    updateGalleryView();
}

function goToImage(idx) {
    currentGalleryIndex = idx;
    updateGalleryView();
}

function closeModal() { 
    document.getElementById('modal').style.display = 'none'; 
    document.body.style.overflow = 'auto';
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
}

function openContactForm() { document.getElementById('contact-panel').style.display = 'flex'; }
function closeContactForm() { document.getElementById('contact-panel').style.display = 'none'; }
function copyToClipboard(text, btn) {
    const temp = document.createElement('input'); document.body.appendChild(temp);
    temp.value = text; temp.select(); document.execCommand('copy'); document.body.removeChild(temp);
    const originalText = btn.innerText; btn.innerText = 'Copied!';
    setTimeout(() => { btn.innerText = originalText; }, 2000);
}
function shareSite() {
    const url = window.location.href;
    if (navigator.share) { navigator.share({ title: 'Xingyu Lai Art', url: url }).catch(() => { alertFallback(url); }); } 
    else { alertFallback(url); }
}
function alertFallback(url) {
    const temp = document.createElement('input'); document.body.appendChild(temp);
    temp.value = url; temp.select(); document.execCommand('copy'); document.body.removeChild(temp);
    alert("Website link copied to clipboard.");
}

document.addEventListener('DOMContentLoaded', loadDynamicContent);