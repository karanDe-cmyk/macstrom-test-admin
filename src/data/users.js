

const initialUsers = [
  {
    id: 1,
    name: "ProGamer123",
    fullName: "Alex Johnson",
    email: "progamer@email.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    joined: "2023-12-15",
    status: "Active",
    verified: true,
    deposits: 2450.5,
    withdrawals: 1200,
    balance: 1250.5,
    lastActive: "2 hours ago",
    assignedAdmin: "", 
    bank: {
      accountNumber: "****1234",
      ifsc: "HDFC0001234",
      upiId: "progamer@paytm",
      bankName: "HDFC Bank",
    },
    kycDocs: [
      {
        type: "Government Id",
        uploaded: "2023-12-16",
        status: "Verified",
        url: "/images/adh1.jpg",
      },
      {
        type: "Photo",
        uploaded: "2023-12-16",
        status: "Verified",
        url: "/images/pas1.jpg",
      },
      {
        type: "Address Proof",
        uploaded: "2023-12-16",
        status: "Verified",
        url: "/images/pan1.jpg",
      },
    ],
    payments: [
      {
        id: "DEP-001",
        type: "Deposit",
        method: "UPI",
        amount: 500,
        date: "2024-01-08 14:32:15",
        status: "Active"
      },
      {
        id: "WTH-001",
        type: "withdrawal",
        method: "Bank Transfer",
        amount: 250,
        date: "2024-01-08 12:18:45",
        status: "Pending"
      }
    ],

   gameplay: {
  totalMatches: 45,
  wins: 32,
  avgKills: 8.5,
  winRate: 71.1,
  currentTeam: "Phoenix Warriors",
  favoriteGame: "Mobile Legends",
  totalEarnings: 2450.5,
},
transactions: [
  {
    id: "TXN1001",
    date: "2025-07-22T10:30:00Z",
    type: "Credit", // or "Debit"
    description: "Match reward",
    amount: 150.0,
    status: "Success",
  },
  {
    id: "TXN1002",
    date: "2025-07-20T15:45:00Z",
    type: "Debit",
    description: "Withdrawal to bank",
    amount: 300.0,
    status: "Pending",
  },
],

auditTrail: [
  {
    id: 1,
    action: "KYC Document Verified",
    performedBy: "AdminUser1",
    role: "Admin",
    timestamp: "2025-07-20T10:15:00Z",
  },
  {
    id: 2,
    action: "Updated bank info",
    performedBy: "AdminUser2",
    role: "Moderator",
    timestamp: "2025-07-18T14:45:00Z",
  },
],


  },


  {
    id: 2,
    name: "EliteSniper",
    fullName: "Sarah Chen",
    email: "elite@email.com",
    location: "Los Angeles, USA",
    joined: "2023-11-20",
    status: "Active",
    verified: true,
    deposits: 5670,
    withdrawals: 3200,
    balance: 2470,
    lastActive: "1 day ago",
    assignedAdmin: "",

    bank: {
      accountNumber: "****1234",
      ifsc: "HDFC0001234",
      upiId: "progamer@paytm",
      bankName: "HDFC Bank",
    },
    kycDocs: [
      {
        type: "Government Id",
        uploaded: "2023-12-16",
        status: "Verified",
        url: "/images/adh1.jpg",
      },
      {
        type: "Photo",
        uploaded: "2023-12-16",
        status: "Verified",
        url: "/images/pas1.jpg",
      },
      {
        type: "Address Proof",
        uploaded: "2023-12-16",
        status: "Verified",
        url: "/images/pan1.jpg",
      },
    ],
    payments: [
      {
        id: "DEP-001",
        type: "Deposit",
        method: "UPI",
        amount: 500,
        date: "2024-01-08 14:32:15",
        status: "Active"
      },
      {
        id: "WTH-001",
        type: "withdrawal",
        method: "Bank Transfer",
        amount: 250,
        date: "2024-01-08 12:18:45",
        status: "Pending"
      }
    ],

   gameplay: {
  totalMatches: 45,
  wins: 32,
  avgKills: 8.5,
  winRate: 71.1,
  currentTeam: "Phoenix Warriors",
  favoriteGame: "Mobile Legends",
  totalEarnings: 2450.5,
},
transactions: [
  {
    id: "TXN1001",
    date: "2025-07-22T10:30:00Z",
    type: "Credit", // or "Debit"
    description: "Match reward",
    amount: 150.0,
    status: "Success",
  },
  {
    id: "TXN1002",
    date: "2025-07-20T15:45:00Z",
    type: "Debit",
    description: "Withdrawal to bank",
    amount: 300.0,
    status: "Pending",
  },
],

auditTrail: [
  {
    id: 1,
    action: "KYC Document Verified",
    performedBy: "AdminUser1",
    role: "Admin",
    timestamp: "2025-07-20T10:15:00Z",
  },
  {
    id: 2,
    action: "Updated bank info",
    performedBy: "AdminUser2",
    role: "Moderator",
    timestamp: "2025-07-18T14:45:00Z",
  },
],
  },
  {
    id: 3,
    name: "SuspiciousPlayer",
    fullName: "Unknown User",
    email: "suspicious@email.com",
    location: "Unknown",
    joined: "2024-01-05",
    status: "Suspended",
    verified: false,
    deposits: 0,
    withdrawals: 0,
    balance: 0,
    lastActive: "3 days ago",
    assignedAdmin: "",
    bank: {
      accountNumber: "****1234",
      ifsc: "HDFC0001234",
      upiId: "progamer@paytm",
      bankName: "HDFC Bank",
    },
    kycDocs: [
      {
        type: "Government Id",
        uploaded: "2023-12-16",
        status: "Verified",
        url: "/images/adh1.jpg",
      },
      {
        type: "Photo",
        uploaded: "2023-12-16",
        status: "Verified",
        url: "/images/pas1.jpg",
      },
      {
        type: "Address Proof",
        uploaded: "2023-12-16",
        status: "Verified",
        url: "/images/pan1.jpg",
      },
    ],
    payments: [
      {
        id: "DEP-001",
        type: "Deposit",
        method: "UPI",
        amount: 500,
        date: "2024-01-08 14:32:15",
        status: "Active"
      },
      {
        id: "WTH-001",
        type: "withdrawal",
        method: "Bank Transfer",
        amount: 250,
        date: "2024-01-08 12:18:45",
        status: "Pending"
      }
    ],

   gameplay: {
  totalMatches: 45,
  wins: 32,
  avgKills: 8.5,
  winRate: 71.1,
  currentTeam: "Phoenix Warriors",
  favoriteGame: "Mobile Legends",
  totalEarnings: 2450.5,
},
transactions: [
  {
    id: "TXN1001",
    date: "2025-07-22T10:30:00Z",
    type: "Credit", // or "Debit"
    description: "Match reward",
    amount: 150.0,
    status: "Success",
  },
  {
    id: "TXN1002",
    date: "2025-07-20T15:45:00Z",
    type: "Debit",
    description: "Withdrawal to bank",
    amount: 300.0,
    status: "Pending",
  },
],

auditTrail: [
  {
    id: 1,
    action: "KYC Document Verified",
    performedBy: "AdminUser1",
    role: "Admin",
    timestamp: "2025-07-20T10:15:00Z",
  },
  {
    id: 2,
    action: "Updated bank info",
    performedBy: "AdminUser2",
    role: "Moderator",
    timestamp: "2025-07-18T14:45:00Z",
  },
],
  },
];

