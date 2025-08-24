sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
	"sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageBox",
    "../utilities/CommonCallManager",
    "./popup/InfoGruppoPopup",
], function (jQuery, PluginViewController, JSONModel, Spreadsheet, MessageBox, CommonCallManager, InfoGruppoPopup) {
	"use strict";

	return PluginViewController.extend("kpmg.custom.mancantiReport.MancantiReport.MancantiReport.controller.MainView", {
        MancantiReportModel: new JSONModel(),
        InfoGruppoPopup: new InfoGruppoPopup(),
		onInit: function () {
			PluginViewController.prototype.onInit.apply(this, arguments);
            this.setInfoModel();
            this.setBasicProperties();
		},
        onAfterRendering: function(){
            var that=this;
            that.populateSuggestionFilters();
        },
        getI18n: function(token) {
            return this.getView().getModel("i18n").getProperty(token);
        },
        setInfoModel: function() {
            var oModel = new JSONModel();
            //Imposto il mio modello globale -> Sarà accessibile da tutti i controller che ereditano il mio BaseController
            sap.ui.getCore().setModel(oModel, "InfoModel");
        },
        getInfoModel: function(){
            return sap.ui.getCore().getModel("InfoModel");
        },
		setBasicProperties: function(){
            this.getInfoModel().setProperty("/BaseProxyURL",this.getConfiguration().BaseProxyURL);
            this.getInfoModel().setProperty("/plant",this.getConfiguration().Plant);
            this.getInfoModel().setProperty("/user_id",this.getUserId());
            this.getInfoModel().setProperty("/appKey",this.getConfiguration().appKey);
			this.getView().setModel(this.MancantiReportModel, "MancantiReportModel");
        },
        showToast: function(sMessage) {
            sap.m.MessageToast.show(sMessage);
        },
        showErrorMessageBox: function(oMessage) {
            MessageBox.error(oMessage, {
                title: "Error", // Titolo della finestra
                actions: [sap.m.MessageBox.Action.CLOSE], // Azione per chiudere il messaggio
                onClose: function (oAction) {
                }
            });
        },
        populateSuggestionFilters: function(){
            var that=this;
            let BaseProxyURL = that.getInfoModel().getProperty("/BaseProxyURL");
            let pathAPIFilter = "/api/getFilterMancantigReport";
            let url = BaseProxyURL+pathAPIFilter;
            let plant = that.getInfoModel().getProperty("/plant");
            let params = {
                "plant": plant
            }
            // Callback di successo
            var successCallback = function(response) {
                var oFilterModel = new JSONModel(response);
                oFilterModel.setSizeLimit(10000);
                this.getView().setModel(oFilterModel,"FilterModel");
            };

            // Callback di errore
            var errorCallback = function(error) {
                console.log("Chiamata POST fallita:", error);
            };
            CommonCallManager.callProxy("POST", url, params, true, successCallback, errorCallback, that);

        },
        onGoPress: function(){
            var that=this;
            let BaseProxyURL = that.getInfoModel().getProperty("/BaseProxyURL");
            let pathDBQuery = "/db/getZMancantiReportData";
            let url = BaseProxyURL+pathDBQuery;
            let plant = that.getInfoModel().getProperty("/plant");
			let projectValue = that.getView().byId("projectInputId").getValue();
			let wbeValue = that.getView().byId("wbeInputId").getValue();
            let typeMancante = "";

            let startDeliveryDate="";
            let endDeliveryDate="";
            let deliveryDateRangeValue = this.getView().byId("dataRangeInputId").getValue();
            let dateRegex = /(\d{2}\/\d{2}\/\d{4})\s*[\u2013\u002D]\s*(\d{2}\/\d{2}\/\d{4})/;
            let match = deliveryDateRangeValue.match(dateRegex);
            if(match){
                startDeliveryDate=match[1];
                endDeliveryDate=match[2];
            }

            let params = {
                "plant": plant,
                "project":projectValue,
                "wbe": wbeValue,
                "typeMancante": typeMancante,
                "startDeliveryDate": startDeliveryDate,
                "endDeliveryDate": endDeliveryDate
            }
            // Callback di successo
            var successCallback = function(response) {
                that.getView().getModel("MancantiReportModel").setProperty("/MancantiList",response);
            };

            // Callback di errore
            var errorCallback = function(error) {
                console.log("Chiamata POST fallita:", error);
            };
            CommonCallManager.callProxy("POST", url, params, true, successCallback, errorCallback, that);

        },
        onExportExcel: function () {
            var that=this;
            // Crea l'array di colonne per l'Excel (può essere personalizzato)
            var aColumns = [
                { label: "Plant", property: "plant" },
                { label: "Project", property: "project" },
                { label: "WBS Element", property: "wbs_element" },
                { label: "Parent Material", property: "parent_material" },
                { label: "Order", property: "order" },
                { label: "Material Order", property: "material" },
                { label: "Missing Material", property: "missing_material" },
                { label: "Missing Quantity", property: "missing_quantity" },
                { label: "Missing Type", property: "type_mancante" },
                { label: "Cover Element Type", property: "type_cover_element" },
                { label: "Expected Receipt's Date", property: "delivery_date" },
                { label: "Cover Element", property: "cover_element" },
                { label: "Storage Location", property: "storage_location" },
                { label: "Component Order", property: "component_order" },
                { label: "Receipt Expected Date", property: "receipt_expected_date" },
                { label: "First Conf Date", property: "first_conf_date" },
                { label: "Mrp Date", property: "mrp_date" },
                { label: "Date From WorkShop", property: "date_from_workshop" },
            ];

            var aData = that.getView().getModel("MancantiReportModel").getProperty("/MancantiList");
            var todayAsString = that.getTodayDateAsString();
            // Configura l'oggetto per l'esportazione
            var oSettings = {
                workbook: { columns: aColumns },
                dataSource: aData,
                fileName: "Mancanti_Report_Export_"+todayAsString+".xlsx",
                mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            };

            // Crea il file Excel e avvia il download
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().then(function () {
                oSpreadsheet.destroy();
            });
        },
        rowSelectionChange: function(oEvent){
            var that=this;
            var oTable = oEvent.getSource();
            var selectedIndex = oTable.getSelectedIndex();
            if(selectedIndex!==-1){
                var selectedObj = oTable.getContextByIndex(selectedIndex).getObject();
                that.InfoGruppoPopup.open(that.getView(), that,selectedObj);
                oTable.setSelectedIndex(-1);
            }
        },
        getTodayDateAsString: function(){
            const oggi = new Date();
            const giorno = String(oggi.getDate()).padStart(2, '0');
            const mese = String(oggi.getMonth() + 1).padStart(2, '0'); // I mesi in JS partono da 0, quindi aggiungiamo 1
            const anno = oggi.getFullYear();
            const dataStringa = `${giorno}_${mese}_${anno}`;
            return dataStringa;
        },
		onExit: function () {
			PluginViewController.prototype.onExit.apply(this, arguments);


		}
	});
});