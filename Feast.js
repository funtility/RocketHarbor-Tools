//#region Classes
class FeastList {
    constructor() {
        this.locations = [];
    }

    addLocation(map) {
        let loc = new Location(map);
        this.locations.push(loc);
    }

    removeLocation(map) {
        let index = -1;
        for (let i = 0; i < this.locations.length; i++) {
            if (this.locations[i].string === map) index = i;
        }
        this.locations.splice(index, 1);
    }

    addFeastItem(item) {
        if (this.locations.length === 0) this.addLocation(item.location);
        let thisItemsLocation = this.locations.filter(loc => {
            return loc.string === item.location;
        });
        if (thisItemsLocation.length === 0) {
            this.addLocation(item.location);
            thisItemsLocation = this.locations.filter(loc => {
                return loc.string === item.location;
            });
            thisItemsLocation[0].feastItems.push(item);
        } else {
            let duplicate = thisItemsLocation[0].feastItems.filter(itm => {
                return itm.name === item.name;
            });
            if (duplicate.length === 0) {
                thisItemsLocation[0].feastItems.push(item);
            }
        }
        this.calculateChances();
    }

    removeFeastItem(item) {
        let thisItemsLocation = this.locations.filter(loc => {
            return loc.string === item.location;
        });
        let feastItems = thisItemsLocation[0].feastItems;
        let index = -1;
        for (let i = 0; i < feastItems.length; i++) {
            if (feastItems[i].id === item.id) index = i;
        }
        if (index > -1) feastItems.splice(index, 1);
        if (thisItemsLocation[0].feastItems.length === 0) {
            this.removeLocation(thisItemsLocation[0].string);
        }
        this.calculateChances();
    }

    editFeastItemChance(item) {
        let thisItemsLocation = this.locations.filter(loc => {
            return loc.string === item.location;
        });
        let feastItems = thisItemsLocation[0].feastItems;
        for (let i = 0; i < feastItems.length; i++) {
            if (feastItems[i].id === item.id) {
                feastItems[i].chance = item.chance;
            }
        }
        this.calculateChances();
    }

    calculateChances() {
        for (let l = 0; l < this.locations.length; l++) {
            let divisor = 0;
            let quotient = 1;
            for (let i = 0; i < this.locations[l].feastItems.length; i++) {
                divisor += Number(this.locations[l].feastItems[i].chance);
            }
            if (divisor > 0) {
                quotient = 100 / divisor;
            }
            for (let i = 0; i < this.locations[l].feastItems.length; i++) {
                this.locations[l].feastItems[i].percent = Math.round(this.locations[l].feastItems[i].chance * quotient);
            }
        }
    }

    toArray() {
        let node = [];
        for (let l = 0; l < this.locations.length; l++) {
            for (let i = 0; i < this.locations[l].feastItems.length; i++) {
                let id = new XMLNode("Id", this.locations[l].feastItems[i].id);
                let name = new XMLNode("Name", this.locations[l].feastItems[i].name);
                let chance = new XMLNode("Chance", this.locations[l].feastItems[i].chance);
                let string = new XMLNode("string", this.locations[l].string);
                let locations = new XMLNode("Locations", [string]);
                let feastItem = new XMLNode("FeastItem", [id, name, chance, locations]);
                node.push(feastItem);
            }
        }
        return node;
    }
}

class Location {
    constructor(map) {
        this.string = map;
        this.feastItems = [];
    }
}

class FeastItem {
    constructor(id, name, chance, location) {
        this.chance = chance;
        this.id = id;
        this.name = name;
        this.location = location;
        this.percent = 0;
    }
}

class XMLNode {
    constructor(key, value) {
        this.key = key;
        this.attributes = [];
        this.value = value;
        this.type = "";
    }
}
//#endregion

//#region Tabs
var initializeTabs = function () {
    let tabs = document.querySelectorAll(".tab");
    for (let i = 0; i < tabs.length; i++) {
        let ele = document.getElementById(tabs[i].id);
        ele.addEventListener("click", function () {
            selectTab(ele);
        });
    }
};

var selectTab = function (ele) {
    let tabs = document.querySelectorAll(".tab");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active-tab");
        document.getElementById(tabs[i].id + "Content").classList.add("hide");
    }
    ele.classList.add("active-tab");
    document.getElementById(ele.id + "Content").classList.remove("hide");
};
//#endregion

//#region Config
var initializeConfig = function () {
    let rstAll = document.getElementById("reset");

    rstAll.addEventListener("click", function () {
        if (confirm("Are you sure you want to reset everything?\n(This will not reset your config.)")) {
            resetLocations();
            clearFeastListItem();
            initializeFeastList();
            setLocationList();
        }
    });

    let configItems = document.getElementById("configItems");
    configItems.innerHTML = "";
    for (let i = 0; i < FeastConfiguration.value.length; i++) {
        let ci = FeastConfiguration.value[i];
        let child = newConfigItem(ci.key, ci.value, ci.type, i);
        configItems.appendChild(child);
    }
};

