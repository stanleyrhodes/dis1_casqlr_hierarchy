// This reads full-text from Zotero items and writes them to files that contain JSON.
// The set of items can be spliced into smaller or larger files.
// The results are all on one line, so I viewed them in vs code and parsed them with ijson
// so I wouldn't hang my machine or take up too much memory.

// WARNING: PDF file names in Zotero cannot have characters beyond ASCII.
// If any do, this script will end prematurely. 

// This script is pasted into the window opened with the Zotero option
// Tools > Developer > Run JavaScript
// and run from there.
// Only items with PDFs should be highlighted when this script is run.

function arrayToJSONObject (arr){
    //header
    var keys = arr[0];
 
    //vacate keys from main array
    var newArr = arr.slice(1, arr.length);
 
    var formatted = [],
    data = newArr,
    cols = keys,
    l = cols.length;
    for (var i=0; i<data.length; i++) {
            var d = data[i],
                    o = {};
            for (var j=0; j<l; j++)
                    o[cols[j]] = d[j];
            formatted.push(o);
    }
    return formatted;
}

var items = Zotero.getActiveZoteroPane().getSelectedItems();
var enchilada = [];
enchilada.push(["key","title","fulltext"])

//var logpath = '/Users/Rock/Downloads/0500_zot2json.txt';
//var counter = 0

var item_counter = 1
var splice_num = 250
var items_ttl_len = items.length

for (var item in items) {	

    var itemobj = items[item];
	
    if (itemobj.isRegularItem()) { // not an attachment already
		let keytitlefull = [];
		let keyvalue = itemobj.key; 
		let titlevalue = itemobj.getField('title');
		
		//var counter = counter + 1
		//let itempath = logpath.replace("0500", String(counter));
		//await Zotero.File.putContentsAsync(itempath, titlevalue);

		keytitlefull.push(keyvalue);
		keytitlefull.push(titlevalue);
		
		let attachmentIDs = itemobj.getAttachments();
        for (let id of attachmentIDs) {
            let attachment = Zotero.Items.get(id);
            if (attachment.attachmentContentType == 'application/pdf'
                    || attachment.attachmentContentType == 'text/html') {
                keytitlefull.push(await attachment.attachmentText);
            }
        }
		enchilada.push(keytitlefull)
	}
	
	if (item_counter % splice_num == 0) {
	
		let thejson = arrayToJSONObject(enchilada);
		let jsonFile = JSON.stringify(thejson);
		let path = '/Users/Rock/Downloads/' + item_counter.toString() + '_zot2json.json';
		await Zotero.File.putContentsAsync(path, jsonFile);
		
		var enchilada = [];
		enchilada.push(["key","title","fulltext"])
		
	}
	
	if (item_counter == items_ttl_len) {
	
		let thejson = arrayToJSONObject(enchilada);
		let jsonFile = JSON.stringify(thejson);
		let path = '/Users/Rock/Downloads/' + item_counter.toString() + '_zot2json.json';
		await Zotero.File.putContentsAsync(path, jsonFile);
		
		var enchilada = [];
		enchilada.push(["key","title","fulltext"])
		
	}
	
	var item_counter = item_counter + 1
}
