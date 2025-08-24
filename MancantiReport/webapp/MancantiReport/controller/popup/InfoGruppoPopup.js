sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "../../utilities/CommonCallManager",
    "../../utilities/GenericDialog"
], function (JSONModel, CommonCallManager, Dialog) {
    "use strict";

    return Dialog.extend("kpmg.custom.mancantiReport.MancantiReport.MancantiReport.controller.popup.InfoGruppoPopup", {
        open: function (oView, oController, selectedRow) {
            var that = this;
            that.InfoGruppoPopupModel = new JSONModel();
            that.MainViewController = oController;
            that._initDialog("kpmg.custom.mancantiReport.MancantiReport.MancantiReport.view.popup.InfoGruppoPopup", oView, that.InfoGruppoPopupModel);
            that.InfoGruppoPopupModel.setProperty("/selectedRow",selectedRow);
            that.openDialog();
            that.getInfoGruppo();
        },
        getInfoGruppo: function(){
            var that=this;
            let selectedGruppo = that.InfoGruppoPopupModel.getProperty("/selectedRow");

            let BaseProxyURL = that.MainViewController.getInfoModel().getProperty("/BaseProxyURL");
            let pathDB = "/db/getMancantiInfo";
            let url = BaseProxyURL+pathDB;
            let plant = that.MainViewController.getInfoModel().getProperty("/plant");
            let project = selectedGruppo.project;
			let order = selectedGruppo.order;
            that.InfoGruppoPopupModel.setProperty("/orderGroup",order);
            that.InfoGruppoPopupModel.setProperty("/materialGroup",selectedGruppo.material);
			
            let params = {
                "plant": plant,
                "project": project,
				"order":order
            }
            // Callback di successo
            var successCallback = function(response) {
                if(!!response){
                    that.InfoGruppoPopupModel.setProperty("/totaleComponenti",response.numberGroupComponents);
                    that.InfoGruppoPopupModel.setProperty("/totaleMancanti",response.numberMancanti);
                }
            };

            // Callback di errore
            var errorCallback = function(error) {
                console.log("Chiamata POST fallita:", error);
            };
            CommonCallManager.callProxy("POST", url, params, true, successCallback, errorCallback, that,false,true);




        },
        onClosePopup: function () {
            var that = this;
            that.closeDialog();
        }
    })
}
)