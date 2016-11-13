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