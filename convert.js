(function() {
	var canvas = document.getElementById('canvas');
	var width = 200,
		height = 113,
		gapX = width + 10,
		gapY = height + 10;
	canvas.width = screen.width;
	canvas.height = screen.height;
	var tolerance = 50;
	var ctx = canvas.getContext('2d');

	var img = new Image();
	img.src = './imgs/2.jpg';
	img.onload = function() {
		ctx.drawImage(this, 0, 0, width, height);
		setGary(); //灰化
		removeWhite(tolerance); //去白色
		setReverse(); //反向
		setVintga(); //复古
		setLighter(50); //变亮
		threshold(50); //阈值
		setBlur(10); //模糊
		setRelief(); //浮雕
	}

	function setRelief() {
		var imageData = ctx.getImageData(0, 0, width, height);
		var length = imageData.data.length;
		for (var index = 0; index < length; index += 4) {
			if ((index + 1) % 4 !== 0) { // 每个像素点的第四个（0,1,2,3  4,5,6,7）是透明度。这里取消对透明度的处理
				if ((index + 4) % (width * 4) == 0) { // 每行最后一个点，特殊处理。因为它后面没有边界点，所以变通下，取它前一个点
					imageData.data[index] = imageData.data[index - 4];
					imageData.data[index + 1] = imageData.data[index - 3];
					imageData.data[index + 2] = imageData.data[index - 2];
					imageData.data[index + 3] = imageData.data[index - 1];
					index += 4;
				} else { // 取下一个点和下一行的同列点
					imageData.data[index] = 255 / 2 + 2 * imageData.data[index] - imageData.data[index + 4] - imageData.data[index + width * 4];
				}
			} else { // 最后一行，特殊处理
				if ((index + 1) % 4 !== 0) {
					imageData.data[index] = imageData.data[index - width * 4];
				}
			}
		}
		ctx.putImageData(imageData, gapX * 2, gapY * 2);
	}

	function setBlur(value) {
		var imageData = ctx.getImageData(0, 0, width, height);
		ctx.putImageData(imageData, gapX * 2, gapY);
		stackBlurCanvasRGBA("canvas", gapX * 2, gapY, width, height, value);
	}

	function threshold(threshold) {
		var imageData = ctx.getImageData(0, 0, width, height);
		var length = imageData.data.length;
		for (var index = 0; index < length; index += 4) {
			var r = imageData.data[index];
			var g = imageData.data[index + 1];
			var b = imageData.data[index + 2];

			var average = (r + g + b) / 3;

			imageData.data[index] = average > threshold ? 255 : 0;
			imageData.data[index + 1] = average > threshold ? 255 : 0;
			imageData.data[index + 2] = average > threshold ? 255 : 0;
		}
		ctx.putImageData(imageData, gapX, gapY * 3);
	}

	function setLighter(brightVal) {
		var imageData = ctx.getImageData(0, 0, width, height);
		var length = imageData.data.length;
		for (var index = 0; index < length; index += 4) {
			imageData.data[index] += brightVal;
			imageData.data[index + 1] += brightVal;
			imageData.data[index + 2] += brightVal;
		}
		ctx.putImageData(imageData, gapX, gapY * 2);
	}

	function setVintga() {
		var imageData = ctx.getImageData(0, 0, width, height);
		var length = imageData.data.length;
		for (var index = 0; index < length; index += 4) {
			var r = imageData.data[index];
			var g = imageData.data[index + 1];
			var b = imageData.data[index + 2];
			var a = imageData.data[index + 3];

			imageData.data[index] = (r * 0.393) + (g * 0.769) + (b * 0.189);
			imageData.data[index + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
			imageData.data[index + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
		}
		ctx.putImageData(imageData, gapX, gapY);
	}

	function setReverse() {
		var imageData = ctx.getImageData(0, 0, width, height);
		var length = imageData.data.length;
		for (var index = 0; index < length; index += 4) {
			var r = imageData.data[index];
			var g = imageData.data[index + 1];
			var b = imageData.data[index + 2];
			var a = imageData.data[index + 3];

			imageData.data[index] = 255 - r;
			imageData.data[index + 1] = 255 - g;
			imageData.data[index + 2] = 255 - b;
		}
		ctx.putImageData(imageData, 0, gapY * 3);
	}

	function setGary() {
		var imageData = ctx.getImageData(0, 0, width, height);
		var length = imageData.data.length;
		for (var index = 0; index < length; index += 4) {
			var r = imageData.data[index];
			var g = imageData.data[index + 1];
			var b = imageData.data[index + 2];
			var a = imageData.data[index + 3];

			// var gray = r * 0.2126 + g * 0.7152 + b * 0.0722;
			var average = (r + g + b) / 3;
			imageData.data[index] = average;
			imageData.data[index + 1] = average;
			imageData.data[index + 2] = average;
		}
		ctx.putImageData(imageData, 0, gapY);
	}

	function removeWhite(tolerance) {
		var imageData = ctx.getImageData(0, 0, width, height);
		var length = imageData.data.length;
		for (var index = 0; index < length; index += 4) {
			var r = imageData.data[index];
			var g = imageData.data[index + 1];
			var b = imageData.data[index + 2];
			var a = imageData.data[index + 3];

			var square = Math.sqrt((r - 255) * (r - 255) + (g - 255) * (g - 255) + (b - 255) * (b - 255));
			if (square <= tolerance) {
				imageData.data[index] = 0;
				imageData.data[index + 1] = 0;
				imageData.data[index + 2] = 0;
				imageData.data[index + 3] = 0;
			} else {
				imageData.data[index] = r;
				imageData.data[index + 1] = g;
				imageData.data[index + 2] = b;
				imageData.data[index + 3] = a;
			}
		}
		ctx.putImageData(imageData, 0, gapY * 2);
	}
})()