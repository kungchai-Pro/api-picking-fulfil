
var connection = require('../config/config_mysql');
var db = require('../config/confing_sql2');
var { uplade_orderHeader, uplade_orderLine, uplade_Inventtable } = require('../seriveUpload/uploade_orderheader');
const fetchOnlineJournal = require('../fetchapi/fetch_onlineJournal'); // ดึงข้อมูล journal online
const fetchHeaderData = require('../fetchapi/fetch_header'); // ดึงข้อมูล order header
const fetchLine = require('../fetchapi/fetch_orderline'); // ดึงข้อมูล order line

const pLimit = require('p-limit');
const limit = pLimit(5);


const axios = require('axios');
// journal line
const urlcall = {
    user_erp: "https://www.pppi-fulfil.com/services/erp/api/v1/erpstorecall/",
    //  user_erp: "http://192.168.1.241:5002/api/v1/erpstorecall/",
}

function chunkArray(data, size = 1000) {
    const result = [];
    for (let i = 0; i < data.length; i += size) {
        result.push(data.slice(i, i + size));
    }
    return result;
}

const Pk_CreateOnlinejournal = async (req, res) => {
    let onlineJournal = await fetchOnlineJournal();

    async function insertJournalorder(chunkjournal) {
        const values = chunkjournal.map(d => [d.SaleSOlineId, d.TransDate, d.SaleChannel, d.CustAccount, d.CustName, d.Description, d.TotalOrder, d.Create_date]);
        await db.query(`INSERT INTO onlinejournal (SaleSOlineId, TransDate, SaleChannel, CustAccount, CustName, Description, TotalOrder, Create_date)
    VALUES ?  ON DUPLICATE KEY UPDATE SaleSOlineId = VALUES(SaleSOlineId)
  `, [values]);

    }

    console.log('Chunking...');
    const chunksonlineJournal = chunkArray(onlineJournal, 1000);

    await Promise.all(
        chunksonlineJournal.map(chunk => limit(() => insertJournalorder(chunk)))
    );

    console.log('DONE Journal ');
    res.json({ status: 200, error: false, statusload: 1, totalall: onlineJournal.length, message: "upload journal successfull" })

}

//upload head order 
const getHeadjournal = async (req, res) => {
    let headerData = await fetchHeaderData();//   ดึงข้อมูล order header

    async function insertHeader(datahead) {
        const values = datahead.map(d => [d.SaleOnlineId, d.OrderNumber, d.OrderDate, d.BillingName, d.BillingAddress, d.Telephone, d.TotalQty, d.ScanQty, d.ImageBox, d.StatusPacking, d.Userconfirm, d.Invoicedate, d.Create_date]);
        await db.query(`
    INSERT INTO orderhead (SaleOnlineId, OrderNumber, OrderDate, BillingName, BillingAddress,Telephone,TotalQty, ScanQty,ImageBox,StatusPacking,Userconfirm,Invoicedate,Create_date)
    VALUES ?  ON DUPLICATE KEY UPDATE SaleOnlineId = VALUES(SaleOnlineId)
  `, [values]);

    }

    const chunksheaderData = chunkArray(headerData, 1000);
    console.log('Chunking...');

    await Promise.all(
        chunksheaderData.map(chunk => limit(() => insertHeader(chunk)))
    );

    console.log('DONE HEADER ');
    res.json({ status: 200, error: false, statusload: 1, totalall: headerData.length, message: "upload header successfull" })

}