var newConfigItem = function (key, value, type, index) {
    let configItems = document.getElementById("configItems");
    let outerDiv = document.createElement("div");
    outerDiv.classList.add("config-item");
    let keyDiv = document.createElement("div");
    keyDiv.innerText = key + ":";
    keyDiv.classList.add("number");
    let valDiv = document.createElement("div");
    switch (type) {
        case "bool":
            valDiv = newConfigBool(value, index);
            break;
        case "int":
            valDiv = newConfigInt(value, index);
            break;
        case "hex":
            valDiv = newConfigHex(value, index);
            break;
        case "array":
            valDiv = newConfigDiv(key, index);
            break;
        default:
            break;
    }
    configItems.setAttribute("data-" + key, value);
    outerDiv.appendChild(keyDiv);
    outerDiv.appendChild(valDiv);
    return outerDiv;
};

var newConfigBool = function (value, index) {
    let ele = document.createElement("input");
    ele.type = "checkbox";
    if (value === 'true') {
        ele.checked = true;
    } else {
        ele.checked = false;
    }
    ele.addEventListener("click", function () {
        FeastConfiguration.value[index].value = ele.checked.toString();
    });
    return ele;
};

var newConfigInt = function (value, index) {
    let ele = document.createElement("input");
    ele.type = "number";
    ele.value = value;
    ele.addEventListener("change", function () {
        alert(ele.checked);
        FeastConfiguration.value[index].value = ele.checked;
    });
    return ele;
};

var newConfigHex = function (value, index) {
    let ele = document.createElement("input");
    ele.type = "text";
    ele.value = value;
    ele.addEventListener("change", function () {
        FeastConfiguration.value[index].value = ele.value;
    });
    return ele;
};

var newConfigDiv = function (key, index) {
    let ele = document.createElement("div");
    ele.setAttribute("id", "config-item-" + key.toLowerCase());
    ele.dataset.index = index;
    return ele;
};
//#endregion

//#region Map/Locations
var initializeMapLocations = function () {
    let ddl = initializeDDL();
    for (let i = 0; i < Locations.length; i++) {
        let opt = document.createElement("option");
        opt.value = Locations[i].map;
        opt.innerText = Locations[i].map;
        ddl.appendChild(opt);
    }
    ddl.addEventListener("change", function () {
        if (feastList.locations.length > 0) {
            if (confirm("Changing Maps will clear the Feast List.\nAre you sure you want to proceed?")) {
                clearFeastListItem();
                initializeFeastList();
                setLocationList();
            } else {
                cancelMapSelect();
            }
        } else {
            setLocationList();
        }
    });
};

var initializeDDL = function () {
    let ddl = document.querySelector("#map");
    ddl.innerHTML = "";
    let opt = document.createElement("option");
    opt.value = -1;
    opt.innerText = "-- Select --";
    ddl.appendChild(opt);
    return ddl;
};

var setLocationList = function () {
    updateFeastItem("location", "");
    let mapSelector = document.getElementById("map");
    let map = mapSelector.value;
    if (map === "-1") return;
    mapSelector.dataset.currentMap = map;
    let locations = document.getElementById("locations");
    locations.innerHTML = "";
    let options = Locations.filter(loc => { return loc.map === map; });
    options = options[0].strings;
    for (let i = 0; i < options.length; i++) {
        let opt = document.createElement("div");
        opt.classList.add("loc");
        opt.classList.add("selectable");
        opt.addEventListener("click", function () { selectLocation(opt); });
        opt.innerText = options[i];
        locations.appendChild(opt);
    }
};

var cancelMapSelect = function () {
    let mapSelector = document.getElementById("map");
    mapSelector.value = mapSelector.dataset.currentMap;
};

var resetLocations = function () {
    document.getElementById("map").value = -1;
    let locations = document.getElementById("locations");
    locations.innerHTML = "";
};

var selectLocation = function (ele) {
    let locations = document.querySelectorAll(".loc");
    for (let i = 0; i < locations.length; i++) {
        locations[i].classList.remove("selected");
        updateFeastItem("location", ele.innerText);
    }
    ele.classList.add("selected");
};
//#endregion

//#region Items
var initializeItems = function () {
    let search = document.getElementById("itemSearch");
    search.addEventListener("keyup", function () {
        searchItems(search);
    });
    searchItems(search);
};

