document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const monthName = document.getElementById('monthName');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    const today = new Date();

    function renderCalendar(month, year) {
        // Clear previous calendar days
        calendar.innerHTML = '';

        // Month names array
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Set month name
        monthName.textContent = `${monthNames[month]} ${year}`;

        // Get number of days in the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let currentDayElement;

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            dayDiv.classList.add('calendar-day');

            // Highlight the current day
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayDiv.classList.add('current-day');
                currentDayElement = dayDiv;
            }

            dayDiv.addEventListener('click', () => handleDateClick(day, month, year));
            calendar.appendChild(dayDiv);
        }

        if (currentDayElement) {
            setTimeout(() => centerCurrentDay(currentDayElement), 0);
        }
    }

    function handleDateClick(day, month, year) {

        // clear the page each time the button is clicked
        $("#schedule").html("");
        $("#gameInfo").html("");
        $("#awayDiv").html("");
        $("#homeDiv").html("");
        $.ajax({
            url: '/schedule_date',
            type: 'POST',
            async: false,
            data: JSON.stringify({'day': day, 'month': month + 1, 'year': year}),
            contentType: 'application/json',
            success: function(data) {

                $("#schedule").html("");

                if (data.dates.length === 0 || data.dates[0].games.length === 0) {
                    document.getElementById("schedule").innerText = "No games scheduled for today.";
                }

                data.dates.forEach(date => {

                    // Iterate through each game in the date
                    date.games.forEach(game => {
                        // Extract relevant information
                        const gameId = game.gamePk;
                        const gameType = game.gameType;
                        const gameDate = new Date(game.gameDate).toLocaleString('en-US', { timeZone: 'UTC' }); // Format game date in local time
                        const awayTeam = game.teams.away.team.name;
                        const homeTeam = game.teams.home.team.name;
                        const venue = game.venue.name;
                        const status = game.status.abstractGameState;
                        var homeScore = game.teams.home.score;
                        var awayScore = game.teams.away.score;

                        // check if the game hasn't started yet
                        if (homeScore == undefined || awayScore == undefined) {
                            homeScore = 0, awayScore = 0;
                        }
                        var game_id = gameId;
                        let gameInfo = document.createElement('div');
                      
                        // Create elements for away team
                        let awayDiv = document.createElement('div');
                        
                        let awayLogo = document.createElement('img');
                        awayLogo.src = "static/images/logos/" + awayTeam + ".png"; 
                        awayLogo.alt = awayTeam + " Logo";
                        awayLogo.style.height = "25px";
                        awayLogo.style.width = "25px";
                        awayDiv.appendChild(awayLogo);
                        awayDiv.innerHTML += awayTeam + " " + awayScore;

                        // Create elements for home team
                        let homeDiv = document.createElement('div');
                        let homeLogo = document.createElement('img');
                        homeLogo.src = "static/images/logos/" + homeTeam + ".png"; 
                        homeLogo.alt = homeTeam + " Logo";
                        homeLogo.style.height = "25px";
                        homeLogo.style.width = "25px";
                        homeDiv.appendChild(homeLogo);
                        homeDiv.innerHTML += homeTeam + " " + homeScore;

                        // Combine away and home team elements
                        gameInfo.appendChild(awayDiv);
                        gameInfo.appendChild(homeDiv);

                        document.getElementById("schedule").appendChild(gameInfo);
                        // Add summary text with line breaks
                        gameInfo.innerHTML += "<br>" + status + "<br>";   //+ element['summary'] + "<br><br>";

                        
                       
                    });
                });
            },
            error: function(error) {
                console.log(error);
            }
        });
        
    }

    function changeMonth(delta) {
        currentMonth += delta;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        } else if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    }

    prevButton.addEventListener('click', () => {
        changeMonth(-1);
    });

    nextButton.addEventListener('click', () => {
        changeMonth(1);
    });

    function centerCurrentDay(element) {
        const calendarWidth = calendar.offsetWidth;
        const elementWidth = element.offsetWidth;
        const elementOffset = element.offsetLeft;

        const scrollPosition = elementOffset - (calendarWidth / 2) + (elementWidth / 2);
        calendar.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }

    // Initial render
    renderCalendar(currentMonth, currentYear);
});
function convertLeadersStringToDict(leadersString) {
    const lines = leadersString.trim().split('\n');

    // Initialize an array to store player objects
    let players = [];

    // Iterate through each line
    lines.forEach(line => {
        
        const data = line.trim().split(/\s+/);
        let [rank, fname, lname, city, team1, team2, value, buffer] = data;
        let team = "";
        let name = `${fname} ${lname}`;
        if (value === undefined) {
            team = `${city} ${team1}`;
            value = team2;
        } else {
            team = `${city} ${team1} ${team2}`;
        }
        // handle case when someone has 3 words in name (i.e. "Jr.")
        if (buffer !== undefined) {
            name = `${fname} ${lname} ${city}`;
            team = `${team1} ${team2} ${value}`;
            value = buffer;
        } else if (buffer != undefined && value === undefined) {
            name = `${fname} ${lname} ${city}`;
            team = `${team1} ${team2}`;
        }
        const playerObj = {
            Team: team,
            Name: name,
            Value: value
        };
        players.push(playerObj);
            
    });
    return players;
}

