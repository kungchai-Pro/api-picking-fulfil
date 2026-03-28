const conn = require("../config/config_mysql");
class DepartMentController {

    GetDepartMentAll(req, res) {
        var selectall = `Select*from departments`
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

// position table 

GetPositionList(req, res) {
    var selectall = `Select*from positions`
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

}

module.exports = new DepartMentController();