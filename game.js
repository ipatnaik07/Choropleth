let nameLabel = document.getElementById("name");
let countries = document.querySelectorAll(".allPaths");
let buttons = document.querySelectorAll('.button-container button');
let tableData = [];
let clickable = [];
let colors = ['#045275', '#00718b', '#089099', '#46aea0', '#7ccba2', '#b7e6a5', '#f7feae'];
let nicknames = {"democratic republic of the congo": ["dr congo"], "republic of the congo": ["congo"], "côte d'ivoire": ["ivory coast"], "greenland": ["greenland (denmark)"], "united states": ["united states of america"]}
let categories = {
    "Population": ["List_of_countries_and_dependencies_by_population", 0, 1, null],
    "Population Density": ["List_of_countries_and_dependencies_by_population_density", 0, 1, null],
    "GDP": ["List_of_countries_by_GDP_(nominal)", 0, 1, null],
    "GDP Per Capita": ["List_of_countries_by_GDP_(nominal)_per_capita", 0, 1, null],
    "Area": ["List_of_countries_and_dependencies_by_area", 1, 2, null],
    "Life Expectancy": ["List_of_countries_by_life_expectancy", 0, 1, null],
    "Oil Production": ["List_of_countries_by_oil_production", 0, 1, null],
    "Meat Consumption": ["List_of_countries_by_meat_consumption", 0, 1, false]
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

async function getWikipediaTable(file) {
    var url = "https://en.wikipedia.org/w/api.php?action=parse&page="+file+"&format=json&origin=*";

    try {
        let response = await fetch(url);
        let data = await response.json();
        
        // Extract the HTML content of the page
        let htmlContent = data.parse.text["*"];

        // Create a temporary div to hold the HTML content
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;

        // Find the first table (modify this if necessary)
        let table = tempDiv.querySelector("table.wikitable");

        if (table) {
            console.log("Table Found!");
            tableData = parseTable(table);
        } else {
            console.log("No table found.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function parseTable(table) {
    let rows = table.querySelectorAll("tr");
    let data = [];

    rows.forEach((row, index) => {
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
    if (name == country + " (opec)" || name == country + " (opec+)") {
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
    if (rank != null) {
        for (let i = 0; i < colors.length; i++) {
            if (rank <= clickable.length / colors.length * (i+1)) {
                return colors[i];
            }
        }
    }

    else if (countryName == "United States" && category == "Area") {
        return colors[0];
    }
}

function hitList(col, sortCol) {
    for (let i = 1; i < tableData.length; i++) {
        let row = tableData[i];
        for (let j = 1; j < countries.length; j++) {
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
        
        c.addEventListener("click", () => {
            document.querySelectorAll(`[id="${c.id}"]`).forEach(country => {
                country.style.fill = getColorByCountry(c.id, category)
            })
        })
    })
}

function setButtons(options) {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].textContent = options[i];
    };
}

async function main() {
    var options = get_options();
    var category = get_category(options);
    //category = "Meat Consumption"
    var file = categories[category][0];
    var col = categories[category][1];
    var sortCol = categories[category][2];
    var ascending = categories[category][3];
    
    await getWikipediaTable(file);
    hitList(col, sortCol);
    if (ascending != null) {
        sortData(ascending);
    }

    //console.log(tableData);
    //console.log(clickable);
    console.log(category);
    addListeners(category);
    setButtons(options);
}

main()