const Student = require('../models/Student');
const Group = require('../models/Group');
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');

const getStats = async (req,res) => {

try{

const {
period,
group,
student
} = req.query;

const today = new Date();

let fromDate = null;

if(period === 'today'){

fromDate = new Date(
today.getFullYear(),
today.getMonth(),
today.getDate()
);

}

if(period === 'week'){

fromDate = new Date();

fromDate.setDate(
today.getDate() - 7
);

}

if(period === 'month'){

fromDate = new Date();

fromDate.setMonth(
today.getMonth() - 1
);

}

const attendanceFilter = {};

if(
group &&
group !== 'all'
){
attendanceFilter.group = group;
}

if(
student &&
student !== 'all'
){
attendanceFilter.student = student;
}

if(fromDate){

attendanceFilter.date = {
$gte:
fromDate
.toISOString()
.split('T')[0]
};

}

const totalStudents =
group && group !== 'all'
? await Student.countDocuments({
group
})
: await Student.countDocuments();

const totalGroups =
await Group.countDocuments();

const totalAttendance =
await Attendance.countDocuments(
attendanceFilter
);

const presentCount =
await Attendance.countDocuments({
...attendanceFilter,
status:'present'
});

const absentCount =
await Attendance.countDocuments({
...attendanceFilter,
status:'absent'
});

const todayString =
new Date()
.toISOString()
.split('T')[0];

const todayPresent =
await Attendance.countDocuments({
...attendanceFilter,
date:todayString,
status:'present'
});

const todayAbsent =
await Attendance.countDocuments({
...attendanceFilter,
date:todayString,
status:'absent'
});

let attendancePercentage = 0;

if(totalAttendance > 0){

attendancePercentage =
Math.round(
(presentCount / totalAttendance) * 100
);

}

const groups =
await Group.find();

const groupStats =
await Promise.all(

groups.map(async(item)=>{

const studentsCount =
await Student.countDocuments({
group:item._id
});

const absentToday =
await Attendance.countDocuments({
group:item._id,
date:todayString,
status:'absent'
});

return{
groupName:item.name,
studentsCount,
absentToday
};

})

);

let topAbsentStudents = [];

if(period === 'today'){

const todayAbsentData =
await Attendance.find({

status:'absent',

date:todayString,

...(group &&
group !== 'all'
&& {
group:new mongoose.Types.ObjectId(group)
})

})
.populate(
'student',
'fullName'
);

topAbsentStudents =
todayAbsentData.map((item)=>({

fullName:
item.student?.fullName,

absentCount:1

}));

}else{

const topStudentsFilter = {
status:'absent'
};

if(
group &&
group !== 'all'
){
topStudentsFilter.group =
new mongoose.Types.ObjectId(group);
}

if(fromDate){

topStudentsFilter.date = {
$gte:
fromDate
.toISOString()
.split('T')[0]
};

}

const topAbsentRaw =
await Attendance.aggregate([

{
$match:topStudentsFilter
},

{
$group:{
_id:'$student',
absentCount:{
$sum:1
}
}
},

{
$sort:{
absentCount:-1
}
},

{
$limit:5
}

]);

for(const item of topAbsentRaw){

const studentData =
await Student.findById(item._id);

if(studentData){

topAbsentStudents.push({

fullName:
studentData.fullName,

absentCount:
item.absentCount

});

}

}

}

res.json({

totalStudents,
totalGroups,
totalAttendance,

presentCount,
absentCount,

todayPresent,
todayAbsent,

attendancePercentage,

groupStats,

topAbsentStudents

});

}catch(error){

res.status(500).json({
message:error.message
});

}

};

module.exports = {
getStats
};