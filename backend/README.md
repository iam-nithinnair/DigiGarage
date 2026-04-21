# Backend for Model Car Display

This is a modern Python backend using [FastAPI](https://fastapi.tiangolo.com/).

## Prerequisites
- **Python 3.8+**: Ensure you have Python installed. You can download it from [python.org](https://www.python.org/downloads/). During installation on Windows, make sure to check the box **"Add Python to PATH"**.

## Setup Instructions

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On **Windows**:
     ```bash
     venv\Scripts\activate
     ```

4. Install the requirements:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

Run the development server using:
```bash
python main.py
```

It will start on **http://localhost:8000**.

## Live Documentation
FastAPI automatically generates interactive API documentation. While the server is running, you can visit:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Connecting from Next.js (Frontend)
Because this FastAPI app is configured with `CORSMiddleware`, your Next.js application running on `localhost:3000` (or any other port) can directly make `fetch` requests to `http://localhost:8000/api/cars` without triggering CORS errors.
