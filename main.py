
import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from config import API_KEY

app = FastAPI()

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

@app.get("/movie/ratedbyme")
def rated_movies():
    print("getting the movies rated by the user")
    if not os.path.exists("my_movies.json") or os.path.getsize("my_movies.json") == 0:
        return []

    with open("my_movies.json", "r") as f:
        try:
            movies = json.load(f)
            if isinstance(movies, dict):
                movies = [movies]
        except json.JSONDecodeError:
            movies = []

    return movies


@app.get("/movie/{movieName}")
async def get_data(movieName: str):
    print("getting movie details from api")
    return get_movie_details(movieName)

@app.post("/movie/save")
async def save_movie(movie_data: dict):
    print("saving a movie")
    # Ensure file exists & contains a list
    if os.path.exists("my_movies.json") and os.path.getsize("my_movies.json") > 0:
        with open("my_movies.json", "r") as f:
            try:
                movies = json.load(f)
                if isinstance(movies, dict):   # wrap single dict
                    movies = [movies]
            except json.JSONDecodeError:
                movies = []
    else:
        movies = []

    movies.append(movie_data)

    with open("my_movies.json", "w") as my_movies:
        json.dump(movies, my_movies, indent=4)

    return {"message": "saved the data"}

@app.delete("/movie/delete/{imdbID}")
async def DeleteMovie(imdbID):
    temp = []
    with open("my_movies.json", "r") as f:
        try:
            movies = json.load(f)
            if isinstance(movies, dict):   # wrap single dict
                movies = [movies]

            for movie in movies:
                if movie["imdbID"] != imdbID:
                    temp.append(movie)

        except json.JSONDecodeError:
            print("error while opening the file for deletion")
            movies = []

    with open("my_movies.json" , "w") as f:
        json.dump(temp , f , indent=4)

    

