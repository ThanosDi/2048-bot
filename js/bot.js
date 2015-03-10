function triggerKey(key) {
	var code = key === ' ' ? 32 :
		key === 'Left' ? 37 :
		key === 'Up' ? 38 :
		key === 'Right' ? 39 :
		key === 'Down' ? 40 : 0;
	var e = document.createEvent('KeyboardEvent');
	// Gah, screw chrome
	Object.defineProperty(e, 'keyCode', {
		get: function() {
			return code;
		}
	});
	Object.defineProperty(e, 'which', {
		get: function() {
			return code;
		}
	});
	Object.defineProperty(e, 'metaKey', {
		get: function() {
			return false;
		}
	});
	Object.defineProperty(e, 'shiftKey', {
		get: function() {
			return false;
		}
	});
	if (e.initKeyboardEvent)
		e.initKeyboardEvent("keydown", true, true, document.defaultView, false, false, false, false, code, code);
	else
		e.initKeyEvent("keydown", true, true, document.defaultView, false, false, false, false, code, 0);
	document.body.dispatchEvent(e);
}

function adjacent(t1, t2) {
	return (Math.abs(t1.x - t2.x) === 1 && t1.y === t2.y) ||
		(Math.abs(t1.y - t2.y) === 1 && t1.x == t2.x);
}

function tileAt(x, y, tiles) {
	return tiles.some(function(tile) {
		return tile.x === x && tile.y === y;
	});
}

function moveBetween(t1, t2, tiles) {
	// Assumes adjacency
	// return t1.x !== t2.x ?
	// 	(t1.x === 0 || t2.x === 0 || ((t1.x === 1 || t2.x === 1) && tileAt(0, t1.y, tiles)) ? "Left" : "Right") :
	// 	(t1.y === 0 || t2.y === 0 || ((t1.y === 1 || t2.y === 1) && tileAt(t1.x, 0, tiles)) ? "Up" : "Down");
}

function getTiles() {
	var tileElements = Array.prototype.slice.call(document.getElementsByClassName('tile'));
	return tileElements.map(function(tile) {
		return {
			value: Number(tile.className.match(/tile-(\d*)/)[1]),
			x: Number(tile.className.match(/position-(\d)/)[1]) - 1, // zero-based numbering is best-based numbering
			y: Number(tile.className.match(/position-\d-(\d)/)[1]) - 1
		};
	});
}

function getMaxTile() {
	var tiles = getTiles();
	var maxTile = {
		value: 0,
		x: 0,
		y: 0
	};
	for (var key in tiles) {
		if (tiles[key]['value'] >= maxTile.value) {
			if (tiles[key]['value'] == maxTile.value) {
				if ((maxTile.x + maxTile.y) < (tiles[key]['x'] + tiles[key]['y'])) {
					maxTile.value = tiles[key]['value'];
					maxTile.x = tiles[key]['x'];
					maxTile.y = tiles[key]['y'];
				}
			}
			maxTile.value = tiles[key]['value'];
			maxTile.x = tiles[key]['x'];
			maxTile.y = tiles[key]['y'];

		}
	}
	console.log("To maxTile " + maxTile.value + " einai sth thesh x= " + maxTile.x + " kai y=" + maxTile.y);
	return maxTile;
}

function randomMove() {
	var movement={found:false, action:""};
	var currentMaxTile = getMaxTile();
	var tiles = getTiles();
	var grid = getGrid(tiles);
	var defaultTile = {x:3,y:3,value:grid[3][3]};
	
	if (grid[3][3]==0){
		if (validMove(grid,"Right")){
			movement.action="Right";
			movement.found=true;
		}else if(validMove(grid,"Down")){
			movement.action="Down";
			movement.found=true;
		}
	}else{
		movement = equality_checker(grid,defaultTile,movement);
		if (!movement.found){
			if (validMove(grid,"Down")){
				movement.action="Down";
				movement.found=true;
			}else if (validMove(grid,"Right")){
				movement.action="Right";
				movement.found=true; 
			}
		}
	}
	if (!movement.found){
		if (validMove(grid,"Left")){
			movement.action="Left";
			movement.found=true;
		}else if (validMove(grid,"Up")){
			movement.action="Up";
			movement.found=true; 
		}
	}

	console.log("i moved " +  movement.action);
	return movement.action;
}




function equality_checker(grid,tile,movement){

	var upTile = adjacent('Up', tile, grid);
	var leftTile = adjacent('Left', tile, grid);
	

	console.log("%cchecking for tile x: " + tile.x + " tile y: " + tile.y + " value: " + tile.value, "color: red");
	if (tile.value>0){
		if(tile.value==upTile.value){
			movement.action="Down";
			movement.found=true;
		}else if(tile.value==leftTile.value){
			if (isBottomFull(getTiles()) && (tile.y==2)){
				movement.action="Left";
				movement.found=true; 
			}else{
				movement.action="Right";
				movement.found=true; 	
			}
		}
	}


	if (leftTile.value>-1 && !movement.found){
		movement = equality_checker(grid,leftTile,movement);
	}
	if (upTile.value>-1 && !movement.found){
		movement = equality_checker(grid,upTile,movement);
	}

return movement;


}

