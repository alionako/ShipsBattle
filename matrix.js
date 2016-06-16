function matrixInit() {
 	var matrix = document.getElementById('ourField');
	var n = 100;

	for (var i = 0; i < n; i++)
	{
		var div = document.createElement('div');
		div.row = Math.floor(i / 10);
		div.col = i % 10;
		div.id=['cellId', div.row, div.col].join('');
		matrix.appendChild(div);
	}
}