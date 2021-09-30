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
        'iron': 'Check iron',
        'wood': 'Check wood',
        'stone': 'Check stone',
    },
    'cs_CZ': {
        'volume_set': 'Hlasitost:',
        'next_check': 'Další kontrola:',
        'current_max': 'Současné maximum:',
        'trigger_at': 'Spustit při:',
        'storage_cap': ' % skladu',
        'iron': 'Hlídat železo',
        'wood': 'Hlídat dřevo',
        'stone': 'Hlídat hlínu',
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
const local_storage_key = "s_alarm";
const audio = new Audio(
    'https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3');
let storageCap = 0.5;
let countdown = 10;
let s_settings;


/*
 Main Script
 */
createScriptPanel();
loadSettings();
startIntervalAlarm().then();

/**
 * Functions
 */

function loadSettings() {
    s_settings = JSON.parse(localStorage.getItem(local_storage_key));
    if (!s_settings) s_settings = {'vol': 50, 'iron': true, 'wood': true, 'stone': true, 'cap': 50};
    console.log(s_settings);
    setVolume(s_settings['vol']);
    setStorageCap(s_settings['cap']);
    document.getElementById('s_a_w').checked = s_settings['wood'];
    document.getElementById('s_a_s').checked = s_settings['stone'];
    document.getElementById('s_a_i').checked = s_settings['iron'];
    document.getElementById('s_cap').value = s_settings['cap'];
    document.getElementById('s_vol').value = s_settings['vol'];
}

function setSettings(r, b) {
    s_settings[r] = b;
    saveSettings();
}

function saveSettings() {
    localStorage.setItem(local_storage_key, JSON.stringify(s_settings));
}

function createScriptPanel() {
    let container = document.getElementById('contentContainer');
    let panel = `
    <table style="height: 100px; border: 1px solid rgba(128, 64, 0, 0.7); background-color: #fff8e6;" >
        <tbody>
            <tr><td style="padding: 6px">${strings.volume_set}</td><td><span id="span_volume">.. %</span></td><td style="padding: 6px"><input id="s_vol" type="range" min="0" max="100" value="50" onchange="setSettings('vol', this.value)" oninput="setVolume(this.value)"></td></tr>
            <tr><td style="padding: 6px">${strings.trigger_at}</td><td><span id="span_storage">.. %</span>${strings.storage_cap}</td><td style="padding: 6px"><input id="s_cap" type="range" min="0" max="100" value="$settings['cap']" onchange="setSettings('cap', this.value)" oninput="setStorageCap(this.value)"></td></tr>
            <tr><td style="padding: 6px">${strings.wood}</td><td><input type="checkbox" id="s_a_w" onchange="setSettings('wood', this.checked)"><span class="icon header wood"> </span></td></tr>
            <tr><td style="padding: 6px">${strings.stone}</td><td><input type="checkbox" id="s_a_s" onchange="setSettings('stone', this.checked)"><span class="icon header stone"> </td></tr>
            <tr><td style="padding: 6px">${strings.iron}</td><td><input type="checkbox" id="s_a_i" onchange="setSettings('iron', this.checked)"><span class="icon header iron"> </td></tr>
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
    let maxResources = Math.max(s_settings['stone'] ? village['stone'] : 0, s_settings['iron'] ? village['iron'] : 0, s_settings['wood'] ? village['wood'] : 0);
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