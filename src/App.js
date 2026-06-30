import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import Login from "./Login.js";
import * as XLSX from 'xlsx';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Paper,
    Button,
    CircularProgress,
    Alert,
    Chip,
    useMediaQuery,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Stack,
    IconButton,
    Tooltip,
    LinearProgress,
    Skeleton,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar,
    Badge,
    TablePagination,
    Divider,
    LinearProgress as MuiLinearProgress,
} from "@mui/material";
import {
    Dashboard as DashboardIcon,
    Business as BusinessIcon,
    Wifi as WifiIcon,
    ElectricBolt as ElectricBoltIcon,
    Speed as SpeedIcon,
    Power as PowerIcon,
    FlashOn as FlashOnIcon,
    Update as UpdateIcon,
    Clear as ClearIcon,
    Cancel as CancelIcon,
    Circle as CircleIcon,
    CalendarToday as CalendarIcon,
    Refresh as RefreshIcon,
    Sort as SortIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    ShowChart as ShowChartIcon,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    FiberManualRecord as FiberManualRecordIcon,
    Download as DownloadIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
} from "@mui/icons-material";
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    ComposedChart,
    Line,
} from 'recharts';
import "./App.css";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#00b894' },
        secondary: { main: '#00cec9' },
        background: { default: '#0a0a0a', paper: '#1a1a1a' },
        text: { primary: '#e0e0e0', secondary: '#b0b0b0' },
        success: { main: '#00b894' },
        error: { main: '#ff6b6b' },
        warning: { main: '#fdcb6e' },
        info: { main: '#74b9ff' },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: { backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: 12 },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 12 },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: { borderBottom: '1px solid #333', color: '#e0e0e0' },
                head: { backgroundColor: '#2a2a2a', fontWeight: 'bold', color: '#00b894' },
            },
        },
    },
});

const CustomTooltip = React.memo(({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '1px solid #00b894' }}>
                <Typography variant="caption" sx={{ color: '#b0b0b0' }}>{label}</Typography>
                {payload.map((entry, index) => (
                    <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                        {entry.name}: {entry.value?.toFixed?.(2) || entry.value}
                    </Typography>
                ))}
            </Paper>
        );
    }
    return null;
});

