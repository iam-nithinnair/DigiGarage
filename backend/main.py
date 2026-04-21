from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uuid

# SQLAlchemy imports
from sqlalchemy import create_engine, Column, String, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# ==== Database Setup ====
SQLALCHEMY_DATABASE_URL = "sqlite:///./models.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==== SQLAlchemy Models ====
class DBModel(Base):
    __tablename__ = "cars"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    year = Column(String)
    manufacturer = Column(String)
    series = Column(String)
    scale = Column(String)
    isFavorite = Column(Boolean, default=False)
    image = Column(String)

class DBISOModel(Base):
    __tablename__ = "iso_cars"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    targetPrice = Column(String)
    rarity = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)

# ==== Pydantic Models ====
class ModelModel(BaseModel):
    id: str
    name: str
    year: str
    manufacturer: str
    series: str
    scale: str
    isFavorite: bool
    image: str

    class Config:
        from_attributes = True

class ModelModelCreate(BaseModel):
    name: str
    year: str
    manufacturer: str
    series: str
    scale: str
    image: str

class ISOModelModel(BaseModel):
    id: str
    name: str
    targetPrice: str
    rarity: str

    class Config:
        from_attributes = True

class ISOModelModelCreate(BaseModel):
    name: str
    targetPrice: str
    rarity: str

