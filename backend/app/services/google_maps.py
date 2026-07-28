import os
import httpx
from typing import List, Dict
from sqlalchemy.orm import Session
from datetime import datetime

class GoogleMapsService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_PLACES_API_KEY")

    async def fetch_place_reviews(self, place_id: str, db_session: Session) -> List[Dict]:
        if not self.api_key:
            return []

        url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=reviews&key={self.api_key}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
                return data.get("result", {}).get("reviews", [])
            except Exception:
                return []
