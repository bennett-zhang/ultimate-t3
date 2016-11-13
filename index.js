var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.set("view engine", "ejs");

var port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
	res.render("pages/index");
});

app.get("/rules", function(req, res) {
	res.render("pages/rules");
});

app.get("/local-game", function(req, res) {
	res.render("pages/local-game");
});

app.get("/online-game", function(req, res) {
	var rand = Math.random().toString(36).slice(2);
	res.redirect("/online-game/" + rand);
});

app.get("/online-game/*", function(req, res) {
	res.render("pages/online-game");
});

io.on("connection", function(socket) {
	var referer = socket.handshake.headers.referer.split("/");
	var rand = referer[referer.length - 1];

	socket.join(rand);
	var room = io.sockets.adapter.rooms[rand];

	if (!room.game) {
		room.game = {
			players: [],
			history: []
		};
	}

	if (room.game.players.length === 0) {
		if (Math.random() < 0.5) {
			socket.player = "X";
		}
		else {
			socket.player = "O";
		}
	}
	else if (room.game.players.indexOf("X") === -1) {
		socket.player = "X";
	}
	else if (room.game.players.indexOf("O") === -1) {
		socket.player = "O";
	}
	else {
		socket.player = null;
	}

	if (socket.player) {
		room.game.players.push(socket.player);
	}

	socket.emit("connection", socket.player, room);
	io.to(rand).emit("someone connected", room);

	socket.on("move", function(move) {
		room.game.history.push(move);
		socket.broadcast.to(rand).emit("move", move);
	});

	socket.on("disconnect", function() {
		if (socket.player) {
			var i = room.game.players.indexOf(socket.player);
			room.game.players.splice(i, 1);
		}
		io.to(rand).emit("someone disconnected", room);
	});
});

http.listen(port, function() {
	console.log("listening on *:" + port);
});