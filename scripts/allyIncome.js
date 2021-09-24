if (window.location.href.indexOf('screen=ally&mode=members_troops') < 0) {
    //relocate
    window.location.assign(window['game_data']['link_base_pure'] + "ally&mode=members_troops");
}

const local_storage_key = 'allyIncome_reports';
const playerName = document.querySelector('[name=player_id] option[selected]').innerText.trim();
let incomingTable = document.querySelector('.table-responsive table');

/**
 * Load player info
 * Example of user data:
 {
  "1Rici": {
    "1632435450": {
      "123": 0,
      "602": 2
    },
    "last": {
      "123": 0,
      "602": 1
    }
  }
}
 */

let allyIncomingJson = JSON.parse(localStorage.getItem(local_storage_key));
allyIncomingJson = allyIncomingJson ? allyIncomingJson : {};
allyIncomingJson[playerName] = allyIncomingJson[playerName] ? allyIncomingJson[playerName] : {};



let lastIncoming = allyIncomingJson[playerName]['last'];
/**
 * Add header
 */
if (lastIncoming) {
    incomingTable.rows[0].insertCell(1).outerHTML = '<th>Předchozí</th>';
}

for (let i = 1; i < incomingTable.rows.length; i++) {
    let villageId = incomingTable.rows[i].cells[0].querySelector('a').getAttribute('href').match(/id=[0-9]+/)[0].match('[0-9]+')[0];
    if (lastIncoming) {
        /**
         * Create last time incoming
         */
        if (lastIncoming[villageId] !==undefined){
            incomingTable.rows[i].insertCell(1).outerHTML = '<td class>'+lastIncoming[villageId]+'</td>';
            let rowLength = incomingTable.rows[i].cells.length;
            let inCell = incomingTable.rows[i].cells[rowLength-1];

            let currentAttacks = Number(inCell.innerText.trim());


            if (currentAttacks > lastIncoming[villageId]){
                inCell.style.backgroundColor = '#F0AD7E';
                inCell.innerText+=' (+'+Number(currentAttacks-lastIncoming[villageId])+')';
            }
            if (currentAttacks < lastIncoming[villageId]){
                inCell.style.backgroundColor = '#E1EFBA';
                inCell.innerText+=' ('+Number(currentAttacks-lastIncoming[villageId])+')';
            }

        } else {
            incomingTable.rows[i].insertCell(1).outerHTML = '<td>NaN</td>';
            incomingTable.rows[i].cells[incomingTable.rows[i].cells.length-1].style.backgroundColor = '#F0AD7E';
        }
    }
}
let button = ' <button class="btn" style="margin-top: 10px; margin-bottom: 10px;" onClick="saveLast()">Save current</button>';
$(button).insertBefore(incomingTable);


function saveLast(){
    lastIncoming = {};
    let pattern = /(\([+-]?[0-9]+\))|(\(NaN\))/g;
    for (let i = 1; i < incomingTable.rows.length; i++) {
        let villageId = incomingTable.rows[i].cells[0].querySelector('a').getAttribute('href').match(/id=[0-9]+/)[0].match('[0-9]+')[0];
        lastIncoming[villageId] = Number(incomingTable.rows[i].cells[incomingTable.rows[i].cells.length-1].innerText.replace(pattern,'').trim());
    }
    allyIncomingJson[playerName]['last'] = lastIncoming;
    localStorage.setItem(local_storage_key, JSON.stringify(allyIncomingJson));
    UI.InfoMessage('Saved', 2e3, "success");
}
