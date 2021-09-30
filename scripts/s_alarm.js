/*
 Localization
 */

const locales = {
    'en_dk': {
        'volume_set': 'Volume:',
        'next_check': 'Next Check:',
        'current_max': 'Current Maximum:',
        'trigger_at': 'Trigger at:',
        'storage_cap': ' % of storage',
    },
    'cs_CZ': {
        'volume_set': 'Hlasitost:',
        'next_check': 'Další kontrola:',
        'current_max': 'Současné maximum:',
        'trigger_at': 'Spustit při:',
        'storage_cap': ' % skladu',
    }
};

let strings;
let locale = window['game_data']['locale'];
if (locales.hasOwnProperty(locale)) {
    strings = locales[locale];
} else {
    strings = Object.values(locales)[0];
}

/*
Variables
 */
const audio = new Audio(
    'https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3');
let storageCap = 0.5;
let countdown = 10;

/*
 Main Script
 */
createScriptPanel();
setVolume(50);
startIntervalAlarm().then();

/**
 * Functions
 */

function createScriptPanel() {
    let container = document.getElementById('contentContainer');
    let panel = `
    <table style="height: 100px; border: 1px solid rgba(128, 64, 0, 0.7); background-color: #fff8e6;" >
        <tbody>
            <tr><td style="padding: 6px">${strings.volume_set}</td><td><span id="span_volume">.. %</span></td><td style="padding: 6px"><input type="range" min="0" max="100" value="50" oninput="setVolume(this.value)"></td></tr>
            <tr><td style="padding: 6px">${strings.trigger_at}</td><td><span id="span_storage">50</span>${strings.storage_cap}</td><td style="padding: 6px"><input type="range" min="0" max="100" value="50" oninput="setStorageCap(this.value)"></td></tr>
            <tr><td style="padding: 6px">${strings.next_check}</td><td><span id="check_timer">10</span></td></tr>
            <tr><td style="padding: 6px">${strings.current_max}</td><td><span id="s_max">NaN</span></td></tr>
        </tbody>      
    </table>
     `;
    $(panel).insertBefore(container);
}

async function getVillageData() {
    return await fetch(window['game_data']['link_base_pure'] + "snob&ajax=exchange_data", {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9,cs;q=0.8,sk;q=0.7,pl;q=0.6",
            "sec-fetch-site": "same-origin",
            "tribalwars-ajax": "1",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": window.location.href,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    }).then(response => response.json()).then(json => json['game_data']['village']);
}

async function startIntervalAlarm() {
    setInterval(async function () {
        countdown--;
        document.querySelector("#check_timer").textContent = String(countdown);
        if (countdown === 0) {
            let village = await getVillageData();
            parseData(village);
            countdown = 10;
        }
    }, 1000)
}

function parseData(village) {
    let maxStorage = village['storage_max'];
    let maxResources = Math.max(village['stone'], village['iron'], village['wood']);
    document.getElementById('s_max').innerText = String(maxResources);
    if (maxResources > maxStorage * storageCap) {
        audio.play().then();
    }
}

function setVolume(volume) {
    audio.volume = volume / 100;
    document.querySelector("#span_volume").textContent = volume + " %";
}

function setStorageCap(volume) {
    storageCap = volume / 100;
    document.querySelector("#span_storage").textContent = volume;
}