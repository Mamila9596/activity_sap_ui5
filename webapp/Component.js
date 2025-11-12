sap.ui.define([
    "sap/ui/core/UIComponent",
    "activity/model/models",
    "activity/service/TaskService"
], (UIComponent, models,TaskService) => {
    "use strict";

    return UIComponent.extend("activity.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

            // Inizializza TaskService
            this.taskService = new TaskService();
        },
        getTaskService() {
            return this.taskService;
        }
    });
});