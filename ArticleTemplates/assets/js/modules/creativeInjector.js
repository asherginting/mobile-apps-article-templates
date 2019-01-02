import { debounce, isOnline, signalDevice, isElementPartiallyInViewport } from 'modules/util';

const trackedImpressions = [];

function init() {
    window.injectCreative = injectCreative;
    window.applyNativeFunctionCall('injectInlineCreative');
}

function trackLiveBlogEpic() {
    // if there is already a data-tracked attribute than we don't need to set up tracking again
    const liveBlogEpicContainers = document.querySelectorAll('.contributions-epic__container:not([data-tracked])');
    let liveBlogEpicContainerId;
    let i;
    let liveBlogEpicContainer;

    for (i = 0; i < liveBlogEpicContainers.length; i++) {
        liveBlogEpicContainer = liveBlogEpicContainers[i];
        liveBlogEpicContainerId = liveBlogEpicContainer.getAttribute('id');

        liveBlogEpicContainer.setAttribute('data-tracked', 'true');

        addEventListenerScroll(liveBlogEpicContainer, liveBlogEpicContainerId);
    }
}

function injectCreative(html, css, id, type) {
    if (isOnline() && !document.getElementById(id)) {
        injectCSS(css);
        injectHTML(html, id, type);
    }
}

function injectCSS(css) {
    const style = document.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.head.appendChild(style);
}

function addEventListenerScroll(creativeContainer, id) {
    window.addEventListener('scroll', debounce(isCreativeInView.bind(null, creativeContainer, id), 100));
}

function injectHTML(html, id, type) {
    const creativeContainer = document.createElement('div');

    creativeContainer.id = id;
    creativeContainer.classList.add('creative-container');
    creativeContainer.classList.add(`${type}-creative-container`);
    creativeContainer.innerHTML = html;

    if (type === 'inline' && id === 'midarticle') {
        injectInlineCreativeIfLength(creativeContainer, 10);
    } else if (type === 'inline-article') {
        injectInlineCreative(creativeContainer);
    } else {
        injectEpicCreative(creativeContainer);
    }

    addEventListenerScroll(creativeContainer, id);
}

function injectInlineCreativeIfLength(creativeContainer, minParagraphs) {
    let i;
    let prose = document.querySelector('.article__body > div.prose');
    let paragraphs = prose.querySelectorAll('p:nth-child(n+6)');

     // Don't show creative if less than 10 paragraphs
    if (document.querySelectorAll('.article__body > div.prose > p').length < minParagraphs) {
        return;
    }

     // loop through paragraphs from 4th paragraph
    // insert creativeContainer if paragraph is followed by a p or h1 elem
    for (i = 0; i < paragraphs.length; i++) {
        if (paragraphs[i].nextElementSibling &&
            (paragraphs[i].nextElementSibling.tagName === 'P' || paragraphs[i].nextElementSibling.tagName === 'H1')) {
            paragraphs[i].nextElementSibling.parentNode.insertBefore(creativeContainer, paragraphs[i].nextElementSibling);
            break;
        }
    }
}

function injectInlineCreative(creativeContainer) {
    let i;
    const prose = document.querySelector('.article__body > div.prose');
    const paragraphs = prose.querySelectorAll('p:nth-child(n+4)');

    // loop through paragraphs from 4th paragraph
    // insert creativeContainer if paragraph is followed by a p or h1 elem
    for (i = 0; i < paragraphs.length; i++) {
        if (paragraphs[i].nextElementSibling &&
            (paragraphs[i].nextElementSibling.tagName === 'P' || paragraphs[i].nextElementSibling.tagName === 'H1')) {
            paragraphs[i].nextElementSibling.parentNode.insertBefore(creativeContainer, paragraphs[i].nextElementSibling);
            break;
        }
    }
}

function injectEpicCreative(creativeContainer) {
    const prose = document.querySelector('.article__body > div.prose');

    if (prose) {
        prose.appendChild(creativeContainer);
    }
}

function isCreativeInView(creativeContainer, id) {
    const messageName = `creative_impression/${id}`;

    if (!trackedImpressions.includes(id) && isElementPartiallyInViewport(creativeContainer)) {
        signalDevice(messageName);
        trackedImpressions.push(id);
    }
}

export { init, trackLiveBlogEpic };