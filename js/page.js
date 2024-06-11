var levels = Array(
    0, 83, 174, 276, 388, 512, 650, 801, 969, 1154, 1358, 1584, 1833, 2107, 2411, 2746, 3115, 3523, 3973, 4470, 5018, 5624, 6291, 7028, 7842, 8740, 9730, 10824, 12031, 13363, 14833, 16456, 18247, 20224, 22406,
    24815, 27473, 30408, 33648, 37224, 41171, 45529, 50339, 55649, 61512, 67983, 75127, 83014, 91721, 101333, 111945, 123660, 136594, 150872, 166636, 184040, 203254, 224466, 247886, 273742, 302288, 333804,
    368599, 407015, 449428, 496254, 547953, 605032, 668051, 737627, 814445, 899257, 992895, 1096278, 1210421, 1336443, 1475581, 1629200, 1798808, 1986068, 2192818, 2421087, 2673114, 2951373, 3258594, 3597792,
    3972294, 4385776, 4842295, 5346332, 5902831, 6517253, 7195629, 7944614, 8771558, 9684577, 10692629, 11805606, 13034431, 14391160, 15889109, 17542976, 19368992, 21385073, 23611006, 26068632, 28782069,
    31777943, 35085654, 38737661, 42769801, 47221641, 52136869, 57563718, 63555443, 70170840, 77474828, 85539082, 94442737, 104273167, 115126838, 127110260, 140341028, 154948977, 171077457, 188884740, 200000000
);

var ownedModified;

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function copyToClipboard(text) {
    var input = document.createElement('textarea');
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    return document.body.removeChild(input);
}

// Hide and show XP gains based on max stats.
function statBox() {
    var expInput = $('#expInput');
    if (expInput.val() < 200000000) {
        $("#maxXP").hide();
        $("#gains").show();

    } else {
        $("#maxXP").css("display", "block");
        $("#gains").hide();
    }
}


