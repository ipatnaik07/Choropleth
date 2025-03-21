let nameLabel = document.getElementById("name");
let countries = document.querySelectorAll(".allPaths");
let buttons = document.querySelectorAll(".button-container button");
let entry = document.getElementById("entry");
let last = document.getElementById("last");
let box = document.getElementById("box");
let reveals = document.getElementById("reveals");
let reset = document.getElementById("reset");

let tableData = [];
let clickable = [];
let options = [];
let revealed = [];
let category = "";
let guessed = false;
let numReveals = 0;
let game = 0;

let colors = ["#045275", "#00718b", "#089099", "#46aea0", "#7ccba2", "#b7e6a5", "#f7feae"];
let nicknames = {"united states": ["united states of america"], "democratic republic of the congo": ["dr congo", "congo, democratic republic of the"], "republic of the congo": ["congo", "congo, republic of the"], "czech republic": ["czechia"], "cape verde": ["cabo verde"], "ivory coast": ["côte d’ivoire"], "turkey": ["türkiye"], "eswatini": ["swaziland"], "north macedonia": ["macedonia"], "greenland": ["greenland (denmark)"], "falkland islands": ["falkland islands (uk)"], "new caledonia": ["new caledonia (france)"], "french polynesia": ["french polynesia (france)"], "taiwan": ["taiwan (republic of china)"], "china": ["people's republic of china", "china (mainland only)"], "timor-leste": ["east timor"], "united kingdom": ["united kingdom. england and wales"]}
let categories = {
    "Population": ["List_of_countries_and_dependencies_by_population", 0, 0, 1, null],
    "Population Density": ["List_of_countries_and_dependencies_by_population_density", 0, 0, 1, null],
    "GDP": ["List_of_countries_by_GDP_(nominal)", 0, 0, 1, null],
    "GDP Per Capita": ["List_of_countries_by_GDP_(nominal)_per_capita", 0, 0, 1, null],
    "Area": ["List_of_countries_and_dependencies_by_area", 0, 1, 2, null],
    "Life Expectancy": ["List_of_countries_by_life_expectancy", 0, 0, 1, null],
    "Oil Production": ["List_of_countries_by_oil_production", 0, 0, 1, null],
    "Meat Consumption": ["List_of_countries_by_meat_consumption", 0, 0, 1, false],
    "Homicide Rate": ["List_of_countries_by_intentional_homicide_rate", 1, 0, 1, false],
    "Air Pollution": ["List_of_countries_by_air_pollution", 0, 1, 2, null],
    "Obesity Rate": ["List_of_countries_by_obesity_rate", 0, 1, 2, null],
    "Average Elevation": ["List_of_countries_by_average_elevation", 0, 0, 1, false],
    "Rainfall": ["List_of_countries_by_average_annual_precipitation", 0, 1, 2, null],
    "% Forest": ["List_of_countries_by_forest_area", 1, 0, 3, null],
    "Coastline": ["List_of_countries_by_length_of_coastline", 0, 0, 1, null],
    "Fertility Rate": ["List_of_countries_by_total_fertility_rate", 0, 1, 2, null],
    "Debt-to-GDP Ratio": ["List_of_countries_by_government_debt", 0, 0, 1, false],
    "Military Per Capita": ["List_of_countries_by_number_of_military_and_paramilitary_personnel", 0, 0, 5, null],
    "Average Temperature": ["List_of_countries_by_average_yearly_temperature", 0, 1, 2, null],
    "Incarceration Rate": ["List_of_countries_by_incarceration_rate", 0, 0, 1, false],
    "# of Public Holidays": ["List_of_countries_by_number_of_public_holidays", 0, 0, 2, null],
    "Global Peace Index": ["Global_Peace_Index", 1, 1, 2, null],
    "Alcohol Consumption": ["List_of_countries_by_alcohol_consumption_per_capita", 1, 0, 3, false],
    "Traffic Accident Rate": ["List_of_countries_by_traffic-related_death_rate", 0, 0, 2, false],
    "# of Languages": ["List_of_countries_by_number_of_languages", 0, 0, 1, null],
    "Democracy Index": ["The_Economist_Democracy_Index", 3, 1, 3, false],
    "Average Human Height": ["Average_human_height_by_country", 0, 0, 1, false]
}

function getOptions() {
    var keys = Object.keys(categories);
    options = [];
    while (options.length < 5) {
        var index = Math.floor(Math.random() * keys.length);
        if (!options.includes(keys[index])) {
            options.push(keys[index]);
        }
    }
}

function getCategory() {
    var index = Math.floor(Math.random() * options.length);
    category = options[index];
}

async function getWikipediaTable(file, tableIndex) {
    var url = "https://en.wikipedia.org/w/api.php?action=parse&page="+file+"&format=json&origin=*";

    try {
        let response = await fetch(url);
        let data = await response.json();
        
        // Extract the HTML content of the page
        let htmlContent = data.parse.text["*"];

        // Create a temporary div to hold the HTML content
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;

        // Find the correct table
        let tables = tempDiv.querySelectorAll("table.wikitable");
        let table = tables[tableIndex];
        tableData = parseTable(table);
    }
    
    catch (error) {
        console.error("Error fetching data:", error);
    }
}

