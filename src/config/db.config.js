module.exports={
                  "test":{
                      "dialect": "sqlite",
                      "storage": ":memory:",
                      "logging":false
                    },
                  "default":{
                      "database": process.env.DB_NAME,
                      "username": process.env.DB_USER,
                      "password": process.env.DB_PASSWORD,
                      "host": process.env.DB_HOST,
                      "dialect": "mysql",
                      "logging": false
                      }
              }