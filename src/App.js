  import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
  import axios from "axios";
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
  } from "@mui/material";
  import {
    Dashboard as DashboardIcon,
    Business as BusinessIcon,
    LocationOn as LocationOnIcon,
    Wifi as WifiIcon,
    ElectricBolt as ElectricBoltIcon,
    Speed as SpeedIcon,
    Power as PowerIcon,
    FlashOn as FlashOnIcon,
    Update as UpdateIcon,
    FilterList as FilterListIcon,
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
  } from "@mui/icons-material";
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
    Line
  } from 'recharts';
  import "./App.css";

  // Create dark theme
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#00b894',
      },
      secondary: {
        main: '#00cec9',
      },
      background: {
        default: '#0a0a0a',
        paper: '#1a1a1a',
      },
      text: {
        primary: '#e0e0e0',
        secondary: '#b0b0b0',
      },
      success: {
        main: '#00b894',
      },
      error: {
        main: '#ff6b6b',
      },
      warning: {
        main: '#fdcb6e',
      },
      info: {
        main: '#74b9ff',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e1e1e',
            border: '1px solid #333',
            borderRadius: 12,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 12,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid #333',
            color: '#e0e0e0',
          },
          head: {
            backgroundColor: '#2a2a2a',
            fontWeight: 'bold',
            color: '#00b894',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#444',
              },
              '&:hover fieldset': {
                borderColor: '#00b894',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00b894',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#b0b0b0',
              '&.Mui-focused': {
                color: '#00b894',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: '#2a2a2a',
            color: '#e0e0e0',
          },
          outlined: {
            borderColor: '#444',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          contained: {
            backgroundColor: '#00b894',
            color: '#0a0a0a',
            '&:hover': {
              backgroundColor: '#00a381',
            },
          },
          outlined: {
            borderColor: '#00b894',
            color: '#00b894',
            '&:hover': {
              borderColor: '#00a381',
              backgroundColor: 'rgba(0, 184, 148, 0.1)',
            },
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            color: '#e0e0e0',
            borderBottom: '1px solid #333',
          },
          select: {
            color: '#00b894',
          },
          selectIcon: {
            color: '#00b894',
          },
          actions: {
            color: '#00b894',
          },
        },
      },
    },
  });

  // Custom Tooltip for Charts
  const CustomTooltip = React.memo(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '1px solid #00b894' }}>
          <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
            {label}
          </Typography>
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

  // Memoized Stat Card Component
  const StatCard = React.memo(({ title, value, icon: Icon, color = "#00b894", subtitle }) => (
    <Card sx={{ 
      height: '100%', 
      background: `linear-gradient(135deg, #1a1a1a 0%, #1e1e1e 100%)`,
      border: `1px solid ${color}33`,
      '&:hover': {
        borderColor: color,
        transform: 'translateY(-4px)',
        transition: 'all 0.3s ease'
      }
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color: color, fontWeight: 'bold', mt: 1 }}>
              {typeof value === 'number' ? value.toFixed(2) : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: '#666' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color: color }}>
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  ));

  function App() {
    const [machineList, setMachineList] = useState([]);
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [filteredReadings, setFilteredReadings] = useState([]);
    const [dateFilter, setDateFilter] = useState({
      fromDate: '',
      toDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortBy, setSortBy] = useState('timestamp');
    const [machineStatus, setMachineStatus] = useState('inactive');
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [apiResponse, setApiResponse] = useState(null);
    const [stats, setStats] = useState({
      avgVoltage: 0,
      avgCurrent: 0,
      avgFrequency: 0,
      avgPower: 0,
      maxVoltage: 0,
      minVoltage: 0
    });
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const autoRefreshTimer = useRef(null);
    const COLORS = ['#00b894', '#74b9ff', '#fdcb6e', '#ff6b6b', '#a29bfe', '#00cec9'];

    // Memoized paginated data
    const paginatedData = useMemo(() => {
      const start = page * rowsPerPage;
      const end = start + rowsPerPage;
      return filteredReadings.slice(start, end);
    }, [filteredReadings, page, rowsPerPage]);

    useEffect(() => {
      getCrusherList();
      return () => {
        if (autoRefreshTimer.current) {
          clearInterval(autoRefreshTimer.current);
        }
      };
    }, []);

    useEffect(() => {
      filterAndSortReadings();
      updateChartData();
      calculateStats();
      // Reset to first page when data changes
      setPage(0);
    }, [readings, dateFilter, sortOrder, sortBy]);

    // Auto-refresh for active machines
    useEffect(() => {
      if (machineStatus === 'active' && autoRefreshEnabled) {
        if (autoRefreshTimer.current) {
          clearInterval(autoRefreshTimer.current);
        }
        autoRefreshTimer.current = setInterval(() => {
          handleAutoRefresh();
        }, 5000);
      } else {
        if (autoRefreshTimer.current) {
          clearInterval(autoRefreshTimer.current);
          autoRefreshTimer.current = null;
        }
      }

      return () => {
        if (autoRefreshTimer.current) {
          clearInterval(autoRefreshTimer.current);
          autoRefreshTimer.current = null;
        }
      };
    }, [machineStatus, autoRefreshEnabled, selectedMachine]);

    // Optimized getCrusherList with abort controller
    const getCrusherList = useCallback(async () => {
      const abortController = new AbortController();
      setLoading(true);
      setError(null);
      
      try {
        console.log("🔍 Fetching machine list...");
        
        const response = await axios.post(
          "https://iot-api.schwingcloud.com/SAP_api.svc/Crusher_IOT",
          '{"json_type":"Crusher Mac Data"}',
          {
            headers: {
              "Content-Type": "text/plain"
            },
            signal: abortController.signal,
            timeout: 15000
          }
        );

        const result = typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;

        if (result.data && result.data.length > 0) {
          setMachineList(result.data);
          setSelectedMachine(result.data[0]);
          await fetchCrusherData(result.data[0].plant_type, result.data[0].ip);
        } else {
          setError("No machines found in the response");
        }
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("❌ ERROR fetching machines:", error);
          setError(`Failed to fetch machines: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
      
      return () => abortController.abort();
    }, []);

    // Optimized fetchCrusherData with caching and abort
    const fetchCrusherData = useCallback(async (plantType, ip, retryCount = 0) => {
      const abortController = new AbortController();
      
      try {
        console.log(`🔍 Fetching data for: ${plantType} (${ip})`);
        
        const now = new Date();
        const endDate = now.toISOString().replace('T', ' ').slice(0, 19) + '.000';
        // Use smaller date range for faster response
        const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          .toISOString().replace('T', ' ').slice(0, 19) + '.000';

        const payload = {
          json_type: "Crusher Data",
          plant_type: plantType || "Crusher_101",
          ip: ip || "192.168.250.26",
          st_date: startDate,
          ed_date: endDate
        };

        const response = await axios.post(
          "https://iot-api.schwingcloud.com/SAP_api.svc/Crusher_IOT",
          JSON.stringify(payload),
          {
            headers: { 
              "Content-Type": "text/plain",
              "Accept": "application/json"
            },
            signal: abortController.signal,
            timeout: 30000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          }
        );

        let result;
        try {
          result = typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;
        } catch (parseError) {
          console.error("❌ Failed to parse response:", parseError);
          setError(`Failed to parse API response: ${parseError.message}`);
          return;
        }

        // Extract readings efficiently
        let readingData = null;
        const possibleKeys = ['readings', 'readings ', 'data', 'Readings'];
        
        for (const key of possibleKeys) {
          if (result[key] && Array.isArray(result[key])) {
            readingData = result[key];
            break;
          }
        }
        
        if (!readingData && Array.isArray(result)) {
          readingData = result;
        }
        
        if (!readingData || readingData.length === 0) {
          console.warn("⚠️ No readings found");
          setReadings([]);
          setFilteredReadings([]);
          setLastUpdated(new Date());
          setMachineStatus('inactive');
          setError("No readings available for the selected date range.");
          return;
        }
        
        setReadings(readingData);
        setFilteredReadings(readingData);
        setLastUpdated(new Date());
        checkMachineStatus(readingData);
        setError(null);
        setApiResponse(null);
        
      } catch (error) {
        if (error.name === 'AbortError') return;
        
        console.error("❌ ERROR fetching readings:", error);
        
        // Retry logic with exponential backoff
        if (retryCount < 3 && error.code === 'ECONNABORTED') {
          console.log(`🔄 Retrying... (${retryCount + 1}/3)`);
          const waitTime = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return fetchCrusherData(plantType, ip, retryCount + 1);
        }
        
        let errorMessage = "Failed to fetch readings: ";
        if (error.code === 'ECONNABORTED') {
          errorMessage += "Connection timeout - The server is taking too long to respond.";
        } else if (error.response) {
          errorMessage += `Server responded with ${error.response.status}`;
        } else if (error.request) {
          errorMessage += "No response from server (network error)";
        } else {
          errorMessage += error.message;
        }
        
        setError(errorMessage);
        setReadings([]);
        setFilteredReadings([]);
      }
      
      return () => abortController.abort();
    }, []);

    const handleAutoRefresh = useCallback(async () => {
      if (selectedMachine) {
        await fetchCrusherData(selectedMachine.plant_type, selectedMachine.ip);
      }
    }, [selectedMachine, fetchCrusherData]);

    // Optimized checkMachineStatus
    const checkMachineStatus = useCallback((readingData) => {
      if (readingData && readingData.length > 0) {
        const lastReading = readingData[0];
        const timestamp = lastReading["timestamp "] || lastReading.timestamp;
        if (timestamp) {
          const lastReadingTime = parseTimestamp(timestamp);
          if (lastReadingTime) {
            const now = new Date();
            const diffMinutes = (now - lastReadingTime) / (1000 * 60);
            const isActive = diffMinutes <= 10;
            setMachineStatus(isActive ? 'active' : 'inactive');
            return;
          }
        }
      }
      setMachineStatus('inactive');
    }, []);

    // Optimized parseTimestamp
    const parseTimestamp = useCallback((timestamp) => {
      if (!timestamp) return null;
      try {
        let date;
        if (typeof timestamp === 'string') {
          const cleanTimestamp = timestamp.trim().replace(/[^0-9\-:T. ]/g, '');
          date = new Date(cleanTimestamp);
        } else if (timestamp instanceof Date) {
          date = timestamp;
        } else if (typeof timestamp === 'number') {
          date = new Date(timestamp);
        } else {
          date = new Date(timestamp);
        }
        
        if (isNaN(date.getTime())) {
          const altDate = new Date(timestamp.toString().replace(' ', 'T'));
          if (!isNaN(altDate.getTime())) {
            return altDate;
          }
          return null;
        }
        return date;
      } catch (e) {
        return null;
      }
    }, []);

    // Optimized filterAndSortReadings
    const filterAndSortReadings = useCallback(() => {
      if (!readings.length) {
        setFilteredReadings([]);
        return;
      }

      let filtered = [...readings];

      // Apply date filters with improved date handling
      if (dateFilter.fromDate || dateFilter.toDate) {
        let fromDate = null;
        let toDate = null;
        
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

      // Apply sorting
      if (sortBy === 'timestamp') {
        filtered.sort((a, b) => {
          const dateA = parseTimestamp(a["timestamp "] || a.timestamp);
          const dateB = parseTimestamp(b["timestamp "] || b.timestamp);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
      } else if (sortBy === 'voltage') {
        filtered.sort((a, b) => {
          const valA = parseFloat(getValue(a["data "] || a.data, "VLL_Average") || 0);
          const valB = parseFloat(getValue(b["data "] || b.data, "VLL_Average") || 0);
          return sortOrder === 'desc' ? valB - valA : valA - valB;
        });
      } else if (sortBy === 'frequency') {
        filtered.sort((a, b) => {
          const valA = parseFloat(getValue(a["data "] || a.data, "Frequency") || 0);
          const valB = parseFloat(getValue(b["data "] || b.data, "Frequency") || 0);
          return sortOrder === 'desc' ? valB - valA : valA - valB;
        });
      } else if (sortBy === 'current') {
        filtered.sort((a, b) => {
          const valA = parseFloat(getValue(a["data "] || a.data, "Current_Total") || 0);
          const valB = parseFloat(getValue(b["data "] || b.data, "Current_Total") || 0);
          return sortOrder === 'desc' ? valB - valA : valA - valB;
        });
      }

      setFilteredReadings(filtered);
    }, [readings, dateFilter, sortOrder, sortBy, parseTimestamp]);

    // Optimized updateChartData
    const updateChartData = useCallback(() => {
      if (!filteredReadings.length) {
        setChartData([]);
        return;
      }
      
      // Only process first 50 records for chart to improve performance
      const data = filteredReadings.slice(0, 50).map(reading => {
        const dataArray = reading["data "] || reading.data || [];
        const timestamp = reading["timestamp "] || reading.timestamp;
        return {
          timestamp: timestamp ? timestamp.trim() : 'N/A',
          voltage: parseFloat(getValue(dataArray, "VLL_Average")) || 0,
          frequency: parseFloat(getValue(dataArray, "Frequency")) || 0,
          current: parseFloat(getValue(dataArray, "Current_Total")) || 0,
          power: parseFloat(getValue(dataArray, "Watts_Total")) || 0,
          powerFactor: parseFloat(getValue(dataArray, "True_PF")) || 0,
          onHours: parseFloat(getValue(dataArray, "ON_Hours")) || 0
        };
      }).reverse();
      setChartData(data);
    }, [filteredReadings]);

    // Optimized calculateStats
    const calculateStats = useCallback(() => {
      if (filteredReadings.length === 0) {
        setStats({
          avgVoltage: 0,
          avgCurrent: 0,
          avgFrequency: 0,
          avgPower: 0,
          maxVoltage: 0,
          minVoltage: 0
        });
        return;
      }
      
      // Use more efficient array operations
      const validData = filteredReadings
        .map(r => ({
          voltage: parseFloat(getValue(r["data "] || r.data, "VLL_Average")) || 0,
          current: parseFloat(getValue(r["data "] || r.data, "Current_Total")) || 0,
          frequency: parseFloat(getValue(r["data "] || r.data, "Frequency")) || 0,
          power: parseFloat(getValue(r["data "] || r.data, "Watts_Total")) || 0
        }))
        .filter(d => d.voltage > 0 || d.current > 0);

      if (validData.length === 0) {
        setStats({
          avgVoltage: 0,
          avgCurrent: 0,
          avgFrequency: 0,
          avgPower: 0,
          maxVoltage: 0,
          minVoltage: 0
        });
        return;
      }

      const voltages = validData.map(d => d.voltage);
      const currents = validData.map(d => d.current);
      const frequencies = validData.map(d => d.frequency);
      const powers = validData.map(d => d.power);

      setStats({
        avgVoltage: voltages.reduce((a, b) => a + b, 0) / voltages.length,
        avgCurrent: currents.reduce((a, b) => a + b, 0) / currents.length,
        avgFrequency: frequencies.reduce((a, b) => a + b, 0) / frequencies.length,
        avgPower: powers.reduce((a, b) => a + b, 0) / powers.length,
        maxVoltage: Math.max(...voltages),
        minVoltage: Math.min(...voltages)
      });
    }, [filteredReadings]);

    const clearFilters = useCallback(() => {
      setDateFilter({ fromDate: '', toDate: '' });
      setShowFilters(false);
    }, []);

    const handleRefresh = useCallback(async () => {
      setRefreshing(true);
      if (selectedMachine) {
        await fetchCrusherData(selectedMachine.plant_type, selectedMachine.ip);
      }
      setRefreshing(false);
    }, [selectedMachine, fetchCrusherData]);

    const handleApplyFilters = useCallback(() => {
      setFilterLoading(true);
      setTimeout(() => {
        filterAndSortReadings();
        setFilterLoading(false);
      }, 300);
    }, [filterAndSortReadings]);

    const toggleSortOrder = useCallback(() => {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    }, [sortOrder]);

    const toggleAutoRefresh = useCallback(() => {
      setAutoRefreshEnabled(!autoRefreshEnabled);
    }, [autoRefreshEnabled]);

    // Optimized getValue with memoization
// Optimized getValue with multiple field name variations
const getValue = useCallback((dataArray, sensorName) => {
  if (!dataArray || !Array.isArray(dataArray)) return "0";
  
  // Try multiple variations of the field name
  const variations = [
    sensorName,
    sensorName + ' ',
    ' ' + sensorName,
    sensorName.trim(),
    sensorName.replace('_', ' '),
    sensorName.replace(' ', '_'),
    sensorName.toLowerCase(),
    sensorName.toUpperCase(),
    // Special cases for Current
    sensorName === 'Current_Total' ? 'Current' : null,
    sensorName === 'Current_Total' ? 'Current_Total_Avg' : null,
    sensorName === 'Current_Total' ? 'Current_Total_Avg ' : null,
    sensorName === 'Current_Total' ? 'I_Total' : null,
    sensorName === 'Current_Total' ? 'Amps' : null,
    sensorName === 'Current_Total' ? 'Current (A)' : null,
  ].filter(Boolean); // Remove null values
  
  // Try each variation
  for (const variation of variations) {
    const item = dataArray.find((x) => {
      const name = x["name "] || x["name"] || "";
      return name.trim() === variation.trim();
    });
    
    if (item) {
      const value = item["value "] ?? item["value"] ?? "0";
      return value;
    }
  }
  
  // If still not found, try case-insensitive search
  const lowerSensorName = sensorName.toLowerCase().trim();
  const item = dataArray.find((x) => {
    const name = (x["name "] || x["name"] || "").toLowerCase().trim();
    return name.includes(lowerSensorName) || lowerSensorName.includes(name);
  });
  
  if (item) {
    return item["value "] ?? item["value"] ?? "0";
  }
  
  return "0";
}, []);
    const formatTime = useCallback((date) => {
      if (!date) return "Not updated yet";
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }, []);

    // Pagination handlers
    const handleChangePage = useCallback((event, newPage) => {
      setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    }, []);

    // Machine Card Component
    const MachineCard = React.memo(({ machine }) => {
      const status = machineStatus;
      
      return (
        <Card 
          sx={{ 
            mb: 3, 
            backgroundColor: '#1a1a1a',
            border: `1px solid ${status === 'active' ? '#00b894' : '#333'}`,
            borderRadius: 2,
            boxShadow: status === 'active' ? '0 0 20px rgba(0,184,148,0.1)' : 3,
            '&:hover': {
              borderColor: '#00b894',
            }
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
              <Box>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="h5" component="h3" sx={{ color: '#00b894' }}>
                    {machine.plant_type}
                  </Typography>
                  {status === 'active' && (
                    <Chip
                      icon={<FiberManualRecordIcon sx={{ fontSize: 12, color: '#00b894' }} />}
                      label="Live"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(0,184,148,0.2)',
                        color: '#00b894',
                        animation: 'pulse 2s infinite',
                        border: '1px solid #00b894'
                      }}
                    />
                  )}
                </Box>
                <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <BusinessIcon sx={{ color: '#b0b0b0', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#e0e0e0' }}>{machine.customer || 'N/A'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LocationOnIcon sx={{ color: '#b0b0b0', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#e0e0e0' }}>{machine.site || 'N/A'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <WifiIcon sx={{ color: '#b0b0b0', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#e0e0e0' }}>{machine.ip || 'N/A'}</Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    <strong style={{ color: '#e0e0e0' }}>Last Updated:</strong> {formatTime(lastUpdated)}
                    {machineStatus === 'active' && (
                      <Chip
                        size="small"
                        label="Live Feed"
                        sx={{
                          ml: 2,
                          backgroundColor: 'rgba(0,184,148,0.2)',
                          color: '#00b894',
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    )}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CircleIcon sx={{ color: status === 'active' ? '#00b894' : '#ff6b6b', fontSize: 12 }} />
                    <Typography variant="caption" sx={{ color: status === 'active' ? '#00b894' : '#ff6b6b' }}>
                      {status === 'active' ? 'Online' : 'Offline'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>

                <Tooltip title={autoRefreshEnabled ? 'Auto-refresh on' : 'Auto-refresh off'}>
                  <IconButton 
                    onClick={toggleAutoRefresh}
                    sx={{ 
                      color: autoRefreshEnabled ? '#00b894' : '#666',
                      border: `1px solid ${autoRefreshEnabled ? '#00b894' : '#444'}`
                    }}
                    size="small"
                  >
                    <UpdateIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            {status === 'active' && autoRefreshEnabled && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: '#00b894' }}>
                  ⚡ Auto-refreshing every 5 seconds
                </Typography>
                <LinearProgress 
                  sx={{ 
                    mt: 1, 
                    bgcolor: '#2a2a2a',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#00b894',
                      animation: 'progressAnimation 5s linear infinite'
                    }
                  }}
                  variant="indeterminate"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      );
    });

    // Table Skeleton Loader
    const TableSkeleton = React.memo(() => (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ bgcolor: '#2a2a2a', mb: 1 }} />
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width="100%" height={35} sx={{ bgcolor: '#2a2a2a', mb: 0.5 }} />
          ))}
        </Box>
      </Paper>
    ));

    if (loading) {
      return (
        <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box textAlign="center">
            <CircularProgress sx={{ color: '#00b894' }} />
            <Typography variant="h6" sx={{ mt: 2, color: '#e0e0e0' }}>
              Loading Crusher Data...
            </Typography>
          </Box>
        </Box>
      );
    }

    if (error && !readings.length) {
      return (
        <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', p: 4 }}>
          <Container maxWidth="lg">
            <Alert 
              severity="error"
              sx={{ backgroundColor: '#2a1a1a', color: '#ff6b6b', border: '1px solid #ff6b6b' }}
              action={
                <Button color="inherit" size="small" onClick={getCrusherList} sx={{ color: '#ff6b6b' }}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
            {apiResponse && (
              <Paper sx={{ mt: 2, p: 2, backgroundColor: '#1a1a1a', overflow: 'auto' }}>
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                  API Response Preview:
                </Typography>
                <pre style={{ color: '#e0e0e0', fontSize: '0.8rem', maxHeight: '300px', overflow: 'auto' }}>
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </Paper>
            )}
          </Container>
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
                <Typography variant="h4" component="h1" sx={{ color: '#00b894', fontWeight: 'bold' }}>
                  Crusher Dashboard
                </Typography>
                {machineStatus === 'active' && (
                  <Badge 
                    color="success" 
                    variant="dot"
                    sx={{ 
                      '& .MuiBadge-badge': {
                        backgroundColor: '#00b894',
                        boxShadow: '0 0 10px #00b894',
                        animation: 'pulse 2s infinite'
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#00b894', ml: 1 }}>
                      LIVE
                    </Typography>
                  </Badge>
                )}
              </Box>
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Chip 
                  label={`${machineList.length} Machines`} 
                  color="primary" 
                  variant="outlined"
                  sx={{ color: '#00b894' }}
                />
                <Chip
                  icon={autoRefreshEnabled ? <FiberManualRecordIcon sx={{ color: '#00b894' }} /> : <CancelIcon sx={{ color: '#ff6b6b' }} />}
                  label={autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                  sx={{
                    backgroundColor: autoRefreshEnabled ? 'rgba(0,184,148,0.2)' : 'rgba(255,107,107,0.2)',
                    color: autoRefreshEnabled ? '#00b894' : '#ff6b6b',
                    border: `1px solid ${autoRefreshEnabled ? '#00b894' : '#ff6b6b'}`
                  }}
                />
              </Box>
            </Box>

            {error && readings.length > 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {machineList.length === 0 ? (
              <Alert severity="info" sx={{ backgroundColor: '#1a2a3a', color: '#74b9ff', border: '1px solid #74b9ff' }}>
                No machines available
              </Alert>
            ) : (
              <>
                {/* Machine List */}
                {machineList.map((machine, index) => (
                  <MachineCard key={index} machine={machine} />
                ))}

                {readings.length > 0 && (
                  <>
                    {/* Statistics Cards */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                          title="Average Voltage"
                          value={stats.avgVoltage}
                          icon={ElectricBoltIcon}
                          color="#74b9ff"
                          subtitle={`Max: ${stats.maxVoltage.toFixed(3)} | Min: ${stats.minVoltage.toFixed(3)}`}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                          title="Average Current"
                          value={stats.avgCurrent}
                          icon={FlashOnIcon}
                          color="#a29bfe"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                          title="Average Frequency"
                          value={stats.avgFrequency}
                          icon={SpeedIcon}
                          color="#fdcb6e"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                          title="Average Power"
                          value={stats.avgPower}
                          icon={PowerIcon}
                          color="#00cec9"
                        />
                      </Grid>
                    </Grid>

                    {/* Charts Section */}
                    {chartData.length > 0 && (
                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={8}>
                          <Card sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ color: '#00b894', mb: 2 }}>
                              <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Voltage & Current Trends
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                              <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="timestamp" stroke="#666" tick={{ fontSize: 10 }} />
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
                        <Grid item xs={12} md={4}>
                          <Card sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" sx={{ color: '#00b894', mb: 2 }}>
                              <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Power Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={280}>
                              <PieChart>
                                <Pie
                                  data={chartData.slice(0, 5).map((item, index) => ({
                                    name: `Reading ${index + 1}`,
                                    value: item.power || 0
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {chartData.slice(0, 5).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </Card>
                        </Grid>
                      </Grid>
                    )}

                    {/* Date Filters */}
                    <Paper sx={{ p: 3, mb: 3, position: 'relative' }}>
                      {filterLoading && (
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
                          <LinearProgress sx={{ bgcolor: '#1a1a1a', '& .MuiLinearProgress-bar': { bgcolor: '#00b894' } }} />
                        </Box>
                      )}
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" sx={{ color: '#00b894', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon />
                          Date Filters
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Tooltip title={showFilters ? "Hide filters" : "Show filters"}>
                            <IconButton onClick={() => setShowFilters(!showFilters)} sx={{ color: '#00b894' }}>
                              <FilterListIcon />
                            </IconButton>
                          </Tooltip>
                          {(dateFilter.fromDate || dateFilter.toDate) && (
                            <Tooltip title="Clear filters">
                              <IconButton onClick={clearFilters} sx={{ color: '#ff6b6b' }}>
                                <ClearIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                      
                      {showFilters && (
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
                            onClick={handleApplyFilters}
                            disabled={filterLoading}
                            fullWidth={isMobile}
                          >
                            {filterLoading ? 'Filtering...' : 'Apply Filters'}
                          </Button>
                        </Stack>
                      )}
                      
                      <Box display="flex" justifyContent="space-between" mt={2}>
                        <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                          Total Readings: <strong style={{ color: '#00b894' }}>{readings.length}</strong>
                        </Typography>
                        {filteredReadings.length !== readings.length && (
                          <Typography variant="body2" sx={{ color: '#74b9ff' }}>
                            Filtered: <strong style={{ color: '#74b9ff' }}>{filteredReadings.length}</strong> / {readings.length}
                          </Typography>
                        )}
                      </Box>
                    </Paper>

                    {/* Sort Controls and Refresh Button */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
                      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        <Typography variant="h6" sx={{ color: '#e0e0e0' }}>
                          <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Reading History
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel sx={{ color: '#b0b0b0' }}>Sort By</InputLabel>
                            <Select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value)}
                              label="Sort By"
                              sx={{ 
                                color: '#e0e0e0',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#444',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#00b894',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#00b894',
                                },
                              }}
                            >
                              <MenuItem value="timestamp">Timestamp</MenuItem>
                              <MenuItem value="voltage">Voltage</MenuItem>
                              <MenuItem value="frequency">Frequency</MenuItem>
                              <MenuItem value="current">Current</MenuItem>
                            </Select>
                          </FormControl>
                          
                          <Tooltip title={sortOrder === 'desc' ? 'Sort Ascending' : 'Sort Descending'}>
                            <IconButton onClick={toggleSortOrder} sx={{ color: '#00b894' }}>
                              {sortOrder === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                            </IconButton>
                          </Tooltip>
                          
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
                      
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                      >
                        {refreshing ? 'Refreshing...' : 'Refresh Data'}
                      </Button>
                    </Box>

                    {/* Readings Table with Pagination */}
                    {refreshing ? (
                      <TableSkeleton />
                    ) : filteredReadings.length > 0 ? (
                      <Paper sx={{ overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                          <Table stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    Timestamp
                                    {sortBy === 'timestamp' && (
                                      <Chip 
                                        label={sortOrder === 'desc' ? '↓' : '↑'}
                                        size="small"
                                        sx={{ 
                                          minWidth: 20, 
                                          height: 20,
                                          backgroundColor: 'rgba(0,184,148,0.2)',
                                          color: '#00b894'
                                        }}
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                    Voltage Avg
                                    {sortBy === 'voltage' && (
                                      <Chip 
                                        label={sortOrder === 'desc' ? '↓' : '↑'}
                                        size="small"
                                        sx={{ 
                                          minWidth: 20, 
                                          height: 20,
                                          backgroundColor: 'rgba(0,184,148,0.2)',
                                          color: '#00b894'
                                        }}
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                    Frequency
                                    {sortBy === 'frequency' && (
                                      <Chip 
                                        label={sortOrder === 'desc' ? '↓' : '↑'}
                                        size="small"
                                        sx={{ 
                                          minWidth: 20, 
                                          height: 20,
                                          backgroundColor: 'rgba(0,184,148,0.2)',
                                          color: '#00b894'
                                        }}
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                    Current
                                    {sortBy === 'current' && (
                                      <Chip 
                                        label={sortOrder === 'desc' ? '↓' : '↑'}
                                        size="small"
                                        sx={{ 
                                          minWidth: 20, 
                                          height: 20,
                                          backgroundColor: 'rgba(0,184,148,0.2)',
                                          color: '#00b894'
                                        }}
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">Power Factor</TableCell>
                                <TableCell align="right">ON Hours</TableCell>
                                <TableCell align="right">Watts Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {paginatedData.map((reading, index) => {
                                const data = reading["data "] || reading.data || [];
                                const timestamp = reading["timestamp "] || reading.timestamp;
                                const actualIndex = page * rowsPerPage + index + 1;
                                
                                return (
                                  <TableRow 
                                    key={actualIndex}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: 'rgba(0,184,148,0.05)',
                                      },
                                      '&:nth-of-type(odd)': {
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                      },
                                    }}
                                  >
                                    <TableCell>{actualIndex}</TableCell>
                                    <TableCell>
                                      <Typography variant="body2" sx={{ color: '#74b9ff', fontSize: '0.75rem' }}>
                                        {timestamp ? timestamp.trim() : 'N/A'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Chip 
                                        label={getValue(data, "VLL_Average")}
                                        size="small"
                                        sx={{ 
                                          backgroundColor: 'rgba(116,185,255,0.1)',
                                          color: '#74b9ff',
                                          border: '1px solid #74b9ff',
                                          fontSize: '0.7rem'
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Chip 
                                        label={getValue(data, "Frequency")}
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
                                        label={getValue(data, "Current_Total")}
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
                                        label={getValue(data, "True_PF")}
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
                                        label={getValue(data, "ON_Hours")}
                                        size="small"
                                        sx={{ 
                                          backgroundColor: 'rgba(255,107,107,0.1)',
                                          color: '#ff6b6b',
                                          border: '1px solid #ff6b6b',
                                          fontSize: '0.7rem'
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Chip 
                                        label={getValue(data, "Watts_Total")}
                                        size="small"
                                        sx={{ 
                                          backgroundColor: 'rgba(0,206,201,0.1)',
                                          color: '#00cec9',
                                          border: '1px solid #00cec9',
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
                        
                        {/* Pagination Component */}
                        <TablePagination
                          rowsPerPageOptions={[25, 50, 100, 200, 500]}
                          component="div"
                          count={filteredReadings.length}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onPageChange={handleChangePage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                          sx={{
                            borderBottom: 'none',
                            color: '#e0e0e0',
                            '& .MuiTablePagination-select': {
                              color: '#00b894',
                            },
                            '& .MuiTablePagination-selectIcon': {
                              color: '#00b894',
                            },
                            '& .MuiTablePagination-actions button': {
                              color: '#00b894',
                            },
                          }}
                        />
                        
                        <Box sx={{ p: 2, borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                            Showing <strong style={{ color: '#00b894' }}>{filteredReadings.length}</strong> readings
                            {sortOrder === 'desc' ? ' (newest first)' : ' (oldest first)'}
                          </Typography>
                          <Chip
                            label={`Sorted by: ${sortBy} ${sortOrder === 'desc' ? '↓' : '↑'}`}
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(0,184,148,0.1)',
                              color: '#00b894',
                              border: '1px solid #00b894'
                            }}
                          />
                        </Box>
                      </Paper>
                    ) : (
                      <Alert severity="info" sx={{ backgroundColor: '#1a2a3a', color: '#74b9ff', border: '1px solid #74b9ff' }}>
                        No readings found for the selected date range. Try adjusting your filters or refreshing.
                      </Alert>
                    )}
                  </>
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
            @keyframes progressAnimation {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}
        </style>
      </ThemeProvider>
    );
  }

  export default App;