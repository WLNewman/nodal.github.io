const graph = document.getElementById('graph');
const con = graph.getContext('2d');
const font = con.font = " 12px Trebuchet MS";


graph.addEventListener('DOMContentLoaded', init());
graph.addEventListener('mouseup', createNode);
graph.addEventListener('mouseup', drawEdges);
document.addEventListener('keydown', keyPress);
document.addEventListener('mousemove', changeNode);
graph.addEventListener('click', disp);


let nodeList = [];
let first = 0;
let n = 0;
let num = 1;
let stop = false;
let mouseX = 0;
let mouseY = 0;


class Node {
	constructor(x, y, color, sisters) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.sisters = sisters;
		this.distance = 99999999999;
		this.previous = [];
		// weight is edge weight same index as sisters
		this.weight = []
		this.weight.push(1);
		nodeList.push(this);
	}

	// following draws when created
	draw() {
		con.beginPath();
   		con.arc(this.x, this.y, 5, 0, Math.PI * 2, true);
		con.fillStyle = this.color;
		con.fill();
		con.closePath();
	}

	addSister(node) {
		this.sisters.push(node);
		this.weight.push(1);
	}

	deleteSelf() {
		// delete reference to self as sister
		let s = 0;
		for (s in this.sisters) {
			this.sisters[s].removeSister(this);
		}
	}
	removeSister(n) {
		let x = this.sisters.indexOf(n);
		this.sisters.splice(x, 1);
		this.weight.splice(x, 1);
	}

	notSister(n) {
		// used to verify no parallel edges don't know why I needed to declare s
		let s = 0;
		for (s in this.sisters) {
			if (this.sisters[s] == n) {
				return false;
			}
		}
		return true;
	}

	showSisters() {
		let sortedSisters = []
		let sis = 0;
		console.log('fu');

		for (sis in this.sisters){
			console.log('fuu');

			sortedSisters.push(this.sisters[sis]);
		}
		//bubble sort bad, I know but there's only a few elements per list
		let sorting = true;
		while (sorting == true && sortedSisters.length > 1) {
			sorting = false
			console.log('fuuu');
			for (s in (sortedSisters.length - 1)){
				if (sortedSisters[s].weight[s] > sortedSisters[s + 1].weight[s]){
					sorting = false;
					let index1 = sortedSisters[s];
					let index2 = sortedSisters[s+1];
					sortedSisters[s] = index2;
					sortedSisters[s + 1] = index1;
				}
			}
		}
		return sortedSisters;
	}


	changeDistance(n) {
		this.distance = n;
	}

	changePrevious(n) {
		this.previous = n;
	}

	changeColor(c) {
		this.color = c;
	}

	changeXY(x, y) {
		this.x = x;
		this.y = y;
	}

	changeWeight(s, num) {
		let ind = this.sisters.indexOf(s);
		this.weight[ind] += num;
	}

	findWeight(s) {
		let x = this.sisters.indexOf(s);
		return this.weight[x];
	}

	drawArrow() {
		for (var s=0; s < this.sisters.length; s++) {
			con.beginPath();

			let endX = this.sisters[s].x;
			let endY = this.sisters[s].y; 

			con.moveTo(this.x, this.y);
			con.lineTo(endX, endY);

			let r = 7;

			let dx = endX - this.x;
			let dy = endY - this.y;
			let angle = Math.atan2(dy,dx);			

			angle += (1.2/3.0) * (2 * Math.PI)
			let x = r *Math.cos(angle) + endX;
			let y = r *Math.sin(angle) + endY;

			con.moveTo(x, y);
			con.lineTo(endX,endY);

			con.strokeStyle = 'Aquamarine';
			con.stroke();

			angle += (-1.8) * (2 * Math.PI)
			x = r *Math.cos(angle) + endX;
			y = r *Math.sin(angle) + endY;

			con.lineTo(x,y);
			con.fillStyle = 'dimGray';
			con.fill();
			
			con.closePath();

			// draw weight

			con.fillStyle = 'pink';
			let midX = (20 + endX + this.x) / 2;
			let midY = (20 + endY + this.y) / 2;
			con.fillText(this.weight[s], midX, midY);
		}
	}
}


function erase() {
	// the erase button
	nodeList = [];
	first = 0;
	con.fillStyle = 'black';
	con.fillRect(0, 0, window.innerWidth, window.innerHeight);
	console.log("clear");
}

function init() {
	// set up the canvas for drawing
	let canvas = document.getElementById('graph');
	if(graph.getContext) {
		let con = graph.getContext('2d');

		con.canvas.width = window.innerWidth;
		con.canvas.height = window.innerHeight;

		console.log('success');
	}
}


function createNode() {
	if (first == 0) {
		first = new Node((0.5 * window.innerWidth), (0.5 * window.innerHeight), 'orange', []);
		let p = document.getElementById('prompt');
		p.style.display = 'none';
	}
	else {
		for (n in nodeList)
			// hitbox
			diff = pythagoras(event.clientX, event.clientY, nodeList[n].x, nodeList[n].y);
			// making sure they don't overlap
			console.log(diff);
			if (diff > 15){
				n = new Node(event.clientX, event.clientY, 'white', [first]);
				first.addSister(n);
			}
			else {
				console.log("verbooten!");
			}
		}
	updateDraw();
	}

