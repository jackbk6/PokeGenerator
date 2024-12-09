// Global Variables
let searchString = "";
let favouriteStrings = [];
let searchStringHistory = [];

// Search String Operations
const stringOperations = {
    addTerm(term) {
        searchStringHistory.push(searchString);
        // Define star categories
        const starCategories = ["0*", "1*", "2*", "3*", "4*"];
        const isStarCategory = starCategories.includes(term);

        if (isStarCategory) {
            // Split the search string into logical groups by ","
            let groups = searchString.split(",");

            // Check the last group for an existing star category
            const lastGroup = groups[groups.length - 1];
            const groupTerms = lastGroup.split("&");

            const starIndex = groupTerms.findIndex((t) => starCategories.includes(t));

            if (starIndex !== -1) {
                // Replace the existing star category in the last group
                groupTerms[starIndex] = term;
            } else {
                // Add the new star category to the last group
                groupTerms.push(term);
            }

            // Update the last group
            groups[groups.length - 1] = groupTerms.join("&");

            // Reconstruct the search string
            searchString = groups.join(",");

            ui.updateCurrentString(); // Update the UI with the modified search string
            return; // Exit early since star categories are handled separately
        }

        // For non-star terms, add them as usual
        if (!searchString.trim()) {
            searchString += term;
        } else {
            const lastChar = searchString.slice(-1);
            const last2Chars = searchString.slice(-2);

            if (lastChar !== '&' && lastChar !== ',' && lastChar !== '!' && last2Chars !== "&!" && lastChar !== '+') {
                searchString += "&";
            }

            if (!searchString.includes(term)) {
                searchString += term;
            } else {
                ui.showNotification(`"${term}" is already in the search string. Redundant term, not added.`);
            }
        }

        if (!utilities.checkRedundancy(term, term.length)) {
            ui.updateCurrentString();
        }
    },

    addOperator(operator) {
        searchStringHistory.push(searchString);
        // If the last character is already a logical operator, remove it first
        const lastChar = searchString.slice(-1);
        const last2Chars = searchString.slice(-2);
        console.log(last2Chars);
        if (last2Chars === "&!") {
            searchString = searchString.slice(0, -1); // Remove the last operator

        }
        if (lastChar === '&' || lastChar === ',' || lastChar === '+' || lastChar === '!') {
            searchString = searchString.slice(0, -1); // Remove the last operator
        }

        // Add the selected operator to the search string
        searchString += operator;
        ui.updateCurrentString(); // Update the UI with the modified search string
    },

    clearSearchString() {
        searchString = "";
        ui.showNotification("Search string cleared.");
        ui.updateCurrentString();
    },

    returnSearchString() {
        return searchString;
    },
};


// Undo 
function undoSearchString() {
    if (searchStringHistory.length > 0) {
        searchString = searchStringHistory.pop();
        ui.updateCurrentString();
        ui.showNotification("Undo successful.");
    } else {
        ui.showNotification("Nothing to undo.");
    }
}


// Favourites Management
const favourites = {
    addToFavourites() {
        if (!searchString.trim()) {
            ui.showNotification("Cannot add an empty search string to favourites!");
            return;
        }
        if (!favouriteStrings.includes(searchString)) {
            favouriteStrings.push(searchString);
            ui.showNotification(`"${searchString}" added to favourites.`);
            ui.updateFavouritesList();
        } else {
            ui.showNotification(`"${searchString}" is already in favourites.`);
        }
    },

    removeFavourite(index) {
        const removed = favouriteStrings.splice(index, 1);
        ui.showNotification(`"${removed}" removed from favourites.`);
        ui.updateFavouritesList();
    },
};

function viewFavourites() {
    return favouriteStrings;
}

function updateFavouritesList() {
    const favorites = viewFavourites();
    populateFavorites(favorites); // Populate the favorites list dynamically
}

