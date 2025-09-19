import os
from contextlib import nullcontext
from fastapi import FastAPI
from fastapi.params import Body
from config import API_KEY
from fastapi.middleware.cors import CORSMiddleware
import requests
import json



app = FastAPI() # Allow frontend to call your backend

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_movie_details(movieName):

    endpoint = f"https://www.omdbapi.com/?t={movieName}&apikey={API_KEY}"
    response = requests.get(endpoint)
    return response.json()


@app.get("/movie/{movieName}")
async def get_data(movieName):
    
    return get_movie_details(movieName)

@app.post("/movie/save")
async def save_movie(movie_data: dict):
    if os.path.exists("my_movies.json") and os.path.getsize("my_movies.json") > 0:
        with open("my_movies.json", "r") as f:
            try:
                movies = json.load(f)
            except json.JSONDecodeError:
                movies = []
    else:
        movies = []

    movies.append(movie_data)    
    with open('my_movies.json' , 'w') as my_movies:
        json.dump(movies,my_movies, indent=4)
        return {'message' : "saved the data"}