function changeNode() {
	mouseX = event.clientX;
	mouseY = event.clientY;

	for (n in nodeList) {
		// hitbox
		diff = pythagoras(mouseX, mouseY, nodeList[n].x, nodeList[n].y);
		if (diff <= 12){
			first.changeColor('white');
			first = nodeList[n];
			first.changeColor('orange');
			updateDraw();
		}
	}
}

function keyPress() {
	switch (event.key) {
		case " ":
			// link two unjoined edges
			for (n in nodeList){
				if (nodeList[n] !== first){
					// prevent looping
					diff = pythagoras(mouseX, mouseY, nodeList[n].x, nodeList[n].y);
					console.log(diff);
					if (diff < 25) {
						// prevent parallel edges
						if (first.notSister(nodeList[n])){
							first.addSister(nodeList[n]);
							nodeList[n].addSister(first);
						}
					}
				}
			}	
			break;
		case "Shift":
			//drag n drop
			first.changeXY(mouseX, mouseY);
			break;

		case "Control":
		// remove edges/nodes
			if (nodeList.length > 1) { //prevents glitch on empty list
				for (n in nodeList){
					diff = pythagoras(mouseX, mouseY, nodeList[n].x, nodeList[n].y);

					//delete first
					if (nodeList[n] === first && diff < 10) {
						nodeList[n].deleteSelf();
						nodeList.splice(n, 1);
						first = nodeList[0];
						first.changeColor('orange');
					}
					//delete edge between first and other
					 else if (nodeList[n] !== first && diff < 25) {
						first.removeSister(nodeList[n]);
						nodeList[n].removeSister(first);
					}
				}	
			}
			break;

		//decrease weight
		case 'Left':
		case 'ArrowLeft':
			for (n in nodeList){
				diff = pythagoras(mouseX, mouseY, nodeList[n].x, nodeList[n].y);
				
				//delete edge between first and other
				if (nodeList[n] !== first && diff < 25) {
					first.changeWeight(nodeList[n], -1);
					nodeList[n].changeWeight(first, -1);
				}
			}
			break;	
		//increase weight
		case 'Right':
		case 'ArrowRight':
			for (n in nodeList){
				diff = pythagoras(mouseX, mouseY, nodeList[n].x, nodeList[n].y);
				
				//delete edge between first and other
				if (nodeList[n] !== first && diff < 25) {
					first.changeWeight(nodeList[n], 1);
					nodeList[n].changeWeight(first, 1);
				}
			}
			break;	


		case "Enter":
			let copy = [];
			for (n in nodeList) {
				copy.push(nodeList[n]);
			}
			for (n in nodeList){
				diff = pythagoras(mouseX, mouseY, nodeList[n].x, nodeList[n].y);
				
				//activate dijkstra
				if (nodeList[n] !== first && diff < 25) {
					dijkstra(copy, first, nodeList[n]);
				}
			}
			break;	
		}
		updateDraw();
	}




function pythagoras(x1, y1, x2, y2) {
	let dx = (x1 - x2);
	let dy = (y1 - y2);
	let diff = Math.sqrt((dx ** 2) + (dy ** 2));
	return diff;
}

function updateDraw() {
	// when graph changes call this to update
	con.fillStyle = 'black';
	con.fillRect(0, 0, window.innerWidth, window.innerHeight);
	for (n in nodeList) {
		nodeList[n].draw()
	}
	drawEdges();
}

function drawEdges() {
	for (n in nodeList) {
		nodeList[n].drawArrow();
	}
}



function menu(menu) {
	// display a hidden menu's contents
	let i = document.getElementById(menu);
	if(i.style.display === "block"){
		i.style.display = "none";
	}
	else {
		i.style.display = "block";
	}
}

function disp() {
	for (n in nodeList) {
			console.log(nodeList[n]);		
	}
}

function dijkstra(list, source, target) {
	con.fillStyle = 'black';
	con.fillRect(0, 0, window.innerWidth, window.innerHeight);

	source.changeDistance(0);
	console.log("SOURCE");
	console.log(source);
	console.log(list);

	let visited = [];

	var len = list.length;

	while (list.length > 0) {
		let min = 100000000000;
		let activeNode = 'f';
		// console.log("LENGTH");
		// console.log(list.length);


		for (n in list) {
			if (list[n].distance < min) {
				min = list[n].distance;
				activeNode = list[n];
			}
		}
		// console.log('ACTIVE')
		// console.log(activeNode);
		visited.push(activeNode);
		list.splice(list.indexOf(activeNode), 1);

		// sis = activeNode.showSisters();
		let sis = activeNode.sisters;
		// console.log('sis');
		// console.log(sis);
		// console.log(activeNode.sisters);
		for (s in sis) {
			// BELOW SHOULD BE WEIGHT NOT .distance
			// ALSO DON'T FORGET TO SORT SIS LATER
			let altPath = activeNode.distance + activeNode.findWeight(sis[s]);
			if (altPath <= sis[s].distance){
				sis[s].changeDistance(altPath);
				sis[s].changePrevious(activeNode);
			}
		}
		// console.log('LOOP');
	}
	console.log('target distance:');

	console.log(target.distance);

	for (n in visited) {
		visited[n].changeDistance(99999999999);
		visited[n].changePrevious([]);
	}
}
