sap.ui.define([
	"sap/dm/dme/podfoundation/component/production/ProductionUIComponent",
	"sap/ui/Device"
], function (ProductionUIComponent, Device) {
	"use strict";

	return ProductionUIComponent.extend("kpmg.custom.mancantiReport.MancantiReport.MancantiReport.Component", {
		metadata: {
			manifest: "json"
		}
	});
});