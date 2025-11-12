sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], (Controller,MessageToast,Filter,FilterOperator,Fragment) => {
    "use strict";

    return Controller.extend("activity.controller.List", {
        onInit() {
            //Inizializzo i modelli per attività attive e completate
            this.getView().setModel(new sap.ui.model.json.JSONModel([]), "activeTasks");
            this.getView().setModel(new sap.ui.model.json.JSONModel([]), "completedTasks");
            this.getView().setModel(new sap.ui.model.json.JSONModel([]), "categories");
            this.getView().setModel(new sap.ui.model.json.JSONModel([]), "dialogcategories");

            // Modello per il dialog di creazione task
            this.getView().setModel(new sap.ui.model.json.JSONModel(this._getInitialTaskData()), "taskDialog");

            //carico le attivitò
            this._loadTasks();
        },
        onTaskPress(oEvent){
            debugger;
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            const oItem = oEvent.getSource();
            const oCtx = oItem.getBindingContext("activeTasks") || oItem.getBindingContext("completedTasks");
            const sId = oCtx.getProperty("id");
            oRouter.navTo("RouteDetail",
                {taskId: sId}
            );
            debugger;
        },
        onFilterPress(oEvent){
            const oView = this.getView();
            const sPriority = oView.byId("priorityFilter").getSelectedKey();
            const sCategory = oView.byId("categoryFilter").getSelectedKey();
            let aFilters = [];
            if (sPriority){
                aFilters.push(new Filter("priority", FilterOperator.EQ, sPriority));
            }
            if (sCategory){
                aFilters.push(new Filter("category_id", FilterOperator.EQ, sCategory)); 
            }
            const oTable = oView.byId("activeTasksTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
            MessageToast.show("Filtro applicato");
        },
        onFilterPressCompleted(oEvent){
            const oView = this.getView();
            const sPriority = oView.byId("priorityFilterC2").getSelectedKey();
            const sCategory = oView.byId("categoryFilterc").getSelectedKey();
            let aFilters = [];
            if (sPriority){
                aFilters.push(new Filter("priority", FilterOperator.EQ, sPriority));
            }
            if (sCategory){
                aFilters.push(new Filter("category_id", FilterOperator.EQ, sCategory)); 
            }
            const oTable = oView.byId("completedTasksTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
            MessageToast.show("Filtro applicato");
        },

        //Gestione apertura del dialog per la creazione di un task
        onAddTaskPress(){
            const oView = this.getView();
            //Controllo se il dialog è già stato creato
            if(!this._oCreateTaskDialog){
                Fragment.load({
                    id: oView.getId(),
                    name: "activity.fragments.CreateTaskDialog",
                    controller: this
                }).then((oDialog) => {
                    this._oCreateTaskDialog = oDialog;
                    oView.addDependent(this._oCreateTaskDialog);
                    this._openCreateTaskDialog();
                });            
            }else{
                this._openCreateTaskDialog();
            }
        },
        _openCreateTaskDialog: function() {
            // Reset del modello del dialog
            this.getView().getModel("taskDialog").setData(this._getInitialTaskData());
            this._oCreateTaskDialog.open();
        },
        _getInitialTaskData: function(){
            return{
                title: "",
                description: "",
                priority: "3", // Default priority
                category_id: "",
                due_date: null,
                status: "active",
                titleState: "None",
                titleStateText: "",
                priorityState: "None", 
                priorityStateText: "",
                categoryState: "None",
                categoryStateText: "",
                isValid: false                
            };
        },
                // Validazione del titolo
        onTitleChange: function(oEvent) {
            debugger;
            // Prendi il valore direttamente dall'evento
            const sNewValue = oEvent.getParameter("value");            
            // Aggiorna esplicitamente il modello
            const oModel = this.getView().getModel("taskDialog");
            oModel.setProperty("/title", sNewValue);           
            // Valida immediatamente
            this._validateForm();            
        },
        onCategoryChange:function(oEvent){
            debugger;
            const sNewCategory = oEvent.getSource().getSelectedKey();
            const oModel = this.getView().getModel("taskDialog");
            oModel.setProperty("/category_id", sNewCategory);
            this._validateForm();
        },
         _validateForm: function() {
            debugger;
            const oModel = this.getView().getModel("taskDialog");
            const oData = oModel.getData();
            let bValid = true;

            // Validazione titolo
            if (!oData.title || oData.title.trim().length === 0) {
                oData.titleState = "Error";
                oData.titleStateText = this.getView().getModel("i18n").getResourceBundle().getText("titleRequired") || "Il titolo è obbligatorio";
                bValid = false;
            } else {
                oData.titleState = "Success";
                oData.titleStateText = "";
            }

            // Validazione categoria
            if (!oData.category_id) {
                oData.categoryState = "Error";
                oData.categoryStateText = this.getView().getModel("i18n").getResourceBundle().getText("categoryRequired") || "La categoria è obbligatoria";
                bValid = false;
            } else {
                oData.categoryState = "Success";
                oData.categoryStateText = "";
            }

            // Validazione priorità
            if (!oData.priority) {
                oData.priorityState = "Error";
                oData.priorityStateText = this.getView().getModel("i18n").getResourceBundle().getText("priorityRequired") || "La priorità è obbligatoria";
                bValid = false;
            } else {
                oData.priorityState = "Success";
                oData.priorityStateText = "";
            }

            oData.isValid = bValid;
            oModel.setData(oData);
        },
        onSaveTask: function() {
            debugger;
            this._validateForm();
            
            const oModel = this.getView().getModel("taskDialog");
            const oTaskData = oModel.getData();
            
            if (!oTaskData.isValid) {
                MessageToast.show("Completare i campi obbligatori");
                return;
            }

            const taskService = this.getOwnerComponent().getTaskService();
            const that = this;

            // Prepara i dati per la creazione - CORRETTI PER UUID
            const taskPayload = {
                title: oTaskData.title.trim(),
                description: oTaskData.description ? oTaskData.description.trim() : null,
                priority: parseInt(oTaskData.priority), // priority rimane integer
                category_id: oTaskData.category_id,     //category_id come stringa UUID
                status: 'active',
                due_date: oTaskData.due_date || null,
            };

            // Mostra indicatore di caricamento
            this._oCreateTaskDialog.setBusy(true);

            taskService.createTask(taskPayload)
                .then(function(result) {
                    that._oCreateTaskDialog.setBusy(false);
                    that._oCreateTaskDialog.close();
                    MessageToast.show("Task creato con successo!");
                    
                    // Ricarica i dati
                    that._loadTasks();
                })
                .catch(function(error) {
                    that._oCreateTaskDialog.setBusy(false);
                    MessageToast.show("Errore nella creazione del task");
                    console.error("Errore creazione task:", error);
                });
        },
        onCancelTask: function(){
            this._oCreateTaskDialog.close();
        },
        onChangeStatus:function(oEvent){
            const oIconTabBar = this.byId("taskTabs");
            const sSelectedKey = oIconTabBar.getSelectedKey();
            
            let oTable, sModelName, sNewStatus;
            if (sSelectedKey === "active") {
                oTable = this.byId("activeTasksTable");
                sModelName = "activeTasks";
                sNewStatus = "completed";
            } else {
                oTable = this.byId("completedTasksTable");
                sModelName = "completedTasks";
                sNewStatus = "active";
            };
            
            // Ottieni l'item selezionato
            const oSelectedItem = oTable.getSelectedItem();
            // Ottieni i dati del task selezionato
            const oContext = oSelectedItem.getBindingContext(sModelName);
            const oTaskData = oContext.getObject();
            const sId = oTaskData.id;
            const taskService = this.getOwnerComponent().getTaskService();
            const that = this;
            const taskPayload =  {
                status: sNewStatus
            };
            this.getView().setBusy(true);
            taskService.updateTask(sId, taskPayload)
            .then(
                function(result){
                    that.getView().setBusy(false);
                    MessageToast.show("Task aggiornato con successo!");
                    that._loadTasks();
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
        onDeleteTask(oEvent){
            debugger;
            const oIconTabBar = this.byId("taskTabs");
            const sSelectedKey = oIconTabBar.getSelectedKey();
            
            let oTable, sModelName, sNewStatus;
            if (sSelectedKey === "active") {
                oTable = this.byId("activeTasksTable");
                sModelName = "activeTasks";
                sNewStatus = "completed";
            } else {
                oTable = this.byId("completedTasksTable");
                sModelName = "completedTasks";
                sNewStatus = "active";
            };
            
            // Ottieni l'item selezionato
            const oSelectedItem = oTable.getSelectedItem();
            // Ottieni i dati del task selezionato
            const oContext = oSelectedItem.getBindingContext(sModelName);
            const oTaskData = oContext.getObject();
            const sId = oTaskData.id;
            const taskService = this.getOwnerComponent().getTaskService();
            const that = this;
            this.getView().setBusy(true);
            taskService.deleteTask(sId)
            .then(
                function(result){
                    that.getView().setBusy(false);
                    MessageToast.show("Task eliminato con successo!")
                    //ricarico la view
                    that._loadTasks();
                }
            )
            .catch(
                function(error){
                    that.getView().setBusy(false);
                    MessageToast.show("Errore nella cancellazione del task.")
                    console.log(error);
                }
            )
        },
        _loadTasks(){
            const taskService = this.getOwnerComponent().getTaskService();
            const that = this;

            //Set Busy indicator
            that.getView().setBusy(true);
            // Recupera le attività attive
            taskService.getTasks({status: 'active'}).then(activeTasks => {
                that.getView().setBusy(false);
                that.getView().getModel("activeTasks").setData({
                    tasks: activeTasks});
                }).catch(function(error) {
                    that.getView().setBusy(false);
                    MessageToast.show("{i18n>noActiveTasks}");
                    console.error(error);
                })
            // Carica attività completate
            taskService.getTasks({ status: 'completed' })
                .then(function (completedTasks) {
                    that.getView().getModel("completedTasks").setData({
                        tasks: completedTasks});
                })
                .catch(function (error) {
                    that.getView().setBusy(false);
                    MessageToast.show("Errore nel caricamento attività completate");
                    console.error(error);
                });   
            
            //Carica le categorie
            taskService.getCategories()
            .then(function(categoriesData) {
                // Aggiungo manualmente la voce "Tutte" all'inizio
                const oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
                const sAllLabel = oResourceBundle.getText("all"); // "Tutte" da i18n
                const aWithAll = [{ id: "", name: sAllLabel }, ...categoriesData];
                that.getView().setBusy(false);  
                that.getView().getModel("categories").setData({
                    categoriesData: aWithAll });
                that.getView().getModel("dialogcategories").setData({
                    categoriesData: categoriesData
                });
            })
            .catch(function (error) {
                that.getView().setBusy(false);
                MessageToast.show("Errore nel caricamento categorie");
                console.error(error);
            }); 
        }  
    });
});