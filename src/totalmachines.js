import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    Box,
    Typography,
    Avatar,
    LinearProgress as MuiLinearProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Person2Icon from '@mui/icons-material/Person2';

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
            // Remove the error message or change to success message
            // setError("Please select a date range and click 'Load Data'."); // This is confusing - it's not an error
        } else {
            setError("No machines found");
        }
    } catch (error) {
        setError(`Failed to fetch machines: ${error.message}`);
    } finally {
        setLoading(false);
    }
}, []);

// In your JSX:
{selectedMachine && (
    <Card sx={{ mb: 3, border: `1px solid ${machineStatus === 'active' ? '#00b894' : '#333'}` }}>
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Box>
                    <Typography variant="h5" sx={{ color: '#00b894' }}>
                        {selectedMachine.plant_type}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={3} flexWrap="wrap" mt={1}>
                        {/* Customer - Using PersonIcon with Avatar */}
                        <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#00b894' }}>
                                <PersonIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                                Customer: {selectedMachine?.customer || 'N/A'}
                            </Typography>
                        </Box>

                        {/* Location - Using LocationOnIcon with Avatar */}
                        <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#00b894' }}>
                                <LocationOnIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                                M/c Location: {selectedMachine?.site || 'N/A'}
                            </Typography>
                        </Box>

                        {/* IP - Hidden as per your code */}
                        <Typography hidden variant="body2" sx={{ color: '#b0b0b0' }}>
                            IP: {selectedMachine?.ip || 'N/A'}
                        </Typography>

                        {/* Last Received Readings */}
                        <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#00b894' }}>
                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                                Last Received Readings: {selectedMachine?.received_on 
                                    ? new Date(selectedMachine.received_on).toLocaleString() 
                                    : 'N/A'}
                            </Typography>
                        </Box>
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
