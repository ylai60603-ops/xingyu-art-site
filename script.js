let scrollRAF = null;

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
                const coverImg = (art.gallery && art.gallery.length > 0) ? art.gallery[0] : art.image;
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

    let currentGallery = [];
    if (art.gallery && art.gallery.length > 0) currentGallery = art.gallery;
    else if (art.image) currentGallery = [art.image];

    let currentIndex = 0;
    const modalImg = document.getElementById('modal-img');
    modalImg.src = currentGallery[currentIndex];

    const newModalImg = modalImg.cloneNode(true);
    modalImg.parentNode.replaceChild(newModalImg, modalImg);

    if (!art.autoScroll && currentGallery.length > 1) {
        newModalImg.style.cursor = 'pointer';
        newModalImg.title = 'Click for next image';
        newModalImg.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % currentGallery.length;
            newModalImg.style.opacity = '0.5';
            setTimeout(() => {
                newModalImg.src = currentGallery[currentIndex];
                newModalImg.style.opacity = '1';
            }, 150);
        });
    } else {
        newModalImg.style.cursor = 'default';
        newModalImg.title = '';
    }

    // 物理修正 2：重构引擎触发器，解决缓存不执行动画的死角
    if (art.autoScroll) {
        track.classList.add('is-scrolling');
        newModalImg.style.cursor = 'ew-resize';

        const startAnimation = () => {
            // 延迟 100ms，等待 CSS flex-start 物理重绘完毕，再计算精确宽度
            setTimeout(() => {
                track.scrollLeft = 0;
                if (track.scrollWidth > track.clientWidth) {
                    let dir = 1;
                    const speed = 0.5; // 0.5像素/帧的慢速设定
                    
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

        // 侦测缓存：若图片已就绪则直接执行，否则等待网络加载
        if (newModalImg.complete) {
            startAnimation();
        } else {
            newModalImg.onload = startAnimation;
        }
    }

    const descHTML = art.description ? marked.parse(art.description) : '';
    document.getElementById('modal-caption').innerHTML = '<h3>'+art.title+'</h3><p>'+art.meta+'</p><div>'+descHTML+'</div>';
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