(function() {
    const button = document.createElement('button');
    button.id = 'graph-viz-trigger';
    button.innerText = 'Graph Visualizer';
    document.body.appendChild(button);

    const container = document.createElement('div');
    container.id = 'graph-viz-container';
    container.style.display = 'none';

    const resizer = document.createElement('div');
    resizer.id = 'graph-viz-resizer';
    container.appendChild(resizer);

    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('panel.html');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.id = 'graph-viz-iframe';

    container.appendChild(iframe);
    document.body.appendChild(container);

    button.addEventListener('click', () => {
        if (container.style.display === 'none') {
            container.style.display = 'block';
            button.classList.add('active');
        } else {
            container.style.display = 'none';
            button.classList.remove('active');
        }
    });

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'ew-resize';
        iframe.style.pointerEvents = 'none';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const width = window.innerWidth - e.clientX;
        if (width > 250 && width < window.innerWidth * 0.9) {
            container.style.width = `${width}px`;
        }
    });

    window.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
            iframe.style.pointerEvents = 'auto';
        }
    });
})();