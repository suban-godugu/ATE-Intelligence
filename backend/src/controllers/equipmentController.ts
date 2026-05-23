import { Request, Response } from 'express';

// Define Interface for Tester
interface Tester {
  id: string;
  fab: string;
  model: string;
  status: 'online' | 'maintenance' | 'fault' | 'warning';
  healthScore: number | null;
  temperature: number | null;
  powerW: number | null;
  utilisation7d: number;
  lastFaultAt: string | null;
  calibrationDueAt: string;
  uptimePct: number | null;
}

// 12 specific testers mapped out to perfectly match HTML counts (9 online, 2 maintenance, 1 fault)
let testers: Tester[] = [
  {
    id: 'ATE-01',
    fab: 'Fab A',
    model: 'J750',
    status: 'online',
    healthScore: 98,
    temperature: 42,
    powerW: 1240,
    utilisation7d: 82,
    lastFaultAt: '2026-05-09T08:00:00Z',
    calibrationDueAt: '2026-06-20T17:00:00Z',
    uptimePct: 99.8
  },
  {
    id: 'ATE-02',
    fab: 'Fab A',
    model: 'J750',
    status: 'online',
    healthScore: 95,
    temperature: 44,
    powerW: 1280,
    utilisation7d: 79,
    lastFaultAt: '2026-05-15T12:00:00Z',
    calibrationDueAt: '2026-06-13T17:00:00Z',
    uptimePct: 98.4
  },
  {
    id: 'ATE-03',
    fab: 'Fab A',
    model: 'Ultraflex',
    status: 'warning',
    healthScore: 74,
    temperature: 61,
    powerW: 1840,
    utilisation7d: 67,
    lastFaultAt: '2026-05-21T14:30:00Z',
    calibrationDueAt: '2026-05-26T17:00:00Z',
    uptimePct: 91.2
  },
  {
    id: 'ATE-04',
    fab: 'Fab B',
    model: 'J750',
    status: 'online',
    healthScore: 91,
    temperature: 46,
    powerW: 1310,
    utilisation7d: 88,
    lastFaultAt: '2026-05-02T10:00:00Z',
    calibrationDueAt: '2026-06-06T17:00:00Z',
    uptimePct: 97.6
  },
  {
    id: 'ATE-05',
    fab: 'Fab B',
    model: 'Ultraflex',
    status: 'maintenance',
    healthScore: null,
    temperature: null,
    powerW: null,
    utilisation7d: 0,
    lastFaultAt: null,
    calibrationDueAt: '2026-05-23T17:00:00Z',
    uptimePct: null
  },
  {
    id: 'ATE-06',
    fab: 'Fab C',
    model: 'Ultraflex',
    status: 'online',
    healthScore: 89,
    temperature: 45,
    powerW: 1720,
    utilisation7d: 84,
    lastFaultAt: '2026-05-12T09:00:00Z',
    calibrationDueAt: '2026-06-04T17:00:00Z',
    uptimePct: 98.2
  },
  {
    id: 'ATE-07',
    fab: 'Fab C',
    model: 'J750',
    status: 'fault',
    healthScore: null,
    temperature: 91,
    powerW: null,
    utilisation7d: 0,
    lastFaultAt: '2026-05-23T19:59:57Z',
    calibrationDueAt: '2026-05-20T17:00:00Z',
    uptimePct: null
  },
  {
    id: 'ATE-08',
    fab: 'Fab B',
    model: 'J750',
    status: 'online',
    healthScore: 93,
    temperature: 43,
    powerW: 1250,
    utilisation7d: 81,
    lastFaultAt: '2026-04-23T12:00:00Z',
    calibrationDueAt: '2026-07-07T17:00:00Z',
    uptimePct: 99.1
  },
  {
    id: 'ATE-09',
    fab: 'Fab C',
    model: 'Ultraflex',
    status: 'online',
    healthScore: 92,
    temperature: 45,
    powerW: 1750,
    utilisation7d: 78,
    lastFaultAt: '2026-05-08T15:00:00Z',
    calibrationDueAt: '2026-05-25T17:00:00Z',
    uptimePct: 98.5
  },
  {
    id: 'ATE-10',
    fab: 'Fab A',
    model: 'J750',
    status: 'online',
    healthScore: 94,
    temperature: 42,
    powerW: 1260,
    utilisation7d: 83,
    lastFaultAt: '2026-04-28T09:00:00Z',
    calibrationDueAt: '2026-06-10T17:00:00Z',
    uptimePct: 98.9
  },
  {
    id: 'ATE-11',
    fab: 'Fab A',
    model: 'Ultraflex',
    status: 'online',
    healthScore: 96,
    temperature: 41,
    powerW: 1700,
    utilisation7d: 85,
    lastFaultAt: '2026-05-13T16:00:00Z',
    calibrationDueAt: '2026-05-28T17:00:00Z',
    uptimePct: 99.4
  },
  {
    id: 'ATE-12',
    fab: 'Fab B',
    model: 'J750',
    status: 'maintenance',
    healthScore: null,
    temperature: null,
    powerW: null,
    utilisation7d: 0,
    lastFaultAt: '2026-05-05T11:00:00Z',
    calibrationDueAt: '2026-06-22T17:00:00Z',
    uptimePct: null
  }
];

