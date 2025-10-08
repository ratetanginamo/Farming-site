import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchDevices(){
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/devices`);
      setDevices(res.data.reverse());
    } catch (err) {
      console.error(err);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDevices();
    const id = setInterval(fetchDevices, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <button onClick={fetchDevices} disabled={loading}>Refresh</button>
      <table style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{borderBottom:'1px solid #ddd'}}>Time</th>
            <th style={{borderBottom:'1px solid #ddd'}}>Device</th>
            <th style={{borderBottom:'1px solid #ddd'}}>Soil (%)</th>
            <th style={{borderBottom:'1px solid #ddd'}}>Humidity (%)</th>
            <th style={{borderBottom:'1px solid #ddd'}}>Temperature (°C)</th>
          </tr>
        </thead>
        <tbody>
          {devices.map(d => (
            <tr key={d.id}>
              <td style={{ padding:8 }}>{new Date(d.timestamp).toLocaleString()}</td>
              <td style={{ padding:8 }}>{d.deviceId || 'unknown'}</td>
              <td style={{ padding:8 }}>{d.soilMoisture ?? '-'}</td>
              <td style={{ padding:8 }}>{d.humidity ?? '-'}</td>
              <td style={{ padding:8 }}>{d.temperature ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
    }
  
