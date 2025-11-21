exports.agent = require("./agent").agent;
exports.ccisProxy = require("./ccisProxy").ccisProxy;

// Well Dashboard Functions (NEW - for dashboard UI)
const wellDashboard = require("./wellDashboard");
exports.saveCompleteWell = wellDashboard.saveCompleteWell;
exports.getOrganisationWells = wellDashboard.getOrganisationWells;
exports.getWellDetails = wellDashboard.getWellDetails;
exports.updateWellStatus = wellDashboard.updateWellStatus;
exports.deleteWell = wellDashboard.deleteWell;

// Well Volume Calculations Functions (existing - for calculator)
const wellVolCalcs = require("./wellVolumeCalculations");
exports.calculateStringVolume = wellVolCalcs.calculateStringVolume;
exports.calculateAnnularVolumes = wellVolCalcs.calculateAnnularVolumes;
exports.calculateKillSheet = wellVolCalcs.calculateKillSheet;
exports.calculatePumpOutputs = wellVolCalcs.calculatePumpOutputs;
exports.convertUnits = wellVolCalcs.convertUnits;
exports.trackDisplacement = wellVolCalcs.trackDisplacement;
exports.saveWellConfiguration = wellVolCalcs.saveWellConfiguration;
exports.getWellConfiguration = wellVolCalcs.getWellConfiguration;