// Mock Maintenance Tasks
let maintenanceTasks = [
  {
    id: 'task-1',
    testerId: 'ATE-05',
    fab: 'Fab B',
    taskType: 'Preventive',
    description: '250hr PM service',
    scheduledAt: '2026-05-23T08:00:00Z',
    estimatedHours: 8,
    actualHours: 4,
    engineerId: 'eng-1',
    engineerName: 'J. Singh',
    status: 'inprogress',
    outcome: '',
    downtime: 4.0
  },
  {
    id: 'task-2',
    testerId: 'ATE-09',
    fab: 'Fab C',
    taskType: 'Calibration',
    description: 'Annual RF calib.',
    scheduledAt: '2026-05-25T09:00:00Z',
    estimatedHours: 4,
    actualHours: 0,
    engineerId: 'eng-2',
    engineerName: 'M. Lee',
    status: 'upcoming',
    outcome: '',
    downtime: 0.0
  },
  {
    id: 'task-3',
    testerId: 'ATE-11',
    fab: 'Fab A',
    taskType: 'Preventive',
    description: '500hr PM service',
    scheduledAt: '2026-05-28T08:00:00Z',
    estimatedHours: 12,
    actualHours: 0,
    engineerId: 'eng-3',
    engineerName: 'R. Patel',
    status: 'planned',
    outcome: '',
    downtime: 0.0
  },
  {
    id: 'task-4',
    testerId: 'ATE-02',
    fab: 'Fab A',
    taskType: 'Calibration',
    description: 'Timing calib.',
    scheduledAt: '2026-06-03T10:00:00Z',
    estimatedHours: 3,
    actualHours: 0,
    engineerId: 'eng-1',
    engineerName: 'J. Singh',
    status: 'planned',
    outcome: '',
    downtime: 0.0
  },
  {
    id: 'task-5',
    testerId: 'ATE-04',
    fab: 'Fab B',
    taskType: 'Preventive',
    description: '250hr PM service',
    scheduledAt: '2026-06-10T08:00:00Z',
    estimatedHours: 8,
    actualHours: 0,
    engineerId: 'eng-tbd',
    engineerName: 'TBD',
    status: 'planned',
    outcome: '',
    downtime: 0.0
  },
  {
    id: 'task-6',
    testerId: 'ATE-07',
    fab: 'Fab C',
    taskType: 'Corrective',
    description: 'Thermal calib. fix',
    scheduledAt: '2026-05-23T20:30:00Z',
    estimatedHours: 6,
    actualHours: 0,
    engineerId: 'eng-unassigned',
    engineerName: 'Unassigned',
    status: 'planned', // overdue corrective
    outcome: '',
    downtime: 0.0
  }
];

