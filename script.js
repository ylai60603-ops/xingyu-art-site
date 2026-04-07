async function loadDynamicContent() {
    try {
        const b = await fetch('data/bio.json').then(r => r.json());
        // 【物理变更6】：使用 marked 引擎解析简介中的 MD 代码
        document.getElementById('bio-text').innerHTML = b.text ? marked.parse(b.text) : '';
        
        const a = await fetch('data/artworks.json').then(r => r.json());
        const g = document.getElementById('work-grid');
        if (a.items) {
            a.items.forEach(art => {
                const i = document.createElement('div'); 
                // 【物理变更7】：读取跨度参数并附加 class
                const spanClass = art.span ? 'span-' + art.span : 'span-1';
                i.className = 'grid-item ' + spanClass;
                
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
    // 【物理变更8】：解析详细简介中的 MD 代码
    const descHTML = art.description ? marked.parse(art.description) : '';
    document.getElementById('modal-caption').innerHTML = '<h3>'+art.title+'</h3><p>'+art.meta+'</p><div style="text-align:left; margin-top:10px;">'+descHTML+'</div>';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }
document.addEventListener('DOMContentLoaded', loadDynamicContent);