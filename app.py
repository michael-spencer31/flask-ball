#!python
from __future__ import print_function
import mlbstatsapi
import statsapi
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS, cross_origin
import requests, csv, argparse
from urllib.request import urlopen
from bs4 import BeautifulSoup as bs
import os, re

app = Flask(__name__)
cors = CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/search")
def search():
    data = statsapi.standings()
    return render_template("search.html", value=data)

@app.route("/")
@cross_origin()
def home():
    url = "http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&startDate=2024-06-11&endDate=2024-06-11"
    player = statsapi.lookup_player('springer,')
    print(player[0]['id']) #assume only 1 record returned for demo purposes

    
    resp = requests.get(url)
    data = resp.json()
    print(statsapi.player_stat_data(543807, group="[hitting,pitching,fielding]", type="season", sportId=1))
    mlb = mlbstatsapi.Mlb() 
    return render_template("home.html", value=data)

@app.route('/get_id_num', methods=['POST'])
@cross_origin()
def get_id_num():
    data = request.get_json()
    name = data['value']
    id = statsapi.lookup_player(name)
    number = id[0]['primaryNumber']
    stats = statsapi.player_stat_data(id[0]['id'], group="[hitting,pitching,fielding]", type="season", sportId=1)
    return stats

@app.route('/get_box_score', methods=['POST'])
@cross_origin()
def get_box_score():
    # print(statsapi.standings())
    return statsapi.standings()
        
# use to run locally on port 5000 (by default)
# set debug=True for testing
if __name__ == '__main__':
    app.run(debug=True)