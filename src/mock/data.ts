export const overview = {
  totalFIRs: 5240,
  heinousCount: 312,
  nonHeinousCount: 4928,
  arrestRate: 67.4,
  chargesheetRate: 54.2,
  pendingCases: 1823,
  closedCases: 2100,
  falseCases: 210,
  undetectedCases: 1107,
  avgInvestigationDays: 38,
};

export const overviewDemo = {
  totalFIRs: 8912,
  heinousCount: 587,
  nonHeinousCount: 8325,
  arrestRate: 72.1,
  chargesheetRate: 58.6,
  pendingCases: 2411,
  closedCases: 3200,
  falseCases: 340,
  undetectedCases: 1580,
  avgInvestigationDays: 32,
};

export const trend = [
  { month: "Jan 24", count: 142 },
  { month: "Feb 24", count: 168 },
  { month: "Mar 24", count: 155 },
  { month: "Apr 24", count: 190 },
  { month: "May 24", count: 178 },
  { month: "Jun 24", count: 203 },
  { month: "Jul 24", count: 189 },
  { month: "Aug 24", count: 221 },
  { month: "Sep 24", count: 198 },
  { month: "Oct 24", count: 245 },
  { month: "Nov 24", count: 267 },
  { month: "Dec 24", count: 289 },
  { month: "Jan 25", count: 312 },
  { month: "Feb 25", count: 298 },
  { month: "Mar 25", count: 334 },
  { month: "Apr 25", count: 356 },
  { month: "May 25", count: 378 },
  { month: "Jun 25", count: 401 },
  { month: "Jul 25", count: 389 },
];

export const crimeTypes = [
  { crimeHeadId: 1, crimeGroupName: "Crimes Against Body", count: 820 },
  { crimeHeadId: 2, crimeGroupName: "Crimes Against Property", count: 1240 },
  { crimeHeadId: 3, crimeGroupName: "Cyber Crimes", count: 430 },
  { crimeHeadId: 4, crimeGroupName: "Economic Offences", count: 280 },
  { crimeHeadId: 5, crimeGroupName: "Crimes Against Women", count: 890 },
  { crimeHeadId: 6, crimeGroupName: "Others", count: 1580 },
];

export const statusFunnel = [
  { statusName: "FIR Registered", count: 5240 },
  { statusName: "Under Investigation", count: 3100 },
  { statusName: "Charge Sheeted", count: 1823 },
  { statusName: "Court Trial", count: 1200 },
  { statusName: "Closed", count: 900 },
];

export type Alert = {
  alertId: string;
  districtName: string;
  crimeSubHead: string;
  spikeMultiplier: number;
  severity: "critical" | "warning";
  message: string;
};

export const alerts: Alert[] = [
  { alertId: "a1", districtName: "Mysuru", crimeSubHead: "Chain Snatching", spikeMultiplier: 3.0, severity: "critical", message: "Mysuru: 3x spike in Chain Snatching vs 4-week average" },
  { alertId: "a2", districtName: "Bengaluru Urban", crimeSubHead: "Cyber Fraud", spikeMultiplier: 1.6, severity: "warning", message: "Bengaluru Urban: 60% rise in Cyber Fraud this week" },
  { alertId: "a3", districtName: "Ballari", crimeSubHead: "Vehicle Theft", spikeMultiplier: 2.1, severity: "critical", message: "Ballari: 2x spike in Vehicle Theft vs monthly average" },
  { alertId: "a4", districtName: "Mangaluru", crimeSubHead: "Assault", spikeMultiplier: 1.8, severity: "warning", message: "Mangaluru: 80% rise in Assault cases this week" },
];

export type RiskPrediction = {
  districtId: number;
  districtName: string;
  crimeGroupName: string;
  riskScore: number;
  riskLevel: "high" | "medium" | "low";
  predictedCount: number;
  lastMonthCount: number;
  trend: "up" | "down";
  trendPercent: number;
};

