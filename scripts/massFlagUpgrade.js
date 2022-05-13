/*
Relocation
 */

if (window.location.href.indexOf('screen=flags') < 0) {
    window.location.assign(window['game_data']['link_base_pure'] + "flags");
}

/*
 Localization
 */

const locales = {
    'en_dk': {
        'menu_head': 'Mass upgrade',
        'upgrade_txt': 'Flags to upgrade: ',
        'upgrade_btn_start': 'Start',
        'upgrade_btn_stop': 'Stop',
    },
    'cs_CZ': {
        'menu_head': 'Hromadné vylepšení',
        'upgrade_txt': 'Počet vlajek: ',
        'upgrade_btn_start': 'Start',
        'upgrade_btn_stop': 'Stop',
    }
};

let strings;

let locale = window['game_data']['locale'];
if (locales.hasOwnProperty(locale)) {
    strings = locales[locale];
} else {
    strings = Object.values(locales)[0];
}

/**
 *  Main Script
 */


for (let i = 1; i < 9; i++) { // flags
    for (let j = 1; j < 10; j++) { // levels
        let box = $("#flag_box_" + i + "_" + j);
        $(box).off();
        let upgrade_button = $(box).find('div')[0];
        $(upgrade_button).off();
        upgrade_button.addEventListener('click', function (e) {
            e.stopPropagation();
            hideUpgradeMenu();
            showUpgradeMenu($(this).parent());
        });
    }
}

/**
 * Functions
 */

function hideUpgradeMenu() {
    stopInterval();
    window.lastBox?.removeClass('flag_box_red');
    window.lastBox?.find('#upgrade_menu').remove();
    window.lastBox = null;

}

function showUpgradeMenu(box) {
    window.lastBox = box;
    box.addClass('flag_box_red')


    let menu = document.createElement('div');
    menu.id = "upgrade_menu";
    menu.style.width = '200px';
    menu.style.cursor = 'default';
    menu.style.padding = '6px';
    menu.style.paddingTop = '2px';
    menu.style.height = '100px';
    menu.style.position = 'absolute';
    menu.style.bottom = '-110px';
    menu.style.left = '20px';
    menu.style.zIndex = '50';
    menu.style.border = '2px solid black';
    menu.style.background = '#e3d5b3 url(https://dscs.innogamescdn.com/asset/4b3e16dd/graphic/index/main_bg.jpg) scroll right top repeat';

    // x button
    let closeBtn = document.createElement('div');
    closeBtn.innerText = '✖';
    closeBtn.style.float = 'right';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.padding = '2px';
    closeBtn.onclick = function () {
        hideUpgradeMenu();
    };
    menu.appendChild(closeBtn);

    // header
    let header = document.createElement('p');
    header.innerText = strings.menu_head;
    header.style.fontWeight = 'bold';
    header.style.fontSize = '120%';
    menu.appendChild(header);

    // Row
    let row = document.createElement('div');
    //row.style.display = 'inline-block';


    let upgrade = document.createElement('div');
    upgrade.innerText = strings.upgrade_txt;
    upgrade.style.display = 'inline';

    let input = document.createElement('input');
    let max = box.find('span')[0].innerText;
    input.max = max;
    input.type = 'number';
    input.style.width = '50px';
    input.defaultValue = max;
    input.min = '3';
    input.onchange = onFlagCountChange;

    row.appendChild(upgrade);
    row.appendChild(input);
    menu.appendChild(row);


    // Second Row

    let row2 = document.createElement('div');
    row2.style.display = 'flex';
    row2.style.justifyContent = 'space-between';
    row2.style.marginTop = '5px';

    let progressBar = document.createElement('div');
    progressBar.style.width = '140px';
    progressBar.style.backgroundColor = '#ddd';
    progressBar.style.marginLeft = '5px'

    let progress = document.createElement('div');
    progress.style.textAlign = 'center';
    progress.id = "progress_div";
    progress.style.width = '0%';
    progress.style.backgroundColor = '#04AA6D';
    progress.style.lineHeight = '20px';

    let currentProgress = document.createElement('div');
    currentProgress.style.display = 'inline';
    currentProgress.id = 'current_progress';
    currentProgress.innerHTML = '0';

    let maxProgress = document.createElement('div');
    maxProgress.style.display = 'inline';
    maxProgress.id = 'max_progress';
    maxProgress.innerHTML = max;
    progress.innerHTML = currentProgress.outerHTML + "/" + maxProgress.outerHTML;


    progressBar.appendChild(progress);
    row2.appendChild(progressBar);


    let btn = document.createElement('a');
    btn.classList.add('btn');
    btn.style.float = 'right';
    btn.innerText = strings.upgrade_btn_start;
    btn.onclick = switchUpgrade;

    row2.appendChild(btn);

    menu.appendChild(row2);

    lastBox[0].appendChild(menu);
}


function onFlagCountChange(event) {
    if (!window.upgradeTimerId) {
        let value = parseInt(event.target.value);
        if (value <= parseInt(event.target.max)) {
            if (value < parseInt(event.target.min)) {
                window.lastBox.find("#max_progress")[0].innerText = event.target.min;
                event.target.value = event.target.min;
            } else {
                window.lastBox.find("#max_progress")[0].innerText = value;
            }
        } else {
            event.target.value = event.target.max;
            window.lastBox.find("#max_progress")[0].innerText = event.target.max;
        }
    }

}

function switchUpgrade() {
    if (!window.upgradeTimerId) {
        // start mass upgrade
        runUpgrade();
        window.upgradeTimerId = setInterval(runUpgrade, 100);
        window.lastBox.find('input')[0].disabled = true;
        window.lastBox.find('.btn')[0].innerText = strings.upgrade_btn_stop;
    } else {
        // Stop mass upgrade
        stopInterval();

        let max = window.lastBox.find('span')[0].innerText;
        window.cProgress.innerText = "0";
        window.mProgress.innerText = max;
        dProgress.style.width = '0%';
        window.lastBox.find('.btn')[0].innerText = strings.upgrade_btn_start;
        let input = window.lastBox.find('input')[0];
        input.disabled = false;
        input.value = max;
    }
}

function stopInterval() {
    clearInterval(window.upgradeTimerId);
    window.upgradeTimerId = null;
}


function updateProgress() {
    let diff = parseInt(window.mProgress.innerText) - parseInt(window.cProgress.innerText);
    if (diff >= 3) {
        window.cProgress.innerText = parseInt(window.cProgress.innerText) + 3;
        dProgress.style.width = parseInt(window.cProgress.innerText) / parseInt(window.mProgress.innerText) * 100 + '%';
        window.FlagsScreen.upgradeFlags(window.lastBox.data("type"), window.lastBox.data("level"));
        return false;
    }
    return true;

}

function runUpgrade() {
    let box = window.lastBox;
    window.cProgress = box.find("#current_progress")[0];
    window.mProgress = box.find("#max_progress")[0];
    window.dProgress = box.find("#progress_div")[0];

    if (updateProgress()) {
        stopInterval();
    }
}