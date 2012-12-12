/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function GcsaBrowserWidget(args){
	var _this=this;
	this.id = "GcsaBrowserWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
    this.tags=null;
	
   	this.width = 900;
	this.height = 600;
    
	this.retrieveData=true;

    if (args != null){
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
        if (args.retrieveData!= null){
        	this.retrieveData = args.retrieveData;       
        }
        if (args.notAvailableSuites!= null){
        	for(var i=0; i<args.notAvailableSuites.length; i++) {
        		this.notAvailableSuiteList.push(args.notAvailableSuites[i]);       
        	}
        }
        if (args.onAccountDataUpdate!= null){
        	this.onAccountDataUpdate = args.onAccountDataUpdate;       
			this.onAccountDataUpdate.addEventListener(function (sender, data){
				this.accountData = data;
				console.log("------------------------------------------------")
			});
        }
    }
    
    this.adapter = new GcsaManager();


    
	//this.adapter.onGetData.addEventListener(function (sender, data){
		//_this.data=data;
		//_this.adapter.getSuiteList();
	//});	
	//this.adapter.onSuiteList.addEventListener(function (sender, data){
		//_this.suiteList = data;
		//console.log(data);
		//Ext.getBody().unmask();
		//_this.render();
	//});	
	
	this.onSelect = new Event(this);

	this.onNeedRefresh = new Event(this);


	this.rendered = false;
	/**ID**/
	this.searchFieldId = this.id + "_searchField";
};

GcsaBrowserWidget.prototype.setAccountData = function (data){
	this.accountData = data;
	if(this.rendered){
		this._updateFolderTree();
	}
}

GcsaBrowserWidget.prototype._updateFolderTree = function (){
	console.log("updating folder tree")
	var _this=this;
	if(this.accountData.accountId!=null){
		this.folderStore.getRootNode().removeAll();
		var files2 = [];
		for ( var i = 0; i < this.accountData.projects.length; i++) {
			var files = [];
			for ( var j = 0; j < this.accountData.projects[i].data.length; j++) {
				files.push({text:this.accountData.projects[i].data[j].creationTime, iconCls:"icon-blue-box", leaf:true});
				files2.push(this.accountData.projects[i].data[j]);
			}
			this.folderStore.getRootNode().appendChild({text:this.accountData.projects[i].name, iconCls:"icon-box", expanded:true, children:files});
		}
		this.filesStore.loadData(files2);
	}		
};

GcsaBrowserWidget.prototype.draw = function (sessionID, tags){
	//Ext.getBody().mask("Loading...");
	//this.adapter.getData(sessionID, -1);
	this.render();
	this.rendered = true;
};