export default initialUsers;

// supportData.js

export const tickets = [
  {
    id: "TKT-1001",
    subject: "Payment issue",
    user: "John Doe",
    email: "john@example.com",
    status: "high",
    assignedTo: "You",
    createdAt: "2025-07-25T10:00:00", // ← ISO date
    slaHours: 2,
    messages: [
      {
        sender: "John Doe",
        time: "4:00:00 PM",
        text: "Hello, I have an issue with my payment",
        isAdmin: false,
      },
      {
        sender: "Admin",
        time: "4:15:00 PM",
        text: "Can you provide more details about the issue?",
        isAdmin: true,
      },
    ],
  },
  {
    id: "TKT-1002",
    subject: "Account verification",
    user: "Jane Smith",
    email: "jane@example.com",
    status: "medium",
    assignedTo: "",
    createdAt: "2025-07-25T10:00:00", // ← ISO date
    slaHours: 2,
    messages: [],
  },
];

export const admins = ["Admin1", "Admin2", "Admin3"];

export const cannedReplies = {
  "Payment Issue": "Hello, regarding your payment issue, please share a screenshot of the transaction.",
  "Account Verification": "Your account verification is under process. We'll notify you shortly.",
  "Technical Issue": "Please describe the technical issue you're facing so we can assist further.",
};


// constants/user.js

export const profitAndLossData = {
  Today: {
    revenue: 45230,
    costs: 28940,
    profit: 16290,
    margin: '36.0%',
    revenueChange: '+8.50%',
    costsChange: '+12.30%',
  },
  'Last 7 Days': {
    revenue: 312000,
    costs: 210500,
    profit: 101500,
    margin: '32.5%',
    revenueChange: '+4.80%',
    costsChange: '+9.10%',
  },
  'Last 30 Days': {
    revenue: 1250000,
    costs: 895000,
    profit: 355000,
    margin: '28.4%',
    revenueChange: '+2.10%',
    costsChange: '+7.80%',
  },
};


// src/constants/admins.js
export const Admins = [
  {
    id: 1,
    name: "Ravi Kumar",
    email: "ravi@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-07-27 10:30 AM",
    permissions: "Full",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-07-26 02:10 PM",
    permissions: "Limited",
  },
];


import { Cpu, Database, HardDrive, CloudOff } from "lucide-react";

