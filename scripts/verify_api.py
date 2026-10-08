import json
import urllib.request

# 1. Login
req = urllib.request.Request(
    'http://localhost:8000/auth/login',
    data=json.dumps({'email': 'pradeepkumar24wr@gmail.com', 'password': 'Demo@1234'}).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())
tok = data['access_token']
print('=== LOGIN RESPONSE ===')
safe = {k: v for k, v in data.items() if k != 'access_token'}
safe['access_token'] = tok[:40] + '...'
print(json.dumps(safe, indent=2))

# 2. /models/status with token
req2 = urllib.request.Request(
    'http://localhost:8000/models/status',
    headers={'Authorization': f'Bearer {tok}'}
)
data2 = json.loads(urllib.request.urlopen(req2).read())
print()
print('=== /models/status (with token) ===')
for m in data2['models']:
    print(f"  {m['name']:<25} status={m['status']}")

# 3. /models/status without token — must 401
try:
    urllib.request.urlopen('http://localhost:8000/models/status')
    print('ERROR: Expected 401 but got 200!')
except urllib.error.HTTPError as e:
    print()
    print(f'=== /models/status (no token) -> HTTP {e.code} ===')
    print(e.read().decode())