# ==== FastAPI App Setup ====
app = FastAPI(
    title="Model Car Display API",
    description="Backend API for managing model cars and data with SQLite.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Provide initial mock data if database is empty
def init_db(db: Session):
    if db.query(DBModel).first() is None:
        mock_models = [
            DBModel(id=str(uuid.uuid4()), name="1967 Ford Mustang GT", year="1967", manufacturer="AUTOart", series="Die-Cast", scale="1:18", isFavorite=False, image="https://lh3.googleusercontent.com/aida-public/AB6AXuCR8cdG4oFA0L-K-wB7m6T2-OKG55Jcn1YPsrlt_YyO3TmlNVui9ddJV8koZetj4Cdn2h4g4z2uaIvNkfDYRst81uk2dVG8k_DR8kqMqahYqgeR0Ee8r3cNxymICAgNK4XlmBL7VLvJubyt6CdqKV8O6ghyCW27_AWw7Oc1RoaNxL3PyIHlapcv9V2HuSGIeZon4EjdFv9sa6tsPWwuQCxhOhCXlP2MJoTP-WKB-y2baPuH0hj8LsBCWIu-Qs0DncTVrMSh8tCFeCs"),
            DBModel(id=str(uuid.uuid4()), name="2022 Porsche 911 GT3", year="2022", manufacturer="Spark", series="Resin", scale="1:43", isFavorite=True, image="https://lh3.googleusercontent.com/aida-public/AB6AXuCsyaT9nUD71dH4BSf0cj5J8W6G1rrmlzwB9O64MjTnXGRseNSrKIPRynHs2bm1ybmRJXqs9tCinOmCRnh4GUjVUD1914Pgovy_Tz4wTfIu0EAZZvKxSAlzPyY1Au-c8P58wM6jiePC8RFCCs5CFqaMfWDFFC9Y3IXTIVnz5UH1pELwuoOMkeVT3u-DZAUTYGwWZTj48UVB4Ouen-9UwFObvf2XoXyLR-1-EoWv2KtxAGEF2Y40EdrB4-tUVIe5b2hgzVIXwwvvIRU"),
            DBModel(id=str(uuid.uuid4()), name="Ferrari F40", year="1987", manufacturer="Kyosho", series="Composite", scale="1:12", isFavorite=False, image="https://lh3.googleusercontent.com/aida-public/AB6AXuAKtzzHuhaTuR_BtYJyQP1bhJ4olqeCSviAMySIy2k5j1d7e1bIVwgn2eBw_vIyU3R_MOXvlUHt0BLnEJBn4NCHjuVKhDRG3f7Gz3TkdlLjv_9w4CDb82Jds9fcgl8ythiAYTQbtDQRYtK-gt2147KQ7XPNoTVVUCkfX8Hjrwv_AcpUAcMNKSP_abtSaVtlGnleL6sB1-VraTvyarP90ZeFQpthVBNSJxtzLcucKM0wdJ7-yGikyejVd5m9HBHWv3182xK6sPE_QLA"),
            DBModel(id=str(uuid.uuid4()), name="Lamborghini Countach", year="1974", manufacturer="BBR", series="Die-Cast", scale="1:18", isFavorite=False, image="https://lh3.googleusercontent.com/aida-public/AB6AXuCPJ-o_lDNvdfita_Vt9CQyM5ZYagHA_bbOiG_2TMtwFNicPFK1AmToaa3mI8W_Bg4nuF7QmWtb_sGPlnzIXYvCj4V1bqjcgwVzjPHtnOmj8ZND_M0daiDqrEunfae5nF8KVgpoUhdnliZPpTyKoDLRoziqZIz_t6l3610GGtNn42EOJfYsOq1sO_v93nwEICxBn4k6taRVUVpg0ocU6x_4KldcGZPN96-vO3US2goOfEXoikOu1FxuHH6ZZzz2snt3ZpX0lrul4bc")
        ]
        db.add_all(mock_models)
        db.commit()

    if db.query(DBISOModel).first() is None:
        mock_iso = [
            DBISOModel(id=str(uuid.uuid4()), name="Nissan Skyline GT-R R34 (Nismo)", targetPrice="$250", rarity="Ultra-Rare"),
            DBISOModel(id=str(uuid.uuid4()), name="McLaren F1 GTR", targetPrice="$400", rarity="Legendary")
        ]
        db.add_all(mock_iso)
        db.commit()

# Call init_db on startup
with SessionLocal() as session:
    init_db(session)

# ==== API Endpoints ====
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to the Model Car Display API with SQLite Database"}

@app.get("/api/models", response_model=List[ModelModel])
def get_models(db: Session = Depends(get_db)):
    """Fetch all model cars."""
    return db.query(DBModel).all()

@app.post("/api/models", response_model=ModelModel)
def create_model(model: ModelModelCreate, db: Session = Depends(get_db)):
    """Add a new model car."""
    db_model = DBModel(id=str(uuid.uuid4()), **model.dict(), isFavorite=False)
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

@app.delete("/api/models/{model_id}")
def delete_model(model_id: str, db: Session = Depends(get_db)):
    """Delete a model car by ID."""
    db_model = db.query(DBModel).filter(DBModel.id == model_id).first()
    if db_model is None:
        raise HTTPException(status_code=404, detail="Model not found")
    db.delete(db_model)
    db.commit()
    return {"status": "success", "id": model_id}

@app.patch("/api/models/{model_id}/favorite", response_model=ModelModel)
def toggle_favorite(model_id: str, db: Session = Depends(get_db)):
    """Toggle the favorite status of a model car."""
    db_model = db.query(DBModel).filter(DBModel.id == model_id).first()
    if db_model is None:
        raise HTTPException(status_code=404, detail="Model not found")
    db_model.isFavorite = not db_model.isFavorite
    db.commit()
    db.refresh(db_model)
    return db_model

@app.get("/api/iso-models", response_model=List[ISOModelModel])
def get_iso_models(db: Session = Depends(get_db)):
    """Fetch all ISO model cars."""
    return db.query(DBISOModel).all()

@app.post("/api/iso-models", response_model=ISOModelModel)
def create_iso_model(model: ISOModelModelCreate, db: Session = Depends(get_db)):
    """Add a new ISO model car."""
    db_model = DBISOModel(id=str(uuid.uuid4()), **model.dict())
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

@app.delete("/api/iso-models/{model_id}")
def delete_iso_model(model_id: str, db: Session = Depends(get_db)):
    """Delete an ISO model car by ID."""
    db_model = db.query(DBISOModel).filter(DBISOModel.id == model_id).first()
    if db_model is None:
        raise HTTPException(status_code=404, detail="ISO Model not found")
    db.delete(db_model)
    db.commit()
    return {"status": "success", "id": model_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