var searchItems = function (ele) {
    let searchString = ele.value.toLowerCase().trim();
    let result = [];
    if (searchString === "") {
        result = DefaultItems;
    } else {
        for (let i = 0; i < DefaultItems.length; i++) {
            if (DefaultItems[i].Name.toLowerCase().indexOf(searchString) > -1) {
                result.push(DefaultItems[i]);
            }
            if (DefaultItems[i].ID.toLowerCase().indexOf(searchString) > -1) {
                if (result.indexOf(DefaultItems[i]) === -1) {
                    result.push(DefaultItems[i]);
                }
            }
        }
    }
    itemSearchResult(result);
};

var itemSearchResult = function (itemArray) {
    updateFeastItem("name", "");
    updateFeastItem("id", "");
    let resultList = document.getElementById("itemSearchResult");
    resultList.innerHTML = "";
    for (let i = 0; i < itemArray.length; i++) {
        let srchItm = document.createElement("div");
        srchItm.classList.add("selectable");
        srchItm.classList.add("item-search-result");
        srchItm.dataset.id = itemArray[i].ID;
        srchItm.dataset.name = itemArray[i].Name;
        srchItm.addEventListener("click", function () {
            selectItem(srchItm);
        });
        let id = document.createElement("div");
        id.classList.add("number");
        id.innerText = itemArray[i].ID;
        let name = document.createElement("div");
        name.innerText = itemArray[i].Name;
        name.setAttribute("style", "padding-left:6px;")
        srchItm.appendChild(id);
        srchItm.appendChild(name);
        resultList.appendChild(srchItm);
    }
};

var selectItem = function (ele) {
    let items = document.querySelectorAll(".item-search-result");
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("selected");
    }
    ele.classList.add("selected");
    updateFeastItem("id", ele.dataset.id);
    updateFeastItem("name", ele.dataset.name);
};
//#endregion

//#region Feast Item
var updateFeastItem = function (dataType, dataValue) {
    let target = document.getElementById("feastItem");
    switch (dataType) {
        case "id":
            target.dataset.id = dataValue;
            document.getElementById("feastItem-id").innerHTML = dataValue;
            break;
        case "name":
            target.dataset.name = dataValue;
            document.getElementById("feastItem-name").innerHTML = dataValue;
            break;
        case "chance":
            target.dataset.chance = dataValue;
            document.getElementById("feastItem-chance").value = dataValue;
            break;
        case "location":
            target.dataset.location = dataValue;
            document.getElementById("feastItem-location").innerHTML = dataValue;
            break;
        default:
            console.log("updateFeastItem switch default");
    }
    toggleAddButton();
};

var toggleAddButton = function () {
    let target = document.getElementById("feastItem");
    let c = target.dataset.chance === "" ? false : true;
    let i = target.dataset.id === "" ? false : true;
    let n = target.dataset.name === "" ? false : true;
    let l = target.dataset.location === "" ? false : true;
    let btnAdd = document.getElementById("addToFeastList");
    if (c && i && n && l) {
        btnAdd.removeAttribute("disabled");
    } else {
        btnAdd.setAttribute("disabled", "disabled");
    }
};

var initializeFeastItem = function () {
    let chance = document.getElementById("feastItem-chance");
    let btnAdd = document.getElementById("addToFeastList");
    chance.addEventListener("change", function () {
        let chance = document.getElementById("feastItem-chance");
        updateFeastItem("chance", chance.value);
    });
    btnAdd.addEventListener("click", function () {
        addToFeastList();
        renderFeastList();
    });
};

var clearFeastListItem = function () {
    updateFeastItem("id", "");
    updateFeastItem("name", "");
    updateFeastItem("chance", "");
    updateFeastItem("location", "");
};

var addToFeastList = function () {
    let ds = document.getElementById("feastItem").dataset;
    let item = new FeastItem(ds.id, ds.name, ds.chance, ds.location);
    feastList.addFeastItem(item);
};
//#endregion

//#region Feast List
var initializeFeastList = function () {
    feastList = new FeastList();
    renderFeastList();
};

var renderFeastList = function () {
    let feastListItems = document.getElementById("feastListItems");
    feastListItems.innerHTML = "";
    let itemCount = 0;
    for (let i = 0; i < feastList.locations.length; i++) {
        feastListItems.appendChild(renderFeastListLocation(feastList.locations[i].string));
        for (let j = 0; j < feastList.locations[i].feastItems.length; j++) {
            feastListItems.appendChild(renderFeastListItem(feastList.locations[i].feastItems[j]));
            itemCount++;
        }
    }
    let itemCountEle = document.getElementById("config-item-items");
    itemCountEle.innerText = itemCount;
    let FeastConfigValueIndex = itemCountEle.dataset.index;
    FeastConfiguration.value[FeastConfigValueIndex].value = feastList.toArray();
};

var renderFeastListLocation = function (map) {
    let div = document.createElement("div");
    div.classList.add("feast-list-location");
    div.innerText = map;
    return div;
};

