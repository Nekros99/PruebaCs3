// ==Provider==
// name: AnimeFlvOne
// baseUrl: https://www.animeflv.one/  //
// language: es
// type: series  //
// ==/Provider==

// Función para mostrar el listado en la pestaña de Inicio
function loadHome() {
    let html = fetch(baseUrl);
    let doc = parse(html);
    let results = [];

    // Este selector está perfecto (saca los article uno por uno)
    doc.select('.ul.hm article.li').forEach(item => {
        let linkElement = item.select('a').first();
        if (!linkElement) return; // Si no hay enlace, nos saltamos este

        // --- CAMBIO IMPORTANTE ---
        // Sacamos el Título del anime (dentro de <span>) y el Número del Episodio (dentro de <u>)
        let title = linkElement.select('span').text().trim();      // "Tefuda ga Oome no Victoria"
        let episode = linkElement.select('u').text().trim();       // "Episodio 6"
        
        // Construimos un nombre bonito para que se vea en CloudStream
        let name = title + ' - ' + episode;  // Ej: "Tefuda ga Oome no Victoria - Episodio 6"

        let link = linkElement.attr('href');
        if (link && !link.startsWith('http')) {
            link = baseUrl + link;  // Aseguramos que la URL sea absoluta
        }

        if (name && link) {
            results.push({
                name: name,
                url: link
            });
        }
    });

    return results.slice(0, 30);
}

// Función para cuando hagas clic en un anime y buscar el video
function loadLinks(url) {
    let html = fetch(url);
    let doc = parse(html);
    let links = [];

    // --- Para AnimeFlv (y la mayoría de páginas de anime) ---
    // Normalmente el reproductor está dentro de un iframe o un div con id "player".
    // Vamos a buscar primero el iframe del reproductor.
    
    // 1. Buscar iframes comunes (dentro del reproductor)
    doc.select('#player iframe, .video-container iframe, iframe[src*="player"]').forEach(el => {
        let src = el.attr('src');
        if (src) {
            if (!src.startsWith('http')) src = baseUrl + src;
            links.push({ name: 'Servidor Iframe', url: src });
        }
    });

    // 2. Si no hay iframe, buscar el archivo .m3u8 directamente (muchos reproductores lo dejan en un atributo)
    if (links.length === 0) {
        doc.select('video source, .jw-video source, [data-src*=".m3u8"], [src*=".m3u8"]').forEach(el => {
            let src = el.attr('src') || el.attr('data-src');
            if (src) {
                if (!src.startsWith('http')) src = baseUrl + src;
                links.push({ name: 'Servidor M3U8', url: src });
            }
        });
    }

    // 3. Si no encuentra nada, busca dentro de los scripts (muchas páginas inyectan el video con JavaScript)
    if (links.length === 0) {
        // Busca patrones de URL de video dentro de scripts
        let scriptContent = doc.select('script:contains(".m3u8"), script:contains("file:"), script:contains("video.src")').html();
        let match = scriptContent.match(/https?:\/\/[^"'\s]+\.(m3u8|mp4)/);
        if (match) {
            links.push({ name: 'Servidor Extraído', url: match[0] });
        }
    }

    return links;
}
