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
    geoToProducerInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    woodTransportDocs: { type: mongoose.Schema.Types.ObjectId, default: null },
    producerToSupplierInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    pulpTransportDocs: { type: mongoose.Schema.Types.ObjectId, default: null },
    supplierToITCInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    shippingDocs: { type: mongoose.Schema.Types.ObjectId, default: null },
    ddsSummary: { type: mongoose.Schema.Types.ObjectId, default: null },
    legalHarvestDocs: { type: mongoose.Schema.Types.ObjectId, default: null },
    fscCertificates: { type: mongoose.Schema.Types.ObjectId, default: null },
    fscCocCertificate: { type: mongoose.Schema.Types.ObjectId, default: null },
    producerDeclaration: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    producerLicense: { type: mongoose.Schema.Types.ObjectId, default: null },
    supplierLicense: { type: mongoose.Schema.Types.ObjectId, default: null },
    ghgCertifications: { type: mongoose.Schema.Types.ObjectId, default: null },
    safetyCertifications: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    humanRightsPolicies: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    employeeRecords: { type: mongoose.Schema.Types.ObjectId, default: null },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PulpDocument", pulpDocumentSchema);
