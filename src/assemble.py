#!/usr/bin/env python3
"""Assembles the standalone index.html from source parts."""
import pathlib, re

BASE = pathlib.Path(__file__).resolve().parent

p1 = (BASE / 'p1.html').read_text()
p2 = (BASE / 'p2.html').read_text()
p3 = (BASE / 'p3.js').read_text()
p4 = (BASE / 'p4.js').read_text()
p5 = (BASE / 'p5.js').read_text()

out = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0d1130">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Corrida dos Heróis">
<style>html{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}</style>
{p1}
</head>
<body>
{p2}
<script>(()=>{{"use strict";
{p3}
{p4}
{p5}
}})();</script>
</body>
</html>"""

out_path = BASE.parent / 'index.html'
out_path.write_text(out)
size_kb = out_path.stat().st_size / 1024
print(f"Built {out_path} — {size_kb:.1f} KB")
