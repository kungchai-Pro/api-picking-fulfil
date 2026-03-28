const mysql=require('mysql2')

// Create the connection to database 106024 16:56
// const pool = mysql.createPool({
//   host: '27.254.142.110',
//   user: 'root',
//   password: 'adminmysql',//adminmysql
//   database: 'khonkean_db',
//   waitForConnections: true,
//   connectionLimit: 10,
//   maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
//   idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
//   queueLimit: 0,
//   enableKeepAlive: true,
//   keepAliveInitialDelay: 0
// });
// module.exports = pool; 


const pool = mysql.createPool({
  host: '27.254.142.110',
  user: 'root',
  password: 'adminmysql',//adminmysql
  database: 'khonkean_db',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
module.exports = pool; 