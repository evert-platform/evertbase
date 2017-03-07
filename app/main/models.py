import pandas as pd
import numpy as np
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy, event
from sqlalchemy.engine import Engine
from sqlite3 import Connection as SQLite3Connection

db = SQLAlchemy()

# add event for enabling foreign keys on SQLite database
@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, SQLite3Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()


# custom base class with features that are inherited over all table classes
class BaseMixin:

    @classmethod
    def create(cls, **kwargs):  # method for adding data to table
        obj = cls(**kwargs)
        db.session.add(obj)
        db.session.commit()

    @classmethod
    def delete(cls, **kwargs):  # method for deleting data from table
        cls.query.filter_by(**kwargs).delete()
        db.session.commit()


# Model for plants table
class Plants(BaseMixin, db.Model):
    plant_id = db.Column('plant_id', db.Integer, primary_key=True)
    plant_name = db.Column('plant_name', db.VARCHAR(50), unique=True)
    opened = db.Column('opened', db.Integer)
    uploaded = db.Column('uploaded', db.Integer)
    time = db.Column('time', db.TEXT)


# Model for sections table
class Sections(BaseMixin, db.Model):
    section_id = db.Column('section_id', db.Integer, primary_key=True)
    section_name = db.Column('section_name', db.TEXT)
    plant_id = db.Column('plant_id', db.Integer, db.ForeignKey('plants.plant_id', ondelete='CASCADE',
                                                               onupdate='CASCADE'))


# Model for equipment table
class Equipment(BaseMixin, db.Model):
    equipment_id = db.Column('equipment_id', db.Integer, primary_key=True)
    equipment_name = db.Column('equipment_name', db.Text)
    plant_id = db.Column('plant_id', db.ForeignKey('plants.plant_id', onupdate='CASCADE', ondelete="CASCADE"))
    section_id = db.Column('section_id', db.ForeignKey('sections.section_id', onupdate='CASCADE', ondelete="CASCADE"))


# Model for tags table
class Tags(BaseMixin, db.Model):
    tag_id = db.Column('tag_id', db.Integer, primary_key=True)
    section_id = db.Column('section_id', db.ForeignKey('sections.section_id', ondelete='CASCADE', onupdate="CASCADE"))
    equipment_id = db.Column('equipment_id', db.ForeignKey('equipment.equipment_id', onupdate='CASCADE',
                                                           ondelete="CASCADE"))
    tag_name = db.Column('tag_name', db.Text)
    upper_bound = db.Column('upper_bound', db.Float)
    lower_bound = db.Column('lower_bound', db.Float)
    units = db.Column('units', db.Text)

    @staticmethod
    def create_multiple(list):
        for section_id, tag_name in list:
            Tags.create(tag_name=tag_name, section_id=section_id)


# Model for measurement data table
class MeasurementData(db.Model):
    data_id = db.Column('data_id', db.Integer, primary_key=True)
    timestamp = db.Column('timestamp', db.Text)
    tag_id = db.Column('tag_id', db.ForeignKey('tags.tag_id', ondelete="CASCADE", onupdate="CASCADE"))
    tag_value = db.Column('tag_value', db.Float)

    @staticmethod
    def write_data_to_db(file_name, plant_name, open, upload, append=False):

            time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')

            # adding plant name
            Plants.create(plant_name=plant_name, opened=open, uploaded=upload, time=time)

            # Finding default plant id
            plant_id = Plants.query.with_entities(Plants.plant_id).filter_by(plant_name=plant_name).first()

            # adding defualt unit name
            default_section_name = plant_name + '_Unit01'
            Sections.create(section_name=default_section_name, plant_id=plant_id[0])

            # getting unique id for default section
            section_id = Sections.query.with_entities(Sections.section_id).filter_by(
                        section_name=default_section_name).first()

            # handling csv file
            df = pd.read_csv(file_name)
            df = pd.melt(df, id_vars=df.columns.values[0])
            df.columns = ['timestamp', 'tag_id', 'tag_value']
            df_tags = np.unique(df['tag_id'].values)

            # current tags in the database
            # if append:
            #     cur_tags = cur.execute('SELECT tag_name FROM tags').fetchall()
            #
            #     # initialize tag list to add to database
            #     tags_commit = [(section_id, tag,) for tag in df_tags if tag not in cur_tags]
            #
            # else:
                # initialize tag list to add to database
            tags_commit = [(section_id[0], tag,) for tag in df_tags]

            # adding new tags to data base
            Tags.create_multiple(tags_commit)

            # creating tagmap from tags in tags table
            tag_map = dict(Tags.query.with_entities(Tags.tag_name, Tags.tag_id).all())


            # normalizing dataframe tag_id with tag_ids from tags table
            df.tag_id = [tag_map[key] for key in df['tag_id'].values]

            # adding data to tag_data table
            df.to_sql('measurement_data', db.engine, if_exists='append', index=False)
