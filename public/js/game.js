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