let maintenanceHistory = [
  {
    id: 'hist-1',
    testerId: 'ATE-01',
    fab: 'Fab A',
    taskType: 'Preventive',
    description: '250hr PM service',
    scheduledAt: '2026-05-18T08:00:00Z',
    estimatedHours: 8,
    actualHours: 7.33,
    engineerId: 'eng-1',
    engineerName: 'J. Singh',
    status: 'completed',
    outcome: 'Completed · no issues',
    downtime: 7.4
  },
  {
    id: 'hist-2',
    testerId: 'ATE-06',
    fab: 'Fab C',
    taskType: 'Corrective',
    description: 'Power supply replacement',
    scheduledAt: '2026-05-12T10:00:00Z',
    estimatedHours: 4,
    actualHours: 3.16,
    engineerId: 'eng-2',
    engineerName: 'M. Lee',
    status: 'completed',
    outcome: 'Fixed · power supply',
    downtime: 3.2
  },
  {
    id: 'hist-3',
    testerId: 'ATE-08',
    fab: 'Fab B',
    taskType: 'Calibration',
    description: 'Annual RF calib.',
    scheduledAt: '2026-05-08T09:00:00Z',
    estimatedHours: 4,
    actualHours: 4.0,
    engineerId: 'eng-3',
    engineerName: 'R. Patel',
    status: 'completed',
    outcome: 'Calibrated · passed',
    downtime: 4.0
  },
  {
    id: 'hist-4',
    testerId: 'ATE-10',
    fab: 'Fab A',
    taskType: 'Preventive',
    description: '500hr PM service',
    scheduledAt: '2026-05-02T08:00:00Z',
    estimatedHours: 10,
    actualHours: 9.5,
    engineerId: 'eng-1',
    engineerName: 'J. Singh',
    status: 'completed',
    outcome: 'Minor issue found',
    downtime: 9.5
  }
];

interface Alert {
  id: string;
  severity: string;
  testerId: string;
  fab: string;
  message: string;
  detectedAt: string;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
}

// Mock Alerts
let alerts: Alert[] = [
  {
    id: 'alert-1',
    severity: 'critical',
    testerId: 'ATE-07',
    fab: 'Fab C',
    message: 'Thermal calibration failure. Temperature exceeded 91°C (limit 75°C).',
    detectedAt: '2026-05-23T19:59:57Z',
    acknowledgedBy: null,
    acknowledgedAt: null
  },
  {
    id: 'alert-2',
    severity: 'warning',
    testerId: 'ATE-03',
    fab: 'Fab A',
    message: 'High operating temperature. Operating at 61°C (warning limit 55°C). Uptime declining.',
    detectedAt: '2026-05-23T15:59:57Z',
    acknowledgedBy: null,
    acknowledgedAt: null
  },
  {
    id: 'alert-3',
    severity: 'warning',
    testerId: 'ATE-07',
    fab: 'Fab C',
    message: 'Calibration overdue by 3 days.',
    detectedAt: '2026-05-20T17:00:00Z',
    acknowledgedBy: null,
    acknowledgedAt: null
  },
  {
    id: 'alert-4',
    severity: 'info',
    testerId: 'ATE-09',
    fab: 'Fab C',
    message: 'Annual RF calibration is due in 2 days.',
    detectedAt: '2026-05-22T08:00:00Z',
    acknowledgedBy: null,
    acknowledgedAt: null
  }
];

// Mock Alert Rules
let alertRules = {
  scope: 'fleet',
  scopeId: 'all',
  rules: {
    tempWarningC: 55,
    tempCriticalC: 75,
    healthScoreWarning: 75,
    calibrationReminderDays: 7
  }
};

