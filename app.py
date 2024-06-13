#!python
from __future__ import print_function
import mlbstatsapi
import statsapi
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS, cross_origin
import requests, csv, argparse
from urllib.request import urlopen
import urllib.parse
from bs4 import BeautifulSoup as bs
from datetime import datetime
import os, re

app = Flask(__name__)
cors = CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'

# default landing page
@app.route("/")
@cross_origin()
def home():
    return render_template("home.html")

# landing page for search
@app.route("/search")
def search():
    data = statsapi.standings()
    return render_template("search.html", value=data)

# landing page for roster
@app.route("/roster")
def roster():
    return render_template("roster.html")

# landing page for standings
@app.route("/standings")
def standings():
    return render_template("standings.html")


@app.route('/get_schedule', methods=['POST'])
@cross_origin()
def get_schedule():
    
    today = statsapi.schedule()

    return today

@app.route('/get_standings', methods=['POST'])
@cross_origin()
def get_standings():
    standings = statsapi.standings()
    return standings

@app.route('/get_id_num', methods=['POST'])
@cross_origin()
def get_id_num():
    data = request.get_json()
    name = data['value']
    id = statsapi.lookup_player(name)
    number = id[0]['primaryNumber']
    stats = statsapi.player_stat_data(id[0]['id'], group="[hitting,pitching,fielding]", type="season", sportId=1)
    return stats

@app.route('/get_roster_num', methods=['POST'])
@cross_origin()
def get_roster_num():
    data = request.get_json()
    name = data['value']
    id = statsapi.lookup_team("Boston Red Sox")
    id_num = id[0]['id']
    roster = statsapi.rofster(id_num)
    return roster

@app.route('/get_box_score', methods=['POST'])
@cross_origin()
def get_box_score():
    # print(statsapi.standings())
    return statsapi.standings()
        
# use to run locally on port 5000 (by default)
# set debug=True for testing
if __name__ == '__main__':
    app.run(debug=True)