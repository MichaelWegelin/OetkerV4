/*global location */
sap.ui.define([
	"com/oetker/demo/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/oetker/demo/model/formatter",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, formatter, MessageBox) {
	"use strict";

	return BaseController.extend("com.oetker.demo.controller.Create", {
		_mode: "none",

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			this.getRouter().getRoute("create").attachPatternMatched(this._onCreateMatched, this);
			this.getRouter().getRoute("edit").attachPatternMatched(this._onEditMatched, this);
			var oCountries = {
				countries: [
					{code: "DE", name: "Deutschland"},
					{code: "US", name: "United States of America"},
					{code: "PT", name: "Portugal"}
					]
			};
			var oCountryModel = new JSONModel(oCountries);
			this.setModel(oCountryModel,"countries");
			
			sap.ui.getCore().attachValidationError(function(oEvent) {
				var oControl = oEvent.getParameter("element");
				if(oControl && oControl.setValueState) {
					oControl.setValueState(sap.ui.core.ValueState.Error);
				}
			});
			sap.ui.getCore().attachValidationSuccess(function(oEvent) {
				var oControl = oEvent.getParameter("element");
				if(oControl && oControl.setValueState) {
					oControl.setValueState(sap.ui.core.ValueState.None);
				}
			});
		},
		
		onSave: function(oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var	oNewPartner = this.getModel("newPartner").getData();
			if (!this._validate(oNewPartner)) {
				return;
			}
	
			if( this._mode === "create") {
				oModel.create("/BusinessPartnerSet", oNewPartner, {
					success: function(oData, oResponse) {
						MessageBox.show("New Business Partner " + oData.BpId + " created",{
	        				icon: sap.m.MessageBox.Icon.SUCCESS,
	        				title: "Success"} );				
					},
					error: function(oError) {
						MessageBox.alert(oError.responseText);
					}
				});
			} else {
				// this does not work, don't know why....
				/*
				var oModel = this.getOwnerComponent().getModel();
				if(oModel.hasPendingChanges())
					oModel.submitChanges();
				*/
				var sPath = "/BusinessPartnerSet('" + oNewPartner.BpId + "')";
				oModel.update(sPath, oNewPartner, {
					success: function(oData, oResponse) {
						MessageBox.show("Business Partner " + oNewPartner.BpId + " saved",{
	        				icon: sap.m.MessageBox.Icon.SUCCESS,
	        				title: "Success"} );				
					},
					error: function(oError) {
						MessageBox.alert(oError.responseText);
					}
				});
			}
		},
		
		_validate: function(oNewPartner) {
			return true;
			var bValid = true;
			var aControls = [
				this.getView().byId("inputCompany"),
				this.getView().byId("inputCountry")
				];
				
			jQuery.each(aControls, function(i,element) {
				if (element.getValue()) {
					element.setValueState(sap.ui.core.ValueState.Error);
				}
			});

			jQuery.each(aControls, function(i,element) {
				if (element.getValueState && element.getValueState() === sap.ui.core.ValueState.Error) {
					bValid = false;
					return false;
				}
			});
			
			return bValid;
		},
		
		onCancel: function(oEvent) {
			this.onNavBack();	
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share button has been clicked
		 * @param {sap.ui.base.Event} oEvent the butten press event
		 * @public
		 */

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onCreateMatched: function(oEvent) {
			this._mode = "create";
			var oNewBusinessPartner = {
				CompanyName: "",
				BpRole: "02",
				LegalForm: "GmbH",
				CurrencyCode: "EUR",
				Street: "",
				Building: "",
				City: "",
				PostalCode: "",
				Country: "DE",
				EmailAddress: "",
				WebAddress: "",
				PhoneNumber: "",
				FaxNumber: "",
				AddressType: "02",
				AddressValStartDate: new Date(),
				AddressValEndDate: new Date((new Date()).setFullYear(2090))
			};
			var oNewBusinessPartnerModel = new JSONModel(oNewBusinessPartner);
			this.setModel(oNewBusinessPartnerModel, "newPartner");
			
			var oViewData = {
				title: "Create new Business Partner",
				BpIdVisible: false
			};
			var oViewModel = new JSONModel(oViewData);
			this.setModel(oViewModel, "viewModel");
		},
		
		_onEditMatched: function(oEvent) {
			this._mode = "edit";
			var sId = oEvent.getParameter("arguments").objectId;
			var sPath = "/BusinessPartnerSet('" + sId + "')";
			var oNewBusinessPartner = this.getOwnerComponent().getModel().getProperty(sPath);
			var oNewBusinessPartnerModel = new JSONModel(oNewBusinessPartner);
			this.setModel(oNewBusinessPartnerModel, "newPartner");

			var oViewData = {
				title: "Edit Business Partner " + sId,
				BpIdVisible: true
			};
			var oViewModel = new JSONModel(oViewData);
			this.setModel(oViewModel, "viewModel");
		}
	});

});