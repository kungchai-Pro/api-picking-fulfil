var express = require('express');
var router = express.Router();
var OrderHeadController = require('../controller/getOrderHead.controller');
// journal list
router.get('/v1/OnlineJournal/pk-getOnlinejournalAll',OrderHeadController.Pk_getOnlinejournalAll);
router.get('/v1/OnlineJournal/pk-getOnlinejournalBysaleorder/:saleOnlineId',OrderHeadController.pk_getOnlinejournalBysaleorder);
router.get('/v1/OnlineJournal/pk-getOnlinejournalBydate/:getdate',OrderHeadController.Pk_getByDate_Onlinejournal);
router.get('/v1/OnlineJournal/pk-getAll',OrderHeadController.Pk_getAll_Onlinejournal);
router.get('/v1/OnlineJournal/pk-getComplete',OrderHeadController.Pk_getComplete_Onlinejournal);
router.get('/v1/OnlineJournal/pk-getNotComplete',OrderHeadController.Pk_getNotComplete_Onlinejournal);
router.get('/v1/OnlineJournal/pk-getCompleteStatus/:jourId',OrderHeadController.Pk_getCompleteStatus); //update status complete pick order

//upload journal all
router.get('/v1/OnlineJournal/pk-uploadOnlinejournalAll',OrderHeadController.Pk_CreateOnlinejournal);

//header order 
router.get('/v1/OnlineJournal/pk-getOrderheadAll',OrderHeadController.Pk_getOrderheadAll);
router.get('/v1/OnlineJournal/pk-getorderheadBysaleorder/:saleOnlineId',OrderHeadController.pk_getorderheadBysaleorder);
//upload header journal
router.get('/v1/OnlineJournal/pk-uploadheaderAll',OrderHeadController.getHeadjournal);

router.post('/v1/OnlineJournal/pk-getorderheadByordernumber',OrderHeadController.pk_getorderheadByOrderNumber);
router.post('/v1/OnlineJournal/pk-createOrderhead',OrderHeadController.Pk_CreateOrderhead);
router.put('/v1/OnlineJournal/pk-updateOrderheadById/:Id',OrderHeadController.pk_updateOrderhead);

// orderline
router.get('/v1/OnlineJournal/pk-getOrderlineAll',OrderHeadController.Pk_getOrderlineAll);
router.get('/v1/OnlineJournal/pk-getOrderlineBysaleorder/:saleOnlineId',OrderHeadController.pk_getOrderlineBysaleorder);
router.get('/v1/OnlineJournal/pk-getOrderlineByOrderNumber/:orderNumber',OrderHeadController.pk_getOrderlineByOrderNumber);
//upload orderline
router.get('/v1/OnlineJournal/pk-updateOrderlineAll',OrderHeadController.getGetOrderLine);

router.post('/v1/OnlineJournal/pk-CreateOrderline',OrderHeadController.Pk_CreateOrderline);
router.put('/v1/OnlineJournal/pk-updateLineOrderByid/:Id',OrderHeadController.pk_updateLineOrderByid)

// invent
router.get('/v1/OnlineJournal/pk-getinventAll',OrderHeadController.Pk_getinventtableAll);
router.get('/v1/OnlineJournal/pk-getinventById/:Id',OrderHeadController.pk_getinvertByid);
router.get('/v1/OnlineJournal/pk-getinverttableBysaleorder',OrderHeadController.pk_getinverttableBysaleorder);
router.post('/v1/OnlineJournal/pk-createinventtable',OrderHeadController.Pk_Createinventtable);
router.put('/v1/OnlineJournal/pk-InventImageById/:Id',OrderHeadController.pk_InventImageById);
router.put('/v1/OnlineJournal/pk-UpdateInventById/:Id',OrderHeadController.pk_UpdateInventById);

//confirm orderline
router.post('/v1/OnlineJournal/pk-confirmOrderline',OrderHeadController.Pk_CreateConfirmOrderline); 
router.post('/v1/OnlineJournal/pk-getcomfirmBydate',OrderHeadController.Pk_getComfirmBydate); //หน้ารายงาน  excel
router.post('/v1/OnlineJournal/Pk_getorderlineBydateload',OrderHeadController.Pk_getOrderlineBydateload);//หน้ารายงาน  excel
router.post('/v1/OnlineJournal/pk_getOrderlineByinvoicdate',OrderHeadController.Pk_getOrderlineByInVoicdate);//หน้ารายงาน  excel

router.delete('/v1/OnlineJournal/pk-removeall/:id',OrderHeadController.removejournalAll); // ลบข้อมูลทั้งหมด

// router.post('/v1/erpstorecall/getOrderLine',erpstorecallController.Pk_GetOrderLine);

module.exports = router;