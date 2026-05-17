const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');

const saveAttendance = async (req,res) => {

try{

const {
student,
group,
date,
status
} = req.body;

const existingAttendance =
await Attendance.findOne({
student,
date
});

if(existingAttendance){

existingAttendance.status = status;

await existingAttendance.save();

return res.json(existingAttendance);

}

const attendance =
await Attendance.create({

student:new mongoose.Types.ObjectId(student),

group:new mongoose.Types.ObjectId(group),

date,

status

});

res.status(201).json(attendance);

}catch(error){

res.status(500).json({
message:error.message
});

}

};

const getAttendance = async (req,res) => {

try{

const filter = {};

if(req.query.group){
filter.group = req.query.group;
}

if(req.query.date){
filter.date = req.query.date;
}

const attendance =
await Attendance.find(filter)
.populate(
'student',
'fullName email'
)
.populate(
'group',
'name'
)
.sort({createdAt:-1});

res.json(attendance);

}catch(error){

res.status(500).json({
message:error.message
});

}

};

const getStudentReport = async (req,res) => {

try{

const {
student,
from,
to
} = req.query;

const filter = {};

if(student){
filter.student = student;
}

if(from && to){

filter.date = {
$gte:from,
$lte:to
};

}

const attendance =
await Attendance.find(filter)

.populate(
'student',
'fullName email'
)

.populate(
'group',
'name'
)

.sort({date:1});

res.json(attendance);

}catch(error){

res.status(500).json({
message:error.message
});

}

};

module.exports = {
saveAttendance,
getAttendance,
getStudentReport
};