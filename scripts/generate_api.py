import json
from backend.app.main import app

def generate():
    schema = app.openapi()
    with open("docs/openapi.json", "w") as f:
        json.dump(schema, f, indent=2)

if __name__ == "__main__":
    generate()
