function Move(smallBoardLocation, cellLocation) {
	this.smallBoardLocation = smallBoardLocation;
	this.cellLocation = cellLocation;
	this.notation = smallBoardLocation.notation + "/" + cellLocation.notation;
};