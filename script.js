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

// 【物理引擎1】：带状态推送的页面切换函数
function showSection(id, pushHistory = true) { 
    document.querySelectorAll('section').forEach(s => s.classList.remove('active')); 
    document.getElementById(id).classList.add('active'); 
    
    // 向浏览器强制压入一条历史记录，改变网址 Hash
    if (pushHistory) {
        history.pushState({ section: id }, '', '#' + id);
    }
}

// 【物理引擎2】：监听浏览器物理返回键 (popstate)
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.section) {
        showSection(event.state.section, false);
    } else {
        // 退无可退时，默认返回首页
        const hashId = window.location.hash.replace('#', '') || 'work';
        showSection(hashId, false);
    }
});

function openModal(art) {
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('modal-img').src = art.image;
    const descHTML = art.description ? marked.parse(art.description) : '';
    document.getElementById('modal-caption').innerHTML = '<h3>'+art.title+'</h3><p>'+art.meta+'</p><div style="text-align:left; margin-top:10px;">'+descHTML+'</div>';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

// 【物理引擎3】：系统底层原生分享接口
function shareSite() {
    if (navigator.share) {
        navigator.share({
            title: 'Xingyu Art',
            text: 'Explore the artwork portfolio of Xingyu.',
            url: window.location.href
        }).catch(console.error);
    } else {
        // 后备物理方案：针对不支持 Web Share API 的旧版 PC 浏览器
        prompt("请复制以下网址进行分享：", window.location.href);
    }
}

// 初始化时读取 URL Hash 以支持分享链接直接定位
document.addEventListener('DOMContentLoaded', () => {
    loadDynamicContent();
    const initialSection = window.location.hash.replace('#', '') || 'work';
    showSection(initialSection, false);
});