const mongoose = require('mongoose')

const AdminNotificationSchema = new mongoose.Schema({
  universityRef: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookItemRef: { type: mongoose.Schema.Types.ObjectId, ref: 'BookItem', required: true },
  type: { type: String, enum: ['borrow', 'return'], required: true },
  message: { type: String, required: true },
  unread: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('AdminNotification', AdminNotificationSchema)
