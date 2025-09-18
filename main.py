from contextlib import nullcontext
from fastapi import FastAPI
from config import API_KEY
from fastapi.middleware.cors import CORSMiddleware
import requests

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