function populateFavorites(favorites) {
    const favoritesList = document.getElementById("favouritesList");
    favoritesList.innerHTML = ""; // Clear existing list

    favorites.forEach((string) => {
        const li = document.createElement("li");
        li.textContent = string;
        li.classList.add("clickable-favorite");

        // Add click event to update the current search field
        li.addEventListener("click", () => {
            const currentStringField = document.getElementById("currentString");
            if (currentStringField) {
                currentStringField.value = string;
                searchString = string; // Update the global searchString variable
            }
        });

        favoritesList.appendChild(li);
    });
}

// Function to populate the Common Strings modal
function populateCommonStrings(commonStrings) {
    const commonStringsList = document.getElementById("commonStringsList"); // Correct ID
    commonStringsList.innerHTML = ""; // Clear existing list

    commonStrings.forEach((strObj, index) => {
        const listItem = document.createElement("li");

        // Title (h2) with margin adjustment
        const title = document.createElement("h2");
        title.classList.add("preset-title");
        title.textContent = `${strObj.title}:`;
        title.style.marginRight = "10px"; // Adding right margin
        listItem.appendChild(title);

        // Search String (span)
        const searchString = document.createElement("span");
        searchString.classList.add("search-string");
        searchString.textContent = strObj.value;
        listItem.appendChild(searchString);

        // Copy Button with the desired style
        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.classList.add("filter-group"); // Add the class for styling consistency
        copyBtn.addEventListener("click", () => utilities.copyToClipboard(index));
        document.getElementById("current-string-field").value = strObj.value;

        listItem.appendChild(copyBtn);

        // Add the item to the list
        commonStringsList.appendChild(listItem);
    });
}

// Utilities
const utilities = {
    checkRedundancy(term, length) {
        const lastChar = searchString.slice(-1);


        // If the last character isn't a logical operator, return false to indicate redundancy
        if (lastChar !== '&' && lastChar !== ',' && lastChar !== '!' && lastChar !== '+') {
            return false;
        }

        return searchString.slice(-length) !== term;
    },
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(
            () => {
                ui.showNotification("Copied to clipboard!");
                // Update the current string with the copied text
                const currentStringField = document.getElementById("currentString");
                if (currentStringField) {
                    currentStringField.value = text;
                }
            },
            (err) => {
                ui.showNotification("Failed to copy: " + err);
            }
        );
    },
};

