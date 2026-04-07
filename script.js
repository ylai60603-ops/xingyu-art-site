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
                i.innerHTML = '<img src="'+art.image+'"><div class="item-info"><p>'+art.title+'</p></div>';
                i.onclick = () => openModal(art); 
                g.appendChild(i);
            });
        }
    } catch(e) { console.error("Error"); }
}
function showSection(id) { 
    document.querySelectorAll('section').forEach(s => s.classList.remove('active')); 
    document.getElementById(id).classList.add('active'); 
}
function openModal(art) {
    document.getElementById('modal').style.display = 'block';
    document.body.style.overflow = 'hidden'; 
    document.getElementById('modal-img').src = art.image;
    const descHTML = art.description ? marked.parse(art.description) : '';
    document.getElementById('modal-caption').innerHTML = '<h3>'+art.title+'</h3><p>'+art.meta+'</p><div>'+descHTML+'</div>';
}
function closeModal() { 
    document.getElementById('modal').style.display = 'none'; 
    document.body.style.overflow = 'auto';
}
function contactArtist(email) {
    const temp = document.createElement('input');
    document.body.appendChild(temp);
    temp.value = email;
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    alert("Artist's email (" + email + ") copied.\nOpening your email application...");
    window.location.href = "mailto:" + email;
}
function shareSite() {
    const url = window.location.href;
    const temp = document.createElement('input');
    document.body.appendChild(temp);
    temp.value = url;
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    alert("Website link copied.");
}
document.addEventListener('DOMContentLoaded', loadDynamicContent);