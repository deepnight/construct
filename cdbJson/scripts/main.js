/****************************************************************************************
 PLEASE EDIT THE FOLLOWING
****************************************************************************************/

function initLibraryReferences(runtime) {
	// This is the name of the ITEM DICTIONARY in the project library
	infoObjectRef = runtime.objects.ItemInfo;

	// These are the names of all the ICON OBJECTS in the project library.
	// Add one "push" line for each ICON OBJECT in the project.
	iconObjectRefs.push( runtime.objects.ItemIcon );
}

function copyValuesFromCdb(itemDictionaryInstance, itemJson, pngString) {
	// Fill ICON DICTIONARY instance fields
	itemDictionaryInstance.instVars.id = itemJson.id;
	itemDictionaryInstance.instVars.name = itemJson.name;
	itemDictionaryInstance.instVars.iconPngString = pngString;
}







/****************************************************************************************
 INTERNAL CODE (do not modify)
****************************************************************************************/

var infoObjectRef;
var iconObjectRefs = [];

// Boot script
runOnStartup(async runtime =>{
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime) {
	initLibraryReferences(runtime);
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

		// Load JSON
		url = await runtime.assets.getProjectFileUrl(cdbPath);
		var cdbJson = await runtime.assets.fetchJson(url);

		// Iterate JSON items
		cdbJson.sheets[0].lines.forEach(rowJson => {
			// Create info instance
			var infoInstance = infoObjectRef.createInstance(0, 0,0);

			// Create animations
			iconObjectRefs.forEach(iconObjectRef => {
				iconObjectRef.addAnimation(rowJson.id);
			});

			// Extract icon PNG data
			var tile = rowJson.icon;
			var pngBase64 = extractImageToPngBase64(atlasImg, tile.x*tile.size, tile.y*tile.size, tile.size, tile.size);

			// Fill instance fields
			copyValuesFromCdb(infoInstance, rowJson, pngBase64);
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
function extractImageToPngBase64(sourceImg,x,y,width,height) {
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = width;
    tmpCanvas.height = height;
	tmpCanvas.getContext("2d").drawImage(
        sourceImg,
        x,y,width,height,
        0,0,width,height
	);
	return tmpCanvas.toDataURL("image/png");
}

// Converts a Blob to an Image
async function blobToImage(blob) {
	let img = new Image();
	img.src = await URL.createObjectURL(blob);
	return img;
};
