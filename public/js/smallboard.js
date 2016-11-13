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