export const riskScores: RiskPrediction[] = [
  { districtId: 1, districtName: "Bengaluru Urban", crimeGroupName: "Cyber Crimes", riskScore: 87, riskLevel: "high", predictedCount: 142, lastMonthCount: 98, trend: "up", trendPercent: 44.9 },
  { districtId: 2, districtName: "Mysuru", crimeGroupName: "Chain Snatching", riskScore: 79, riskLevel: "high", predictedCount: 28, lastMonthCount: 14, trend: "up", trendPercent: 100.0 },
  { districtId: 3, districtName: "Ballari", crimeGroupName: "Vehicle Theft", riskScore: 71, riskLevel: "high", predictedCount: 45, lastMonthCount: 31, trend: "up", trendPercent: 45.2 },
  { districtId: 4, districtName: "Dharwad", crimeGroupName: "Robbery", riskScore: 45, riskLevel: "medium", predictedCount: 18, lastMonthCount: 16, trend: "up", trendPercent: 12.5 },
  { districtId: 5, districtName: "Mangaluru", crimeGroupName: "Assault", riskScore: 38, riskLevel: "medium", predictedCount: 22, lastMonthCount: 19, trend: "up", trendPercent: 15.8 },
  { districtId: 6, districtName: "Belagavi", crimeGroupName: "Burglary", riskScore: 24, riskLevel: "low", predictedCount: 12, lastMonthCount: 15, trend: "down", trendPercent: -20.0 },
];

export type NetworkNode = {
  id: number;
  name: string;
  caseCount: number;
  isRepeatOffender: boolean;
  primaryCrimeType: string;
  age: number;
  gender: "M" | "F";
};
export type NetworkEdge = { source: number; target: number; sharedCases: number };

export const networkNodes: NetworkNode[] = [
  { id: 201, name: "Ravi Kumar", caseCount: 4, isRepeatOffender: true, primaryCrimeType: "Robbery", age: 28, gender: "M" },
  { id: 305, name: "Suresh B", caseCount: 3, isRepeatOffender: true, primaryCrimeType: "Robbery", age: 34, gender: "M" },
  { id: 412, name: "Lakshmi D", caseCount: 2, isRepeatOffender: true, primaryCrimeType: "Theft", age: 25, gender: "F" },
  { id: 198, name: "Arjun Naik", caseCount: 1, isRepeatOffender: false, primaryCrimeType: "Assault", age: 22, gender: "M" },
  { id: 567, name: "Mohammed K", caseCount: 3, isRepeatOffender: true, primaryCrimeType: "Cyber Fraud", age: 31, gender: "M" },
  { id: 634, name: "Priya S", caseCount: 2, isRepeatOffender: true, primaryCrimeType: "Cyber Fraud", age: 27, gender: "F" },
  { id: 789, name: "Venkat R", caseCount: 1, isRepeatOffender: false, primaryCrimeType: "Robbery", age: 19, gender: "M" },
];

export const networkEdges: NetworkEdge[] = [
  { source: 201, target: 305, sharedCases: 3 },
  { source: 201, target: 789, sharedCases: 1 },
  { source: 305, target: 412, sharedCases: 2 },
  { source: 567, target: 634, sharedCases: 2 },
  { source: 412, target: 198, sharedCases: 1 },
];

