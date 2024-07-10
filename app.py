from flask import Flask, render_template, jsonify, request
from flask_cors import CORS, cross_origin
import requests
from datetime import datetime
import statsapi

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Default landing page
@app.route("/")
@cross_origin()
def home():
    return render_template("home.html")

# Landing page for search
@app.route("/search")
def search():
    data = statsapi.standings()
    return render_template("search.html", value=data)

# Landing page for roster
@app.route("/roster")
def roster():
    return render_template("roster.html")

# Landing page for about
@app.route("/about")
def about():
    return render_template("about.html")

# Landing page for standings
@app.route("/standings")
def standings():
    return render_template("standings.html")

# Landing page for schedule
@app.route("/schedule")
def schedule():
    return render_template("schedule.html")

# Landing page for details
@app.route("/details")
def details():
    return render_template("details.html")

# Landing page for leaders
@app.route("/leaders")
def leaders():
    return render_template("leaders.html")


@app.route("/get_leaders", methods=["POST"])
def get_leaders():
    data_in = request.get_json()
    option = data_in['value']
    data = statsapi.league_leaders(option, statGroup='hitting',limit=10,sportId=1,statType='season')
    return data

# Endpoint to get schedule for a specific date
@app.route("/schedule_date", methods=["POST"])
@cross_origin()
def schedule_date():
    data = request.get_json()
    day = data['day']
    month = data['month']
    year = data['year']

    # Format the date
    formatted_date = format_date(day, month, year)
    url = f'https://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&date={formatted_date}'
    
    # Make the request to the MLB API
    response = requests.get(url)
    return response.json()

# Helper function to format the date
def format_date(day, month, year):
    date = datetime(year, month, day)
    return date.strftime('%Y-%m-%d')

# Endpoint to get line score
@app.route("/get_line_score", methods=["POST"])
@cross_origin()
def get_line_score():
    data = request.get_json()
    id = data['value']

    # Fetch the line score, box score, and scoring plays
    line = statsapi.linescore(id)
    box = statsapi.boxscore(id)
    scoring = statsapi.game_scoring_plays(id)

    all_data = {'line': line, 'box': box, 'scoring': scoring}
    return jsonify(all_data)

# Endpoint to get today's schedule
@app.route('/get_schedule', methods=['POST'])
@cross_origin()
def get_schedule():
    today = statsapi.schedule()
    return today

# Endpoint to get standings
@app.route('/get_standings', methods=['POST'])
@cross_origin()
def get_standings():
    standings = statsapi.standings(include_wildcard=True)
    return standings

# Endpoint to get player ID number
@app.route('/get_id_num', methods=['POST'])
@cross_origin()
def get_id_num():
    data = request.get_json()
    name = data['value']
    id = statsapi.lookup_player(name)
    stats = statsapi.player_stat_data(id[0]['id'], group="[hitting,pitching,fielding]", type="season", sportId=1)
    return stats

# Endpoint to get team roster by team name
@app.route('/get_roster_num', methods=['POST'])
@cross_origin()
def get_roster_num():
    data = request.get_json()
    name = data['value']
    id = statsapi.lookup_team(name)
    id_num = id[0]['id']
    roster = statsapi.roster(id_num)
    return roster

# Endpoint to get box score (stub for now)
@app.route('/get_box_score', methods=['POST'])
@cross_origin()
def get_box_score():
    return statsapi.standings()

# Use to run locally on port 5000 (by default)
# Remove this when moving to production
if __name__ == '__main__':
    app.run(debug=True)