GcsaBrowserWidget.prototype.render = function (){
	var _this=this;
	if (this.panel == null){
		
		this.folderStore = Ext.create('Ext.data.TreeStore',{
			fields:['text'],
			root:{
				expanded: true,
				children: []
			}
		});
		
		this.filesStore = Ext.create('Ext.data.Store', {
			fields:['id', 'type', 'fileName','multiple','diskUsage','creationTime','responsible','organization','date','description','status','statusMessage','members'],
			data:[]
		});
		this._updateFolderTree();

		this.grid = Ext.create('Ext.tree.Panel', {
			//xtype:"treepanel",
			id:this.id+"activeTracksTree",
			title:"My Projects",
			bodyPadding:"5 0 0 0",
			margin:"-1 0 0 0",
			border:false,
			autoScroll:true,
			flex:4,
			useArrows:true,
			rootVisible: false,
			hideHeaders:true,
			selType: 'cellmodel',
			plugins: [Ext.create('Ext.grid.plugin.CellEditing', {clicksToEdit: 2,listeners:{
						edit:function(editor, e, eOpts){
							var record = e.record;
						}
					}})],
			columns: [{
				xtype: 'treecolumn',
				dataIndex: 'text',
				flex:1,
				editor: {xtype: 'textfield',allowBlank: false}
			},
			//{
				//xtype: 'actioncolumn',
				//menuDisabled: true,
				//align: 'center',
				//tooltip: 'Edit',
				//width:20,
				//icon: Compbio.images.edit,
				//handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
					//event.stopEvent();
					//if(record.isLeaf()){
						//var id = record.data.trackId;
						//var track = _this.getTrackSvgById(id);
						//if(track != null){
							//var trackSettingsWidget = new TrackSettingsWidget({
								//trackSvg:track,
								//treeRecord:record
							//});
						//}
					//}
				//}
			//},
			{
				xtype: 'actioncolumn',
				menuDisabled: true,
				align: 'center',
				tooltip: 'Remove',
				width:30,
				icon: Compbio.images.del,
				handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
					//this also fires itemclick event from tree panel
						_this.onNeedRefresh.notify();
					if(record.isLeaf()){
						var id = record.data.trackId;
						var checked = record.data.checked;
						record.destroy();
						if(checked){
							_this.removeTrack(id);
						}
					}
				}
			}],
			viewConfig: {
				markDirty:false,
				plugins: {
					ptype: 'treeviewdragdrop'
				},
				listeners : {
					drop : function (node, data, overModel, dropPosition, eOpts){
						var record = data.records[0];
						//check if is leaf and if the record has a new index
						if(record.isLeaf() && record.data.index != record.removedFrom && record.data.checked){
							var id = record.data.trackId;
							_this.setTrackIndex(id, record.data.index);
						}
					}
				}
			},
			listeners : {
				itemclick : function (este, record, item, index, e, eOpts){
					if(record.isLeaf()){
						if(record.data.checked){//track can be disabled, so if not checked does not exist in trackSvgLayout
							//this also fires remove button click event from tree panel action column	
							var id = record.data.trackId;
							_this.scrollToTrack(id);
							var trackSvg = _this.getTrackSvgById(id);
							if(trackSvg!=null){
								_this._loadTrackConfig(trackSvg,record);
							}
						}
					}
				},
				checkchange : function (node, checked){
					var type = node.data.trackType;
					var id = node.data.trackId;
					if(checked){
						var track = node.raw.track;
						_this.restoreTrack(track, node.data.index);
					}else{
						var track = _this.removeTrack(id);
						//save trackSvg pointer
						node.raw.track = track;
					}
				},
				itemmouseenter : function (este,record){
				},
				itemmouseleave : function (este,record){
				}
			},
			store: this.folderStore
		});
/*******************/
/*******************/
/*******************/
/*******************/
/*******************/
/*******************/
		/**ORIGIN FILTER**/
		var origins = [{ suiteId: "all",name:"all"},{ suiteId: "Uploaded Data",name:"Uploaded Data"},{ suiteId: "Job Generated",name:"Job Generated"}];
		
	 	var stOrigin = Ext.create('Ext.data.Store', {
	 		fields: ["suiteId","name"],
	 		data : origins
		});
		this.viewOrigin = Ext.create('Ext.view.View', {
		    store : stOrigin,
            selModel: {
                mode: 'SINGLE',
//                allowDeselect:true,
                listeners: {
                    //selectionchange:function(){_this.setFilter();}
                }
            },
            cls: 'list',
         	trackOver: true,
            overItemCls: 'list-item-hover',
            itemSelector: '.list-item',
            tpl: '<tpl for="."><div class="list-item">{name}</div></tpl>'
        });
        
        var panOrigin = Ext.create('Ext.panel.Panel', {
        	title:'Search by origin',
        	border:0,
        	bodyPadding:5,
        	style: 'border-bottom:1px solid #99bce8;',
		    items : [this.viewOrigin]
		});
        
		
        /**SUITE FILTER**/
		//var parsedSuites = JSON.parse(this.suiteList);
		var suites = [{name:"bam"},{name:"vcf"},{name:"gff"},{name:"gtf"},{name:"bed"}];
		// remove not available suites
		//for(var i = 0; i < parsedSuites.length; i++) {
			//if(this.notAvailableSuiteList.indexOf(parsedSuites[i].name)==-1){ // es que esta para quitar
				//suites.push(parsedSuites[i]);
			//}
		//}
		
        var stSuite = Ext.create('Ext.data.Store', {
	 		fields: ["suiteId","name","description"],
	 		data : suites
		});
		
		this.viewSuite = Ext.create('Ext.view.View', {
		    store : stSuite,
            selModel: {
                mode: 'SINGLE',
//                allowDeselect:true,
                listeners: {
                	selectionchange:function(){_this.setFilter();}
                }
            },
            cls: 'list',
         	trackOver: true,
            overItemCls: 'list-item-hover',
            itemSelector: '.list-item',
            tpl: '<tpl for="."><div class="list-item">{name}</div></tpl>'
        });
         
        var panSuite = Ext.create('Ext.panel.Panel', {
        	title:'Search by suite',
        	border:0,
        	bodyPadding:5,
		    items : [this.viewSuite]
		});

		
		/**TEXT SEARCH FILTER**/
        this.searchField = Ext.create('Ext.form.field.Text',{
        	 id:this.searchFieldId,
	         flex:1,
			 emptyText: 'enter search term',
			 enableKeyEvents:true,
			 listeners:{
			 	scope:this,
			 	change:this.setFilter
			 }
        });
        
        /**FILTER PANEL**/
         var panFilter = Ext.create('Ext.panel.Panel', {
			title:"Filtering",
		    border:false,
		    items : [panOrigin,panSuite],
		    tbar : {items:this.searchField}
		});

		/*MANAGE PROJECTS*/
		var newProjectButton = Ext.create('Ext.button.Button',{
        	text : 'OK',
        	handler : function() {
        		_this.createProject("newProject");
        		manageProjects.toggleCollapse();
        	}
        });
        var newProjectNameField = Ext.create('Ext.form.field.Text',{
        	id:this.id+"newProjectNameField",
        	width: 160,
        	emptyText: 'name',
        	allowBlank:false
        });
        var newProjectDescriptionField = Ext.create('Ext.form.field.TextArea',{
        	id:this.id+"newProjectDescriptionField",
        	width: 160,
        	emptyText: 'description'
        });
		var newProjectCont = Ext.create('Ext.container.Container', {
			flex:1,
			layout: { type: 'hbox',align: 'stretch'},
			items:[newProjectNameField,newProjectDescriptionField]
		});
		var manageProjects = Ext.create('Ext.panel.Panel', {
			title:"Project management",
			bodyPadding:5,
			border:false,
			items:[newProjectNameField,newProjectDescriptionField,newProjectButton]
		});
		/*END MANAGE PROJECTS*/

		/*TREE VIEW*/
		var filesGrid = Ext.create('Ext.grid.Panel', {
			title:"Files",
			store:this.filesStore,
			flex:4,
			border:false,
			columns: [
				{ text: 'Name',  dataIndex: 'fileName', flex:1 },
				{ text: 'Creation time', dataIndex: 'creationTime', flex:1 }
			]
		});
		/**/
		
		var panAccordion = Ext.create('Ext.panel.Panel', {
			minWidth: 125,
		    minHeight : 370,
			flex:1,
			cls:'panel-border-right',
		    border:false,
		    layout: 'accordion',
		    items : [this.grid, manageProjects, panFilter]
		});

		/**MAIN PANEL**/
//		this.height=205+(26*suites.length);//segun el numero de suites
		this.panel = Ext.create('Ext.window.Window', {
		    title: 'Browse Data',
		    resizable: false,
		    minimizable :true,
			constrain:true,
		    closable:true,
		    modal:true,
		    height:this.height,
		    width:this.width,
		    layout: { type: 'hbox',align: 'stretch'},
		    tbar:{items:[{text:'New project'}]},
		    items: [panAccordion,filesGrid],
		    buttonAlign:'right',
		    buttons:[
		             { text: 'Close', handler: function(){_this.panel.close();}},
		             this.selectButton
		             ],
		    listeners: {
			       scope: this,
			       minimize:function(){
			       		this.panel.hide();
			       },
			       destroy: function(){
			       		delete this.panel;
			       }
	        }
		});
	}//if null
	this.panel.show();
};

