/*
Relocation
 */

if (window.location.href.indexOf('screen=mail&mode=address') < 0) {
    window.location.assign(window['game_data']['link_base_pure'] + "mail&mode=address");
}

/*
 Localization
 */

const locales = {
    'en_dk': {
        'group_name': 'Group name',
        'group_members': 'Group members',
        'import': 'Import',
        'fill_group': 'Fill group',
        'empty_alert': 'Group name or group members is empty.',
        'no_contacts': 'Contacts missing!',
        'no_group_name': 'Group name missing!',
        'fill_done': 'Fill group completed',
        'import_done': 'Import completed',
    },
    'cs_CZ': {
        'group_name': 'Jméno skupiny',
        'group_members': 'Členové',
        'import': 'Importovat',
        'fill_group': 'Vyplnit skupinu',
        'empty_alert': 'Nevyplnil jste název nebo členy skupiny.',
        'no_contacts': 'Kontakty nejsou vyplněny!',
        'no_group_name': 'Není vyplněn název skupiny!',
        'fill_done': 'Vyplnění skupiny dokončeno',
        'import_done': 'Import kontaktů dokončen',
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
let csrf = window['game_data']['csrf'];

/*
 Main Script
 */
createTable();


/*
Functions
 */

function createTable() {
    let f = `
    <table style="width: 100%">
        <tbody>
            <tr>
                <td>${strings.group_name}</td>
                <td><input id="address_name" type="text"></td>
            </tr>
            <tr>
                <td>${strings.group_members}</td>
                <td>
                <textarea id="address_players" style="width: 100%" rows="4"></textarea>
                </td>
            </tr>
        </tbody>
    </table>
    <button class="btn" style="margin-top: 10px; margin-bottom: 10px;" onClick="importAll()">${strings.import}</button>
    `;
    $(f).insertBefore(document.querySelector("table > tbody > tr > td > h3"));
}

async function importAll() {
    await importContacts();
    let groupName = document.getElementById('address_name').value;
    if (groupName === '') {
        return;
    }
    let ids = getPlayerIds();
    await createGroup(groupName);
    let groupId = getGroupId();

    if (ids && groupId) {
        await fillGroup(groupId, ids);
        updateContactsTable();
        updateGroupTable();
        UI.InfoMessage(strings.fill_done, 2e3, "success");
    }
}

async function importContacts() {
    console.log("ImportContacts");
    let playerNames = document.getElementById('address_players').value.trim();

    if (playerNames === '') {
        UI.InfoMessage(strings.no_contacts, 2e3, "error");
        return;
    }
    let names = playerNames.split(';');
    await checkPlayerNames(names);
    updateContactsTable();
}

function updateContactsTable() {
    console.log('updateContactsTable');
    let oldContacts = getContactsTable();
    let text = $.ajax({
        type: "GET",
        url: window['game_data']['link_base_pure'] + "mail&mode=address",
        async: false
    }).responseText;
    if (oldContacts) {
        oldContacts.innerHTML = $.trim($(text).find("#content_value >table >tbody >tr >td:nth-child(2) > table:nth-child(2) tbody").html());
    } else {
        let t = $.trim($(text).find("#content_value >table >tbody >tr >td:nth-child(2) > table:nth-child(2)").html());
        let tb = document.createElement("table");
        tb.className = "vis";
        tb.innerHTML = t;
        $(tb).insertBefore(document.querySelector("#content_value > table > tbody > tr > td:nth-child(2) > h4"));
    }
}

function updateGroupTable() {
    console.log('updateGroupTable');
    let oldGroup = getGroupTable();

    let text = $.ajax({
        type: "GET",
        url: window['game_data']['link_base_pure'] + "mail&mode=address",
        async: false
    }).responseText;
    if (oldGroup) {
        console.log("old group");
        let cg = oldGroup.querySelector("colgroup");
        oldGroup.innerHTML = $.trim($(text).find("#content_value >table >tbody >tr >td:nth-child(2) > table:nth-child(6) tbody").html());
        oldGroup.append(cg);
    } else {
        console.log("New table");
        let t = $.trim($(text).find("#content_value >table >tbody >tr >td:nth-child(2) > table:nth-child(6)").html());
        let tb = document.createElement("table");
        let cb = document.createElement("colgroup");
        cb.innerHTML = $.trim($(text).find("#content_value colgroup").html());
        tb.className = "vis";
        tb.innerHTML = t;
        tb.appendChild(cb);
        $(tb).replaceAll(document.querySelector("#content_value > table > tbody > tr > td:nth-child(2) > i"));
    }
}


function groupExists(groupName) {
    let groups = document.querySelectorAll('.quickedit-label');
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].innerText === groupName)
            return true;
    }
    return false;
}

async function createGroup(groupName) {
    console.log("CreateGroup");
    if (!groupExists(groupName)) {
        console.log('Creating group: ' + groupName);
        let buttonText = document.querySelector('[name=address_groupname_add_submit]').value;

        await fetch(window['game_data']['link_base_pure'] + "mail&mode=address&action=add_address_groupname", {
            "headers": {
                "content-type": "application/x-www-form-urlencoded",
            },
            "referrer": window.location.href,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "address_add_groupname=" + groupName + "&address_groupname_add_submit=" + buttonText + "&h=" + csrf,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        console.log("Group created");
        updateGroupTable();
    } else {
        console.log(groupName + 'already exists');
    }
}


function getGroupId() {
    console.log("getGroupId");
    let addressName = document.getElementById('address_name').value;
    return Array.from(getGroupTable().querySelectorAll("table tbody tr td > span")).filter(value => addressName === value.querySelector("span > span > span").innerHTML)
        .map(
            value => {
                return value.getAttribute("data-id");
            }
        )[0];
}


async function fillGroup(groupId, playerIds) {
    let body = "";

    for (let i = 0; i < playerIds.length; i++) {
        body += "members%5B" + playerIds[i] + "%5D=on&";
    }
    body += "h=" + csrf;

    console.log(body);

    await fetch(window['game_data']['link_base_pure'] + "mail&mode=address&action=address_change_group_members&group_id=" + groupId, {
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
        },
        "referrer": window.location.href,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": body,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
}


function getPlayerIds() {
    console.log("getPlayerIds");
    let names = document.getElementById('address_players').value;
    let cTable = getContactsTable();
    if (!cTable) return [];
    return Array.from(cTable.querySelectorAll("table tbody tr td [href*='info_player']")).filter(value => names.includes(value.innerHTML)
    ).map(
        value => {
            let url = new URL(value.href);
            return url.searchParams.get('id');
        }
    );
}

async function checkPlayerNames(names) {
    let cTable = getContactsTable();
    let contacts = (cTable) ? Array.from(cTable.querySelectorAll("table tbody tr td [href*='info_player']")).map(value => value.innerHTML) : [];
    for (let i = 0; i < names.length; i++) {
        if (!contacts.includes(names[i])) {
            await addPlayer(names[i]);
        }
    }
}

/*
Request to add player
 */
async function addPlayer(name) {
    await fetch(window['game_data']['link_base_pure'] + "mail&mode=address&action=add_address_name", {
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
        },
        "referrer": window.location.href,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "name=" + name + "&h=" + csrf_token,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(response => console.log(response));
}

/*
Helper functions
 */

function getContactsTable() {
    return document.querySelectorAll('#content_value > table > tbody > tr > td')[1].querySelectorAll('table')[1];
}

function getGroupTable() {
    return document.querySelectorAll('#content_value > table > tbody > tr > td')[1].querySelectorAll('table')[2];
}