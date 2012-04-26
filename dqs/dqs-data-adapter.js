DqsDataAdapter.prototype.toJSON = DataAdapter.prototype.toJSON;


function DqsDataAdapter(args){
	DataAdapter.prototype.constructor.call(this);
	this.dqsManager = null;
	
	this.dataset = new FeatureDataSet();
	
	this.resource = null;
	this.autoFill = true;
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		if (args.resource != null){
			this.resource = args.resource;
		}
	}
	
	this.preloadSuccess = new Event(this);
	this.successed = new Event();
	
	
	/** DataSet hashMaps **/
	this.datasets = new Object();
	
	this.lockSuccessEventNotify = false;
	
	this.chunkSize = 1000;
};

DqsDataAdapter.prototype._getHashMapKey = function(chromosome, start, end){
	var chunkNum = start/this.chunkSize;
//	return chromosome + "-" + start + "-" + end;
	return chromosome + "-" + chunkNum;
};
DqsDataAdapter.prototype.isRegionAvalaible = function(chromosome, start, end){
	var chunkStart = start/this.chunkSize;
	var chunkEnd = parseInt(end/this.chunkSize);
	for ( var i = chunkStart; i <= chunkEnd; i++) {
		var key = chromosome+"-"+i;
		this.datasets[key]= new Object();
		this.datasets[key]["data"]= new Array();
	}
	
	return this.datasets[this._getHashMapKey(chromosome, start, end)] != null;
};


DqsDataAdapter.prototype.fill = function(chromosome, start, end, resource){
	var _this = this;
	if ((chromosome == null)|| (start == null) || (end == null) || (resource == null)){
		throw "Missing value in a not optional parameter: chromosome, start or end";
	}
	
	var chunkStartId = Math.floor(start/this.chunkSize);
	var chunkEndId = Math.floor(end/this.chunkSize);
	var chunkStart = chunkStartId*this.chunkSize;
	var chunkEnd = (Math.ceil(end/this.chunkSize)*this.chunkSize)-1;
	
	
	
//	console.log("primer fill "+ chunkStart +"--"+ chunkEnd)
	
//	var startWs=chunkStart;
//	var endWs=chunkEnd;
//	for ( var i = chunkStartId; i <= chunkEndId; i++) {
//		var key = chromosome+"-"+i;
//		if(this.datasets[key]!=null){
//			//si lo tiene
//			startWs = startWs+this.chunkSize();
//		}
//	}
	
	
	
	this.dqsManager = new DqsManager();
	this.dqsManager.onBamRegion.addEventListener(function (evt, data){
			_this.getFinished(data, chromosome, chunkStart, chunkEnd);
	});
	this.dqsManager.bamRegion(resource, chromosome+":"+chunkStart+"-"+chunkEnd);
};

DqsDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
	da = this.datasets;
	var chunkStart = start/this.chunkSize;
	var chunkEnd = parseInt(end/this.chunkSize);
	for ( var i = chunkStart; i <= chunkEnd; i++) {
		var key = chromosome+"-"+i;
		if(this.datasets[key] == null){
			this.datasets[key] = new Object();
		}
		if(this.datasets[key]["data"]==null){
			this.datasets[key]["data"] = new Array();
		}
	}
	
	for ( var i = 0; i < data.length; i++) {
		var item = data[i];
		var key = chromosome+"-"+Math.floor(item.start/this.chunkSize);
			this.datasets[key]["data"].push(item);
	}
	
	this.dataset.loadFromJSON(data);
//	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	console.log(this.datasets);
	this.successed.notify(data);
};

DqsDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	var chunkStart = start/this.chunkSize;
	var chunkEnd = parseInt(end/this.chunkSize);
	for ( var i = chunkStart; i <= chunkEnd; i++) {
		var key = chromosome+"-"+i;
		if(this.datasets[key] == null){
			this.datasets[key] = new Object();
		}
		if(this.datasets[key]["data"]==null){
			this.datasets[key]["data"] = new Array();
		}
	}
	
	for ( var i = 0; i < data.length; i++) {
		var item = data[i];
		var key = chromosome+"-"+Math.floor(item.start/this.chunkSize);
			this.datasets[key]["data"].push(item);
	}
	
	this.dataset.loadFromJSON(data);
//	this.datasets[this._getHashMapKey(chromosome, start, end)] = data;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};



DqsDataAdapter.prototype.getFeaturesByPosition = function(position){
	var features =  new Array();
	var featuresKey = new Object();
	console.log(this.datasets);
	for (var dataset in this.datasets){
		features = this.datasets[dataset].toJSON();
		for ( var g = 0; g < features.length; g++) {
			var feature = features[g];
			
			if ((feature.start <= position)&&(feature.end >= position)&&(featuresKey[feature.id]==null)){
				features.push(feature);
				featuresKey[feature.id] = true;
			}
		}
	}
//	console.log(features.length);
	return features;
};


DqsDataAdapter.prototype.setIntervalView = function(chromosome,  middleView){
		
//	var actualChunk = Math.floor(middleView/this.chunkSize);
////	var prevChunk = actualChunk-1;
////	var nextChunk = actualChunk+1;
//
//	var start = prevChunk*this.chunkSize;
//	var end = (nextChunk+1)*this.chunkSize-1;
//
//	
//	if(this.datasets[chromosome+"-"+prevChunk]!=null){
//		var start = prevChunk*this.chunkSize;
//	}
//	
//	if(this.datasets[chromosome+"-"+actualChunk]){
//		
//	}
//	
//	this.fill(chromosome, start, end, this.resource);
//
//	console.log(start+" - "+end);

};


//DqsDataAdapter.prototype.arrayToString = function(array, separator){
//	var str = new StringBuffer();
//	for(var i = 0; i < array.length; i++){
//		if(i != array.length-1)
//			str.append(array[i]+separator);
//		else
//			str.append(array[i]);
//	}
//	return str.toString();
//};