"""
MealBridge Local Development Server
Provides clean HTTP serving with proper MIME types, UTF-8 charset, and no-cache headers.
"""

import http.server
import socketserver
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Prevent caching for immediate hot development feedback
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def guess_type(self, path):
        mimetype = super().guess_type(path)
        if path.endswith('.js'):
            return 'application/javascript; charset=utf-8'
        elif path.endswith('.css'):
            return 'text/css; charset=utf-8'
        elif path.endswith('.html'):
            return 'text/html; charset=utf-8'
        elif path.endswith('.jpg') or path.endswith('.jpeg'):
            return 'image/jpeg'
        return mimetype

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

def start_server():
    port = PORT
    for attempt in range(5):
        try:
            with ThreadingTCPServer(("", port), CustomHTTPRequestHandler) as httpd:
                print(f"MealBridge Server successfully listening at http://localhost:{port}")
                sys.stdout.flush()
                httpd.serve_forever()
        except OSError as e:
            if attempt < 4:
                print(f"Port {port} in use, trying port {port + 1}...")
                port += 1
            else:
                print(f"Error starting server: {e}")
                sys.exit(1)

if __name__ == "__main__":
    start_server()