// upload line order
const getGetOrderLine = async (req, res) => {

    let dataLine = await fetchLine();

    async function insertlineOrder(params) {

        const values = params.map(d => [d.SaleOnlineId, d.OrderNumber, d.ItemOnlineSKU, d.ItemId, d.ItemName, d.OrderQty, d.ScanQty, d.Barcode, d.Create_date]);
        const valuesitem = params.map(d => [d.ItemId, d.ItemName, d.Barcode, '']);

        let [result] = await db.query(`select * from orderline where ScanQty > 0 AND OrderNumber in (${values.map(v => `'${v[1]}'`).join(',')})`)
    
        await db.query(`delete from orderline where OrderNumber in (${values.map(v => `'${v[1]}'`).join(',')})`)

        //OrderlineId
        await db.query(`INSERT INTO orderline(SaleOnlineId, OrderNumber, ItemOnlineSKU,ItemId, ItemName, OrderQty, ScanQty,Barcode,Create_date)
         VALUES ? ON DUPLICATE KEY UPDATE OrderlineId=IF(ScanQty = VALUES(OrderQty),VALUES(OrderlineId),OrderlineId)`, [values]);

        await db.query(`INSERT INTO inventtable(ItemId, ItemName, Barcode, Image) VALUES ?  ON DUPLICATE KEY UPDATE ItemId=VALUES(ItemId)`, [valuesitem]);
        
       await result.forEach(e => {
            db.query(`UPDATE  orderline SET ScanQty='${e.ScanQty}' where SaleOnlineId='${e.SaleOnlineId}' 
                and OrderNumber='${e.OrderNumber}' and ItemOnlineSKU='${e.ItemOnlineSKU}' and ItemId='${e.ItemId}' 
                and OrderQty=${e.OrderQty} and Barcode='${e.Barcode}'`)
        });
 
    }

    const chunksLine = chunkArray(dataLine, 1000);

    await Promise.all(
        chunksLine.map(chunk => limit(() => insertlineOrder(chunk)))
    );

    console.log('DONE LINE ORDER ✅');
    res.json({ status: 200, error: false, statusload: 1, totalall: dataLine.length, message: "upload orderline successfull" })

}



const Pk_getOnlinejournalAll = (req, res) => {
    try {
        var selectTable = `SELECT *,
    (select sum(orderhead.StatusPacking) 
    FROM orderhead WHERE orderhead.SaleOnlineId=onlinejournal.SaleSOlineId ) as complete  
    FROM onlinejournal;`

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }
        });
    } catch (err) { console.log(err) }

}

const pk_getOnlinejournalBysaleorder = (req, res) => {
    const { saleOnlineId } = req.params
    try {
        var selectTable = `SELECT *,
    (select sum(orderhead.StatusPacking)from orderhead 
    where 
        orderhead.SaleOnlineId=onlinejournal.SaleSOlineId)as countStatus
    FROM onlinejournal where SaleSOlineId='${saleOnlineId}'`

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }
        });
    } catch (err) { console.log(err) }
}

//ค้นหาข้อมูลแบบ กำหนดวันที่
const Pk_getByDate_Onlinejournal = (req, res) => {
    const { getdate } = req.params
    try {
        var selectTable = `SELECT *,
    (select sum(orderhead.StatusPacking) 
    FROM orderhead WHERE orderhead.SaleOnlineId=onlinejournal.SaleSOlineId ) as complete  
    FROM onlinejournal WHERE Create_date='${getdate}' ;`

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }
        });
    } catch (err) { console.log(err) }

}

const Pk_getComplete_Onlinejournal = (req, res) => {
    const { getdate } = req.params
    try {
        var selectTable = `SELECT *
    from (SELECT *,
        (select sum(orderhead.StatusPacking) 
        FROM orderhead WHERE orderhead.SaleOnlineId=onlinejournal.SaleSOlineId ) as complete  
        FROM onlinejournal)as D WHERE Create_date='${getdate}' and (D.complete-D.TotalOrder)=0 order by D.SaleSOlineId DESC;`

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }
        });
    } catch (err) { console.log(err) }

}

const Pk_getNotComplete_Onlinejournal = (req, res) => {
    const { getdate } = req.params
    try {
        var selectTable = `SELECT *
    from (SELECT *,
        (select sum(orderhead.StatusPacking) 
        FROM orderhead WHERE orderhead.SaleOnlineId=onlinejournal.SaleSOlineId ) as complete  
        FROM onlinejournal)as D WHERE Create_date='${getdate}' and (D.complete-D.TotalOrder)!=0 order by D.SaleSOlineId DESC;`

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }
        });
    } catch (err) { console.log(err) }
}

