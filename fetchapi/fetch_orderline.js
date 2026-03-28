// fetch.js
const axios = require('axios');

async function fetchLine() {
  const res = await axios.get('https://www.pppi-fulfil.com/services/erp/api/v1/erpstorecall/getOrderLine');
  console.log('Fetched', res.data.listall.length, 'records');
    return res.data.listall.map(d => ({
    OrderlineId: d.ORDERLINEID,
    SaleOnlineId: d.SALESONLINEID,
    OrderNumber: d.ORDERNUMBER,
    ItemOnlineSKU: d.ITEMONLINESKU,
    ItemId: d.ITEMID,
    ItemName: d.ITEMNAME,
    OrderQty: d.SALEQTY,
    ScanQty: 0,
    Barcode: d.BARCODE,
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

module.exports = fetchLine;