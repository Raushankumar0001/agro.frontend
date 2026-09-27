import React, { useState, useEffect } from 'react'; // Import useEffect
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

function App() {
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [ph, setPh] = useState('');
  const [image, setImage] = useState(null);
  const [cropRecommendation, setCropRecommendation] = useState('');
  const [soilTypeFromImage, setSoilTypeFromImage] = useState('');
  const [allSoilTypes, setAllSoilTypes] = useState([]); // New state for all soil types
  const [selectedSoilType, setSelectedSoilType] = useState(''); // New state for selected soil type from dropdown
  const [allStates, setAllStates] = useState([]); // New state for all states
  const [selectedState, setSelectedState] = useState(''); // New state for selected state from dropdown

  void state;


  // Fetch soil types from backend on component mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/get_soil_types`)
      .then((response) => response.json())
      .then((data) => {
        setAllSoilTypes(data);
        if (data.length > 0) {
          setSelectedSoilType(data[0]); // Set default selected soil type
        }
      })
      .catch((error) => {
        console.error('Error fetching soil types:', error);
      });

    // Fetch states from backend on component mount
    fetch(`${API_BASE_URL}/get_states`)
      .then((response) => response.json())
      .then((data) => {
        setAllStates(data);
        if (data.length > 0) {
          setSelectedState(data[0]); // Set default selected state
          setState(data[0]); // Also set the state for the recommendation
        }
      })
      .catch((error) => {
        console.error('Error fetching states:', error);
      });

  }, []);

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedImage = e.target.files[0];
      setImage(URL.createObjectURL(uploadedImage));

      // Send image to backend for soil type classification
      const formData = new FormData();
      formData.append('image', uploadedImage);

      try {
        const response = await fetch(`${API_BASE_URL}/classify_soil_image`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.error) {
          alert(`Error classifying soil image: ${data.error}`);
          setSoilTypeFromImage('');
        } else {
          setSoilTypeFromImage(data.soil_type);
          setSelectedSoilType(data.soil_type); // Set dropdown to detected soil type
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to soil classification service.');
        setSoilTypeFromImage('');
      }
    }
  };

  const handleRecommendCrop = () => {
    const data = {
      state: selectedState, // Use selected state from dropdown
      city,
      ph,
      // Prioritize dropdown selection, then image detection, otherwise backend will use Bhuvan/fallback
      soil_type_from_dropdown: selectedSoilType, 
      soil_type_from_image: soilTypeFromImage, 
    };

    fetch(`${API_BASE_URL}/recommend_crop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          setCropRecommendation(data.crop_suggestion || 'No recommendation available');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="container">
      <header className="header">
        <h1>AI-Powered Farming Assistant</h1>
      </header>
      <main className="dashboard">
        <div className="input-section">
          <h2>Dashboard</h2>
          <div className="form-group">
            <label>State</label>
            <select value={selectedState} onChange={(e) => {
              setSelectedState(e.target.value);
              setState(e.target.value); // Update the state for the recommendation
            }}>
              {allStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="form-group">
            <label>pH</label>
            <input type="text" value={ph} onChange={(e) => setPh(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Upload Soil Image</label>
            <input type="file" onChange={handleImageChange} accept="image/*" />
            {soilTypeFromImage && <p>Detected Soil Type: {soilTypeFromImage}</p>}
          </div>
          <div className="form-group">
            <label>Select Soil Type (Optional)</label>
            <select value={selectedSoilType} onChange={(e) => setSelectedSoilType(e.target.value)}>
              {allSoilTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <button onClick={handleRecommendCrop}>Recommend Crop</button>
          </div>
        </div>
        <div className="output-section">
          <div className="card">
            <h3>Recommended Crops</h3>
            <p>{cropRecommendation || '[Placeholder for recommended crops]'}</p>
          </div>
          <div className="card">
            <h3>Yield & Profit Forecast</h3>
            <p>[Placeholder for yield and profit forecast]</p>
          </div>
          <div className="card">
            <h3>Image Analysis Result</h3>
            {image && <img src={image} alt="Uploaded crop" className="uploaded-image" />}
            <p>[Placeholder for image analysis result]</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