const Pk_getCompleteStatus = (req, res) => {

    const { jourId } = req.params;
    console.log(jourId)
    try {
        var saleOrderId = `SELECT *
    from (SELECT *,
        (select sum(orderhead.StatusPacking)
        FROM orderhead 
         	WHERE 
        orderhead.SaleOnlineId=onlinejournal.SaleSOlineId ) as complete  
        FROM onlinejournal)as D WHERE D.SaleSOlineId='${jourId}' AND (D.complete-D.TotalOrder)=0`
        connection.query(saleOrderId, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                gerUpdateStatusErp(jourId);
                res.json({ status: 200, error: false, data: results })

            } else {
                res.json({ status: 200, error: false, data: [] })
            }
        });

    } catch (err) { console.log(err) }

    function gerUpdateStatusErp(jourId) {

        axios.get(urlcall.user_erp + `updateStatusErp/${jourId}`)
            .then(function (response) {
                if (response.data.success = true) {
                    if (response.data.statuscomplete == true) {

                        console.log(response.data.messages);
                    }
                    else {
                        console.log(response.data.messages);
                    }

                }
            }).catch(err => { console.log(err) })
    }
}


const Pk_getAll_Onlinejournal = (req, res) => {
    const { getdate } = req.params
    try {
        var selectTable = `SELECT *,
    (select sum(orderhead.StatusPacking)FROM orderhead WHERE orderhead.SaleOnlineId=onlinejournal.SaleSOlineId ) as complete  
    FROM onlinejournal  WHERE Create_date='${getdate}' order by onlinejournal.SaleSOlineId DESC LIMIT 5000;`

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }
        });
    } catch (err) { console.log(err) }
}


//  Pk_GetOrderHead --->
const Pk_CreateOrderhead = (req, res) => {
    const { saleOnlineId, orderNumber, orderDate, BillingName, BillingAddress, Telephone, TotalQty, ScanQty, ImageBox, StatusPacking, Userconfirm } = req.body
    try {
        var InsertTable = `INSERT INTO orderhead(saleOnlineId, orderNumber, orderDate, 
        BillingName, BillingAddress, Telephone, TotalQty, ScanQty, ImageBox,StatusPacking,Userconfirm) 
    VALUES 
    ('${saleOnlineId}', '${orderNumber}', '${orderDate}', 
        '${BillingName}', '${BillingAddress}', '${Telephone}', '${TotalQty}', '${ScanQty}', '${ImageBox}','${StatusPacking}','${Userconfirm}')`;

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

// update order header 
const pk_updateOrderhead = (req, res) => {
    const { ScanQty, ImageBox, StatusPacking, Userconfirm } = req.body;
    const { Id } = req.params
    try {
        var updateOrderhead = `UPDATE orderhead SET ScanQty=${ScanQty},ImageBox='${ImageBox}',
    StatusPacking='${StatusPacking}',Userconfirm='${Userconfirm}' 
    WHERE OrderheadId=${Id}`;

        connection.query(updateOrderhead, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                res.send(results);
            }
        });
    } catch (err) { console.log(err) }
}


const Pk_getOrderheadAll = (req, res) => {
    try {
        var selectTable = 'SELECT * FROM orderhead;'
        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }
        });
    } catch (err) { console.log(err) }

}

const pk_getorderheadBysaleorder = (req, res) => {
    const { saleOnlineId } = req.params
    try {
        var selectTable = `SELECT * FROM orderhead where SaleOnlineId='${saleOnlineId}'`

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }
        });
    } catch (err) { console.log(err) }
}

const pk_getorderheadByOrderNumber = (req, res) => {
    const { orderNumber } = req.body
    try {
        var selectTable = `SELECT * FROM orderhead where OrderNumber='${orderNumber}'`

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }

        });
    } catch (err) { console.log(err) }
}