const StatCard = React.memo(({ title, value, icon: Icon, color = "#00b894", subtitle, iconBgColor }) => (
    <Card sx={{
        height: '100%',
        background: `linear-gradient(135deg, #1a1a1a 0%, #1e1e1e 100%)`,
        border: `1px solid ${color}33`,
        '&:hover': { borderColor: color, transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
    }}>
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="caption" sx={{ color: '#b0b0b0' }}>{title}</Typography>
                    <Typography variant="h4" sx={{ color: color, fontWeight: 'bold', mt: 1 }}>
                        {typeof value === 'number' ? value.toFixed(2) : value}
                    </Typography>
                    {subtitle && <Typography variant="caption" sx={{ color: '#666' }}>{subtitle}</Typography>}
                </Box>
                <Avatar sx={{ bgcolor: iconBgColor || `${color}20`, color: color }}><Icon /></Avatar>
            </Box>
        </CardContent>
    </Card>
));

// Live Status Card Component
const LiveStatusCard = ({ title, value, unit, icon: Icon, color = "#00b894", status }) => (
    <Card sx={{
        height: '100%',
        background: `linear-gradient(135deg, #1a1a1a 0%, #1e1e1e 100%)`,
        border: `1px solid ${color}33`,
    }}>
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="caption" sx={{ color: '#b0b0b0' }}>{title}</Typography>
                    <Typography variant="h5" sx={{ color: color, fontWeight: 'bold', mt: 1 }}>
                        {value} {unit}
                    </Typography>
                    {status && (
                        <Chip
                            size="small"
                            icon={<CircleIcon sx={{ fontSize: 10 }} />}
                            label={status}
                            sx={{
                                mt: 1,
                                backgroundColor: status === 'Active' ? 'rgba(0,184,148,0.2)' : 'rgba(255,107,107,0.2)',
                                color: status === 'Active' ? '#00b894' : '#ff6b6b',
                                border: `1px solid ${status === 'Active' ? '#00b894' : '#ff6b6b'}`
                            }}
                        />
                    )}
                </Box>
                <Avatar sx={{ bgcolor: `${color}20`, color: color }}><Icon /></Avatar>
            </Box>
        </CardContent>
    </Card>
);

function App() {
    const [machineList, setMachineList] = useState([]);
    const [readings, setReadings] = useState([]);
    const [filteredReadings, setFilteredReadings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [dateFilter, setDateFilter] = useState({ fromDate: '', toDate: '' });
    const [refreshing, setRefreshing] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortBy, setSortBy] = useState('timestamp');
    const [machineStatus, setMachineStatus] = useState('inactive');
    const [chartData, setChartData] = useState([]);
    const [stats, setStats] = useState({
        avgVoltage: 0,
        avgCurrent: 0,
        avgPowerfactor: 0,
        avgFrequency: 0,
        avgWatts: 0,
        maxWatts: 0,
        minWatts: 0,
        maxVoltage: 0,
        minVoltage: 0,
        maxCurrent: 0,
        minCurrent: 0,
        minPf: 0,
        maxPf: 0,
        minFreq: 0,
        maxFreq: 0,
        totalRunningHours: 0,
        totalMinutes: 0,
    });
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [exporting, setExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [liveData, setLiveData] = useState({
        currentTotal: 0,
        voltageLLAvg: 0,
        truePF: 0,
        frequency: 0,
        phaseCurrents: { R: 0, Y: 0, B: 0 },
        lastUpdate: null
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const COLORS = ['#00b894', '#74b9ff', '#fdcb6e', '#ff6b6b', '#a29bfe', '#00cec9'];
    const exportIntervalRef = useRef(null);

    const paginatedData = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredReadings.slice(start, start + rowsPerPage);
    }, [filteredReadings, page, rowsPerPage]);

    useEffect(() => {
        getCrusherList();
    }, []);

    useEffect(() => {
        if (readings.length > 0) {
            const sorted = [...readings];

            sorted.sort((a, b) => {
                if (sortBy === "timestamp") {
                    const dateA = parseTimestamp(a["timestamp "] || a.timestamp);
                    const dateB = parseTimestamp(b["timestamp "] || b.timestamp);

                    if (!dateA || !dateB) return 0;

                    return sortOrder === "desc"
                        ? dateB.getTime() - dateA.getTime()
                        : dateA.getTime() - dateB.getTime();
                }

                return 0;
            });

            setFilteredReadings(sorted);
        }
    }, [readings, sortOrder, sortBy]);

    // Update charts and stats when filtered readings change
    useEffect(() => {
        if (filteredReadings.length > 0) {
            updateChartData();
            calculateStats();
            setPage(0);
        }
    }, [filteredReadings]);

    // Get value from data array
    const getValue = useCallback((dataArray, sensorName) => {
        if (!dataArray || !Array.isArray(dataArray)) return "0";

        const item = dataArray.find(x => {
            const name = (x["name "] || x["name"] || "").trim();
            return name === sensorName || name === sensorName + ' ' || name === ' ' + sensorName;
        });

        if (item) {
            return item["value "] ?? item["value"] ?? "0";
        }
        return "0";
    }, []);

    // Parse timestamp
    const parseTimestamp = useCallback((timestamp) => {
        if (!timestamp) return null;
        try {
            let date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                date = new Date(timestamp.replace(' ', 'T'));
            }
            return isNaN(date.getTime()) ? null : date;
        } catch (e) {
            return null;
        }
    }, []);

    // Get crusher list
    const getCrusherList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                "https://iot-api.schwingcloud.com/SAP_api.svc/Crusher_IOT",
                '{"json_type":"Crusher Mac Data"}',
                { headers: { "Content-Type": "text/plain" }, timeout: 15000 }
            );

            const result = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

            if (result.data && result.data.length > 0) {
                setMachineList(result.data);
                setSelectedMachine(result.data[0]);
                checkCurrentMachineStatus();
                fetchLiveData(result.data[0]);
                setError("Please select a date range and click 'Load Data'.");
            } else {
                setError("No machines found");
            }
        } catch (error) {
            setError(`Failed to fetch machines: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch live data for a machine
    const fetchLiveData = useCallback(async (machine) => {
        if (!machine) return;

        try {
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 1 * 60 * 1000);

            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.000`;
            };

            const payload = {
                json_type: "Crusher Data",
                plant_type: machine?.plant_type,
                ip: machine?.ip,
                st_date: formatDate(fiveMinutesAgo),
                ed_date: formatDate(now),
                receied_on: selectedMachine?.receied_on || '',
            };

            const response = await axios.post(
                "https://iot-api.schwingcloud.com/SAP_api.svc/Crusher_IOT",
                JSON.stringify(payload),
                {
                    headers: { "Content-Type": "text/plain" },
                    timeout: 30000
                }
            );

            const result = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
            const readingsData = result.readings || result.data || [];

            if (readingsData.length > 0) {
                const latestReading = readingsData[0];
                const data = latestReading["data "] || latestReading.data || [];

                setLiveData({
                    currentTotal: parseFloat(getValue(data, "Current_Total")) || 0,
                    voltageLLAvg: parseFloat(getValue(data, "VLL_Average")) || 0,
                    truePF: parseFloat(getValue(data, "True_PF")) || 0,
                    frequency: parseFloat(getValue(data, "Frequency")) || 0,
                    phaseCurrents: {
                        R: parseFloat(getValue(data, "Current_R_Phase")) || 0,
                        Y: parseFloat(getValue(data, "Current_Y_Phase")) || 0,
                        B: parseFloat(getValue(data, "Current_B_Phase")) || 0,
                    },
                    lastUpdate: latestReading["timestamp "] || latestReading.timestamp
                });
            }
        } catch (err) {
            console.error("❌ Error fetching live data:", err);
        }
    }, [getValue]);

    // Apply filters and sort
    const applyFiltersAndSort = useCallback(() => {
        if (!readings.length) {
            setFilteredReadings([]);
            return;
        }

        let filtered = [...readings];

        if (dateFilter.fromDate || dateFilter.toDate) {
            let fromDate = null, toDate = null;

            if (dateFilter.fromDate) {
                fromDate = new Date(dateFilter.fromDate);
                fromDate.setHours(0, 0, 0, 0);
            }
            if (dateFilter.toDate) {
                toDate = new Date(dateFilter.toDate);
                toDate.setHours(23, 59, 59, 999);
            }

            filtered = filtered.filter(reading => {
                const timestamp = reading["timestamp "] || reading.timestamp;
                const date = parseTimestamp(timestamp);
                if (!date) return false;

                if (fromDate && toDate) {
                    return date >= fromDate && date <= toDate;
                } else if (fromDate) {
                    return date >= fromDate;
                } else if (toDate) {
                    return date <= toDate;
                }
                return true;
            });
        }

        filtered.sort((a, b) => {
            if (sortBy === 'timestamp') {
                const dateA = parseTimestamp(a["timestamp "] || a.timestamp);
                const dateB = parseTimestamp(b["timestamp "] || b.timestamp);
                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            } else if (sortBy === 'voltage') {
                const valA = parseFloat(getValue(a["data "] || a.data, "VLL_Average") || 0);
                const valB = parseFloat(getValue(b["data "] || b.data, "VLL_Average") || 0);
                return sortOrder === 'desc' ? valB - valA : valA - valB;
            } else if (sortBy === 'frequency') {
                const valA = parseFloat(getValue(a["data "] || a.data, "Frequency") || 0);
                const valB = parseFloat(getValue(b["data "] || b.data, "Frequency") || 0);
                return sortOrder === 'desc' ? valB - valA : valA - valB;
            } else if (sortBy === 'current') {
                const valA = parseFloat(getValue(a["data "] || a.data, "Current_Total") || 0);
                const valB = parseFloat(getValue(b["data "] || b.data, "Current_Total") || 0);
                return sortOrder === 'desc' ? valB - valA : valA - valB;
            } else if (sortBy === 'currentR') {
                const valA = parseFloat(getValue(a["data "] || a.data, "Current_R_Phase") || 0);
                const valB = parseFloat(getValue(b["data "] || b.data, "Current_R_Phase") || 0);
                return sortOrder === 'desc' ? valB - valA : valA - valB;
            } else if (sortBy === 'currentY') {
                const valA = parseFloat(getValue(a["data "] || a.data, "Current_Y_Phase") || 0);
                const valB = parseFloat(getValue(b["data "] || b.data, "Current_Y_Phase") || 0);
                return sortOrder === 'desc' ? valB - valA : valA - valB;
            } else if (sortBy === 'currentB') {
                const valA = parseFloat(getValue(a["data "] || a.data, "Current_B_Phase") || 0);
                const valB = parseFloat(getValue(b["data "] || b.data, "Current_B_Phase") || 0);
                return sortOrder === 'desc' ? valB - valA : valA - valB;
            }
            return 0;
        });

        setFilteredReadings(filtered);
    }, [readings, dateFilter, sortOrder, sortBy, parseTimestamp, getValue]);

    // Fetch crusher data with date range
    const fetchCrusherData = useCallback(async (plantType, ip) => {
        if (!dateFilter.fromDate) {
            setError("Please select a 'From Date'.");
            return;
        }

        const fromDate = new Date(dateFilter.fromDate);

        let toDate;

        if (dateFilter.toDate) {
            toDate = new Date(dateFilter.toDate);
        } else {
            toDate = new Date(fromDate);
            toDate.setHours(
                fromDate.getHours() + 1,
                fromDate.getMinutes(),
                fromDate.getSeconds(),
                0
            );
        }

        if (fromDate > toDate) {
            setError("Start date must be before end date");
            return;
        }

        const diffDays = (toDate - fromDate) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) {
            setError("Date range is too large (max 7 days). Please select a smaller range.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.000`;
            };

            const formattedStart = formatDate(fromDate);
            const formattedEnd = formatDate(toDate);

            console.log("📅 Fetching data from:", formattedStart, "to", formattedEnd);

            const payload = {
                json_type: "Crusher Data",
                plant_type: plantType || "Crusher_101",
                ip: ip || "192.168.250.26",
                st_date: formattedStart,
                ed_date: formattedEnd,
                receied_on: selectedMachine?.receied_on || '',
            };

            const response = await axios.post(
                "https://iot-api.schwingcloud.com/SAP_api.svc/Crusher_IOT",
                JSON.stringify(payload),
                {
                    headers: { "Content-Type": "text/plain" },
                    timeout: 120000
                }
            );

            let result = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

            let readingData = null;
            if (result.readings && Array.isArray(result.readings)) {
                readingData = result.readings;
            } else if (result.data && Array.isArray(result.data)) {
                readingData = result.data;
            } else if (Array.isArray(result)) {
                readingData = result;
            }

            const filteredData = readingData.filter((reading) => {
                const timestamp = reading["timestamp "] || reading.timestamp;
                if (!timestamp) return false;
                const readingDate = parseTimestamp(timestamp);
                if (!readingDate) return false;
                return readingDate >= fromDate && readingDate <= toDate;
            });

            if (filteredData.length === 0) {
                setReadings([]);
                setFilteredReadings([]);
                setChartData([]);
                setIsDataLoaded(false);
                setError("No readings found for the selected date range.");
                setLoading(false);
                return;
            }

            setReadings(filteredData);
            setFilteredReadings(filteredData);
            setLastUpdated(new Date());
            setIsDataLoaded(true);
            setError(null);

            console.log(`✅ Loaded ${filteredData.length} filtered readings`);

            checkMachineStatus(filteredData);

        } catch (error) {
            console.error("❌ Error fetching data:", error);
            setError(`Failed to fetch readings: ${error.message}`);
            setReadings([]);
            setFilteredReadings([]);
            setIsDataLoaded(false);
        } finally {
            setLoading(false);
        }
    }, [dateFilter]);

    // Calculate running hours from readings
    const calculateRunningHours = useCallback((readingsData) => {
        if (!readingsData || readingsData.length < 2) return 0;

        // Sort readings by timestamp (ascending)
        const sortedReadings = [...readingsData].sort((a, b) => {
            const dateA = parseTimestamp(a["timestamp "] || a.timestamp);
            const dateB = parseTimestamp(b["timestamp "] || b.timestamp);
            return dateA - dateB;
        });

        let totalRunningSeconds = 0;
        let isRunning = false;
        let startTime = null;

        for (let i = 0; i < sortedReadings.length; i++) {
            const reading = sortedReadings[i];
            const data = reading["data "] || reading.data || [];
            const current = parseFloat(getValue(data, "Current_Total")) || 0;
            const timestamp = parseTimestamp(reading["timestamp "] || reading.timestamp);

            if (!timestamp) continue;

            // Current > 0 means machine is running
            if (current > 0) {
                if (!isRunning) {
                    // Machine just started
                    isRunning = true;
                    startTime = timestamp;
                    console.log(`🟢 Machine started at: ${timestamp}`);
                }
            } else {
                if (isRunning && startTime) {
                    // Machine stopped - calculate running time
                    const runningSeconds = (timestamp - startTime) / 1000;
                    totalRunningSeconds += runningSeconds;
                    console.log(`🔴 Machine stopped at: ${timestamp}, Ran for: ${runningSeconds} seconds`);
                    isRunning = false;
                    startTime = null;
                }
            }
        }

        // If machine is still running at the end of data
        if (isRunning && startTime) {
            const lastTimestamp = parseTimestamp(sortedReadings[sortedReadings.length - 1]["timestamp "] || 
                                                sortedReadings[sortedReadings.length - 1].timestamp);
            if (lastTimestamp) {
                const runningSeconds = (lastTimestamp - startTime) / 1000;
                totalRunningSeconds += runningSeconds;
                console.log(`🟢 Machine still running, added ${runningSeconds} seconds`);
            }
        }

        const totalHours = totalRunningSeconds / 3600;
        console.log(`✅ Total Running Hours: ${totalHours.toFixed(2)} hours`);
        return totalHours;
    }, [parseTimestamp, getValue]);

    // Check machine status from fetched data
    const checkMachineStatus = useCallback((readingData) => {
        if (!readingData || !readingData.length) {
            setMachineStatus("inactive");
            return;
        }

        const latestReading = readingData.reduce((latest, current) => {
            const latestDate = parseTimestamp(latest?.["timestamp "] || latest?.timestamp);
            const currentDate = parseTimestamp(current["timestamp "] || current.timestamp);
            if (!latestDate) return current;
            if (!currentDate) return latest;
            return currentDate > latestDate ? current : latest;
        });

        const lastTime = parseTimestamp(latestReading["timestamp "] || latestReading.timestamp);

        if (!lastTime) {
            setMachineStatus("inactive");
            return;
        }

        const diffMinutes = (Date.now() - lastTime.getTime()) / 60000;
        setMachineStatus(diffMinutes <= 10 ? "active" : "inactive");
    }, [parseTimestamp]);

    // Check current machine status
    const checkCurrentMachineStatus = useCallback(async () => {
        if (!selectedMachine) {
            setMachineStatus("inactive");
            return;
        }

        try {
            const now = new Date();
            //const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.000`;
            };

            const payload = {
                json_type: "Crusher Data",
                plant_type: selectedMachine?.plant_type,
                ip: selectedMachine?.ip,
                st_date: formatDate(now),
                ed_date: formatDate(now),
            };

            const response = await axios.post(
                "https://iot-api.schwingcloud.com/SAP_api.svc/Crusher_IOT",
                JSON.stringify(payload),
                {
                    headers: { "Content-Type": "text/plain" },
                    timeout: 30000
                }
            );

            const result = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
            const readings = result.readings || result.data || [];

            if (!readings || readings.length === 0) {
                setMachineStatus("inactive");
                return;
            }

            const latest = readings[0];
            const ts = parseTimestamp(latest?.["timestamp "] || latest?.timestamp);

            if (!ts) {
                setMachineStatus("inactive");
                return;
            }

            const diffMinutes = (Date.now() - ts.getTime()) / 60000;
            setMachineStatus(diffMinutes <= 10 ? "active" : "inactive");
        } catch (err) {
            console.error("❌ Error checking machine status:", err);
        }
    }, [selectedMachine, parseTimestamp]);

    // Load data handler
    const handleLoadData = useCallback(async () => {
        if (!selectedMachine) {
            setError("No machine selected");
            return;
        }
        if (!dateFilter.fromDate) {
            setError("Please select a 'From Date'.");
            return;
        }
        await fetchCrusherData(selectedMachine.plant_type, selectedMachine.ip);
    }, [selectedMachine, dateFilter, fetchCrusherData]);

    // Update chart data
    const updateChartData = useCallback(() => {
        if (!filteredReadings.length) {
            setChartData([]);
            return;
        }

        const data = filteredReadings.map(reading => {
            const dataArray = reading["data "] || reading.data || [];
            const rawTimestamp = reading["timestamp "] || reading.timestamp || " ";
            const parsedDate = parseTimestamp(rawTimestamp);

            return {
                timestamp: parsedDate ? parsedDate.toISOString() : "",
                voltage: parseFloat(getValue(dataArray, "VLL_Average")) || 0,
                frequency: parseFloat(getValue(dataArray, "Frequency")) || 0,
                current: parseFloat(getValue(dataArray, "Current_Total")) || 0,
                currentR: parseFloat(getValue(dataArray, "Current_R_Phase")) || 0,
                currentY: parseFloat(getValue(dataArray, "Current_Y_Phase")) || 0,
                currentB: parseFloat(getValue(dataArray, "Current_B_Phase")) || 0,
                watts: parseFloat(getValue(dataArray, "Watts_Total")) || 0,
                powerFactor: parseFloat(getValue(dataArray, "True_PF")) || 0,
                onHours: parseFloat(getValue(dataArray, "ON_Hours")) || 0,
            };
        });

        data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const validData = data.filter(d => {
            if (!d.timestamp) return false;
            const date = new Date(d.timestamp);
            return !isNaN(date.getTime());
        });

        setChartData(validData);
    }, [filteredReadings, getValue]);

    // Calculate statistics including running hours
    const calculateStats = useCallback(() => {
        if (!filteredReadings.length) {
            setStats({
                avgVoltage: 0,
                avgCurrent: 0,
                avgPowerfactor: 0,
                avgFrequency: 0,
                avgWatts: 0,
                maxWatts: 0,
                minWatts: 0,
                maxVoltage: 0,
                minVoltage: 0,
                maxCurrent: 0,
                minCurrent: 0,
                minFreq: 0,
                maxFreq: 0,
                totalRunningHours: 0,
                totalMinutes:0,
            });
            return;
        }

        const validData = filteredReadings.map(r => ({
            
                voltage: parseFloat(getValue(r["data "] || r.data, "VLL_Average")) || 0,
                current: parseFloat(getValue(r["data "] || r.data, "Current_Total")) || 0,
                currentR: parseFloat(getValue(r["data "] || r.data, "Current_R_Phase")) || 0,
                currentY: parseFloat(getValue(r["data "] || r.data, "Current_Y_Phase")) || 0,
                currentB: parseFloat(getValue(r["data "] || r.data, "Current_B_Phase")) || 0,
                powerFactor: parseFloat(getValue(r["data "] || r.data, "True_PF")) || 0,
                frequency: parseFloat(getValue(r["data "] || r.data, "Frequency")) || 0,
                watts: parseFloat(getValue(r["data "] || r.data, "Watts_Total")) || 0,
            }))
            .filter(d => d.voltage > 0);

        if (!validData.length) {
            setStats({
                avgVoltage: 0,
                avgCurrent: 0,
                avgPowerfactor: 0,
                avgFrequency: 0,
                avgWatts: 0,
                maxWatts: 0,
                minWatts: 0,
                maxVoltage: 0,
                minVoltage: 0,
                maxCurrent: 0,
                minCurrent: 0,
                totalRunningHours: 0,
                totalMinutes: 0,
            });
            return;
        }

        // Calculate running hours
        const totalRunningHours = calculateRunningHours(filteredReadings);
        const totalMinutes = calculateRunningHours(filteredReadings) * 60;
        const voltages = validData.map(d => d.voltage);
        const currents = validData.map(d => d.current);
        const watts = validData.map(d => d.watts);
        const powerFactors = validData.map(d => d.powerFactor);
        const frequency = validData.map(d => d.frequency);
        const runningData = allData.filter(d => d.current > 0);

        setStats({
            avgVoltage: voltages.reduce((a, b) => a + b, 0) / voltages.length,
            avgCurrent: currents.reduce((a, b) => a + b, 0) / currents.length,
            avgPowerfactor: powerFactors.reduce((a, b) => a + b, 0) / powerFactors.length,
            avgFrequency: validData.reduce((a, b) => a + b.frequency, 0) / validData.length,
            avgWatts: watts.reduce((a, b) => a + b, 0 ) / (validData.length * 1000),//(Kw)
            maxWatts: Math.max(...watts) / 1000,//(Kw)
            minWatts: Math.min(...watts) / 1000,//(Kw)
            maxPf: Math.max(...powerFactors),
            minPf: Math.min(...powerFactors),
            maxVoltage: Math.max(...voltages),
            minVoltage: Math.min(...voltages),
            maxCurrent: Math.max(...currents),
            minCurrent: Math.min(...currents),
            minFreq: Math.min(...frequency),
            maxFreq: Math.max(...frequency),
            totalRunningHours: totalRunningHours,
            totalMinutes: totalMinutes,
        });
    }, [filteredReadings, getValue, calculateRunningHours]);

    // Clear filters
    const clearFilters = useCallback(() => {
        setDateFilter({ fromDate: '', toDate: '' });
        setReadings([]);
        setFilteredReadings([]);
        setChartData([]);
        setIsDataLoaded(false);
        setError("Please select a date range and click 'Load Data'.");
    }, []);

    // Refresh data
    const handleRefresh = useCallback(async () => {
        if (!isDataLoaded || !selectedMachine) return;
        setRefreshing(true);
        await fetchCrusherData(selectedMachine.plant_type, selectedMachine.ip);
        await fetchLiveData(selectedMachine);
        setRefreshing(false);
    }, [selectedMachine, fetchCrusherData, isDataLoaded, fetchLiveData]);

    // Toggle sort
    const toggleSortOrder = useCallback(() => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    }, []);

    // Export to Excel with running hours calculation
    const exportToExcel = useCallback(() => {
        if (filteredReadings.length === 0) {
            setError("No data to export. Please load data first.");
            return;
        }

        setExporting(true);
        setExportProgress(0);

        setTimeout(() => {
            try {
                // Sort readings by timestamp ascending for running hours calculation
                const sortedReadings = [...filteredReadings].sort((a, b) => {
                    const dateA = parseTimestamp(a["timestamp "] || a.timestamp);
                    const dateB = parseTimestamp(b["timestamp "] || b.timestamp);
                    return dateA - dateB;
                });

                // Prepare export data with running hours
                const exportData = [];
                let isRunning = false;
                let startTime = null;
                let runningSeconds = 0;

                sortedReadings.forEach((reading, index) => {
                    const data = reading["data "] || reading.data || [];
                    const timestamp = reading["timestamp "] || reading.timestamp;
                    const current = parseFloat(getValue(data, "Current_Total")) || 0;
                    const voltage = parseFloat(getValue(data, "VLL_Average")) || 0;
                    const frequency = parseFloat(getValue(data, "Frequency")) || 0;
                    const watts = parseFloat(getValue(data, "Watts_Total")) || 0;
                    const powerFactor = parseFloat(getValue(data, "True_PF")) || 0;
                    const currentR = parseFloat(getValue(data, "Current_R_Phase")) || 0;
                    const currentY = parseFloat(getValue(data, "Current_Y_Phase")) || 0;
                    const currentB = parseFloat(getValue(data, "Current_B_Phase")) || 0;
                    const onHours = parseFloat(getValue(data, "ON_Hours")) || 0;

                    const currentTimestamp = parseTimestamp(timestamp);

                    // Track running time
                    if (current > 0) {
                        if (!isRunning) {
                            isRunning = true;
                            startTime = currentTimestamp;
                        }
                    } else {
                        if (isRunning && startTime) {
                            const elapsed = (currentTimestamp - startTime) / 1000;
                            runningSeconds += elapsed;
                            isRunning = false;
                            startTime = null;
                        }
                    }

                    // Add to export data only if current > 0 or it's the first zero after running
                    if (current > 0) {
                        exportData.push({
                            "#": index + 1,
                            "Timestamp": timestamp ? timestamp.trim() : 'N/A',
                            "Voltage (V)": voltage,
                            "Current Total (A)": current,
                            "Current R (A)": currentR,
                            "Current Y (A)": currentY,
                            "Current B (A)": currentB,
                            "Kilo Watts (kW)": watts / 1000,
                            "Frequency (Hz)": frequency,
                            "Power Factor (PF)": powerFactor,
                            "ON Hours (Hrs)": onHours,
                            "Running Hours": (runningSeconds / 3600).toFixed(3),
                            "Status": "Running"
                        });
                    }
                });

                const totalRunningHours = runningSeconds / 3600;

                const summaryData = [
                    {
                        "#": "---",
                        "Timestamp": "TOTAL",
                        "Voltage (V)": "",
                        "Current Total (A)": "",
                        "Current R (A)": "",
                        "Current Y (A)": "",
                        "Current B (A)": "",
                        "Kilo Watts (kW)": "",
                        "Frequency (Hz)": "",
                        "Power Factor (PF)": "",
                        "ON Hours (Hrs)": "",
                        "Running Hours": totalRunningHours.toFixed(3),
                        "Status": "Total Running Hours"
                    }
                ];

                const finalExportData = [...exportData, ...summaryData];

                setExportProgress(30);
                const ws = XLSX.utils.json_to_sheet(finalExportData);

                ws['!cols'] = [
                    { wch: 5 },   // #
                    { wch: 25 },  // Timestamp
                    { wch: 15 },  // Voltage
                    { wch: 18 },  // Current Total
                    { wch: 15 },  // Current R
                    { wch: 15 },  // Current Y
                    { wch: 15 },  // Current B
                    { wch: 15 },  // Kilo Watts
                    { wch: 15 },  // Frequency
                    { wch: 18 },  // Power Factor
                    { wch: 15 },  // ON Hours
                    { wch: 18 },  // Running Hours
                    { wch: 15 },  // Status
                ];

                setExportProgress(60);

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Crusher Data");

                setExportProgress(80);

                const fileName = `Crusher_Data_${selectedMachine?.plant_type || 'export'}_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.xlsx`;

                XLSX.writeFile(wb, fileName);

                setExportProgress(100);
                setError(null);

                setTimeout(() => {
                    setExporting(false);
                    setExportProgress(0);
                }, 2000);

                console.log(`✅ Export completed successfully: ${fileName}`);
                console.log(`📊 Total Running Hours: ${totalRunningHours.toFixed(3)} hours`);
            } catch (error) {
                console.error("❌ Export error:", error);
                setError(`Failed to export: ${error.message}`);
                setExporting(false);
                setExportProgress(0);
            }
        }, 100);
    }, [filteredReadings, getValue, selectedMachine, parseTimestamp]);

    // Auto-check machine status every 5 seconds
    useEffect(() => {
        if (!selectedMachine) return;

        checkCurrentMachineStatus();
        fetchLiveData(selectedMachine);

        const interval = setInterval(() => {
            checkCurrentMachineStatus();
            fetchLiveData(selectedMachine);
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedMachine, checkCurrentMachineStatus, fetchLiveData]);

    if (loading && !machineList.length) {
        return (
            <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box textAlign="center">
                    <CircularProgress sx={{ color: '#00b894' }} />
                    <Typography variant="h6" sx={{ mt: 2, color: '#e0e0e0' }}>One Moment Plz...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh' }}>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    {/* Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} flexWrap="wrap">
                        <Box display="flex" alignItems="center" gap={2}>
                            <DashboardIcon sx={{ color: '#00b894', fontSize: 40 }} />
                            <Typography variant="h4" sx={{ color: '#00b894', fontWeight: 'bold' }}>Crusher Dashboard</Typography>
                            {machineStatus === 'active' && (
                                <Badge color="success" variant="dot" sx={{ '& .MuiBadge-badge': { backgroundColor: '#00b894', animation: 'pulse 2s infinite' } }}>
                                    <Typography variant="caption" sx={{ color: '#00b894', ml: 1 }}>LIVE</Typography>
                                </Badge>
                            )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                            
                            <Chip
                                icon={<CircleIcon sx={{ color: machineStatus === 'active' ? '#00b894' : '#ff6b6b', fontSize: 12 }} />}
                                label={machineStatus === 'active' ? 'Online' : 'Offline'}
                                sx={{
                                    backgroundColor: machineStatus === 'active' ? 'rgba(0,184,148,0.2)' : 'rgba(255,107,107,0.2)',
                                    color: machineStatus === 'active' ? '#00b894' : '#ff6b6b',
                                    border: `1px solid ${machineStatus === 'active' ? '#00b894' : '#ff6b6b'}`
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Machine Info */}
                    {selectedMachine && (
                        <Card sx={{ mb: 3, border: `1px solid ${machineStatus === 'active' ? '#00b894' : '#333'}` }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                                    <Box>
                                        <Typography variant="h5" sx={{ color: '#00b894' }}>{selectedMachine.plant_type}</Typography>
                                        <Box display="flex" alignItems="center" gap={3} flexWrap="wrap" mt={1}>
                                            <Typography variant="body2" sx={{ color: '#b0b0b0' }}><PersonIcon sx={{ color: '#ffffff',fontSize: 24 }} />Customer: {selectedMachine?.customer || 'N/A'}</Typography>
                                            <Typography variant="body2" sx={{ color: '#b0b0b0' }}><LocationOnIcon sx={{ color: '#ffffff', fontSize: 24 }} />M/c Location: {selectedMachine?.site || 'N/A'}</Typography>
                                            <Typography hidden variant="body2" sx={{ color: '#b0b0b0' }}><WifiIcon sx={{ color: '#ffffff', fontSize: 24 }} />IP: {selectedMachine?.ip || 'N/A'}</Typography>
                                            <Typography variant="body2" sx={{ color: '#b0b0b0' }}><AccessTimeIcon sx={{ color: '#ffffff', fontSize: 24 }} /> Last Received Readings: {selectedMachine.receied_on ? new Date(selectedMachine.receied_on).toLocaleString() : 'N/A'}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                {exporting && (
                                    <Box sx={{ mt: 2 }}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <MuiLinearProgress
                                                variant="determinate"
                                                value={exportProgress}
                                                sx={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: '#333' }}
                                            />
                                            <Typography variant="caption" sx={{ color: '#00b894' }}>
                                                {exportProgress}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Live Dashboard */}
                    <Card sx={{ mb: 4, border: '1px solid #00b89433' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" sx={{ color: '#00b894' }}>
                                    <FlashOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Live Machine Status
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Chip
                                        size="small"
                                        icon={<UpdateIcon sx={{ fontSize: 14 }} />}
                                        label={`Last update: ${liveData.lastUpdate ? new Date(liveData.lastUpdate).toLocaleTimeString() : 'N/A'}`}
                                        sx={{ color: '#b0b0b0', borderColor: '#333' }}
                                        variant="outlined"
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => fetchLiveData(selectedMachine)}
                                        sx={{ color: '#00b894' }}
                                    >
                                        <RefreshIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <LiveStatusCard
                                        title="Current"
                                        value={liveData.currentTotal.toFixed(2)}
                                        unit="A"
                                        icon={FlashOnIcon}
                                        color="#a29bfe"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <LiveStatusCard
                                        title="Voltage"
                                        value={liveData.voltageLLAvg.toFixed(1)}
                                        unit="V"
                                        icon={ElectricBoltIcon}
                                        color="#74b9ff"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <LiveStatusCard
                                        title="Power Factor"
                                        value={liveData.truePF.toFixed(3)}
                                        unit="Pf"
                                        icon={PowerIcon}
                                        color="#00b894"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <LiveStatusCard
                                        title="Frequency"
                                        value={liveData.frequency.toFixed(2)}
                                        unit="Hz"
                                        icon={SpeedIcon}
                                        color="#fdcb6e"
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2, borderColor: '#333' }} />

                            <Box>
                                <Typography variant="subtitle2" sx={{ color: '#b0b0b0', mb: 1 }}>
                                    Phase Currents (R / Y / B)
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255,107,107,0.1)', border: '1px solid #ff6b6b33' }}>
                                            <Typography variant="caption" sx={{ color: '#ff6b6b' }}>R Phase</Typography>
                                            <Typography variant="h6" sx={{ color: '#ff6b6b' }}>
                                                {liveData.phaseCurrents.R.toFixed(2)} A
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(253,203,110,0.1)', border: '1px solid #fdcb6e33' }}>
                                            <Typography variant="caption" sx={{ color: '#fdcb6e' }}>Y Phase</Typography>
                                            <Typography variant="h6" sx={{ color: '#fdcb6e' }}>
                                                {liveData.phaseCurrents.Y.toFixed(2)} A
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(0,184,148,0.1)', border: '1px solid #00b89433' }}>
                                            <Typography variant="caption" sx={{ color: '#00b894' }}>B Phase</Typography>
                                            <Typography variant="h6" sx={{ color: '#00b894' }}>
                                                {liveData.phaseCurrents.B.toFixed(2)} A
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                    </Card>

                    {machineList.length === 0 ? (
                        <Alert severity="info" sx={{ backgroundColor: '#1a2a3a', color: '#74b9ff', border: '1px solid #74b9ff' }}>
                            No machines available
                        </Alert>
                    ) : (
                        <>
                            {/* Date Filters */}
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                    <Typography variant="h6" sx={{ color: '#00b894', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarIcon /> Select Date Range (Max 7 days)
                                    </Typography>
                                    {(dateFilter.fromDate || dateFilter.toDate) && (
                                        <IconButton onClick={clearFilters} sx={{ color: '#ff6b6b' }}><ClearIcon /></IconButton>
                                    )}
                                </Box>

                                <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems="center">
                                    <TextField
                                        label="From Date"
                                        type="datetime-local"
                                        value={dateFilter.fromDate}
                                        onChange={(e) => setDateFilter({ ...dateFilter, fromDate: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth={isMobile}
                                        sx={{ flex: 1 }}
                                    />
                                    <TextField
                                        label="To Date"
                                        type="datetime-local"
                                        value={dateFilter.toDate}
                                        onChange={(e) => setDateFilter({ ...dateFilter, toDate: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth={isMobile}
                                        sx={{ flex: 1 }}
                                        />
                                        
                                    <Button
                                        variant="contained"
                                        onClick={handleLoadData}
                                        disabled={loading || !dateFilter.fromDate}
                                        fullWidth={isMobile}
                                        sx={{ minWidth: 150 }}
                                    >
                                        {loading ? 'Loading...' : 'Load Data'}
                                        </Button>

                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={exportToExcel}
                                            disabled={exporting || filteredReadings.length === 0}
                                            startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
                                            sx={{
                                                minWidth: 150,
                                                backgroundColor: '#00b894',
                                                '&:hover': { backgroundColor: '#00a381' }
                                            }}>
                                            {exporting ? 'Exporting...' : 'Export Excel'}
                                        </Button>

                                </Stack>

                                <Box mt={2}>
                                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                                        Status: {isDataLoaded ?
                                            <strong style={{ color: '#00b894' }}>Data Loaded ({filteredReadings.length} readings in selected range)</strong> :
                                            <strong style={{ color: '#fdcb6e' }}>Select date range and click Load Data</strong>
                                        }
                                    </Typography>
                                </Box>
                            </Paper>

                            {error && <Alert severity={isDataLoaded ? "warning" : "error"} sx={{ mb: 3 }}>{error}</Alert>}

                            {isDataLoaded && filteredReadings.length > 0 && (
                                <>
                                    {/* Statistics */}
                                    <Grid container spacing={3} sx={{ mb: 3 }}>
                                        <Grid item xs={12} sm={6} md={2}>
                                            <StatCard
                                                title="Avg Voltage (V)"
                                                value={stats.avgVoltage}
                                                icon={ElectricBoltIcon}
                                                color="#74b9ff"
                                                subtitle={`Max: ${stats.maxVoltage.toFixed(2)} | Min: ${stats.minVoltage.toFixed(2)}`}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={2}>
                                            <StatCard
                                                title="Avg Current (A)"
                                                value={stats.avgCurrent}
                                                icon={FlashOnIcon}
                                                color="#a29bfe"
                                                subtitle={`Max: ${stats.maxCurrent.toFixed(2)} | Min: ${stats.minCurrent.toFixed(2)}`}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={2}>
                                                <StatCard
                                                title="Avg Kilo Watts (Kw)"
                                                value={stats.avgWatts}
                                                icon={PowerIcon}
                                                color="#ff4267"
                                                subtitle={`Max: ${stats.maxWatts.toFixed(2)} | Min: ${stats.minWatts.toFixed(2)}`}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={2}>
                                            <StatCard
                                                title="Avg Power Factor (Pf)"
                                                value={stats.avgPowerfactor}
                                                icon={PowerIcon}
                                                color="#00cec9"
                                                subtitle={`Max: ${stats.maxPf.toFixed(3)} | Min: ${stats.minPf.toFixed(3)}`}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={2}>
                                            <StatCard
                                                title="Avg Frequency (Hz)"
                                                value={stats.avgFrequency}
                                                icon={SpeedIcon}
                                                color="#fdcb6e"
                                                subtitle={`Max: ${stats.maxFreq.toFixed(2)} | Min: ${stats.minFreq.toFixed(2)}`}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={2}>
                                            <StatCard
                                                title="Total Running Hours"
                                                value={stats.totalRunningHours}
                                                icon={SpeedIcon}
                                                color="#67ff42"
                                                subtitle={`In Minutes: ${stats.totalMinutes ? stats.totalMinutes.toFixed(2) : '0.00'}`}
                                                />
                                        </Grid>
                                    </Grid>

                                    {/* Charts */}
                                    {chartData.length > 0 && (
                                        <Grid container spacing={3} sx={{ mb: 3 }}>
                                            <Grid item xs={12}>
                                                <Card sx={{ p: 2 }}>
                                                    <Typography variant="h6" sx={{ color: '#00b894', mb: 2 }}>
                                                        <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                        Voltage & Current Trends ({chartData.length} data points)
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#b0b0b0', display: 'block', mb: 2 }}>
                                                        Time Range: {dateFilter.fromDate ? new Date(dateFilter.fromDate).toLocaleString() : 'Start'} - {dateFilter.toDate ? new Date(dateFilter.toDate).toLocaleString() : 'End'}
                                                    </Typography>
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <ComposedChart data={chartData}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                            <XAxis
                                                                dataKey="timestamp"
                                                                stroke="#666"
                                                                tick={{ fontSize: 10 }}
                                                                angle={-45}
                                                                textAnchor="end"
                                                                height={60}
                                                                interval={Math.floor(chartData.length / 30) || 1}
                                                                tickFormatter={(value) => {
                                                                    if (!value) return '';
                                                                    try {
                                                                        const date = new Date(value);
                                                                        if (isNaN(date.getTime())) return value;
                                                                        return date.toLocaleTimeString();
                                                                    } catch (e) {
                                                                        return value;
                                                                    }
                                                                }}
                                                            />
                                                            <YAxis yAxisId="left" stroke="#74b9ff" />
                                                            <YAxis yAxisId="right" orientation="right" stroke="#a29bfe" />
                                                            <RechartsTooltip content={<CustomTooltip />} />
                                                            <Legend />
                                                            <Area
                                                                yAxisId="left"
                                                                type="monotone"
                                                                dataKey="voltage"
                                                                fill="#74b9ff"
                                                                stroke="#74b9ff"
                                                                fillOpacity={0.3}
                                                                name="Voltage"
                                                            />
                                                            <Line
                                                                yAxisId="right"
                                                                type="monotone"
                                                                dataKey="current"
                                                                stroke="#a29bfe"
                                                                name="Current"
                                                                strokeWidth={2}
                                                                dot={{ fill: '#a29bfe' }}
                                                            />
                                                        </ComposedChart>
                                                    </ResponsiveContainer>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    )}

                                    {/* Sort Controls */}
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
                                        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                            <Typography variant="h6" sx={{ color: '#e0e0e0' }}>
                                                <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                Reading History ({filteredReadings.length} records)
                                            </Typography>
                                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                                <InputLabel sx={{ color: '#b0b0b0' }}>Sort By</InputLabel>
                                                <Select
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                    label="Sort By"
                                                >
                                                    <MenuItem value="timestamp">Timestamp</MenuItem>
                                                    <MenuItem value="voltage">Voltage</MenuItem>
                                                    <MenuItem value="frequency">Frequency</MenuItem>
                                                    <MenuItem value="current">Current Total</MenuItem>
                                                    <MenuItem value="currentR">Current R Phase</MenuItem>
                                                    <MenuItem value="currentY">Current Y Phase</MenuItem>
                                                    <MenuItem value="currentB">Current B Phase</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <IconButton onClick={toggleSortOrder} sx={{ color: '#00b894' }}>
                                                {sortOrder === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                                            </IconButton>
                                            <Chip
                                                icon={<SortIcon />}
                                                label={sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                                                size="small"
                                                sx={{
                                                    borderColor: '#00b894',
                                                    color: '#00b894',
                                                    backgroundColor: 'rgba(0,184,148,0.1)'
                                                }}
                                                variant="outlined"
                                            />
                                        </Box>
                                    </Box>

                                    {/* Table */}
                                    <Paper sx={{ overflow: 'hidden' }}>
                                        <TableContainer sx={{ maxHeight: 600 }}>
                                            <Table stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>#</TableCell>
                                                        <TableCell>Timestamp</TableCell>
                                                        <TableCell align="center">
                                                            <Stack direction="column" alignItems="flex-end" spacing={0}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#74b9ff' }}>
                                                                    Voltage Avg
                                                                </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                                                    (V)
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                            <TableCell align="center">
                                                            <Stack direction="column" alignItems="flex-end" spacing={0}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a29bfe' }}>
                                                                    Current Total
                                                                </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                                                    (A)
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Stack direction="column" alignItems="flex-end" spacing={0}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a29bfe' }}>
                                                                    Current R
                                                                </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                                                    (A)
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Stack direction="column" alignItems="flex-end" spacing={0}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a29bfe' }}>
                                                                    Current Y
                                                                </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                                                    (A)
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Stack direction="column" alignItems="flex-end" spacing={0}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a29bfe' }}>
                                                                    Current B
                                                                </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                                                    (A)
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Stack direction="column" alignItems="flex-end" spacing={0}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff4267' }}>
                                                                    Kilo Watts
                                                                </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                                                    (kW)
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Stack direction="column" alignItems="flex-end" spacing={0}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fdcb6e' }}>
                                                                    Frequency
                                                                </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                                                    (Hz)
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Stack direction="column" alignItems="flex-end" spacing={0}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#00b894' , fontWeight : 'bold' }}>
                                                                    Power Factor
                                                                </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                                                    (PF)
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Stack direction="column" alignItems="flex-end" spacing={0}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#67ff42' }}>
                                                                    Machine Status
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {paginatedData.map((reading, index) => {
                                                        const data = reading["data "] || reading.data || [];
                                                        const timestamp = reading["timestamp "] || reading.timestamp;
                                                        const actualIndex = page * rowsPerPage + index + 1;
                                                        const current = parseFloat(getValue(data, "Current_Total")) || 0;
                                                        
                                                        return (
                                                            <TableRow key={actualIndex} sx={{ 
                                                                '&:hover': { backgroundColor: 'rgba(0,184,148,0.05)' },
                                                                backgroundColor: current > 0 ? 'rgba(0,184,148,0.02)' : 'inherit'
                                                            }}>
                                                                <TableCell>{actualIndex}</TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" sx={{ color: '#74b9ff', fontSize: '0.75rem' }}>
                                                                        {timestamp ? timestamp.trim() : 'N/A'}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Chip
                                                                        label={(parseFloat(getValue(data, "VLL_Average")).toFixed(2))}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: 'rgba(116,185,255,0.1)',
                                                                            color: '#74b9ff',
                                                                            border: '1px solid #74b9ff',
                                                                            fontSize: '0.7rem',
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Chip
                                                                        label={(parseFloat(getValue(data, "Current_Total")).toFixed(2))}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: current > 0 ? 'rgba(0,184,148,0.2)' : 'rgba(162,155,254,0.1)',
                                                                            color: current > 0 ? '#00b894' : '#a29bfe',
                                                                            border: current > 0 ? '1px solid #00b894' : '1px solid #a29bfe',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Chip
                                                                        label={(parseFloat(getValue(data, "Current_R_Phase")).toFixed(2))}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: 'rgba(162,155,254,0.1)',
                                                                            color: '#a29bfe',
                                                                            border: '1px solid #a29bfe',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Chip
                                                                        label={(parseFloat(getValue(data, "Current_Y_Phase")).toFixed(2))}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: 'rgba(162,155,254,0.1)',
                                                                            color: '#a29bfe',
                                                                            border: '1px solid #a29bfe',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Chip
                                                                        label={(parseFloat(getValue(data, "Current_B_Phase")).toFixed(2))}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: 'rgba(162,155,254,0.1)',
                                                                            color: '#a29bfe',
                                                                            border: '1px solid #a29bfe',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Chip
                                                                        label={(parseFloat(getValue(data, "Watts_Total")) / 1000).toFixed(2)}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: 'rgba(220,66,103,0.1)',
                                                                            color: '#ff4267',
                                                                            border: '1px solid #ff4267',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Chip
                                                                        label={(parseFloat(getValue(data, "Frequency")).toFixed(2))}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: 'rgba(253,203,110,0.1)',
                                                                            color: '#fdcb6e',
                                                                            border: '1px solid #fdcb6e',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Chip
                                                                        label={(parseFloat(getValue(data, "True_PF")).toFixed(3))}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: 'rgba(0,184,148,0.1)',
                                                                            color: '#00b894',
                                                                            border: '1px solid #00b894',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Chip
                                                                        label={current > 0 ? 'Running' : 'Stopped'}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: current > 0 ? 'rgba(0,184,148,0.2)' : 'rgba(255,107,107,0.1)',
                                                                            color: current > 0 ? '#67ff42' : '#ff6b6b',
                                                                            border: current > 0 ? '1px solid #67ff42' : '1px solid #ff6b6b',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <TablePagination
                                            rowsPerPageOptions={[25, 50, 100, 200, 500]}
                                            component="div"
                                            count={filteredReadings.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={(e, newPage) => setPage(newPage)}
                                            onRowsPerPageChange={(e) => {
                                                setRowsPerPage(parseInt(e.target.value, 10));
                                                setPage(0);
                                            }}
                                            sx={{ borderBottom: 'none', color: '#e0e0e0' }}
                                        />
                                    </Paper>
                                </>
                            )}

                            {isDataLoaded && filteredReadings.length === 0 && !loading && (
                                <Alert severity="info" sx={{ backgroundColor: '#1a2a3a', color: '#74b9ff', border: '1px solid #74b9ff', mb: 3 }}>
                                    No data available for the selected date range. Please adjust the date range and click "Load Data" again.
                                </Alert>
                            )}
                        </>
                    )}
                </Container>
            </Box>
            <style>
                {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
            </style>
        </ThemeProvider>
    );
}

export default App;