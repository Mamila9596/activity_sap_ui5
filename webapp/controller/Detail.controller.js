sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], (Controller,
	MessageToast,
    Fragment) => {
    "use strict";

    return Controller.extend("activity.controller.Detail", {
        onInit() {
            debugger;
            this.getView().setModel(new sap.ui.model.json.JSONModel([{}]), "localTaskDetail");
            this.getView().setModel(new sap.ui.model.json.JSONModel([{}]), "localTaskCategory");
            this.getView().setModel(new sap.ui.model.json.JSONModel([]), "localTaskNotes");
            this.getView().setModel(new sap.ui.model.json.JSONModel([]), "localTaskAtt");
            const oRouter = this.getOwnerComponent().getRouter();
            // Carica le categorie
            this.loadCategories();
            oRouter.getRoute("RouteDetail").attachPatternMatched(this._onRouteMatched, this);
        },
        onEditTask:function(){
            debugger;
            let statusText1 = this.getView().byId("text1").getEditable();
            if(statusText1 === true){
                this.getView().byId("text1").setEditable(false);
            } else{
                this.getView().byId("text1").setEditable(true);
            };
            let statusText2 = this.getView().byId("text2").getEditable();
            if(statusText2 === true){
                this.getView().byId("text2").setEditable(false);
            } else{
                this.getView().byId("text2").setEditable(true);
            };
            let statusText3 = this.getView().byId("text3").getEditable();
            if(statusText3 === true){
                this.getView().byId("text3").setEditable(false);
            } else{
                this.getView().byId("text3").setEditable(true);
            };
            let statusText4 = this.getView().byId("dateP1").getEditable();
            if(statusText4 === true){
                this.getView().byId("dateP1").setEditable(false);
            } else{
                this.getView().byId("dateP1").setEditable(true);
            };
            let statusText5 = this.getView().byId("text5").getEditable();
            if(statusText5 === true){
                this.getView().byId("text5").setEditable(false);
            } else{
                this.getView().byId("text5").setEditable(true);
            };
        },
        onSaveEdit:function(){
            const taskService = this.getOwnerComponent().getTaskService();
            this.getView().setBusy(true);
            const sId = this._taskId;
            const sTitle = this.getView().byId("text1").getValue();
            const sDescription = this.getView().byId("text2").getValue();
            const sDueDate = this.getView().byId("text4").getValue();
            const sCat = this.getView().byId("text5").getValue();
            const sCatId = this.getCategoryIdByName(sCat);
            const sPriority = this.getView().byId("text3").getValue();
            const that = this;
            debugger;
            const taskPayload = {
                title: sTitle,
                description: sDescription,
                due_date: sDueDate,
                category_id: sCatId,
                priority: sPriority
            };
            debugger;
            taskService.updateTask(sId, taskPayload)
            .then(
                function(result){
                    that.getView().setBusy(false);
                    MessageToast.show("Task aggiornato con successo!");
                }
            )
            .catch(
                function(error) {
                    that.getView().setBusy(false);
                    MessageToast.show("Errore nell'aggiornamento del task");
                    console.error(error);
                }
            );            
        },
        onNavBack:function(){
            const oHistory = sap.ui.core.routing.History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if(sPreviousHash !== undefined) {
                window.history.go(-1);
            }else{
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteList");
            }            
        },
        onSaveNote: function(){
            debugger;
            const that = this;
            const taskService = this.getOwnerComponent().getTaskService();
            const sId = this._taskId; 
            let sExistNote = this._existnote;
            if (sExistNote === undefined){
                sExistNote = false;
            }
            const sContent = this.getView().byId("ta1").getValue();
            const sNoteId = this.sNoteId;
            if (sExistNote === false){
            debugger;
            that.getView().setBusy(true);
            taskService.addTaskNote(sId, sContent)
            .then(
                function(result){
                    that.getView().setBusy(false);
                    MessageToast.show("Nota del task aggiornata con successo!");                    
                }
            )
            .catch(
                function(error){
                    debugger;
                    that.getView().setBusy(false);
                    MessageToast.show("Errore nell'aggiornamento della nota del task");
                    console.error(error);
                }
            );
        } else{
            that.getView().setBusy(true);
            taskService.updateTaskNote(sNoteId, sContent)
            .then(
                function(result){
                    that.getView().setBusy(false);
                    MessageToast.show("Nota del task aggiornata con successo!");                       
                }
            )
            .catch(
                function(error){
                    that.getView().setBusy(false);
                    MessageToast.show("Errore nell'aggiornamento della nota del task");
                    console.error(error);                    
                }
            )
        };
            //MessageToast.show("Nota salvata con successo!");
        },
        loadCategories: function(){
            const taskService = this.getOwnerComponent().getTaskService();
            taskService.getCategories()
                .then(categories => {
                    debugger;
                    const oCategoriesModel = new sap.ui.model.json.JSONModel(categories);
                    this.getView().setModel(oCategoriesModel, "categories");
                    console.log("Categorie caricate:", categories);
                })
                .catch(error => {
                    console.error("Errore:", error);
                });            
        },
        onDownloadAttach: function(oEvent){
            debugger
            var oItem = oEvent.getSource();
            var sFileUrl = oItem.data("fileUrl");
            var sFileName = oItem.getTitle();
            
            if (sFileUrl) {
                // Apri in una nuova tab
                window.open(sFileUrl, "_blank");
                
                MessageToast.show("Apertura di " + sFileName);
            } else {
                MessageBox.error("URL del file non disponibile");
            }            
        },
        onDeleteAtt:function(oEvent){
            debugger;
            const oList = this.byId("listaall");
            //const oItem = oEvent.getSource();
            const oSelectedItem = oList.getSelectedItem();
            if(!oSelectedItem){
                MessageToast.show("Seleziona un allegato da eliminare");
                return;
            }
            const sAttId = oSelectedItem.data("attId");
            const that = this;
            const taskService = this.getOwnerComponent().getTaskService();
            that.getView().setBusy(true);
            taskService.deleteTaskAtt(sAttId)
            .then(
                function(){
                    MessageToast.show("Allegato eliminato con successo");
                    that.getView().setBusy(true);
                    that.getAttachmentByTaskId(that._taskId); 
                }
            ).catch(
                function(error){
                    that.getView().setBusy(false);
                    MessageToast.show("Errore nell'eliminazione dell'allegato");
                    console.error(error);
                }
            )
        },
        onSaveAtt:function(){
            const oView = this.getView();
            //Controllo se il dialog è già stato creato
            if(!this._oUploadAttDialog){
                Fragment.load({
                    id: oView.getId(),
                    name: "activity.fragments.AttachmentUpload",
                    controller: this
                }).then((oDialog) => {
                    this._oUploadAttDialog = oDialog;
                    oView.addDependent(this._oUploadAttDialog);
                    this._openUploadAttDialog();
                });            
            }else{
                this._openUploadAttDialog();
            }            
        },
        onCancelUpload:function(){
            this._oUploadAttDialog.close();
        },
        _openUploadAttDialog:function(){
            this._oUploadAttDialog.open();
        },
        onTabSelect: function(oEvent){
            debugger;
            const sKey = oEvent.getParameter("key");
            if(sKey === "note"){
                this.getNotebyTaskId(this._taskId);
                const sContent = this.getView().getModel("localTaskNotes").getData().task.content;
                if(!sContent){
                    this.getView().byId("ta1").setValue("Inserisci qui la tua nota...");
                    this._existnote = false;
                } else{
                    this.getView().byId("ta1").setValue(sContent);
                    this._existnote = true;
                    this.sNoteId = this.getView().getModel("localTaskNotes").getData().task.id;
                };
            };
            if(sKey === "allegati"){
                //carica gli allegati
                this.getAttachmentByTaskId(this._taskId);
            };
        },
        getAttachmentByTaskId: function(sTaskId){
            debugger;
            const that = this;
            const taskService = this.getOwnerComponent().getTaskService();
            that.getView().setBusy(true);
            taskService.getTaskAtt(sTaskId)
            .then(
                function(attachments){
                    debugger;
                    that.getView().setBusy(false);
                    //const taskArray = Task[0];
                    that.getView().getModel("localTaskAtt").setProperty("/attachments", attachments);
                }
            )
            .catch(
                function(error) {
                        debugger;
                                that.getView().setBusy(false);
                                MessageToast.show("Errore nella lettura del task");
                                console.error(error);
                }
            );	            
        },
        getCategoryIdByName: function(categoryName) {
            const categories = this.getView().getModel("categories").getData();
            const category = categories.find(cat => cat.name === categoryName);
            return category ? category.id : null;
        },    
        onValueHelp: function(oEvent){
            debugger;
            const oView = this.getView();
            const sInput = oEvent.getSource();
            const sId = sInput.getId();
            if(sId.includes("text3")){ //Priority
                if(!this._oPriorityDialog){
                    this._oPriorityDialog = new sap.m.SelectDialog({
                        title: "Seleziona Priorità",
                        items: [
                            new sap.m.StandardListItem({title: "1 - Urgente", info: "1"}),
                            new sap.m.StandardListItem({title: "2 - Alta", info: "2"}),
                            new sap.m.StandardListItem({title: "3 - Media", info: "3"}),
                            new sap.m.StandardListItem({title: "4- Bassa", info: "4"}),
                            new sap.m.StandardListItem({title: "5 - Molto bassa", info: "5"})
                        ],
                        confirm: function(e){
                            const item = e.getParameter("selectedItem");
                            const priority = item.getInfo();
                            const oModel = oView.getModel("localTaskDetail");
                            oModel.setProperty("/task/priority", parseInt(priority));                            
                        }                       
                    });
                }
                this._oPriorityDialog.open("");
            } else if(sId.includes("text5")){ //Category
                if(!this._oCategoryDialog){
                    this._oCategoryDialog = new sap.m.SelectDialog({
                        title: "Seleziona Categoria",
                        items: [
                            new sap.m.StandardListItem({title: "Casa"}),
                            new sap.m.StandardListItem({title: "Lavoro"}),
                            new sap.m.StandardListItem({title: "Shopping"}),
                            new sap.m.StandardListItem({title: "Personale"})
                        ],
                        confirm: function(e){
                            debugger;
                            const item = e.getParameter("selectedItem");
                            const category = item.getTitle();
                            const oModel = oView.getModel("localTaskCategory");
                            oModel.setProperty("/category/name", category);
                        }
                    });
                }
                this._oCategoryDialog.open("");
            };
        },
        _onRouteMatched(oEvent){
            debugger;
            const oArgs = oEvent.getParameter("arguments");
            const sTaskId = oArgs.taskId;
            this._taskId = sTaskId;
            this._getTaskById(sTaskId);
            debugger;
        },
        getNotebyTaskId: function(sTaskId){
            debugger;
            const that = this;
            const taskService = this.getOwnerComponent().getTaskService();
            that.getView().setBusy(true);
            taskService.getTaskNotes(sTaskId)
            .then(
                function(Task){
                    debugger;
                    that.getView().setBusy(false);
                    const taskArray = Task[0];
                    that.getView().getModel("localTaskNotes").setData({task: taskArray});
                }
            )
            .catch(
                function(error) {
                        debugger;
                                that.getView().setBusy(false);
                                MessageToast.show("Errore nella lettura del task");
                                console.error(error);
                }
            );		

        },
        onConfirmUpload: function() {
            debugger;
            var oFileUploader = this.byId("fileUploader");
            var oDescriptionArea = this.byId("attachmentDescription");
            var sDescription = oDescriptionArea.getValue();
            var oFile = oFileUploader.oFileUpload.files[0];
            
            if (!oFile || !sDescription) {
                MessageToast.show("Compila tutti i campi");
                return;
            }
            
            // Ottieni task_id
            const sTaskId = this._taskId;
            
            // Usa il TaskService per l'upload
            const taskService = this.getOwnerComponent().getTaskService();
            
            this.getView().setBusy(true);
            
            taskService.uploadAttachment(sTaskId, oFile, sDescription, null)
                .then(function(result) {
                    debugger;
                    MessageToast.show("Allegato caricato con successo");
                    this._oUploadAttDialog.close();
                    this.getAttachmentByTaskId(this._taskId);
                }.bind(this))
                .catch(function(error) {
                    MessageToast.show("Errore: " + error.message);
                })
                .finally(function() {
                    this.getView().setBusy(false);
                }.bind(this));
        },

        _getTaskById(sTaskId){
            debugger;
            const taskService = this.getOwnerComponent().getTaskService();
            const that = this;

            //Set Busy indicator
            that.getView().setBusy(true);
            // Recupera le attività attive
            taskService.getTaskById({id: sTaskId}).then(Task => {
                const taskArray = Task[0];
                that.getView().setBusy(false);
                that.getView().getModel("localTaskDetail").setData({
                    task: taskArray});
                    taskService.getCategoryById(taskArray.category_id).then(Category => {
                    debugger;
                    const categoryArray = Category[0];
                    this._categoryId = categoryArray.id;
                    that.getView().getModel("localTaskCategory").setData({
                    category: categoryArray});
                }).catch(function(error){
                    console.log(error);
                })
                }).catch(function(error) {
                    that.getView().setBusy(false);
                    MessageToast.show("{i18n>noActiveTasks}");
                    console.error(error);
                })         
        },
    });
});