// UI Updates
const ui = {
    updateCurrentString() {
        const currentStringField = document.getElementById("currentString");
        currentStringField.value = searchString || "Start building your search string!";
    },
    showNotification(message) {
        const notificationArea = document.createElement("div");
        console.log("Notification Triggered:", message);
        notificationArea.className = "notification";
        notificationArea.textContent = message;
        document.body.appendChild(notificationArea);

        setTimeout(() => {
            notificationArea.remove();
        }, 3000);
    },

    updateFavouritesList() {
        const favouritesList = document.getElementById("favouritesList");
        if (!favouritesList) return;
        favouritesList.innerHTML = "";
        favouriteStrings.forEach((str, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = str;
            listItem.classList.add("clickable-favorite");
            listItem.addEventListener("click", () => {
                searchString = str;
                ui.updateCurrentString();
            });

            // Remove button for each favourite
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.addEventListener("click", () => favourites.removeFavourite(index));
            removeBtn.style.marginRight = "8px";
            removeBtn.style.marginLeft = "8px";
            removeBtn.style.marginTop = "8px";
            removeBtn.style.marginBottom = "8px";



            listItem.appendChild(removeBtn);

            // Copy button for each favourite
            const copyBtn = document.createElement("button");
            copyBtn.textContent = "Copy";
            copyBtn.addEventListener("click", () => utilities.copyToClipboard(index));
            listItem.appendChild(copyBtn);
            favouritesList.appendChild(listItem);
        });
    },

    showFavouritesModal() {
        const modal = document.getElementById("favouritesModal");
        modal.classList.remove("hidden");
        ui.updateFavouritesList();
    },
    closeFavouritesModal() {
        const modal = document.getElementById("favouritesModal");
        modal.classList.add("hidden");
    },
    showHelpModal() {
        const helpModal = document.getElementById("helpModal");
        helpModal.classList.remove("hidden");
    },
    closeHelpModal() {
        const helpModal = document.getElementById("helpModal");
        helpModal.classList.add("hidden");
    },
    showCommonStringsModal() {
        const helpModal = document.getElementById("commonStringsModal");
        const commonStringsList = document.getElementById("commonStringsList");

        // Clear existing content
        commonStringsList.innerHTML = "";

        // Define common strings with titles and values
        const commonStrings = [
            { title: "Nundo", value: "0hp&0defense&0attack" },
            { title: "Shundo", value: "shiny&4*" },
            { title: "Transfer", value: "0*,1*,2*&!shiny&!legendary&!costume&!shadow" }
        ];

        // Add each string to the modal
        commonStrings.forEach((strObj) => {
            const listItem = document.createElement("li");

            // Title (h2)
            const title = document.createElement("h2");
            title.classList.add("preset-title");
            title.textContent = `${strObj.title}:`;
            listItem.appendChild(title);

            // Search String (span)
            const searchString = document.createElement("span");
            searchString.classList.add("search-string");
            searchString.textContent = strObj.value;
            listItem.appendChild(searchString);

            // Copy Button
            const copyBtn = document.createElement("button");
            copyBtn.classList.add("copy-btn");
            copyBtn.textContent = "Copy";
            copyBtn.addEventListener("click", () => {
                utilities.copyToClipboard(strObj.value);
            });
            listItem.appendChild(copyBtn);

            // Add the item to the list
            commonStringsList.appendChild(listItem);
        });

        // Show the modal
        helpModal.classList.remove("hidden");
    },

    closeCommonStringsModal() {
        const commonStringsModal = document.getElementById("commonStringsModal");
        commonStringsModal.classList.add("hidden");
    },

    showModal(sectionId) {
        const modal = document.getElementById("filterModal");
        const inputField = document.getElementById("inputField");

        // Save the current section for use in submit
        modal.setAttribute("data-current-section", sectionId);
        modal.style.display = "block";
        inputField.focus(); // Focus on the input field
    },

    closeModal() {
        const modal = document.getElementById("filterModal");
        const inputField = document.getElementById("inputField");

        modal.style.display = "none";
        inputField.value = ""; // Clear input field
        modal.removeAttribute("data-current-section");
    }
};

const validTypes = [
    "bug", "dark", "dragon", "electric", "fairy", "fighting", "fire", "flying",
    "ghost", "grass", "ground", "ice", "normal", "poison", "psychic", "rock",
    "steel", "water"
];

const validYears = ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];


document.getElementById("submitButton").addEventListener("click", function () {
    const modal = document.getElementById("filterModal");
    const inputField = document.getElementById("inputField");
    const currentSection = modal.getAttribute("data-current-section");
    const inputText = inputField.value.trim().toLowerCase(); // Normalize input to lowercase

    // Check if input is empty
    if (!inputText) {
        ui.showNotification("You must provide input before submitting!");
        return;
    }

    if (currentSection === "year" && !validYears.includes(inputText)) {
        ui.showNotification("Invalid Year!");
        return; // Exit without updating the search string
    }

    if (currentSection === "age" && isNaN(inputText)) {
        ui.showNotification("Age must be a number!");
        return; // Exit without updating the search string
    }

    // Validate input for `effective against` or `weak against` sections
    if (
        (currentSection === "<" || currentSection === ">") &&
        !validTypes.includes(inputText)
    ) {
        ui.showNotification("Invalid type!");
        return; // Exit without updating the search string
    }

    // Append the new term to the search string with logical operator handling
    if (!searchString.trim()) {
        // If the search string is empty, start with the new term
        searchString += `${currentSection}:${inputText}`;
    } else {
        // Get the last character(s) of the current search string
        const lastChar = searchString.slice(-1);
        const last2Chars = searchString.slice(-2);

        // Ensure a logical operator is added before the new term if necessary
        if (
            lastChar !== '&' &&
            lastChar !== ',' &&
            lastChar !== '!' &&
            last2Chars !== "&!" &&
            lastChar !== '+'
        ) {
            searchString += "&";
        }

        // Add the new term
        searchString += `${currentSection}:${inputText}`;
    }

    // Update the current string field in the UI
    const currentStringField = document.getElementById("currentString");
    if (currentStringField) {
        currentStringField.textContent = searchString; // Reflect the updated value
    } else {
        console.error("Element with ID 'currentString' not found.");
    }

    // Update the UI and close the modal
    ui.updateCurrentString();
    ui.closeModal();
});

