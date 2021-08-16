const local_storage_key = 'rss_reports';

let players = [];
let iron = {};
let stone = {};
let wood = {};
let sum = {};
let index = 0;

let parser = new DOMParser();
let reports = document.querySelectorAll("#report_list > tbody > [class*='report-'] > \ntd > input");
let rssReports = JSON.parse(localStorage.getItem(local_storage_key));
if (rssReports == null) {
    rssReports = {};
}

/*
 * Localization
 */
const locales = {
    'en_dk': {
        'player': 'Player',
        'wood': 'Wood',
        'stone': 'Clay',
        'iron': 'Iron',
        'sum': 'Sum',
        't_sum': 'Sum of table: ',
        'mem_clear': 'Memory is clear',
        'c_cache_1': 'There are ',
        'c_cache_2': ' reports in memory taking ',
        'c_cache_3': ' KB of memory. It is recommended to clear cache when there is over 5000 reports.',
        'b_clear': 'Clear cache',
        'b_export': 'Export to BB',
        'b_load': 'Load from the table',
        'b_start': 'Run statistic',
        'insert_table': 'Insert table(s)',
        'processed':'Processed',
        'contributions':'Contributions'
    }, 'cs_CZ': {
        'player': 'Hráč',
        'wood': 'Dřevo',
        'stone': 'Hlína',
        'iron': 'Železo',
        'sum': 'Celkem',
        't_sum': 'Součet surovin z tabulky: ',
        'mem_clear': 'Paměť je čistá',
        'c_cache_1': 'V paměti se nachází ',
        'c_cache_2': ' oznámení zabírající ',
        'c_cache_3': ' KB paměti. Je doporučeno vyčistit paměť při více jak 5000 oznámení.',
        'b_clear': 'Vyčistit paměť',
        'b_export': 'Vygenerovat BB',
        'b_load': 'Načíst z tabulky',
        'b_start': 'Spustit statistiku',
        'insert_table': 'Vložte tabulku(y) v BB kódech',
        'processed':'Zpracováno',
        'contributions':'Příspěvky'
    }
};

let strings;

let locale = window['game_data']['locale'];
if (locales.hasOwnProperty(locale)) {
    strings = locales[locale];
} else {
    strings = Object.values(locales)[0];
}

addTable();

/**
 * Functions
 */
function incrementDonationCount() {
    let donationCount = Number(document.querySelector("#donation_count").textContent);
    document.querySelector("#donation_count").textContent = (donationCount + 1).toString();
}

function clearCache() {
    if (localStorage[local_storage_key]) {
        let size = (((localStorage[local_storage_key].length + 'rss_length'.length) * 2) / 1024).toFixed(2);
        let amount = Object.keys(JSON.parse(localStorage.getItem(local_storage_key))).length;
        let r = confirm(strings.c_cache_1 + amount + strings.c_cache_2 + size + strings.c_cache_3);
        if (r === true) {
            localStorage.removeItem(local_storage_key);
        }
    } else {
        alert(strings.mem_clear);
    }

}

function exportToBB() {
    document.getElementById('bb_output').innerHTML = `<textarea id="rss_bb_text" readonly style="width: 100%" rows="10"></textarea>`;
    let ta = document.getElementById('rss_bb_text');
    ta.textContent = `[table]\n[**]${strings.player}[||]${strings.wood}[||]${strings.stone}[||]${strings.iron}[||]${strings.sum}[/**]\n`;
    $('#donation_table > tbody  > tr').each(function (index, tr) {
        let cells = tr.getElementsByTagName('td');
        ta.value += "[*]" + cells[0].textContent + '[|]' + cells[1].textContent + '[|]' + cells[2].textContent + '[|]' + cells[3].textContent + '[|]' + cells[4].textContent + "\n";
    });
    ta.value += '[/table]';
    let s = 0;
    for (let a in sum) {
        s += sum[a];
    }
    ta.value += `${strings.t_sum}` + s;
}

