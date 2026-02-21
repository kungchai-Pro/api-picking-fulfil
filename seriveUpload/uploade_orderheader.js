var connection = require('../config/config_mysql');

async function uplade_orderHeader(values) {

  try {
    var selectheader = `SELECT COUNT(OrderNumber)as countnumber FROM orderhead WHERE OrderNumber='${values.ORDERNUMBER}'`;
    connection.query(selectheader, function (err, results, fields) {
      if (err) {
        console.log(err)
      }
      if (results) {

        if (results[0].countnumber == 0) {
          insertHearder(values)
          //  console.log(values);
        }

      }
    });
  } catch (err) { console.log(err) }

}

function insertHearder(values) {

  var today = datenow();
  const { SALESONLINEID,INVOICEDATE,ORDERNUMBER, BILLINGNAME, BILLINGADDRESS, TELEPHONE, TOTALQTY } = values

  try {

    var InsertTable = `INSERT IGNORE INTO orderhead(saleOnlineId, orderNumber, orderDate, 
      BillingName, BillingAddress, Telephone, TotalQty, ScanQty, ImageBox,StatusPacking,Userconfirm,Invoicedate,Create_date) 
  VALUES 
  ('${SALESONLINEID}', '${ORDERNUMBER}', '','${BILLINGNAME}', '${BILLINGADDRESS}', '${TELEPHONE}', '${TOTALQTY}', '', '','','','${INVOICEDATE}','${today}') 
  ON DUPLICATE KEY UPDATE orderNumber='${ORDERNUMBER}'`;

    connection.query(InsertTable, function (err, results, fields) {
      if (err) {
        console.log(err)
      }
      if (results) {
        console.log('update load orderheader successfully')
        // console.log(results.insertId);
      }
    });
  } catch (err) { console.log(err) }

}

function uplade_orderLine(values) {

  const { SALESONLINEID, ORDERNUMBER, ITEMONLINESKU, ITEMID, ITEMNAME, SALEQTY, BARCODE } = values;
  try {
    let dataidlist = `select count(orderline.OrderNumber)as countItem,OrderNumber from orderline
  where orderline.OrderNumber='${ORDERNUMBER}'and orderline.ItemId='${ITEMID}'and itemName='${ITEMNAME}';`

    connection.query(dataidlist, function (err, results, fields) {
      if (err) {
        console.log(err)
      }
      if (results) {

        if (results[0].countItem == 0) {
          insertOrderline(values)
        }

        // console.log('update load orderline successfully')

      }
    });
  } catch (err) { console.log(err) }

}

function insertOrderline(values) {

  var today = datenow();
  try {
    const { SALESONLINEID, ORDERNUMBER, ITEMONLINESKU, ITEMID, ITEMNAME, SALEQTY, BARCODE } = values;
    var InsertTable = `INSERT INTO orderline(SaleOnlineId, OrderNumber, ItemOnlineSKU,ItemId, ItemName, OrderQty, ScanQty,Barcode,Create_date) 
  VALUES 
  ('${SALESONLINEID}', '${ORDERNUMBER}', '${ITEMONLINESKU}','${ITEMID}', '${ITEMNAME}', '${SALEQTY}',0,'${BARCODE}','${today}')`;

    connection.query(InsertTable, function (err, results, fields) {
      if (err) {
        console.log(err)
      }
      if (results) {

        // console.log('update load orderline successfully')

      }
    });
  } catch (err) { console.log(err) }

}

function uplade_Inventtable(ITEMID, ITEMNAME, BARCODE) {
  try {
    var InsertTable = `INSERT INTO inventtable(ItemId, ItemName, Barcode, Image) 
    VALUES 
    ('${ITEMID}','${ITEMNAME}','${BARCODE}','')`;

    connection.query(InsertTable, function (err, results, fields) {
      if (err) {
        console.log(err)
      }
      if (results) {
        res.send(results);
      }
    });
  } catch (err) { console.log(err) }
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


module.exports = { uplade_orderHeader, uplade_orderLine, uplade_Inventtable }