const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date
  },
  totalHours: {
    type: Number
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'leave'],
    default: 'present'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
AttendanceSchema.index({ location: '2dsphere' });

// Method to calculate total hours when checking out
AttendanceSchema.methods.calculateHours = function() {
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime - this.checkInTime;
    this.totalHours = diffMs / (1000 * 60 * 60); // Convert ms to hours
  }
};

module.exports = mongoose.model('Attendance', AttendanceSchema);