// orderline --->

const Pk_CreateOrderline = (req, res) => {
    const { SaleOnlineId, OrderNumber, ItemOnlineSKU, ItemId, ItemName, OrderQty, ScanQty, Barcode } = req.body
    try {
        var InsertTable = `INSERT INTO orderline(SaleOnlineId, OrderNumber, ItemOnlineSKU,ItemId, ItemName, OrderQty, ScanQty,Barcode) 
    VALUES 
    ('${SaleOnlineId}', '${OrderNumber}', '${ItemOnlineSKU}','${ItemId}', '${ItemName}', '${OrderQty}','${ScanQty}','${Barcode}')`;

        connection.query(InsertTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                res.send(results);
            }
        });
    } catch (err) { console.logI(err) }
}

const Pk_getOrderlineAll = (req, res) => {
    try {
        var selectTable = 'SELECT * FROM orderline;'

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }
        });
    } catch (err) { console.log(err) }

}

const pk_getOrderlineBysaleorder = (req, res) => {
    const { saleOnlineId } = req.params;
    try {
        var selectTable = `SELECT * FROM orderline where saleOnlineId='${saleOnlineId}'`

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {
                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }

        });
    } catch (err) { console.log(err) }

}


const pk_getOrderlineByOrderNumber = (req, res) => {

    const { orderNumber } = req.params
    try {
        var selectTable = `
        SELECT 
        ol.OrderlineId,
        ol.SaleOnlineId,
        ol.OrderNumber,
        ol.ItemOnlineSKU,ol.ItemId,
        ol.ItemName,
        ol.OrderQty,
        ol.ScanQty,
        (SELECT inventtable.Barcode FROM inventtable WHERE inventtable.ItemId=ol.ItemId LIMIT 1) as Barcode,
       (SELECT Image from inventtable iv WHERE iv.ItemId=ol.ItemId LIMIT 1) as Image,
        (SELECT cf.Datecreate 
            from confirmorderline cf 
         WHERE cf.OrderNumber=ol.OrderNumber 
         order by cf.Datecreate DESC LIMIT 1)as scandate
	FROM 
        orderline ol 
    	where ol.OrderNumber='${orderNumber}'`;

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results.length > 0) {

                res.json({ status: 200, error: false, data: results })
            } else {
                res.json({ status: 200, error: false, data: [] })
            }

        });
    } catch (err) { console.log(err) }

}


//update line by id
const pk_updateLineOrderByid = (req, res) => {
    const { ScanQty } = req.body;
    const { Id } = req.params;
    try {
        var update = `UPDATE orderline SET ScanQty=${ScanQty} WHERE OrderlineId=${Id}`;

        connection.query(update, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                res.send(results);

            }
        });
    } catch (err) { console.log(err) }
}

// invernttable --->
const Pk_Createinventtable = async (req, res) => {

    await axios.get(urlcall.user_erp + `getIventItemline`)
        .then(function (response) {

            if (response.data.success = true) {
                let dataorderline = response.data.listall;
                for (let index = 0; index < dataorderline.length; index++) {
                    const inventlistall = dataorderline[index];

                    CheckInventTo(inventlistall)

                }

                res.json({ status: 200, error: false, data: response.data.listall })
            }

        })
        .catch(function (error) {
            console.log(error);
        })



    function CheckInventTo(data) {
        try {
            var select = `SELECT  count(ItemId)as countItem FROM khonkean_db.inventtable where ItemId='${data.ITEMID}'`;

            connection.query(select, function (err, results, fields) {
                if (err) {
                    console.log(err)
                }
                if (results) {
                    if (results[0].countItem == 0) {
                        insertInventList(data.ITEMID, data.ItemName, data.BARCODE)
                    } else {
                        // console.log(results)
                    }
                }
            });
        } catch (err) { console.log(err) }
    }

    function insertInventList(ItemId, ItemName, Barcode) {

        try {
            var InsertTable = `INSERT INTO inventtable(ItemId, ItemName, Barcode, Image) VALUES 
    ('${ItemId}','${ItemName}','${Barcode}','')`;

            connection.query(InsertTable, function (err, results, fields) {
                if (err) {
                    console.log(err)
                }
            });
        } catch (err) { console.log(err) }

    }
}


