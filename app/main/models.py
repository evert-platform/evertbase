import pandas as pd
import numpy as np
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy, event
from sqlalchemy.engine import Engine
from sqlite3 import Connection as SQLite3Connection
from sqlalchemy.exc import IntegrityError

db = SQLAlchemy()
db_session = db.session


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

    @classmethod
    def delete_multiple_by_id(cls, lst):
        for listi in lst:
            cls.query.filter_by(id=int(listi)).delete()
            db.session.commit()

    @classmethod
    def query_columns_all(cls, *args):
        return cls.query.with_entities(*args).all()

    @classmethod
    def get_names(cls):
        names = cls.query.with_entities(cls.id, cls.name).all()
        return [(str(_id), _name) for _id, _name in names]

    @classmethod
    def get_filtered_names(cls, **kwargs):
        names = cls.query.with_entities(cls.id, cls.name).filter_by(**kwargs).all()
        return [(str(_id), _name) for _id, _name in names]

    @classmethod
    def get_filtered_names_in(cls, key, values):
        methods = {'section': cls.section,
                   'plant': cls.plant,
                   'id': cls.id,
                   'name': cls.name}
        names = db_session.query(cls).with_entities(cls.id, cls.name).filter(methods[key].in_(values)).all()
        return names


# Model for plants table
class Plants(BaseMixin, db.Model):
    id = db.Column('id', db.Integer, primary_key=True)
    name = db.Column('name', db.VARCHAR(50), unique=True)
    opened = db.Column('opened', db.Integer)
    uploaded = db.Column('uploaded', db.Integer)
    time = db.Column('time', db.TEXT)


# Model for sections table
class Sections(BaseMixin, db.Model):
    id = db.Column('id', db.Integer, primary_key=True)
    name = db.Column('name', db.TEXT)
    plant = db.Column('plant', db.Integer, db.ForeignKey('plants.id', ondelete='CASCADE', onupdate='CASCADE'))


# Model for equipment table
class Equipment(BaseMixin, db.Model):
    id = db.Column('id', db.Integer, primary_key=True)
    name = db.Column('name', db.Text)
    plant = db.Column('plant', db.ForeignKey('plants.id', onupdate='CASCADE', ondelete="CASCADE"))
    section = db.Column('section', db.ForeignKey('sections.id', onupdate='CASCADE', ondelete="CASCADE"))


# Model for tags table
class Tags(BaseMixin, db.Model):
    id = db.Column('id', db.Integer, primary_key=True)
    plant = db.Column('plant', db.ForeignKey('plants.id', ondelete='CASCADE', onupdate="CASCADE"))
    section = db.Column('section', db.ForeignKey('sections.id', ondelete='CASCADE', onupdate="CASCADE"))
    equipment = db.Column('equipment', db.ForeignKey('equipment.id', onupdate='CASCADE', ondelete="CASCADE"))
    name = db.Column('name', db.Text)
    upper_bound = db.Column('upper_bound', db.Float)
    lower_bound = db.Column('lower_bound', db.Float)
    units = db.Column('units', db.Text)

    @staticmethod
    def create_multiple(lst):
        for plant, tag_name in lst:
            Tags.create(name=tag_name, plant=plant)

    @staticmethod
    def get_unassigned_tags(**kwargs):
        tags = Tags.query.with_entities(Tags.id, Tags.name).filter_by(section=None, **kwargs).all()
        return [(str(_id), _name) for _id, _name in tags]

    @staticmethod
    def assign_tag_sections(section, tags):
        for tag in tags:
            Tags.query.filter_by(id=tag).update(dict(section=section))
            db.session.commit()


# Model for measurement data table
class MeasurementData(db.Model):
    data_id = db.Column('id', db.Integer, primary_key=True)
    timestamp = db.Column('timestamp', db.Text)
    tag = db.Column('tag', db.ForeignKey('tags.id', ondelete="CASCADE", onupdate="CASCADE"))
    tag_value = db.Column('tag_value', db.Float)

    @staticmethod
    def write_data_to_db(file_name, plant_name, open, upload):
        # using global variable for rollback of data
        global plant_id
        plant_id = None

        try:
            time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')

            # adding plant name
            Plants.create(name=plant_name, opened=open, uploaded=upload, time=time)

            # Finding default plant id
            plant_id = Plants.query.with_entities(Plants.id).filter_by(name=plant_name).first()

            # handling csv file
            df = pd.read_csv(file_name)
            df = pd.melt(df, id_vars=df.columns.values[0])
            df.columns = ['timestamp', 'tag', 'tag_value']
            df_tags = np.unique(df['tag'].values)

            tags_commit = [(plant_id[0], tag,) for tag in df_tags]

            # adding new tags to data base
            Tags.create_multiple(tags_commit)

            # creating tagmap from tags in tags table
            tag_map = dict(Tags.query.with_entities(Tags.name, Tags.id).all())

            # normalizing dataframe tag_id with tag_ids from tags table
            df.tag = [tag_map[key] for key in df['tag'].values]

            # adding data to tag_data table
            df.to_sql('measurement_data', db.engine, if_exists='append', index=False)

        except (IntegrityError, KeyError):
            # TODO: Add method of letting user know the write has failed
            db.session.rollback()
            Plants.delete(id=plant_id)

    @staticmethod
    def get_tag_data(**kwargs):

        return MeasurementData.query.with_entities(MeasurementData.timestamp, MeasurementData.tag_value).\
                filter_by(**kwargs).all()

    @staticmethod
    def get_tag_data_in(ids):
        return db_session.query(MeasurementData).with_entities(MeasurementData.timestamp, MeasurementData.tag_value,
                                                              MeasurementData.tag).filter(MeasurementData.tag.in_(
                                                                ids)).all()
