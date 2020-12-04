module.exports = function(httpserver)
{
	var io = require('socket.io')(httpserver)


	global.usernames = {};

	io.sockets.on('connection', function (socket) {
		console.log('Connected')

		socket.on('PReader:PrintedNames', function (data, guid) {
			let did = usernames[guid]["subject"]
			usernames[did]["PRnames"] = data;
		})

		socket.on('PReader:PrintedSurname', function (data, guid) {
			let did = usernames[guid]["subject"]
			usernames[did]["PRsurname"] = data;
		})

		socket.on('PReader:PrintedBirthDate', function (data, guid) {
			let did = usernames[guid]["subject"]
			usernames[did]["PRdateofbirth"] = data;
		})

		socket.on('PReader:PrintedDocExpiryDate', function (data, guid) {
			let did = usernames[guid]["subject"]
			console.log("expiry" + data)
			usernames[did]["PRexpirydate"] = data
		})

		socket.on('PReader:PrintedNationality', function (data, guid) {
			let did = usernames[guid]["subject"]
			usernames[did]["PRnationality"] = data;
		})

		socket.on('PReader:PrintedGender', function (data, guid) {
			let did = usernames[guid]["subject"]
			if (data=="Female")
			{
				usernames[did]["PRgender"] = "Mrs";
			}
			else {
				usernames[did]["PRgender"] = "Mr";
			}
		})

		socket.on('PReader:PrintedDocNumber', function (data, guid) {
			let did = usernames[guid]["subject"]
			usernames[did]["PassportNumber"] = data;
		})
		socket.on('PReader:DocImage', function (data, guid) {
			let did = usernames[guid]["subject"]
			usernames[did]["DocImage1"] = data.split(";;;")[0];
			usernames[did]["DocImage2"] = data.split(";;;")[1];
			usernames[did]["DocImage3"] = data.split(";;;")[2];
		})
		socket.on('PReader:FaceImage', function (data, guid) {
			let did = usernames[guid]["subject"]
			usernames[did]["FaceImage1"] = data;
		})
		socket.on('PReader:ChipFaceImage', function (data, guid) {
			let did = usernames[guid]["subject"]
			usernames[did]["ChipFace"] = data;
		})
		socket.on('PReader:PassportRead', function (data, guid) {
			let did = usernames[guid]["subject"]
			socket.broadcast.emit('Web:passportread', usernames[did]["PRnames"], guid)
			console.log(usernames[did]["PRnames"])
			console.log('emit webpassportread')
		})

		socket.on('web:CheckFaceSaved', function (data) {
			socket.broadcast.emit('PReader:CheckFaceSaved', data)
			console.log('broadcast PReader CheckFace')
		})

		socket.on('Web:SetPRused', function (data, did, guid) {
			if (data == "true"){
				usernames[did]["pruser"] = guid
				PRused = true
				console.log("PRused " + PRused)
			}
			else{
				if (usernames[did]["pruser"] == guid){
					PRused = false
					console.log("PRused " + PRused)
				}
			}
		})

		socket.on('web:CheckFaceLive', function (data) {
			socket.broadcast.emit('PReader:CheckFaceLive', data)
			console.log('broadcast PReader CheckFace')
		})

		socket.on('web:CheckFaceSuccess', function (guid) {
			socket.broadcast.emit('DID:CheckFaceSuccess', guid)
		})

		socket.on("DID:PRrequest", function (guid) {
			console.log("PRrequest")
			let object = {guid: guid}
			socket.broadcast.emit("PReader:PRrequest", object)
		})

		socket.on('web:AssessQuality', function (data, guid) {
			let base64 = data.split(",")
			let checkImage = base64[1]
			let json = {image: checkImage, guid: guid}
			socket.broadcast.emit('PReader:AssessQuality', json)
		})

		socket.on('PReader:CheckFaceResult', function (r, guid) {
			console.log(r)
			if (usernames[guid]){
				io.to(usernames[guid]["checkface"]).emit("web:CheckFaceResult", r, guid)
			}
		})

		socket.on('PReader:QualityResult', function (r, guid) {
			console.log(r)
			//socket.broadcast.emit('web:QualityResult',r)
			if (usernames[guid]){
				io.to(usernames[guid]["takeface"]).emit("web:QualityResult", r, guid)
			}
		})

		socket.on('PReader:CroppedImage', function (img, guid) {
			let did = usernames[guid]["subject"]
			usernames[did]["CamImage"] = img
			//socket.broadcast.emit('web:CroppedImage',img)
			if (usernames[guid]){
				io.to(usernames[guid]["takeface"]).emit("web:CroppedImage", img, guid)
			}
		})

		socket.on('Wallet:newID', function(to, guid, did){
			// we store the username in the socket session for this client
			console.log("ww"+guid)
			// add the client's username to the global list
			if (!usernames[did]){
				usernames[did] = {}
			}
			usernames[did]["socket"] = socket.id;
			/*usernames[did]["ATIrisTemplate"] = "";
			usernames[did]["ATname"] = "";
			usernames[did]["ATsurname"] = "";
			usernames[did]["ATgender"] = "";
			usernames[did]["ATimage"] = "";
			usernames[did]["ATbirthday"] = "";
			usernames[did]["BTgroup"] = "";
			usernames[did]["BTeligibility"] = "";
			usernames[did]["BTexpires"] = "";
			usernames[did]["CamImage"] = "";*/


			//socket.emit('Wallet:ID', did);
			console.log("1" + guid)
			if (usernames[to]){
				console.log("2" + usernames[to])
				io.to(usernames[to][guid]).emit('Web:newID', did, guid);
			}
		})

		socket.on('DID:newID', function(did, guid){
			// we store the username in the socket session for this client
			// add the client's username to the global list
			console.log("5" + guid)
			if (!usernames[did]){
				usernames[did] = {}
			}
			usernames[guid] = {}
			usernames[guid]["subject"] = ""
			usernames[guid]["isTascent"] = false
			usernames[guid]["isPReader"] = false
			usernames[did][guid] = socket.id;
		})

		socket.on('DID:setSocket', function(did, guid){
			if (!usernames[did]){
				usernames[did] = {}
			}
			console.log("sockets " + socket.id)
			usernames[did][guid] = socket.id;
		})

		socket.on('Page:newID', function(guid, id){
			// we store the username in the socket session for this client
			console.log("NewID" + id + guid)
			socket.pagename = id
			// add the client's username to the global list
			/*if(!usernames[guid]){
				usernames[guid] = {}
			}*/
			if (usernames[guid]){
				usernames[guid][id] = socket.id;
			}
		})



		socket.on("Gov:Connected", function(guid){
			console.log(guid)
			if (usernames[guid]){
				io.to(usernames[guid]["home"]).emit("Gov:Connected", guid, usernames[guid]["isPReader"])
			}
		})
		socket.on("Don:Connected", function(guid){
			if (usernames[guid]){
				io.to(usernames[guid]["home"]).emit("Don:Connected", guid)
			}
		})
		socket.on("Hosp:Connected", function(guid){
			if (usernames[guid]){
				io.to(usernames[guid]["home"]).emit("Hosp:Connected", guid)
			}
		})

		socket.on("Don:NotVerified", function(type, guid){
			socket.broadcast.emit("Don:NotVerified", type, guid)
		})
		socket.on("Don:Verified", function(type, guid){
			socket.broadcast.emit("Don:Verified", type, guid)
		})

		socket.on('disconnect', function(){
			console.log("Disconnected")
			//console.log(socket.did)
			//console.log(socket.cid)
			// remove the username from global usernames list
			if (socket.pagename){
				if (socket.pagename == "login"){
					if (PRused == true){
						console.log("Bye Bye")
						PRused =  false
					}
				}
			}
		});

		socket.on('DID:Attestation', function (to, from, jwt, guid) {
			 console.log("Sending attestation to " + to)
			 io.to(usernames[to]["socket"]).emit('Wallet:Attestation', from, jwt, guid);
		})

		socket.on('DID:Request', function (to, from, jwt, guid) {
			 io.to(usernames[to]["socket"]).emit('Wallet:Request', from, jwt, guid);
		})

		socket.on('Wallet:Attestation', function (to, jwt, guid) {
			 io.to(usernames[to][guid]).emit('Web:Attestation', jwt, guid)
		})

		socket.on('Wallet:Received', function (to, guid) {
			console.log("recv"+guid)
			console.log(usernames[to][guid])
			io.to(usernames[to][guid]).emit('Web:Received')
			 //socket.broadcast.emit('Web:Received', guid)
		})

		socket.on('Don:Results', function (eligibility, group, exp, guid) {
			let did = usernames[guid]["subject"]
			usernames[did]["BTgroup"] = group;
			usernames[did]["BTeligibility"] = eligibility;
			usernames[did]["BTexpires"] = exp
			socket.broadcast.emit("Don:Set", guid)
		})

		socket.on('DID:Notification', function (data1, data2, color, img, guid) {
			socket.broadcast.emit("Web:Notification", data1, data2, color, img, guid)
		})

		socket.on('Web:ChangeTascent', function (data, guid) {
			console.log("change" + guid)
			if (usernames[guid]){
				usernames[guid]["isTascent"] = data;
				console.log(usernames[guid]["isTascent"])
			}
		})

		socket.on('Web:GetTascent', function (guid) {
			console.log("gettascent1")
			if (usernames[guid]){
				console.log("gettascent")
				socket.broadcast.emit("Web:IsTascent", usernames[guid]["isTascent"], guid)
			}
		})

		socket.on('Web:ChangePReader', function (data, guid) {
			console.log("change" + guid)
			if (usernames[guid]){
				usernames[guid]["isPReader"] = data;
			}
		})

		socket.on('Web:GetPReader', function (guid) {
			if (usernames[guid]){
				socket.broadcast.emit("Web:IsPReader", usernames[guid]["isPReader"], guid)
			}
		})

		socket.on('web:PRdata', function (fname, lname, birth, gender, nationality, img, expirydate, guid) {
			console.log("PRData" + guid)
			let did = usernames[guid]["subject"]
			console.log(did)
			usernames[did]["PRnames"] = fname;
			usernames[did]["PRsurname"] = lname;
			usernames[did]["PRdateofbirth"] = birth;
			console.log("expiry " + expirydate)
			usernames[did]["PRexpirydate"] = expirydate;
			if (gender=="Male") {
				usernames[did]["PRgender"] = "Mr";
			} else {
				usernames[did]["PRgender"] = "Mrs";
			}
			usernames[did]["PRnationality"] = nationality;
			let base64 = img.split(",");
			usernames[did]["ChipFace"] = base64[1];
		})

		socket.emit('Wallet:Connected');
	})
}
