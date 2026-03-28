// fetch.js
const axios = require('axios');

async function fetchOnlineData() {
  const res = await axios.get('https://www.pppi-fulfil.com/services/erp/api/v1/erpstorecall/getOnlineJournal');
  console.log('Fetched', res.data.listall.length, 'records');
    return res.data.listall.map(d => ({
            SaleSOlineId: d.SALESONLINEID,
            TransDate: d.TRANSDATE,
            SaleChannel: d.SALESCHANNEL,
            CustAccount: d.CUSTACCOUNT,
            CustName: d.CUSTNAME,
            Description: d.DESCRIPTION,
            TotalOrder: d.TOTALORDER,
            Create_date: datenow()
    }));
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

module.exports = fetchOnlineData;