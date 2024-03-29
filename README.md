built.io JS SDK
=======

(C) Raw Engineering, Inc (www.raweng.com) 2013, Licensed under the MIT-LICENSE

An Javascript SDK for built.io service for node.js (0.6.x and up).  Hides most of the complexity of creating, maintaining built.io objects and sessions.


Features
--------

* Work in Browser as well as in servers (NodeJS)
* Simple service wrapper that allows you to easily put together All Built.io REST API libraries
* Easy create Application User
* Automatic User login,logout with authtoken or username, password
* Deactivate user in application.
* Create objects in built.io applications
* Update objects in buil.io applications
* Delete Objects in built.io applications
* Upload Files in built.io server.
* Model binding for each built.io objects


Example usage
-------------

```javascript
var built = require('built');

built.init(application_api_key,application_uid);

var query = new built.Query('employee'/*class_uid*/);
query.greaterThan('age',30);
query.exec({
  success:function(data,res){
		console.log(data);
	},
	fail:function(data,res){
		console.log(data)
	}
});


var employee=built.Object.extend('employee'/*class_uid*/);
emp1=new employee();
emp1.set({
	name:'jack',
	age:32
});

emp1.set('gender','male');
emp1.save({
	success:function(data,res){
		console.log('object saved');
	}
});

```

```bash
npm install built
```
