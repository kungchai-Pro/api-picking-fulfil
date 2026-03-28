const bcrypt = require("bcrypt");
const conn = require("../config/config_mysql");

const { issueToken } = require('../midbleware/auth');

class AccountController {
    createAccount(req, res) {
        const { name, username, password, employeeId, departmentId, positioncode, email, roles,menugroupId, isActive } = req.body;
        var getdate = datenow();

        var selectname = `select username from accountsystem where username='${username}'`
        conn.query(selectname, function (err, result, fields) {
            if (err) {
                console.log(err)
            }
            if (result.length > 0) {
                res.json({ status: 400, error: true, message: 'This name is already in use. ' })
            }
            else {
                bcrypt.hash(password, 10).then(function (hashedPassword) {

                    var insertData = `insert into accountsystem 
                    (name,username,password,employeeId,departmentId,positioncode,email,roles,menugroupId,isActive,createdate)
                         values ('${name}','${username}','${hashedPassword}','${employeeId}','${departmentId}','${positioncode}',
                         '${email}','${roles}','${menugroupId}','${isActive}','${getdate}')`;

                    conn.query(insertData, function (err, results, fields) {
                        if (err) {
                            console.log(err);
                            return res.status(400).json({ status: 400, error: true, message: "Error: Could not add user" });
                        }

                        if (res.status(200)) {

                            const data = { _id: results.insertId, name, username, password, employeeId, departmentId, email, roles, isActive, getdate };
                            const token = issueToken(data);

                            // กรณีที่ สร้าง menu list  
                            res.status(200).json({ status: 200, error: false, data, token });
                        }

                    }
                    );

                });
            }
        });

    }


    loginAccount(req, res) {
        const { username, password } = req.body;

        var queryuser = `select * from accountsystem where username='${username}'`;
        conn.query(queryuser, async function (err, results, fields) {
            if (err) {
                console.log(err);
                return res.status(400).json({ status: 400, message: "Error: Could not get user details" });
            }

            // No record found for the given emailId
            if (!results) {
                return res.status(401).json({ status: 401, message: "Incorrect Credentials" });
            }

            if (results.length > 0) {
                //User found
                const hashedPassword = results[0].password;
                let isPasswordCorrect;

                try {
                    isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
                    // console.log(isPasswordCorrect);
                } catch (errBcrypt) {
                    // console.log(errBcrypt);
                    return res.status(400).json({ status: 400, message: "Error: Could not get user password" });
                }

                // Wrong password given
                if (!isPasswordCorrect) {
                    return res.status(401).json({ status: 401, message: "Incorrect Credentials" });
                }

                //User authenticated
                const data = results;
                delete data[0].password;

                const token = issueToken(data);
                return res.status(200).json({ status: 200, error: false, data, token });
            }
            else {
                return res.status(400).json({ status: 400, error: true, data: [], token: '' });
            }

        });
    }

    accountProfileAll(req, res) {

        var selectall = `select *from accountsystem`
        conn.query(selectall, async function (err, results, fields) {

            if (err) {
                console.log(err);
                return res.status(400).json({ message: "Error: Could not get account profile" });
            }

            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            }
            else {
                res.json({ status: 200, error: false, data: results })
            }

        });
    }

    accounByDedicate(req, res) {
        const{emcode}=req.params;
        var selectall = `select *from accountsystem where  accountsystem.employeeId NOT IN("${emcode}")`
        conn.query(selectall, async function (err, results, fields) {

            if (err) {
                console.log(err);
                return res.status(400).json({ message: "Error: Could not get account profile" });
            }

            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            }
            else {
                res.json({ status: 200, error: false, data: results })
            }

        });
    }


    accountById(req, res) {
        const { Id } = req.params
        var selectall = `
        SELECT 
        *
    FROM 
    accountsystem 
    where 
    accountsystem.acId=${Id}`
        conn.query(selectall, async function (err, results, fields) {

            if (err) {
                console.log(err);
                return res.status(400).json({ message: "Error: Could not get account profile" });

            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            }
            else {
                res.json({ status: 200, error: false, data: results })
            }

        });

    }


    accountUpdateById(req, res) {
        const { id } = req.params;
        const { name, employeeId, departmentId,positioncode, email, roles,menugroupId,isActive } = req.body
       
        var update = `update accountsystem set 
        name='${name}',employeeId='${employeeId}',departmentId='${departmentId}',
        positioncode='${positioncode}',email='${email}',roles='${roles}',
        menugroupId='${menugroupId}',isActive='${isActive}' where acId=${id}`

        conn.query(update, async function (err, results, fields) {

            if (err) {
                console.log(err);
                return res.status(400).json({ message: "Error: Could not update account detail" });

            }
            if (results.affectedRows == 1) {
                res.json({ status: 200, error: false, message: 'update account successfully' })
            }
            else {
                res.json({ status: 400, error: true, message: 'update account failed' })
            }

        });
    }

    changePassword(req, res) {
        const { id } = req.params;
        const { username, password } = req.body

        bcrypt.hash(password, 10).then(function (hashedPassword) {

            var updatepass = `update accountsystem set username='${username}',password='${hashedPassword}' where acId=${id}`
            conn.query(updatepass, async function (err, results, fields) {

                if (err) {
                    console.log(err);
                    return res.status(400).json({ message: "Error: Could not chage password " });
                }

                if (results.affectedRows == 1) {
                    res.json({ status: 200, error: false, message: 'update username and password successfully' })
                }
                else {
                    res.json({ status: 400, error: true, message: 'update username and password fialed' })
                }
            });
        });

    }


    deleteById(req, res) {

        const { Id } = req.params

        var deletes = `delete from accountsystem where acId=${Id}`;

        conn.query(deletes, async function (err, results, fields) {
            if (err) {
                console.log(err);
                return res.status(400).json({ message: "Error: Could not delete " });
            }

            if (results.affectedRows == 1) {
                res.json({ status: 200, error: false, message: 'delete account successfully' })
            }
            else {
                res.json({ status: 400, error: true, message: 'delete account fialed' })
            }
        });
    }

}


function datenow() {
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    if (date < 10) {
        date = "0" + date
    }
    if (month < 10) {
        month = "0" + month
    }

    // prints date & time in YYYY-MM-DD format
    let nowdate = year + "-" + month + "-" + date;
    return nowdate;
}

module.exports = new AccountController();