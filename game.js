
function Matrix(containerId, row, col)
{
	this.containerId = containerId;

	this.row = row;
	this.col = col;

	this.create = function()
	{
		var matrix = document.getElementById(this.containerId);
		var n = this.row * this.col;

		matrix.innerHTML = '';

		for (var i = 0; i < n; i++)
		{
			var div = document.createElement('div');
			div.className = 'cell';
			div.row = Math.floor(i / col);
			div.col = i % row;
			div.id=['cellId', div.row, div.col].join('');
			matrix.appendChild(div);
		}
	}
}

function setId()
{
	var matrix = document.getElementById('matrix1');
	var divs = matrix.childNodes;
	alert(divs);
}

window.onload = function()
{
	setId();
}
