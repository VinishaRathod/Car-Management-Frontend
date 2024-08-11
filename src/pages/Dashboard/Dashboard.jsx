import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css'
function Dashboard() {
  const [cars, setCars] = useState([]);
  const [newCar, setNewCar] = useState({ make: '', model: '', year: '', vin: '' });
  const [editMode, setEditMode] = useState(false);
  const [editCarId, setEditCarId] = useState(null);
  const [vinError, setVinError] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/cars', { headers: { Authorization: `Bearer ${token}` } });
      setCars(res.data);
    };

    fetchCars();
  }, []);

  const handleAddOrEditCar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Check for VIN uniqueness
    const isVinUnique = !cars.some(car => car.vin === newCar.vin && car._id !== editCarId);
    if (!isVinUnique) {
      setVinError('VIN must be unique');
      return;
    }
    setVinError('');

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/cars/${editCarId}`, newCar, { headers: { Authorization: `Bearer ${token}` } });
        setEditMode(false);
        setEditCarId(null);
      } else {
        await axios.post('http://localhost:5000/api/cars', newCar, { headers: { Authorization: `Bearer ${token}` } });
      }
      setNewCar({ make: '', model: '', year: '', vin: '' });
      const res = await axios.get('http://localhost:5000/api/cars', { headers: { Authorization: `Bearer ${token}` } });
      setCars(res.data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDeleteCar = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/cars/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setCars(cars.filter(car => car._id !== id));
  };

  const handleEditCar = (car) => {
    setNewCar(car);
    setEditMode(true);
    setEditCarId(car._id);
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Dashboard</h2>
        <button onClick={() => setEditMode(false)}>Add Car</button>
        <button onClick={() => setEditMode(true)}>List Cars</button>
      </div>
      <div className="main-content">
        <h2>{editMode ? 'Edit Car' : 'Add Car'}</h2>
        <form onSubmit={handleAddOrEditCar} className="car-form">
          <input
            type="text"
            placeholder="Make"
            value={newCar.make}
            onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Model"
            value={newCar.model}
            onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
            required
          />
          <select
            value={newCar.year}
            onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
            required
          >
            <option value="">Select Year</option>
            {[...Array(30)].map((_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="VIN"
            value={newCar.vin}
            onChange={(e) => setNewCar({ ...newCar, vin: e.target.value })}
            required
          />
          {vinError && <p className="error">{vinError}</p>}
          <button type="submit">{editMode ? 'Update Car' : 'Add Car'}</button>
        </form>

        <ul className="car-list">
          {cars.map((car) => (
            <li key={car._id}>
              {car.make} {car.model} ({car.year}) - {car.vin}
              <button onClick={() => handleEditCar(car)}>Edit</button>
              <button onClick={() => handleDeleteCar(car._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
