let nameLabel = document.getElementById("name");
let countries = document.querySelectorAll(".allPaths");
let buttons = document.querySelectorAll('.button-container button');
let tableData = [];
let clickable = [];
let category = "";
let guessed = false;
let colors = ['#045275', '#00718b', '#089099', '#46aea0', '#7ccba2', '#b7e6a5', '#f7feae'];
let nicknames = {"united states": ["united states of america"], "democratic republic of the congo": ["dr congo", "congo, democratic republic of the"], "republic of the congo": ["congo", "congo, republic of the"], "czech republic": ["czechia"], "cape verde": ["cabo verde"], "ivory coast": ["côte d'ivoire"], "turkey": ["türkiye"], "eswatini": ["swaziland"], "north macedonia": ["macedonia"], "greenland": ["greenland (denmark)"], "falkland islands": ["falkland islands (uk)"], "new caledonia": ["new caledonia (france)"], "french polynesia": ["french polynesia (france)"], "taiwan": ["taiwan (republic of china)"], "china": ["people's republic of china"]}
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
    "Elevation": ["List_of_countries_by_average_elevation", 0, 0, 1, null],
    "Rainfall": ["List_of_countries_by_average_annual_precipitation", 0, 1, 2, null],
    "% Forest": ["List_of_countries_by_forest_area", 1, 0, 3, null],
    "Coastline": ["List_of_countries_by_length_of_coastline", 0, 0, 1, null],
    "Fertility Rate": ["List_of_countries_by_total_fertility_rate", 0, 1, 2, null],
    "Suicide Rate": ["List_of_countries_by_suicide_rate", 0, 0, 2, null],
    "Debt-to-GDP Ratio": ["List_of_countries_by_government_debt", 0, 0, 1, false],
    "Military Per Capita": ["List_of_countries_by_number_of_military_and_paramilitary_personnel", 0, 0, 5, null],
    "Temperature": ["List_of_countries_by_average_yearly_temperature", 0, 1, 2, null],
    "Incarceration Rate": ["List_of_countries_by_incarceration_rate", 0, 0, 1, false]
}

function get_options() {
    var keys = Object.keys(categories);
    var options = [];
    while (options.length < 5) {
        var index = Math.floor(Math.random() * keys.length);
        if (!options.includes(keys[index])) {
            options.push(keys[index]);
        }
    }
    return options;
}

function get_category(options) {
    var index = Math.floor(Math.random() * options.length);
    return options[index];
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

        // Find the first table (or other if necessary)
        let table = null;
        if (tableIndex == 0) {
            table = tempDiv.querySelector("table.wikitable");
        } else {
            table = tempDiv.querySelectorAll("table.wikitable")[tableIndex];
        }
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

function is_match(name, country) {
    var name = name.toLowerCase();
    var country = country.toLowerCase();
    if (name == country) {
        return true;
    }
    if (country in nicknames && nicknames[country].includes(name)) {
        return true;
    }
    if (name == country + " (opec)" || name == country + " (opec+)" || name == country + "\u202f*") {
        return true;
    }
    return false;
}

function getRankByCountry(countryName) {
    for (let i = 0; i < clickable.length; i++) {
        if (countryName == clickable[i][0]) {
            return i;
        }
    }
}

function getColorByCountry(countryName, category) {
    var rank = getRankByCountry(countryName);
    if (rank == null) {
        if (countryName == "United States" && category == "Area") {
            return colors[0];
        }
        return null;
    }

    for (let i = 0; i < colors.length; i++) {
        if (rank <= clickable.length / colors.length * (i+1)) {
            return colors[i];
        }
    }
}

function hitList(col, sortCol) {
    for (let i = 1; i < tableData.length; i++) {
        let row = tableData[i];
        for (let j = 0; j < countries.length; j++) {
            country = countries[j].id;
            if (is_match(row[col], country)) {
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

function addListeners(category) {
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
        
        var color = getColorByCountry(c.id, category);
        if (color != null) {
            c.addEventListener("click", () => {
                document.querySelectorAll(`[id="${c.id}"]`).forEach(country => {
                    country.style.fill = color;
                })
            })
        }
    })
}

function guess(option) {
    if (guessed) {
        return;
    }
    
    guessed = true;
    for (let i = 0; i < buttons.length; i++) {
        text = buttons[i].textContent;
        if (text == category) {
            buttons[i].style.backgroundColor = "#78c1a3"
        } else if (text == option) {
            buttons[i].style.backgroundColor = "#f38989"
        }
    }
}

function setButtons(options) {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].textContent = options[i];
        buttons[i].addEventListener("click", () => {
            guess(options[i]);
        })
    }
}

async function main() {
    var options = get_options();
    category = get_category(options);
    category = "Incarceration Rate";
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

    console.log(tableData);
    console.log(clickable);
    console.log(category);
    addListeners(category);
    setButtons(options);
}

main();