function parseTable(table) {
    let rows = table.querySelectorAll("tr");
    let data = [];

    rows.forEach(row => {
        let cells = row.querySelectorAll("td, th");
        let rowData = [];

        cells.forEach(cell => {
            rowData.push(cell.innerText.trim());
        });

        if (rowData.length > 0) {
            data.push(rowData);
        }
    });

    return data;
}

function isMatch(name, country) {
    var name = name.toLowerCase();
    var country = country.toLowerCase();
    name = name.replace(/\[\d+\]/g, "");
    name = name.replace(" (opec)", "");
    name = name.replace(" (opec+)", "");
    name = name.replace("\u202f*", "");
    
    if (name == country) {
        return true;
    }
    if (country in nicknames && nicknames[country].includes(name)) {
        return true;
    }
    return false;
}

function getRankByCountry(country) {
    for (let i = 0; i < clickable.length; i++) {
        if (country == clickable[i][0]) {
            return i;
        }
    }
    if (country == "United States" && category == "Area") {
        return 4;
    }
    var whoops = {"Canada": 14, "Austria": 19, "Argentina": 54, "Albania": 66, "Angola": 107, "Algeria": 110, "Afganistan": 167};
    if (country in whoops && category == "Democracy Index") {
        return whoops[country];
    }
}

function getColorByCountry(country) {
    var rank = getRankByCountry(country);
    for (let i = 0; i < colors.length; i++) {
        if (rank <= clickable.length / colors.length * (i+1)) {
            return colors[i];
        }
    }
}

function hitList(col, sortCol) {
    for (let i = 1; i < tableData.length; i++) {
        var row = tableData[i];
        for (let j = 0; j < countries.length; j++) {
            country = countries[j].id;
            if (isMatch(row[col], country)) {
                clickable.push([country, row[sortCol]])
                break;
            }
        }
    } 
}

function sortData(ascending) {
    clickable.sort((a, b) => {
        let aValue = parseFloat(a[1].replace(/,/g, "")) || 0;
        let bValue = parseFloat(b[1].replace(/,/g, "")) || 0;
        return ascending ? aValue - bValue : bValue - aValue;
    });
}

function search() {
    var name = entry.value;
    for (let i = 0; i < clickable.length; i++) {
        var country = clickable[i][0]
        if (isMatch(name, country) && !revealed.includes(country)) {
            var color = getColorByCountry(country)
            document.querySelectorAll(`[id="${country}"]`).forEach(c => {
                c.style.fill = color;
                box.style.backgroundColor = color;
                last.textContent = country;
            })
            entry.value = "";
            numReveals++;
            reveals.textContent = "reveals: " + numReveals;
            revealed.push(country);
        }
    }
}

function addListeners() {
    countries.forEach(c => {
        c.addEventListener("mousemove", (e) => {
            nameLabel.style.top = e.y+10+"px"
            nameLabel.style.left = e.x+10+"px"
            nameLabel.style.opacity = 1
            nameLabel.textContent = c.id
        })
        
        c.addEventListener("mouseleave", () => {
            nameLabel.style.opacity = 0
        })
        
        c.addEventListener("click", () => {
            var color = getColorByCountry(c.id);
            if (color != null && !revealed.includes(c.id)) {
                document.querySelectorAll(`[id="${c.id}"]`).forEach(country => {
                    country.style.fill = getColorByCountry(c.id);
                    box.style.backgroundColor = getColorByCountry(c.id);
                    last.textContent = c.id;
                })
                numReveals++;
                reveals.textContent = "reveals: " + numReveals;
                revealed.push(c.id);
            }
        })
    })

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", () => {
            if (!guessed) {
                guess(options[i]);
            }
        })
    }

    entry.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            search();
        }
    });

    reset.addEventListener("click", resetGame);
}

function resetGame() {
    var light = "#efe9e1"
    countries.forEach(country => {
        country.style.fill = light;
    })
    buttons.forEach(button => {
        button.style.backgroundColor = light;
        button.textContent = ". . .";
    })
    last.textContent = "last reveal";
    reveals.textContent = "reveals: 0";
    box.style.backgroundColor = light;
    entry.value = "";

    tableData = [];
    clickable = [];
    revealed = [];
    guessed = false;
    numReveals = 0;
    game++;
    main();
}

function reveal() {
    countries.forEach(country => {
        var color = getColorByCountry(country.id);
        if (color != null) {
            country.style.fill = color;
        }
    })
}

function guess(option) {
    reveal();
    guessed = true;
    for (let i = 0; i < buttons.length; i++) {
        var text = buttons[i].textContent;
        if (text == category) {
            buttons[i].style.backgroundColor = "#78c1a3"
        } else if (text == option) {
            buttons[i].style.backgroundColor = "#f38989"
        }
    }
}

function setButtons() {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].textContent = options[i];
    }
}

async function main() {
    getOptions();
    getCategory();
    setButtons();
    
    //category = "Oil Production";
    var file = categories[category][0];
    var tableIndex = categories[category][1];
    var col = categories[category][2];
    var sortCol = categories[category][3];
    var ascending = categories[category][4];
    
    await getWikipediaTable(file, tableIndex);
    hitList(col, sortCol);
    if (ascending != null) {
        sortData(ascending);
    }

    //console.log(tableData);
    //console.log(clickable);
    console.log(category);
    if (game == 0) {
        addListeners();
    }
}

main();