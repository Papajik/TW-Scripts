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
        let r = confirm('V paměti se nachází ' + amount + ' oznámení zabírající ' + size + ' KB paměti. Doporučuji vyčistit paměť při více jak 5.000 oznámení');
        if (r === true) {
            localStorage.removeItem(local_storage_key);
        }
    } else {
        alert('Paměť je čistá');
    }

}

function exportToBB() {
    document.getElementById('bb_output').innerHTML = `<textarea id="rss_bb_text" readonly style="width: 100%" rows="10"></textarea>`;
    let ta = document.getElementById('rss_bb_text');
    ta.textContent = "[table]\n[**]Hráč[||]Dřevo[||]Hlína[||]Železo[||]Celkem[/**]\n";
    $('#donation_table > tbody  > tr').each(function (index, tr) {
        let cells = tr.getElementsByTagName('td');
        ta.value += "[*]" + cells[0].textContent + '[|]' + cells[1].textContent + '[|]' + cells[2].textContent + '[|]' + cells[3].textContent + '[|]' + cells[4].textContent + "\n";
    });
    ta.value += '[/table]';
    let s = 0;
    for (let a in sum) {
        s += sum[a];
    }
    ta.value += 'Surovin celkem: ' + s;
}

function addTable() {
    let table = ` 
     
        <br>
        <p><b>Příspěvky</b></p>
        <div >Zpracováno: <span id="donation_count">0</span>/<span>${reports.length}</span></div>
        <table style="width:100%" class="vis" id="donation_table">
            <thead>
                <tr>
                    <th style="cursor: pointer">Hráč</th>
                    <th style="cursor: pointer">Dřevo</th>
                    <th style="cursor: pointer">Hlína</th>
                    <th style="cursor: pointer">Železo</th>
                    <th style="cursor: pointer">Celkem</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
     
        <button class="btn float_right" style="margin-top: 10px; margin-bottom: 10px;" onClick="clearCache()">Vyčistit paměť</button>
        <button class="btn float_right" style="margin-top: 10px; margin-bottom: 10px;" onClick="exportToBB()">Vygenerovat BB</button>
        <button class="btn float_right" style="margin-top: 10px; margin-bottom: 10px;" onClick="insertTable()">Načíst z tabulky</button>
        <button class="btn float_right" style="margin-top: 10px; margin-bottom: 10px;" onClick="runStatistics()">Spustit statistiku</button>
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
    const table = prompt("Vložte tabulku v BB kódech", "[table][/table]");
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