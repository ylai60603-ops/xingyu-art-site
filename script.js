async function loadDynamicContent() {
    try {
        const b = await fetch('data/bio.json').then(r => r.json());
        document.getElementById('bio-text').innerText = b.text;
        const a = await fetch('data/artworks.json').then(r => r.json());
        const g = document.getElementById('work-grid');
        if (a.items) {
            a.items.forEach(art => {
                const i = document.createElement('div'); i.className = 'grid-item';
                i.innerHTML = '<img src="'+art.image+'"><div class="item-info"><p class="item-title">'+art.title+'</p><p class="item-meta">'+art.meta+'</p></div>';
                i.onclick = () => openModal(art); g.appendChild(i);
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
    document.getElementById('modal-caption').innerHTML = '<h3>'+art.title+'</h3><p>'+art.meta+'</p><div style="text-align:left">'+art.description+'</div>';
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }
document.addEventListener('DOMContentLoaded', loadDynamicContent);
