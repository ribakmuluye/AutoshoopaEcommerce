// Validation utility functions

// Name validation
export const validateName = (name) => {
  const errors = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length < 5) {
    errors.push('Name must be at least 5 characters long');
  } else if (name.trim().length > 50) {
    errors.push('Name must be less than 50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    errors.push('Name can only contain letters and spaces');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
export const validateEmail = (email) => {
  const errors = [];
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    } else if (email.trim().length > 100) {
      errors.push('Email must be less than 100 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number validation (supports Ethiopian and international formats)
export const validatePhone = (phone) => {
  const errors = [];
  
  if (!phone || phone.trim().length === 0) {
    errors.push('Phone number is required');
  } else {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Ethiopian phone number patterns
    const ethiopianPatterns = [
      /^(\+251|251|0)?[79]\d{8}$/, // Mobile numbers starting with 7 or 9
      /^(\+251|251|0)?[1-6]\d{7}$/, // Landline numbers starting with 1-6
    ];
    
    // International patterns
    const internationalPatterns = [
      /^\+[1-9]\d{1,14}$/, // International format
      /^[1-9]\d{9,14}$/, // Numbers without country code
    ];
    
    const isValidEthiopian = ethiopianPatterns.some(pattern => pattern.test(cleanPhone));
    const isValidInternational = internationalPatterns.some(pattern => pattern.test(cleanPhone));
    
    if (!isValidEthiopian && !isValidInternational) {
      errors.push('Please enter a valid phone number');
    } else if (cleanPhone.length < 10) {
      errors.push('Phone number must be at least 10 digits');
    } else if (cleanPhone.length > 15) {
      errors.push('Phone number must be less than 15 digits');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length === 0) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  const errors = [];
  
  if (!confirmPassword || confirmPassword.length === 0) {
    errors.push('Please confirm your password');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Address validation
export const validateAddress = (address) => {
  const errors = [];
  
  if (!address || address.trim().length === 0) {
    errors.push('Address is required');
  } else if (address.trim().length < 10) {
    errors.push('Address must be at least 10 characters long');
  } else if (address.trim().length > 200) {
    errors.push('Address must be less than 200 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// City validation
export const validateCity = (city) => {
  const errors = [];
  
  if (!city || city.trim().length === 0) {
    errors.push('City is required');
  } else if (city.trim().length < 2) {
    errors.push('City must be at least 2 characters long');
  } else if (city.trim().length > 50) {
    errors.push('City must be less than 50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(city.trim())) {
    errors.push('City can only contain letters and spaces');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ZIP/Postal code validation
export const validateZipCode = (zipCode) => {
  const errors = [];
  
  if (!zipCode || zipCode.trim().length === 0) {
    errors.push('ZIP/Postal code is required');
  } else if (!/^\d{4,6}$/.test(zipCode.trim())) {
    errors.push('Please enter a valid ZIP/Postal code (4-6 digits)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Country validation
export const validateCountry = (country) => {
  const errors = [];
  
  if (!country || country.trim().length === 0) {
    errors.push('Country is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validationRules).forEach(field => {
    const value = formData[field];
    const rule = validationRules[field];
    
    let fieldErrors = [];
    
    if (rule.required && (!value || value.trim().length === 0)) {
      fieldErrors.push(`${rule.label || field} is required`);
    } else if (value && value.trim().length > 0) {
      switch (rule.type) {
        case 'name':
          const nameValidation = validateName(value);
          fieldErrors = [...fieldErrors, ...nameValidation.errors];
          break;
        case 'email':
          const emailValidation = validateEmail(value);
          fieldErrors = [...fieldErrors, ...emailValidation.errors];
          break;
        case 'phone':
          const phoneValidation = validatePhone(value);
          fieldErrors = [...fieldErrors, ...phoneValidation.errors];
          break;
        case 'password':
          const passwordValidation = validatePassword(value);
          fieldErrors = [...fieldErrors, ...passwordValidation.errors];
          break;
        case 'confirmPassword':
          const confirmPasswordValidation = validateConfirmPassword(formData.password, value);
          fieldErrors = [...fieldErrors, ...confirmPasswordValidation.errors];
          break;
        case 'address':
          const addressValidation = validateAddress(value);
          fieldErrors = [...fieldErrors, ...addressValidation.errors];
          break;
        case 'city':
          const cityValidation = validateCity(value);
          fieldErrors = [...fieldErrors, ...cityValidation.errors];
          break;
        case 'zipCode':
          const zipCodeValidation = validateZipCode(value);
          fieldErrors = [...fieldErrors, ...zipCodeValidation.errors];
          break;
        case 'country':
          const countryValidation = validateCountry(value);
          fieldErrors = [...fieldErrors, ...countryValidation.errors];
          break;
        default:
          break;
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  });
  
  return {
    isValid,
    errors
  };
};

// Real-time validation helper
export const validateField = (fieldName, value, validationType) => {
  switch (validationType) {
    case 'name':
      return validateName(value);
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    case 'password':
      return validatePassword(value);
    case 'address':
      return validateAddress(value);
    case 'city':
      return validateCity(value);
    case 'zipCode':
      return validateZipCode(value);
    case 'country':
      return validateCountry(value);
    default:
      return { isValid: true, errors: [] };
  }
}; 