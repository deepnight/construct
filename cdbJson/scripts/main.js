runOnStartup(async runtime =>{
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime) {
	loadCdbJson(runtime, "res/data.cdb", "finalbossblues-icons_full_16.png");
}

async function loadCdbJson(runtime, cdbPath, iconAtlasPath) {
	try {
		// Load atlas blob
		let url = await runtime.assets.getProjectFileUrl(iconAtlasPath);
		let atlasBlob = await runtime.assets.fetchBlob(url);
		let atlasImg = await blobToImage(atlasBlob);

		// Create temporary item icon instance to load images
		var tmpItemIconInst = runtime.objects.ItemIcon.createInstance(0, 0,0);
		tmpItemIconInst.x = -32;

		// Load CDB JSON
		url = await runtime.assets.getProjectFileUrl(cdbPath);
		var cdbJson = await runtime.assets.fetchJson(url);

		// Parse item IDs and prepare empty anims
		cdbJson.sheets[0].lines.forEach(rowJson => {
			runtime.objects.ItemIcon.addAnimation(rowJson.id);
		});

		// Parse json items
		cdbJson.sheets[0].lines.forEach(rowJson => {
			// Create item icon instance
			var itemInfoInst = runtime.objects.ItemInfo.createInstance(0, 0,0);

			// Base item fields
			itemInfoInst.instVars.id = rowJson.id;
			itemInfoInst.instVars.name = rowJson.name;

			// Set icon
			var iconInfo = rowJson.icon;
			extractImageToCanvas(atlasImg, iconInfo.x*iconInfo.size, iconInfo.y*iconInfo.size, iconInfo.size, iconInfo.size, async function(blob) {
				tmpItemIconInst.setAnimation(rowJson.id);
				await tmpItemIconInst.replaceCurrentAnimationFrame(blob);
				tmpItemIconInst.width = 16;
				tmpItemIconInst.height = 16;
			});
		});

		var itemIconInst = runtime.objects.ItemIcon.createInstance(0, 50,50);
		itemIconInst.setAnimation("Life");
		itemIconInst.setSize(16,16);
	}
	catch( err ) {
		console.error(err);
		alert(err);
	}
}

function extractImageToCanvas(sourceImg,x,y,width,height, onBlob) {
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = width;
    tmpCanvas.height = height;
	tmpCanvas.getContext("2d").drawImage(
        sourceImg,
        x,y,width,height,
        0,0,width,height
	);
	tmpCanvas.toBlob(onBlob);
}


async function blobToImage(blob) {
	let img = new Image();
	img.src = await URL.createObjectURL(blob);
	return img;
};
