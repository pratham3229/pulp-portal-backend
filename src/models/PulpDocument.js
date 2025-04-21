const mongoose = require("mongoose");

const pulpDocumentSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Basic Details
  tradeName: { type: String, default: null },
  commodities: { type: String, default: null },
  speciesNames: { type: String, default: null },
  quantity: { type: Number, default: null },

  // Location Info
  supplierCountry: { type: String, default: null },
  productionCountry: { type: String, default: null },
  woodOriginCountry: { type: String, default: null },
  geolocationPolygon: { type: String, default: null },
  harvestDates: { type: String, default: null },

  // Contact Details
  supplierDetails: { type: String, default: null },
  producerDetails: { type: String, default: null },
  geolocationOwnerDetails: { type: String, default: null },

  // File References
  files: {
    geoToProducerInvoice: { type: String, default: null },
    woodTransportDocs: { type: String, default: null },
    producerToSupplierInvoice: { type: String, default: null },
    pulpTransportDocs: { type: String, default: null },
    supplierToITCInvoice: { type: String, default: null },
    shippingDocs: { type: String, default: null },
    ddsSummary: { type: String, default: null },
    legalHarvestDocs: { type: String, default: null },
    fscCertificates: { type: String, default: null },
    fscCocCertificate: { type: String, default: null },
    producerDeclaration: { type: String, default: null },
    producerLicense: { type: String, default: null },
    supplierLicense: { type: String, default: null },
    ghgCertifications: { type: String, default: null },
    safetyCertifications: { type: String, default: null },
    humanRightsPolicies: { type: String, default: null },
    employeeRecords: { type: String, default: null },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PulpDocument", pulpDocumentSchema);