// 1. GET /api/equipment/fleet
export const getFleet = async (req: Request, res: Response) => {
  const { fab, status } = req.query;
  
  let filteredTesters = testers;
  if (fab && fab !== 'All fabs') {
    filteredTesters = filteredTesters.filter(t => t.fab.toLowerCase() === String(fab).toLowerCase());
  }
  if (status && status !== 'All statuses') {
    filteredTesters = filteredTesters.filter(t => t.status.toLowerCase() === String(status).toLowerCase());
  }

  // Count fleet summary metrics based on raw data
  const onlineCount = testers.filter(t => t.status === 'online' || t.status === 'warning').length;
  const maintenanceCount = testers.filter(t => t.status === 'maintenance').length;
  const faultCount = testers.filter(t => t.status === 'fault').length;
  const warningCount = testers.filter(t => t.status === 'warning').length;

  res.json({
    testers: filteredTesters,
    summary: {
      online: onlineCount,
      maintenance: maintenanceCount,
      fault: faultCount,
      warning: warningCount,
      avgHealth: 88.4,
      avgUtil: 78.4,
      mtbfHrs: 142,
      mttrHrs: 4.2,
      faultsThisWeek: 3
    }
  });
};

// 2. GET /api/equipment/tester/:id
export const getTesterById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tester = testers.find(t => t.id.toUpperCase() === id.toUpperCase());
  
  if (!tester) {
    return res.status(404).json({ error: 'Tester not found' });
  }

  const faultHistory = [
    {
      code: 'THERM_CAL_FAIL_0x4F',
      description: 'Thermal sensor calibration failed limit check',
      detectedAt: '2026-05-23T19:59:57Z',
      resolvedAt: null,
      downtime: 2.0
    },
    {
      code: 'PWR_SPLY_ERR',
      description: 'Power supply voltage fluctuation',
      detectedAt: '2026-05-12T10:00:00Z',
      resolvedAt: '2026-05-12T13:12:00Z',
      downtime: 3.2
    }
  ];

  const specificMaintenance = maintenanceTasks.filter(t => t.testerId === tester.id);
  const specificHistory = maintenanceHistory.filter(t => t.testerId === tester.id);

  const sensorReadings = [
    { timestamp: '2026-05-23T15:00:00Z', tempC: 45, powerW: 1250, healthScore: 95 },
    { timestamp: '2026-05-23T16:00:00Z', tempC: 48, powerW: 1260, healthScore: 94 },
    { timestamp: '2026-05-23T17:00:00Z', tempC: 55, powerW: 1280, healthScore: 91 },
    { timestamp: '2026-05-23T18:00:00Z', tempC: 72, powerW: 1300, healthScore: 82 },
    { timestamp: '2026-05-23T19:00:00Z', tempC: 91, powerW: 1350, healthScore: 50 }
  ];

  res.json({
    tester,
    faultHistory,
    maintenanceLog: [...specificMaintenance, ...specificHistory],
    sensorReadings
  });
};

// 3. GET /api/equipment/utilisation
export const getUtilisation = async (req: Request, res: Response) => {
  // Mock daily 7d utilisation time series for overview
  const timeSeries = {
    testerId: 'ATE-01',
    daily: [
      { date: '2026-05-17', pct: 80 },
      { date: '2026-05-18', pct: 81 },
      { date: '2026-05-19', pct: 83 },
      { date: '2026-05-20', pct: 85 },
      { date: '2026-05-21', pct: 82 },
      { date: '2026-05-22', pct: 79 },
      { date: '2026-05-23', pct: 82 }
    ]
  };

  const byFab = [
    { fab: 'Fab A', avgPct: 76 },
    { fab: 'Fab B', avgPct: 84 },
    { fab: 'Fab C', avgPct: 62 }
  ];

  const idleBreakdown = {
    plannedMaintenance: 88,
    unplannedFault: 42,
    queueWait: 61,
    calibration: 23,
    totalHrs: 214
  };

  res.json({
    timeSeries,
    byFab,
    idleBreakdown
  });
};

// 4. GET /api/equipment/maintenance
export const getMaintenance = async (req: Request, res: Response) => {
  res.json({
    scheduled: maintenanceTasks,
    history: maintenanceHistory
  });
};

