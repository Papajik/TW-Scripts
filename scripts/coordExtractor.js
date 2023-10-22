/** C O N S T A N T S  */

const local_storage_key = 'stored_coords';
const selectors = {
    'mainContainer': '#contentContainer',
};

/** V A R I A B L E S  */
let selectedCoordsIndex = null;
let container = document.createElement('div');
let textAreaContainer = document.createElement('div');
let textArea = document.createElement('textarea');


/** L O C A L I Z A T I O N  */
const locales = {
    'en_dk': {
        'insert_list_name': 'Insert list name',
        'show': 'Show',
    },

    'cs_CZ': {
        'insert_list_name': 'Zadejte název seznamu',
        'show': 'Zobrazit',
    }
}
let strings;

let locale = window['game_data']['locale'];
if (locales.hasOwnProperty(locale)) {
    strings = locales[locale];
} else {
    strings = Object.values(locales)[0];
}

/** L O C A L   S T O R A G E */
let storedCoords = JSON.parse(localStorage.getItem(local_storage_key)) ?? [];

/** M A I N   S C R I P T */
initCoords();
createCoordLists();
disableVillageLinks();
initCoordGrabber();

/** F U N C T I O N S  */
function initCoords() {
    if (storedCoords.length === 0) {
        storedCoords.push({'name': 'default', 'coords': []});
    }
    selectedCoordsIndex = 0;
}

function createCoordLists() {
    const mainContainer = document.querySelector(selectors.mainContainer);
    container.style.paddingBottom = '10px';
    container.style.paddingTop = '10px';

    textArea.rows = 4;
    textArea.cols = 30;
    textArea.value = "";

    textAreaContainer.style.width = '100%';
    textAreaContainer.style.marginBottom = '10px';
    textAreaContainer.appendChild(textArea);
    textAreaContainer.style.display = 'none';

    mainContainer.insertBefore(textAreaContainer, mainContainer.firstChild);
    mainContainer.insertBefore(container, mainContainer.firstChild);

    refillContainer(container);
}

function refillContainer(container) {
    container.replaceChildren()

    storedCoords.forEach((item, index) => {
        let link = document.createElement('a');
        if (index === selectedCoordsIndex) {
            link.style.background = 'darkslateblue';
        }
        link.classList.add('btn', 'btn-default');
        link.href = '#';
        link.textContent = item['name'] + ' (' + item['coords'].length + ')';
        link.addEventListener('click', () => {
            if (selectedCoordsIndex !== null) {
                container.children[selectedCoordsIndex].style.background = '';
            }
            selectedCoordsIndex = index;
            link.style.background = 'darkslateblue';
            fillText()
        })
        container.appendChild(link);
    })

    let addBtn = document.createElement('a');
    addBtn.classList.add('btn', 'btn-default');
    addBtn.href = '#';
    addBtn.style.background = 'green'
    addBtn.textContent = ' + ';
    addBtn.addEventListener('click', () => {
        let name = prompt(strings.insert_list_name);
        if (name !== null && name !== '') {
            storedCoords.push({'name': name, 'coords': []});
            localStorage.setItem(local_storage_key, JSON.stringify(storedCoords));
            selectedCoordsIndex = storedCoords.length - 1;
            refillContainer(container);
        }
    });
    container.appendChild(addBtn);

    let removeBtn = document.createElement('a');
    removeBtn.classList.add('btn', 'btn-default');
    removeBtn.href = '#';
    removeBtn.style.background = 'darkred'
    removeBtn.textContent = ' - ';
    removeBtn.addEventListener('click', () => {
        if (selectedCoordsIndex !== null) {
            storedCoords.splice(selectedCoordsIndex, 1);
            localStorage.setItem(local_storage_key, JSON.stringify(storedCoords));
            selectedCoordsIndex = null;
            refillContainer(container);
        }
    });
    container.appendChild(removeBtn);


    let showCoordsBtn = document.createElement('a');
    showCoordsBtn.classList.add('btn', 'btn-default');
    showCoordsBtn.href = '#';
    showCoordsBtn.style.background = 'darkslategray'
    showCoordsBtn.textContent = strings.show;
    showCoordsBtn.addEventListener('click', () => {
        fillText();
        if (textAreaContainer.style.display === 'none') {
            textAreaContainer.style.display = 'block';
        } else {
            textAreaContainer.style.display = 'none';
        }

    });
    container.appendChild(showCoordsBtn);
    fillText();
}

function fillText() {
    let text = '';

    if (selectedCoordsIndex !== null) {
        storedCoords[selectedCoordsIndex]['coords'].forEach((item) => {
            text += item + '\n';
        })
    }
    textArea.value = text;
}

function initCoordGrabber() {

    addEventListener("click", (_) => {
        // disable links
        let s = window.getSelection();
        let node = s.anchorNode;
        if (node === null) {
            return;
        }
        // grep coords ddd|ddd
        let coords = node.textContent.match(/\d{3}\|\d{3}/g);
        if (coords !== null) {
            // add coords to selected list
            if (selectedCoordsIndex !== null) {
                coords.forEach((item) => {
                    if (!storedCoords[selectedCoordsIndex]['coords'].includes(item)) {
                        storedCoords[selectedCoordsIndex]['coords'].push(item);
                    }
                })
                localStorage.setItem(local_storage_key, JSON.stringify(storedCoords));
                refillContainer(container);
            }
        }

    });
}

function disableVillageLinks() {
    let links = document.querySelectorAll('a[href*="screen=info_village"]');
    links.forEach((link) => {
        link.removeAttribute('href');
    })
}

