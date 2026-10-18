"""Convierte APU S10 con texto seleccionable a un catálogo CSV revisable.

Uso: python3 scripts/extract-apu.py archivo.pdf [otro.pdf ...] -o catalogo.csv
Requiere pdftotext (Poppler). No usa servicios externos ni incorpora documentos al sitio.
"""
import argparse
import csv
import hashlib
import re
import subprocess
from pathlib import Path


def extract(text, source):
    parts = list(re.finditer(r'(?m)^Partida\s+(\d+(?:\.\d+)+)\s+(.+)$', text))
    if not parts:
        raise ValueError(f'{source}: no se encontraron partidas S10 con texto seleccionable')
    rows = []
    for i, match in enumerate(parts):
        end = parts[i + 1].start() if i + 1 < len(parts) else len(text)
        block = text[match.end():end]
        rate = re.search(r'Rendimiento\s+(\S+?)/DIA\s+MO\.\s+([\d,.]+)\s+EQ\.\s+([\d,.]+)', block)
        if not rate:
            raise ValueError(f'{source}, {match[1]}: rendimiento no reconocido; revisión necesaria')
        labor, equipment = (float(rate[n].replace(',', '')) for n in (2, 3))
        if labor <= 0 or labor != equipment:
            raise ValueError(f'{source}, {match[1]}: revisar rendimientos MO y EQ antes de seleccionar uno')
        page = text[:match.start()].count('\f') + 1
        rows.append([match[1], match[2].strip(), rate[1], labor, f'{source} · página {page} · referencia APU'])
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='+', type=Path)
    parser.add_argument('-o', '--output', required=True, type=Path)
    args = parser.parse_args()
    rows, digests, codes = [], set(), set()
    for path in args.files:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest in digests:
            continue
        digests.add(digest)
        result = subprocess.run(['pdftotext', '-layout', str(path), '-'], check=True, capture_output=True)
        for row in extract(result.stdout.decode('utf-8'), path.name):
            if row[0] in codes:
                raise ValueError(f'Código APU duplicado {row[0]}; revisa las versiones de origen')
            codes.add(row[0])
            rows.append(row)
    with args.output.open('w', encoding='utf-8-sig', newline='') as output:
        writer = csv.writer(output, delimiter=';')
        writer.writerow(['codigo_partida', 'descripcion', 'unidad', 'rendimiento', 'fuente'])
        writer.writerows(rows)
    print(f'{len(rows)} rendimientos de referencia exportados a {args.output}')


if __name__ == '__main__':
    main()