document.addEventListener("DOMContentLoaded", function (event) {

    recipes.forEach(function (recipe) {
        var mats = getMatsByArtefact(recipe.artefact);
        var img = $("<div/>").addClass("mats");

        mats.forEach(function (mat) {
            var imgstr = mat.name.replace(/ /g, "_");
            var imgObj = $("<img/>", {
                src: "img/" + imgstr + ".webp",
                title: mat.name + " x" + mat.numRequired
            });


            img.append(imgObj);
        });

        img.append($("<span/>", {
            class: "minForCollections",
            text: recipe.minForCollection
        }).data("artefact-collection", recipe.artefact));


        var artefactImg = $("<div/>", {
            class: "artefactImg"
        }).append(
            $("<img/>", {
                src: "img/artefacts/" + recipe.artefact.replace(/ /g, "_").replace(/\//g, "-") + ".webp"
            }));

        $("#artefacts").append(
            $("<div/>", {
                class: "artefact " + recipe.alignment
            }).data("artefact", recipe.artefact).append(
                $("<span/>", {
                    class: "cell",
                })
                    .prepend($("<span/>", {
                        text: recipe.artefact,
                        onclick: `copyToClipboard("${recipe.artefact}")`,
                        class: "artefactName",
                        title: "copy to clipboard"
                    }))
                    .prepend(artefactImg)
                    .append(img)
            ).append(
                $("<span/>", {
                    class: "cell",
                    text: recipe.level
                })
            ).append(
                $("<span/>", {
                    class: "cell artefactxp",
                    text: numberWithCommas(recipe.xpEach.toFixed(1))
                }).data("artefact", recipe.artefact)
            ).append(
                $("<div/>", {
                    class: "cell"
                }).append(
                    $("<input type='number' class='artefactinput' value='0'/>")
                        .data("artefact", recipe.artefact).data("id", `${recipe.artefact} (damaged)`)
                )
            ).append(
                $("<div/>", {
                    class: "cell"
                }).append(
                    $("<input type='number' class='restoredinput' value='0'/>")
                        .data("artefact", recipe.artefact).data("id", recipe.artefact)
                )
            ).append(
                $("<span/>", {
                    class: "cell artefactpotential",
                    text: "0.0"
                }).data("artefact", recipe.artefact)
            )
        );

        setInterval(() => {
            if (ownedModified) {
                ownedModified = false;
                saveData();
            }
        }, 5000)

        $("#loading").remove();
    });

    materialList.forEach(function (mat) {
        var imgstr = mat.replace(/ /g, "_");
        var imgObj = $("<img/>", {
            src: "img/" + imgstr + ".webp"
        });



        var imgObj = $("<div/>").append(imgObj);

        $("#materials").append(
            $("<div/>", {
                class: "material",
                data: {
                    "material": mat
                }
            }).append(
                $("<span/>", {
                    class: "cell",
                    text: mat
                }).prepend(imgObj)
            ).append(
                $("<span/>", {
                    class: "materialamount cell",
                    text: "0"
                })
            )
        );

        if (mat == "Sapphire") {
            $("#materialStorage").append(
                $("<div/>", {
                    class: "seperator"
                })
                    .append(
                        $("<span/>", {
                            text: "Secondary Materials"
                        })
                    )
            );
        }

        $("#materialStorage").append(
            $("<div/>", {
                class: "popupMaterial"
            })
                .append(imgObj.clone())
                .append(
                    $("<div/>", {
                        class: "materialStorageInput"
                    })
                        .append(
                            $("<label/>", {
                                text: mat
                            })
                        )
                        .append(
                            $("<input/>", {
                                type: "number",
                                value: 0,
                                data: {
                                    "materialstoragemat": mat
                                }
                            })
                        )
                )
        );
    });

    var collectorCollections = {};
    collectionList.forEach(cat => {
        cat.collectors.forEach(collector => {
            if (collector == "Velucia") {
                collectorCollections["Velucia"] = [...(collectorCollections["Velucia"] || []),
                ...cat.collections.map(collection => {
                    return {
                        ...collection,
                        ...{
                            display: "Museum - " + collection.display
                        }
                    }
                })];
            } else if (collector == "Soran") {
                collectorCollections[collector] = cat.collections.filter(collection => !collection.display.startsWith("Zarosian V"));
            } else {
                collectorCollections[collector] = cat.collections;
            }
        });
    });
    Object.entries(collectorCollections).forEach(([collector, collections]) => {
        var collectionsElem = $("<div/>", {
            class: "collectionCategoryList"
        });

        collections.forEach(collection => {
            collectionsElem.append(
                $("<div/>", {
                    class: "collection"
                }).data("collection", collection.display).append(
                    $("<span/>", {
                        class: "collectionName",
                        text: collection.display
                    })
                ).append(
                    $("<span/>", {
                        class: "collectionViewer",
                        text: '\u2315'
                    }).data("collection", collection.display).data("active", false)
                )
            );
        });

        $("#collections").append(
            $("<div/>", {
                class: "collectionCategory"
            }).append(
                $("<span/>", {
                    class: "collectionCategoryHeader",
                    text: collector
                })
            ).append(collectionsElem)
        );
    });



    createCollections();
    loadData();
    update();

    $(".collectionViewer").click(function (e) {
        e.stopPropagation();
        if ($(this).data("active") == false) {
            highlightCollection($(this).data("collection"));
            $(this).data("active", true);
            $("#searchBox").val($(this).data("collection"));
        } else {
            removeHighlights();
        }
    });

    $(".artefactinput").change(function () {
        if (parseInt($(this).val()) < 0) {
            $(this).val(0);
        }
        ownedModified = true;
        update($(this).data("artefact"), $(this).val());
    });

    $(".restoredinput").change(function () {
        if (parseInt($(this).val()) < 0) {
            $(this).val(0);
        }
        ownedModified = true;
    });

    $("#expInput").change(function () {
        if (parseInt($(this).val()) < 0) {
            $(this).val(0);
        }
        var xp = parseInt($(this).val());
        var lvl = 1;

        for (let i = 0; i < levels.length; i++) {
            if (xp >= levels[i] && xp < levels[i + 1]) {
                lvl = i + 1;
            }
        };
        if (xp >= 200000000) {
            lvl = 'Max';
            $('#expInput').val('200000000');
        };

        $("#yourLevel").text("Level: " + lvl);

        calculateTotalPotentialXP();
        statBox();
        saveData();
    });

    $("#outfit").change(function () {
        calculateTotalPotentialXP();
        saveData();
    })

    $(".minForCollections").click(function () {
        if ($(this).hasClass("complete")) {
            $(this).removeClass("complete");
        } else {
            $(this).addClass("complete");
            $(this).data("")
        }
        saveData();
    });




    $(".collection").click(function () {
        if (!$(this).hasClass("complete")) {
            $(this).addClass("complete");
        } else {
            $(this).removeClass("complete");
        }

        saveData();
    });


    $(".material").click(function () {
        if (!$(this).hasClass("unneeded")) {
            $(this).addClass("unneeded");
        } else {
            $(this).removeClass("unneeded");
        }
    });

    $(".materialStorageInput input").change(function () {
        if ($(this).val() <= 0) {
            $(this).val(0);
        }
    });

    $("#blinder").click(function (e) {
        if (e.target == this) {
            saveStorage();
        }
    });

    $("#searchBox").on("keyup search", function () {
        removeHighlights();
        var str = $(this).val().toLowerCase();

        if (str.indexOf("digsite:") > -1) {
            console.log("Searching digsites");
            if (str.indexOf("zaros") > -1) {
                for (let i in recipes) {
                    var recipe = recipes[i];

                    if (recipe.alignment.indexOf("Zarosian") > -1) {
                        highlight(recipe.artefact);
                    }

                }
            } else if (str.indexOf("zamorak") > -1) {
                for (let i in recipes) {
                    var recipe = recipes[i];

                    if (recipe.alignment.indexOf("Zamorakian") > -1) {
                        highlight(recipe.artefact);
                    }

                }
            } else if (str.indexOf("saradomin") > -1) {
                for (let i in recipes) {
                    var recipe = recipes[i];

                    if (recipe.alignment.indexOf("Saradominist") > -1) {
                        highlight(recipe.artefact);
                    }

                }
            } else if (str.indexOf("armadyl") > -1) {
                for (let i in recipes) {
                    var recipe = recipes[i];

                    if (recipe.alignment.indexOf("Armadylean") > -1) {
                        highlight(recipe.artefact);
                    }
                }
            } else if (str.indexOf("bandos") > -1) {
                for (let i in recipes) {
                    var recipe = recipes[i];

                    if (recipe.alignment.indexOf("Bandosian") > -1) {
                        highlight(recipe.artefact);
                    }
                }
            }
        } else {
            $(".artefact").each(function () {
                if ($(this).data("artefact").toLowerCase().includes(str)) {
                    $(this).css("display", "table-row").addClass("highlight");
                } else {
                    if (!$(this).hasClass("highlight")) {
                        $(this).css("display", "none");
                    }
                }
            });
        }
    });
});

function update(artefact, number, ignoreSave = false) {
    //Update potential xp
    var $potential = $(".artefactpotential").filter(function () {
        return $(this).data("artefact") == artefact;
    });

    var xpEach = $(".artefactxp").filter(function () {
        return $(this).data("artefact") == artefact;
    });

    xpEach = parseFloat(xpEach.text().replace(/,/g, ""));

    var potentialXP = number * xpEach;

    $potential.text(numberWithCommas(potentialXP.toFixed(1)));

    //Update materials
    calculateTotalMaterials();
    calculateTotalPotentialXP();

    if (!ignoreSave) {
        saveData();
    }
}

function calculateTotalMaterials() {
    $(".materialamount").text(0);


    $(".artefact").each(function () {
        var numToMake = parseInt($(this).find("input.artefactinput").val());
        var artefact = $(this).find("input.artefactinput").data("artefact");
        var recipe = getRecipeByArtefact(artefact);

        if (numToMake > 0) {
            for (let i = 0; i < recipe.mats.length; i++) {
                var mat = recipe.mats[i].name;
                var numRequired = recipe.mats[i].numRequired;

                var $numberNeeded = $(".material").filter(function () {
                    return $(this).data("material") == mat;
                }).find(".materialamount");

                var currentNeeded = parseInt($numberNeeded.text().replace(/,/g, ""));

                $numberNeeded.text(currentNeeded + (numRequired * numToMake));
            }
        }
    });


    $(".material").each(function () {
        var $material = $(this);
        var mat = $material.data("material");
        var $amountNeeded = $(this).children(".materialamount");
        var numNeeded = parseInt($amountNeeded.text());

        if (numNeeded > 0) {
            if (localStorage.getItem("materialstorage") !== null) {
                var materialStorage = JSON.parse(localStorage.getItem("materialstorage"));
                var numberInStorage = materialStorage[mat];

                if (numberInStorage == null) {
                    numberInStorage = 0;
                }

                var actualAmountNeeded = numNeeded - numberInStorage;

                //$amountNeeded.text(actualAmountNeeded + " (Total: " + numNeeded + ")");
                if (actualAmountNeeded <= 0) {
                    actualAmountNeeded = 0;
                    $material.addClass("unneeded");
                } else {
                    $material.removeClass("unneeded");
                }
                $amountNeeded.text(actualAmountNeeded + " (").append($("<b/>", {
                    text: numNeeded
                })).append(")");
            }
        }




        if ($(this).find(".materialamount").text() == "0") {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
}

function calculateTotalPotentialXP() {
    var total = 0;
    $(".artefactpotential").each(function () {
        total += parseFloat($(this).text().replace(/,/g, ""));
    });

    if ($("#outfit").is(":checked")) {
        total += total * 0.06;
    }

    $("#potentialXPGain").text("Total Potential XP: " + numberWithCommas(parseInt(total)));

    var xp = parseInt($("#expInput").val());
    xp += total;

    var lvl = 1;

    for (let i = 0; i < levels.length; i++) {
        if (xp >= levels[i] && xp < levels[i + 1]) {
            lvl = i + 1;
        }
    }

    var remainingXP = parseInt(levels[lvl]) - xp;

    $("#endXP").text("Ending XP: " + numberWithCommas(parseInt(xp)));
    if (parseInt(xp) >= 200000000) {
        $("#endXP").text("Ending XP: 200,000,000");
    }

    if (lvl === 126) {
        $("#endLvl").text("Ending Level: " + lvl + " (" + numberWithCommas(parseInt(remainingXP)) + " to Max )");
    }
    else if (remainingXP <= 1) {
        $("#endLvl").text("Ending Level: Max");
    } else {
        $("#endLvl").text("Ending Level: " + lvl + " (" + numberWithCommas(parseInt(remainingXP)) + " to " + parseInt(lvl + 1) + ")");
    };



};


// Load XP from RuneMetrics 
function rsnConfirm() {
    var exp = -1;
    var rsn = $('#rsn').val();
    var runeMetrics = `${rsn}` + '&activities=0';
    document.getElementById("output").textContent = "Looking for '" + rsn + "' on the Hiscores. Please wait..."
    $.ajax({
        url: `https://api.allorigins.win/raw?url=https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(runeMetrics)}`,
        success: function (result) {
            console.log(result);
            var OP = result;

            if (OP.error == "PROFILE_PRIVATE") {
                document.getElementById("output").textContent = "The RuneMetrics for user '" + rsn + "' is set to private. Please make it public or try adding the XP manually.";
                return false;
            } else if (OP.error == "NO_PROFILE") {
                document.getElementById("output").textContent = "Couldn't find '" + rsn + "' on the HiScores. Please check your spelling or try adding the XP manually.";
                return false;
            }
            for (var r = 0; r < 28; r++) {
                if (OP.skillvalues[r].id == 27) {
                    exp = OP.skillvalues[r].xp / 10;
                }
            }
            console.log(exp);
            document.getElementById("expInput").value = Math.floor(exp);
            $("#expInput").trigger("change");
            document.getElementById("output").textContent = "";
        },

        error: function (result) {
            document.getElementById("output").textContent = "Couldn't find '" + rsn + "' on the Hiscores. Please check your spelling or try adding the XP manually.";
        }
    });
    statBox();
};

//  Modal instead of alert for mobile browser/Alt1-Toolkit support
function reset() {
    Modal.confirm({
        title: 'Reset artefacts', // modal title
        message: 'Reset the artefact counter to 0?', // modal message
        autoOpen: true, // show modal when declared
        closeOnEscape: true, // close when escape key pressed
        closeOnBlur: true, // close when overlay is clicked
        animated: true, // animate modal
        buttonClass: '', // confirm button class
        buttonLbl: 'OK', // confirm button label
        cancelLbl: 'Cancel', // cancel button label
        onConfirm: function () {
            $(".artefactinput").val(0);
            $(".restoredinput").val(0);
            $(".artefactpotential").text("0.0");
            update();
            calculateTotalPotentialXP();
        }, // callback if the user confirms
        onCancel: function () { }, // callback if the modal is closed without the 
        onClose: function () { }, // callback on modal close, called allways after confirm or cancel
    })
};


function saveData() {
    var data = {};
    $("input").each(function () {
        var id = $(this).data("id");
        var value = $(this).val();

        if (id == "outfit") {
            if ($(this).is(":checked")) {
                value = true;
            } else {
                value = false;
            }
        }

        data[id] = value;
    });

    var collectionData = {};
    $(".minForCollections").each(function () {
        var artefact = $(this).data("artefact-collection");
        var isChecked = $(this).hasClass("complete");

        collectionData[artefact] = isChecked;
    });

    var collectionListData = {};
    $(".collection").each(function () {
        var artefact = $(this).data("collection");
        var isChecked = $(this).hasClass("complete");

        collectionListData[artefact] = isChecked;
    });

    localStorage.setItem("data", JSON.stringify(data));
    localStorage.setItem("collectionData", JSON.stringify(collectionData));
    localStorage.setItem("collectionListData", JSON.stringify(collectionListData));
}

function loadData() {
    if (localStorage.getItem("data") !== null) {
        var data = JSON.parse(localStorage.getItem("data"));

        for (let id in data) {
            $("input").each(function () {
                if ($(this).data("id") == id) {
                    if (id == "outfit") {
                        $(this).prop("checked", data[id]);
                    } else {
                        $(this).val(data[id]);
                        if ($(this).hasClass("artefactinput")) {
                            update($(this).data("artefact"), data[id], true);
                        }
                    }
                }
            });

            if (id == "expInput") {
                let lvl;
                for (let i = 0; i < levels.length; i++) {
                    if (data[id] >= levels[i] && data[id] < levels[i + 1]) {
                        lvl = i + 1;
                    }

                }
                if (data.expInput >= 200000000) {
                    lvl = 'Max';
                    $("#expInput").val('200000000');
                };
                $("#yourLevel").text("Level " + lvl);

            }
        }
    }


    if (localStorage.getItem("collectionData") !== null) {
        var collectionData = JSON.parse(localStorage.getItem("collectionData"));

        for (let artefact in collectionData) {
            $(".minForCollections").each(function () {
                if ($(this).data("artefact-collection") == artefact) {
                    if (collectionData[artefact]) {
                        $(this).addClass("complete");
                    }
                }
            });
        }
    }

    if (localStorage.getItem("collectionListData") !== null) {
        var collectionData = JSON.parse(localStorage.getItem("collectionListData"));

        for (let collection in collectionData) {
            $(".collection").each(function () {
                if ($(this).data("collection") == collection) {
                    if (collectionData[collection]) {
                        $(this).addClass("complete");
                    }
                }
            })
        }
    }

    if (localStorage.getItem("materialstorage") !== null) {
        var storageData = JSON.parse(localStorage.getItem("materialstorage"));

        $(".materialStorageInput").each(function () {
            var input = $(this).children("input");
            var mat = input.data("materialstoragemat");

            if (storageData[mat] != null) {
                input.val(storageData[mat]);
            } else {
                input.val(0);
            }

        })
    }
    statBox();
}

function saveStorage() {
    var materialStorage = {};
    $(".materialStorageInput").each(function () {
        var input = $(this).children("input");

        var mat = input.data("materialstoragemat");
        var amount = input.val();
        if (amount == null) {
            amount = 0;
        }

        materialStorage[mat] = amount;
    })

    localStorage.setItem("materialstorage", JSON.stringify(materialStorage));

    $("#blinder").css("display", "none");
    calculateTotalMaterials();
}

function showMaterialStorage() {
    $("#blinder").css("display", "block");
};

function exportData() {
    var localStorageData = JSON.stringify(localStorage);
    var blob = new Blob([localStorageData], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    var downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'archaeology-calculator.json';

    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function importData() {
    var fileInput = document.getElementById('importFile');
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
        var localStorageData = JSON.parse(e.target.result);
        Object.keys(localStorageData).forEach(function (k) {
            localStorage.setItem(k, localStorageData[k]);
        });
    };

    reader.readAsText(file);
    location.reload();
}