
function copyValues(itemInfoInstance, itemRowJson) {
	itemInfoInstance.instVars.id = itemRowJson.id;
	itemInfoInstance.instVars.name = itemRowJson.name;
}


// Boot script
runOnStartup(async runtime =>{
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime) {
	loadCdbJson(runtime, "res/data.cdb", "finalbossblues-icons_full_16.png");
}


// Loads a CDB JSON file and its associated icon atlas
async function loadCdbJson(runtime, cdbPath, iconAtlasPath) {
	try {
		let url;

		// Load atlas blob
		url = await runtime.assets.getProjectFileUrl(iconAtlasPath);
		let atlasBlob = await runtime.assets.fetchBlob(url);
		let atlasImg = await blobToImage(atlasBlob);

		// Create temporary item icon instance to load images
		var tmpItemIconInst = runtime.objects.ItemIcon.createInstance(0, 0,0);
		tmpItemIconInst.x = -32;

		// Load JSON
		url = await runtime.assets.getProjectFileUrl(cdbPath);
		var cdbJson = await runtime.assets.fetchJson(url);

		// Parse item IDs and prepare empty anims
		cdbJson.sheets[0].lines.forEach(rowJson => {
			runtime.objects.ItemIcon.addAnimation(rowJson.id);
		});

		// Iterate JSON items
		cdbJson.sheets[0].lines.forEach(rowJson => {
			// Create ItemInfo instance
			var itemInfoInst = runtime.objects.ItemInfo.createInstance(0, 0,0);

			// Fill ItemInfo fields
			copyValues(itemInfoInst, rowJson);

			// Extract icon
			var iconInfo = rowJson.icon;
			extractImageToCanvas(atlasImg, iconInfo.x*iconInfo.size, iconInfo.y*iconInfo.size, iconInfo.size, iconInfo.size, async function(blob) {
				// Store it in an Animation
				tmpItemIconInst.setAnimation(rowJson.id);
				await tmpItemIconInst.replaceCurrentAnimationFrame(blob);
				tmpItemIconInst.width = 16;
				tmpItemIconInst.height = 16;
			});
		});

		runtime.signal("pouet");
	}
	catch( err ) {
		// Error handling
		console.error(err);
		alert(err);
	}
}

// Extracts a region of an image to a new canvas and returns it as a Blob
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

// Converts a Blob to an Image
async function blobToImage(blob) {
	let img = new Image();
	img.src = await URL.createObjectURL(blob);
	return img;
};
