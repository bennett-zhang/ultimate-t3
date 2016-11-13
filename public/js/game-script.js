(function() {
function Game(aiPlayer, difficulty) {
	this.playerWhoseTurnItIs = "X";
	this.history = [];
	this.bigBoard = new BigBoard();
	this.aiPlayer = aiPlayer;
	this.difficulty = difficulty;
}

Game.prototype.getCurrentSmallBoard = function() {
	var smallBoard;
	if (this.history.length > 0) {
		var previousCellLocation = this.history[this.history.length - 1].cellLocation;
		smallBoard = this.bigBoard.children[previousCellLocation.row][previousCellLocation.col];
	}
	return smallBoard;
};

Game.prototype.getPossibleMoves = function() {
	var smallBoard = this.getCurrentSmallBoard();
	if (this.history.length === 0 || smallBoard.winner) {
		return this.bigBoard.getPossibleMoves();
	}
	if (this.bigBoard.winner === null) {
		return smallBoard.getPossibleMoves();
	}
	return [];
};

Game.prototype.makeMove = function(move) {
	var smallBoard = this.getCurrentSmallBoard();
	if (this.history.length === 0 || smallBoard.winner || (move.smallBoardLocation.row === smallBoard.location.row && move.smallBoardLocation.col === smallBoard.location.col)) {
		var success = this.bigBoard.makeMove(move, this.playerWhoseTurnItIs);
		if (success) {
			if (this.playerWhoseTurnItIs === "X") {
				this.playerWhoseTurnItIs = "O";
			}
			else {
				this.playerWhoseTurnItIs = "X";
			}
			this.history.push(move);
			return true;
		}
	}
	return false;
};

Game.prototype.undoMove = function() {
	if (this.history.length > 0) {
		if (this.playerWhoseTurnItIs === "X") {
			this.playerWhoseTurnItIs = "O";
		}
		else {
			this.playerWhoseTurnItIs = "X";
		}
		var move = this.history.pop();
		this.bigBoard.undoMove(move);
	}
};

Game.prototype.minimax = function(depth, player, alpha, beta) {
	var moves = this.getPossibleMoves();

	var score, bestMove;

	if (moves.length === 0 || depth === this.difficulty) {
		score = this.getScore();
		return {
			score: score,
			move: null
		};
	}

	for (var i = 0; i < moves.length; i++) {
		var move = moves[i];
		this.makeMove(move);
		score = this.minimax(depth + 1, player === "X" ? "O" : "X", alpha, beta).score;
		if (player === this.aiPlayer) {
			if (score > alpha) {
				alpha = score;
				bestMove = move;
			}
		}
		else {
			if (score < beta) {
				beta = score;
				bestMove = move;
			}
		}
		this.undoMove();
		if (alpha >= beta) {
			break;
		}
	}

	return {
		score: (player === this.aiPlayer) ? alpha : beta,
		move: bestMove
	};
};

Game.prototype.getScore = function() {
	var score = this.bigBoard.score;
	if (this.aiPlayer === "O") {
		score *= -1;
	}
	return score;
};

function BigBoard() {
	this.children = [];
	for (var i = 0; i < 3; i++) {
		this.children.push([]);
		for (var j = 0; j < 3; j++) {
			this.children[i].push(new SmallBoard(new Location(i, j)));
		}
	}

	var diag1 = [];
	var diag2 = [];
	for (var i = 0; i < 3; i++) {
		diag1.push(this.children[i][i]);
		diag2.push(this.children[i][2 - i]);
		var row = [];
		var col = [];
		for (var j = 0; j < 3; j++) {
			row.push(this.children[i][j]);
			col.push(this.children[j][i]);
		}
		new Line(row);
		new Line(col);
	}
	new Line(diag1);
	new Line(diag2);

	this.score = 0;

	this.winner = null;
	this.numChildrenCompleted = 0;
}

BigBoard.prototype.getPossibleMoves = function() {
	var moves = [];
	if (this.winner === null) {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				moves = moves.concat(this.children[i][j].getPossibleMoves());
			}
		}
	}
	return moves;
};

BigBoard.prototype.makeMove = function(move, player) {
	if (this.winner === null) {
		var smallBoard = this.children[move.smallBoardLocation.row][move.smallBoardLocation.col];
		this.score -= smallBoard.score;
		var success = smallBoard.makeMove(move, player);
		this.score += smallBoard.score;
		if (success) {
			if (smallBoard.winner) {
				this.numChildrenCompleted++;
				if (this.numChildrenCompleted === 9) {
					this.winner = "tie";
				}
				for (var i = 0; i < smallBoard.lines.length; i++) {
					if (smallBoard.lines[i].numInARow === 3) {
						this.winner = smallBoard.lines[i].player;
						break;
					}
				}
			}
			return true;
		}
	}
	return false;
};

BigBoard.prototype.undoMove = function(move) {
	var smallBoard = this.children[move.smallBoardLocation.row][move.smallBoardLocation.col];
	if (smallBoard.winner) {
		this.numChildrenCompleted--;
	}
	this.score -= smallBoard.score;
	smallBoard.undoMove(move);
	this.score += smallBoard.score;
	this.winner = null;
};