function addTable() {
    let table = ` 
        <br>
        <p><b>${strings.contributions}</b></p>
        <div >${strings.processed}: <span id="donation_count">0</span>/<span>${reports.length}</span></div>
        <table style="width:100%" class="vis" id="donation_table">
            <thead>
                <tr>
                    <th style="cursor: pointer">${strings.player}</th>
                    <th style="cursor: pointer">${strings.wood}</th>
                    <th style="cursor: pointer">${strings.stone}</th>
                    <th style="cursor: pointer">${strings.iron}</th>
                    <th style="cursor: pointer">${strings.sum}</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
     
        <button class="btn float_right" style="margin-top: 10px; margin-bottom: 10px;" onClick="clearCache()">${strings.b_clear}</button>
        <button class="btn float_right" style="margin-top: 10px; margin-bottom: 10px;" onClick="exportToBB()">${strings.b_export}</button>
        <button class="btn float_right" style="margin-top: 10px; margin-bottom: 10px;" onClick="insertTable()">${strings.b_load}</button>
        <button class="btn float_right" style="margin-top: 10px; margin-bottom: 10px;" onClick="runStatistics()">${strings.b_start}</button>
        <br><br>
        <div id="bb_output"></div>
    
            `;
    $(table).insertBefore(document.getElementsByClassName('report-preview')[0]);

    $("#donation_table thead").on("click", "th", function () {

        let index = $(this).index();
        let tbody = $(this).closest("table").find("tbody");
        let rows = tbody.children().detach().get();
        rows.sort(function (left, right) {
            let l = $(left).children().eq(index);
            let r = $(right).children().eq(index);
            if (index === 0) {
                return l.text().localeCompare(r.text());
            } else {
                let nl = Number(l.text());
                let nr = Number(r.text());
                if (nl === nr) return 0;
                if (nl > nr) return -1;
                return 1;
            }

        });
        tbody.append(rows);
    });
}

function clearTable() {
    $("#donation_table tbody tr").remove();
    document.querySelector("#donation_count").textContent = "0";
    players = [];
    iron = {};
    stone = {};
    wood = {};
}

function insertTable() {
    const table = prompt(strings.insert_table, "[table][/table]");
    let lines = table.split('\n');
    for (let line in lines) {
        if (lines[line].startsWith('[*]')) {
            let values = lines[line].replace('[*]', '').split('[|]');
            checkPlayer(values[0]);
            addWood(values[0], Number(values[1]));
            addStone(values[0], Number(values[2]));
            addIron(values[0], Number(values[3]));
            updateSum(values[0]);
        }
    }
}

function checkPlayer(player) {
    if (!players.includes(player)) {
        players.push(player);
        wood[player] = 0;
        iron[player] = 0;
        stone[player] = 0;

        let table = document.getElementById("donation_table").getElementsByTagName('tbody')[0];
        let row = table.insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        cell2.id = "p_w_" + player;
        let cell3 = row.insertCell(2);
        cell3.id = "p_s_" + player;
        let cell4 = row.insertCell(3);
        cell4.id = "p_i_" + player;
        let cell5 = row.insertCell(4);
        cell5.id = "p_a_" + player;

        cell1.textContent = player;
        cell2.textContent = '0';
        cell3.textContent = '0';
        cell4.textContent = '0';
        cell5.textContent = '0';
    }
}

function addWood(player, amount) {
    if (amount) {
        wood[player] += amount;
        let d = document.getElementById("p_w_" + player);
        d.textContent = wood[player];
    }
}

function addIron(player, amount) {
    if (amount) {
        iron[player] += amount;
        let d = document.getElementById("p_i_" + player);
        d.textContent = iron[player];
    }
}

function addStone(player, amount) {
    if (amount) {
        stone[player] += amount;
        let d = document.getElementById("p_s_" + player);
        d.textContent = stone[player];
    }
}

function updateSum(player) {
    let d = document.getElementById("p_a_" + player);
    sum[player] = wood[player] + stone[player] + iron[player];
    d.textContent = sum[player];
}

function runStatistics() {
    clearTable();
    reports.forEach((report) => {
            const report_id = report.getAttribute("name").split("_")[1];
            if (rssReports[report_id])
                /**
                 * Local storage
                 */
            {
                let localReport = rssReports[report_id];
                let player = localReport['p'];
                checkPlayer(player);
                addWood(player, localReport['w']);
                addStone(player, localReport['s']);
                addIron(player, localReport['i']);
                updateSum(player);
                incrementDonationCount();
            } else
                /**
                 * AJAX
                 */
            {
                setTimeout(function () {
                    let response = $.ajax({
                        type: "GET",
                        url: "/game.php?village=6423&screen=report&ajax=view&id=" + report_id,
                        async: false
                    }).responseJSON['dialog'];
                    let body = parser.parseFromString(response, 'text/html').body;

                    const player = body.querySelector("table > tbody> tr > th > a").text;
                    checkPlayer(player);

                    let resources = body.querySelectorAll("body > span");
                    rssReports[report_id] = {'p': player};
                    resources.forEach(resource => {
                        let amount = Number(resource.textContent.split(".").join(""));

                        if (resource.querySelector("span > span").classList.contains("wood")) {
                            addWood(player, amount);
                            rssReports[report_id]['w'] = amount;
                        }

                        if (resource.querySelector("span > span").classList.contains("stone")) {
                            addStone(player, amount);
                            rssReports[report_id]['s'] = amount;
                        }

                        if (resource.querySelector("span > span").classList.contains("iron")) {
                            addIron(player, amount);
                            rssReports[report_id]['i'] = amount;
                        }
                        updateSum(player);
                    });

                    localStorage.setItem(local_storage_key, JSON.stringify(rssReports));
                    incrementDonationCount();

                }, index++ * 200);
            }
        }
    );
}