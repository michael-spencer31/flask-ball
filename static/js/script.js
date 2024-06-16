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
        document.getElementById("schedule").innerText = "";
        $.ajax({
            url: '/schedule_date',
            type: 'POST',
            async: false,
            data: JSON.stringify({'day': day, 'month': month + 1, 'year': year}),
            contentType: 'application/json',
            success: function(data) {

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

                        console.log(homeScore);
                        // Print the summary for each game
                        document.getElementById("schedule").innerText += (`Date: ${gameDate}` + ' ');
                        document.getElementById("schedule").innerText += (' ' + `Teams: ${awayTeam} @ ${homeTeam}` + ' ');
                        document.getElementById("schedule").innerText += (' ' + `Venue: ${venue}` + ' ');
                        document.getElementById("schedule").innerText += (' ' + `Status: ${status}` + ' ');
                        document.getElementById("schedule").innerText += (' ' + `${awayTeam} ${awayScore} - ${homeTeam} ${homeScore}`+ ' ');
                        document.getElementById("schedule").innerText += ("\n\n" + ' ');
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
