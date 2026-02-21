var express = require('express');
var router = express.Router();
var Controllers = require('../controller/uploadefile.controller');

// จัดการ ไฟล์เพื่อทำการ  upload 
router.post('/v1/images/uploadfile',Controllers.uploadFile);
router.post('/v1/images/webcamuploadfile',Controllers.WebcamUploadfileImage);
router.get('/v1/images/getfilelist',Controllers.getFilesList);
router.get('/v1/images/files/:name',Controllers.downloadFiles);

module.exports = router;