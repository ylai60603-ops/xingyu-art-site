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

// 邮件多轨并行处理机制
function contactArtist(email) {
    // 动作 1：强制将邮箱地址写入用户系统剪贴板作为备用底线
    const temp = document.createElement('input');
    document.body.appendChild(temp);
    temp.value = email;
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    
    // 动作 2：弹出明确告知，防止静默阻断造成误解
    alert("Artist's email (" + email + ") copied to clipboard.\n\nOpening default mail client if available...");
    
    // 动作 3：执行底层协议拉起
    window.location.href = "mailto:" + email;
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