db.createUser({user: "mongouser",
	pwd: "hunter2",
	roles: [ { role: "readWrite", db: "mongodb" } ]
});


db.users.insertOne({
  userID: "Default",
  password: "newpass",
})