const Pk_getinventtableAll = (req, res) => {
    try {

        var selectTable = 'SELECT * FROM khonkean_db.inventtable order by inventtable.InventId DESC;'

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                res.json({ status: 200, error: false, data: results })
            }
        });

    } catch (err) {
        console.log(err);
    }

}


const pk_getinverttableBysaleorder = (req, res) => {

    const { saleOnlineId } = req.params
    try {
        var selectTable = `SELECT * FROM inventtable where saleOnlineId='${saleOnlineId}'`

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                res.json({ status: 200, error: false, data: results })
            }
        });

    } catch (err) {
        console.log(err)
    }
}


const pk_getinvertByid = (req, res) => {

    const { Id } = req.params
    try {
        var selectTable = `SELECT * FROM inventtable where InventId='${Id}'`

        connection.query(selectTable, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                res.json({ status: 200, error: false, data: results })
            }
        });

    } catch (err) {
        console.log(err)
    }
}

const pk_InventImageById = (req, res) => {

    const { namefile } = req.body;
    const { Id } = req.params
    try {
        const updates = `UPDATE inventtable SET Image='${namefile}' WHERE inventtable.InventId=${Id}`;
        connection.query(updates, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                res.json({ status: 200, error: false, data: results })
            }
        });
    }
    catch (err) {
        console.log(err)
    }
}

// update invernt by id 
const pk_UpdateInventById = (req, res) => {

    const { ItemName, Barcode } = req.body;
    const { Id } = req.params
    try {
        const updates = `UPDATE inventtable SET ItemName='${ItemName}',Barcode='${Barcode}' WHERE inventtable.InventId=${Id}`;
        connection.query(updates, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                res.json({ status: 200, error: false, data: results })
            }
        });
    }
    catch (err) {
        console.log(err)
    }
}



// confirm order all

const Pk_CreateConfirmOrderline = (req, res) => {
    var today = datenow();

    const { SaleOnlineId, OrderNumber, ItemOnlineSKU, ItemId, ItemName, OrderQty, ScanQty, Barcode, Userconfirm } = req.body
    try {

        var getorder = `SELECT count(ItemId)as countItem FROM khonkean_db.confirmorderline 
    where OrderNumber='${OrderNumber}' and ItemId='${ItemId}'`;
        connection.query(getorder, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                if (results[0].countItem == 0) {
                    insertConfirmOrder(SaleOnlineId, OrderNumber, ItemOnlineSKU,
                        ItemId, ItemName, OrderQty, ScanQty, Barcode, Userconfirm)
                }
            }
        });

    } catch (err) { console.log(err) }


    function insertConfirmOrder(SaleOnlineId, OrderNumber, ItemOnlineSKU, ItemId, ItemName, OrderQty, ScanQty, Barcode, Userconfirm) {

        try {
            var InsertTable = `INSERT INTO confirmorderline (SaleOnlineId, OrderNumber, ItemOnlineSKU,ItemId, ItemName, OrderQty, ScanQty,Barcode,Userconfirm,Datecreate) 
    VALUES 
    ('${SaleOnlineId}', '${OrderNumber}', '${ItemOnlineSKU}','${ItemId}', '${ItemName}', '${OrderQty}','${ScanQty}','${Barcode}','${Userconfirm}','${today}')`;

            connection.query(InsertTable, function (err, results, fields) {
                if (err) {
                    console.log(err)
                }
                if (results) {
                    console.log('insert success' + OrderNumber);
                }
            });
        } catch (err) { console.log(err) }
    }
}

