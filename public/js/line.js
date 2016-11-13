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