function BigBoardDisplay() {
	this.element = $("#game");

	this.children = [];
	var table = $("<table></table>").appendTo(this.element);
	for (var i = 0; i < 3; i++) {
		this.children.push([]);
		var row = $("<tr></tr>").appendTo(table);
		for (var j = 0; j < 3; j++) {
			var smallBoardDisplay = new SmallBoardDisplay(this, new Location(i, j));
			this.children[i].push(smallBoardDisplay);
			smallBoardDisplay.element.appendTo(row);
		}
	}
}

BigBoardDisplay.prototype.update = function() {
	var possibleMoves = game.getPossibleMoves();
	if (possibleMoves.length === 0) {
		this.element.removeClass("enabled").addClass("disabled");
		var winner = game.bigBoard.winner;
		if (winner === "tie") {
			gameCaption.text("It's a tie!");
		}
		else {
			gameCaption.text(winner + " wins!");
		}
	}
	else {
		this.element.removeClass("disabled").addClass("enabled");
		gameCaption.text(game.playerWhoseTurnItIs + "'s turn");
		var canMove = false;
		for (var i = 0; i < players.length; i++) {
			if (players[i] === game.playerWhoseTurnItIs) {
				canMove = true;
				break;
			}
		}
		if (players.length === 0) {
			gameCaption.append(" <span class='text-muted'>(you are spectating)</span>");
		}
		else if (!canMove) {
			gameCaption.append(" <span class='text-muted'>(waiting for opponent...)</span>");
		}
		var history = game.history;
		var turn = history.length;
		if (turn === historyTableBody.children("tr").length + 1) {
			var player = (turn % 2) ? "X" : "O";
			var notation = history[turn - 1].notation;
			historyTableBody.append("<tr><th scope='row'>" + turn + "</th><td>" + player + "</td><td>" + notation + "</td></tr>");
		}
	}
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			var smallBoardDisplay = this.children[i][j];
			smallBoardDisplay.update(possibleMoves.filter(function(move) {
				return move.smallBoardLocation.row === smallBoardDisplay.location.row && move.smallBoardLocation.col === smallBoardDisplay.location.col;
			}));
		}
	}
};

function SmallBoardDisplay(parent, location) {
	this.element = $("<td class='smallBoard " + location.notation + " disabled'></td>");
	this.parent = parent;
	this.location = location;

	this.children = [];
	var table = $("<table></table>").appendTo(this.element);
	for (var i = 0; i < 3; i++) {
		this.children.push([]);
		var row = $("<tr></tr>").appendTo(table);
		for (var j = 0; j < 3; j++) {
			var cellDisplay = new CellDisplay(this, new Location(i, j));
			this.children[i].push(cellDisplay);
			cellDisplay.element.appendTo(row);
		}
	}
}

SmallBoardDisplay.prototype.update = function(possibleMoves) {
	if (possibleMoves.length === 0) {
		this.element.removeClass("enabled").addClass("disabled");
		var winner = game.bigBoard.children[this.location.row][this.location.col].winner;
		if (winner !== "tie") {
			this.element.attr("data-winner", winner);
		}
	}
	else {
		this.element.removeClass("disabled").addClass("enabled");
		this.element.attr("data-winner", null);
	}
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			var cellDisplay = this.children[i][j];
			cellDisplay.update(possibleMoves.find(function(move) {
				return move.cellLocation.row === cellDisplay.location.row && move.cellLocation.col === cellDisplay.location.col;
			}));
		}
	}
};

function CellDisplay(parent, location) {
	this.element = $("<td class='cell " + location.notation + " disabled'></td>");
	this.element.click(this.onclick.bind(this));
	this.parent = parent;
	this.location = location;
}

CellDisplay.prototype.update = function(move) {
	if (!move) {
		this.element.removeClass("enabled").addClass("disabled");
		var winner = game.bigBoard.children[this.parent.location.row][this.parent.location.col].children[this.location.row][this.location.col].winner;
		this.element.text(winner);
	}
	else {
		var canMove = false;
		for (var i = 0; i < players.length; i++) {
			if (players[i] === game.playerWhoseTurnItIs) {
				canMove = true;
				break;
			}
		}
		if (canMove) {
			this.element.removeClass("disabled").addClass("enabled");
		}
		else {
			this.element.removeClass("enabled").addClass("disabled");
		}
		this.element.empty();
	}
};

CellDisplay.prototype.onclick = function() {
	if (this.element.hasClass("enabled")) {
		var move = new Move(this.parent.location, this.location);
		game.makeMove(move);
		bigBoardDisplay.update();
		aiMove();

		if (online) {
			socket.emit("move", move);
		}
	}
};

function aiMove() {
	if (game.aiPlayer === game.playerWhoseTurnItIs) {
		setTimeout(function() {
			var move = game.minimax(0, game.aiPlayer, -Infinity, Infinity).move;
			game.makeMove(move);
			bigBoardDisplay.update();
		}, 500);
	}
}

var game;
var bigBoardDisplay = new BigBoardDisplay();
var socket;
var online = location.pathname.split("/")[1] === "online-game";
var players = [];

var gameCaption = $("#game-caption");
var opponent = $("#opponent");
var first = $("#first");
var difficulty = $("#difficulty");
var newGame = $("#new-game");
var playerDisplay = $("#player-display");
var connectionStatus = $("#connection-status");
var url = $("#url");
var historyTableBody = $("#history-table>tbody");

newGame.click(function() {
	if (opponent.val() === "computer") {
		var aiPlayer;
		if (first.val() === "player") {
			players = ["X"];
			aiPlayer = "O";
			playerDisplay.text("You are playing as X");
		}
		else {
			players = ["O"];
			aiPlayer = "X";
			playerDisplay.text("You are playing as O");
		}
		playerDisplay.show(500);
		game = new Game(aiPlayer, parseInt(difficulty.val()));
	}
	else {
		players = ["X", "O"];
		playerDisplay.hide(500);
		game = new Game(null, 0);
	}
	historyTableBody.empty();
	bigBoardDisplay.update();
	aiMove();
});

opponent.change(function() {
	if (this.value === "computer") {
		first.parent().show(500);
		difficulty.parent().show(500);
	}
	else {
		first.parent().hide(500);
		difficulty.parent().hide(500);
	}
});

url.val(location);
url.focus(function() {
	$(this).select();
});

if (online) {
	socket = io();

	socket.on("connection", function(player, room) {
		if (player) {
			players = [player];
			playerDisplay.text("You are playing as " + player);
		}
		else {
			playerDisplay.text("You are spectating");
		}
		playerDisplay.show(500);
		if (room.game.players.length === 1) {
			url.closest("form").show(500);
		}
		game = new Game(null, 0);
		for (var i = 0; i < room.game.history.length; i++) {
			game.makeMove(room.game.history[i]);
		}
		bigBoardDisplay.update();
	});

	socket.on("someone connected", function(room) {
		if (room.game.players.length === 2) {
			connectionStatus.removeClass("alert-danger").addClass("alert-success");
			connectionStatus.text("Both players have joined");
			connectionStatus.show(500);
			url.closest("form").hide(500);
		}
	});

	socket.on("someone disconnected", function(room) {
		if (room.game.players.length < 2) {
			connectionStatus.removeClass("alert-success").addClass("alert-danger");
			connectionStatus.text(room.game.players.length === 1 ? "One of the players has left" : "Both of the players have left");
		}
	});

	socket.on("move", function(move) {
		game.makeMove(move);
		bigBoardDisplay.update();
	});
}