var renderFeastListItem = function (item) {
    let divChance = document.createElement("div");
    divChance.classList.add("number");
    divChance.classList.add("point");
    divChance.innerText = item.chance;
    divChance.addEventListener("click", function () {
        divEditChance.classList.remove("hide");
        divChance.classList.add("hide");
    });

    let divEditChance = document.createElement("input");
    divEditChance.classList.add("hide");
    divEditChance.type = "number";
    divEditChance.value = item.chance;
    divEditChance.dataset.id = item.id;
    divEditChance.dataset.name = item.name;
    divEditChance.dataset.location = item.location;
    divEditChance.addEventListener("blur", function () {
        let ds = divEditChance.dataset;
        let c = divEditChance.value;
        let item = new FeastItem(ds.id, ds.name, c, ds.location);
        feastList.editFeastItemChance(item);
        renderFeastList();
    });

    let divId = document.createElement("div");
    divId.classList.add("number");
    divId.classList.add("point");
    divId.innerText = item.id;
    divId.addEventListener("click", function () {
        divEditChance.classList.remove("hide");
        divChance.classList.add("hide");
    });

    let divName = document.createElement("div");
    divName.classList.add("point");
    divName.innerText = item.name;
    divName.addEventListener("click", function () {
        divEditChance.classList.remove("hide");
        divChance.classList.add("hide");
    });

    let divRemove = document.createElement("div");
    divRemove.classList.add("btn-delete");
    divRemove.dataset.chance = item.chance;
    divRemove.dataset.id = item.id;
    divRemove.dataset.name = item.name;
    divRemove.dataset.location = item.location;
    divRemove.innerText = "X";
    divRemove.addEventListener("click", function () {
        let ds = divRemove.dataset;
        let item = new FeastItem(ds.id, ds.name, ds.chance, ds.location);
        feastList.removeFeastItem(item);
        renderFeastList();
    });

    let divItem = document.createElement("div");
    divItem.classList.add("feast-list-item");
    divItem.title = item.percent + "% chance";
    divItem.appendChild(divEditChance);
    divItem.appendChild(divChance);
    divItem.appendChild(divId);
    divItem.appendChild(divName);
    divItem.appendChild(divRemove);

    return divItem;
};
//#endregion

//#region XML
var CreateXML = function (object) {
    let metaData = FeastConfigurationMetaData;
    this.node = function (object) {
        let val = "";
        let attr = "";
        let openOpen = "";
        let openEnd = "";
        if (object.attributes.length > 0) {
            for (let i = 0; i < object.attributes.length; i++) {
                attr += ' ' + object.attributes[i].key + '="' + object.attributes[i].value + '"';
            }
        }
        if (typeof object.value === "object") {
            if (object.value.length > 0) {
                openEnd = "\n";
                for (let i = 0; i < object.value.length; i++) {
                    val += this.node(object.value[i], true);
                }
            }
        } else if (typeof object.value === "string") {
            val += object.value;

        } else {
            console.log("ERROR at CreateXML typeof");
        }
        let open = openOpen + "<" + object.key + attr + ">" + openEnd;
        let close = "</" + object.key + ">\n";
        return open + val + close;
    };
    return metaData + "\n" + this.node(object, false);
};
//#endregion

//#region Modal
var showModal = function (message = "") {
    let modalContent = document.getElementById("modalContent");
    let h = window.innerHeight;
    let height = h - 48;
    modalContent.setAttribute("style", "height:" + height.toString() + "px;");
    let modal = document.getElementById("modal");
    modal.classList.remove("hide");
    let msg = document.getElementById("modalMessage");
    msg.innerText = message;
};

var closeModal = function () {
    let modal = document.getElementById("modal");
    modal.classList.add("hide");
    let msg = document.getElementById("modalMessage");
    msg.innerText = "";
};
//#endregion

//#region Init
var init = function () {
    initializeConfig();
    initializeTabs();
    initializeMapLocations();
    initializeItems();
    initializeFeastItem();
    initializeFeastList();
    document.getElementById("generateXML").addEventListener("click", function () {
        showModal(CreateXML(FeastConfiguration));
    });
    document.getElementById("modalClose").addEventListener("click", function () {
        closeModal();
    });
    window.addEventListener("resize", function () {
        let h = window.innerHeight;
        let height = h - 136;
        let eles = document.querySelectorAll(".container");
        for (let i = 0; i < eles.length; i++) {
            eles[i].setAttribute("style", "height:" + height.toString() + "px;");
        }
        let modalContent = document.getElementById("modalContent");
        h = window.innerHeight;
        height = h - 72;
        modalContent.setAttribute("style", "height:" + height.toString() + "px;");
    });
};

let feastList = new FeastList();

init();
//#endregion