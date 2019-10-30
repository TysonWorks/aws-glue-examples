# Automated Mongo ETL Examples using AWS CDK

## Mongo To S3 Example
For the environment variables, create a `.env` folder inside `mongo-to-s3` folder. 
Replace following values in .env file
```
RTK=""
MONGO_SERVER=""
MONGO_USER=""
MONGO_PASSWORD=""
MONGO_PORT=""
MONGO_SSL=""
MONGO_DATABASE=""
COLLECTIONS="MyCollection,SecondCollection,ThirdCollection
BUCKET_NAME="my-etl-bucket"
AWS_REGION=us-west-2
ACCOUNT_ID=""
```

Deploy using CDK CLI

`cdk deploy --profile your_profile`

