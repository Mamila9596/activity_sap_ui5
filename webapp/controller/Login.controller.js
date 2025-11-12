sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function(
	Controller,
	MessageBox,
    JSONModel
) {
	"use strict";

	return Controller.extend("activity.controller.Login", {
        onLogin:function(){
            debugger;
            const taskService = this.getOwnerComponent().getTaskService();
            let username = this.getView().byId("inputuser").getValue();
            let password = this.getView().byId("inputpass").getValue();
        if (!username || !password) {
            MessageBox.error("Inserisci username e password");
            return;
        }        
        // Mostra busy indicator
        this.getView().setBusy(true);
        taskService.validateLogin(username, password)
        .then(result => {
            this.getView().setBusy(false);
            
            if (result.success) {
                // Salva i dati utente (es. in un model)
                debugger;
                
                // Naviga alla pagina principale
                this.getOwnerComponent().getRouter().navTo("RouteList");
                
                MessageBox.success("Benvenuto " + result.user.full_name);
            } else {
                debugger;
                MessageBox.error(result.message);
            }
        })
        .catch(error => {
            debugger;
            this.getView().setBusy(false);
            MessageBox.error("Errore durante il login: " + error.message);
        });        
        }
	});
});