const Pk_getComfirmBydate = (req, res) => {
    const { sdate, edate } = req.body;
    try {
        var getsql = `SELECT 
onlinejournal.SaleSOlineId as SaleOrder,
DATE_FORMAT(orderhead.Invoicedate,'%d/%m/%Y') as Invoicedate,
DATE_FORMAT(onlinejournal.Create_date,'%d/%m/%Y') as DateLoad,
onlinejournal.SaleChannel as Channel,
onlinejournal.CustName as Name,
onlinejournal.Description ,
	orderhead.BillingName,
    orderhead.BillingAddress,
    orderhead.Telephone,
            orderline.OrderNumber as Tricking,
            orderline.ItemOnlineSKU, 
            orderline.ItemId, 
            orderline.ItemName, 
            orderline.OrderQty, 
            orderline.ScanQty, 
            orderline.Barcode,
            	(CASE WHEN confirmorderline.Userconfirm IS NULL
                 THEN '' ELSE confirmorderline.Userconfirm 
                 END)as UserPicking,
                (CASE WHEN confirmorderline.Datecreate IS NULL 
                 THEN '' ELSE DATE_FORMAT(confirmorderline.Datecreate,'%d/%m/%Y')  END )as DateScan 
    FROM orderline  
    		LEFT JOIN onlinejournal on onlinejournal.SaleSOlineId=orderline.SaleOnlineId
            LEFT JOIN orderhead on orderhead.OrderNumber=orderline.OrderNumber
            LEFT JOIN confirmorderline on confirmorderline.SaleOnlineId=orderline.OrderlineId 
    WHERE
    	confirmorderline.Datecreate BETWEEN '${sdate}' and '${edate}' order BY onlinejournal.SaleSOlineId ,orderhead.Invoicedate `;

        connection.query(getsql, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                res.json({ status: 200, error: false, data: results })
            }
        });
    } catch (err) { console.log(err) }

}



const Pk_getOrderlineBydateload = (req, res) => {
    const { sdate, edate } = req.body;
    try {
        var getsql = `SELECT 
onlinejournal.SaleSOlineId as SaleOrder,
DATE_FORMAT(orderhead.Invoicedate,'%d/%m/%Y') as Invoicedate,
DATE_FORMAT(onlinejournal.Create_date,'%d/%m/%Y') as DateLoad,
onlinejournal.SaleChannel as Channel,
onlinejournal.CustName as Name,
onlinejournal.Description ,
	orderhead.BillingName,
    orderhead.BillingAddress,
    orderhead.Telephone,
            orderline.OrderNumber as Tricking,
            orderline.ItemOnlineSKU, 
            orderline.ItemId, 
            orderline.ItemName, 
            orderline.OrderQty, 
            orderline.ScanQty, 
            orderline.Barcode,
            	(CASE WHEN confirmorderline.Userconfirm IS NULL
                 THEN '' ELSE confirmorderline.Userconfirm 
                 END)as UserPicking,
                (CASE WHEN confirmorderline.Datecreate IS NULL 
                 THEN '' ELSE DATE_FORMAT(confirmorderline.Datecreate,'%d/%m/%Y')  END )as DateScan 
    FROM orderline  
    		LEFT JOIN onlinejournal on onlinejournal.SaleSOlineId=orderline.SaleOnlineId
            LEFT JOIN orderhead on orderhead.OrderNumber=orderline.OrderNumber
            LEFT JOIN confirmorderline on confirmorderline.SaleOnlineId=orderline.OrderlineId 
    WHERE
    	orderline.Create_date BETWEEN '${sdate}' and '${edate}' order BY onlinejournal.SaleSOlineId ,orderhead.Invoicedate`;

        connection.query(getsql, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                res.json({ status: 200, error: false, data: results })
            }
        });
    } catch (err) { console.log(err) }

}

/// ----->