function convertStandingsStringToDict(standingsString) {
    // Split the string by lines
    const lines = standingsString.trim().split('\n');
    
    // Initialize an empty array to hold team objects
    const teams = [];
    
    // Process each line to extract team data
    lines.forEach((line) => {
        // Split line by any amount of whitespace
        const data = line.trim().split(/\s+/);
        // Extract specific data elements
        const teamName = data.slice(1, -7).join(' '); // Join team name if it contains multiple words
        const w = parseInt(data[data.length - 7], 10);
        const l = parseInt(data[data.length - 6], 10);
        const gb = isNaN(parseFloat(data[data.length - 5])) ? data[data.length - 5] : parseFloat(data[data.length - 5]);
        const wc = data[data.length - 2];
        // Create team object with only required fields
        const teamObj = {
            Team: teamName,
            W: w,
            L: l,
            GB: gb,
            WC: wc,
            WP: (w/(w + l)).toFixed(3)
        };
        
        // Add team object to teams array
        teams.push(teamObj);
    });
    
    // Create the final standings object
    return teams;
}

// Generate HTML table dynamically
function generateTable(data, tab) {
    // Create table element
    const table = document.createElement('table');
    
    // Create table header row
    const headerRow = table.insertRow();
    Object.keys(data[0]).forEach((key) => {
        const headerCell = document.createElement('th');
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
    });
    // Create table body rows
    data.forEach((team, index) => {
        
        if (index >= tab) {
            const row = table.insertRow();
            
            // Add cell for team logo and name
            const logoNameCell = row.insertCell();
            const logoImg = document.createElement('img');
            logoImg.src = getTeamLogoURL(team.Team); // Function to get team logo URL
            logoImg.alt = team.Team + ' Logo';
            logoImg.classList.add('team-logo');
            logoNameCell.appendChild(logoImg);
            const teamNameSpan = document.createElement('span');
            teamNameSpan.textContent = team.Team;
            teamNameSpan.classList.add('team-name');
            logoNameCell.appendChild(teamNameSpan);
            // Add other data cells
            Object.keys(team).forEach((key) => {
                if (key !== 'Team') {
                    const cell = row.insertCell();
                    cell.textContent = team[key];
                }
            });
        }
    });
    
    return table;
}

// Function to get division name based on index
function getDivisionName(index) {
    switch (index) {
        case 0:
            return 'AL East';
        case 1:
            return 'AL Central';
        case 2:
            return 'AL West';
        case 3: 
            return 'NL East'
        case 4: 
            return 'NL Central'
        case 5: 
            return 'NL West'
        default:
            return;
    }
}

// Function to get team logo URL based on team name
function getTeamLogoURL(teamName) {

    const teamLogos = {
        'Baltimore Orioles': '/static/images/logos/Baltimore Orioles.png',
        'New York Yankees': '/static/images/logos/New York Yankees.png',
        'New York Mets': '/static/images/logos/New York Mets.png',
        'Tampa Bay Rays': '/static/images/logos/Tampa Bay Rays.png',
        'Boston Red Sox': '/static/images/logos/Boston Red Sox.png',
        'Cleveland Guardians':'/static/images/logos/Cleveland Guardians.png',
        'Toronto Blue Jays':'/static/images/logos/Toronto Blue Jays.png',
        'Chicago White Sox':'/static/images/logos/Chicago White Sox.png',
        'Arizona Diamondbacks':'/static/images/logos/Arizona Diamondbacks.png',
        'Minnesota Twins':'/static/images/logos/Minnesota Twins.png',
        'Philadelphia Phillies':'/static/images/logos/Philadelphia Phillies.png',
        'Houston Astros':'/static/images/logos/Houston Astros.png',
        'Miami Marlins':'/static/images/logos/Miami Marlins.png',
        'San Diego Padres':'/static/images/logos/San Diego Padres.png',
        'Los Angeles Dodgers':'/static/images/logos/Los Angeles Dodgers.png',
        'Washington Nationals':'/static/images/logos/Washington Nationals.png',
        'Detroit Tigers':'/static/images/logos/Detroit Tigers.png',
        'Oakland Athletics':'/static/images/logos/Oakland Athletics.png',
        'Seattle Mariners':'/static/images/logos/Seattle Mariners.png',
        'Cincinnati Reds':'/static/images/logos/Cincinnati Reds.png',
        'Los Angeles Angels':'/static/images/logos/Los Angeles Angels.png',
        'Texas Rangers':'/static/images/logos/Texas Rangers.png',
        'Milwaukee Brewers':'/static/images/logos/Milwaukee Brewers.png',
        'Pittsburgh Pirates':'/static/images/logos/Pittsburgh Pirates.png',
        'Atlanta Braves':'/static/images/logos/Atlanta Braves.png',
        'St. Louis Cardinals':'/static/images/logos/St. Louis Cardinals.png',
        'Chicago Cubs':'/static/images/logos/Chicago Cubs.png',
        'Colorado Rockies':'/static/images/logos/Colorado Rockies.png',
        'San Francisco Giants':'/static/images/logos/San Francisco Giants.png',
        'Kansas City Royals':'/static/images/logos/Kansas City Royals.png'
    };
    
    return teamLogos[teamName] || '/static/images/logos/default_logo.png'; // Default logo URL if not found
}
