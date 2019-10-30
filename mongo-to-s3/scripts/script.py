import sys
import datetime
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.dynamicframe import DynamicFrame
from awsglue.job import Job
 
args = getResolvedOptions(sys.argv, ['JOB_NAME'])
jdbc_url = "jdbc:mongodb:RTK=RTK_REPLACE;Server=SERVER_REPLACE;User=USER_REPLACE;Password=PASSWORD_REPLACE;Port=PORT_REPLACE;Use SSL=USE_SSL_REPLACE;Database=DATABASE_REPLACE;"
 
sparkContext = SparkContext()
glueContext = GlueContext(sparkContext)
sparkSession = glueContext.spark_session

glueJob = Job(glueContext)
glueJob.init(args['JOB_NAME'], args)

collections_input = "COLLECTIONS_REPLACE"
collections = collections_input.split(",")
dfs = []

# Loop over each collection read the collection and push it to dataframes list
for collection in collections:
    source_df = sparkSession.read.format("jdbc").option("url",jdbc_url).option("dbtable",collection).option("driver","cdata.jdbc.mongodb.MongoDBDriver").load()
    dynamic_dframe = DynamicFrame.fromDF(source_df, glueContext, "dynamic_df_{}".format(collection))
    dfs.append({"dynamic_frame": dynamic_dframe, "collection": collection})

# Write dataframes to s3
for df in dfs:
    glueContext.write_dynamic_frame.from_options(frame = df["dynamic_frame"], connection_type = "s3", connection_options = {"path": "TARGET_BUCKET{}".format(df["collection"])}, format = "csv", transformation_ctx = "datasink4")

glueJob.commit()