# -*- coding: utf-8 -*-
"""Migracion one-shot: xroad_colombia.db (SQLite) -> Neon xroad_colombia (Postgres)."""
import os
import sys
from sqlalchemy import create_engine, MetaData, Table, insert, text

SQLITE = os.environ.get(
    "SQLITE_PATH",
    "sqlite:///c:/Users/esteb/OneDrive/Desktop/PAE-2026-1/PAE 2026/BackendInteroperabilidad/xroad_colombia.db",
)
PG = os.environ.get(
    "NEON_DATABASE_URL",
    "postgresql://neondb_owner:npg_8Pt3fnWIlQwS@ep-orange-snow-ae0t6sj0.c-2.us-east-2.aws.neon.tech/xroad_colombia?sslmode=require",
)
SKIP = {"usuarios", "alembic_version"}  # usuarios ya sembrados por la app

src = create_engine(SQLITE)
dst = create_engine(PG)
sm, dm = MetaData(), MetaData()
sm.reflect(bind=src)
dm.reflect(bind=dst)

total = 0
# PASO 1: vaciar todo en orden inverso (hijos primero)
for tbl in reversed(dm.sorted_tables):
    if tbl.name in SKIP:
        continue
    with dst.begin() as tx:
        tx.execute(text(f'DELETE FROM "{tbl.name}"'))
# PASO 2: insertar en orden topologico (padres primero)
for tbl in dm.sorted_tables:  # orden topologico: padres antes que hijos
    name = tbl.name
    if name in SKIP or name not in sm.tables:
        print(f"- {name}: omitida")
        continue
    rows = [dict(r) for r in src.connect().execute(text(f'SELECT * FROM "{name}"')).mappings()]
    if not rows:
        print(f"- {name}: vacia")
        continue
    cols = [c for c in sm.tables[name].columns.keys() if c in dm.tables[name].columns.keys()]
    ok = 0
    first_err = None
    for r in rows:
        ins = insert(dm.tables[name]).values(**{c: r[c] for c in cols})
        try:
            with dst.begin() as tx:
                tx.execute(ins)
            ok += 1
        except Exception as e:
            if first_err is None:
                first_err = str(e)[:300]
            print(f"  ! fila omitida en {name}: {str(e)[:150]}")
    if first_err:
        print(f"  PRIMER ERROR en {name}: {first_err}")
    total += ok
    print(f"+ {name}: {ok}/{len(rows)} filas")
    # Parche: sectores huerfanos referenciados por entities (12..19) en el SQLite original
    if name == "sectors":
        with dst.begin() as tx:
            for sid in range(11, 20):
                tx.execute(
                    text('INSERT INTO sectors (id, name, code, color, icon) '
                         "VALUES (:i, :n, :c, '#3B82F6', 'building') "
                         'ON CONFLICT (id) DO NOTHING'),
                    {"i": sid, "n": f"Sector {sid}", "c": f"S{sid}"},
                )
        print("  + sectores placeholder 11-19 creados")
print(f"TOTAL migradas: {total}")