// 5. POST /api/equipment/maintenance
export const createMaintenance = async (req: Request, res: Response) => {
  const { testerId, taskType, description, scheduledAt, estimatedHours, engineerId } = req.body;
  
  const newTask = {
    id: `task-${Date.now()}`,
    testerId: testerId || 'ATE-01',
    fab: testers.find(t => t.id === testerId)?.fab || 'Fab A',
    taskType: taskType || 'Preventive',
    description: description || 'Scheduled Maintenance',
    scheduledAt: scheduledAt || new Date().toISOString(),
    estimatedHours: estimatedHours ? Number(estimatedHours) : 4,
    actualHours: 0,
    engineerId: engineerId || 'eng-unassigned',
    engineerName: engineerId === 'eng-1' ? 'J. Singh' : engineerId === 'eng-2' ? 'M. Lee' : 'Unassigned',
    status: 'upcoming',
    outcome: '',
    downtime: 0.0
  };

  maintenanceTasks.push(newTask);
  res.status(201).json({ task: newTask });
};

// 6. PATCH /api/equipment/maintenance/:id
export const updateMaintenance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, actualHours, outcome } = req.body;
  
  const taskIndex = maintenanceTasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Maintenance task not found' });
  }

  const updatedTask = {
    ...maintenanceTasks[taskIndex],
    status: status || maintenanceTasks[taskIndex].status,
    actualHours: actualHours !== undefined ? Number(actualHours) : maintenanceTasks[taskIndex].actualHours,
    outcome: outcome || maintenanceTasks[taskIndex].outcome,
    downtime: actualHours !== undefined ? Number(actualHours) : maintenanceTasks[taskIndex].downtime
  };

  // If completed, move to history
  if (status === 'completed') {
    maintenanceTasks.splice(taskIndex, 1);
    const completedHistory = {
      ...updatedTask,
      status: 'completed',
      outcome: outcome || 'Completed successfully'
    };
    maintenanceHistory.unshift(completedHistory);
    return res.json({ task: completedHistory });
  }

  maintenanceTasks[taskIndex] = updatedTask;
  res.json({ task: updatedTask });
};

// 7. GET /api/equipment/alerts
export const getAlerts = async (req: Request, res: Response) => {
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledgedBy).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.acknowledgedBy).length;
  const infoCount = alerts.filter(a => a.severity === 'info' && !a.acknowledgedBy).length;

  res.json({
    alerts: alerts.filter(a => !a.acknowledgedBy),
    summary: {
      critical: criticalCount,
      warning: warningCount,
      info: infoCount,
      resolvedToday: 3
    }
  });
};

// 8. PATCH /api/equipment/alerts/:id/acknowledge
export const acknowledgeAlert = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  const alertIndex = alerts.findIndex(a => a.id === id);
  if (alertIndex === -1) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  alerts[alertIndex] = {
    ...alerts[alertIndex],
    acknowledgedBy: userId || 'User-1',
    acknowledgedAt: new Date().toISOString()
  };

  res.json({ alert: alerts[alertIndex] });
};

// 9. GET /api/equipment/metrics/mtbf-mttr
export const getMtbfMttr = async (req: Request, res: Response) => {
  res.json({
    mtbfHrs: 142,
    mttrHrs: 4.2,
    faultEvents: [
      {
        code: 'THERM_CAL_FAIL_0x4F',
        description: 'ATE-07 Thermal calibration failure',
        detectedAt: '2026-05-23T19:59:57Z',
        resolvedAt: null,
        downtime: 2.0
      },
      {
        code: 'PWR_SPLY_ERR',
        description: 'ATE-06 Power supply replacement',
        detectedAt: '2026-05-12T10:00:00Z',
        resolvedAt: '2026-05-12T13:12:00Z',
        downtime: 3.2
      }
    ],
    byTester: testers.map(t => ({
      testerId: t.id,
      mtbfHrs: t.id === 'ATE-07' ? 95 : t.id === 'ATE-03' ? 120 : 160,
      mttrHrs: t.id === 'ATE-07' ? 6.0 : t.id === 'ATE-03' ? 5.1 : 3.8
    }))
  });
};

// 10. POST /api/equipment/alerts/rules
export const updateAlertRules = async (req: Request, res: Response) => {
  const { scope, scopeId, rules } = req.body;
  
  const updatedRule = {
    scope: scope || 'fleet',
    scopeId: scopeId || 'all',
    rules: {
      ...alertRules.rules,
      ...rules
    }
  };

  res.json({ rule: updatedRule });
};
