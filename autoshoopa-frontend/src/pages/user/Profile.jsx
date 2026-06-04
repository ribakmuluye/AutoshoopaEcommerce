import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaPhone, FaEdit, FaMapMarkerAlt,
  FaHistory, FaShoppingBag, FaSave, FaTimes,
  FaShieldAlt, FaSignOutAlt, FaCheckCircle, FaBoxOpen,
  FaCamera, FaSpinner
} from 'react-icons/fa';
import { updateUser, logout } from '../../store/slices/authSlice';
import { validateName, validateEmail, validatePhone } from '../../utils/validation';
import { toast } from 'react-toastify';
import { API_BASE_URL, getImageUrl } from '../../config';

/* ─── Helper ─────────────────────────────────────────────────── */
const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const InputField = ({ icon: Icon, label, name, type = 'text', value, onChange, disabled, placeholder }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">{label}</label>
    <div className={`flex items-center bg-light-surfaceAlt dark:bg-dark-surfaceAlt border rounded-xl transition-all duration-200 ${disabled ? 'opacity-70' : 'focus-within:border-brand-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10'}`}>
      <Icon className="ml-4 text-light-textMuted dark:text-dark-textMuted text-sm" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-3.5 py-3 bg-transparent border-0 text-sm text-light-text dark:text-dark-text focus:outline-none focus:ring-0 placeholder-gray-400"
      />
    </div>
  </div>
);

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleCancel = () => {
    setForm({
      name: user?.name || user?.displayName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setEditing(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const nameV = validateName(form.name);
    if (!nameV.isValid) { toast.error(nameV.errors[0]); return; }
    const emailV = validateEmail(form.email);
    if (!emailV.isValid) { toast.error(emailV.errors[0]); return; }
    if (form.phone?.trim()) {
      const phoneV = validatePhone(form.phone);
      if (!phoneV.isValid) { toast.error(phoneV.errors[0]); return; }
    }
    
    try {
      setSaving(true);
      const userId = user?.id || user?._id;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }
      
      await dispatch(updateUser({ userId, userData: form })).unwrap();
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err || 'Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size and type
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, GIF, WEBP allowed');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await fetch(`${API_BASE_URL}/api/upload_avatar.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      // Update user with new avatar URL
      const userId = user?.id || user?._id;
      await dispatch(updateUser({ userId, userData: { ...form, image_url: data.url } })).unwrap();
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      console.error('Upload avatar error:', err);
      toast.error(err.message || 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const tabs = [
    { id: 'info', label: 'Personal Info', icon: FaUser },
    { id: 'activity', label: 'Quick Actions', icon: FaShoppingBag },
    { id: 'security', label: 'Security & Access', icon: FaShieldAlt },
  ];

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'Member';

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-dark-surface rounded-3xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden">
        
        {/* Profile Card Header */}
        <div className="relative pt-12 pb-8 px-6 text-center border-b border-light-border dark:border-dark-border bg-gradient-to-b from-gray-50/50 to-white">
          
          {/* Avatar Container */}
          <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white ring-4 ring-orange-500/20 bg-gradient-to-tr from-brand-orange-500 to-amber-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-md">
              {uploading ? (
                <FaSpinner className="w-8 h-8 animate-spin text-white" />
              ) : user?.image_url ? (
                <img
                  src={getImageUrl(user.image_url)}
                  alt={user?.name || 'Profile'}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                />
              ) : (
                getInitials(user?.name || user?.displayName)
              )}
            </div>

            {/* Hover overlay for changing profile picture */}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <FaCamera className="text-white text-xl" />
            </div>
            
            {/* Hidden Input file */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <h2 className="text-2xl font-extrabold text-light-text dark:text-dark-text">{user?.name || user?.displayName || 'Your Profile'}</h2>
          <p className="text-sm text-light-textMuted dark:text-dark-textMuted font-medium mt-1">{user?.email}</p>
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-brand-orange-50 dark:bg-brand-orange-950/20 text-brand-orange-600 dark:text-brand-orange-500 rounded-full text-xs font-bold mt-3.5 border border-brand-orange-100 dark:border-brand-orange-500/20">
            <FaCheckCircle className="w-3.5 h-3.5" />
            <span>{user?.role === 'seller' ? 'Seller Account' : 'Member'}</span>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-light-border dark:border-dark-border bg-light-surfaceAlt dark:bg-dark-surfaceAlt/30">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-brand-orange-500 text-brand-orange-600 dark:text-brand-orange-500 bg-white dark:bg-dark-surface'
                  : 'border-transparent text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary'
              }`}
            >
              <tab.icon className="text-sm" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            
            {/* Info Tab */}
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Stats indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3.5 p-4.5 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500 flex items-center justify-center text-sm font-bold">
                      <FaPhone />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-widest block">Phone Contact</span>
                      <span className="text-sm font-bold text-light-text dark:text-dark-text">{user?.phone || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-4.5 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500 flex items-center justify-center text-sm font-bold">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-widest block">Main Address</span>
                      <span className="text-sm font-bold text-light-text dark:text-dark-text line-clamp-1">{user?.address || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                {/* Info Fields Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <InputField
                    icon={FaUser}
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Your Full Name"
                  />
                  
                  <InputField
                    icon={FaEnvelope}
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="email@example.com"
                  />

                  <InputField
                    icon={FaPhone}
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="+251 900 000 000"
                  />

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Street Address</label>
                    <div className={`flex items-start bg-light-surfaceAlt dark:bg-dark-surfaceAlt border rounded-xl transition-all duration-200 ${!editing ? 'opacity-70' : 'focus-within:border-brand-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10'}`}>
                      <FaMapMarkerAlt className="ml-4 mt-4 text-light-textMuted dark:text-dark-textMuted text-sm" />
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="Your delivery address details..."
                        className="w-full px-3.5 py-3 bg-transparent border-0 text-sm text-light-text dark:text-dark-text focus:outline-none focus:ring-0 placeholder-gray-400 resize-none min-h-[80px]"
                      />
                    </div>
                  </div>

                  {/* Edit Controls */}
                  <div className="pt-2">
                    {!editing ? (
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="w-full py-3.5 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-amber-755 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-orange-500/10 flex items-center justify-center gap-2 text-sm"
                      >
                        <FaEdit /> Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex-1 py-3.5 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                        >
                          {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                          <span>Save Changes</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-6 py-3.5 border border-light-border dark:border-dark-border hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textSecondary dark:text-dark-textSecondary font-bold rounded-xl transition-all text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </motion.div>
            )}

            {/* Actions Tab */}
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {[
                  {
                    title: 'Order History',
                    desc: 'Check details and status of past purchases.',
                    icon: FaHistory,
                    onClick: () => navigate('/dashboard')
                  },
                  {
                    title: 'Browse Spares',
                    desc: 'Shop the latest genuine spare parts catalog.',
                    icon: FaShoppingBag,
                    onClick: () => navigate('/shop')
                  },
                  {
                    title: 'Update Address',
                    desc: 'Edit default shipping location rules.',
                    icon: FaMapMarkerAlt,
                    onClick: () => { setActiveTab('info'); setEditing(true); }
                  },
                  {
                    title: 'Track Shipments',
                    desc: 'View status tracking on pending items.',
                    icon: FaBoxOpen,
                    onClick: () => navigate('/dashboard')
                  }
                ].map((action, idx) => (
                  <div
                    key={idx}
                    onClick={action.onClick}
                    className="flex gap-4 p-5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl hover:border-brand-orange-200 dark:border-brand-orange-500/30 hover:shadow-md cursor-pointer transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-orange-50 dark:bg-brand-orange-950/20 text-brand-orange-600 dark:text-brand-orange-500 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-brand-orange-500 group-hover:text-white transition-all">
                      <action.icon />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-light-text dark:text-dark-text text-sm">{action.title}</h4>
                      <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium mt-1 leading-relaxed">{action.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between p-5 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-brand-orange-500 dark:text-brand-orange-400 text-lg" />
                    <div>
                      <div className="text-sm font-bold text-light-text dark:text-dark-text">Email Verification</div>
                      <div className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium mt-0.5">{user?.email}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">Verified</span>
                </div>

                <div className="flex items-center justify-between p-5 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-brand-orange-500 dark:text-brand-orange-400 text-lg" />
                    <div>
                      <div className="text-sm font-bold text-light-text dark:text-dark-text">Account Safety</div>
                      <div className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium mt-0.5">Secure session check</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">Optimal</span>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-50 hover:bg-red-100/70 border border-red-100 text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <FaSignOutAlt />
                    <span>Sign Out Account</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;