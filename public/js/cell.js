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