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
    document.getElementById('modal').style.display = 'block';
    document.getElementById('modal-img').src = art.image;
    const descHTML = art.description ? marked.parse(art.description) : '';
    document.getElementById('modal-caption').innerHTML = '<h3>'+art.title+'</h3><p>'+art.meta+'</p><div style="text-align:left; margin-top:10px;">'+descHTML+'</div>';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

// 【物理修正4】：双层降级联系引擎
function copyEmail(email) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
            alert("Artist's email (" + email + ") copied to clipboard.");
        }).catch(() => { window.location.href = "mailto:" + email; });
    } else {
        window.location.href = "mailto:" + email;
    }
}

// 【物理修正5】：双层降级分享引擎
function shareSite() {
    if (navigator.share) {
        navigator.share({ title: 'Xingyu Art', url: window.location.href }).catch(console.error);
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert("Website link copied to clipboard for sharing.");
        });
    } else {
        prompt("Copy this link to share:", window.location.href);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadDynamicContent();
    const initialSection = window.location.hash.replace('#', '') || 'work';
    showSection(initialSection, false);
});