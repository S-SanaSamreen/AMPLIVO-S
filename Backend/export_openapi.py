import json
from app.main import app

openapi_schema = app.openapi()
with open("../docs/API/openapi.json", "w") as f:
    json.dump(openapi_schema, f, indent=2)

print("OpenAPI spec exported successfully to docs/API/openapi.json")
