import React, { useState } from 'react';
import { FaMapMarkerAlt, FaHome, FaBuilding, FaRoad, FaCrosshairs, FaInfoCircle } from 'react-icons/fa';

const DeliveryLocationForm = ({ onLocationSelect, initialAddress = '' }) => {
  const [locationData, setLocationData] = useState({
    streetAddress: '',
    buildingName: '',
    apartmentNumber: '',
    landmark: '',
    area: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    additionalInstructions: '',
    locationType: 'home', // home, office, other
    isExactLocation: false
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocationData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!locationData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }

    if (!locationData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!locationData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }

    if (!locationData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP/Postal code is required';
    }

    if (!locationData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Create a formatted address
    const formattedAddress = [
      locationData.streetAddress,
      locationData.buildingName && `Building: ${locationData.buildingName}`,
      locationData.apartmentNumber && `Apt: ${locationData.apartmentNumber}`,
      locationData.landmark && `Near: ${locationData.landmark}`,
      locationData.area && locationData.area,
      locationData.city,
      locationData.state,
      locationData.zipCode,
      locationData.country
    ].filter(Boolean).join(', ');

    const locationInfo = {
      lat: 0, // We'll use 0 since we're not using maps
      lng: 0,
      address: formattedAddress,
      placeId: null,
      // Additional structured data
      streetAddress: locationData.streetAddress,
      buildingName: locationData.buildingName,
      apartmentNumber: locationData.apartmentNumber,
      landmark: locationData.landmark,
      area: locationData.area,
      city: locationData.city,
      state: locationData.state,
      zipCode: locationData.zipCode,
      country: locationData.country,
      additionalInstructions: locationData.additionalInstructions,
      locationType: locationData.locationType,
      isExactLocation: locationData.isExactLocation
    };

    onLocationSelect(locationInfo);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: `Current Location at ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          placeId: null,
          isExactLocation: true
        };
        onLocationSelect(location);
      },
      (error) => {
        alert('Unable to get your location. Please enter your address manually.');
        console.error('Geolocation error:', error);
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <FaMapMarkerAlt className="mr-2" />
          Delivery Location Details
        </h3>
        
        <p className="text-sm text-blue-700 mb-6">
          Please provide detailed delivery location information to ensure accurate delivery.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Type */}
          <div>
            <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-3">Location Type *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'home', label: 'Home', icon: FaHome },
                { value: 'office', label: 'Office', icon: FaBuilding },
                { value: 'other', label: 'Other', icon: FaRoad }
              ].map(({ value, label, icon: Icon }) => (
                <label key={value} className="relative">
                  <input
                    type="radio"
                    name="locationType"
                    value={value}
                    checked={locationData.locationType === value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    locationData.locationType === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-light-borderHover dark:border-dark-borderHover hover:border-gray-400'
                  }`}>
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
              Street Address * <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="streetAddress"
              value={locationData.streetAddress}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main Street, Victoria Island"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.streetAddress ? 'border-red-300' : 'border-light-borderHover dark:border-dark-borderHover'
              }`}
            />
            {errors.streetAddress && (
              <p className="text-red-500 text-sm mt-1">{errors.streetAddress}</p>
            )}
          </div>

          {/* Building and Apartment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
                Building Name (Optional)
              </label>
              <input
                type="text"
                name="buildingName"
                value={locationData.buildingName}
                onChange={handleInputChange}
                placeholder="e.g., Blue Tower, Shopping Mall"
                className="w-full px-4 py-3 border border-light-borderHover dark:border-dark-borderHover rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
                Apartment/Unit Number (Optional)
              </label>
              <input
                type="text"
                name="apartmentNumber"
                value={locationData.apartmentNumber}
                onChange={handleInputChange}
                placeholder="e.g., Apt 5B, Unit 12"
                className="w-full px-4 py-3 border border-light-borderHover dark:border-dark-borderHover rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
              Nearby Landmark (Optional)
            </label>
            <input
              type="text"
              name="landmark"
              value={locationData.landmark}
              onChange={handleInputChange}
              placeholder="e.g., Near Shoprite, Opposite Bank, Behind Church"
              className="w-full px-4 py-3 border border-light-borderHover dark:border-dark-borderHover rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
              Area/Neighborhood (Optional)
            </label>
            <input
              type="text"
              name="area"
              value={locationData.area}
              onChange={handleInputChange}
              placeholder="e.g., Lekki Phase 1, Ikeja GRA, Surulere"
              className="w-full px-4 py-3 border border-light-borderHover dark:border-dark-borderHover rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
                City * <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={locationData.city}
                onChange={handleInputChange}
                placeholder="e.g., Lagos"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.city ? 'border-red-300' : 'border-light-borderHover dark:border-dark-borderHover'
                }`}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
                State/Province * <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={locationData.state}
                onChange={handleInputChange}
                placeholder="e.g., Lagos State"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.state ? 'border-red-300' : 'border-light-borderHover dark:border-dark-borderHover'
                }`}
              />
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
                ZIP/Postal Code * <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="zipCode"
                value={locationData.zipCode}
                onChange={handleInputChange}
                placeholder="e.g., 100001"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.zipCode ? 'border-red-300' : 'border-light-borderHover dark:border-dark-borderHover'
                }`}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
              Country * <span className="text-red-500">*</span>
            </label>
            <select
              name="country"
              value={locationData.country}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.country ? 'border-red-300' : 'border-light-borderHover dark:border-dark-borderHover'
              }`}
            >
              <option value="">Select a country</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
              <option value="Ethiopia">Ethiopia</option>
              <option value="Egypt">Egypt</option>
              <option value="Morocco">Morocco</option>
              <option value="Algeria">Algeria</option>
              <option value="Tunisia">Tunisia</option>
              <option value="Libya">Libya</option>
              <option value="Sudan">Sudan</option>
              <option value="South Sudan">South Sudan</option>
              <option value="Eritrea">Eritrea</option>
              <option value="Djibouti">Djibouti</option>
              <option value="Somalia">Somalia</option>
              <option value="Uganda">Uganda</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Rwanda">Rwanda</option>
              <option value="Burundi">Burundi</option>
              <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
              <option value="Congo">Congo</option>
              <option value="Central African Republic">Central African Republic</option>
              <option value="Chad">Chad</option>
              <option value="Cameroon">Cameroon</option>
              <option value="Equatorial Guinea">Equatorial Guinea</option>
              <option value="Gabon">Gabon</option>
              <option value="São Tomé and Príncipe">São Tomé and Príncipe</option>
              <option value="Angola">Angola</option>
              <option value="Zambia">Zambia</option>
              <option value="Zimbabwe">Zimbabwe</option>
              <option value="Botswana">Botswana</option>
              <option value="Namibia">Namibia</option>
              <option value="Lesotho">Lesotho</option>
              <option value="Eswatini">Eswatini</option>
              <option value="Mozambique">Mozambique</option>
              <option value="Madagascar">Madagascar</option>
              <option value="Mauritius">Mauritius</option>
              <option value="Seychelles">Seychelles</option>
              <option value="Comoros">Comoros</option>
              <option value="Malawi">Malawi</option>
              <option value="Niger">Niger</option>
              <option value="Mali">Mali</option>
              <option value="Burkina Faso">Burkina Faso</option>
              <option value="Senegal">Senegal</option>
              <option value="Gambia">Gambia</option>
              <option value="Guinea-Bissau">Guinea-Bissau</option>
              <option value="Guinea">Guinea</option>
              <option value="Sierra Leone">Sierra Leone</option>
              <option value="Liberia">Liberia</option>
              <option value="Ivory Coast">Ivory Coast</option>
              <option value="Togo">Togo</option>
              <option value="Benin">Benin</option>
            </select>
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
              Additional Delivery Instructions (Optional)
            </label>
            <textarea
              name="additionalInstructions"
              value={locationData.additionalInstructions}
              onChange={handleInputChange}
              rows={3}
              placeholder="e.g., Gate code: 1234, Call when arriving, Leave with security guard, etc."
              className="w-full px-4 py-3 border border-light-borderHover dark:border-dark-borderHover rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Exact Location Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isExactLocation"
              checked={locationData.isExactLocation}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-light-borderHover dark:border-dark-borderHover rounded"
            />
            <label className="ml-2 text-sm text-light-textSecondary dark:text-dark-textSecondary">
              This is an exact location (not approximate)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="flex items-center px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <FaCrosshairs className="mr-2 h-4 w-4" />
              Use Current Location
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Set Delivery Location
            </button>
          </div>
        </form>
      </div>

      {/* Instructions */}
      <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt rounded-lg p-4">
        <h4 className="font-medium text-light-text dark:text-dark-text mb-3 flex items-center">
          <FaInfoCircle className="mr-2 text-blue-500" />
          How to provide accurate delivery location:
        </h4>
        <ul className="text-sm text-light-textSecondary dark:text-dark-textSecondary space-y-2">
          <li>• <strong>Street Address:</strong> Include house/building number and street name</li>
          <li>• <strong>Building Name:</strong> Add if your location is inside a specific building</li>
          <li>• <strong>Landmark:</strong> Mention nearby recognizable places (shops, banks, etc.)</li>
          <li>• <strong>Area:</strong> Specify the neighborhood or district</li>
          <li>• <strong>Additional Instructions:</strong> Include gate codes, security instructions, or special delivery notes</li>
          <li>• <strong>Current Location:</strong> Use the button to automatically detect your GPS location</li>
        </ul>
      </div>
    </div>
  );
};

export default DeliveryLocationForm; 