export const officerAnalytics = {
  stationwideAvgChargesheetRate: 54.2,
  stationwideAvgFalseRate: 12.1,
  flaggedStations: [
    { unitId: 6, unitName: "Hebbal PS", districtName: "Bengaluru Urban", falseRate: 28.4, stateAvg: 12.1, deviation: 16.3 },
    { unitId: 14, unitName: "Shivajinagar PS", districtName: "Bengaluru Urban", falseRate: 24.1, stateAvg: 12.1, deviation: 12.0 },
  ],
  stations: [
    { unitId: 6, unitName: "Hebbal PS", districtName: "Bengaluru Urban", totalCases: 142, chargesheetRate: 48.6, falseRate: 28.4, avgInvestigationDays: 52, isFlagged: true, flagReason: "False FIR rate 28.4% vs statewide avg 12.1%" },
    { unitId: 7, unitName: "Yelahanka PS", districtName: "Bengaluru Urban", totalCases: 98, chargesheetRate: 71.4, falseRate: 8.2, avgInvestigationDays: 31, isFlagged: false, flagReason: null as string | null },
    { unitId: 8, unitName: "Whitefield PS", districtName: "Bengaluru Urban", totalCases: 187, chargesheetRate: 62.0, falseRate: 10.7, avgInvestigationDays: 38, isFlagged: false, flagReason: null as string | null },
    { unitId: 14, unitName: "Shivajinagar PS", districtName: "Bengaluru Urban", totalCases: 76, chargesheetRate: 44.7, falseRate: 24.1, avgInvestigationDays: 61, isFlagged: true, flagReason: "False FIR rate 24.1% vs statewide avg 12.1%" },
  ],
};

export const courts = [
  { name: "JMFC Bengaluru", chargesheet: 210, falseCases: 68, undetected: 42 },
  { name: "CJM Mysuru", chargesheet: 145, falseCases: 34, undetected: 28 },
  { name: "JMFC Mangaluru", chargesheet: 98, falseCases: 21, undetected: 15 },
];

export const demographics = {
  victimsByGender: [
    { gender: "Male", count: 2100 },
    { gender: "Female", count: 980 },
    { gender: "Transgender", count: 12 },
  ],
  victimsByAgeGroup: [
    { ageGroup: "0–18", count: 210 },
    { ageGroup: "19–30", count: 890 },
    { ageGroup: "31–45", count: 1100 },
    { ageGroup: "46–60", count: 620 },
    { ageGroup: "60+", count: 270 },
  ],
  complainantsByOccupation: [
    { occupationName: "Farmer", count: 430 },
    { occupationName: "Govt. Employee", count: 380 },
    { occupationName: "Business", count: 290 },
    { occupationName: "Student", count: 210 },
    { occupationName: "Daily Wage", count: 340 },
  ],
  complainantsByReligion: [
    { religionName: "Hindu", count: 3100 },
    { religionName: "Muslim", count: 890 },
    { religionName: "Christian", count: 340 },
    { religionName: "Others", count: 910 },
  ],
  accusedByAgeGroup: [
    { ageGroup: "0–18", count: 180 },
    { ageGroup: "19–30", count: 1800 },
    { ageGroup: "31–45", count: 1400 },
    { ageGroup: "46–60", count: 420 },
    { ageGroup: "60+", count: 80 },
  ],
};

export const karnatakaDistricts = [
  { name: "Bengaluru Urban", lat: 12.9716, lng: 77.5946, count: 1240, density: "high" as const },
  { name: "Mysuru", lat: 12.2958, lng: 76.6394, count: 430, density: "medium" as const },
  { name: "Mangaluru", lat: 12.9141, lng: 74.8560, count: 310, density: "medium" as const },
  { name: "Hubballi", lat: 15.3647, lng: 75.1240, count: 280, density: "medium" as const },
  { name: "Ballari", lat: 15.1394, lng: 76.9214, count: 198, density: "low" as const },
  { name: "Belagavi", lat: 15.8497, lng: 74.4977, count: 187, density: "low" as const },
  { name: "Kalaburagi", lat: 17.3297, lng: 76.8343, count: 167, density: "low" as const },
  { name: "Shivamogga", lat: 13.9299, lng: 75.5681, count: 145, density: "low" as const },
  { name: "Tumakuru", lat: 13.3379, lng: 77.1173, count: 134, density: "low" as const },
  { name: "Davanagere", lat: 14.4644, lng: 75.9218, count: 121, density: "low" as const },
];