function SmallBoard(location) {
	this.location = location;
	this.children = [];
	for (var i = 0; i < 3; i++) {
		this.children.push([]);
		for (var j = 0; j < 3; j++) {
			this.children[i].push(new Cell(new Location(i, j)));
		}
	}

	var diag1 = [];
	var diag2 = [];
	for (var i = 0; i < 3; i++) {
		diag1.push(this.children[i][i]);
		diag2.push(this.children[i][2 - i]);
		var row = [];
		var col = [];
		for (var j = 0; j < 3; j++) {
			row.push(this.children[i][j]);
			col.push(this.children[j][i]);
		}
		new Line(row);
		new Line(col);
	}
	new Line(diag1);
	new Line(diag2);

	this.score = 0;

	this.lines = [];
	this.winner = null;
	this.numChildrenCompleted = 0;
}

SmallBoard.prototype.getPossibleMoves = function() {
	var moves = [];
	if (this.winner === null) {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				if (this.children[i][j].winner === null) {
					moves.push(new Move(this.location, this.children[i][j].location));
				}
			}
		}
	}
	return moves;
};

SmallBoard.prototype.makeMove = function(move, player) {
	if (this.winner === null) {
		var cell = this.children[move.cellLocation.row][move.cellLocation.col];
		this.score -= cell.score;
		var success = cell.makeMove(player);
		this.score += cell.score;
		if (success) {
			this.numChildrenCompleted++;
			if (this.numChildrenCompleted === 9) {
				this.winner = "tie";
			}
			for (var i = 0; i < cell.lines.length; i++) {
				if (cell.lines[i].numInARow === 3) {
					this.winner = cell.lines[i].player;
					break;
				}
			}
			if (this.winner) {
				for (var i = 0; i < this.lines.length; i++) {
					this.lines[i].evaluate();
				}
			}
			return true;
		}
	}
	return false;
};

SmallBoard.prototype.undoMove = function(move) {
	var cell = this.children[move.cellLocation.row][move.cellLocation.col];
	this.score -= cell.score;
	cell.undoMove();
	this.score += cell.score;
	this.numChildrenCompleted--;
	if (this.winner) {
		this.winner = null;
		for (var i = 0; i < this.lines.length; i++) {
			this.lines[i].evaluate();
		}
	}
};

function Cell(location) {
	this.location = location;
	this.lines = [];
	this.winner = null;
	this.score = 0;
}

Cell.prototype.makeMove = function(player) {
	if (this.winner === null) {
		this.winner = player;
		for (var i = 0; i < this.lines.length; i++) {
			this.lines[i].evaluate();
		}
		return true;
	}
	return false;
};

Cell.prototype.undoMove = function() {
	this.winner = null;
	for (var i = 0; i < this.lines.length; i++) {
		this.lines[i].evaluate();
	}
};

function Line(children) {
	this.children = children;
	for (var i = 0; i < 3; i++) {
		this.children[i].lines.push(this);
	}
	this.player = null;
	this.numInARow = 0;
	this.score = 0;
}

Line.prototype.evaluate = function() {
	var counter = {
		X: 0,
		O: 0,
		tie: 0
	};
	for (var i = 0; i < this.children.length; i++) {
		if (this.children[i].winner) {
			counter[this.children[i].winner]++;
		}
		this.children[i].score -= this.score;
	}
	if (counter.tie > 0 || (counter.X > 0 === counter.O > 0)) {
		this.player = null;
		this.numInARow = 0;
		this.score = 0;
	}
	else if (counter.X > 0) {
		this.player = "X";
		this.numInARow = counter.X;
		if (this.children[0] instanceof Cell) {
			this.score = Math.pow(10, this.numInARow - 1);
		}
		else {
			this.score = Math.pow(10, this.numInARow + 1);
		}
	}
	else {
		this.player = "O";
		this.numInARow = counter.O;
		if (this.children[0] instanceof Cell) {
			this.score = -Math.pow(10, this.numInARow - 1);
		}
		else {
			this.score = -Math.pow(10, this.numInARow + 1);
		}
	}
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].score += this.score;
	}
};

function Move(smallBoardLocation, cellLocation) {
	this.smallBoardLocation = smallBoardLocation;
	this.cellLocation = cellLocation;
	this.notation = smallBoardLocation.notation + "/" + cellLocation.notation;
};

function Location() {
	if (typeof arguments[0] === "string") {
		this.notation = arguments[0];

		var firstChar = this.notation.charAt(0);
		var lastChar = this.notation.charAt(this.notation.length - 1);

		if (firstChar === "N") {
			this.row = 0;
		}
		else if (firstChar === "S") {
			this.row = 2;
		}
		else {
			this.row = 1;
		}
		if (lastChar === "W") {
			this.col = 0;
		}
		else if (lastChar === "E") {
			this.col = 2;
		}
		else {
			this.col = 1;
		}
	}

	else {
		this.row = arguments[0];
		this.col = arguments[1];

		this.notation = "";

		if (this.row === 0) {
			this.notation += "N";
		}
		else if (this.row === 2) {
			this.notation += "S";
		}
		if (this.col === 0) {
			this.notation += "W";
		}
		else if (this.col === 2) {
			this.notation += "E";
		}
		if (this.notation.length === 0) {
			this.notation = "C";
		}
	}
}

///////

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
})();