export const metrics = [
  {
    title: "CPU Usage",
    value: "0.0%",
    status: "healthy",
    icon: Cpu,
    color: "text-blue-600",
  },
  {
    title: "Memory Usage",
    value: "0.0%",
    status: "healthy",
    icon: Database,
    color: "text-green-600",
  },
  {
    title: "DB Connections",
    value: "0/100",
    status: "healthy",
    icon: HardDrive,
    color: "text-purple-600",
  },
  {
    title: "Redis Hit Rate",
    value: "0.0%",
    status: "critical",
    icon: CloudOff,
    color: "text-orange-600",
  },
];


export const auditLogs = [
  {
    action: "Tournament Created",
    details: "Created Mobile Legends Championship tournament",
    severity: "Medium",
    admin: "Sarah Johnson",
    resource: "tournament:789",
    ip: "10.0.0.45",
    agent: "Safari 17.0",
    timestamp: "7/17/2025, 11:59:54 PM",
  },
  {
    action: "Payout Approved",
    details: "Approved $1,250 payout to EliteSniper",
    severity: "High",
    admin: "Mike Chen",
    resource: "payout:4521",
    ip: "172.16.0.23",
    agent: "Firefox 121.0",
    timestamp: "7/17/2025, 11:59:54 PM",
  },
  {
    action: "User Banned",
    details: "Banned user ProGamer123 for cheating violation",
    severity: "High",
    admin: "John Smith",
    resource: "user:12345",
    ip: "192.168.1.100",
    agent: "Chrome 120.0",
    timestamp: "7/17/2025, 11:59:54 PM",
  },
  {
    action: "Ledger Adjustment",
    details: "Manual credit adjustment: +$500 - Tournament prize correction",
    severity: "Critical",
    admin: "John Smith",
    resource: "ledger:platform",
    ip: "192.168.1.100",
    agent: "Chrome 120.0",
    timestamp: "7/17/2025, 11:59:54 PM",
  },
];


// Top Stats
import { Users, Activity, Gamepad2, DollarSign } from "lucide-react";
export const summaryStats = [
  { label: "Total Players", value: "12,500", icon: Users, },
  { label: "Online Now", value: "1,340", icon: Activity, },
  { label: "Matches Played", value: "45,234", icon: Gamepad2, },
  { label: "Revenue", value: "$89,000" , icon: DollarSign,},
];

export const barData = {
  labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  datasets: [
    {
      label: "This Week",
      data: [1200, 1900, 3000, 5000, 3200, 4200, 4800],
      backgroundColor: "#2b53d6ff", 
      borderRadius: 8,
      barThickness: 30,
    },
    {
      label: "Last Week",
      data: [1000, 1700, 2600, 4500, 2800, 3900, 4400],
      backgroundColor: "#e5e7eb", // light gray for contrast
      borderRadius: 8,
      barThickness: 30,
    },
  ],
};


export const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#000",
        font: {
          size: 13,
          weight: "bold",
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      categoryPercentage: 0.5,   // Reduce to increase space between groups
      barPercentage: 0.7,        // Reduce bar width
      ticks: {
        color: "#333",
        font: {
          size: 12,
        },
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: "#333",
        font: {
          size: 12,
        },
        callback: (value) => `$${value}`,
      },
      grid: {
        color: "#eee",
      },
    },
  },
};




export const donutData1 = {
  labels: ["Free-Fire", "PubG", "Call of Duty", "League of Legends"],
  datasets: [
    {
      label: "Player Type",
      data: [300, 200, 100, 150],
      backgroundColor: ["#2b53d6ff", "#CAF0F8", "#90E0EF", "#dddddd"],
    },
  ],
};


export const donutOptions = {
  responsive: true,
  cutout: "40%",
  plugins: {
    legend: {
      position: "bottom",
      align: "center",
      labels: {
        usePointStyle: true,
        pointStyle: "rectRounded",  // More modern look
        boxWidth: 14,
        padding: 20,
        color: "#333",
        font: {
          size: 13,
        },
      },
    },
  },
  maintainAspectRatio: false,
};


export const miniLineData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      label: "Monthly Players",
      data: [800, 1000, 950, 1240],
      fill: false,
      borderColor: "black",
      tension: 0.4,
    },
  ],
};

export const miniOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { display: false },
    y: { display: false },
  },
};

export const divisionData = [
  { name: "Bronze", count: 3400 },
  { name: "Silver", count: 2800 },
  { name: "Gold", count: 2100 },
  { name: "Platinum", count: 900 },
];



// 📁 /data/playersActiveChart.js

export const playersActiveData = {
  labels: ["6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"],
  datasets: [
    {
      label: "Active Players",
      data: [120, 200, 350, 420, 390, 460, 500, 480, 430],
      borderColor: "#90E0EF", // Yellow
      backgroundColor: "rgba(250, 204, 21, 0.2)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#facc15",
      pointBorderWidth: 2,
    },
  ],
};

export const playersActiveOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "#f3f4f6",
      },
      ticks: {
        color: "#6b7280",
        font: { size: 12 },
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#6b7280",
        font: { size: 12 },
      },
    },
  },
};