document.getElementById("ageButton").addEventListener("click", () => ui.showModal("age"));
document.getElementById("yearButton").addEventListener("click", () => ui.showModal("year"));
document.getElementById("weakAgainstButton").addEventListener("click", () => ui.showModal("<"));
document.getElementById("effectiveAgainstButton").addEventListener("click", () => ui.showModal(">"));

// Close button event listener
document.getElementById("closeButton").addEventListener("click", () => ui.closeModal());

// Favourites Removal
favourites.removeFavourite = function (index) {
    const removed = favouriteStrings.splice(index, 1);
    ui.showNotification(`"${removed}" removed from favourites.`);
    ui.updateFavouritesList();
};

// Event Handlers for Buttons
function initializeEventListeners() {

    // Current String Listeners --------


    // Clear button
    document.getElementById("clearStringButton").addEventListener("click", stringOperations.clearSearchString);

    // Copy to clipboard button
    document.getElementById("copyStringButton").addEventListener("click", () => {
        utilities.copyToClipboard(searchString);
    });

    // Add to favourites button
    document.getElementById("addToFavouritesButton").addEventListener("click", favourites.addToFavourites);


    // Specials Button Listeners-----------


    //shiny
    document.getElementById("shinyButton").addEventListener("click", () => {
        stringOperations.addTerm("shiny");
    });

    //lucky
    document.getElementById("luckyButton").addEventListener("click", () => {
        stringOperations.addTerm("lucky");
    });

    //shadow
    document.getElementById("shadowButton").addEventListener("click", () => {
        stringOperations.addTerm("shadow");
    });

    //purified
    document.getElementById("purifiedButton").addEventListener("click", () => {
        stringOperations.addTerm("purified");
    });

    //costume
    document.getElementById("costumeButton").addEventListener("click", () => {
        stringOperations.addTerm("costume");
    });

    //favorite
    document.getElementById("favoriteButton").addEventListener("click", () => {
        stringOperations.addTerm("favorite");
    });

    //traded
    document.getElementById("tradedButton").addEventListener("click", () => {
        stringOperations.addTerm("traded");
    });



    // Logicals Button Listeners -----------


    //and
    document.getElementById("andButton").addEventListener("click", () => {
        stringOperations.addOperator("&");
    });

    //or
    document.getElementById("orButton").addEventListener("click", () => {
        stringOperations.addOperator(",");
    });

    //not
    document.getElementById("notButton").addEventListener("click", () => {
        stringOperations.addOperator("!");
    });

    //excluding
    document.getElementById("excludingButton").addEventListener("click", () => {
        stringOperations.addOperator("&!");
    });

    //family
    document.getElementById("familyButton").addEventListener("click", () => {
        stringOperations.addOperator("+");
    });


    // Stars Button Listeners-------

    //0*
    document.getElementById("zeroStarButton").addEventListener("click", () => {
        stringOperations.addTerm("0*");
    });

    //1*
    document.getElementById("oneStarButton").addEventListener("click", () => {
        stringOperations.addTerm("1*");
    });

    //2*
    document.getElementById("twoStarButton").addEventListener("click", () => {
        stringOperations.addTerm("2*");
    });

    //3*
    document.getElementById("threeStarButton").addEventListener("click", () => {
        stringOperations.addTerm("3*");
    });

    //Perfect
    document.getElementById("fourStarButton").addEventListener("click", () => {
        stringOperations.addTerm("4*");
    });


    //Type Button Listeners -----


    //legendary
    document.getElementById("legendaryButton").addEventListener("click", () => {
        stringOperations.addTerm("legendary");
    });

    //dynamax
    document.getElementById("dynamaxButton").addEventListener("click", () => {
        stringOperations.addTerm("dynamax");
    });

    //gigantamax
    document.getElementById("gigantamaxButton").addEventListener("click", () => {
        stringOperations.addTerm("gigantamax");
    });

    // mythical
    document.getElementById("mythicalButton").addEventListener("click", () => {
        stringOperations.addTerm("mythical");
    });

    // mega
    document.getElementById("megaButton").addEventListener("click", () => {
        stringOperations.addTerm("mega");
    });


    // ultrabeast
    document.getElementById("ultraBeastButton").addEventListener("click", () => {
        stringOperations.addTerm("ultrabeast");
    });


    // Size button listeners -------

    // xss
    document.getElementById("xxsButton").addEventListener("click", () => {
        stringOperations.addTerm("xss");
    });

    //xs
    document.getElementById("xsButton").addEventListener("click", () => {
        stringOperations.addTerm("xs");
    });


    //xl
    document.getElementById("xlButton").addEventListener("click", () => {
        stringOperations.addTerm("xl");
    });


    //xxl
    document.getElementById("xxlButton").addEventListener("click", () => {
        stringOperations.addTerm("xxl");
    });

    // Other button listeners ----------

    //baby
    document.getElementById("babyButton").addEventListener("click", () => {
        stringOperations.addTerm("Eggsonly");
    });

    //in gym
    document.getElementById("inGymButton").addEventListener("click", () => {
        stringOperations.addTerm("defender");
    });

    //elite tm
    document.getElementById("eliteTmButton").addEventListener("click", () => {
        stringOperations.addTerm("@special");
    });

    //item evolve
    document.getElementById("itemEvolveButton").addEventListener("click", () => {
        stringOperations.addTerm("item");
    });

    //can evolve
    document.getElementById("canEvolveButton").addEventListener("click", () => {
        stringOperations.addTerm("evolve");
    });

    //new evolve
    document.getElementById("newEvolveButton").addEventListener("click", () => {
        stringOperations.addTerm("evolvenew");
    });

    //background
    document.getElementById("backgroundButton").addEventListener("click", () => {
        stringOperations.addTerm("locationbackground,specialbackground");
    });

    //best buddy
    document.getElementById("bestBuddyButton").addEventListener("click", () => {
        stringOperations.addTerm("buddy5");
    });



    // Undo button
    document.getElementById("undoButton").addEventListener("click", undoSearchString);



}

