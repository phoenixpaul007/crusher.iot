const exportToExcel = useCallback(() => {
  if (filteredReadings.length === 0) {
    setError("No data to export. Please load data first.");
    return;
  }

  setExporting(true);
  setExportProgress(0);

  setTimeout(async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Crusher Data');

      // Add headers
      const headers = [
        '#', 'Timestamp', 'Voltage (V)', 'Current (A)',
        'Current R (A)', 'Current Y (A)', 'Current B (A)',
        'ON Hours (Hrs)', 'Watts Total (W)', 'Frequency (Hz)',
        'Power Factor (PF)'
      ];
      
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FF00B894' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A2A2A' } };
      });

      setExportProgress(30);

      // Add data
      filteredReadings.forEach((reading, index) => {
        const data = reading["data "] || reading.data || [];
        const timestamp = reading["timestamp "] || reading.timestamp;
        
        const row = worksheet.addRow([
          index + 1,
          timestamp ? timestamp.trim() : 'N/A',
          parseFloat(getValue(data, "VLL_Average")) || 0,
          parseFloat(getValue(data, "Current_Total")) || 0,
          parseFloat(getValue(data, "Current_R_Phase")) || 0,
          parseFloat(getValue(data, "Current_Y_Phase")) || 0,
          parseFloat(getValue(data, "Current_B_Phase")) || 0,
          parseFloat(getValue(data, "ON_Hours")) || 0,
          parseFloat(getValue(data, "Watts_Total")) || 0,
          parseFloat(getValue(data, "Frequency")) || 0,
          parseFloat(getValue(data, "True_PF")) || 0,
        ]);

        // Add some styling
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF333333' } },
            left: { style: 'thin', color: { argb: 'FF333333' } },
            bottom: { style: 'thin', color: { argb: 'FF333333' } },
            right: { style: 'thin', color: { argb: 'FF333333' } },
          };
        });
      });

      setExportProgress(70);

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });

      setExportProgress(85);

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const link = document.createElement('a');
      const fileName = `Crusher_Data_${selectedMachine?.plant_type || 'export'}_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.xlsx`;
      
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);

      setExportProgress(100);
      
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 2000);

      console.log("✅ Export completed successfully:", fileName);
    } catch (error) {
      console.error("❌ Export error:", error);
      setError(`Failed to export: ${error.message}`);
      setExporting(false);
      setExportProgress(0);
    }
  }, 100);
}, [filteredReadings, getValue, selectedMachine]);