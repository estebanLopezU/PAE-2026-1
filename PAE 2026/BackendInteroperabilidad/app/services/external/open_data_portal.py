"""
Cliente para consumir el Portal de Datos Abiertos de Colombia
API: https://www.datos.gov.co/
"""
import httpx
import asyncio
from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime

# Modelos de datos
class Dataset(BaseModel):
    id: str
    title: str
    description: str