GcsaBrowserWidget.prototype.setFilter = function (){
	var _this=this;
	var recordOrigin = this.viewOrigin.getSelectionModel().getSelection()[0];
	var recordSuite = this.viewSuite.getSelectionModel().getSelection()[0];
	
	this.folderStore.clearFilter();
	
	if(recordOrigin!=null){
		switch(recordOrigin.data.suiteId){
			case  "all": 			break;
			case  "Uploaded Data": 	this.folderStore.filter(function(item){return item.data.jobId < 0;}); break;
			case  "Job Generated": 	this.folderStore.filter(function(item){return item.data.jobId > 0;}); break;
		}
	}
	if(recordSuite!=null){
		switch(recordSuite.data.suiteId){
			case  1: 				break;
			default : 				this.folderStore.filter(function(item){return item.data.suiteId == recordSuite.data.suiteId;});
		}
	}
	
	this.folderStore.filter(function(item){
			var str = Ext.getCmp(_this.searchFieldId).getValue().toLowerCase();
			if(item.data.name.toLowerCase().indexOf(str)<0){
				return false;
			}
			return true;
		});
};

GcsaBrowserWidget.prototype.checkTags = function(tags){
	for(var i = 0; i < this.tags.length ; i++){
		if (this.tags[i].indexOf('|')>-1){
			var orTags = this.tags[i].split('|');
			var orMatch = false;
			for(var j = 0; j < orTags.length ; j++){
				if (tags.indexOf(orTags[j]) >-1){
					orMatch=true;
				}
			}
			if(!orMatch){
				return false;
			}
		}else{
			if (tags.indexOf(this.tags[i])==-1){
				return false;
			}
		}
	}
	return true;
	
};



GcsaBrowserWidget.prototype.createProject = function (){
	var _this = this;
	var name = Ext.getCmp(this.id+"newProjectNameField").getValue();
	var desc = Ext.getCmp(this.id+"newProjectDescriptionField").getValue();
	if(name!=""){
		this.adapter.onCreateProject.addEventListener(function (sender, data){
			if(data.indexOf("ERROR") != -1) {
				Ext.Msg.alert("Create project", "ERROR: could not create this project.");
			}
			else {
				//_this.refreshListProject();
			}
			_this.panel.setLoading(false);
			Ext.getBody().unmask();
			_this.adapter.onCreateProject.removeEventListener();
		});
		Ext.getBody().mask();
		_this.panel.setLoading("Creating project");
		this.adapter.createProject(name, desc, $.cookie("bioinfo_account"), $.cookie("bioinfo_sid"));
	}
};