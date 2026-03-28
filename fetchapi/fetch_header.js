// fetch.js
const axios = require('axios');

async function fetchHeaderData() {
  const res = await axios.get('https://www.pppi-fulfil.com/services/erp/api/v1/erpstorecall/getOrderHead');
  console.log('Fetched', res.data.listall.length, 'records');
    return res.data.listall.map(d => ({
      SaleOnlineId: d.SALESONLINEID,
      OrderNumber: d.ORDERNUMBER,
      OrderDate: new Date(),
      BillingName: d.BILLINGNAME,
      BillingAddress: d.BILLINGADDRESS,
      Telephone: d.TELEPHONE,
      TotalQty: d.TOTALQTY,
      ScanQty: 0,
      ImageBox: '',
      StatusPacking: '',
      Userconfirm: '',
      Invoicedate: d.INVOICEDATE,
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

module.exports = fetchHeaderData;