function validMove(grid,moving){
	var found=false;
	switch(moving){
		case "Up":
		for (var x = 3; x >= 0; x--) {
				found = false;
				for (var y = 3; y >= 0; y--) {
					if (grid[x][y] >= 2) {
						if (y>3) {
							if (grid[x][y] == grid[x][y-1]) {
								y = y-1;
								console.log("moving " + moving +  " is valid equality, " +x +" "+y);
								return true;
							}
						}
						found = true;
					}else if (found) {
						console.log("moving " + moving +  " is valid, " +x +" "+y);
						return true;
					}

				};
			};
		break;
		case "Down":
			for (var x = 0; x < grid.length; x++) {
				found = false;
				for (var y = 0; y < grid.length; y++) {
					if (grid[x][y] >= 2) {
						if (y<3) {
							if (grid[x][y] == grid[x][y+1]) {
								y = y+1;
								console.log("moving " + moving +  " is valid equality, " +x +" "+y);
								return true;
							}
						}
						found = true;
					}else if (found) {
						console.log("moving " + moving +  " is valid, " +x +" "+y);
						return true;
					}

				};
			};
		break;
		case "Right":
		for (var y = 0; y < grid.length; y++) {
				found = false;
				for (var x = 0; x < grid.length; x++) {
					if (grid[x][y] >= 2) {
						if (x<3) {
							if (grid[x][y] == grid[x+1][y]) {
								x = x+1;
								console.log("moving " + moving +  " is valid equality, " +x +" "+y);
								return true;
							}
						}
						found = true;
					}else if (found) {
						console.log("moving " + moving +  " is valid, " +x +" "+y);
						return true;
					}

				};
			};
		break;
		case "Left":
		for (var y = 3; y >= 0; y--) {
				found = false;
				for (var x = 3; x >= 0; x--) {
					if (grid[x][y] >= 2) {
						if (x>0) {
							if (grid[x][y] == grid[x-1][y]) {
								x = x-1;
								console.log("moving " + moving +  " is valid equality, " +x +" "+y);
								return true;
							}
						}
						found = true;
					}else if (found) {
						console.log("moving " + moving +  " is valid, " +x +" "+y);
						return true;
					}

				};
			};
		break;
	}
	console.log("Invalid moving");
	return false;

}

function movemade(grid,prevgrid){
	if (grid == prevgrid){
		return false;
	}
	else return true;
}

function adjacent(side, tile, grid) {
	var adjacentTile = {
		x: -1,
		y: -1,
		value: -1
	};
	switch (side) {
		case 'Up':

			if (tile.y > 0) {

				adjacentTile.y = tile.y - 1;
				adjacentTile.x = tile.x;
				// console.log("tile Up CASE " + adjacentTile.x + " " + adjacentTile.y );

			} else {
				return adjacentTile;
			}
			break;
		case 'Right':
		//	console.log("tile Right CASE " + adjacentTile.x + " " + adjacentTile.y );
			if (tile.x < 3) {
				adjacentTile.x = tile.x + 1;
				adjacentTile.y = tile.y;
			} else {
				return adjacentTile;
			}

			break;
		case 'Down':
			//console.log("tile Down CASE " + adjacentTile.x + " " + adjacentTile.y );
			if (tile.y < 3) {
				adjacentTile.y = tile.y + 1;
				adjacentTile.x = tile.x;
			} else {
				return adjacentTile;
			}

			break;
		case 'Left':
		//	console.log("tile Left CASE " + adjacentTile.x + " " + adjacentTile.y );
			if (tile.x > 0) {
				adjacentTile.x = tile.x - 1;
				adjacentTile.y = tile.y;
			} else {
				return adjacentTile;
			}

			break;
	}
	// adjacentTile.x = parseInt(adjacentTile.x);
	// adjacentTile.y = parseInt(adjacentTile.y);
console.debug("adjacent tile " + side + " einai x: " + adjacentTile.x + " y: "+ adjacentTile.y + "me value " + grid[adjacentTile.x][adjacentTile.y]);
	adjacentTile.value = grid[adjacentTile.x][adjacentTile.y];
	return adjacentTile;
}

function getGrid(tiles) {
	var grid = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	];
	for (var key in tiles) {
		grid[tiles[key]['x']][tiles[key]['y']] = tiles[key]['value'];
	}
	console.log("Tiles:" + grid);
	return grid;
}

function isBottomFull(tiles) {
	var currentY;
	var sumX = 0;
	var flag = false;
	var prevValue = 0;
	for (var key in tiles) {
		currentY = tiles[key]['y'];

		if (currentY == 3) {
			currentValue = tiles[key]['value'];
			if (prevValue == currentValue) {
				return false;
			}
			sumX++;
			prevValue = currentValue;
		}
	}
	return sumX == 4;
}

function isLeftFull(tiles) {
	var currentX;
	var sumY = 0;
	var prevValue = 0;
	for (var key in tiles) {
		currentX = tiles[key]['x'];
		if (currentX == 0) {
			currentValue = tiles[key]['value'];
			console.log(currentValue);
			if (prevValue == currentValue) {
				return false;
			}
			sumY++;
			prevValue = currentValue;
		}
	}
	return sumY == 4;


}

function move(tiles) {
	var sorted = tiles.sort(function(t1, t2) {
		return t1.value - t2.value;
	});
	for (var i = 0; i < sorted.length - 1; i++) {
		if (adjacent(sorted[i], sorted[i + 1]))
			return moveBetween(sorted[i], sorted[i + 1], tiles);
	}
	// return randomMove();
}

function gameOver() {
	return document.getElementsByClassName('game-over').length > 0;
}

function gameWon() {
	return document.getElementsByClassName('game-won').length > 0;
}
(function tick() {
	 // if (gameWon()) return;
	 // var oldNumOfTiles = document.getElementsByClassName('tile').length;
	//triggerKey(gameOver() ? " " : move(getTiles()));
	// if (oldNumOfTiles === document.getElementsByClassName('tile').length)
	triggerKey(randomMove());

	setTimeout(tick, 200); // Step ms
})();