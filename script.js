async function loadDynamicContent() {
    try {
        const b = await fetch('data/bio.json').then(r => r.json());
        // 渲染简介，调用 marked 解析 MD
        document.getElementById('bio-text').innerHTML = b.text ? marked.parse(b.text) : '';
        
        const a = await fetch('data/artworks.json').then(r => r.json());
        const g = document.getElementById('work-grid');
        if (a.items) {
            a.items.forEach(art => {
                const i = document.createElement('div'); 
                
                // 【物理核心指令】：读取后台 span 数据，若无数据则强制默认 fallback 为 1
                const spanValue = art.span ? art.span : '1';
                i.className = 'grid-item span-' + spanValue;
                
                i.innerHTML = '<img src="'+art.image+'"><div class="item-info"><p class="item-title">'+art.title+'</p><p class="item-meta">'+art.meta+'</p></div>';
                i.onclick = () => openModal(art); 
                g.appendChild(i);
            });
        }
    } catch(e) { console.log("数据尚未初始化或文件缺失"); }
}

function showSection(id) { 
    document.querySelectorAll('section').forEach(s => s.classList.remove('active')); 
    document.getElementById(id).classList.add('active'); 
}

function openModal(art) {
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('modal-img').src = art.image;
    // 弹窗内渲染详细简介的 MD
    const descHTML = art.description ? marked.parse(art.description) : '';
    document.getElementById('modal-caption').innerHTML = '<h3>'+art.title+'</h3><p>'+art.meta+'</p><div style="text-align:left; margin-top:10px;">'+descHTML+'</div>';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }
document.addEventListener('DOMContentLoaded', loadDynamicContent);