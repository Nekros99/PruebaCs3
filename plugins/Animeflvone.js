// ==Provider==
// name: AnimeFlvOne
// baseUrl: https://www.animeflv.one/  // <--- ¡Vuelve a poner .one! (no .online, a menos que sepas que existe)
// language: es
// type: series
// ==/Provider==

function loadHome() {
    let html = fetch(baseUrl);
    let doc = parse(html);
    let results = [];

    // SELECTOR CORREGIDO: Es article.li (sin espacio)
    doc.select('.ul.hm article.li').forEach(item => {
        let linkElement = item.select('a').first();
        if (!linkElement) return;

        // CORREGIDO: La variable se llama "titulo" (sin tilde para evitar problemas)
        let titulo = linkElement.select('span').text().trim();
        let episode = linkElement.select('u').text().trim();
        let name = titulo + ' - ' + episode; // Aquí usamos "titulo"

        let link = linkElement.attr('href');
        if (link && !link.startsWith('http')) {
            link = baseUrl + link;
        }

        if (name && link) {
            results.push({ name: name, url: link });
        }
    });

    return results.slice(0, 30);
}

function loadLinks(url) {
    let html = fetch(url);
    let doc = parse(html);
    let links = [];

    // Buscar el iframe del reproductor en AnimeFlv
    doc.select('#player iframe, .video-container iframe, iframe[src*="player"]').forEach(el => {
        let src = el.attr('src');
        if (src) {
            if (!src.startsWith('http')) src = baseUrl + src;
            links.push({ name: 'Servidor Iframe', url: src });
        }
    });

    if (links.length === 0) {
        doc.select('video source, [data-src*=".m3u8"], [src*=".m3u8"]').forEach(el => {
            let src = el.attr('src') || el.attr('data-src');
            if (src) {
                if (!src.startsWith('http')) src = baseUrl + src;
                links.push({ name: 'Servidor M3U8', url: src });
            }
        });
    }

    return links;
}
