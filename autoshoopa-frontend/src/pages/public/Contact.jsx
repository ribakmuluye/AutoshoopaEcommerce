import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';
import { FiUser, FiMail, FiMessageSquare, FiAlignLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { validateName, validateEmail } from '../../utils/validation';
import { API_BASE_URL } from '../../config';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
  })
};

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    const nameVal = validateName(form.name);
    if (!nameVal.isValid) newErrors.name = nameVal.errors[0];
    const emailVal = validateEmail(form.email);
    if (!emailVal.isValid) newErrors.email = emailVal.errors[0];
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.message.trim() || form.message.length < 10) newErrors.message = 'Message must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact/send-email.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (data.status === 'success') {
        // Message saved (and possibly emailed via SMTP)
        const isSentByEmail = data.data?.mail_sent;
        toast.success(
          isSentByEmail
            ? '✅ Your message has been sent! We\'ll reply within 2 hours.'
            : '📥 Your message was received! We\'ll get back to you soon.',
          { autoClose: 5000 }
        );
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: <FaPhone className="w-4 h-4 text-brand-orange-600 dark:text-brand-orange-500" />,
      title: 'Phone Contact',
      details: ['+251 911 123 456', '+251 922 123 456'],
    },
    {
      icon: <FaEnvelope className="w-4 h-4 text-brand-orange-600 dark:text-brand-orange-500" />,
      title: 'Email Address',
      details: ['support@autoshoopa.com', 'rebekamuluye@gmail.com'],
    },
    {
      icon: <FaMapMarkerAlt className="w-4 h-4 text-brand-orange-600 dark:text-brand-orange-500" />,
      title: 'Office Address',
      details: ['Bole Road, Addis Ababa', 'Ethiopia'],
    },
    {
      icon: <FaClock className="w-4 h-4 text-brand-orange-600 dark:text-brand-orange-500" />,
      title: 'Working Hours',
      details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM'],
    }
  ];

  const inputClass = (field) =>
    `w-full pl-10 pr-4 py-3 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border rounded-xl text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none transition-all duration-200 ${
      errors[field] ? 'border-red-400 focus:border-red-500 bg-red-50/20' : 'border-light-border dark:border-dark-border focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/10'
    }`;

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Clean Light-Themed Header */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-orange-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-brand-orange-600 dark:text-brand-orange-500 uppercase tracking-widest bg-brand-orange-50 dark:bg-brand-orange-950/20 px-2.5 py-1 rounded-full border border-brand-orange-100 dark:border-brand-orange-500/20">Get in Touch</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-light-text dark:text-dark-text mt-2">
              Connect with Customer Care
            </h1>
            <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium max-w-lg leading-relaxed">
              Have an inquiry about an order status, spare parts verification, or seller account upgrade? Send us a message and we'll reply swiftly.
            </p>
          </div>

          <div className="bg-brand-orange-50 dark:bg-brand-orange-950/20 border border-brand-orange-100 dark:border-brand-orange-500/20 p-5 rounded-2xl max-w-xs w-full">
            <span className="text-[9px] font-bold text-brand-orange-600 dark:text-brand-orange-500 uppercase tracking-wider block">Average Response Time</span>
            <h4 className="text-lg font-extrabold text-light-text dark:text-dark-text mt-1">⚡ Under 2 Hours</h4>
            <p className="text-[10px] text-light-textMuted dark:text-dark-textMuted font-medium leading-normal mt-0.5">
              Available Monday through Saturday during core operational hours.
            </p>
          </div>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Side: Contact Cards + Map */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {contactInfo.map((info, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  custom={idx * 0.08}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex gap-4 p-4 bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-orange-50 dark:bg-brand-orange-950/20 flex items-center justify-center flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">{info.title}</h3>
                    {info.details.map((detail, dIdx) => (
                      <p key={dIdx} className="text-xs font-bold text-light-textSecondary dark:text-dark-textSecondary mt-1">{detail}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Rounded Map Frame */}
            <motion.div
              variants={fadeUp}
              custom={0.4}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden shadow-sm border border-light-border dark:border-dark-border"
            >
              <div className="px-5 py-3.5 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border-b border-light-border dark:border-dark-border flex items-center gap-2">
                <FaMapMarkerAlt className="text-brand-orange-500 dark:text-brand-orange-400 w-3.5 h-3.5" />
                <span className="text-light-text dark:text-dark-text text-xs font-bold uppercase tracking-wider">Office Map Coordinates</span>
              </div>
              <div className="h-44 bg-light-surfaceAlt dark:bg-dark-surfaceAlt">
                <iframe
                  title="AutoShoopa Office Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5205100125737!2d38.7579!3d9.0222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDEnMjAuMCJOIDM4wrA0NScyOC40IkU!5e0!3m2!1sen!2set!4v1620000000000!5m2!1sen!2set"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Message Input Form */}
          <motion.div
            variants={fadeUp}
            custom={0.1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-3 bg-white dark:bg-dark-surface rounded-3xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-light-border dark:border-dark-border">
              <h2 className="text-sm font-extrabold text-light-text dark:text-dark-text uppercase tracking-wider">Send us a Message</h2>
              <p className="text-[10px] text-light-textMuted dark:text-dark-textMuted font-semibold mt-0.5">Expect an answer within a business day</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Your Name</label>
                  <div className="relative flex items-center">
                    <FiUser className="absolute left-3.5 text-light-textMuted dark:text-dark-textMuted text-sm" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={inputClass('name')}
                      placeholder="Abebe Berhe"
                      required
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Email Address</label>
                  <div className="relative flex items-center">
                    <FiMail className="absolute left-3.5 text-light-textMuted dark:text-dark-textMuted text-sm" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass('email')}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-[10px] font-bold">{errors.email}</p>}
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Subject Inquiry</label>
                  <div className="relative flex items-center">
                    <FiMessageSquare className="absolute left-3.5 text-light-textMuted dark:text-dark-textMuted text-sm" />
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className={inputClass('subject')}
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  {errors.subject && <p className="text-red-500 text-[10px] font-bold">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Detailed Message</label>
                  <div className="relative flex items-start">
                    <FiAlignLeft className="absolute left-3.5 top-3.5 text-light-textMuted dark:text-dark-textMuted text-sm" />
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      className={`${inputClass('message')} resize-none pl-10`}
                      placeholder="Explain your inquiry in detail..."
                      required
                    />
                  </div>
                  {errors.message && <p className="text-red-500 text-[10px] font-bold">{errors.message}</p>}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-60 shadow-md shadow-brand-orange-500/10"
                    style={{
                      background: loading ? '#9ca3af' : 'linear-gradient(135deg, #f97316, #ea580c)'
                    }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        <span>Send Message</span>
                      </>
                    )}
                  </motion.button>
                </div>

              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;