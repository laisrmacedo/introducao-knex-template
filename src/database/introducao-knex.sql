-- Active: 1674477656807@@127.0.0.1@3306

-- Tabelas já foram criadas
CREATE TABLE bands (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL
);
DROP TABLE bands;

INSERT INTO bands (id, name)
VALUES
    ("b001", "Evanescence"),
    ("b002", "LS Jack"),
    ("b003", "Blink-182");

CREATE TABLE songs (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    band_id TEXT NOT NULL,
    FOREIGN KEY (band_id) REFERENCES bands (id)
);

SELECT * FROM songs;

INSERT INTO songs (id, name, band_id)
VALUES
    ("s001", "Bring me to life", "b001"),
    ("s002", "Carla", "b002"),
    ("s003", "Uma carta", "b002"),
    ("s004", "All the small things", "b001"),
    ("s005", "I miss you", "b001");
