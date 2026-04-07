// 仅展示修正函数，其余 loadDynamicContent 等保持不变
function openModal(art) {
    const m = document.getElementById('modal');
    m.style.display = 'block';
    // 物理修正：锁定主页面滚动，让 Modal 独立承载滚动轴
    document.body.style.overflow = 'hidden'; 
    
    document.getElementById('modal-img').src = art.image;
    const descHTML = art.description ? marked.parse(art.description) : '';
    document.getElementById('modal-caption').innerHTML = '<h3>'+art.title+'</h3><p>'+art.meta+'</p><div>'+descHTML+'</div>';
    
    // 强制将 Modal 滚动条重置到顶部
    m.scrollTop = 0;
}

function closeModal() { 
    document.getElementById('modal').style.display = 'none'; 
    // 物理修正：释放主页面滚动
    document.body.style.overflow = 'auto';
}

function shareSite() {
    const url = window.location.href;
    // 物理降级方案：优先尝试 API，失败则执行传统 prompt
    if (navigator.share && window.isSecureContext) {
        navigator.share({ title: 'Xingyu Art', url: url }).catch(() => copyToClipboard(url));
    } else {
        copyToClipboard(url);
    }
}

function copyToClipboard(text) {
    const temp = document.createElement('input');
    document.body.appendChild(temp);
    temp.value = text;
    temp.select();
    document.execCommand('copy'); // 物理兼容方案：执行传统复制命令
    document.body.removeChild(temp);
    alert("Link copied to clipboard / 链接已复制");
}