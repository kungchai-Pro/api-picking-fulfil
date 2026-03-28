var express = require('express');
var router = express.Router();

var DepartmentController = require('../controller/department.controller');
router.get('/v1/department/departmentall',DepartmentController.GetDepartMentAll);
router.get('/v1/department/positiontall',DepartmentController.GetPositionList);

module.exports = router;