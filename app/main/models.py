import sqlite3 as sql
import pandas as pd
import numpy as np
import os

DATABASE = os.path.abspath('./app/static/uploads/EvertStore.db')


def create_db(name):
    with sql.connect(name) as con:
        cur = con.cursor()

        # Create database tables
        cur.executescript('''CREATE TABLE IF NOT EXISTS plants
                              (plant_id INTEGER PRIMARY KEY  AUTOINCREMENT,
                               plant_name TEXT );

                            CREATE TABLE  IF NOT EXISTS sections
                            (section_id INTEGER PRIMARY KEY AUTOINCREMENT,
                             section_name TEXT,
                             plant_id INTEGER,
                             FOREIGN KEY(plant_id) REFERENCES plants(plant_id) );

                             CREATE TABLE IF NOT EXISTS equipment
                             (equipment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                              equipment_name TEXT,
                              plant_id FOREIGN KEY REFERENCES plants(plant_id),
                              section_id,
                              FOREIGN KEY(section_id) REFERENCES sections(section_id));

                            CREATE TABLE IF NOT EXISTS tags
                            (tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
                             section_id INTEGER NOT NULL,
                             equipment_id INTEGER NOT NULL,
                             tag_name TEXT NOT NULL,
                             upper_bound NUMERIC NOT NULL ,
                             lower_bound NUMERIC NOT NULL ,
                             units TEXT NOT NULL,
                             FOREIGN KEY (section_id) REFERENCES sections(section_id),
                             FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id));

                            CREATE TABLE IF NOT EXISTS tag_data
                            (timestamp,
                             tag_id INTEGER,
                             tag_value NUMERIC,
                             FOREIGN KEY (tag_id) REFERENCES tags(tag_id));
                            ''')

        con.commit()


def write_data_to_db(file_name):
    with sql.connect(DATABASE) as con:
        # creating database cursor object
        cur = con.cursor()
        # handling csv file
        df = pd.read_csv(file_name)
        df = pd.melt(df, id_vars=df.columns.values[0])
        df.columns = ['time_stamp', 'tag_id', 'tag_value']
        df_tags = np.unique(df['tag_id'].values)

        # current tags in the database
        cur_tags = cur.execute('SELECT tag_name FROM tags').fetchall()

        # initialize tag list to add to database
        tags_commit = [(tag,) for tag in df_tags if tag not in cur_tags]

        # initialize tag meta data to add to database
        tag_meta = [('', '', '') for i in df_tags if i not in cur_tags]

        # adding new tags to data base
        cur.executemany('INSERT INTO tags (tag_name) VALUES (?)', tags_commit)

        # adding new tag meta data
        cur.executemany('INSERT INTO tag_metadata (upper_bound, lower_bound, units) VALUES (?,?,?)',
                        tag_meta)

        # creating tagmap from tags in tags table
        tag_map = dict(cur.execute('SELECT tag_name, tag_id FROM tags').fetchall())

        # normalizing dataframe tag_id with tag_ids from tags table
        df.tag_id = [tag_map[key] for key in df['tag_id'].values]

        # adding data to tag_data table
        df.to_sql('tag_data', con, if_exists='append', index=False)