const Pk_getOrderlineByInVoicdate = (req, res) => {
    const { sdate, edate } = req.body;
    try {
        var getsql = `SELECT 
onlinejournal.SaleSOlineId as SaleOrder,
DATE_FORMAT(orderhead.Invoicedate,'%d/%m/%Y') as Invoicedate,
DATE_FORMAT(onlinejournal.Create_date,'%d/%m/%Y') as DateLoad,
onlinejournal.SaleChannel as Channel,
onlinejournal.CustName as Name,
onlinejournal.Description ,
	orderhead.BillingName,
    orderhead.BillingAddress,
    orderhead.Telephone,
            orderline.OrderNumber as Tricking,
            orderline.ItemOnlineSKU, 
            orderline.ItemId, 
            orderline.ItemName, 
            orderline.OrderQty, 
            orderline.ScanQty, 
            orderline.Barcode,
            	(CASE WHEN confirmorderline.Userconfirm IS NULL
                 THEN '' ELSE confirmorderline.Userconfirm 
                 END)as UserPicking,
                (CASE WHEN confirmorderline.Datecreate IS NULL 
                 THEN '' ELSE DATE_FORMAT(confirmorderline.Datecreate,'%d/%m/%Y') END )as DateScan 
    FROM orderline  
    		LEFT JOIN onlinejournal on onlinejournal.SaleSOlineId=orderline.SaleOnlineId
            LEFT JOIN orderhead on orderhead.OrderNumber=orderline.OrderNumber
            LEFT JOIN confirmorderline on confirmorderline.SaleOnlineId=orderline.OrderlineId
            WHERE orderhead.Invoicedate BETWEEN '${sdate}'AND'${edate}' order BY onlinejournal.SaleSOlineId ,orderhead.Invoicedate ;`;

        connection.query(getsql, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                res.json({ status: 200, error: false, data: results })
            }
        });
    } catch (err) { console.log(err) }

}


const removejournalAll = (req, res) => {

    const { id } = req.params;
    var journallist = `DELETE FROM onlinejournal WHERE onlinejournal.SaleSOlineId='${id}';`
    try {
        connection.query(journallist, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
            if (results) {
                // res.status(200)
                // console.log(results)
                journalheader(id)
                // res.json({ status: 200, error: false, data: results })
            }
        });

        function journalheader(idjournal) {
            var journalhead = `DELETE FROM orderhead WHERE orderhead.SaleOnlineId='${idjournal}'`;

            connection.query(journalhead, function (err, results, fields) {
                if (err) {
                    console.log(err)
                }
                if (results) {

                    journaldetail(idjournal)
                    // res.status(200)
                    // if(res.status(200)){

                    // }
                    // res.json({ status: 200, error: false, data: results })
                }
            });
        }

        function journaldetail(idjournal) {

            var journaldetail = `DELETE FROM orderline WHERE orderline.SaleOnlineId='${idjournal}'`;
            connection.query(journaldetail, function (err, results, fields) {
                if (err) {
                    console.log(err)
                }
                if (results) {
                    // res.status(200)
                    if (res.status(200)) {

                    }
                    res.json({ status: 200, error: false, messages: 'remvoe successfull' })
                }
            });

        }
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

module.exports = {
    Pk_CreateOnlinejournal, Pk_getOnlinejournalAll, pk_getOnlinejournalBysaleorder, Pk_getByDate_Onlinejournal,
    Pk_getComplete_Onlinejournal, Pk_getNotComplete_Onlinejournal, Pk_getAll_Onlinejournal,
    Pk_CreateOrderhead, Pk_getOrderheadAll, pk_getorderheadBysaleorder, pk_getorderheadByOrderNumber, pk_updateOrderhead, getHeadjournal,
    Pk_CreateOrderline, Pk_getOrderlineAll, pk_getOrderlineBysaleorder, pk_getOrderlineByOrderNumber, pk_updateLineOrderByid, getGetOrderLine,
    Pk_Createinventtable, Pk_getinventtableAll, pk_getinverttableBysaleorder, pk_InventImageById, Pk_getCompleteStatus,
    Pk_CreateConfirmOrderline, Pk_getComfirmBydate, Pk_getOrderlineBydateload, Pk_getOrderlineByInVoicdate,
    removejournalAll, pk_UpdateInventById, pk_getinvertByid
};