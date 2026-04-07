async function loadDynamicContent() {
    try {
        const b = await fetch('data/bio.json').then(r => r.json());
        document.getElementById('bio-text').innerHTML = b.text ? marked.parse(b.text) : '';
        const a = await fetch('data/artworks.json').then(r => r.json());
        const g = document.getElementById('work-grid');
        if (a.items) {
            a.items.forEach(art => {
                const i = document.createElement('div'); 
                const spanValue = art.span ? art.span : '1';
                i.className = 'grid-item span-' + spanValue;
                i.innerHTML = '<img src="'+art.image+'"><div class="item-info"><p class="item-title">'+art.title+'</p><p class="item-meta">'+art.meta+'</p></div>';
                i.onclick = () => openModal(art); 
                g.appendChild(i);
            });
        }
    } catch(e) { console.log("数据尚未初始化或文件缺失"); }
}

function showSection(id, pushHistory = true) { 
    document.querySelectorAll('section').forEach(s => s.classList.remove('active')); 
    document.getElementById(id).classList.add('active'); 
    if (pushHistory) history.pushState({ section: id }, '', '#' + id);
}

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.section) {
        showSection(event.state.section, false);
    } else {
        const hashId = window.location.hash.replace('#', '') || 'work';
        showSection(hashId, false);
    }
});

function openModal(art) {
    const m = document.getElementById('modal');
    m.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
    document.getElementById('modal-img').src = art.image;
    const descHTML = art.description ? marked.parse(art.description) : '';
    document.getElementById('modal-caption').innerHTML = '<h3>'+art.title+'</h3><p>'+art.meta+'</p><div>'+descHTML+'</div>';
    m.scrollTop = 0;
}

function closeModal() { 
    document.getElementById('modal').style.display = 'none'; 
    document.body.style.overflow = 'auto';
}

// 【物理引擎注入】：动态生成 Webmail 网页写信选择器，绕过本地邮件客户端依赖
function contactArtist(email) {
    const overlay = document.createElement('div');
    overlay.id = 'contact-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(255,255,255,0.95);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    
    overlay.innerHTML = `
        <div style="text-align:center; padding:40px; border:1px solid #eee; background:#fff; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <h3 style="margin-bottom:20px; font-weight:normal; letter-spacing:1px;">CONTACT ARTIST</h3>
            <p style="margin-bottom:30px; font-size:0.9rem; color:#666;">${email}</p>
            <div style="display:flex; flex-direction:column; gap:15px; width:220px; margin:0 auto;">
                <button onclick="window.open('https://mail.google.com/mail/?view=cm&fs=1&to=${email}', '_blank'); document.body.removeChild(this.closest('#contact-overlay'));" style="padding:10px; cursor:pointer; background:#fff; border:1px solid #111; transition:0.3s;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='#fff'">Open in Gmail</button>
                <button onclick="window.open('https://outlook.live.com/mail/0/deeplink/compose?to=${email}', '_blank'); document.body.removeChild(this.closest('#contact-overlay'));" style="padding:10px; cursor:pointer; background:#fff; border:1px solid #111; transition:0.3s;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='#fff'">Open in Outlook</button>
                <button onclick="copyFallback('${email}', this)" style="padding:10px; cursor:pointer; background:#111; color:#fff; border:1px solid #111;">Copy Email Address</button>
                <button onclick="document.body.removeChild(this.closest('#contact-overlay'))" style="padding:10px; cursor:pointer; background:none; border:none; margin-top:10px; font-size:0.8rem; letter-spacing:1px;">CANCEL</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function copyFallback(email, btn) {
    const temp = document.createElement('input');
    document.body.appendChild(temp);
    temp.value = email;
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    btn.innerText = 'Copied!';
    setTimeout(() => document.body.removeChild(btn.closest('#contact-overlay')), 1000);
}

function shareSite() {
    const url = window.location.href;
    if (navigator.share) {
        navigator.share({ title: 'Xingyu Art', url: url }).catch(() => { fallbackShare(url); });
    } else {
        fallbackShare(url);
    }
}

function fallbackShare(url) {
    const temp = document.createElement('input');
    document.body.appendChild(temp);
    temp.value = url;
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    alert("Website link copied to clipboard for sharing.");
}

document.addEventListener('DOMContentLoaded', () => {
    loadDynamicContent();
    const initialSection = window.location.hash.replace('#', '') || 'work';
    showSection(initialSection, false);
});