function initializeModalListeners() {
    const favouritesModal = document.getElementById("favouritesModal");
    const helpModal = document.getElementById("helpModal");
    const commonStringsModal = document.getElementById("commonStringsModal");

    // Open Favourites modal
    document.getElementById("favouritesButton").addEventListener("click", () => {
        ui.showFavouritesModal();
    });

    // Open Help modal
    document.getElementById("helpButton").addEventListener("click", () => {
        ui.showHelpModal();
    });

    // Open Common Strings Modal
    document.getElementById("commonStringsButton").addEventListener("click", () => {
        ui.showCommonStringsModal();
    });

    // Close Favourites modal
    document.getElementById("closeFavouritesModalButton").addEventListener("click", () => {
        ui.closeFavouritesModal();
    });

    // Close Help modal
    document.getElementById("closeHelpModalButton").addEventListener("click", () => {
        ui.closeHelpModal();
    });

    //Close common strings modal
    document.getElementById("closeCommonStringsModalButton").addEventListener("click", () => {
        ui.closeCommonStringsModal();
    });



    // Close modals by clicking outside
    favouritesModal.addEventListener("click", (event) => {
        if (event.target === favouritesModal) {
            ui.closeFavouritesModal();
        }
    });

    helpModal.addEventListener("click", (event) => {
        if (event.target === helpModal) {
            ui.closeHelpModal();
        }
    });

    commonStringsModal.addEventListener("click", (event) => {
        if (event.target === commonStringsModal) {
            ui.closeCommonStringsModal();
        }
    });
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    ui.updateCurrentString();
    initializeEventListeners();
    initializeModalListeners();
});