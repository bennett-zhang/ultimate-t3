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