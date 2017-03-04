import sqlite3 as sql
import pandas as pd
import numpy as np
import os
from datetime import datetime

DATABASE = os.path.abspath('./app/static/uploads/EvertStore.db')


def create_db(name):
    with sql.connect(name) as con:
        cur = con.cursor()

        # Create database tables
        cur.executescript('''CREATE TABLE IF NOT EXISTS plants
                              (plant_id INTEGER PRIMARY KEY  AUTOINCREMENT,
                               plant_name TEXT,
                               opened INTEGER,
                               uploaded INTEGER,
                               timestamp TEXT);

                            CREATE TABLE  IF NOT EXISTS sections
                            (section_id INTEGER PRIMARY KEY AUTOINCREMENT,
                             section_name TEXT,
                             plant_id INTEGER,
                             FOREIGN KEY(plant_id) REFERENCES plants(plant_id) );

                             CREATE TABLE IF NOT EXISTS equipment
                             (equipment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                              equipment_name TEXT,
                              plant_id,
                              section_id INTEGER,
                              FOREIGN KEY(section_id) REFERENCES sections(section_id),
                              FOREIGN KEY (plant_id) REFERENCES plants(plant_id));

                            CREATE TABLE IF NOT EXISTS tags
                            (tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
                             section_id INTEGER,
                             equipment_id INTEGER,
                             tag_name TEXT NOT NULL,
                             upper_bound NUMERIC,
                             lower_bound NUMERIC,
                             units TEXT,
                             FOREIGN KEY (section_id) REFERENCES sections(section_id),
                             FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id));

                            CREATE TABLE IF NOT EXISTS measurement_data
                            (timestamp,
                             tag_id INTEGER,
                             tag_value NUMERIC,
                             FOREIGN KEY (tag_id) REFERENCES tags(tag_id));
                            ''')

        con.commit()


def write_data_to_db(file_name, plant_name, open, upload):
    with sql.connect(DATABASE) as con:
        # creating database cursor object
        cur = con.cursor()

        time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')

        # adding plant name
        cur.execute("""INSERT INTO plants (plant_name, opened, uploaded, timestamp) VALUES (?, ?, ?, ?)""",
                    (plant_name, open, upload, time))

        # Finding default plant id
        plant_id = cur.execute("""SELECT plant_id FROM plants
                        WHERE plant_name = (?)""", (plant_name,)).fetchone()[0]

        # adding defualt unit name
        default_section_name = plant_name + '_Unit01'
        cur.execute("""INSERT INTO sections (section_name, plant_id)
                       VALUES (?, ?)""", (default_section_name, plant_id))

        # getting unique id for default section
        section_id = cur.execute("""SELECT section_id FROM sections
                                    WHERE section_name = (?)""", (default_section_name,)).fetchone()[0]

        # handling csv file
        df = pd.read_csv(file_name)
        df = pd.melt(df, id_vars=df.columns.values[0])
        df.columns = ['time_stamp', 'tag_id', 'tag_value']
        df_tags = np.unique(df['tag_id'].values)

        # current tags in the database
        cur_tags = cur.execute('SELECT tag_name FROM tags').fetchall()

        # initialize tag list to add to database
        tags_commit = [(section_id, tag,) for tag in df_tags if tag not in cur_tags]

        # adding new tags to data base
        cur.executemany('INSERT INTO tags (section_id, tag_name) VALUES (?, ?)', tags_commit)

        # creating tagmap from tags in tags table
        tag_map = dict(cur.execute('SELECT tag_name, tag_id FROM tags').fetchall())

        # normalizing dataframe tag_id with tag_ids from tags table
        df.tag_id = [tag_map[key] for key in df['tag_id'].values]

        # adding data to tag_data table
        df.to_sql('tag_data', con, if_exists='append', index=False)

def get_tag_names():

    with sql.connect(DATABASE) as con:
        cur = con.cursor()
        tag_names = np.asarray(cur.execute('''SELECT tag_name FROM tags''').fetchall()).T[0]
        tag_names = [(tag, tag) for tag in tag_names]

    return tag_names

def get_tag_data(tag_name):

    with sql.connect(DATABASE) as con:
        cur = con.cursor()
        data = cur.execute("""SELECT time_stamp, tag_value
                              FROM tag_data
                              JOIN tags
                              ON tag_data.tag_id=tags.tag_id
                              WHERE tag_name=(?)""", (tag_name,)).fetchall()
    print(data)

    return data

