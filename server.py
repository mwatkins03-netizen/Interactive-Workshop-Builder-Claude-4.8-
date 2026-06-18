#!/usr/bin/env python3
"""Minimal static file server that avoids os.getcwd() (sandbox-safe)."""
import functools
import http.server
import os
import socketserver

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PORT = 8766

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIRECTORY)

with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print("serving %s on http://127.0.0.1:%d" % (DIRECTORY, PORT))
    httpd.serve_forever()
